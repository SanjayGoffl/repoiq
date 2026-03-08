import { NextRequest, NextResponse } from 'next/server';
import { getSessionById, getGapsBySessionId, createGap } from '@/lib/dynamodb';
import type { Gap } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 },
      );
    }

    const session = await getSessionById(id);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 },
      );
    }

    // Fetch existing gaps from DynamoDB
    let gaps = await getGapsBySessionId(id);

    // If no gaps exist but the session has a report, auto-create them
    if (gaps.length === 0 && session.report && session.status === 'complete') {
      const newGaps: Gap[] = session.report.top_5_concepts.map(
        (concept, index) => ({
          gap_id: crypto.randomUUID(),
          session_id: id,
          user_id: session.user_id,
          concept_name: concept.concept,
          concept_file: concept.file,
          concept_lines: concept.lines,
          order_index: index,
          understood: false,
          score: null,
          attempts: 0,
          started_at: null,
          completed_at: null,
        }),
      );

      // Save all gaps to DynamoDB
      await Promise.all(newGaps.map((gap) => createGap(gap)));
      gaps = newGaps;
    }

    return NextResponse.json(gaps);
  } catch (error: unknown) {
    console.error('[GET /api/session/:id/gaps] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
