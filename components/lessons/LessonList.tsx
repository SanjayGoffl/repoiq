'use client';

import { BookOpen, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Lesson } from '@/lib/types';

interface LessonListProps {
  lessons: Lesson[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const COMPLEXITY_COLORS = {
  beginner: 'bg-emerald-500/10 text-emerald-400',
  intermediate: 'bg-orange-500/10 text-orange-400',
  advanced: 'bg-red-500/10 text-red-400',
};

export function LessonList({ lessons, currentIndex, onSelect }: LessonListProps) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <BookOpen className="h-4 w-4 text-green" />
        Lessons ({lessons.length})
      </h3>

      {lessons.map((lesson, i) => (
        <button
          key={lesson.lesson_id ?? i}
          type="button"
          onClick={() => onSelect(i)}
          className={cn(
            'flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
            currentIndex === i
              ? 'bg-green/10 border border-green/30'
              : 'hover:bg-navy',
          )}
        >
          <span
            className={cn(
              'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
              currentIndex === i
                ? 'bg-green text-black'
                : 'bg-navy text-muted',
            )}
          >
            {i + 1}
          </span>

          <div className="flex-1 space-y-1">
            <p
              className={cn(
                'text-sm font-medium',
                currentIndex === i ? 'text-white' : 'text-muted',
              )}
            >
              {lesson.title}
            </p>
            <Badge
              className={cn(
                'text-[10px]',
                COMPLEXITY_COLORS[lesson.complexity_level],
              )}
            >
              {lesson.complexity_level}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  );
}
