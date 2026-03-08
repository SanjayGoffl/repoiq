'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RepoInputForm } from '@/components/analyze/RepoInputForm';
import { UpgradeBanner } from '@/components/shared/UpgradeBanner';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuota } from '@/hooks/useQuota';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import type { AnalyzeRequest, AnalyzeResponse } from '@/lib/types';
import type { SkillLevel } from '@/components/analyze/RepoInputForm';

export default function AnalyzePage() {
  const router = useRouter();
  const { quota, isExceeded, isLoading: quotaLoading } = useQuota();
  const toastShown = useRef(false);

  useEffect(() => {
    if (toastShown.current) return;
    const seen = sessionStorage.getItem('repoiq_file_info_seen');
    if (!seen) {
      toast.info('Supported file types', {
        description:
          'We analyze up to 50 code files (.ts, .tsx, .js, .jsx, .py, .java, .go, .rs, .rb, .c, .cpp, .cs, .php, .swift, .kt, .vue, .svelte, .html, .css, .scss, .sql, .sh, .yaml, .json, .toml, .md). Folders like node_modules, .git, dist, and build are skipped. Repos with more files still work — we pick the most relevant ones.',
        duration: 8000,
      });
      sessionStorage.setItem('repoiq_file_info_seen', '1');
    }
    toastShown.current = true;
  }, []);

  const analyzeMutation = useMutation<AnalyzeResponse, Error, AnalyzeRequest>({
    mutationFn: (data) => api.analyzeRepo(data),
    onSuccess: (data) => {
      router.push(ROUTES.sessionLoading(data.session_id));
    },
    onError: (error) => {
      // If the API returned a session_id (error happened mid-analysis), redirect to loading page
      // so the user sees the detailed error there
      const apiErr = error as import('@/lib/api').ApiError;
      const sessionId = apiErr.body?.session_id as string | undefined;
      if (sessionId) {
        router.push(ROUTES.sessionLoading(sessionId));
        return;
      }
      // Otherwise show inline error (validation errors, etc.)
    },
  });

  const handleSubmit = (repoUrl: string, skillLevel: SkillLevel) => {
    analyzeMutation.mutate({ repo_url: repoUrl, skill_level: skillLevel });
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
