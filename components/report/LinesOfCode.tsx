'use client';

import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LinesOfCode as LinesOfCodeType } from '@/lib/types';

interface LinesOfCodeProps {
  linesOfCode: LinesOfCodeType;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-500',
  Python: 'bg-green-500',
  Java: 'bg-red-500',
  Go: 'bg-cyan-500',
  Rust: 'bg-orange-500',
  Ruby: 'bg-red-400',
  'C++': 'bg-pink-500',
  C: 'bg-gray-400',
  'C#': 'bg-purple-500',
  PHP: 'bg-indigo-400',
  HTML: 'bg-orange-400',
  CSS: 'bg-blue-400',
  SCSS: 'bg-pink-400',
  SQL: 'bg-emerald-500',
  Shell: 'bg-gray-500',
  JSON: 'bg-gray-600',
  YAML: 'bg-gray-500',
  Markdown: 'bg-gray-400',
  Other: 'bg-gray-500',
};

export function LinesOfCode({ linesOfCode }: LinesOfCodeProps) {
  const entries = Object.entries(linesOfCode.by_language)
    .sort(([, a], [, b]) => b - a);
  const maxLines = entries[0]?.[1] ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          Lines of Code
          <span className="ml-auto text-2xl font-bold text-white">
            {linesOfCode.total.toLocaleString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map(([lang, count]) => (
            <div key={lang} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-right text-xs text-muted">
                {lang}
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-navy">
                <div
                  className={`h-full rounded-full transition-all ${LANG_COLORS[lang] ?? 'bg-gray-500'}`}
                  style={{ width: `${Math.max((count / maxLines) * 100, 2)}%` }}
                />
              </div>
              <span className="w-14 shrink-0 text-xs text-muted">
                {count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
