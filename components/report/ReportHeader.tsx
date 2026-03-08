'use client';

import { Calendar, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ExportPDFButton } from '@/components/report/ExportPDFButton';
import { formatDate } from '@/lib/utils';

interface ReportHeaderProps {
  repoName: string;
  languages: string[];
  fileCount: number;
  createdAt: string;
}

export function ReportHeader({
  repoName,
  languages,
  fileCount,
  createdAt,
}: ReportHeaderProps) {
  return (
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
          <span>{fileCount} files</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(createdAt)}</span>
        </div>
        <ExportPDFButton />
      </div>
    </div>
  );
}
