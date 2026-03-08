import { NextRequest, NextResponse } from 'next/server';
import { getSessionById, createAnalyticsEvent } from '@/lib/dynamodb';
import type { Session } from '@/lib/types';

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

    // Fetch from DynamoDB (guest-mode: no auth verification needed)
    const session = await getSessionById(id);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 },
      );
    }

    // Track analytics event
    await createAnalyticsEvent({
      event_type: 'report_viewed',
      user_id: session.user_id,
      session_id: session.session_id,
      metadata: {
        repo_name: session.repo_name,
      },
    }).catch((err) => {
      console.warn('[API] Failed to log analytics event:', err);
    });

    return NextResponse.json(session);
  } catch (error: unknown) {
    console.error('[GET /api/session/:id] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
