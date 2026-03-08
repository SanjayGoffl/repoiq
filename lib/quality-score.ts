import type { Report } from '@/lib/types';

export type Grade = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';

export interface QualityScore {
  grade: Grade;
  score: number; // 0-100
  breakdown: {
    label: string;
    score: number; // 0-100
    weight: number;
  }[];
}

export function computeQualityScore(report: Report): QualityScore {
  const breakdown: QualityScore['breakdown'] = [];

  // 1. Bug severity score (30% weight)
  const bugs = report.bugs_found;
  const criticalCount = bugs.filter((b) => b.severity === 'critical').length;
  const highCount = bugs.filter((b) => b.severity === 'high').length;
  const mediumCount = bugs.filter((b) => b.severity === 'medium').length;
  const bugPenalty = criticalCount * 25 + highCount * 15 + mediumCount * 5;
  const bugScore = Math.max(0, 100 - bugPenalty);
  breakdown.push({ label: 'Bug Severity', score: bugScore, weight: 30 });

  // 2. Code structure score (25% weight)
  const fileCount = report.file_importance?.length ?? 0;
  const criticalFiles = report.file_importance?.filter((f) => f.category === 'critical').length ?? 0;
  const structureScore = fileCount > 0
    ? Math.min(100, 50 + (criticalFiles / fileCount) * 100)
    : 50;
  breakdown.push({ label: 'Code Structure', score: Math.round(structureScore), weight: 25 });

  // 3. Dependencies health (20% weight)
  const depCount = report.dependencies?.length ?? 0;
  const depScore = depCount > 50 ? 40 : depCount > 30 ? 60 : depCount > 15 ? 80 : 100;
  breakdown.push({ label: 'Dependencies', score: depScore, weight: 20 });

  // 4. Documentation & patterns (25% weight)
  const hasLessons = (report.lessons?.length ?? 0) > 0;
  const hasStack = !!report.stack_info;
  const hasRuntime = !!report.runtime_requirements;
  const patternScore = (hasLessons ? 40 : 0) + (hasStack ? 30 : 0) + (hasRuntime ? 30 : 0);
  breakdown.push({ label: 'Patterns & Docs', score: patternScore, weight: 25 });

  // Weighted total
  const totalScore = Math.round(
    breakdown.reduce((sum, b) => sum + (b.score * b.weight) / 100, 0)
  );

  const grade = scoreToGrade(totalScore);

  return { grade, score: totalScore, breakdown };
}

function scoreToGrade(score: number): Grade {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B+';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}
