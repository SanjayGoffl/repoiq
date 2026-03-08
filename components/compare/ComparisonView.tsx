'use client';

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Session } from '@/lib/types';
import { computeQualityScore } from '@/lib/quality-score';

interface ComparisonViewProps {
  sessionA: Session;
  sessionB: Session;
}

function CompareIndicator({ a, b, lowerIsBetter = false }: { a: number; b: number; lowerIsBetter?: boolean }) {
  if (a === b) return <Minus className="h-3 w-3 text-muted" />;
  const aWins = lowerIsBetter ? a < b : a > b;
  return aWins
    ? <ArrowUp className="h-3 w-3 text-emerald-400" />
    : <ArrowDown className="h-3 w-3 text-red-400" />;
}

function StatRow({
  label,
  valueA,
  valueB,
  numA,
  numB,
  lowerIsBetter = false,
}: {
  label: string;
  valueA: string | number;
  valueB: string | number;
  numA?: number;
  numB?: number;
  lowerIsBetter?: boolean;
}) {
  const showIndicator = numA !== undefined && numB !== undefined;
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 border-b border-border py-3 text-sm last:border-0">
      <span className="font-medium text-muted">{label}</span>
      <div className="flex items-center justify-center gap-1.5">
        {showIndicator && <CompareIndicator a={numA} b={numB} lowerIsBetter={lowerIsBetter} />}
        <span className="text-white">{valueA}</span>
      </div>
      <div className="flex items-center justify-center gap-1.5">
        {showIndicator && <CompareIndicator a={numB} b={numA} lowerIsBetter={lowerIsBetter} />}
        <span className="text-white">{valueB}</span>
      </div>
    </div>
  );
}

export function ComparisonView({ sessionA, sessionB }: ComparisonViewProps) {
  const reportA = sessionA.report;
  const reportB = sessionB.report;

  if (!reportA || !reportB) {
    return <p className="text-muted">Both sessions must have completed reports.</p>;
  }

  const bugsA = reportA.bugs_found;
  const bugsB = reportB.bugs_found;
  const criticalA = bugsA.filter((b) => b.severity === 'critical').length;
  const criticalB = bugsB.filter((b) => b.severity === 'critical').length;
  const locA = reportA.lines_of_code?.total ?? 0;
  const locB = reportB.lines_of_code?.total ?? 0;
  const depA = reportA.dependencies?.length ?? 0;
  const depB = reportB.dependencies?.length ?? 0;

  const qualityA = computeQualityScore(reportA);
  const qualityB = computeQualityScore(reportB);

  return (
    <div className="flex flex-col gap-6">
      {/* Quality Score Comparison - visual highlight */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { session: sessionA, quality: qualityA },
          { session: sessionB, quality: qualityB },
        ].map(({ session, quality }) => (
          <Card key={session.session_id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 ${
                quality.score >= 75 ? 'border-emerald-500/30 bg-emerald-500/10' :
                quality.score >= 50 ? 'border-yellow-500/30 bg-yellow-500/10' :
                'border-red-500/30 bg-red-500/10'
              }`}>
                <span className={`text-2xl font-bold ${
                  quality.score >= 75 ? 'text-emerald-400' :
                  quality.score >= 50 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {quality.grade}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{session.repo_name}</p>
                <p className="text-xs text-muted">{quality.score}/100 quality score</p>
                <Progress value={quality.score} className="mt-2 h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 text-sm font-semibold">
        <span className="text-muted">Metric</span>
        <span className="text-center text-green">{sessionA.repo_name}</span>
        <span className="text-center text-green">{sessionB.repo_name}</span>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="p-4">
          <StatRow label="Quality Score" valueA={`${qualityA.score}/100`} valueB={`${qualityB.score}/100`} numA={qualityA.score} numB={qualityB.score} />
          <StatRow label="Files" valueA={sessionA.file_count} valueB={sessionB.file_count} numA={sessionA.file_count} numB={sessionB.file_count} />
          <StatRow label="Lines of Code" valueA={locA.toLocaleString()} valueB={locB.toLocaleString()} numA={locA} numB={locB} />
          <StatRow label="Total Bugs" valueA={bugsA.length} valueB={bugsB.length} numA={bugsA.length} numB={bugsB.length} lowerIsBetter />
          <StatRow label="Critical Bugs" valueA={criticalA} valueB={criticalB} numA={criticalA} numB={criticalB} lowerIsBetter />
          <StatRow label="Dependencies" valueA={depA} valueB={depB} numA={depA} numB={depB} />
          <StatRow
            label="Languages"
            valueA={sessionA.languages.join(', ') || '-'}
            valueB={sessionB.languages.join(', ') || '-'}
          />
        </CardContent>
      </Card>

      {/* Stack comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[sessionA, sessionB].map((session) => (
          <Card key={session.session_id}>
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-green">
                {session.repo_name} — Stack
              </h3>
              {session.report?.stack_info ? (
                <div className="flex flex-col gap-2">
                  {(['frameworks', 'libraries', 'databases', 'tools'] as const).map((category) => {
                    const items = session.report?.stack_info?.[category] ?? [];
                    if (items.length === 0) return null;
                    return (
                      <div key={category} className="flex flex-wrap gap-1">
                        <span className="text-xs capitalize text-muted">{category}:</span>
                        {items.map((item) => (
                          <Badge key={item} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted">No stack info available</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Architecture comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[sessionA, sessionB].map((session) => (
          <Card key={session.session_id}>
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-semibold text-green">
                {session.repo_name} — Architecture
              </h3>
              <p className="text-xs leading-relaxed text-muted">
                {session.report?.architecture_summary ?? 'No summary available'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
