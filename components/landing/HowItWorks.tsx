"use client";

import { Link2, FileText, MessageSquare, ChevronRight } from "lucide-react";

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    icon: <Link2 className="h-5 w-5" style={{ color: "#adc6ff" }} />,
    title: "Drop a GitHub URL",
    tag: "INGEST",
    description:
      "Paste any public repo link. We clone it, parse every file, and index it with our AI knowledge engine — no setup required.",
  },
  {
    number: 2,
    icon: <FileText className="h-5 w-5" style={{ color: "#ddb7ff" }} />,
    title: "Get your AI learning report",
    tag: "ANALYZE",
    description:
      "In under 60 seconds you get a full architecture summary, the concepts you likely can't explain, and real bugs found in your code.",
  },
  {
    number: 3,
    icon: <MessageSquare className="h-5 w-5" style={{ color: "#ffb786" }} />,
    title: "Learn through Socratic teaching",
    tag: "TEACH",
    description:
      "RepoIQ never gives you the answer. It asks targeted questions about YOUR code until you truly understand every concept.",
  },
];

const STEP_COLORS = [
  { accent: "#adc6ff", bg: "rgba(173,198,255,0.06)", border: "rgba(173,198,255,0.15)" },
  { accent: "#ddb7ff", bg: "rgba(221,183,255,0.06)", border: "rgba(221,183,255,0.15)" },
  { accent: "#ffb786", bg: "rgba(255,183,134,0.06)", border: "rgba(255,183,134,0.15)" },
];

export default function HowItWorks() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8" style={{ background: "#1c1b1b" }}>
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="label-mono mb-3">How it works</p>
          <h2
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "#e5e2e1", letterSpacing: "-0.025em" }}
          >
            Three steps to true understanding
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: "#c2c6d6" }}>
            From &ldquo;I built this with AI&rdquo; to &ldquo;I can explain every line&rdquo; —
            in under a minute.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {STEPS.map((step, index) => {
            const col = STEP_COLORS[index];
            return (
              <div
                key={step.number}
                className="group relative flex flex-1 flex-col gap-5 rounded-lg p-6 transition-all duration-300 hover-lift cursor-default"
                style={{
                  background: "#201f1f",
                  border: `1px solid ${col.border}`,
                }}
              >
                {/* Number + tag row */}
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold"
                    style={{
                      background: col.bg,
                      color: col.accent,
                      border: `1px solid ${col.border}`,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    0{step.number}
                  </span>
                  <span
                    className="label-mono text-[10px] px-2 py-0.5 rounded"
                    style={{ background: col.bg, color: col.accent }}
                  >
                    {step.tag}
                  </span>
                </div>

                {/* Icon */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-md"
                  style={{ background: col.bg }}
                >
                  {step.icon}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-semibold" style={{ color: "#e5e2e1" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#8c909f" }}>
                    {step.description}
                  </p>
                </div>

                {/* Connector arrow (desktop) */}
                {index < STEPS.length - 1 && (
                  <ChevronRight
                    className="absolute -right-3 top-1/2 hidden -translate-y-1/2 lg:block z-10"
                    style={{ color: col.accent }}
                    size={20}
                  />
                )}

                {/* Hover accent glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${col.bg} 0%, transparent 70%)`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
