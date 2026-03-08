'use client';

import * as React from 'react';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HintButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function HintButton({ onClick, disabled = false }: HintButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="shrink-0 gap-1.5 text-muted hover:text-white"
    >
      <Lightbulb className="h-4 w-4" />
      <span className="hidden sm:inline">Need a hint?</span>
    </Button>
  );
}
