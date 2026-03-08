'use client';

import { BarChart3, Code2, MessageSquare, Minus } from 'lucide-react';
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
  TOML: 'bg-teal-500',
  Svelte: 'bg-orange-600',
  Vue: 'bg-emerald-400',
  Kotlin: 'bg-violet-500',
  Swift: 'bg-orange-500',
  Scala: 'bg-red-600',
  Other: 'bg-gray-500',
};

const LANG_DOT_COLORS: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-500',
  Python: 'bg-green-500',
  Rust: 'bg-orange-500',
  Go: 'bg-cyan-500',
  Java: 'bg-red-500',
};

function MiniStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xs font-medium text-white">{value.toLocaleString()}</span>
    </div>
  );
}

/**
 * Scale values so that smaller bars are still visible.
 * Uses square root scaling to compress the range while keeping relative order.
 */
function scaledWidth(count: number, maxCount: number): number {
  if (maxCount === 0) return 0;
  // Square root scale to make small values more visible
  const scaled = Math.sqrt(count / maxCount) * 100;
  // Ensure minimum visible width of 4%
  return Math.max(scaled, 4);
}

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return count.toLocaleString();
}

export function LinesOfCode({ linesOfCode }: LinesOfCodeProps) {
  const entries = Object.entries(linesOfCode.by_language)
    .sort(([, a], [, b]) => b - a);
  const maxLines = entries[0]?.[1] ?? 1;

  const hasBreakdown = linesOfCode.code_lines > 0 || linesOfCode.comment_lines > 0;
  const codePercent = linesOfCode.total > 0
    ? Math.round((linesOfCode.code_lines / linesOfCode.total) * 100)
    : 0;

  // Top language share for the stacked overview bar
  const topLanguages = entries.slice(0, 6);
  const topTotal = topLanguages.reduce((s, [, c]) => s + c, 0);
  const otherTotal = linesOfCode.total - topTotal;

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
        {/* Code/Comment/Blank breakdown */}
        {hasBreakdown && (
          <div className="mb-5">
            {/* Stacked bar */}
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-navy">
              <div
                className="bg-green transition-all"
                style={{ width: `${(linesOfCode.code_lines / linesOfCode.total) * 100}%` }}
                title={`Code: ${linesOfCode.code_lines.toLocaleString()}`}
              />
              <div
                className="bg-blue-400 transition-all"
                style={{ width: `${(linesOfCode.comment_lines / linesOfCode.total) * 100}%` }}
                title={`Comments: ${linesOfCode.comment_lines.toLocaleString()}`}
              />
              <div
                className="bg-white/10 transition-all"
                style={{ width: `${(linesOfCode.blank_lines / linesOfCode.total) * 100}%` }}
                title={`Blank: ${linesOfCode.blank_lines.toLocaleString()}`}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-4">
              <MiniStat icon={Code2} label="Code" value={linesOfCode.code_lines} color="text-green" />
              <MiniStat icon={MessageSquare} label="Comments" value={linesOfCode.comment_lines} color="text-blue-400" />
              <MiniStat icon={Minus} label="Blank" value={linesOfCode.blank_lines} color="text-white/40" />
              <span className="ml-auto text-xs text-muted">
                {codePercent}% actual code
              </span>
            </div>
          </div>
        )}

        {/* Language distribution mini bar */}
        {entries.length > 1 && (
          <div className="mb-4">
            <div className="flex h-2 w-full overflow-hidden rounded-full">
              {topLanguages.map(([lang, count]) => (
                <div
                  key={lang}
                  className={`${LANG_COLORS[lang] ?? 'bg-gray-500'} transition-all`}
                  style={{ width: `${(count / linesOfCode.total) * 100}%` }}
                  title={`${lang}: ${count.toLocaleString()}`}
                />
              ))}
              {otherTotal > 0 && (
                <div
                  className="bg-gray-600 transition-all"
                  style={{ width: `${(otherTotal / linesOfCode.total) * 100}%` }}
                  title={`Other: ${otherTotal.toLocaleString()}`}
                />
              )}
            </div>
          </div>
        )}

        {/* Per-language bars */}
        <div className="space-y-1.5">
          {entries.map(([lang, count]) => {
            const percentage = ((count / linesOfCode.total) * 100).toFixed(1);
            return (
              <div key={lang} className="flex items-center gap-3">
                <div className="flex w-24 shrink-0 items-center justify-end gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${LANG_COLORS[lang] ?? 'bg-gray-500'}`} />
                  <span className="text-xs text-muted">{lang}</span>
                </div>
                <div className="relative h-5 flex-1 overflow-hidden rounded bg-navy">
                  <div
                    className={`h-full rounded transition-all ${LANG_COLORS[lang] ?? 'bg-gray-500'}`}
                    style={{ width: `${scaledWidth(count, maxLines)}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-xs tabular-nums text-white">
                  {formatCount(count)}
                </span>
                <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
