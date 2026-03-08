'use client';

import { useState, useRef } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveCodeViewerProps {
  filePath: string;
  content: string;
  onLineSelect: (lineNumber: number, codeLine: string) => void;
  selectedLine: number | null;
}

export function InteractiveCodeViewer({
  filePath,
  content,
  onLineSelect,
  selectedLine,
}: InteractiveCodeViewerProps) {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lines = content.split('\n');
  const ext = filePath.split('.').pop() ?? '';

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-navy-light">
      {/* File header */}
      <div className="flex items-center gap-2 border-b border-border bg-navy px-3 py-2 text-xs text-muted">
        <span className="font-mono">{filePath}</span>
        <span className="ml-auto">{lines.length} lines</span>
      </div>

      {/* Code content */}
      <div
        ref={containerRef}
        className="max-h-[500px] overflow-auto font-mono text-xs"
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const isSelected = selectedLine === lineNum;
              const isHovered = hoveredLine === lineNum;

              return (
                <tr
                  key={lineNum}
                  className={cn(
                    'group cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-green/10'
                      : isHovered
                        ? 'bg-navy/50'
                        : 'hover:bg-navy/30',
                  )}
                  onMouseEnter={() => setHoveredLine(lineNum)}
                  onMouseLeave={() => setHoveredLine(null)}
                  onClick={() => onLineSelect(lineNum, line)}
                >
                  <td className="w-12 select-none border-r border-border px-2 py-0.5 text-right text-muted/50">
                    {lineNum}
                  </td>
                  <td className="relative px-3 py-0.5 whitespace-pre text-muted">
                    {line || '\u00A0'}
                    {/* Ask AI button on hover/select */}
                    {(isHovered || isSelected) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLineSelect(lineNum, line);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded bg-green px-2 py-0.5 text-[10px] font-medium text-black opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ opacity: isSelected ? 1 : undefined }}
                      >
                        <MessageSquare className="h-3 w-3" />
                        Ask AI
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
