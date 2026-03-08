'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lightbulb } from 'lucide-react';
import { LOADING_FACTS } from '@/lib/constants';

export function RepoFacts() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const rotateFact = useCallback(() => {
    setIsVisible(false);

    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % LOADING_FACTS.length);
      setIsVisible(true);
    }, 300);

    return timeout;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      rotateFact();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [rotateFact]);

  const fact = LOADING_FACTS[currentIndex];

  if (!fact) return null;

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-navy-light p-4">
      <div className="flex items-start gap-3">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Did you know?
          </p>
          <p
            className={
              isVisible
                ? 'text-sm text-white transition-opacity duration-300'
                : 'text-sm text-white opacity-0 transition-opacity duration-300'
            }
          >
            {fact}
          </p>
        </div>
      </div>
    </div>
  );
}
