'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface ReadmeOverviewProps {
  repoName: string;
  repoDescription?: string;
  readmeContent?: string;
}

export function ReadmeOverview({
  repoName,
  repoDescription,
  readmeContent,
}: ReadmeOverviewProps) {
  const [expanded, setExpanded] = useState(false);

  if (!readmeContent && !repoDescription) return null;

  // Extract a 2-3 line summary from README if no description
  const summary = repoDescription || extractSummary(readmeContent ?? '');

  return (
    <div className="rounded-lg border border-border bg-navy-light p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
          <BookOpen className="h-5 w-5 text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-white">About {repoName}</h2>
          {summary && (
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {summary}
            </p>
          )}

          {readmeContent && (
            <>
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Hide README
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Show full README
                  </>
                )}
              </button>

              {expanded && (
                <div className="mt-3 max-h-96 overflow-y-auto rounded-md border border-border bg-navy p-4">
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed text-gray-300">
                    {readmeContent}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Extract first 2-3 meaningful lines from README as a summary.
 * Skips headings, badges, blank lines.
 */
function extractSummary(readme: string): string {
  const lines = readme.split('\n');
  const meaningful: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    // Skip empty, headings, badges/images, HTML tags, dividers
    if (!line) continue;
    if (line.startsWith('#')) continue;
    if (line.startsWith('![') || line.startsWith('[![')) continue;
    if (line.startsWith('<') && line.endsWith('>')) continue;
    if (/^---+$/.test(line) || /^===+$/.test(line)) continue;
    if (line.startsWith('```')) continue;

    meaningful.push(line);
    if (meaningful.length >= 3) break;
  }

  return meaningful.join(' ').slice(0, 300);
}
