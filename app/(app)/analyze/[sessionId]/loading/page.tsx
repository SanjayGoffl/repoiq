'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoadingProgress } from '@/components/analyze/LoadingProgress';
import { RepoFacts } from '@/components/analyze/RepoFacts';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSession } from '@/hooks/useSession';
import { ROUTES } from '@/lib/constants';
import { RotateCcw, Home } from 'lucide-react';

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

  // Network/polling error (couldn't reach our API)
  if (isError && !session) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-900/30">
          <Home className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Connection Lost</h2>
        <p className="max-w-md text-sm text-muted">
          We couldn&apos;t reach the server to check analysis status. This might be a temporary network issue.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push(ROUTES.ANALYZE)}
          >
            <Home className="h-4 w-4" />
            New Analysis
          </Button>
        </div>
      </div>
    );
  }

  const isFailed = session?.status === 'failed';

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-8 px-4">
      {/* Repo name header */}
      {session?.repo_name && (
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white">
            {isFailed ? 'Analysis Failed' : 'Analyzing Repository'}
          </h2>
          <p className="text-sm text-muted">{session.repo_name}</p>
        </div>
      )}

      <div className="w-full max-w-md">
        <LoadingProgress
          status={session?.status ?? 'ingesting'}
          fileCount={session?.file_count}
          statusDetail={session?.status_detail}
          estimatedSeconds={session?.estimated_seconds}
          errorCode={session?.error_code}
          errorMessage={session?.error_message}
          createdAt={session?.created_at}
        />
      </div>

      {/* Action buttons for failed state */}
      {isFailed && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push(ROUTES.ANALYZE)}
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}

      {/* Facts only when actively loading */}
      {!isFailed && session?.status !== 'complete' && (
        <div className="w-full max-w-lg">
          <RepoFacts />
        </div>
      )}
    </div>
  );
}
