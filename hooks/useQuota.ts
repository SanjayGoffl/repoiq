'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { QuotaResponse } from '@/lib/types';

interface UseQuotaReturn {
  quota: QuotaResponse | undefined;
  isLoading: boolean;
  isExceeded: boolean;
  remaining: number;
}

export function useQuota(): UseQuotaReturn {
  const query = useQuery<QuotaResponse>({
    queryKey: ['quota'],
    queryFn: () => api.getQuota(),
    staleTime: 30_000, // 30 seconds
  });

  const quota = query.data;
  const isExceeded = quota ? quota.quota_used >= quota.quota_limit : false;
  const remaining = quota ? quota.quota_limit - quota.quota_used : 0;

  return {
    quota,
    isLoading: query.isLoading,
    isExceeded,
    remaining,
  };
}
