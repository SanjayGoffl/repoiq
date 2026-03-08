import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import type { Report, LineChatResponse } from './types';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-pro-v1:0';
const FALLBACK_MODEL_ID = process.env.BEDROCK_FALLBACK_MODEL_ID || 'amazon.nova-lite-v1:0';
const FALLBACK_MODEL_ID_2 = process.env.BEDROCK_FALLBACK_MODEL_ID_2 || 'amazon.nova-micro-v1:0';

/**
 * Build request body for Amazon Nova models.
 * Nova uses the Converse-style schema:
 *   { messages: [...], system: [...], inferenceConfig: { maxTokens, temperature } }
 * Response shape: { output: { message: { content: [{ text }] } } }
 */
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

/**
 * Parse response from Amazon Nova models.
 * Returns the text content from the response.
 */
function parseNovaResponse(responseBytes: Uint8Array): string {
  const responseBody = JSON.parse(new TextDecoder().decode(responseBytes)) as {
    output?: { message?: { content?: { text: string }[] } };
  };
  const text = responseBody?.output?.message?.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Nova model');
  return text;
}

// ──────────────────────────────────────────────────────────────
// GitHub: Fetch repo files via GitHub API (no git clone needed)
// ──────────────────────────────────────────────────────────────

interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
  size: number;
}

const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs', '.rb',
  '.c', '.cpp', '.h', '.cs', '.php', '.swift', '.kt', '.scala',
  '.vue', '.svelte', '.html', '.css', '.scss', '.sql', '.sh',
  '.yaml', '.yml', '.json', '.toml', '.md',
]);

const SKIP_DIRS = new Set([
  'node_modules', '.git', '__pycache__', '.next', 'dist', 'build',
  'coverage', '.vscode', '.idea', 'vendor', 'venv', '.env',
]);

/**
 * Recursively fetch repo tree from GitHub API.
 * Phase 1: Discover file URLs (sequential tree walk, fast — no content downloads).
 * Phase 2: Download file contents in parallel (up to MAX_FILES).
 */
export async function fetchRepoFiles(
  owner: string,
  repo: string,
  path = '',
  maxFiles = 50,
): Promise<{ path: string; content: string }[]> {
  // Phase 1: Discover downloadable file entries
  const discovered: { path: string; download_url: string }[] = [];

  async function walk(currentPath: string): Promise<void> {
    if (discovered.length >= maxFiles) return;

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${currentPath}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'RepoIQ/1.0',
      },
    });

    if (!res.ok) {
      console.warn(`[GitHub] Failed to fetch ${url}: ${res.status}`);
      return;
    }

    const entries = (await res.json()) as GitHubFile[];

    // Collect dirs to walk in parallel
    const dirPaths: string[] = [];

    for (const entry of entries) {
      if (discovered.length >= maxFiles) break;

      if (entry.type === 'dir') {
        const dirName = entry.name.toLowerCase();
        if (SKIP_DIRS.has(dirName)) continue;
        dirPaths.push(entry.path);
      } else if (entry.type === 'file' && entry.download_url) {
        const ext = entry.name.includes('.')
          ? '.' + entry.name.split('.').pop()
          : '';
        if (!CODE_EXTENSIONS.has(ext.toLowerCase())) continue;
        if (entry.size > 100_000) continue; // Skip files > 100KB
        discovered.push({ path: entry.path, download_url: entry.download_url });
      }
    }

    // Walk subdirectories in parallel (bounded)
    if (dirPaths.length > 0 && discovered.length < maxFiles) {
      await Promise.all(dirPaths.map((dir) => walk(dir)));
    }
  }

  await walk(path);

  // Phase 2: Download file contents in parallel (limit to maxFiles)
  const toDownload = discovered.slice(0, maxFiles);
  console.log(`[GitHub] Discovered ${discovered.length} files, downloading ${toDownload.length} in parallel`);

  const results = await Promise.allSettled(
    toDownload.map(async (entry) => {
      try {
        const fileRes = await fetch(entry.download_url);
        if (fileRes.ok) {
          const content = await fileRes.text();
          return { path: entry.path, content };
        }
        return null;
      } catch {
        console.warn(`[GitHub] Failed to download ${entry.path}`);
        return null;
      }
    }),
  );

  const files: { path: string; content: string }[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      files.push(result.value);
    }
  }

  return files;
}

/**
 * Detect languages from file extensions
 */
export function detectLanguages(files: { path: string }[]): string[] {
  const langMap: Record<string, string> = {
    '.ts': 'TypeScript', '.tsx': 'TypeScript', '.js': 'JavaScript',
    '.jsx': 'JavaScript', '.py': 'Python', '.java': 'Java',
    '.go': 'Go', '.rs': 'Rust', '.rb': 'Ruby', '.c': 'C',
    '.cpp': 'C++', '.cs': 'C#', '.php': 'PHP', '.swift': 'Swift',
    '.kt': 'Kotlin', '.vue': 'Vue', '.svelte': 'Svelte',
    '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS', '.sql': 'SQL',
  };
  const langs = new Set<string>();
  for (const f of files) {
    const ext = '.' + (f.path.split('.').pop() || '');
    if (langMap[ext]) langs.add(langMap[ext]);
  }
  return Array.from(langs);
}

// ──────────────────────────────────────────────────────────────
// Bedrock: Analyze repo code with Claude
// ──────────────────────────────────────────────────────────────

export async function analyzeWithBedrock(
  files: { path: string; content: string }[],
  repoName: string,
): Promise<Report> {
  // Build a compact code summary for the prompt (truncate large files)
  const codeContext = files
    .map((f) => {
      const truncated = f.content.length > 3000
        ? f.content.slice(0, 3000) + '\n... (truncated)'
        : f.content;
      return `=== ${f.path} ===\n${truncated}`;
    })
    .join('\n\n');

  // Build list of file paths for file_importance
  const filePaths = files.map((f) => f.path);

  const prompt = `You are an expert code analyst. Analyze this GitHub repository "${repoName}" and produce a comprehensive learning report for a student who vibe-coded this project (used AI to generate the code but doesn't fully understand it).

Here are the repository files:

${codeContext}

Respond with ONLY valid JSON matching this exact schema (no markdown, no backticks, just raw JSON):

{
  "architecture_summary": "2-3 sentence overview of the project architecture, tech stack, and how components connect",
  "top_5_concepts": [
    {
      "concept": "Name of the concept the student likely doesn't understand",
      "file": "path/to/file.ext",
      "lines": [startLine, endLine],
      "why_critical": "Why understanding this is essential",
      "first_question": "A Socratic question to test their understanding"
    }
  ],
  "bugs_found": [
    {
      "file": "path/to/file.ext",
      "line": 10,
      "issue": "Description of the bug or code smell",
      "severity": "critical|high|medium|low"
    }
  ],
  "learning_path": [
    {
      "week": 1,
      "focus": "Topic to study",
      "reason": "Why this comes first"
    }
  ],
  "stack_info": {
    "frameworks": ["e.g. Next.js", "Express"],
    "libraries": ["e.g. React", "Zustand"],
    "databases": ["e.g. DynamoDB", "PostgreSQL"],
    "tools": ["e.g. Docker", "ESLint", "Tailwind CSS"]
  },
  "runtime_requirements": {
    "ram_estimate_mb": 512,
    "ram_reasoning": "Why this amount of RAM (consider framework overhead, dependencies, etc.)",
    "runtime_versions": [
      { "name": "Node.js", "version": "18+" }
    ],
    "system_requirements": ["npm or yarn", "any other system deps"]
  },
  "file_importance": [
    {
      "path": "exact/file/path.ext",
      "score": 9,
      "reason": "Why this file matters",
      "category": "critical"
    }
  ],
  "lessons": [
    {
      "order": 1,
      "title": "Lesson title",
      "description": "What the student will learn",
      "files_covered": ["path/to/file.ext"],
      "concepts_covered": ["Concept name"],
      "complexity_level": "beginner"
    }
  ],
  "security": {
    "overall": 75,
    "summary": "Brief security posture summary",
    "findings": [
      {
        "file": "path/to/file.ext",
        "line": 10,
        "issue": "What the security issue is",
        "severity": "critical|high|medium|low",
        "category": "injection|auth|data_exposure|misconfiguration|dependency|other",
        "recommendation": "How to fix it"
      }
    ]
  },
  "code_quality": {
    "overall_score": 70,
    "maintainability": 65,
    "readability": 80,
    "test_coverage_estimate": "none|low|moderate|high",
    "anti_patterns": ["e.g. God function in auth.ts", "No error boundaries"],
    "strengths": ["e.g. Good separation of concerns", "Consistent naming"]
  },
  "complexity_hotspots": [
    {
      "file": "path/to/file.ext",
      "function_name": "functionName",
      "complexity": "simple|moderate|complex|very_complex",
      "reason": "Why this function is complex"
    }
  ]
}

Requirements:
- top_5_concepts: Exactly 5 concepts, ordered by importance
- bugs_found: 1-5 real bugs or code smells you found
- learning_path: 3-4 weeks
- stack_info: Detect ALL frameworks, libraries, databases, and tools used
- runtime_requirements: Estimate RAM needed to run this project (consider framework, deps, typical usage)
- file_importance: Rate EVERY file from this list: ${JSON.stringify(filePaths)}. Score 1-10. category: score 8-10="critical", 5-7="important", 1-4="normal"
- lessons: 5-8 structured lessons ordered by complexity. Each lesson covers a logical chunk of the codebase. Start with beginner concepts, progress to advanced
- security: Scan for OWASP Top 10 vulnerabilities, hardcoded secrets/API keys, missing auth checks, SQL/NoSQL injection, XSS, data exposure, insecure configs. Score 0-100 (100=perfectly secure). List 0-5 specific findings with exact file and line
- code_quality: Rate maintainability and readability 0-100. Estimate test coverage from presence of test files. List 2-4 anti-patterns found and 2-4 code strengths
- complexity_hotspots: Identify 3-5 most complex functions (deeply nested logic, long functions, multiple responsibilities). Use actual function names from the code
- Use actual file paths and line numbers from the code above
- Focus on concepts a vibe-coder would NOT understand`;

  const body = buildNovaBody(
    [{ role: 'user', content: prompt }],
    { maxTokens: 8192, temperature: 0.3 },
  );

  // Try primary model, fall back if it fails
  let text = '';
  const modelsToTry = [MODEL_ID, FALLBACK_MODEL_ID, FALLBACK_MODEL_ID_2];

  let lastError: unknown;
  let success = false;

  for (const modelId of modelsToTry) {
    try {
      console.log(`[Bedrock] Invoking model: ${modelId}`);
      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: new TextEncoder().encode(body),
      });

      const response = await bedrockClient.send(command);
      text = parseNovaResponse(response.body as Uint8Array);
      console.log(`[Bedrock] Success with model: ${modelId}`);
      success = true;
      break;
    } catch (err) {
      lastError = err;
      console.error(`[Bedrock] Model ${modelId} failed:`, err);
    }
  }

  if (!success) {
    throw lastError;
  }

  // Parse JSON from response (handle potential markdown wrapping)
  let jsonStr = text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  }

  const report = JSON.parse(jsonStr) as Report;
  return report;
}

// ──────────────────────────────────────────────────────────────
// Bedrock: Explain a specific line of code
// ──────────────────────────────────────────────────────────────

export async function explainLine(
  fileContent: string,
  filePath: string,
  lineNumber: number,
  codeLine: string,
  repoName: string,
  conversationHistory: { role: string; content: string }[],
  userMemory?: string,
): Promise<LineChatResponse> {
  const lines = fileContent.split('\n');
  const start = Math.max(0, lineNumber - 6);
  const end = Math.min(lines.length, lineNumber + 5);
  const surroundingLines = lines
    .slice(start, end)
    .map((l, i) => `${start + i + 1}${start + i + 1 === lineNumber ? ' >>>' : '    '} ${l}`)
    .join('\n');

  const systemPrompt = `You are a code explainer for RepoIQ. A student is reading code from "${repoName}" and clicked on a specific line to understand it.

File: ${filePath}
Line ${lineNumber}: ${codeLine}

${userMemory ? `Student profile:\n${userMemory}\n` : ''}
Surrounding code context:
${surroundingLines}

Explain what this line does. Identify any library/framework functions, variables, and their purpose.

Respond with ONLY valid JSON (no markdown, no backticks):
{
  "explanation": "Clear explanation of what this line does",
  "references": [
    { "name": "identifier name", "type": "library|variable|function|type", "doc_url": "optional url" }
  ],
  "follow_up_suggestion": "A question the student might want to ask next"
}`;

  const messages = [
    ...conversationHistory,
    { role: 'user', content: conversationHistory.length > 0
      ? codeLine
      : `Explain line ${lineNumber}: ${codeLine}` },
  ];

  const body = buildNovaBody(messages, {
    maxTokens: 2048,
    temperature: 0.3,
    systemPrompt,
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
      let text = parseNovaResponse(response.body as Uint8Array).trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
      }
      return JSON.parse(text) as LineChatResponse;
    } catch (err) {
      lastError = err;
      console.error(`[ExplainLine] Model ${modelId} failed:`, err);
    }
  }

  throw lastError ?? new Error('All models failed for line explanation');
}

// ──────────────────────────────────────────────────────────────
// Bedrock: Update user memory based on interaction
// ──────────────────────────────────────────────────────────────

export async function generateMemoryUpdate(
  currentMemory: string,
  interaction: { userMessage: string; aiResponse: string; context: string },
): Promise<string> {
  const prompt = `You manage a learning profile for a student using RepoIQ.

Current memory:
${currentMemory || 'No memory yet - this is a new student.'}

Latest interaction:
Context: ${interaction.context}
Student said: ${interaction.userMessage}
AI responded: ${interaction.aiResponse}

Update the memory markdown to reflect any new insights about the student's skill level, learning style, what they know, and what they struggle with.
Only add/modify what's relevant. Keep it concise (max 500 words).
Return ONLY the updated markdown, no other text or wrapping.`;

  const body = buildNovaBody(
    [{ role: 'user', content: prompt }],
    { maxTokens: 1024, temperature: 0.3 },
  );

  const modelsToTry = [MODEL_ID, FALLBACK_MODEL_ID, FALLBACK_MODEL_ID_2];

  for (const modelId of modelsToTry) {
    try {
      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: new TextEncoder().encode(body),
      });
      const response = await bedrockClient.send(command);
      return parseNovaResponse(response.body as Uint8Array).trim();
    } catch (err) {
      console.error(`[MemoryUpdate] Model ${modelId} failed:`, err);
    }
  }

  return currentMemory; // Fallback: keep existing memory
}
