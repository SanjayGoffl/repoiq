import { Navbar } from '@/components/layout/Navbar';
import Hero from '@/components/landing/Hero';
import PainPoints from '@/components/landing/PainPoints';
import HowItWorks from '@/components/landing/HowItWorks';
import DemoGif from '@/components/landing/DemoGif';
import Link from 'next/link';
import { Brain, Github, ArrowRight, GitBranch } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#0e0e0e' }}>
      <Navbar />

      <main className="flex-1">
        <Hero />
        <PainPoints />
        <HowItWorks />
        <DemoGif />

        {/* ── CTA Banner ── */}
        <section
          className="px-4 py-20 sm:px-6 lg:px-8"
          style={{
            background: '#0e0e0e',
            borderTop: '1px solid rgba(66,71,84,0.12)',
          }}
        >
          <div className="mx-auto max-w-4xl text-center">
            <div
              className="relative overflow-hidden rounded-xl p-10 sm:p-14"
              style={{
                background: '#201f1f',
                border: '1px solid rgba(173,198,255,0.12)',
                boxShadow: '0 0 48px rgba(173,198,255,0.06)',
              }}
            >
              {/* Glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                  background:
                    'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(173,198,255,0.07) 0%, transparent 70%)',
                }}
              />

              <p className="label-mono mb-4" style={{ color: '#adc6ff' }}>
                Start learning today
              </p>
              <h2
                className="mb-4 text-3xl font-bold sm:text-4xl"
                style={{
                  color: '#e5e2e1',
                  letterSpacing: '-0.025em',
                }}
              >
                Your code. Truly understood.
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-base" style={{ color: '#c2c6d6' }}>
                Join 12,400+ developers who have transformed their AI-assisted code into genuine
                technical mastery — one conversation at a time.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={ROUTES.DEMO}
                  className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold btn-primary-gradient"
                >
                  Try a Sample Repo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={ROUTES.AUTH}
                  className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium ghost-border-visible transition-all duration-200 btn-ghost-interactive"
                  style={{ color: '#c2c6d6' }}
                >
                  <GitHub className="h-4 w-4" />
                  Connect GitHub
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-10"
        style={{
          background: '#0e0e0e',
          borderTop: '1px solid rgba(66,71,84,0.15)',
        }}
      >
        <div className="mx-auto max-w-7xl flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded"
              style={{ background: 'linear-gradient(135deg, #adc6ff 0%, #4d8eff 100%)' }}
            >
              <Brain className="h-3.5 w-3.5" style={{ color: '#002e6a' }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: '#e5e2e1' }}>
              RepoIQ
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 sm:items-end">
            <p className="label-mono text-[10px]">Built for AI for Bharat Hackathon 2026</p>
            <p className="label-mono text-[9px]" style={{ color: '#424754' }}>
              Team Codeformers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Inline GitHub icon (avoids import conflict)
function GitHub({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.385.6.113.793-.26.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
