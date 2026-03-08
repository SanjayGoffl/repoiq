'use client';

import { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import type { SecurityScore } from '@/lib/types';

interface Props {
  security: SecurityScore;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange';
  return 'text-red-400';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green/10 border-green/30';
  if (score >= 60) return 'bg-yellow-400/10 border-yellow-400/30';
  if (score >= 40) return 'bg-orange/10 border-orange/30';
  return 'bg-red-400/10 border-red-400/30';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Work';
  return 'Critical';
}

function getSeverityBadge(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high': return 'bg-orange/20 text-orange border-orange/30';
    case 'medium': return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
    case 'low': return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
    default: return 'bg-muted/20 text-muted border-muted/30';
  }
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    injection: 'Injection',
    auth: 'Authentication',
    data_exposure: 'Data Exposure',
    misconfiguration: 'Misconfiguration',
    dependency: 'Dependency',
    other: 'Other',
  };
  return labels[category] ?? category;
}

export function SecurityScoreCard({ security }: Props) {
  const [expanded, setExpanded] = useState(false);
  const criticalCount = security.findings.filter((f) => f.severity === 'critical' || f.severity === 'high').length;

  return (
    <section className="rounded-lg border border-border bg-navy-light overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          {security.overall >= 60 ? (
            <ShieldCheck className="h-5 w-5 text-green" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-orange" />
          )}
          <div>
            <h2 className="text-lg font-semibold text-white">Security Analysis</h2>
            <p className="text-sm text-muted">{security.summary}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Score circle */}
          <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${getScoreBg(security.overall)}`}>
            <div className="text-center">
              <span className={`text-lg font-bold ${getScoreColor(security.overall)}`}>
                {security.overall}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className={`text-sm font-medium ${getScoreColor(security.overall)}`}>
              {getScoreLabel(security.overall)}
            </span>
            {criticalCount > 0 && (
              <span className="text-xs text-red-400">
                {criticalCount} critical/high
              </span>
            )}
          </div>

          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted" />
          )}
        </div>
      </button>

      {/* Findings */}
      {expanded && security.findings.length > 0 && (
        <div className="border-t border-border px-5 pb-5">
          <div className="mt-4 flex flex-col gap-3">
            {security.findings.map((finding, i) => (
              <div
                key={`${finding.file}-${finding.line}-${i}`}
                className="rounded-md border border-border bg-navy p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getSeverityBadge(finding.severity)}`}>
                        {finding.severity}
                      </span>
                      <span className="text-xs text-muted">
                        {getCategoryLabel(finding.category)}
                      </span>
                    </div>
                    <p className="text-sm text-white">{finding.issue}</p>
                    <p className="mt-1 text-xs text-muted">
                      <Shield className="mr-1 inline h-3 w-3" />
                      {finding.file}:{finding.line}
                    </p>
                    <p className="mt-2 text-xs text-green/80">
                      Fix: {finding.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && security.findings.length === 0 && (
        <div className="border-t border-border p-5">
          <p className="text-sm text-green">No security issues found.</p>
        </div>
      )}
    </section>
  );
}
