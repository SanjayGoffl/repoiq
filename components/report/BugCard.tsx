import { AlertTriangle } from 'lucide-react';
import type { Bug } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn, getSeverityColor } from '@/lib/utils';

interface BugCardProps {
  bug: Bug;
}

export function BugCard({ bug }: BugCardProps) {
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

        <code className="rounded bg-navy px-2 py-1 font-mono text-xs text-muted">
          {bug.file}:{bug.line}
        </code>
      </CardContent>
    </Card>
  );
}
