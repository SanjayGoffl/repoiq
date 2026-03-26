"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import {
  Users,
  GitBranch,
  MessageSquare,
  Share2,
  UserPlus,
  BookOpen,
  ChevronRight,
  Circle,
} from "lucide-react";

const TEAM_MEMBERS = [
  { name: "Arjun Mehta", role: "Team Lead", repos: 12, avatar: "AM", color: "#adc6ff" },
  { name: "Priya Sharma", role: "Frontend Dev", repos: 8, avatar: "PS", color: "#ddb7ff" },
  { name: "Rahul Singh", role: "Backend Dev", repos: 15, avatar: "RS", color: "#ffb786" },
  { name: "Kritika Jain", role: "Fullstack", repos: 6, avatar: "KJ", color: "#adc6ff" },
];

const SHARED_REPOS = [
  {
    name: "auth-microservice",
    sharedBy: "Rahul Singh",
    concepts: 14,
    bugs: 3,
    comments: 7,
    color: "#adc6ff",
    status: "Review in progress",
  },
  {
    name: "react-design-system",
    sharedBy: "Priya Sharma",
    concepts: 22,
    bugs: 1,
    comments: 12,
    color: "#ddb7ff",
    status: "Ready for learning",
  },
  {
    name: "payment-gateway",
    sharedBy: "Arjun Mehta",
    concepts: 9,
    bugs: 5,
    comments: 3,
    color: "#ffb4ab",
    status: "Needs attention",
  },
];

const KNOWLEDGE_MAP_NODES = [
  { label: "JWT Auth", x: "15%", y: "20%", color: "#adc6ff", size: 40 },
  { label: "React Hooks", x: "45%", y: "10%", color: "#ddb7ff", size: 52 },
  { label: "API Design", x: "75%", y: "25%", color: "#ffb786", size: 36 },
  { label: "Middleware", x: "25%", y: "55%", color: "#adc6ff", size: 30 },
  { label: "DB Queries", x: "60%", y: "60%", color: "#ffb4ab", size: 44 },
  { label: "TypeScript", x: "85%", y: "65%", color: "#ddb7ff", size: 38 },
];

export default function CollaboratePage() {
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
                <Users className="h-4 w-4" style={{ color: "#ddb7ff" }} />
                <span className="label-mono text-[10px]" style={{ color: "#ddb7ff" }}>
                  COLLABORATION
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#e5e2e1" }}>
                Team Workspace
              </h1>
              <p className="mt-1 text-sm" style={{ color: "#8c909f" }}>
                Share analyses, review code together, and build shared knowledge
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold btn-primary-gradient"
            >
              <UserPlus className="h-4 w-4" />
              Invite Member
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Team members */}
            <div
              className="rounded-lg p-6"
              style={{
                background: "#201f1f",
                border: "1px solid rgba(66,71,84,0.2)",
              }}
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" style={{ color: "#ddb7ff" }} />
                  <h2 className="text-sm font-semibold" style={{ color: "#e5e2e1" }}>
                    Team Members
                  </h2>
                </div>
                <span className="label-mono text-[9px]">{TEAM_MEMBERS.length} active</span>
              </div>
              <div className="flex flex-col gap-2">
                {TEAM_MEMBERS.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center gap-3 rounded-md p-3 transition-colors hover-lift"
                    style={{ background: "#1c1b1b" }}
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                      style={{
                        background: `${member.color}18`,
                        color: member.color,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: "#e5e2e1" }}>
                        {member.name}
                      </p>
                      <p className="text-xs" style={{ color: "#8c909f" }}>
                        {member.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Circle
                        className="h-1.5 w-1.5 fill-current"
                        style={{ color: "#adc6ff" }}
                      />
                      <span className="label-mono text-[9px]">{member.repos}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shared repos */}
            <div
              className="lg:col-span-2 rounded-lg p-6"
              style={{
                background: "#201f1f",
                border: "1px solid rgba(66,71,84,0.2)",
              }}
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" style={{ color: "#adc6ff" }} />
                  <h2 className="text-sm font-semibold" style={{ color: "#e5e2e1" }}>
                    Shared Analyses
                  </h2>
                </div>
                <button
                  className="ghost-border-visible rounded-md px-3 py-1 text-xs transition-all btn-ghost-interactive"
                  style={{ color: "#c2c6d6" }}
                >
                  Share Repo
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {SHARED_REPOS.map((repo) => (
                  <div
                    key={repo.name}
                    className="group relative flex flex-col gap-3 rounded-md p-4 transition-all cursor-pointer hover-lift"
                    style={{
                      background: "#1c1b1b",
                      border: `1px solid rgba(66,71,84,0.15)`,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" style={{ color: repo.color }} />
                        <span
                          className="text-sm font-medium"
                          style={{
                            color: "#e5e2e1",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {repo.name}
                        </span>
                      </div>
                      <span
                        className="rounded-sm px-2 py-0.5 text-[10px]"
                        style={{
                          background: `${repo.color}12`,
                          color: repo.color,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {repo.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="label-mono text-[9px]">by {repo.sharedBy}</span>
                      <div className="flex items-center gap-3 ml-auto">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" style={{ color: "#adc6ff" }} />
                          <span className="label-mono text-[9px]">{repo.concepts} concepts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" style={{ color: "#ddb7ff" }} />
                          <span className="label-mono text-[9px]">{repo.comments} comments</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5" style={{ color: "#424754" }} />
                      </div>
                    </div>
                    {/* Left accent */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-md"
                      style={{ background: repo.color }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shared Knowledge Map */}
          <div
            className="mt-6 rounded-lg p-6"
            style={{
              background: "#201f1f",
              border: "1px solid rgba(66,71,84,0.2)",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" style={{ color: "#ddb7ff" }} />
                <h2 className="text-sm font-semibold" style={{ color: "#e5e2e1" }}>
                  Team Knowledge Map
                </h2>
              </div>
              <span className="label-mono text-[9px]">Beta · Interactive coming soon</span>
            </div>
            {/* Visual knowledge map (decorative) */}
            <div
              className="relative h-48 rounded-md overflow-hidden"
              style={{ background: "#1c1b1b" }}
            >
              {/* Connection lines (decorative SVG) */}
              <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <line x1="20%" y1="24%" x2="48%" y2="14%" stroke="#adc6ff" strokeWidth="1" />
                <line x1="48%" y1="14%" x2="77%" y2="29%" stroke="#ddb7ff" strokeWidth="1" />
                <line x1="20%" y1="24%" x2="27%" y2="58%" stroke="#adc6ff" strokeWidth="1" />
                <line x1="48%" y1="14%" x2="62%" y2="63%" stroke="#ddb7ff" strokeWidth="1" />
                <line x1="62%" y1="63%" x2="87%" y2="68%" stroke="#ffb786" strokeWidth="1" />
              </svg>
              {KNOWLEDGE_MAP_NODES.map((node) => (
                <div
                  key={node.label}
                  className="absolute flex items-center justify-center rounded-full text-xs font-medium cursor-pointer transition-transform duration-200 hover:scale-110"
                  style={{
                    left: node.x,
                    top: node.y,
                    width: node.size,
                    height: node.size,
                    transform: "translate(-50%, -50%)",
                    background: `${node.color}12`,
                    border: `1px solid ${node.color}40`,
                    color: node.color,
                    fontSize: "9px",
                    fontFamily: "'JetBrains Mono', monospace",
                    textAlign: "center",
                    lineHeight: 1.2,
                    padding: "4px",
                  }}
                >
                  {node.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
