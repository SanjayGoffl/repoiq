import { NextRequest, NextResponse } from 'next/server';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { getSessionById } from '@/lib/dynamodb';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-pro-v1:0';
const FALLBACK_MODEL_ID = process.env.BEDROCK_FALLBACK_MODEL_ID || 'amazon.nova-lite-v1:0';
const FALLBACK_MODEL_ID_2 = process.env.BEDROCK_FALLBACK_MODEL_ID_2 || 'amazon.nova-micro-v1:0';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { session_id } = (await request.json()) as { session_id?: string };

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const session = await getSessionById(session_id);
    if (!session?.report) {
      return NextResponse.json({ error: 'Session or report not found' }, { status: 404 });
    }

    const report = session.report;
    const concepts = report.top_5_concepts
      .map((c) => `${c.concept} (file: ${c.file}, why: ${c.why_critical})`)
      .join('\n');

    const prompt = `Generate a quiz with exactly 5 multiple-choice questions to test a student's understanding of a codebase called "${session.repo_name}".

Key concepts to test:
${concepts}

Architecture: ${report.architecture_summary}

Respond with ONLY valid JSON (no markdown, no backticks):
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Rules:
- 5 questions, each with exactly 4 options
- "correct" is the 0-based index of the right answer
- Questions should test understanding, not memorization
- Reference actual concepts and files from the codebase
- Mix difficulty: 2 easy, 2 medium, 1 hard`;

    const body = JSON.stringify({
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 4096, temperature: 0.4 },
    });

    const modelsToTry = [MODEL_ID, FALLBACK_MODEL_ID, FALLBACK_MODEL_ID_2];
    let lastError: unknown;

    for (const modelId of modelsToTry) {
      try {
        const command = new InvokeModelCommand({
          modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: new TextEncoder().encode(body),
        });
        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body as Uint8Array)) as {
          output?: { message?: { content?: { text: string }[] } };
        };
        let text = responseBody?.output?.message?.content?.[0]?.text?.trim() ?? '';
        if (text.startsWith('```')) {
          text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        }
        const quiz = JSON.parse(text);
        return NextResponse.json(quiz);
      } catch (err) {
        lastError = err;
        console.error(`[Quiz] Model ${modelId} failed:`, err);
      }
    }

    console.error('[Quiz] All models failed:', lastError);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  } catch (error) {
    console.error('[POST /api/quiz] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
