import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import type { Report } from './types';

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
  maxFiles = 30,
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

  const prompt = `You are an expert code analyst. Analyze this GitHub repository "${repoName}" and produce a learning report for a student who vibe-coded this project (used AI to generate the code but doesn't fully understand it).

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
  ]
}

Requirements:
- top_5_concepts: Exactly 5 concepts, ordered by importance
- bugs_found: 1-5 real bugs or code smells you found
- learning_path: 3-4 weeks
- Use actual file paths and line numbers from the code above
- Focus on concepts a vibe-coder would NOT understand`;

  const body = buildNovaBody(
    [{ role: 'user', content: prompt }],
    { maxTokens: 4096, temperature: 0.3 },
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
