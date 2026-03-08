import { NextRequest, NextResponse } from 'next/server';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { getSessionFiles } from '@/lib/dynamodb';
import type { FixRequest, FixSuggestion } from '@/lib/types';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-pro-v1:0';
const FALLBACK_MODEL_ID = process.env.BEDROCK_FALLBACK_MODEL_ID || 'amazon.nova-lite-v1:0';
const FALLBACK_MODEL_ID_2 = process.env.BEDROCK_FALLBACK_MODEL_ID_2 || 'amazon.nova-micro-v1:0';

function buildNovaBody(
  messages: { role: string; content: string }[],
  options: { maxTokens?: number; temperature?: number; systemPrompt?: string } = {},
): string {
  const novaMessages = messages.map((m) => ({
    role: m.role,
    content: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = {
    messages: novaMessages,
    inferenceConfig: {
      maxTokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.3,
    },
  };

  if (options.systemPrompt) {
    body.system = [{ text: options.systemPrompt }];
  }

  return JSON.stringify(body);
}

function parseNovaResponse(responseBytes: Uint8Array): string {
  const responseBody = JSON.parse(new TextDecoder().decode(responseBytes)) as {
    output?: { message?: { content?: { text: string }[] } };
  };
  const text = responseBody?.output?.message?.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Nova model');
  return text;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Partial<FixRequest>;

    if (!body.session_id || !body.file_path || !body.issue) {
      return NextResponse.json(
        { error: 'session_id, file_path, and issue are required' },
        { status: 400 },
      );
    }

    // Fetch file content from stored session files
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

    const reqBody = buildNovaBody(
      [{ role: 'user', content: prompt }],
      { maxTokens: 1024, temperature: 0.2 },
    );

    const modelsToTry = [MODEL_ID, FALLBACK_MODEL_ID, FALLBACK_MODEL_ID_2];
    let lastError: unknown;

    for (const modelId of modelsToTry) {
      try {
        const command = new InvokeModelCommand({
          modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: new TextEncoder().encode(reqBody),
        });
        const response = await bedrockClient.send(command);
        let text = parseNovaResponse(response.body as Uint8Array).trim();
        if (text.startsWith('```')) {
          text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        }
        const fix = JSON.parse(text) as FixSuggestion;
        return NextResponse.json(fix);
      } catch (err) {
        lastError = err;
        console.error(`[Fix] Model ${modelId} failed:`, err);
      }
    }

    console.error('[Fix] All models failed:', lastError);
    return NextResponse.json(
      { error: 'Failed to generate fix suggestion' },
      { status: 500 },
    );
  } catch (error) {
    console.error('[POST /api/fix] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
