import { NextRequest, NextResponse } from 'next/server';
import { getSessionsByUserId, getGuestSessions } from '@/lib/dynamodb';
import type { Session } from '@/lib/types';

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // TODO: Implement authenticated flow:
    // 1. Verify Cognito JWT from Authorization header to get user_id
    // 2. Call getSessionsByUserId(user_id) to fetch their sessions

    // For now: Fetch guest sessions (user_id = 'guest')
    const sessions = await getGuestSessions();

    return NextResponse.json(sessions);
  } catch (error: unknown) {
    console.error('[GET /api/sessions] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
