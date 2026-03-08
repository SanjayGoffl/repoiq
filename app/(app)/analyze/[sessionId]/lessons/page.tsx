'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { LessonList } from '@/components/lessons/LessonList';
import { LessonContent } from '@/components/lessons/LessonContent';
import { LessonChat } from '@/components/lessons/LessonChat';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/hooks/useSession';
import type { Lesson } from '@/lib/types';

export default function LessonsPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;
  const { session, isLoading } = useSession(sessionId);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading || !session) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  const report = session.report;
  const rawLessons = report?.lessons ?? [];

  // Normalize lessons from AI output (may have `order` instead of full Lesson fields)
  const lessons: Lesson[] = rawLessons.map((l, i) => ({
    lesson_id: l.lesson_id ?? `lesson-${i}`,
    session_id: sessionId,
    order_index: l.order_index ?? i,
    title: l.title,
    description: l.description,
    files_covered: l.files_covered ?? [],
    concepts_covered: l.concepts_covered ?? [],
    complexity_level: l.complexity_level ?? 'beginner',
  }));

  if (lessons.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted">No lessons available for this repository.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-green hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Report
        </button>
      </div>
    );
  }

  const currentLesson = lessons[currentIndex]!;

  return (
    <div className="flex flex-col gap-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex w-fit items-center gap-2 text-sm text-muted hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Report
      </button>

      <h1 className="text-2xl font-bold text-white">
        {session.repo_name} — Lessons
      </h1>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-lg border border-border bg-navy-light p-4">
          <LessonList
            lessons={lessons}
            currentIndex={currentIndex}
            onSelect={setCurrentIndex}
          />
        </aside>

        {/* Main content */}
        <div className="flex flex-col gap-4">
          <LessonContent
            lesson={currentLesson}
            lessonNumber={currentIndex + 1}
          />

          <LessonChat
            sessionId={sessionId}
            lessonTitle={currentLesson.title}
            lessonDescription={currentLesson.description}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-white disabled:opacity-30"
            >
              Previous Lesson
            </button>
            <span className="text-xs text-muted">
              {currentIndex + 1} / {lessons.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) => Math.min(lessons.length - 1, prev + 1))
              }
              disabled={currentIndex === lessons.length - 1}
              className="rounded-lg bg-green px-4 py-2 text-sm font-medium text-black disabled:opacity-30"
            >
              Next Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
