'use client';

import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Report } from '@/lib/types';
import { computeQualityScore, type Grade } from '@/lib/quality-score';

const GRADE_COLORS: Record<Grade, string> = {
  'A+': 'text-emerald-400',
  A: 'text-emerald-400',
  'B+': 'text-green',
  B: 'text-yellow-400',
  C: 'text-orange-400',
  D: 'text-red-400',
  F: 'text-red-500',
};

const GRADE_BG: Record<Grade, string> = {
  'A+': 'bg-emerald-500/10 border-emerald-500/30',
  A: 'bg-emerald-500/10 border-emerald-500/30',
  'B+': 'bg-green/10 border-green/30',
  B: 'bg-yellow-500/10 border-yellow-500/30',
  C: 'bg-orange-500/10 border-orange-500/30',
  D: 'bg-red-500/10 border-red-500/30',
  F: 'bg-red-500/10 border-red-500/30',
};

const GRADE_MESSAGES: Record<Grade, string> = {
  'A+': 'Excellent code quality! This project follows best practices.',
  A: 'Great quality. Minor improvements possible.',
  'B+': 'Good quality with room for improvement.',
  B: 'Decent quality. Address the bugs and structure issues.',
  C: 'Needs work. Several issues to fix before production.',
  D: 'Poor quality. Significant bugs and structural problems.',
  F: 'Critical issues. Major refactoring needed.',
};

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

interface QualityScoreCardProps {
  report: Report;
}

export function QualityScoreCard({ report }: QualityScoreCardProps) {
  const { grade, score, breakdown } = computeQualityScore(report);

  // Find weakest and strongest areas
  const sorted = [...breakdown].sort((a, b) => a.score - b.score);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-white">Code Quality Score</h2>
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            {/* Grade badge */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 ${GRADE_BG[grade]}`}
              >
                <span className={`text-4xl font-bold ${GRADE_COLORS[grade]}`}>
                  {grade}
                </span>
              </div>
              <span className="text-sm font-medium text-white">{score}/100</span>
            </div>

            {/* Breakdown */}
            <div className="flex flex-1 flex-col gap-3">
              {breakdown.map((b) => (
                <div key={b.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">
                      {b.label} <span className="text-white/40">({b.weight}%)</span>
                    </span>
                    <span className={b.score >= 70 ? 'text-emerald-400' : b.score >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                      {b.score}/100
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-navy">
                    <div
                      className={`h-full rounded-full transition-all ${getBarColor(b.score)}`}
                      style={{ width: `${b.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3">
            <p className="text-xs text-muted">{GRADE_MESSAGES[grade]}</p>
            <div className="flex flex-wrap gap-3">
              {strongest && (
                <div className="flex items-center gap-1.5 text-xs">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-muted">Strongest:</span>
                  <span className="text-emerald-400">{strongest.label} ({strongest.score})</span>
                </div>
              )}
              {weakest && weakest.score < 70 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-muted">Needs work:</span>
                  <span className="text-orange-400">{weakest.label} ({weakest.score})</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
