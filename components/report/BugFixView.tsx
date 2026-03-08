import type { FixSuggestion } from '@/lib/types';

interface BugFixViewProps {
  fix: FixSuggestion;
}

export function BugFixView({ fix }: BugFixViewProps) {
  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Before */}
        <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3">
          <p className="mb-1.5 text-xs font-medium text-red-400">Before</p>
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-white/80">
            {fix.before}
          </pre>
        </div>

        {/* After */}
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
          <p className="mb-1.5 text-xs font-medium text-emerald-400">After</p>
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-white/80">
            {fix.after}
          </pre>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs text-muted">{fix.explanation}</p>
    </div>
  );
}
