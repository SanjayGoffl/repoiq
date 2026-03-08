'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2, Circle, FileText, Clock, AlertTriangle, Lock, Globe, Zap, WifiOff } from 'lucide-react';
import { LOADING_STEPS } from '@/lib/constants';
import type { SessionStatus, ErrorCode } from '@/lib/types';

interface LoadingProgressProps {
  status: SessionStatus;
  fileCount?: number;
  statusDetail?: string;
  estimatedSeconds?: number;
  errorCode?: ErrorCode;
  errorMessage?: string;
  createdAt?: string;
}

const STATUS_ORDER: readonly SessionStatus[] = [
  'ingesting',
  'indexing',
  'analyzing',
  'complete',
] as const;

function getStepState(
  stepKey: string,
  currentStatus: SessionStatus
): 'pending' | 'active' | 'complete' {
  const stepIndex = STATUS_ORDER.indexOf(stepKey as SessionStatus);
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  if (currentStatus === 'failed') {
    if (stepIndex < currentIndex || currentIndex === -1) return 'pending';
    return 'pending';
  }

  if (stepIndex < currentIndex) return 'complete';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
}

const ERROR_CONFIG: Record<ErrorCode, { icon: React.ReactNode; title: string; color: string }> = {
  PRIVATE_REPO: {
    icon: <Lock className="h-5 w-5" />,
    title: 'Private Repository',
    color: 'text-yellow-400 border-yellow-800 bg-yellow-900/20',
  },
  REPO_NOT_FOUND: {
    icon: <Globe className="h-5 w-5" />,
    title: 'Repository Not Found',
    color: 'text-red-400 border-red-800 bg-red-900/20',
  },
  EMPTY_REPO: {
    icon: <FileText className="h-5 w-5" />,
    title: 'No Code Files Found',
    color: 'text-orange-400 border-orange-800 bg-orange-900/20',
  },
  RATE_LIMITED: {
    icon: <Clock className="h-5 w-5" />,
    title: 'Rate Limited',
    color: 'text-blue-400 border-blue-800 bg-blue-900/20',
  },
  REPO_TOO_LARGE: {
    icon: <Zap className="h-5 w-5" />,
    title: 'Repository Too Large',
    color: 'text-orange-400 border-orange-800 bg-orange-900/20',
  },
  AI_FAILED: {
    icon: <AlertTriangle className="h-5 w-5" />,
    title: 'AI Analysis Failed',
    color: 'text-red-400 border-red-800 bg-red-900/20',
  },
  NETWORK_ERROR: {
    icon: <WifiOff className="h-5 w-5" />,
    title: 'Connection Error',
    color: 'text-red-400 border-red-800 bg-red-900/20',
  },
  UNKNOWN: {
    icon: <AlertTriangle className="h-5 w-5" />,
    title: 'Analysis Failed',
    color: 'text-red-400 border-red-800 bg-red-900/20',
  },
};

function getProgressPercent(status: SessionStatus): number {
  switch (status) {
    case 'ingesting': return 15;
    case 'indexing': return 40;
    case 'analyzing': return 70;
    case 'complete': return 100;
    case 'failed': return 0;
    default: return 0;
  }
}

function ElapsedTimer({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(createdAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return (
    <span className="tabular-nums">
      {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
    </span>
  );
}

export function LoadingProgress({
  status,
  fileCount,
  statusDetail,
  estimatedSeconds,
  errorCode,
  errorMessage,
  createdAt,
}: LoadingProgressProps) {
  const isFailed = status === 'failed';
  const isComplete = status === 'complete';
  const errConfig = errorCode ? ERROR_CONFIG[errorCode] : ERROR_CONFIG.UNKNOWN;

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Progress Steps */}
      {LOADING_STEPS.map((step) => {
        const state = getStepState(step.key, status);

        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              {state === 'complete' ? (
                <Check className="h-5 w-5 text-green" />
              ) : state === 'active' ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              ) : (
                <Circle className="h-5 w-5 text-muted/40" />
              )}
            </div>
            <div className="flex flex-col">
              <span
                className={
                  state === 'complete'
                    ? 'text-sm text-green'
                    : state === 'active'
                      ? 'text-sm font-medium text-white'
                      : 'text-sm text-muted/60'
                }
              >
                {step.label}
              </span>
              {/* Show live detail for active step */}
              {state === 'active' && statusDetail && (
                <span className="mt-0.5 text-xs text-muted/80">
                  {statusDetail}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Progress bar */}
      {!isFailed && !isComplete && (
        <div className="mt-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-1000 ease-out"
              style={{ width: `${getProgressPercent(status)}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-muted/60">
            {getProgressPercent(status)}%
          </p>
        </div>
      )}

      {/* Timer + ETA bar */}
      {!isFailed && !isComplete && createdAt && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-navy p-3">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Clock className="h-3.5 w-3.5" />
            <span>Elapsed: <ElapsedTimer createdAt={createdAt} /></span>
          </div>
          {estimatedSeconds && estimatedSeconds > 0 && (
            <div className="text-xs text-muted">
              Est. ~{estimatedSeconds < 60 ? `${estimatedSeconds}s` : `${Math.ceil(estimatedSeconds / 60)}m`}
            </div>
          )}
        </div>
      )}

      {/* File count badge */}
      {fileCount !== undefined && fileCount > 0 && !isFailed && (
        <div className="flex items-center gap-2 text-xs text-muted">
          <FileText className="h-3.5 w-3.5" />
          <span>{fileCount} files detected</span>
        </div>
      )}

      {/* Error display with specific error types */}
      {isFailed && (
        <div className={`mt-4 rounded-lg border p-4 ${errConfig.color}`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">{errConfig.icon}</div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{errConfig.title}</p>
              <p className="text-sm opacity-90">
                {errorMessage || 'Something went wrong while analyzing the repository.'}
              </p>
              {errorCode === 'PRIVATE_REPO' && (
                <p className="mt-2 text-xs opacity-70">
                  Tip: Make sure the repository visibility is set to &quot;Public&quot; in GitHub Settings → General → Danger Zone.
                </p>
              )}
              {errorCode === 'RATE_LIMITED' && (
                <p className="mt-2 text-xs opacity-70">
                  Tip: GitHub limits API requests. Wait 1-2 minutes and try again.
                </p>
              )}
              {errorCode === 'REPO_NOT_FOUND' && (
                <p className="mt-2 text-xs opacity-70">
                  Tip: Double-check the URL. The format should be https://github.com/owner/repo
                </p>
              )}
              {errorCode === 'EMPTY_REPO' && (
                <p className="mt-2 text-xs opacity-70">
                  Tip: We support .ts, .js, .py, .java, .go, .rs, .rb, .cpp, .c and 15+ other languages.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
