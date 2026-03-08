'use client';

import * as React from 'react';
import type { Gap } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ConceptProgressProps {
  gaps: Gap[];
  currentConceptId: string;
}

export function ConceptProgress({ gaps, currentConceptId }: ConceptProgressProps) {
  const total = gaps.length;
  const currentIndex = gaps.findIndex((g) => g.gap_id === currentConceptId);
  const completedCount = gaps.filter((g) => g.understood).length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="space-y-3 border-b border-white/10 bg-navy px-4 py-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">
          Concept {currentIndex + 1} of {total}
        </span>
        <span className="text-xs text-muted">{progressPercent}%</span>
      </div>

      {/* Progress bar */}
      <Progress value={progressPercent} />

      {/* Concept dots */}
      <div className="flex items-center justify-center gap-2">
        {gaps.map((gap, index) => {
          const isCurrent = gap.gap_id === currentConceptId;
          const isCompleted = gap.understood;

          return (
            <span
              key={gap.gap_id}
              className={cn(
                'inline-block h-2.5 w-2.5 rounded-full transition-colors',
                isCompleted && 'bg-green',
                isCurrent && !isCompleted && 'animate-pulse bg-green/60',
                !isCompleted && !isCurrent && 'bg-muted/30'
              )}
              aria-label={`Concept ${index + 1}: ${
                isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
