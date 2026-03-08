'use client';

import { useState } from 'react';
import { Copy, Check, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FixSuggestion } from '@/lib/types';

interface BugFixViewProps {
  fix: FixSuggestion;
}

export function BugFixView({ fix }: BugFixViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fix.after);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Before */}
        <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs font-medium text-red-400">Before (buggy)</span>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-white/80">
            {fix.before.split('\n').map((line, i) => (
              <span key={i} className="block border-l-2 border-red-500/30 pl-2">
                {line}
              </span>
            ))}
          </pre>
        </div>

        {/* After */}
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-400">After (fixed)</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 gap-1 px-2 text-xs text-emerald-400 hover:text-emerald-300"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-white/80">
            {fix.after.split('\n').map((line, i) => (
              <span key={i} className="block border-l-2 border-emerald-500/30 pl-2">
                {line}
              </span>
            ))}
          </pre>
        </div>
      </div>

      {/* Explanation */}
      <div className="flex items-start gap-2 rounded-md bg-navy p-2.5">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-400" />
        <p className="text-xs leading-relaxed text-muted">{fix.explanation}</p>
      </div>
    </div>
  );
}
