"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import {
  TrendingUp,
  BarChart3,
  Activity,
  GitCommit,
  Target,
  Clock,
  Zap,
  Trophy,
} from "lucide-react";

const METRIC_CARDS = [
  {
    label: "Total Analyses",
    value: "47",
    delta: "+12 this month",
    icon: <BarChart3 className="h-5 w-5" />,
    color: "#adc6ff",
    bg: "rgba(173,198,255,0.08)",
  },
  {
    label: "Concepts Mastered",
    value: "134",
    delta: "+23 this week",
    icon: <Target className="h-5 w-5" />,
    color: "#ddb7ff",
    bg: "rgba(221,183,255,0.08)",
  },
  {
    label: "Bugs Surfaced",
    value: "29",
    delta: "Across 12 repos",
    icon: <Activity className="h-5 w-5" />,
    color: "#ffb4ab",
    bg: "rgba(255,180,171,0.08)",
  },
  {
    label: "Learning Streak",
    value: "14 days",
    delta: "Personal best!",
    icon: <Trophy className="h-5 w-5" />,
    color: "#ffb786",
    bg: "rgba(255,183,134,0.08)",
  },
];

const RECENT_ACTIVITY = [
  { repo: "next-auth-starter", action: "Analyzed", concepts: 8, bugs: 2, time: "2h ago", color: "#adc6ff" },
  { repo: "ecommerce-app", action: "Lesson completed", concepts: 3, bugs: 0, time: "1d ago", color: "#ddb7ff" },
  { repo: "chat-gpt-clone", action: "Analyzed", concepts: 12, bugs: 5, time: "3d ago", color: "#ffb786" },
  { repo: "todo-fullstack", action: "Quiz passed", concepts: 5, bugs: 1, time: "5d ago", color: "#adc6ff" },
];

const TOPIC_BREAKDOWN = [
  { topic: "React Hooks", mastered: 8, total: 10, color: "#adc6ff" },
  { topic: "JWT Auth", mastered: 4, total: 8, color: "#ddb7ff" },
  { topic: "API Design", mastered: 6, total: 9, color: "#ffb786" },
  { topic: "Database Queries", mastered: 2, total: 7, color: "#ffb4ab" },
  { topic: "TypeScript", mastered: 9, total: 11, color: "#adc6ff" },
];

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen" style={{ background: "#131313" }}>
      <Sidebar />

      <div className="flex flex-1 flex-col">
        {/* Page header */}
        <div
          className="border-b px-8 py-6"
          style={{
            background: "#1c1b1b",
            borderColor: "rgba(66,71,84,0.2)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4" style={{ color: "#adc6ff" }} />
                <span className="label-mono text-[10px]" style={{ color: "#adc6ff" }}>
                  ANALYTICS
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#e5e2e1" }}>
                Learning Analytics
              </h1>
              <p className="mt-1 text-sm" style={{ color: "#8c909f" }}>
                Track your progress across all repository analyses
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="label-mono text-[10px]" style={{ color: "#424754" }}>
                Last 30 days
              </span>
              <div
                className="rounded-md px-3 py-1.5 text-xs font-medium ghost-border-visible transition-colors cursor-pointer"
                style={{ color: "#c2c6d6" }}
              >
                Export Report
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-8">
          {/* Metric cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {METRIC_CARDS.map((card) => (
              <div
                key={card.label}
                className="flex flex-col gap-3 rounded-lg p-5 transition-all duration-200 hover-lift"
                style={{
                  background: "#201f1f",
                  border: "1px solid rgba(66,71,84,0.2)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="label-mono text-[9px]">{card.label}</span>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-md"
                    style={{ background: card.bg, color: card.color }}
                  >
                    {card.icon}
                  </div>
                </div>
                <div>
                  <p
                    className="text-2xl font-bold tracking-tight"
                    style={{
                      color: card.color,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {card.value}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: "#8c909f" }}>
                    {card.delta}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Topic mastery breakdown */}
            <div
              className="lg:col-span-3 rounded-lg p-6"
              style={{
                background: "#201f1f",
                border: "1px solid rgba(66,71,84,0.2)",
              }}
            >
              <div className="mb-5 flex items-center gap-2">
                <Target className="h-4 w-4" style={{ color: "#ddb7ff" }} />
                <h2 className="text-sm font-semibold" style={{ color: "#e5e2e1" }}>
                  Topic Mastery
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                {TOPIC_BREAKDOWN.map((topic) => {
                  const pct = Math.round((topic.mastered / topic.total) * 100);
                  return (
                    <div key={topic.topic}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-sm" style={{ color: "#c2c6d6" }}>
                          {topic.topic}
                        </span>
                        <span
                          className="label-mono text-[10px]"
                          style={{ color: topic.color }}
                        >
                          {topic.mastered}/{topic.total}
                        </span>
                      </div>
                      <div
                        className="h-1.5 w-full rounded-full overflow-hidden"
                        style={{ background: "#2a2a2a" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${topic.color}88, ${topic.color})`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent activity */}
            <div
              className="lg:col-span-2 rounded-lg p-6"
              style={{
                background: "#201f1f",
                border: "1px solid rgba(66,71,84,0.2)",
              }}
            >
              <div className="mb-5 flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: "#adc6ff" }} />
                <h2 className="text-sm font-semibold" style={{ color: "#e5e2e1" }}>
                  Recent Activity
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {RECENT_ACTIVITY.map((item) => (
                  <div
                    key={item.repo + item.time}
                    className="flex items-start gap-3 rounded-md p-3 transition-colors hover-lift"
                    style={{ background: "#1c1b1b" }}
                  >
                    <div
                      className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate text-xs font-medium"
                        style={{
                          color: "#e5e2e1",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {item.repo}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: "#8c909f" }}>
                        {item.action}
                        {item.concepts > 0 && ` · ${item.concepts} concepts`}
                        {item.bugs > 0 && ` · ${item.bugs} bugs`}
                      </p>
                    </div>
                    <span className="label-mono text-[9px] shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly sparkline placeholder */}
          <div
            className="mt-6 rounded-lg p-6"
            style={{
              background: "#201f1f",
              border: "1px solid rgba(66,71,84,0.2)",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" style={{ color: "#adc6ff" }} />
                <h2 className="text-sm font-semibold" style={{ color: "#e5e2e1" }}>
                  Learning Velocity
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: "#adc6ff" }} />
                  <span className="label-mono text-[9px]">Concepts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: "#ddb7ff" }} />
                  <span className="label-mono text-[9px]">Sessions</span>
                </div>
              </div>
            </div>
            {/* Visual bar chart representation */}
            <div className="flex items-end gap-2 h-24">
              {[30, 55, 40, 70, 50, 85, 65, 90, 75, 60, 80, 95, 70, 45].map((h, i) => (
                <div key={i} className="flex-1 flex items-end gap-0.5">
                  <div
                    className="flex-1 rounded-t-sm transition-all duration-500"
                    style={{
                      height: `${h}%`,
                      background: `linear-gradient(180deg, #adc6ff 0%, rgba(173,198,255,0.3) 100%)`,
                      opacity: 0.7 + (i / 14) * 0.3,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between">
              <span className="label-mono text-[9px]">2 weeks ago</span>
              <span className="label-mono text-[9px]">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
