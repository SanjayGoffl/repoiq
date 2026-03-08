import { NextResponse } from 'next/server';
import type { QuotaResponse } from '@/lib/types';
import { getGuestSessions } from '@/lib/dynamodb';

export async function GET(): Promise<NextResponse> {
  try {
    // Count guest sessions to calculate quota used
    const sessions = await getGuestSessions();
    const quotaUsed = sessions.length;
    const quotaLimit = parseInt(process.env.NEXT_PUBLIC_FREE_QUOTA || '3', 10);

    const response: QuotaResponse = {
      quota_used: quotaUsed,
      quota_limit: quotaLimit,
      plan: 'free',
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('[GET /api/user] Unhandled error:', error);
    // Return default quota on error so the UI doesn't break
    const fallback: QuotaResponse = {
      quota_used: 0,
      quota_limit: 3,
      plan: 'free',
    };
    return NextResponse.json(fallback);
  }
}
