'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isValidGitHubUrl } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface RepoInputFormProps {
  onSubmit: (repoUrl: string) => void;
  isLoading: boolean;
  isDisabled?: boolean;
}

export function RepoInputForm({
  onSubmit,
  isLoading,
  isDisabled = false,
}: RepoInputFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = url.trim();

    if (!trimmed) {
      setError('Please enter a GitHub repository URL.');
      return;
    }

    if (!isValidGitHubUrl(trimmed)) {
      setError(
        'Invalid GitHub URL. Use the format: https://github.com/owner/repo'
      );
      return;
    }

    setError(null);
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      <div className="space-y-2">
        <Input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError(null);
          }}
          placeholder="https://github.com/username/repository"
          className="h-12 text-base"
          disabled={isLoading || isDisabled}
          aria-invalid={!!error}
          aria-describedby={error ? 'repo-url-error' : undefined}
        />
        {error && (
          <p id="repo-url-error" className="text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isLoading || isDisabled}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Analyze My Code'
        )}
      </Button>
    </form>
  );
}
