import { NextRequest, NextResponse } from 'next/server';
import { getSessionFiles } from '@/lib/dynamodb';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const files = await getSessionFiles(sessionId);

    return NextResponse.json({ files });
  } catch (error) {
    console.error('[GET /api/session/[id]/files] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
