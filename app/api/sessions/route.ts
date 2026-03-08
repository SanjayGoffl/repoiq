import { NextRequest, NextResponse } from 'next/server';
import { getSessionsByUserId, getGuestSessions } from '@/lib/dynamodb';
import type { Session } from '@/lib/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Guest-mode: all sessions belong to user_id='guest'
    // Auth header is accepted but not verified (guest fallback)
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : 'guest';

    const sessions = userId !== 'guest'
      ? await getSessionsByUserId(userId)
      : await getGuestSessions();

    return NextResponse.json(sessions);
  } catch (error: unknown) {
    console.error('[GET /api/sessions] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
