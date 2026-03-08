import { NextRequest, NextResponse } from 'next/server';
import { getSessionById } from '@/lib/dynamodb';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = await getSessionById(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.report) {
      return NextResponse.json({ error: 'No report available' }, { status: 400 });
    }

    const lessons = session.report.lessons ?? [];

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('[GET /api/session/[id]/lessons] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
