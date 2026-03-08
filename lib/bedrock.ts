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
// GitHub: Fetch ALL repo files via GitHub Trees API
// Uses a single API call to discover the entire repo tree,
// then downloads all matching files in batched parallel.
// ──────────────────────────────────────────────────────────────

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs', '.rb',
  '.c', '.cpp', '.h', '.cs', '.php', '.swift', '.kt', '.scala',
  '.vue', '.svelte', '.html', '.css', '.scss', '.sql', '.sh',
  '.yaml', '.yml', '.json', '.toml', '.md',
  '.prisma', '.graphql', '.gql', '.proto', '.tf', '.hcl',
  '.dockerfile', '.env.example', '.gitignore',
]);

const SKIP_DIRS = new Set([
  'node_modules', '.git', '__pycache__', '.next', 'dist', 'build',
  'coverage', '.vscode', '.idea', 'vendor', 'venv', '.env',
  '.turbo', '.cache', '.output', 'out', '.svelte-kit',
  '.nuxt', '.vercel', '.netlify', 'target', 'bin', 'obj',
  '__snapshots__', '.pytest_cache', '.mypy_cache',
]);

/** Max file size in bytes to download (200KB) */
const MAX_FILE_SIZE = 200_000;

/** Concurrency limit for parallel downloads */
const DOWNLOAD_BATCH_SIZE = 15;

/**
 * Check if a file path is inside a skipped directory.
 */
function isInSkippedDir(filePath: string): boolean {
  const parts = filePath.split('/');
  return parts.some((part) => SKIP_DIRS.has(part.toLowerCase()));
}

export interface FetchRepoResult {
  files: { path: string; content: string }[];
  stats: {
    total_in_repo: number;
    code_files_found: number;
    files_fetched: number;
    skipped_large: number;
    skipped_dirs: number;
    was_limited: boolean;
    limit_applied: number;
  };
}

/**
 * Fetch ALL code files from a GitHub repo.
 *
 * Phase 1: Single API call to get the full recursive tree.
 * Phase 2: Filter to code files, skip ignored dirs.
 * Phase 3: Download file contents in batched parallel (15 at a time).
 *
 * @param maxFiles - Safety cap (default: no limit). Pass 0 for unlimited.
 */
export async function fetchRepoFiles(
  owner: string,
  repo: string,
  _path = '',
  maxFiles = 0,
): Promise<FetchRepoResult> {
  const ghHeaders: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'RepoIQ/1.0',
  };

  // Optional: use a GitHub token for higher rate limits (5000/hr vs 60/hr)
  const ghToken = process.env.GITHUB_TOKEN;
  if (ghToken) {
    ghHeaders['Authorization'] = `Bearer ${ghToken}`;
  }

  // ── Phase 1: Get the full repo tree in ONE API call ──
  // First, get the default branch
  const repoRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    { headers: ghHeaders },
  );
  if (!repoRes.ok) {
    throw new Error(`GitHub API error: ${repoRes.status} — is the repo public?`);
  }
  const repoData = (await repoRes.json()) as { default_branch: string; size: number };
  const branch = repoData.default_branch;

  console.log(`[GitHub] Repo ${owner}/${repo} — branch: ${branch}, size: ${repoData.size}KB`);

  // Fetch recursive tree (single API call, returns ALL files)
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: ghHeaders },
  );
  if (!treeRes.ok) {
    throw new Error(`GitHub Trees API error: ${treeRes.status}`);
  }
  const treeData = (await treeRes.json()) as GitHubTreeResponse;

  if (treeData.truncated) {
    console.warn(`[GitHub] Tree was truncated — repo has too many files. Some files may be missing.`);
  }

  // ── Phase 2: Filter to downloadable code files ──
  const totalBlobs = treeData.tree.filter((i) => i.type === 'blob').length;
  let skippedLarge = 0;
  let skippedDirs = 0;

  const codeFiles = treeData.tree.filter((item) => {
    if (item.type !== 'blob') return false;
    if (isInSkippedDir(item.path)) { skippedDirs++; return false; }
    if (item.size && item.size > MAX_FILE_SIZE) { skippedLarge++; return false; }

    const fileName = item.path.split('/').pop() ?? '';
    const specialFiles = new Set(['Dockerfile', 'Makefile', 'Procfile', 'docker-compose.yml', 'docker-compose.yaml']);
    if (specialFiles.has(fileName)) return true;

    const ext = fileName.includes('.')
      ? '.' + fileName.split('.').pop()!.toLowerCase()
      : '';
    return CODE_EXTENSIONS.has(ext);
  });

  // Sort by importance: critical config files first, then by path
  codeFiles.sort((a, b) => {
    const aName = a.path.split('/').pop() ?? '';
    const bName = b.path.split('/').pop() ?? '';
    const priorityFiles = ['package.json', 'tsconfig.json', 'requirements.txt', 'Cargo.toml', 'go.mod', 'Gemfile'];
    const aPriority = priorityFiles.includes(aName) ? -1 : 0;
    const bPriority = priorityFiles.includes(bName) ? -1 : 0;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.path.localeCompare(b.path);
  });

  // Apply max cap if set
  const wasLimited = maxFiles > 0 && codeFiles.length > maxFiles;
  const toDownload = maxFiles > 0 ? codeFiles.slice(0, maxFiles) : codeFiles;
  console.log(`[GitHub] Found ${totalBlobs} total files in repo, ${codeFiles.length} code files, downloading ${toDownload.length}${wasLimited ? ` (limited to ${maxFiles})` : ''}`);

  // ── Phase 3: Download file contents in batched parallel ──
  const files: { path: string; content: string }[] = [];

  for (let i = 0; i < toDownload.length; i += DOWNLOAD_BATCH_SIZE) {
    const batch = toDownload.slice(i, i + DOWNLOAD_BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (item) => {
        const downloadUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
        try {
          const res = await fetch(downloadUrl, { headers: { 'User-Agent': 'RepoIQ/1.0' } });
          if (!res.ok) return null;
          const content = await res.text();
          return { path: item.path, content };
        } catch {
          console.warn(`[GitHub] Failed to download ${item.path}`);
          return null;
        }
      }),
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        files.push(result.value);
      }
    }
  }

  console.log(`[GitHub] Successfully downloaded ${files.length}/${toDownload.length} files`);
  return {
    files,
    stats: {
      total_in_repo: totalBlobs,
      code_files_found: codeFiles.length,
      files_fetched: files.length,
      skipped_large: skippedLarge,
      skipped_dirs: skippedDirs,
      was_limited: wasLimited,
      limit_applied: maxFiles,
    },
  };
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
// GitHub: Fetch README and repo description
// ──────────────────────────────────────────────────────────────

export interface RepoOverview {
  readme_content: string;
  repo_description: string;
}

/**
 * Fetch the README content and repo description from GitHub.
 * Tries README.md, then readme.md, then falls back to empty.
 */
export async function fetchRepoOverview(
  owner: string,
  repo: string,
): Promise<RepoOverview> {
  const ghHeaders: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'RepoIQ/1.0',
  };
  const ghToken = process.env.GITHUB_TOKEN;
  if (ghToken) {
    ghHeaders['Authorization'] = `Bearer ${ghToken}`;
  }

  // Fetch repo description from API
  let repoDescription = '';
  try {
    const repoRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers: ghHeaders },
    );
    if (repoRes.ok) {
      const data = (await repoRes.json()) as { description?: string };
      repoDescription = data.description ?? '';
    }
  } catch {
    // non-critical, continue
  }

  // Fetch README content via GitHub API (handles case-insensitive lookup)
  let readmeContent = '';
  try {
    const readmeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers: { ...ghHeaders, Accept: 'application/vnd.github.v3.raw' } },
    );
    if (readmeRes.ok) {
      const raw = await readmeRes.text();
      // Limit to ~5000 chars to avoid bloating storage
      readmeContent = raw.length > 5000 ? raw.slice(0, 5000) + '\n\n...(truncated)' : raw;
    }
  } catch {
    // non-critical, continue
  }

  return { readme_content: readmeContent, repo_description: repoDescription };
}

// ──────────────────────────────────────────────────────────────
// Bedrock: Analyze repo code with Claude
// ──────────────────────────────────────────────────────────────

export async function analyzeWithBedrock(
  files: { path: string; content: string }[],
  repoName: string,
): Promise<Report> {
  // Smart context building: fit as many files as possible within ~80K chars
  // Priority: config files > entry points > source code > others
  const MAX_CONTEXT_CHARS = 80_000;
  const MAX_PER_FILE = 3000;

  // Prioritize files for full content inclusion
  const priorityScore = (path: string): number => {
    const name = path.split('/').pop() ?? '';
    if (['package.json', 'tsconfig.json', 'requirements.txt', 'Cargo.toml', 'go.mod', 'Gemfile', 'Makefile', 'Dockerfile'].includes(name)) return 100;
    if (name.includes('config') || name.includes('schema')) return 80;
    if (path.includes('route') || path.includes('api/')) return 70;
    if (name === 'index.ts' || name === 'index.tsx' || name === 'main.ts' || name === 'app.ts') return 65;
    if (path.includes('lib/') || path.includes('utils/') || path.includes('core/')) return 60;
    if (path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.py') || path.endsWith('.go') || path.endsWith('.rs')) return 50;
    if (path.endsWith('.json') || path.endsWith('.yaml') || path.endsWith('.yml')) return 20;
    if (path.endsWith('.md')) return 10;
    return 30;
  };

  const sorted = [...files].sort((a, b) => priorityScore(b.path) - priorityScore(a.path));

  let contextSize = 0;
  const fullContentFiles: string[] = [];
  const summaryOnlyFiles: string[] = [];

  for (const f of sorted) {
    const truncated = f.content.length > MAX_PER_FILE
      ? f.content.slice(0, MAX_PER_FILE) + '\n... (truncated)'
      : f.content;
    const entry = `=== ${f.path} ===\n${truncated}`;

    if (contextSize + entry.length <= MAX_CONTEXT_CHARS) {
      fullContentFiles.push(entry);
      contextSize += entry.length;
    } else {
      // Include path only for remaining files
      summaryOnlyFiles.push(f.path);
    }
  }

  const codeContext = fullContentFiles.join('\n\n');
  const allPaths = files.map((f) => f.path);

  // Build list of file paths for file_importance
  const filePaths = allPaths;

  const filesNote = summaryOnlyFiles.length > 0
    ? `\n\nAdditional files in this repo (content not shown, but rate their importance too):\n${summaryOnlyFiles.join('\n')}\n`
    : '';

  console.log(`[Bedrock] Analyzing ${files.length} files (${fullContentFiles.length} with full content, ${summaryOnlyFiles.length} paths only, ~${Math.round(contextSize / 1024)}KB context)`);

  const prompt = `You are an expert code analyst. Analyze this GitHub repository "${repoName}" (${files.length} total files) and produce a comprehensive learning report for a student who vibe-coded this project (used AI to generate the code but doesn't fully understand it).

Here are the repository files:

${codeContext}${filesNote}

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
- top_5_concepts: ${files.length <= 10 ? '3-5' : files.length <= 50 ? '5-7' : '7-10'} concepts, ordered by importance. Scale with repo complexity
- bugs_found: ${files.length <= 10 ? '1-3' : files.length <= 50 ? '3-7' : '5-10'} real bugs or code smells you found. More files = likely more bugs
- learning_path: ${files.length <= 20 ? '2-3' : files.length <= 100 ? '3-5' : '4-8'} weeks. Scale with codebase size
- stack_info: Detect ALL frameworks, libraries, databases, and tools used
- runtime_requirements: Estimate RAM needed to run this project (consider framework, deps, typical usage)
- file_importance: Rate EVERY file from this list: ${JSON.stringify(filePaths)}. Score 1-10. category: score 8-10="critical", 5-7="important", 1-4="normal"
- lessons: Generate as many lessons as the codebase needs (small repos: 3-5, medium repos: 6-10, large repos: 10-20). Each lesson should cover ONE logical chunk — a feature, a module, or a pattern. Order by complexity (beginner → advanced). More files/complexity = more lessons. This repo has ${files.length} files across ${new Set(files.map(f => f.path.split('/')[0])).size} top-level directories — scale lessons accordingly
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
