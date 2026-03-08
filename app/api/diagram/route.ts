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
    const files = report.file_importance?.map((f) => f.path) ?? [];
    const stack = report.stack_info;
    const concepts = report.top_5_concepts.map((c) => `${c.concept} (${c.file})`);

    const prompt = `Generate a Mermaid flowchart diagram showing the architecture of a project called "${session.repo_name}".

Files: ${files.join(', ')}
Frameworks: ${stack?.frameworks.join(', ') ?? 'unknown'}
Libraries: ${stack?.libraries.join(', ') ?? 'unknown'}
Databases: ${stack?.databases.join(', ') ?? 'none'}
Key concepts: ${concepts.join(', ')}
Architecture: ${report.architecture_summary}

Create a clean Mermaid flowchart (graph TD) that shows:
- Main components/modules and how they connect
- Data flow between frontend, backend, and database layers
- Key files grouped by their role

Rules:
- Use graph TD (top-down)
- Keep it simple: 8-15 nodes max
- Use short labels
- Group related nodes with subgraph
- Respond with ONLY the Mermaid code, no markdown backticks, no explanation`;

    const body = JSON.stringify({
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 2048, temperature: 0.3 },
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
          text = text.replace(/^```mermaid?\n?/, '').replace(/\n?```$/, '');
        }
        return NextResponse.json({ mermaid_code: text });
      } catch (err) {
        lastError = err;
        console.error(`[Diagram] Model ${modelId} failed:`, err);
      }
    }

    console.error('[Diagram] All models failed:', lastError);
    return NextResponse.json({ error: 'Failed to generate diagram' }, { status: 500 });
  } catch (error) {
    console.error('[POST /api/diagram] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
