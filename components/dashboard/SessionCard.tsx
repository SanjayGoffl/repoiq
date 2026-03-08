'use client';

import Link from 'next/link';
import { Calendar, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusLabel, getStatusColor, formatRelativeDate } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import type { Session } from '@/lib/types';

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const isComplete = session.status === 'complete';
  const isFailed = session.status === 'failed';
  const isInProgress = !isComplete && !isFailed;

  const href = isComplete
    ? ROUTES.sessionReport(session.session_id)
    : ROUTES.sessionLoading(session.session_id);

  return (
    <Link href={href} className="block">
      <Card className="transition-colors hover:border-green/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="truncate text-lg">
              {session.repo_name}
            </CardTitle>
            <Badge
              variant={
                isComplete
                  ? 'default'
                  : isFailed
                    ? 'destructive'
                    : 'secondary'
              }
              className={getStatusColor(session.status)}
            >
              {getStatusLabel(session.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {session.languages.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {session.languages.map((lang) => (
                <Badge key={lang} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {session.file_count} files
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatRelativeDate(session.created_at)}
            </span>
          </div>

          {isInProgress && (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
