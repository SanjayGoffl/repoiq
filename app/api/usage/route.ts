import { NextRequest, NextResponse } from 'next/server';
import { getSessionFiles } from '@/lib/dynamodb';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { session_id, symbol } = (await request.json()) as {
      session_id?: string;
      symbol?: string;
    };

    if (!session_id || !symbol) {
      return NextResponse.json(
        { error: 'session_id and symbol are required' },
        { status: 400 },
      );
    }

    const files = await getSessionFiles(session_id);
    if (files.length === 0) {
      return NextResponse.json({ usages: [] });
    }

    // Search all files for the symbol
    const usages: { file: string; line: number; code: string }[] = [];

    for (const file of files) {
      const lines = file.content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i]?.includes(symbol)) {
          usages.push({
            file: file.path,
            line: i + 1,
            code: (lines[i] ?? '').trim(),
          });
        }
      }
    }

    return NextResponse.json({ usages, total: usages.length });
  } catch (error) {
    console.error('[POST /api/usage] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
