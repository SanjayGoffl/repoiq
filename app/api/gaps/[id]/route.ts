import { NextRequest, NextResponse } from 'next/server';
import { updateGapProgress } from '@/lib/dynamodb';

type RouteContext = { params: Promise<{ id: string }> };

interface PatchBody {
  understood: boolean;
  score?: number;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Gap ID is required' },
        { status: 400 },
      );
    }

    const body = (await request.json()) as Partial<PatchBody>;

    if (typeof body.understood !== 'boolean') {
      return NextResponse.json(
        { error: 'understood is required and must be a boolean' },
        { status: 400 },
      );
    }

    await updateGapProgress(id, body.understood, body.score);

    return NextResponse.json({ success: true, gap_id: id, understood: body.understood });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    console.error('[PATCH /api/gaps/:id] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
