"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, GitBranch, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { useEffect, useRef } from "react";

const CODE_LINES = [
  { indent: "", tokens: [{ t: "{", c: "#e5e2e1" }] },
  {
    indent: "  ",
    tokens: [
      { t: '"architecture"', c: "#adc6ff" },
      { t: ": ", c: "#e5e2e1" },
      { t: '"Next.js 14 + App Router"', c: "#ffb786" },
      { t: ",", c: "#e5e2e1" },
    ],
  },
  {
    indent: "  ",
    tokens: [
      { t: '"critical_concepts"', c: "#adc6ff" },
      { t: ": [", c: "#e5e2e1" },
    ],
  },
  {
    indent: "    ",
    tokens: [{ t: '"Server Components vs Client"', c: "#ddb7ff" }, { t: ",", c: "#e5e2e1" }],
  },
  {
    indent: "    ",
    tokens: [{ t: '"useEffect cleanup"', c: "#ddb7ff" }, { t: ",", c: "#e5e2e1" }],
  },
  {
    indent: "    ",
    tokens: [{ t: '"JWT token validation"', c: "#ddb7ff" }],
  },
  { indent: "  ", tokens: [{ t: "],", c: "#e5e2e1" }] },
  {
    indent: "  ",
    tokens: [
      { t: '"bugs_found"', c: "#ffb4ab" },
      { t: ": ", c: "#e5e2e1" },
      { t: "2", c: "#ffb4ab" },
      { t: ",", c: "#e5e2e1" },
    ],
  },
  {
    indent: "  ",
    tokens: [
      { t: '"knowledge_gaps"', c: "#adc6ff" },
      { t: ": ", c: "#e5e2e1" },
      { t: "7", c: "#ffb786" },
      { t: ",", c: "#e5e2e1" },
    ],
  },
  {
    indent: "  ",
    tokens: [
      { t: '"learning_path"', c: "#adc6ff" },
      { t: ": ", c: "#e5e2e1" },
      { t: '"4 weeks"', c: "#ddb7ff" },
    ],
  },
  { indent: "", tokens: [{ t: "}", c: "#e5e2e1" }] },
];

const STATS = [
  { label: "Repos Analyzed", value: "12,400+" },
  { label: "Concepts Taught", value: "840K+" },
  { label: "Bugs Surfaced", value: "95K+" },
];

export default function Hero() {
  const cursorRef = useRef<HTMLSpanElement>(null);

  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-28 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(180deg, #0e0e0e 0%, #131313 60%)" }}
    >
      {/* — Background glow layers — */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(173,198,255,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/4 top-1/2 -z-10 h-[600px] w-[600px] -translate-y-1/2 rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #ddb7ff 0%, transparent 70%)" }}
      />

      <div className="mx-auto max-w-7xl">
        {/* — Top badge — */}
        <div className="mb-8 flex justify-center">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ghost-border"
            style={{ background: "rgba(173,198,255,0.05)", color: "#adc6ff" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-powered repository intelligence</span>
            <span className="label-mono ml-1 text-[10px]">v2.0</span>
          </div>
        </div>

        {/* — Main grid — */}
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* — Left: Copy — */}
          <div className="flex flex-col gap-8">
            <h1
              className="text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-on-surface sm:text-5xl lg:text-6xl"
            >
              Your vibe-coded project.{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #adc6ff 0%, #4d8eff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Your personal&nbsp;AI teacher.
              </span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed sm:text-lg" style={{ color: "#c2c6d6" }}>
              You built it with AI — but can you explain it?{" "}
              <strong style={{ color: "#e5e2e1" }}>RepoIQ</strong> scans your repo, surfaces the
              concepts you skipped, the bugs you missed, and teaches you through Socratic dialogue
              until the code is truly yours.
            </p>

            {/* — Stats row — */}
            <div className="flex flex-wrap gap-6">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <span
                    className="font-mono text-xl font-semibold tracking-tight"
                    style={{ color: "#adc6ff" }}
                  >
                    {s.value}
                  </span>
                  <span className="label-mono">{s.label}</span>
                </div>
              ))}
            </div>

            {/* — CTA buttons — */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={ROUTES.DEMO}
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition-all duration-200 btn-primary-gradient"
              >
                Try a Sample Repo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={ROUTES.AUTH}
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold ghost-border-visible transition-all duration-200 btn-ghost-interactive"
                style={{ color: "#c2c6d6" }}
              >
                <GitBranch className="h-4 w-4" />
                Analyze My Repo
              </Link>
            </div>

            {/* — Trust line — */}
            <p className="label-mono flex items-center gap-1.5 text-[10px]">
              <Zap className="h-3 w-3" style={{ color: "#adc6ff" }} />
              Report generated in under 60 seconds · No credit card required
            </p>
          </div>

          {/* — Right: Code mockup terminal — */}
          <div
            className="relative rounded-lg overflow-hidden shadow-ambient animate-float"
            style={{ background: "#0e0e0e", border: "1px solid rgba(66,71,84,0.3)" }}
          >
            {/* Terminal chrome */}
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{ borderColor: "rgba(66,71,84,0.25)", background: "#1c1b1b" }}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ffb4ab" }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ffb786" }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#adc6ff" }} />
              </div>
              <span className="label-mono">repoiq-analysis.json</span>
              <div className="ai-insight-chip">AI · live</div>
            </div>

            {/* Line numbers + code */}
            <div className="overflow-x-auto p-5 scrollbar-thin">
              <pre className="text-sm leading-[1.75]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {CODE_LINES.map((line, li) => (
                  <div key={li} className="flex">
                    <span
                      className="mr-5 select-none w-5 text-right shrink-0"
                      style={{ color: "#424754", fontSize: "0.7rem" }}
                    >
                      {li + 1}
                    </span>
                    <span>
                      {line.indent}
                      {line.tokens.map((tok, ti) => (
                        <span key={ti} style={{ color: tok.c }}>
                          {tok.t}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </pre>
            </div>

            {/* Bottom status bar */}
            <div
              className="flex items-center justify-between px-4 py-2 border-t"
              style={{ borderColor: "rgba(66,71,84,0.2)", background: "#1c1b1b" }}
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full animate-pulse-slow" style={{ background: "#adc6ff" }} />
                <span className="label-mono text-[9px]">Analysis complete</span>
              </div>
              <span className="label-mono text-[9px]">0.8s · 47 files scanned</span>
            </div>

            {/* Glow overlay */}
            <div
              className="pointer-events-none absolute inset-0 rounded-lg"
              style={{
                background:
                  "radial-gradient(ellipse 60% 30% at 50% 0%, rgba(173,198,255,0.05) 0%, transparent 60%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
