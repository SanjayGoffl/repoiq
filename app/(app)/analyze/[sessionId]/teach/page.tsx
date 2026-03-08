'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TeachLayout } from '@/components/teach/TeachLayout';
import { CodeViewer } from '@/components/teach/CodeViewer';
import { ChatWindow } from '@/components/teach/ChatWindow';
import { ChatInput } from '@/components/teach/ChatInput';
import { ConceptProgress } from '@/components/teach/ConceptProgress';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useSession';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TeachPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;
  const { user } = useAuth();
  const { session, gaps, isLoading } = useSession(sessionId);

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentGap = gaps?.[currentIndex];
  const conceptId = currentGap?.concept_name ?? '';
  const currentConcept = session?.report?.top_5_concepts[currentIndex];

  const {
    messages,
    sendMessage,
    sendHint,
    isLoading: chatLoading,
    conceptUnderstood,
    codeReference,
  } = useChat(
    sessionId,
    conceptId,
    user?.userId ?? 'guest',
    currentConcept?.first_question,
  );

  // Navigate to next concept when understood (instead of separate complete page)
  useEffect(() => {
    if (conceptUnderstood && currentGap && gaps) {
      // Mark the gap as understood via API
      void fetch(`/api/gaps/${currentGap.gap_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ understood: true }),
      });

      // Auto-advance to next concept after a short delay
      if (currentIndex < gaps.length - 1) {
        const timer = setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [conceptUnderstood, currentGap, currentIndex, gaps]);

  if (isLoading || !session || !gaps) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (gaps.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-white">No Concepts to Teach</h2>
        <p className="text-sm text-muted">
          The report has not generated any concepts yet.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push(ROUTES.sessionReport(sessionId))}
        >
          Back to Report
        </Button>
      </div>
    );
  }

  const codeContent = codeReference
    ? `// File: ${codeReference.file}\n// Lines: ${codeReference.lines.join(', ')}\n\n// Code content loaded from repository`
    : currentConcept
      ? `// File: ${currentConcept.file}\n// Lines: ${currentConcept.lines.join(', ')}\n\n// Code content loaded from repository`
      : '// Select a concept to view code';

  const codeFileName = codeReference?.file ?? currentConcept?.file ?? 'code';
  const highlightLines = codeReference?.lines ?? currentConcept?.lines ?? [];

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < gaps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Concept progress */}
      <ConceptProgress gaps={gaps} currentConceptId={conceptId} />

      {/* Navigation between concepts */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm text-muted">
          Concept {currentIndex + 1} of {gaps.length}:&nbsp;
          <span className="font-medium text-white">
            {currentGap?.concept_name}
          </span>
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === gaps.length - 1}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Teach layout: code + chat */}
      <TeachLayout
        codePanel={
          <CodeViewer
            code={codeContent}
            fileName={codeFileName}
            highlightLines={highlightLines}
          />
        }
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto">
            <ChatWindow messages={messages} isLoading={chatLoading} />
          </div>
          <div className="shrink-0 border-t border-border p-4">
            <ChatInput
              onSend={sendMessage}
              onHint={sendHint}
              disabled={chatLoading}
            />
          </div>
        </div>
      </TeachLayout>
    </div>
  );
}
