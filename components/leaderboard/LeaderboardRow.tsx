import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BadgeDisplay } from '@/components/leaderboard/BadgeDisplay';
import type { Badge } from '@/lib/gamification';

interface LeaderboardRowProps {
  rank: number;
  repoName: string;
  xp: number;
  maxXP: number;
  conceptsMastered: number;
  totalConcepts: number;
  badges: Badge[];
}

const RANK_STYLES: Record<number, string> = {
  1: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  2: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  3: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export function LeaderboardRow({
  rank,
  repoName,
  xp,
  maxXP,
  conceptsMastered,
  totalConcepts,
  badges,
}: LeaderboardRowProps) {
  const rankStyle = RANK_STYLES[rank] ?? 'bg-navy text-muted border-border';
  const percentage = maxXP > 0 ? (xp / maxXP) * 100 : 0;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        {/* Rank */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${rankStyle}`}
        >
          {rank}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-medium text-white">{repoName}</span>
            <span className="shrink-0 text-sm font-semibold text-green">
              {xp} XP
            </span>
          </div>
          <Progress value={percentage} className="h-1.5" />
          <div className="flex items-center justify-between gap-2">
            <BadgeDisplay badges={badges} />
            <span className="shrink-0 text-xs text-muted">
              {conceptsMastered}/{totalConcepts} concepts
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
