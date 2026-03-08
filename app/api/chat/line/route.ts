import { NextRequest, NextResponse } from 'next/server';
import type { LineChatRequest } from '@/lib/types';
import { getSessionById, getSessionFiles, createMessage } from '@/lib/dynamodb';
import { explainLine } from '@/lib/bedrock';
import { getUserMemory } from '@/lib/memory';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Partial<LineChatRequest>;

    if (!body.session_id || !body.file_path || body.line_number == null || !body.code_line) {
      return NextResponse.json(
        { error: 'session_id, file_path, line_number, and code_line are required' },
        { status: 400 },
      );
    }

    const session = await getSessionById(body.session_id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get file content from stored files
    const files = await getSessionFiles(body.session_id);
    const targetFile = files.find((f) => f.path === body.file_path);

    if (!targetFile) {
      return NextResponse.json({ error: 'File not found in session' }, { status: 404 });
    }

    // Get user memory for personalization
    const guestId = request.headers.get('x-guest-id') ?? 'guest';
    const userMemory = await getUserMemory(guestId);

    // Build conversation history for follow-ups
    const conversationHistory: { role: string; content: string }[] = [];
    if (body.question) {
      conversationHistory.push({ role: 'user', content: body.question });
    }

    const result = await explainLine(
      targetFile.content,
      body.file_path,
      body.line_number,
      body.code_line,
      session.repo_name,
      conversationHistory,
      userMemory || undefined,
    );

    // Save the interaction as messages
    const contextId = `${body.file_path}:${body.line_number}`;
    await createMessage({
      message_id: crypto.randomUUID(),
      session_id: body.session_id,
      user_id: guestId,
      concept_id: contextId,
      role: 'user',
      content: body.question ?? `Explain line ${body.line_number}: ${body.code_line}`,
      code_reference: { file: body.file_path, lines: [body.line_number] },
      is_hint: false,
      created_at: new Date().toISOString(),
    });

    await createMessage({
      message_id: crypto.randomUUID(),
      session_id: body.session_id,
      user_id: guestId,
      concept_id: contextId,
      role: 'assistant',
      content: result.explanation,
      code_reference: { file: body.file_path, lines: [body.line_number] },
      is_hint: false,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    console.error('[POST /api/chat/line] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
