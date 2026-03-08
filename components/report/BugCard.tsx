'use client';

import { useState } from 'react';
import { AlertTriangle, Wand2, Loader2 } from 'lucide-react';
import type { Bug, FixSuggestion } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BugFixView } from '@/components/report/BugFixView';
import { cn, getSeverityColor } from '@/lib/utils';
import { api } from '@/lib/api';

interface BugCardProps {
  bug: Bug;
  sessionId: string;
}

export function BugCard({ bug, sessionId }: BugCardProps) {
  const [fix, setFix] = useState<FixSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShowFix = async () => {
    if (fix) {
      setFix(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await api.getFixSuggestion({
        session_id: sessionId,
        file_path: bug.file,
        line: bug.line,
        issue: bug.issue,
        severity: bug.severity,
      });
      setFix(result);
    } catch {
      setError('Failed to generate fix');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
            <p className="text-sm text-white">{bug.issue}</p>
          </div>
          <Badge
            className={cn(
              'shrink-0 capitalize',
              getSeverityColor(bug.severity)
            )}
          >
            {bug.severity}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <code className="rounded bg-navy px-2 py-1 font-mono text-xs text-muted">
            {bug.file}:{bug.line}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowFix}
            disabled={loading}
            className="gap-1.5 text-xs text-green hover:text-green/80"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5" />
            )}
            {fix ? 'Hide Fix' : 'Show Fix'}
          </Button>
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        {fix && <BugFixView fix={fix} />}
      </CardContent>
    </Card>
  );
}
