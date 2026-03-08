import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy to-navy-light px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-green/5 blur-3xl" />

      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left — copy */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green" />
              <span className="text-sm font-medium text-green">
                AI-powered code comprehension
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Your vibe-coded project.{" "}
              <span className="text-green">Your personal AI teacher.</span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              You built it with AI, but can you explain it? RepoIQ scans your
              repo, finds the concepts you skipped, the bugs you missed, and
              teaches you through Socratic dialogue — so the code is truly
              yours.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={ROUTES.DEMO}>
                  Try a Sample Repo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href={ROUTES.AUTH}>Analyze My Repo</Link>
              </Button>
            </div>
          </div>

          {/* Right — code mockup */}
          <div className="rounded-lg border border-border bg-navy p-1">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-bug-red" />
              <span className="h-2.5 w-2.5 rounded-full bg-orange" />
              <span className="h-2.5 w-2.5 rounded-full bg-green" />
              <span className="ml-3 text-xs text-muted">
                repoiq-report.json
              </span>
            </div>

            <div className="overflow-x-auto p-4 font-mono text-xs leading-6 sm:text-sm sm:leading-7">
              <pre className="text-muted">
                <code>
                  <span className="text-white">{"{"}</span>
                  {"\n"}
                  {"  "}<span className="text-green">{'"architecture"'}</span>
                  <span className="text-white">: </span>
                  <span className="text-orange">{'"Next.js 14 + App Router"'}</span>,{"\n"}
                  {"  "}<span className="text-green">{'"critical_concepts"'}</span>
                  <span className="text-white">: [</span>
                  {"\n"}
                  {"    "}<span className="text-orange">{'"Server Components vs Client"'}</span>,{"\n"}
                  {"    "}<span className="text-orange">{'"useEffect cleanup"'}</span>,{"\n"}
                  {"    "}<span className="text-orange">{'"JWT token validation"'}</span>
                  {"\n"}
                  {"  "}<span className="text-white">],</span>
                  {"\n"}
                  {"  "}<span className="text-bug-red">{'"bugs_found"'}</span>
                  <span className="text-white">: </span>
                  <span className="text-bug-red">2</span>,{"\n"}
                  {"  "}<span className="text-green">{'"learning_path"'}</span>
                  <span className="text-white">: </span>
                  <span className="text-orange">{'"4 weeks"'}</span>
                  {"\n"}
                  <span className="text-white">{"}"}</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
