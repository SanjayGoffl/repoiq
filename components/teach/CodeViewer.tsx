'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CodeViewerProps {
  code: string;
  fileName: string;
  highlightLines?: number[];
  language?: string;
}

export function CodeViewer({
  code,
  fileName,
  highlightLines = [],
  language = 'typescript',
}: CodeViewerProps) {
  const lines = code.split('\n');
  const highlightSet = new Set(highlightLines);

  return (
    <div className="flex h-full flex-col">
      {/* File name header */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-navy px-4 py-2">
        <span className="text-xs font-medium text-muted">{language}</span>
        <span className="text-xs text-white/40">/</span>
        <span className="truncate text-sm font-medium text-white">
          {fileName}
        </span>
      </div>

      {/* Code area */}
      <div className="flex-1 overflow-auto">
        <pre className="min-w-0 text-sm">
          <code>
            {lines.map((line, index) => {
              const lineNumber = index + 1;
              const isHighlighted = highlightSet.has(lineNumber);

              return (
                <div
                  key={lineNumber}
                  className={cn(
                    'flex',
                    isHighlighted &&
                      'border-l-2 border-green bg-green/10'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block w-12 shrink-0 select-none px-3 py-0.5 text-right font-mono text-xs',
                      isHighlighted ? 'text-green' : 'text-muted/50'
                    )}
                  >
                    {lineNumber}
                  </span>
                  <span className="flex-1 whitespace-pre py-0.5 pr-4 font-mono text-white/90">
                    {line}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
