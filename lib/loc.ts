import type { LinesOfCode } from './types';

const LANG_MAP: Record<string, string> = {
  '.ts': 'TypeScript', '.tsx': 'TypeScript', '.js': 'JavaScript',
  '.jsx': 'JavaScript', '.py': 'Python', '.java': 'Java',
  '.go': 'Go', '.rs': 'Rust', '.rb': 'Ruby', '.c': 'C',
  '.cpp': 'C++', '.cs': 'C#', '.php': 'PHP', '.swift': 'Swift',
  '.kt': 'Kotlin', '.scala': 'Scala', '.vue': 'Vue', '.svelte': 'Svelte',
  '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS', '.sql': 'SQL',
  '.sh': 'Shell', '.yaml': 'YAML', '.yml': 'YAML',
  '.json': 'JSON', '.toml': 'TOML', '.md': 'Markdown',
};

// Comment patterns per language family
const SINGLE_LINE_COMMENTS: Record<string, string[]> = {
  TypeScript: ['//', '*'], JavaScript: ['//', '*'],
  Python: ['#'], Ruby: ['#'], Shell: ['#'],
  Java: ['//', '*'], Go: ['//', '*'], Rust: ['//', '*'],
  'C': ['//', '*'], 'C++': ['//', '*'], 'C#': ['//', '*'],
  PHP: ['//', '#', '*'], Swift: ['//', '*'], Kotlin: ['//', '*'],
  Scala: ['//', '*'], SQL: ['--', '*'],
  CSS: ['*', '/*'], SCSS: ['//', '*', '/*'],
  HTML: ['<!--'], YAML: ['#'], TOML: ['#'],
};

function isCommentLine(line: string, lang: string): boolean {
  const trimmed = line.trim();
  const patterns = SINGLE_LINE_COMMENTS[lang];
  if (!patterns) return false;
  return patterns.some((p) => trimmed.startsWith(p));
}

export function countLinesOfCode(
  files: { path: string; content: string }[],
): LinesOfCode {
  const byLanguage: Record<string, number> = {};
  let total = 0;
  let codeLines = 0;
  let commentLines = 0;
  let blankLines = 0;

  for (const file of files) {
    const ext = file.path.includes('.')
      ? '.' + file.path.split('.').pop()!
      : '';
    const lang = LANG_MAP[ext.toLowerCase()] ?? 'Other';
    const lines = file.content.split('\n');

    total += lines.length;
    byLanguage[lang] = (byLanguage[lang] ?? 0) + lines.length;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '') {
        blankLines++;
      } else if (isCommentLine(trimmed, lang)) {
        commentLines++;
      } else {
        codeLines++;
      }
    }
  }

  return {
    total,
    code_lines: codeLines,
    comment_lines: commentLines,
    blank_lines: blankLines,
    by_language: byLanguage,
  };
}
