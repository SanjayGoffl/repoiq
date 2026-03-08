'use client';

import Link from 'next/link';
import { Brain, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants';

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <Card className="w-full max-w-sm border-border bg-navy-light">
        <CardHeader className="flex flex-col items-center gap-4 pb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green/20">
            <Brain className="h-8 w-8 text-green" />
          </div>
          <CardTitle className="text-xl font-bold text-white">
            RepoIQ is now fully public!
          </CardTitle>
          <p className="text-sm text-muted">
            No login required. Start analyzing your code and learning instantly.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Button asChild size="lg" className="w-full gap-2">
            <Link href={ROUTES.ANALYZE}>
              Start Analyzing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href={ROUTES.DEMO}>View Demo</Link>
          </Button>

          <div className="text-center">
            <Link
              href={ROUTES.HOME}
              className="text-sm text-muted hover:text-white"
            >
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
