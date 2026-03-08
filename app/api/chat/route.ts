import { NextRequest, NextResponse } from 'next/server';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import type { ChatRequest, ChatResponse } from '@/lib/types';
import {
  getSessionById,
  getMessagesBySessionId,
  createMessage,
} from '@/lib/dynamodb';
import { getUserMemory, saveUserMemory } from '@/lib/memory';
import { generateMemoryUpdate } from '@/lib/bedrock';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-pro-v1:0';
const FALLBACK_MODEL_ID = process.env.BEDROCK_FALLBACK_MODEL_ID || 'amazon.nova-lite-v1:0';
const FALLBACK_MODEL_ID_2 = process.env.BEDROCK_FALLBACK_MODEL_ID_2 || 'amazon.nova-micro-v1:0';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Partial<ChatRequest>;

    // ── Validate ──
    if (!body.session_id || typeof body.session_id !== 'string') {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }
    if (!body.concept_id || typeof body.concept_id !== 'string') {
      return NextResponse.json({ error: 'concept_id is required' }, { status: 400 });
    }
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // ── Get session + report for context ──
    const session = await getSessionById(body.session_id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (!session.report) {
      return NextResponse.json({ error: 'Session has no report' }, { status: 400 });
    }

    // Find the concept being discussed
    const concept = session.report.top_5_concepts.find(
      (c) => c.concept === body.concept_id || c.file === body.concept_id,
    );

    // Get chat history for context
    const history = await getMessagesBySessionId(body.session_id);
    const relevantHistory = history
      .filter((m) => m.concept_id === body.concept_id)
      .slice(-10); // Last 10 messages for context

    // ── Save user message ──
    await createMessage({
      message_id: crypto.randomUUID(),
      session_id: body.session_id,
      user_id: 'guest',
      concept_id: body.concept_id,
      role: 'user',
      content: body.message,
      code_reference: null,
      is_hint: body.is_hint ?? false,
      created_at: new Date().toISOString(),
    });

    // ── Get user memory for personalization ──
    const guestId = request.headers.get('x-guest-id') ?? 'guest';
    const userMemory = await getUserMemory(guestId);

    // ── Build Bedrock prompt ──
    const memorySection = userMemory
      ? `\nStudent Learning Profile:\n${userMemory}\nUse this profile to personalize your teaching style and skip topics they already know.\n`
      : '';

    const systemPrompt = `You are a Socratic coding teacher for RepoIQ. The student vibe-coded a project called "${session.repo_name}" and is now learning concepts they don't understand.
${memorySection}
Current concept: ${concept?.concept ?? body.concept_id}
File: ${concept?.file ?? 'unknown'}
Why critical: ${concept?.why_critical ?? 'Important for understanding the codebase'}

Rules:
- NEVER give direct answers. Use Socratic questioning.
- Ask follow-up questions that lead the student to understanding.
- Reference specific code from their repo when possible.
- If they seem to understand, say "CONCEPT_UNDERSTOOD" at the end.
- Keep responses concise (2-4 sentences max).
- If is_hint is true, give a gentle nudge toward the answer without revealing it.`;

    const messages = [
      ...relevantHistory.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      {
        role: 'user' as const,
        content: body.is_hint
          ? `[HINT REQUEST] ${body.message}`
          : body.message,
      },
    ];

    // Build Amazon Nova request body
    const novaMessages = messages.map((m) => ({
      role: m.role,
      content: [{ text: m.content }],
    }));

    const bedrockBody = JSON.stringify({
      messages: novaMessages,
      system: [{ text: systemPrompt }],
      inferenceConfig: {
        maxTokens: 1024,
        temperature: 0.5,
      },
    });

    // Try primary model, fallback if needed
    let aiText = '';
    const modelsToTry = [MODEL_ID, FALLBACK_MODEL_ID, FALLBACK_MODEL_ID_2];
    let lastError: unknown;

    for (const modelId of modelsToTry) {
      try {
        console.log(`[Chat] Invoking model: ${modelId}`);
        const command = new InvokeModelCommand({
          modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: new TextEncoder().encode(bedrockBody),
        });

        const bedrockResponse = await bedrockClient.send(command);
        const responseBody = JSON.parse(
          new TextDecoder().decode(bedrockResponse.body),
        ) as { output?: { message?: { content?: { text: string }[] } } };
        const responseText = responseBody?.output?.message?.content?.[0]?.text;
        if (!responseText) throw new Error('Empty response from model');
        aiText = responseText;
        console.log(`[Chat] Success with model: ${modelId}`);
        break;
      } catch (err) {
        lastError = err;
        console.error(`[Chat] Model ${modelId} failed:`, err);
      }
    }

    if (!aiText) {
      throw lastError ?? new Error('All Bedrock models failed');
    }

    const conceptUnderstood = aiText.includes('CONCEPT_UNDERSTOOD');
    const cleanedResponse = aiText.replace('CONCEPT_UNDERSTOOD', '').trim();

    // ── Save assistant message ──
    await createMessage({
      message_id: crypto.randomUUID(),
      session_id: body.session_id,
      user_id: 'guest',
      concept_id: body.concept_id,
      role: 'assistant',
      content: cleanedResponse,
      code_reference: concept
        ? { file: concept.file, lines: concept.lines }
        : null,
      is_hint: false,
      created_at: new Date().toISOString(),
    });

    // ── Update user memory (non-blocking) ──
    generateMemoryUpdate(userMemory, {
      userMessage: body.message,
      aiResponse: cleanedResponse,
      context: `Concept: ${concept?.concept ?? body.concept_id}`,
    })
      .then((updatedMemory) => saveUserMemory(guestId, updatedMemory))
      .catch((err) => console.warn('[Chat] Memory update failed:', err));

    const response: ChatResponse = {
      response: cleanedResponse,
      code_reference: concept
        ? { file: concept.file, lines: concept.lines }
        : undefined,
      concept_understood: conceptUnderstood,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    console.error('[POST /api/chat] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
