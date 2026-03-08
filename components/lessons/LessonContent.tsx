'use client';

import { FileText, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Lesson } from '@/lib/types';

interface LessonContentProps {
  lesson: Lesson;
  lessonNumber: number;
}

export function LessonContent({ lesson, lessonNumber }: LessonContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green text-sm font-bold text-black">
            {lessonNumber}
          </span>
          {lesson.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted">
          {lesson.description}
        </p>

        {/* Files covered */}
        {lesson.files_covered.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-white">
              <FileText className="h-3.5 w-3.5" />
              Files Covered
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lesson.files_covered.map((file) => (
                <Badge key={file} variant="secondary" className="font-mono text-xs">
                  {file}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Concepts */}
        {lesson.concepts_covered.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-white">
              <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />
              Concepts
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lesson.concepts_covered.map((concept) => (
                <Badge key={concept} className="bg-yellow-500/10 text-xs text-yellow-400">
                  {concept}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
