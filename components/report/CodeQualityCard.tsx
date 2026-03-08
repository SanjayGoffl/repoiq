'use client';

import { useState } from 'react';
import { Award, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { CodeQuality } from '@/lib/types';

interface Props {
  quality: CodeQuality;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange';
  return 'text-red-400';
}

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-green';
  if (score >= 60) return 'bg-yellow-400';
  if (score >= 40) return 'bg-orange';
  return 'bg-red-400';
}

function getCoverageColor(coverage: string): string {
  switch (coverage) {
    case 'high': return 'text-green';
    case 'moderate': return 'text-yellow-400';
    case 'low': return 'text-orange';
    default: return 'text-red-400';
  }
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className={`text-sm font-medium ${getScoreColor(score)}`}>{score}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${getBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function CodeQualityCard({ quality }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="rounded-lg border border-border bg-navy-light overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <Award className="h-5 w-5 text-purple-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">Code Quality</h2>
            <p className="text-sm text-muted">
              Maintainability, readability, and patterns analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`text-2xl font-bold ${getScoreColor(quality.overall_score)}`}>
            {quality.overall_score}
            <span className="text-sm font-normal text-muted">/100</span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-5">
          {/* Score bars */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <ScoreBar label="Maintainability" score={quality.maintainability} />
              <ScoreBar label="Readability" score={quality.readability} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Test Coverage</span>
                <span className={`text-sm font-medium capitalize ${getCoverageColor(quality.test_coverage_estimate)}`}>
                  {quality.test_coverage_estimate}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Anti-patterns */}
              {quality.anti_patterns.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-orange">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Anti-Patterns Found
                  </h3>
                  <ul className="flex flex-col gap-1">
                    {quality.anti_patterns.map((pattern, i) => (
                      <li key={i} className="text-xs text-muted pl-5 relative before:absolute before:left-1.5 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-orange/60">
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strengths */}
              {quality.strengths.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-green">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Strengths
                  </h3>
                  <ul className="flex flex-col gap-1">
                    {quality.strengths.map((strength, i) => (
                      <li key={i} className="text-xs text-muted pl-5 relative before:absolute before:left-1.5 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-green/60">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
