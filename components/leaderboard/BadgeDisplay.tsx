import type { Badge } from '@/lib/gamification';

interface BadgeDisplayProps {
  badges: Badge[];
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <span
          key={badge.id}
          className="inline-flex items-center gap-1 rounded-full bg-navy px-2 py-0.5 text-xs text-muted"
          title={badge.label}
        >
          <span>{badge.icon}</span>
          {badge.label}
        </span>
      ))}
    </div>
  );
}
