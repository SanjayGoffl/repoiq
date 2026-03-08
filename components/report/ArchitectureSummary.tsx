import { Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ArchitectureSummaryProps {
  summary: string;
}

export function ArchitectureSummary({ summary }: ArchitectureSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-green" />
          Architecture Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="leading-relaxed text-muted">{summary}</p>
      </CardContent>
    </Card>
  );
}
