'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Report } from '@/lib/types';
import { computeQualityScore, type Grade } from '@/lib/quality-score';

const GRADE_COLORS: Record<Grade, string> = {
  'A+': 'text-emerald-400',
  'A': 'text-emerald-400',
  'B+': 'text-green',
  'B': 'text-yellow-400',
  'C': 'text-orange-400',
  'D': 'text-red-400',
  'F': 'text-red-500',
};

const GRADE_BG: Record<Grade, string> = {
  'A+': 'bg-emerald-500/10 border-emerald-500/30',
  'A': 'bg-emerald-500/10 border-emerald-500/30',
  'B+': 'bg-green/10 border-green/30',
  'B': 'bg-yellow-500/10 border-yellow-500/30',
  'C': 'bg-orange-500/10 border-orange-500/30',
  'D': 'bg-red-500/10 border-red-500/30',
  'F': 'bg-red-500/10 border-red-500/30',
};

interface QualityScoreCardProps {
  report: Report;
}

export function QualityScoreCard({ report }: QualityScoreCardProps) {
  const { grade, score, breakdown } = computeQualityScore(report);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-white">Code Quality Score</h2>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6">
            {/* Grade badge */}
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 ${GRADE_BG[grade]}`}
            >
              <span className={`text-3xl font-bold ${GRADE_COLORS[grade]}`}>
                {grade}
              </span>
            </div>

            {/* Breakdown */}
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  Overall: {score}/100
                </span>
              </div>
              {breakdown.map((b) => (
                <div key={b.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">
                      {b.label} ({b.weight}%)
                    </span>
                    <span className="text-white">{b.score}</span>
                  </div>
                  <Progress value={b.score} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
