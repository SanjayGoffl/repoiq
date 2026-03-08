'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAnalyze: () => void;
}

export function EmptyState({ onAnalyze }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-light">
        <Search className="h-8 w-8 text-muted" />
      </div>
      <h3 className="mt-6 text-xl font-semibold text-white">
        No analyses yet
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Paste a GitHub repo URL and let RepoIQ find the concepts you need to
        understand, bugs to fix, and a learning path tailored to your code.
      </p>
      <Button onClick={onAnalyze} size="lg" className="mt-6">
        Analyze your first repo
      </Button>
    </div>
  );
}
