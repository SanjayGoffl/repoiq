'use client';

import { Flame, FileCode } from 'lucide-react';
import type { ComplexityMetric } from '@/lib/types';

interface Props {
  hotspots: ComplexityMetric[];
}

function getComplexityBadge(complexity: string): { bg: string; label: string } {
  switch (complexity) {
    case 'very_complex':
      return { bg: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Very Complex' };
    case 'complex':
      return { bg: 'bg-orange/20 text-orange border-orange/30', label: 'Complex' };
    case 'moderate':
      return { bg: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30', label: 'Moderate' };
    default:
      return { bg: 'bg-green/20 text-green border-green/30', label: 'Simple' };
  }
}

export function ComplexityHotspots({ hotspots }: Props) {
  if (hotspots.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-navy-light p-5">
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange" />
        <h2 className="text-lg font-semibold text-white">
          Complexity Hotspots
        </h2>
        <span className="text-sm text-muted">
          ({hotspots.length} functions need attention)
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hotspots.map((hotspot, i) => {
          const badge = getComplexityBadge(hotspot.complexity);
          return (
            <div
              key={`${hotspot.file}-${hotspot.function_name}-${i}`}
              className="rounded-md border border-border bg-navy p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <code className="text-sm font-mono text-white">
                  {hotspot.function_name}()
                </code>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-muted mb-1.5">{hotspot.reason}</p>
              <div className="flex items-center gap-1 text-xs text-muted/70">
                <FileCode className="h-3 w-3" />
                {hotspot.file}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
