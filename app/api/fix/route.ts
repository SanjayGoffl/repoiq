import { NextRequest, NextResponse } from 'next/server';
import { getSessionFiles } from '@/lib/dynamodb';
import { raceBedrockAndOpenRouter, parseJsonResponse } from '@/lib/openrouter';
import type { FixRequest, FixSuggestion } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Partial<FixRequest>;

    if (!body.session_id || !body.file_path || !body.issue) {
      return NextResponse.json(
        { error: 'session_id, file_path, and issue are required' },
        { status: 400 },
      );
    }

    const files = await getSessionFiles(body.session_id);
    const file = files.find((f) => f.path === body.file_path);
    const fileContent = file?.content ?? 'File content not available';

    const prompt = `You are a code fix assistant. A bug was found in a repository.

File: ${body.file_path}
Line: ${body.line ?? 'unknown'}
Bug: ${body.issue}
Severity: ${body.severity ?? 'medium'}

Here is the file content:
${fileContent}

Provide a minimal fix. Respond with ONLY valid JSON (no markdown, no backticks):
{
  "before": "the 3-5 lines of original buggy code (exact copy from the file)",
  "after": "the 3-5 lines of fixed code",
  "explanation": "1-2 sentence explanation of what was wrong and how the fix addresses it"
}`;

    try {
      const text = await raceBedrockAndOpenRouter(prompt, { maxTokens: 1024, temperature: 0.2 });
      const fix = parseJsonResponse<FixSuggestion>(text);
      return NextResponse.json(fix);
    } catch (err) {
      console.error('[Fix] All models failed:', err);
      return NextResponse.json({ error: 'Failed to generate fix suggestion' }, { status: 500 });
    }
  } catch (error) {
    console.error('[POST /api/fix] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
