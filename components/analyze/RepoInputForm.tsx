'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isValidGitHubUrl } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

interface RepoInputFormProps {
  onSubmit: (repoUrl: string, skillLevel: SkillLevel) => void;
  isLoading: boolean;
  isDisabled?: boolean;
}

export function RepoInputForm({
  onSubmit,
  isLoading,
  isDisabled = false,
}: RepoInputFormProps) {
  const [url, setUrl] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
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
    onSubmit(trimmed, skillLevel);
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
      {/* Skill Level Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted">Your skill level</label>
        <div className="grid grid-cols-3 gap-2">
          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSkillLevel(level)}
              disabled={isLoading || isDisabled}
              className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                skillLevel === level
                  ? 'border-green bg-green/10 text-green'
                  : 'border-border bg-navy text-muted hover:border-green/50 hover:text-white'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
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
