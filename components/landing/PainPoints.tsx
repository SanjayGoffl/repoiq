"use client";

import { Brain, Bug, HelpCircle, TrendingUp, Users, Sliders } from "lucide-react";

interface PainPoint {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
}

const PAIN_POINTS: PainPoint[] = [
  {
    icon: <Brain className="h-5 w-5" />,
    iconBg: "rgba(173,198,255,0.12)",
    title: "Can't explain your own code",
    tag: "COMPREHENSION",
    tagColor: "#adc6ff",
    description:
      "Students build apps with AI but can't explain the architecture. In interviews and code reviews, that gap is exposed instantly.",
  },
  {
    icon: <Bug className="h-5 w-5" />,
    iconBg: "rgba(255,180,171,0.12)",
    title: "Hidden bugs you don't know about",
    tag: "SECURITY",
    tagColor: "#ffb4ab",
    description:
      "Real security and performance bugs lurk in AI-generated code — missing auth checks, N+1 queries, memory leaks — all invisible until production.",
  },
  {
    icon: <HelpCircle className="h-5 w-5" />,
    iconBg: "rgba(255,183,134,0.12)",
    title: "No idea what to learn first",
    tag: "DIRECTION",
    tagColor: "#ffb786",
    description:
      "Without knowing what you don't know, you can't ask the right questions. You're stuck in tutorial hell with no clear priority.",
  },
];

const NEW_FEATURES = [
  {
    icon: <TrendingUp className="h-5 w-5" />,
    iconBg: "rgba(173,198,255,0.10)",
    iconColor: "#adc6ff",
    title: "Analytics Dashboard",
    description:
      "Track your learning velocity, knowledge gap trends, and code quality improvements over time with rich visual insights.",
    badge: "NEW",
    badgeColor: "#adc6ff",
  },
  {
    icon: <Users className="h-5 w-5" />,
    iconBg: "rgba(221,183,255,0.10)",
    iconColor: "#ddb7ff",
    title: "Team Collaboration",
    description:
      "Share repo analyses with teammates, conduct group code reviews, and build shared knowledge maps across your organization.",
    badge: "BETA",
    badgeColor: "#ddb7ff",
  },
  {
    icon: <Sliders className="h-5 w-5" />,
    iconBg: "rgba(255,183,134,0.10)",
    iconColor: "#ffb786",
    title: "Custom AI Personas",
    description:
      "Customize your AI teacher's Socratic style — choose between mentor, interviewer, or peer-review mode to match your learning preference.",
    badge: "SOON",
    badgeColor: "#ffb786",
  },
];

export default function PainPoints() {
  return (
    <>
      {/* ── Pain points section ── */}
      <section
        className="px-4 py-24 sm:px-6 lg:px-8"
        style={{
          background: "#131313",
          borderTop: "1px solid rgba(66,71,84,0.12)",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="label-mono mb-3">The problem</p>
            <h2
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: "#e5e2e1", letterSpacing: "-0.025em" }}
            >
              The vibe-coding trap
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: "#c2c6d6" }}>
              AI writes your code in minutes. But what did you actually learn?
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {PAIN_POINTS.map((point) => (
              <div
                key={point.title}
                className="group relative flex flex-col gap-4 rounded-lg p-6 transition-all duration-300 hover-lift"
                style={{
                  background: "#1c1b1b",
                  border: "1px solid rgba(66,71,84,0.2)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-md"
                    style={{ background: point.iconBg, color: point.tagColor }}
                  >
                    {point.icon}
                  </div>
                  <span
                    className="label-mono text-[9px] px-2 py-0.5 rounded"
                    style={{
                      background: `${point.iconBg}`,
                      color: point.tagColor,
                    }}
                  >
                    {point.tag}
                  </span>
                </div>
                <div>
                  <h3
                    className="mb-2 text-sm font-semibold"
                    style={{ color: "#e5e2e1" }}
                  >
                    {point.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#8c909f" }}>
                    {point.description}
                  </p>
                </div>
                {/* Subtle hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${point.iconBg} 0%, transparent 70%)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── New feature modules section ── */}
      <section
        className="px-4 py-24 sm:px-6 lg:px-8"
        style={{
          background: "#0e0e0e",
          borderTop: "1px solid rgba(66,71,84,0.12)",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="label-mono mb-3">New modules</p>
            <h2
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: "#e5e2e1", letterSpacing: "-0.025em" }}
            >
              Built for teams & growth
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: "#c2c6d6" }}>
              RepoIQ goes beyond individual learning — with analytics, collaboration, and
              customization built for scale.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {NEW_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group relative flex flex-col gap-5 rounded-lg p-7 transition-all duration-300 hover-lift cursor-default"
                style={{
                  background: "#201f1f",
                  border: `1px solid rgba(66,71,84,0.25)`,
                }}
              >
                {/* Icon + Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-md"
                    style={{
                      background: feature.iconBg,
                      color: feature.iconColor,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <span
                    className="label-mono text-[9px] px-2 py-0.5 rounded-sm"
                    style={{
                      background: feature.iconBg,
                      color: feature.badgeColor,
                    }}
                  >
                    {feature.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-semibold" style={{ color: "#e5e2e1" }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#8c909f" }}>
                    {feature.description}
                  </p>
                </div>

                {/* Top border accent on hover */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${feature.iconColor}, transparent)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
