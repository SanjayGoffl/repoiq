'use client';

import { Trophy, BookOpen, Bug, Shield, Code2 } from 'lucide-react';
import type { Report } from '@/lib/types';
import type { Gap } from '@/lib/types';

interface Props {
  report: Report;
  gaps?: Gap[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-navy p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-bold text-white">{value}</p>
        <p className="text-xs text-muted">{label}</p>
        {subtext && <p className="text-xs text-muted/60">{subtext}</p>}
      </div>
    </div>
  );
}

export function ProgressOverview({ report, gaps }: Props) {
  const completedGaps = gaps?.filter((g) => g.understood).length ?? 0;
  const totalGaps = gaps?.length ?? report.top_5_concepts.length;
  const progressPercent = totalGaps > 0 ? Math.round((completedGaps / totalGaps) * 100) : 0;

  const securityScore = report.security?.overall ?? null;
  const qualityScore = report.code_quality?.overall_score ?? null;
  const bugCount = report.bugs_found.length;
  const locTotal = report.lines_of_code?.total ?? 0;
  const codeLines = report.lines_of_code?.code_lines ?? locTotal;

  return (
    <section className="rounded-lg border border-border bg-navy-light p-5">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Analysis Overview
          </h2>
          <span className="text-sm text-muted">
            {completedGaps}/{totalGaps} concepts mastered
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-green transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Code2}
          label="Lines of Code"
          value={codeLines.toLocaleString()}
          subtext={locTotal !== codeLines ? `${locTotal.toLocaleString()} total` : undefined}
          color="bg-blue-500/20 text-blue-400"
        />
        <StatCard
          icon={Bug}
          label="Bugs Found"
          value={bugCount}
          subtext={bugCount === 0 ? 'Clean!' : `${report.bugs_found.filter((b) => b.severity === 'critical' || b.severity === 'high').length} critical/high`}
          color="bg-red-500/20 text-red-400"
        />
        {securityScore !== null && (
          <StatCard
            icon={Shield}
            label="Security Score"
            value={`${securityScore}/100`}
            subtext={securityScore >= 80 ? 'Secure' : securityScore >= 60 ? 'Fair' : 'Needs work'}
            color={securityScore >= 60 ? 'bg-green/20 text-green' : 'bg-orange/20 text-orange'}
          />
        )}
        {qualityScore !== null && (
          <StatCard
            icon={BookOpen}
            label="Code Quality"
            value={`${qualityScore}/100`}
            subtext={qualityScore >= 80 ? 'Excellent' : qualityScore >= 60 ? 'Good' : 'Improve'}
            color={qualityScore >= 60 ? 'bg-purple-500/20 text-purple-400' : 'bg-yellow-500/20 text-yellow-400'}
          />
        )}
        {securityScore === null && (
          <StatCard
            icon={Shield}
            label="Languages"
            value={Object.keys(report.lines_of_code?.by_language ?? {}).length}
            color="bg-green/20 text-green"
          />
        )}
        {qualityScore === null && (
          <StatCard
            icon={BookOpen}
            label="Concepts"
            value={report.top_5_concepts.length}
            subtext={`${completedGaps} mastered`}
            color="bg-purple-500/20 text-purple-400"
          />
        )}
      </div>
    </section>
  );
}
