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

export function countLinesOfCode(
  files: { path: string; content: string }[],
): LinesOfCode {
  const byLanguage: Record<string, number> = {};
  let total = 0;

  for (const file of files) {
    const ext = file.path.includes('.')
      ? '.' + file.path.split('.').pop()!
      : '';
    const lang = LANG_MAP[ext.toLowerCase()] ?? 'Other';
    const lines = file.content.split('\n').length;

    total += lines;
    byLanguage[lang] = (byLanguage[lang] ?? 0) + lines;
  }

  return { total, by_language: byLanguage };
}
