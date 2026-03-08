import { NextRequest, NextResponse } from 'next/server';
import type { AnalyzeRequest, AnalyzeResponse, Gap, ErrorCode } from '@/lib/types';
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
  fetchRepoOverview,
  detectLanguages,
  analyzeWithBedrock,
} from '@/lib/bedrock';
import { countLinesOfCode } from '@/lib/loc';
import { parseDependencies } from '@/lib/dependencies';
import { enhanceRuntimeRequirements } from '@/lib/ram-estimator';
import { callOpenRouter, parseJsonResponse } from '@/lib/openrouter';
import type { Bug, FileImportance } from '@/lib/types';

const GITHUB_URL_RE = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/;

/** Estimate analysis time based on file count */
function estimateSeconds(fileCount: number): number {
  if (fileCount <= 10) return 15;
  if (fileCount <= 25) return 30;
  if (fileCount <= 50) return 50;
  return 70;
}

/** Classify GitHub fetch errors into user-friendly error codes */
function classifyGitHubError(err: unknown): { code: ErrorCode; message: string } {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (lower.includes('404') || lower.includes('not found')) {
    return {
      code: 'REPO_NOT_FOUND',
      message: 'Repository not found. Check the URL and make sure it exists.',
    };
  }
  if (lower.includes('403') || lower.includes('private') || lower.includes('forbidden')) {
    return {
      code: 'PRIVATE_REPO',
      message: 'This repository is private or access is restricted. RepoIQ can only analyze public repositories.',
    };
  }
  if (lower.includes('401') || lower.includes('unauthorized')) {
    return {
      code: 'PRIVATE_REPO',
      message: 'Authentication required. This is likely a private repository.',
    };
  }
  if (lower.includes('rate limit') || lower.includes('429')) {
    return {
      code: 'RATE_LIMITED',
      message: 'GitHub API rate limit reached. Please wait a few minutes and try again.',
    };
  }
  if (lower.includes('timeout') || lower.includes('econnrefused') || lower.includes('fetch failed')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Could not connect to GitHub. Please check your connection and try again.',
    };
  }
  return {
    code: 'UNKNOWN',
    message: 'Failed to fetch repository from GitHub. Please verify the URL is correct and the repo is public.',
  };
}

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
    const skillLevel = body.skill_level ?? 'beginner';

    // ── Step 1: Create session in DynamoDB (status: ingesting) ──
    const session = await createGuestSession(trimmedUrl, repo);

    // Save skill level to user memory (non-blocking)
    import('@/lib/memory').then(({ saveUserMemory }) => {
      const guestId = request.headers.get('x-guest-id') ?? 'guest';
      saveUserMemory(guestId, `# Student Profile\n- Skill Level: ${skillLevel}\n- Last analyzed: ${repo}\n`);
    }).catch(() => {});

    // Fire analytics (non-blocking)
    createAnalyticsEvent({
      event_type: 'repo_submitted',
      user_id: 'guest',
      session_id: session.session_id,
      metadata: { repo_name: repo },
    }).catch((err) => console.warn('[Analytics] Event failed:', err));

    // ── Step 2: Fetch repo files from GitHub API ──
    await updateSessionStatus(session.session_id, 'ingesting', {
      detail: `Connecting to GitHub for ${owner}/${repo}...`,
    });

    let files: { path: string; content: string }[];
    let fetchStats: import('@/lib/bedrock').FetchRepoResult['stats'] | undefined;
    let readmeContent = '';
    let repoDescription = '';
    try {
      const [result, overview] = await Promise.all([
        fetchRepoFiles(owner, repo),
        fetchRepoOverview(owner, repo),
      ]);
      files = result.files;
      fetchStats = result.stats;
      readmeContent = overview.readme_content;
      repoDescription = overview.repo_description;
    } catch (err) {
      const classified = classifyGitHubError(err);
      await updateSessionStatus(session.session_id, 'failed', {
        error_code: classified.code,
        error_message: classified.message,
        detail: classified.message,
      });
      console.error('[Analyze] GitHub fetch failed:', err);
      return NextResponse.json(
        { error: classified.message, error_code: classified.code, session_id: session.session_id },
        { status: 400 },
      );
    }

    if (files.length === 0) {
      await updateSessionStatus(session.session_id, 'failed', {
        error_code: 'EMPTY_REPO',
        error_message: 'No supported code files found in this repository. It may be empty or contain only unsupported file types.',
        detail: 'No code files found',
      });
      return NextResponse.json(
        { error: 'No code files found in this repository.', error_code: 'EMPTY_REPO', session_id: session.session_id },
        { status: 400 },
      );
    }

    const languages = detectLanguages(files);
    const eta = estimateSeconds(files.length);

    // ── Step 2b: Indexing ──
    await updateSessionStatus(session.session_id, 'indexing', {
      detail: `Found ${files.length} files across ${languages.length} language${languages.length === 1 ? '' : 's'}. Indexing...`,
      estimated_seconds: eta,
      file_count: files.length,
    });

    // ── Step 2c: Compute LOC & parse dependencies (no AI needed) ──
    const linesOfCode = countLinesOfCode(files);
    const dependencies = parseDependencies(files);

    // ── Step 3: Analyze with Bedrock ──
    await updateSessionStatus(session.session_id, 'analyzing', {
      detail: `Analyzing ${linesOfCode.code_lines.toLocaleString()} lines of code with AI...`,
    });

    try {
      // ── Agent Swarm: Run Bedrock + OpenRouter in parallel ──
      // Bedrock: full analysis on priority files
      // OpenRouter: analyze skipped files for extra file_importance + bugs
      const openRouterPromise = analyzeSkippedFilesWithOpenRouter(files, repo);
      const report = await analyzeWithBedrock(files, repo);

      // Merge OpenRouter results (non-blocking — don't fail if it errors)
      try {
        const extraInsights = await openRouterPromise;
        if (extraInsights) {
          // Merge extra bugs (deduplicate by file+line)
          if (extraInsights.extra_bugs?.length) {
            const existingKeys = new Set(report.bugs_found.map((b) => `${b.file}:${b.line}`));
            for (const bug of extraInsights.extra_bugs) {
              const key = `${bug.file}:${bug.line}`;
              if (!existingKeys.has(key)) {
                report.bugs_found.push(bug);
              }
            }
          }
          // Merge extra file_importance
          if (extraInsights.extra_file_importance?.length && report.file_importance) {
            const existingPaths = new Set(report.file_importance.map((f) => f.path));
            for (const fi of extraInsights.extra_file_importance) {
              if (!existingPaths.has(fi.path)) {
                report.file_importance.push(fi);
              }
            }
          }
          console.log(`[Swarm] Merged ${extraInsights.extra_bugs?.length ?? 0} extra bugs, ${extraInsights.extra_file_importance?.length ?? 0} file ratings from OpenRouter`);
        }
      } catch (err) {
        console.warn('[Swarm] OpenRouter merge failed (non-critical):', err);
      }

      // Attach server-computed data to report
      report.lines_of_code = linesOfCode;
      report.dependencies = dependencies;

      // Override AI RAM estimate with data-driven computation
      report.runtime_requirements = enhanceRuntimeRequirements(
        report.runtime_requirements,
        {
          stackInfo: report.stack_info,
          dependencies,
          linesOfCode,
          languages,
        },
      );

      // ── Step 4: Save report to DynamoDB ──
      await updateSessionReport(session.session_id, report);

      // ── Step 4b: Save file contents for interactive code viewer ──
      saveSessionFiles(session.session_id, files).catch((err) =>
        console.warn('[Analyze] Failed to save files_data:', err),
      );

      // Update file count, languages, and fetch stats
      const { docClient } = await import('@/lib/dynamodb');
      const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
      await docClient.send(
        new UpdateCommand({
          TableName: 'RepoIQ_Sessions',
          Key: { session_id: session.session_id },
          UpdateExpression: 'SET file_count = :fc, languages = :langs, fetch_stats = :fs, status_detail = :detail, readme_content = :readme, repo_description = :desc',
          ExpressionAttributeValues: {
            ':fc': files.length,
            ':langs': languages,
            ':fs': fetchStats ?? null,
            ':detail': 'Analysis complete!',
            ':readme': readmeContent || null,
            ':desc': repoDescription || null,
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
        estimated_seconds: eta,
      };

      return NextResponse.json(response, { status: 201 });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'AI analysis failed';
      await updateSessionStatus(session.session_id, 'failed', {
        error_code: 'AI_FAILED',
        error_message: 'AI analysis encountered an error. This could be due to the repository being too large or complex. Please try again.',
        detail: errMsg,
      });
      console.error('[Analyze] Bedrock analysis failed:', err);
      return NextResponse.json(
        { error: 'AI analysis failed. Please try again.', error_code: 'AI_FAILED', session_id: session.session_id },
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

// ──────────────────────────────────────────────────────────────
// Agent Swarm: OpenRouter analyzes skipped files in parallel
// ──────────────────────────────────────────────────────────────

interface SwarmResult {
  extra_bugs: Bug[];
  extra_file_importance: FileImportance[];
}

async function analyzeSkippedFilesWithOpenRouter(
  files: { path: string; content: string }[],
  repoName: string,
): Promise<SwarmResult | null> {
  // Only run if we have enough files to warrant it
  if (files.length < 20) return null;

  // Pick files that Bedrock likely skipped (lower priority, later in the list)
  // Sample up to 30 files from the tail end
  const tailFiles = files.slice(-Math.min(30, Math.floor(files.length / 2)));
  const fileSummaries = tailFiles
    .map((f) => {
      const snippet = f.content.slice(0, 1500);
      return `=== ${f.path} ===\n${snippet}`;
    })
    .join('\n\n');

  const prompt = `You are a code analyst assistant. Analyze these files from "${repoName}" and find bugs and rate file importance.

${fileSummaries}

Respond with ONLY valid JSON (no markdown, no backticks):
{
  "extra_bugs": [
    {
      "file": "exact/path.ext",
      "line": 10,
      "issue": "Description of bug or code smell",
      "severity": "critical|high|medium|low"
    }
  ],
  "extra_file_importance": [
    {
      "path": "exact/path.ext",
      "score": 5,
      "reason": "Why this file matters",
      "category": "critical|important|normal"
    }
  ]
}

Rules:
- Find 0-5 real bugs or code smells
- Rate ALL ${tailFiles.length} files for importance (score 1-10)
- category: 8-10="critical", 5-7="important", 1-4="normal"
- Use exact file paths from above`;

  try {
    console.log(`[Swarm] OpenRouter analyzing ${tailFiles.length} supplementary files`);
    const text = await callOpenRouter(prompt, { maxTokens: 4096, temperature: 0.3 });
    return parseJsonResponse<SwarmResult>(text);
  } catch (err) {
    console.warn('[Swarm] OpenRouter analysis failed:', err);
    return null;
  }
}
