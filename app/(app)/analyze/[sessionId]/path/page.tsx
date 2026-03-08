'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSession } from '@/hooks/useSession';
import { ROUTES } from '@/lib/constants';
import {
  BookOpen,
  CheckCircle,
  Circle,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';

export default function LearningPathPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;
  const { session, gaps, isLoading } = useSession(sessionId);

  if (isLoading || !session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const report = session.report;
  const learningPath = report?.learning_path ?? [];
  const understoodCount = gaps?.filter((g) => g.understood).length ?? 0;
  const totalCount = gaps?.length ?? 0;
  const progressPercent = totalCount > 0 ? (understoodCount / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(ROUTES.sessionReport(sessionId))}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Report
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Learning Path</h1>
          <p className="text-sm text-muted">
            Your personalized week-by-week study plan for{' '}
            <span className="text-white">{session.repo_name}</span>
          </p>
        </div>
      </div>

      {/* Overall progress */}
      <Card className="border-border bg-navy-light">
        <CardContent className="flex flex-col gap-3 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green" />
              <span className="text-sm font-medium text-white">
                Overall Concept Mastery
              </span>
            </div>
            <span className="text-sm text-muted">
              {understoodCount}/{totalCount} concepts
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Weekly cards */}
      <div className="flex flex-col gap-4">
        {learningPath.map((item) => {
          // Determine if concept for this week is completed
          const relatedGap = gaps?.find(
            (g) =>
              g.concept_name.toLowerCase().includes(item.focus.toLowerCase()) ||
              item.focus.toLowerCase().includes(g.concept_name.toLowerCase()),
          );
          const isComplete = relatedGap?.understood ?? false;

          return (
            <Card
              key={item.week}
              className="border-border bg-navy-light"
            >
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green/20">
                  {isComplete ? (
                    <CheckCircle className="h-5 w-5 text-green" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base text-white">
                      Week {item.week}
                    </CardTitle>
                    {isComplete && (
                      <Badge
                        variant="outline"
                        className="border-green/50 text-green"
                      >
                        Completed
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium text-white">
                    {item.focus}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pl-18 pb-4">
                <div className="ml-14 flex items-start gap-2">
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                  <p className="text-sm text-muted">{item.reason}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {learningPath.length === 0 && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-muted">
            No learning path available. Complete the analysis first.
          </p>
        </div>
      )}
    </div>
  );
}
