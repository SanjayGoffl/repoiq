'use client';

import { useParams, useRouter } from 'next/navigation';
import { ConceptCompleteScreen } from '@/components/shared/ConceptCompleteScreen';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSession } from '@/hooks/useSession';
import { ROUTES } from '@/lib/constants';

export default function ConceptCompletePage() {
  const params = useParams<{ sessionId: string; conceptId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;
  const conceptId = params.conceptId;
  const { session, gaps, isLoading } = useSession(sessionId);

  if (isLoading || !gaps) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentGap = gaps.find((g) => g.gap_id === conceptId);
  const currentIndex = gaps.findIndex((g) => g.gap_id === conceptId);
  const isLastConcept = currentIndex === gaps.length - 1;

  const handleNext = () => {
    if (isLastConcept) {
      // All concepts done — go to learning path
      router.push(ROUTES.sessionPath(sessionId));
    } else {
      // Go back to teach mode (next concept)
      router.push(ROUTES.sessionTeach(sessionId));
    }
  };

  return (
    <ConceptCompleteScreen
      conceptName={currentGap?.concept_name ?? 'Unknown Concept'}
      score={currentGap?.score ?? 100}
      attempts={currentGap?.attempts ?? 0}
      onNext={handleNext}
      isLastConcept={isLastConcept}
    />
  );
}
