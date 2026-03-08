import { NextRequest, NextResponse } from 'next/server';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { getSessionById, getSessionFiles } from '@/lib/dynamodb';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-pro-v1:0';
const FALLBACK_MODEL_ID = process.env.BEDROCK_FALLBACK_MODEL_ID || 'amazon.nova-lite-v1:0';
const FALLBACK_MODEL_ID_2 = process.env.BEDROCK_FALLBACK_MODEL_ID_2 || 'amazon.nova-micro-v1:0';

type DiagramType = 'architecture' | 'data-flow' | 'dependency' | 'component';

const DIAGRAM_PROMPTS: Record<DiagramType, (ctx: DiagramContext) => string> = {
  architecture: (ctx) => `Generate a Mermaid flowchart showing the HIGH-LEVEL ARCHITECTURE of "${ctx.repoName}".

${ctx.codeContext}

Architecture: ${ctx.summary}
Frameworks: ${ctx.frameworks}
Databases: ${ctx.databases}

Create a graph TD showing:
- Layers: Client/Browser → Frontend → API/Backend → Database/External Services
- Group files into subgraphs by layer (Frontend, Backend, Data, Config)
- Show request/response flow with labeled arrows (e.g. "REST API", "Query", "Render")
- Include the actual framework names in node labels (e.g. "Next.js App Router" not just "Frontend")

Rules:
- graph TD (top-down)
- 10-18 nodes, 3-5 subgraphs
- Use descriptive arrow labels: -->|"label"|
- Style critical paths with thick arrows: ==>
- Use rounded nodes for services: (Service Name)
- Use database shape for storage: [(Database)]
- Respond with ONLY Mermaid code, no backticks, no explanation`,

  'data-flow': (ctx) => `Generate a Mermaid flowchart showing the DATA FLOW of "${ctx.repoName}".

${ctx.codeContext}

Architecture: ${ctx.summary}

Create a graph LR (left-to-right) showing:
- How data moves through the system: User Input → Processing → Storage → Output
- API request/response cycles
- State management flow
- Database read/write patterns
- Any caching or transformation steps

Rules:
- graph LR (left-to-right)
- 8-15 nodes
- Label every arrow with what data flows through it (e.g. "JSON payload", "Session data")
- Use different shapes: User Input {{curly}}, Process [square], Storage [(cylinder)], Output([rounded])
- Respond with ONLY Mermaid code, no backticks, no explanation`,

  dependency: (ctx) => `Generate a Mermaid flowchart showing the FILE DEPENDENCY MAP of "${ctx.repoName}".

Files in project:
${ctx.files.join('\n')}

${ctx.codeContext}

Create a graph TD showing:
- Which files import/depend on which other files
- Group files by directory using subgraphs
- Highlight the most imported files (they are the core modules)
- Show import direction with arrows (A imports B = A --> B)

Rules:
- graph TD
- Include ALL listed files as nodes (use short filenames, not full paths)
- Group by folder (e.g. subgraph "components", subgraph "lib", subgraph "api")
- Use dotted arrows for config/type imports: -.->
- Use solid arrows for runtime imports: -->
- Respond with ONLY Mermaid code, no backticks, no explanation`,

  component: (ctx) => `Generate a Mermaid flowchart showing the COMPONENT HIERARCHY of "${ctx.repoName}".

${ctx.codeContext}

Architecture: ${ctx.summary}
Key concepts: ${ctx.concepts}

Create a graph TD showing:
- Page-level components at the top
- How they compose smaller components
- Shared/reusable components at the bottom
- Data props flowing down (labeled arrows)
- Events/callbacks flowing up (dashed arrows)

Rules:
- graph TD
- 10-18 nodes
- Use subgraphs for pages/routes
- Label arrows with prop names where relevant
- Shared components should appear once with multiple arrows pointing to them
- Respond with ONLY Mermaid code, no backticks, no explanation`,
};

interface DiagramContext {
  repoName: string;
  summary: string;
  files: string[];
  frameworks: string;
  databases: string;
  concepts: string;
  codeContext: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { session_id, diagram_type = 'architecture' } = (await request.json()) as {
      session_id?: string;
      diagram_type?: DiagramType;
    };

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

    // Fetch actual file contents for better import analysis
    let codeSnippet = '';
    if (diagram_type === 'dependency' || diagram_type === 'component') {
      const sessionFiles = await getSessionFiles(session_id);
      // Extract import lines from each file for dependency analysis
      const importLines = sessionFiles
        .map((f) => {
          const imports = f.content
            .split('\n')
            .filter((line) => line.match(/^import |^from |^require\(|^const .* = require/))
            .slice(0, 10)
            .join('\n');
          return imports ? `=== ${f.path} ===\n${imports}` : '';
        })
        .filter(Boolean)
        .join('\n\n');
      codeSnippet = importLines
        ? `\nActual import statements from the code:\n${importLines}\n`
        : '';
    }

    const ctx: DiagramContext = {
      repoName: session.repo_name,
      summary: report.architecture_summary,
      files,
      frameworks: stack?.frameworks.join(', ') ?? 'unknown',
      databases: stack?.databases.join(', ') ?? 'none',
      concepts: report.top_5_concepts.map((c) => `${c.concept} (${c.file})`).join(', '),
      codeContext: codeSnippet,
    };

    const promptFn = DIAGRAM_PROMPTS[diagram_type] ?? DIAGRAM_PROMPTS.architecture;
    const prompt = promptFn(ctx);

    const body = JSON.stringify({
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 4096, temperature: 0.3 },
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
        return NextResponse.json({ mermaid_code: text, diagram_type });
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
