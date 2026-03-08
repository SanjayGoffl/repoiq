'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Session, Gap } from '@/lib/types';
import { SESSION_POLL_INTERVAL } from '@/lib/constants';

interface UseSessionReturn {
  session: Session | undefined;
  gaps: Gap[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function useSession(sessionId: string | null): UseSessionReturn {
  const sessionQuery = useQuery<Session>({
    queryKey: ['session', sessionId],
    queryFn: () => {
      if (!sessionId) throw new Error('No session ID');
      return api.getSession(sessionId);
    },
    enabled: sessionId !== null,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return SESSION_POLL_INTERVAL;
      if (data.status === 'complete' || data.status === 'failed') return false;
      return SESSION_POLL_INTERVAL;
    },
  });

  const gapsQuery = useQuery<Gap[]>({
    queryKey: ['gaps', sessionId],
    queryFn: () => {
      if (!sessionId) throw new Error('No session ID');
      return api.getSessionGaps(sessionId);
    },
    enabled: sessionId !== null && sessionQuery.data?.status === 'complete',
  });

  return {
    session: sessionQuery.data,
    gaps: gapsQuery.data,
    isLoading: sessionQuery.isLoading,
    isError: sessionQuery.isError,
    error: sessionQuery.error,
  };
}
