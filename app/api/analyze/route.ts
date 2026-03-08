import { NextRequest, NextResponse } from 'next/server';
import type { AnalyzeRequest, AnalyzeResponse, Gap } from '@/lib/types';
import {
  createGuestSession,
  updateSessionStatus,
  updateSessionReport,
  createAnalyticsEvent,
  createGap,
  saveSessionFiles,
} from '@/lib/dynamodb';
import {
  fetchRepoFiles,
  detectLanguages,
  analyzeWithBedrock,
} from '@/lib/bedrock';
import { countLinesOfCode } from '@/lib/loc';
import { parseDependencies } from '@/lib/dependencies';

const GITHUB_URL_RE = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Partial<AnalyzeRequest>;

    // ── Validate ──
    if (!body.repo_url || typeof body.repo_url !== 'string') {
      return NextResponse.json(
        { error: 'repo_url is required and must be a string' },
        { status: 400 },
      );
    }

    const trimmedUrl = body.repo_url.trim();
    const match = GITHUB_URL_RE.exec(trimmedUrl);
    if (!match) {
      return NextResponse.json(
        { error: 'repo_url must be a valid GitHub repository URL (https://github.com/owner/repo)' },
        { status: 400 },
      );
    }

    const owner = match[1] as string;
    const repo = match[2] as string;

    // ── Step 1: Create session in DynamoDB (status: ingesting) ──
    const session = await createGuestSession(trimmedUrl, repo);

    // Fire analytics (non-blocking)
    createAnalyticsEvent({
      event_type: 'repo_submitted',
      user_id: 'guest',
      session_id: session.session_id,
      metadata: { repo_name: repo },
    }).catch((err) => console.warn('[Analytics] Event failed:', err));

    // ── Step 2: Fetch repo files from GitHub API ──
    await updateSessionStatus(session.session_id, 'indexing');

    let files: { path: string; content: string }[];
    try {
      files = await fetchRepoFiles(owner, repo, '', 30);
    } catch (err) {
      await updateSessionStatus(session.session_id, 'failed');
      console.error('[Analyze] GitHub fetch failed:', err);
      return NextResponse.json(
        { error: 'Failed to fetch repository from GitHub. Is it public?' },
        { status: 400 },
      );
    }

    if (files.length === 0) {
      await updateSessionStatus(session.session_id, 'failed');
      return NextResponse.json(
        { error: 'No code files found in this repository.' },
        { status: 400 },
      );
    }

    const languages = detectLanguages(files);

    // ── Step 2b: Compute LOC & parse dependencies (no AI needed) ──
    const linesOfCode = countLinesOfCode(files);
    const dependencies = parseDependencies(files);

    // ── Step 3: Analyze with Bedrock Claude ──
    await updateSessionStatus(session.session_id, 'analyzing');

    try {
      const report = await analyzeWithBedrock(files, repo);

      // Attach server-computed data to report
      report.lines_of_code = linesOfCode;
      report.dependencies = dependencies;

      // ── Step 4: Save report to DynamoDB ──
      await updateSessionReport(session.session_id, report);

      // ── Step 4b: Save file contents for interactive code viewer ──
      saveSessionFiles(session.session_id, files).catch((err) =>
        console.warn('[Analyze] Failed to save files_data:', err),
      );

      // Update file count and languages
      const { docClient } = await import('@/lib/dynamodb');
      const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
      await docClient.send(
        new UpdateCommand({
          TableName: 'RepoIQ_Sessions',
          Key: { session_id: session.session_id },
          UpdateExpression: 'SET file_count = :fc, languages = :langs',
          ExpressionAttributeValues: {
            ':fc': files.length,
            ':langs': languages,
          },
        }),
      );

      // ── Step 5: Create Gap records for each concept ──
      const gapPromises = report.top_5_concepts.map((concept, index) => {
        const gap: Gap = {
          gap_id: crypto.randomUUID(),
          session_id: session.session_id,
          user_id: 'guest',
          concept_name: concept.concept,
          concept_file: concept.file,
          concept_lines: concept.lines,
          order_index: index,
          understood: false,
          score: null,
          attempts: 0,
          started_at: null,
          completed_at: null,
        };
        return createGap(gap);
      });
      await Promise.all(gapPromises);

      const response: AnalyzeResponse = {
        session_id: session.session_id,
        status: 'complete',
        estimated_seconds: 0,
      };

      return NextResponse.json(response, { status: 201 });
    } catch (err) {
      await updateSessionStatus(session.session_id, 'failed');
      console.error('[Analyze] Bedrock analysis failed:', err);
      return NextResponse.json(
        { error: 'AI analysis failed. Please try again.' },
        { status: 500 },
      );
    }
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    console.error('[POST /api/analyze] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
