'use client';

import { Check, Loader2, Circle, FileText } from 'lucide-react';
import { LOADING_STEPS } from '@/lib/constants';
import type { SessionStatus } from '@/lib/types';

interface LoadingProgressProps {
  status: SessionStatus;
  fileCount?: number;
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
    // Mark steps before the failure as complete, current as error-like
    if (stepIndex < currentIndex || currentIndex === -1) return 'pending';
    return 'pending';
  }

  if (stepIndex < currentIndex) return 'complete';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
}

export function LoadingProgress({ status, fileCount }: LoadingProgressProps) {
  const isFailed = status === 'failed';

  return (
    <div className="w-full max-w-md space-y-4">
      {LOADING_STEPS.map((step) => {
        const state = getStepState(step.key, status);

        return (
          <div key={step.key} className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              {state === 'complete' ? (
                <Check className="h-5 w-5 text-green" />
              ) : state === 'active' ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              ) : (
                <Circle className="h-5 w-5 text-muted/40" />
              )}
            </div>
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
          </div>
        );
      })}

      {isFailed && (
        <div className="mt-4 rounded-lg border border-red-800 bg-red-900/20 p-3">
          <p className="text-sm text-red-400">
            Analysis failed. Please try again or use a different repository.
          </p>
        </div>
      )}

      {fileCount !== undefined && fileCount > 0 && !isFailed && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted">
          <FileText className="h-3.5 w-3.5" />
          <span>{fileCount} files detected</span>
        </div>
      )}
    </div>
  );
}
