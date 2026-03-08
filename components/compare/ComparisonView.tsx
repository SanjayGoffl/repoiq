'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Session } from '@/lib/types';

interface ComparisonViewProps {
  sessionA: Session;
  sessionB: Session;
}

function StatRow({
  label,
  valueA,
  valueB,
}: {
  label: string;
  valueA: string | number;
  valueB: string | number;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-border py-3 text-sm last:border-0">
      <span className="font-medium text-muted">{label}</span>
      <span className="text-center text-white">{valueA}</span>
      <span className="text-center text-white">{valueB}</span>
    </div>
  );
}

export function ComparisonView({ sessionA, sessionB }: ComparisonViewProps) {
  const reportA = sessionA.report;
  const reportB = sessionB.report;

  if (!reportA || !reportB) {
    return <p className="text-muted">Both sessions must have completed reports.</p>;
  }

  const bugsA = reportA.bugs_found;
  const bugsB = reportB.bugs_found;
  const criticalA = bugsA.filter((b) => b.severity === 'critical').length;
  const criticalB = bugsB.filter((b) => b.severity === 'critical').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="grid grid-cols-3 gap-4 text-sm font-semibold">
        <span className="text-muted">Metric</span>
        <span className="text-center text-green">{sessionA.repo_name}</span>
        <span className="text-center text-green">{sessionB.repo_name}</span>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="p-4">
          <StatRow
            label="Files"
            valueA={sessionA.file_count}
            valueB={sessionB.file_count}
          />
          <StatRow
            label="Languages"
            valueA={sessionA.languages.join(', ') || '-'}
            valueB={sessionB.languages.join(', ') || '-'}
          />
          <StatRow
            label="Lines of Code"
            valueA={reportA.lines_of_code?.total ?? '-'}
            valueB={reportB.lines_of_code?.total ?? '-'}
          />
          <StatRow
            label="Total Bugs"
            valueA={bugsA.length}
            valueB={bugsB.length}
          />
          <StatRow
            label="Critical Bugs"
            valueA={criticalA}
            valueB={criticalB}
          />
          <StatRow
            label="Dependencies"
            valueA={reportA.dependencies?.length ?? '-'}
            valueB={reportB.dependencies?.length ?? '-'}
          />
          <StatRow
            label="Concepts"
            valueA={reportA.top_5_concepts.length}
            valueB={reportB.top_5_concepts.length}
          />
        </CardContent>
      </Card>

      {/* Stack comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[sessionA, sessionB].map((session) => (
          <Card key={session.session_id}>
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-green">
                {session.repo_name} — Stack
              </h3>
              {session.report?.stack_info ? (
                <div className="flex flex-col gap-2">
                  {session.report.stack_info.frameworks.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted">Frameworks:</span>
                      {session.report.stack_info.frameworks.map((f) => (
                        <Badge key={f} variant="secondary" className="text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {session.report.stack_info.libraries.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted">Libraries:</span>
                      {session.report.stack_info.libraries.map((l) => (
                        <Badge key={l} variant="secondary" className="text-xs">
                          {l}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {session.report.stack_info.databases.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted">Databases:</span>
                      {session.report.stack_info.databases.map((d) => (
                        <Badge key={d} variant="secondary" className="text-xs">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted">No stack info available</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Architecture comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[sessionA, sessionB].map((session) => (
          <Card key={session.session_id}>
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-semibold text-green">
                {session.repo_name} — Architecture
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                {session.report?.architecture_summary ?? 'No summary available'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
