import { Navbar } from '@/components/layout/Navbar';
import Hero from '@/components/landing/Hero';
import PainPoints from '@/components/landing/PainPoints';
import HowItWorks from '@/components/landing/HowItWorks';
import DemoGif from '@/components/landing/DemoGif';
import { Separator } from '@/components/ui/separator';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <PainPoints />
        <HowItWorks />
        <DemoGif />
      </main>

      <Separator />

      <footer className="border-t border-border bg-navy-light px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 text-center">
          <p className="text-sm text-muted">
            Built for AI for Bharat Hackathon 2026
          </p>
          <p className="text-xs text-muted">
            Team Codeformers
          </p>
        </div>
      </footer>
    </div>
  );
}
