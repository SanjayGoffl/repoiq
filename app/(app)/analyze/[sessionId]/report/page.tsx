'use client';

import { useParams, useRouter } from 'next/navigation';
import { ReportHeader } from '@/components/report/ReportHeader';
import { ArchitectureSummary } from '@/components/report/ArchitectureSummary';
import { ConceptCard } from '@/components/report/ConceptCard';
import { BugCard } from '@/components/report/BugCard';
import { StartLearningCTA } from '@/components/report/StartLearningCTA';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/hooks/useSession';
import { ROUTES } from '@/lib/constants';
import type { Concept } from '@/lib/types';

export default function ReportPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;
  const { session, isLoading } = useSession(sessionId);

  const handleStartTeach = (concept: Concept) => {
    router.push(ROUTES.sessionTeach(sessionId));
  };

  if (isLoading || !session) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const report = session.report;

  if (!report) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted">No report available yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <ReportHeader
        repoName={session.repo_name}
        languages={session.languages}
        fileCount={session.file_count}
        createdAt={session.created_at}
      />

      {/* Architecture summary */}
      <ArchitectureSummary summary={report.architecture_summary} />

      {/* Concepts */}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-white">
          Top 5 Concepts You Must Understand
        </h2>
        <div className="flex flex-col gap-3">
          {report.top_5_concepts.map((concept, index) => (
            <ConceptCard
              key={concept.concept}
              concept={concept}
              index={index}
              onStartTeach={handleStartTeach}
            />
          ))}
        </div>
      </section>

      {/* Bugs */}
      {report.bugs_found.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-white">
            Bugs Found ({report.bugs_found.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {report.bugs_found.map((bug, index) => (
              <BugCard key={`${bug.file}-${bug.line}-${index}`} bug={bug} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <StartLearningCTA
        sessionId={sessionId}
        conceptCount={report.top_5_concepts.length}
      />
    </div>
  );
}
