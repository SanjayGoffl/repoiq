'use client';

import { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpeakButtonProps {
  text: string;
}

export function SpeakButton({ text }: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleSpeak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const truncated = text.length > 3000 ? text.slice(0, 3000) : text;
    const utterance = new SpeechSynthesisUtterance(truncated);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;

    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  // Check if browser supports speech synthesis
  if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSpeak}
      className="gap-1.5 text-xs text-muted hover:text-white print:hidden"
      title={speaking ? 'Stop reading' : 'Read aloud'}
    >
      {speaking ? (
        <VolumeX className="h-3.5 w-3.5" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
      {speaking ? 'Stop' : 'Listen'}
    </Button>
  );
}
