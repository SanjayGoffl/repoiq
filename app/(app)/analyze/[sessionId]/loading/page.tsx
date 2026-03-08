'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoadingProgress } from '@/components/analyze/LoadingProgress';
import { RepoFacts } from '@/components/analyze/RepoFacts';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSession } from '@/hooks/useSession';
import { ROUTES } from '@/lib/constants';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function LoadingPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;
  const { session, isLoading, isError } = useSession(sessionId);

  useEffect(() => {
    if (session?.status === 'complete') {
      router.push(ROUTES.sessionReport(sessionId));
    }
  }, [session?.status, sessionId, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || session?.status === 'failed') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-900/30">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Analysis Failed</h2>
        <p className="max-w-md text-sm text-muted">
          Something went wrong while analyzing the repository. This could be due
          to a private repo, too many files, or a temporary error.
        </p>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => router.push(ROUTES.ANALYZE)}
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-8 px-4">
      <div className="w-full max-w-md">
        <LoadingProgress
          status={session?.status ?? 'ingesting'}
          fileCount={session?.file_count}
        />
      </div>

      <div className="w-full max-w-lg">
        <RepoFacts />
      </div>
    </div>
  );
}
