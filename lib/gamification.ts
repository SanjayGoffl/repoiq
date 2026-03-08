import type { Session, Gap } from '@/lib/types';

export interface Badge {
  id: string;
  label: string;
  icon: string; // emoji
}

export function computeSessionXP(gaps: Gap[]): number {
  let xp = 0;
  for (const gap of gaps) {
    if (gap.understood) xp += 100;
    else if (gap.attempts > 0) xp += 25;
  }
  // Completion bonus: all concepts understood
  if (gaps.length >= 5 && gaps.every((g) => g.understood)) {
    xp += 500;
  }
  return xp;
}

export function computeBadges(session: Session, gaps: Gap[]): Badge[] {
  const badges: Badge[] = [];
  const report = session.report;

  if (!report) return badges;

  // Scholar: all 5 concepts understood
  if (gaps.length >= 5 && gaps.every((g) => g.understood)) {
    badges.push({ id: 'scholar', label: 'Scholar', icon: '🎓' });
  }

  // Bug Hunter: 3+ bugs found in repo
  if (report.bugs_found.length >= 3) {
    badges.push({ id: 'bug-hunter', label: 'Bug Hunter', icon: '🐛' });
  }

  // Clean Code: 0 critical bugs
  if (report.bugs_found.every((b) => b.severity !== 'critical')) {
    badges.push({ id: 'clean-code', label: 'Clean Code', icon: '✨' });
  }

  // Full Stack: 3+ frameworks detected
  if (report.stack_info && report.stack_info.frameworks.length >= 3) {
    badges.push({ id: 'full-stack', label: 'Full Stack', icon: '🚀' });
  }

  // First Steps: at least 1 concept attempted
  if (gaps.some((g) => g.attempts > 0)) {
    badges.push({ id: 'first-steps', label: 'First Steps', icon: '👣' });
  }

  return badges;
}
