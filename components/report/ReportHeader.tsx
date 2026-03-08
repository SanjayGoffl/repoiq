'use client';

import { Calendar, FileText, Database, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ExportPDFButton } from '@/components/report/ExportPDFButton';
import { ShareButton } from '@/components/report/ShareButton';
import { formatDate } from '@/lib/utils';
import type { RepoFetchStats } from '@/lib/types';

interface ReportHeaderProps {
  repoName: string;
  languages: string[];
  fileCount: number;
  createdAt: string;
  sessionId: string;
  fetchStats?: RepoFetchStats;
}

export function ReportHeader({
  repoName,
  languages,
  fileCount,
  createdAt,
  sessionId,
  fetchStats,
}: ReportHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {repoName}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {languages.map((lang) => (
              <Badge key={lang} variant="secondary">
                {lang}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>{fileCount} files analyzed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(createdAt)}</span>
          </div>
          <ExportPDFButton />
          <ShareButton sessionId={sessionId} />
        </div>
      </div>

      {/* Fetch stats banner */}
      {fetchStats && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-navy-light px-4 py-2.5 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-blue-400" />
            <span>
              <span className="font-medium text-white">{fetchStats.total_in_repo.toLocaleString()}</span> total files in repo
            </span>
          </div>
          <span className="text-border">|</span>
          <span>
            <span className="font-medium text-white">{fetchStats.code_files_found.toLocaleString()}</span> code files detected
          </span>
          <span className="text-border">|</span>
          <span>
            <span className="font-medium text-green">{fetchStats.files_fetched.toLocaleString()}</span> fetched for analysis
          </span>
          {fetchStats.skipped_large > 0 && (
            <>
              <span className="text-border">|</span>
              <span className="text-yellow-400">
                {fetchStats.skipped_large} skipped (too large)
              </span>
            </>
          )}
          {fetchStats.was_limited && (
            <>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1 text-orange">
                <Info className="h-3 w-3" />
                Limited to {fetchStats.limit_applied} files
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
