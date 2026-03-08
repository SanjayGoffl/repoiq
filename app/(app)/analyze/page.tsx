'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RepoInputForm } from '@/components/analyze/RepoInputForm';
import { UpgradeBanner } from '@/components/shared/UpgradeBanner';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuota } from '@/hooks/useQuota';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import type { AnalyzeRequest, AnalyzeResponse } from '@/lib/types';

export default function AnalyzePage() {
  const router = useRouter();
  const { quota, isExceeded, isLoading: quotaLoading } = useQuota();

  const analyzeMutation = useMutation<AnalyzeResponse, Error, AnalyzeRequest>({
    mutationFn: (data) => api.analyzeRepo(data),
    onSuccess: (data) => {
      router.push(ROUTES.sessionLoading(data.session_id));
    },
  });

  const handleSubmit = (repoUrl: string) => {
    analyzeMutation.mutate({ repo_url: repoUrl });
  };

  if (quotaLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analyze a Repository</h1>
        <p className="text-sm text-muted">
          Paste a public GitHub URL and let AI find your knowledge gaps
        </p>
      </div>

      {isExceeded && (
        <UpgradeBanner
          quotaUsed={quota?.quota_used ?? 0}
          quotaLimit={quota?.quota_limit ?? 0}
        />
      )}

      <Card className="border-border bg-navy-light">
        <CardHeader>
          <CardTitle className="text-lg text-white">
            Repository URL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RepoInputForm
            onSubmit={handleSubmit}
            isLoading={analyzeMutation.isPending}
            isDisabled={isExceeded}
          />

          {analyzeMutation.isError && (
            <p className="mt-3 text-sm text-red-400">
              {analyzeMutation.error.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
