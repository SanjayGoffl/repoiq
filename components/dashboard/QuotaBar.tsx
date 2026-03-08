'use client';

import { Progress } from '@/components/ui/progress';
import type { UserPlan } from '@/lib/types';

interface QuotaBarProps {
  quotaUsed: number;
  quotaLimit: number;
  plan: UserPlan;
}

export function QuotaBar({ quotaUsed, quotaLimit, plan }: QuotaBarProps) {
  if (plan === 'pro') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Analyses this month</span>
          <span className="font-medium text-green">Unlimited</span>
        </div>
        <Progress value={0} className="h-2" />
      </div>
    );
  }

  const percentage = quotaLimit > 0 ? (quotaUsed / quotaLimit) * 100 : 0;
  const isNearLimit = percentage >= 67 && percentage < 100;
  const isExceeded = quotaUsed >= quotaLimit;

  const indicatorColor = isExceeded
    ? '[&>div]:bg-red-500'
    : isNearLimit
      ? '[&>div]:bg-orange'
      : '';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">Analyses this month</span>
        <span
          className={
            isExceeded
              ? 'font-medium text-red-400'
              : isNearLimit
                ? 'font-medium text-orange'
                : 'font-medium text-white'
          }
        >
          {quotaUsed} of {quotaLimit} used
        </span>
      </div>
      <Progress
        value={Math.min(percentage, 100)}
        className={indicatorColor}
      />
    </div>
  );
}
