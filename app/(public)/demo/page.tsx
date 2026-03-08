import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import DemoGif from '@/components/landing/DemoGif';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export default function DemoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              See RepoIQ in Action
            </h1>
            <p className="max-w-2xl text-lg text-muted">
              Below is a sample analysis of a real repository. Sign up to
              analyze your own code and start learning.
            </p>
          </div>

          <div className="mt-10">
            <DemoGif />
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-muted">
              Ready to understand your own codebase?
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href={ROUTES.AUTH}>
                Sign Up & Analyze Your Repo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
