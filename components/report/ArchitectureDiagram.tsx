'use client';

import { useState, useCallback } from 'react';
import { Loader2, Network, Download, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type DiagramType = 'architecture' | 'data-flow' | 'dependency' | 'component';

const DIAGRAM_OPTIONS: { type: DiagramType; label: string; description: string }[] = [
  { type: 'architecture', label: 'Architecture', description: 'System layers & connections' },
  { type: 'data-flow', label: 'Data Flow', description: 'How data moves through the app' },
  { type: 'dependency', label: 'Dependencies', description: 'File import/dependency map' },
  { type: 'component', label: 'Components', description: 'UI component hierarchy' },
];

interface ArchitectureDiagramProps {
  sessionId: string;
}

export function ArchitectureDiagram({ sessionId }: ArchitectureDiagramProps) {
  const [mermaidCode, setMermaidCode] = useState<string | null>(null);
  const [activeDiagramType, setActiveDiagramType] = useState<DiagramType>('architecture');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async (type: DiagramType) => {
    setLoading(true);
    setError(null);
    setImgError(false);
    setActiveDiagramType(type);
    try {
      const res = await fetch('/api/diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, diagram_type: type }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMermaidCode(data.mermaid_code);
    } catch {
      setError('Failed to generate diagram');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const handleCopy = async () => {
    if (!mermaidCode) return;
    await navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!mermaidImageUrl) return;
    const link = document.createElement('a');
    link.href = mermaidImageUrl;
    link.download = `${activeDiagramType}-diagram.png`;
    link.click();
  };

  // Encode for mermaid.ink — use encodeURIComponent + base64 for unicode safety
  const mermaidImageUrl = mermaidCode
    ? `https://mermaid.ink/img/${btoa(unescape(encodeURIComponent(mermaidCode)))}`
    : null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Architecture Diagrams</h2>
        {mermaidCode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleGenerate(activeDiagramType)}
            disabled={loading}
            className="gap-1.5 text-xs text-muted"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        )}
      </div>

      {/* Diagram type selector */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {DIAGRAM_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            type="button"
            onClick={() => handleGenerate(opt.type)}
            disabled={loading}
            className={`flex flex-col items-start gap-0.5 rounded-lg border p-3 text-left transition-colors ${
              activeDiagramType === opt.type && mermaidCode
                ? 'border-green bg-green/10'
                : 'border-border bg-navy-light hover:border-green/50'
            } ${loading ? 'opacity-50' : ''}`}
          >
            <span className="text-sm font-medium text-white">{opt.label}</span>
            <span className="text-xs text-muted">{opt.description}</span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 p-8">
            <Loader2 className="h-5 w-5 animate-spin text-green" />
            <span className="text-sm text-muted">
              Generating {DIAGRAM_OPTIONS.find((o) => o.type === activeDiagramType)?.label.toLowerCase()} diagram...
            </span>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Diagram display */}
      {mermaidCode && !loading && (
        <Card>
          <CardContent className="p-4">
            {/* Rendered diagram */}
            {mermaidImageUrl && !imgError && (
              <div className="flex justify-center overflow-x-auto rounded-lg bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mermaidImageUrl}
                  alt={`${activeDiagramType} diagram`}
                  className="max-w-full"
                  onError={() => setImgError(true)}
                />
              </div>
            )}

            {/* Fallback: show raw code if image fails */}
            {imgError && (
              <div className="rounded-lg bg-navy p-4">
                <p className="mb-2 text-xs text-yellow-400">
                  Image rendering failed. You can paste this code into mermaid.live to view:
                </p>
                <pre className="overflow-x-auto font-mono text-xs text-muted">
                  {mermaidCode}
                </pre>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5 text-xs text-muted"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
              {!imgError && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-1.5 text-xs text-muted"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PNG
                </Button>
              )}
              <a
                href={`https://mermaid.live/edit#pako:${mermaidCode ? btoa(unescape(encodeURIComponent(JSON.stringify({ code: mermaidCode })))) : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs text-green hover:underline"
              >
                Open in Mermaid Live Editor
              </a>
            </div>

            {/* Collapsible raw code */}
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

      {/* Empty state */}
      {!mermaidCode && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <Network className="h-8 w-8 text-muted" />
            <p className="text-sm text-muted">
              Select a diagram type above to generate an AI-powered visualization
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
