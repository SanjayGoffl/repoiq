'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { InteractiveCodeViewer } from './InteractiveCodeViewer';
import { LineChat } from './LineChat';

interface CodeViewerPanelProps {
  sessionId: string;
  filePath: string;
  onClose: () => void;
}

export function CodeViewerPanel({
  sessionId,
  filePath,
  onClose,
}: CodeViewerPanelProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [selectedCodeLine, setSelectedCodeLine] = useState<string>('');

  useEffect(() => {
    setSelectedLine(null);
    setSelectedCodeLine('');
    setIsLoading(true);

    async function fetchFile() {
      try {
        const res = await fetch(`/api/session/${sessionId}/files`);
        if (res.ok) {
          const data = (await res.json()) as {
            files: { path: string; content: string }[];
          };
          const file = data.files.find((f) => f.path === filePath);
          setFileContent(file?.content ?? null);
        }
      } catch (err) {
        console.error('[CodeViewerPanel] Failed to fetch files:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFile();
  }, [sessionId, filePath]);

  const handleLineSelect = (lineNumber: number, codeLine: string) => {
    setSelectedLine(lineNumber);
    setSelectedCodeLine(codeLine);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-navy-light">
        <Loader2 className="h-5 w-5 animate-spin text-muted" />
      </div>
    );
  }

  if (!fileContent) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-navy-light">
        <p className="text-sm text-muted">File content not available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted">{filePath}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-muted hover:bg-navy hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <InteractiveCodeViewer
        filePath={filePath}
        content={fileContent}
        onLineSelect={handleLineSelect}
        selectedLine={selectedLine}
      />

      {selectedLine && (
        <LineChat
          sessionId={sessionId}
          filePath={filePath}
          lineNumber={selectedLine}
          codeLine={selectedCodeLine}
          onClose={() => setSelectedLine(null)}
        />
      )}
    </div>
  );
}
