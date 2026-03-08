'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
  const [usages, setUsages] = useState<Usage[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
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
              <p className="text-sm text-muted">No usages found for &quot;{symbol}&quot;</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-green">
                  Found {usages.length} usage{usages.length !== 1 ? 's' : ''}
                </p>
                <div className="max-h-64 overflow-y-auto scrollbar-thin">
                  {usages.map((u, i) => (
                    <div
                      key={`${u.file}-${u.line}-${i}`}
                      className="flex items-start gap-2 border-b border-border py-2 last:border-0"
                    >
                      <code className="shrink-0 rounded bg-navy px-1.5 py-0.5 font-mono text-xs text-muted">
                        {u.file}:{u.line}
                      </code>
                      <code className="truncate font-mono text-xs text-white/70">
                        {u.code}
                      </code>
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
