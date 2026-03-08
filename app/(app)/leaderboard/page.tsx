'use client';

import { useQuery } from '@tanstack/react-query';
import { Trophy, Zap, BookOpen, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LeaderboardRow } from '@/components/leaderboard/LeaderboardRow';
import { computeSessionXP, computeBadges } from '@/lib/gamification';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Session, Gap } from '@/lib/types';

interface RankedSession {
  session: Session;
  gaps: Gap[];
  xp: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();

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

  // Fetch gaps for all completed sessions
  const gapsQuery = useQuery<RankedSession[]>({
    queryKey: ['leaderboard-gaps', completedSessions.map((s) => s.session_id)],
    queryFn: async () => {
      const results = await Promise.allSettled(
        completedSessions.map(async (session) => {
          const gaps = await api.getSessionGaps(session.session_id);
          return {
            session,
            gaps,
            xp: computeSessionXP(gaps),
          };
        }),
      );

      return results
        .filter((r): r is PromiseFulfilledResult<RankedSession> => r.status === 'fulfilled')
        .map((r) => r.value)
        .sort((a, b) => b.xp - a.xp);
    },
    enabled: completedSessions.length > 0,
  });

  const ranked = gapsQuery.data ?? [];
  const maxXP = ranked.length > 0 ? (ranked[0]?.xp ?? 1) : 1;

  if (sessionsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-400" />
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        </div>
        <p className="mt-1 text-sm text-muted">
          Your learning progress ranked by XP across all analyzed repos
        </p>
      </div>

      {/* Stats overview */}
      {ranked.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Zap, label: 'Total XP', value: ranked.reduce((s, r) => s + r.xp, 0), color: 'text-yellow-400' },
            { icon: BookOpen, label: 'Repos Analyzed', value: completedSessions.length, color: 'text-blue-400' },
            { icon: Target, label: 'Concepts Mastered', value: ranked.reduce((s, r) => s + r.gaps.filter((g) => g.understood).length, 0), color: 'text-emerald-400' },
            { icon: Trophy, label: 'Total Badges', value: ranked.reduce((s, r) => s + computeBadges(r.session, r.gaps).length, 0), color: 'text-purple-400' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-3">
                <stat.icon className={`h-5 w-5 shrink-0 ${stat.color}`} />
                <div>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* XP Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted">
        <span>Concept understood = 100 XP</span>
        <span>Concept attempted = 25 XP</span>
        <span>All mastered bonus = 500 XP</span>
      </div>

      {/* Ranked list */}
      {ranked.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-navy-light p-12 text-center">
          <Trophy className="mb-3 h-10 w-10 text-muted" />
          <p className="text-sm text-muted">
            {completedSessions.length === 0
              ? 'No completed analyses yet. Analyze a repo to start earning XP!'
              : 'Start learning concepts in teach mode to earn XP!'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ranked.map((item, index) => (
            <LeaderboardRow
              key={item.session.session_id}
              rank={index + 1}
              repoName={item.session.repo_name}
              xp={item.xp}
              maxXP={maxXP}
              conceptsMastered={item.gaps.filter((g) => g.understood).length}
              totalConcepts={item.gaps.length}
              badges={computeBadges(item.session, item.gaps)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
