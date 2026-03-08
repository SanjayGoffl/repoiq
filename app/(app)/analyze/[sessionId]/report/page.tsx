'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ReportHeader } from '@/components/report/ReportHeader';
import { ArchitectureSummary } from '@/components/report/ArchitectureSummary';
import { ArchitectureDiagram } from '@/components/report/ArchitectureDiagram';
import { StackDetection } from '@/components/report/StackDetection';
import { LinesOfCode } from '@/components/report/LinesOfCode';
import { DependenciesPanel } from '@/components/report/DependenciesPanel';
import { RuntimeInfo } from '@/components/report/RuntimeInfo';
import { UsageTracker } from '@/components/report/UsageTracker';
import { QualityScoreCard } from '@/components/report/QualityScoreCard';
import { LanguageSelector } from '@/components/report/LanguageSelector';
import { SpeakButton } from '@/components/report/SpeakButton';
import { ConceptCard } from '@/components/report/ConceptCard';
import { BugCard } from '@/components/report/BugCard';
import { FileTree } from '@/components/report/FileTree';
import { StartLearningCTA } from '@/components/report/StartLearningCTA';
import { CodeViewerPanel } from '@/components/codeviewer/CodeViewerPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/hooks/useSession';
import { ROUTES } from '@/lib/constants';
import type { Concept } from '@/lib/types';

export default function ReportPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;
  const { session, isLoading } = useSession(sessionId);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);

  const handleStartTeach = (concept: Concept) => {
    router.push(ROUTES.sessionTeach(sessionId));
  };

  const handleFileClick = (path: string) => {
    setSelectedFile(path);
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
        sessionId={sessionId}
      />

      {/* Code Quality Score */}
      <QualityScoreCard report={report} />

      {/* Architecture summary with language & voice controls */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Architecture</h2>
          <SpeakButton text={translatedSummary ?? report.architecture_summary} />
        </div>
        <ArchitectureSummary summary={translatedSummary ?? report.architecture_summary} />
        <LanguageSelector
          text={report.architecture_summary}
          onTranslated={(text) => setTranslatedSummary(text)}
        />
      </div>

      {/* Architecture Diagram */}
      <ArchitectureDiagram sessionId={sessionId} />

      {/* Enhanced Analysis Sections */}
      {report.stack_info && (
        <StackDetection stackInfo={report.stack_info} />
      )}

      {report.lines_of_code && (
        <LinesOfCode linesOfCode={report.lines_of_code} />
      )}

      {report.dependencies && report.dependencies.length > 0 && (
        <DependenciesPanel dependencies={report.dependencies} />
      )}

      {report.runtime_requirements && (
        <RuntimeInfo runtime={report.runtime_requirements} />
      )}

      {/* Interactive File Explorer & Code Viewer */}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-white">
          Project Files
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <FileTree
            files={report.file_importance?.map((f) => f.path) ?? []}
            conceptFiles={report.top_5_concepts.map((c) => c.file)}
            fileImportance={report.file_importance}
            onFileClick={handleFileClick}
          />
          {selectedFile && (
            <CodeViewerPanel
              sessionId={sessionId}
              filePath={selectedFile}
              onClose={() => setSelectedFile(null)}
            />
          )}
        </div>
      </section>

      {/* Code Usage Tracker */}
      <UsageTracker sessionId={sessionId} />

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
              <BugCard key={`${bug.file}-${bug.line}-${index}`} bug={bug} sessionId={sessionId} />
            ))}
          </div>
        </section>
      )}

      {/* Lessons CTA */}
      {report.lessons && report.lessons.length > 0 && (
        <section className="rounded-lg border border-border bg-navy-light p-6 text-center">
          <h2 className="text-lg font-semibold text-white">
            Structured Lessons ({report.lessons.length})
          </h2>
          <p className="mt-1 text-sm text-muted">
            Learn the codebase step-by-step with AI-guided lessons
          </p>
          <button
            type="button"
            onClick={() => router.push(`/analyze/${sessionId}/lessons`)}
            className="mt-4 rounded-lg bg-green px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-green/90"
          >
            Start Lessons
          </button>
        </section>
      )}

      {/* Quiz CTA */}
      <section className="rounded-lg border border-border bg-navy-light p-6 text-center">
        <h2 className="text-lg font-semibold text-white">Test Your Knowledge</h2>
        <p className="mt-1 text-sm text-muted">
          Take an AI-generated quiz to test your understanding of this codebase
        </p>
        <button
          type="button"
          onClick={() => router.push(`/analyze/${sessionId}/quiz`)}
          className="mt-4 rounded-lg bg-yellow-500 px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-400"
        >
          Start Quiz
        </button>
      </section>

      {/* CTA */}
      <StartLearningCTA
        sessionId={sessionId}
        conceptCount={report.top_5_concepts.length}
      />
    </div>
  );
}
