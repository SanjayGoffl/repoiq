'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitCompareArrows } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ComparisonView } from '@/components/compare/ComparisonView';
import { useAuth } from '@/hooks/useAuth';
import type { Session } from '@/lib/types';

export default function ComparePage() {
  const { user } = useAuth();
  const [sessionIdA, setSessionIdA] = useState('');
  const [sessionIdB, setSessionIdB] = useState('');

  const sessionsQuery = useQuery<Session[]>({
    queryKey: ['sessions', user?.userId || 'guest'],
    queryFn: async () => {
      const response = await fetch('/api/sessions', {
        headers: user ? { Authorization: `Bearer ${user.userId}` } : {},
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  const sessions = sessionsQuery.data ?? [];
  const completedSessions = sessions.filter((s) => s.status === 'complete');

  const sessionA = completedSessions.find((s) => s.session_id === sessionIdA);
  const sessionB = completedSessions.find((s) => s.session_id === sessionIdB);

  if (sessionsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-6 w-6 text-green" />
          <h1 className="text-2xl font-bold text-white">Compare Repos</h1>
        </div>
        <p className="mt-1 text-sm text-muted">
          Select two analyzed repos to compare side by side
        </p>
      </div>

      {/* Selectors */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sessionA" className="mb-1.5 block text-sm font-medium text-muted">
            Repository A
          </label>
          <select
            id="sessionA"
            value={sessionIdA}
            onChange={(e) => setSessionIdA(e.target.value)}
            className="w-full rounded-lg border border-border bg-navy-light px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-green"
          >
            <option value="">Select a repo...</option>
            {completedSessions.map((s) => (
              <option key={s.session_id} value={s.session_id} disabled={s.session_id === sessionIdB}>
                {s.repo_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sessionB" className="mb-1.5 block text-sm font-medium text-muted">
            Repository B
          </label>
          <select
            id="sessionB"
            value={sessionIdB}
            onChange={(e) => setSessionIdB(e.target.value)}
            className="w-full rounded-lg border border-border bg-navy-light px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-green"
          >
            <option value="">Select a repo...</option>
            {completedSessions.map((s) => (
              <option key={s.session_id} value={s.session_id} disabled={s.session_id === sessionIdA}>
                {s.repo_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison or empty state */}
      {sessionA && sessionB ? (
        <ComparisonView sessionA={sessionA} sessionB={sessionB} />
      ) : completedSessions.length < 2 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <GitCompareArrows className="mb-3 h-10 w-10 text-muted" />
            <p className="text-sm text-muted">
              You need at least 2 completed analyses to compare repos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <GitCompareArrows className="mb-3 h-10 w-10 text-muted" />
            <p className="text-sm text-muted">
              Select two repositories above to see the comparison.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
