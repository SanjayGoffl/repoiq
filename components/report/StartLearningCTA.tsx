import Link from 'next/link';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

interface StartLearningCTAProps {
  sessionId: string;
  conceptCount: number;
}

export function StartLearningCTA({
  sessionId,
  conceptCount,
}: StartLearningCTAProps) {
  return (
    <Card className="border-green/30 bg-green/5">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green/20">
          <GraduationCap className="h-6 w-6 text-green" />
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold text-white">
            Start Learning
          </h3>
          <p className="text-sm text-muted">
            {conceptCount} concept{conceptCount !== 1 ? 's' : ''} to master
            &mdash; prove you understand your own code.
          </p>
        </div>

        <Button asChild size="lg" className="gap-2">
          <Link href={ROUTES.sessionTeach(sessionId)}>
            Begin Teach Mode
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
