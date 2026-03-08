'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuotaBar } from '@/components/dashboard/QuotaBar';
import { SessionCard } from '@/components/dashboard/SessionCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { GapSummary } from '@/components/dashboard/GapSummary';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useQuota } from '@/hooks/useQuota';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import type { Session, Gap } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isGuest } = useAuth();

  const { quota, isLoading: quotaLoading } = useQuota();

  const sessionsQuery = useQuery<Session[]>({
    queryKey: ['sessions', user?.userId || 'guest'],
    queryFn: async () => {
      // Fetch sessions from API endpoint
      // The backend will determine whether to fetch authenticated or guest sessions
      const response = await fetch('/api/sessions', {
        headers: user ? { Authorization: `Bearer ${user.userId}` } : {},
      });

      if (!response.ok) {
        if (response.status === 404) {
          return []; // No sessions yet
        }
        throw new Error('Failed to fetch sessions');
      }

      return response.json();
    },
  });

  const gapsQuery = useQuery<Gap[]>({
    queryKey: ['all-gaps', user?.userId || 'guest'],
    queryFn: async () => {
      // Fetch gaps from all completed sessions
      const completedSessions = (sessionsQuery.data ?? []).filter(
        (s) => s.status === 'complete',
      );
      if (completedSessions.length === 0) return [];
      const allGaps = await Promise.all(
        completedSessions.map((s) => api.getSessionGaps(s.session_id)),
      );
      return allGaps.flat();
    },
    enabled: !!sessionsQuery.data,
  });

  const sessions = sessionsQuery.data ?? [];
  const gaps = gapsQuery.data ?? [];
  const totalConcepts = gaps.length;
  const understoodConcepts = gaps.filter((g) => g.understood).length;

  const handleAnalyze = () => {
    router.push(ROUTES.ANALYZE);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-muted">
            {isGuest
              ? 'Your analysis sessions (stored in AWS DynamoDB)'
              : 'Your analyzed repositories and learning progress'}
          </p>
        </div>
        <Button onClick={handleAnalyze} className="gap-2">
          <Plus className="h-4 w-4" />
          Analyze New Repo
        </Button>
      </div>

      {/* Quota bar */}
      {quotaLoading ? (
        <Skeleton className="h-16 w-full rounded-lg" />
      ) : quota ? (
        <QuotaBar
          quotaUsed={quota.quota_used}
          quotaLimit={quota.quota_limit}
          plan={quota.plan}
        />
      ) : null}

      {/* Gap summary */}
      {totalConcepts > 0 && (
        <GapSummary
          totalConcepts={totalConcepts}
          understoodConcepts={understoodConcepts}
        />
      )}

      {/* Sessions grid */}
      {sessionsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState onAnalyze={handleAnalyze} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard key={session.session_id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
