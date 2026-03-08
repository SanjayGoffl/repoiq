'use client';

import { useState } from 'react';
import { Search, Loader2, FileCode2, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Usage {
  file: string;
  line: number;
  code: string;
}

interface UsageTrackerProps {
  sessionId: string;
}

export function UsageTracker({ sessionId }: UsageTrackerProps) {
  const [symbol, setSymbol] = useState('');
  const [searchedSymbol, setSearchedSymbol] = useState('');
  const [usages, setUsages] = useState<Usage[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
    setSearchedSymbol(symbol.trim());
    try {
      const res = await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, symbol: symbol.trim() }),
      });
      const data = await res.json();
      setUsages(data.usages ?? []);
    } catch {
      setUsages([]);
    } finally {
      setLoading(false);
    }
  };

  // Group usages by file
  const groupedByFile: Record<string, Usage[]> = {};
  if (usages) {
    for (const u of usages) {
      if (!groupedByFile[u.file]) groupedByFile[u.file] = [];
      groupedByFile[u.file]!.push(u);
    }
  }

  const fileCount = Object.keys(groupedByFile).length;

  // Highlight the search term in code
  const highlightCode = (code: string) => {
    if (!searchedSymbol) return code;
    const parts = code.split(new RegExp(`(${searchedSymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g'));
    return parts.map((part, i) =>
      part === searchedSymbol ? (
        <span key={i} className="rounded bg-yellow-500/30 px-0.5 text-yellow-300">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-white">Code Usage Tracker</h2>
      <p className="text-xs text-muted">
        Search where any function, component, or variable is used across the project
      </p>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="e.g. useState, fetchData, UserCard..."
          className="flex-1"
          disabled={loading}
        />
        <Button type="submit" size="sm" disabled={loading || !symbol.trim()} className="gap-1.5">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </Button>
      </form>

      {usages !== null && (
        <Card>
          <CardContent className="p-4">
            {usages.length === 0 ? (
              <p className="text-sm text-muted">
                No usages found for &quot;{searchedSymbol}&quot;
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Summary */}
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Hash className="h-3 w-3" />
                    {usages.length} usage{usages.length !== 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <FileCode2 className="h-3 w-3" />
                    {fileCount} file{fileCount !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Grouped by file */}
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {Object.entries(groupedByFile).map(([file, fileUsages]) => (
                    <div key={file} className="mb-3 last:mb-0">
                      <div className="sticky top-0 flex items-center gap-1.5 bg-card py-1">
                        <FileCode2 className="h-3.5 w-3.5 text-green" />
                        <span className="font-mono text-xs font-medium text-green">{file}</span>
                        <span className="text-xs text-muted">({fileUsages.length})</span>
                      </div>
                      {fileUsages.map((u, i) => (
                        <div
                          key={`${u.line}-${i}`}
                          className="flex items-start gap-2 border-l-2 border-border py-1.5 pl-3 hover:border-green/50"
                        >
                          <span className="shrink-0 font-mono text-xs text-muted/60 tabular-nums">
                            L{u.line}
                          </span>
                          <code className="font-mono text-xs text-white/70">
                            {highlightCode(u.code)}
                          </code>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
