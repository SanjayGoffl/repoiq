'use client';

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  sessionId: string;
}

export function ShareButton({ sessionId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/analyze/${sessionId}/report`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="gap-1.5 print:hidden"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Share
        </>
      )}
    </Button>
  );
}
