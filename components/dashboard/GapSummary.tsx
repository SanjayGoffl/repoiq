'use client';

import { Progress } from '@/components/ui/progress';

interface GapSummaryProps {
  totalConcepts: number;
  understoodConcepts: number;
}

export function GapSummary({
  totalConcepts,
  understoodConcepts,
}: GapSummaryProps) {
  const percentage =
    totalConcepts > 0 ? (understoodConcepts / totalConcepts) * 100 : 0;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-navy-light p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">
          Concepts Mastered
        </span>
        <span className="text-sm font-semibold text-green">
          {understoodConcepts} of {totalConcepts}
        </span>
      </div>
      <Progress value={percentage} className="h-2.5" />
      <p className="text-xs text-muted">
        {percentage >= 100
          ? 'All concepts mastered — great work!'
          : `${totalConcepts - understoodConcepts} concepts remaining across all sessions`}
      </p>
    </div>
  );
}
