'use client';

import { useState } from 'react';
import { Loader2, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';

interface ArchitectureDiagramProps {
  sessionId: string;
}

export function ArchitectureDiagram({ sessionId }: ArchitectureDiagramProps) {
  const [mermaidCode, setMermaidCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (mermaidCode) {
      setMermaidCode(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await api.generateDiagram(sessionId);
      setMermaidCode(result.mermaid_code);
    } catch {
      setError('Failed to generate diagram');
    } finally {
      setLoading(false);
    }
  };

  // Render mermaid using an image from mermaid.ink (no client-side JS lib needed)
  const mermaidImageUrl = mermaidCode
    ? `https://mermaid.ink/img/${btoa(mermaidCode)}`
    : null;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Architecture Diagram</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={loading}
          className="gap-1.5"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Network className="h-4 w-4" />
          )}
          {mermaidCode ? 'Hide Diagram' : 'Generate Diagram'}
        </Button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {mermaidCode && (
        <Card>
          <CardContent className="p-4">
            {mermaidImageUrl && (
              <div className="flex justify-center overflow-x-auto rounded-lg bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mermaidImageUrl}
                  alt="Architecture diagram"
                  className="max-w-full"
                  onError={() => setError('Diagram rendering failed — showing raw code below')}
                />
              </div>
            )}
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-muted hover:text-white">
                View Mermaid code
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-md bg-navy p-3 font-mono text-xs text-muted">
                {mermaidCode}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
