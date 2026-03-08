<div align="center">
  <h1>RepoIQ</h1>
  <p><strong>AI-Powered Codebase Learning Agent</strong></p>
  <p>Turn your vibe-coded project into a personalized AI teacher</p>

  <br />

  <p>
    <a href="https://repoiq-puce.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-repoiq--puce.vercel.app-16a34a?style=for-the-badge" alt="Live Demo" /></a>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/AWS-Bedrock-FF9900?style=for-the-badge&logo=amazon-aws" alt="AWS Bedrock" />
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  </p>

  <p><strong>Team Codeformers</strong> &bull; AI for Bharat Hackathon 2026</p>
</div>

---

## The Problem

Students use AI to generate entire codebases (vibe-coding) but **can't explain how their own code works**. When asked about architecture, API design, or state management, they struggle. Generic AI tools give one-size-fits-all answers that don't reference the student's actual code.

## Our Solution

RepoIQ **reads your actual codebase** and becomes a personalized teacher. It analyzes the repository, identifies knowledge gaps, detects bugs, and teaches through **Socratic questioning** -- never giving direct answers, always guiding students to understand.

---

## Features

### Core Analysis
- **Repository Analysis** -- Analyzes GitHub repos via AWS Bedrock (architecture, concepts, bugs, stack detection)
- **Smart File Fetching** -- Downloads 1000+ files via GitHub Trees API with intelligent prioritization
- **Multi-Model Agent Swarm** -- AWS Bedrock (primary) + OpenRouter (parallel) for faster analysis
- **Dynamic Scaling** -- Lessons (3-20), concepts (3-10), bugs (1-10) scale with repo size

### Learning & Teaching
- **Socratic Teach Mode** -- AI asks guiding questions, never gives direct answers
- **Structured Lessons** -- Auto-generated lessons based on repo complexity
- **Quiz Mode** -- Customizable MCQ quizzes with topic selection and difficulty mixing
- **AI Memory** -- Remembers student skill level and adapts teaching across sessions
- **Skill Level Selector** -- Beginner/Intermediate/Advanced adapts explanation depth

### Analysis Report
- **Code Quality Score** -- A-F letter grade with breakdown (bugs, structure, deps, patterns)
- **Security Assessment** -- OWASP Top 10 scanning with severity-rated findings
- **Architecture Diagrams** -- 4 types: Architecture, Data Flow, Dependency Map, Component Hierarchy
- **Lines of Code** -- Breakdown by language with sqrt-scaled visualization
- **Complexity Hotspots** -- Identifies most complex functions with reasoning
- **Bug Detection** -- AI-powered bug finding with before/after fix suggestions
- **Stack Detection** -- Frameworks, libraries, databases, and tools identified
- **Runtime Requirements** -- RAM estimation, runtime versions, system dependencies
- **File Importance** -- Every file rated 1-10 with category

### Productivity
- **Code Usage Tracker** -- Search where any function/component is used across the project
- **AI Fix Suggestions** -- Before/after code diffs with copy button for each bug
- **PDF Export** -- Download report as print-optimized PDF
- **Share Report** -- Copy shareable link for any analysis
- **Compare Mode** -- Side-by-side comparison of two analyzed repos with quality scores

### Accessibility & i18n
- **Multi-Language** -- Translate reports to Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Malayalam, Gujarati, Punjabi
- **Voice Read-Aloud** -- Listen to architecture summaries via Web Speech API

### Gamification
- **Leaderboard** -- XP-based ranking with stats overview
- **Badges** -- Scholar, Bug Hunter, Clean Code, Full Stack, First Steps
- **Progress Tracking** -- Total XP, Repos Analyzed, Concepts Mastered, Badges earned

---

## Architecture

```
                    +------------------+
                    |   Next.js App    |
                    |   (Vercel)       |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
    +---------+--+   +------+------+   +---+--------+
    | AWS Bedrock|   | OpenRouter  |   | GitHub API |
    | (Nova Pro) |   | (Gemma 3)  |   | (Files)    |
    +-----+------+   +------+------+   +---+--------+
          |                  |              |
          +--------+---------+              |
                   |                        |
          +--------+---------+     +--------+--------+
          |  AWS DynamoDB    |     |    AWS S3       |
          |  (6 Tables)      |     |   (Storage)     |
          +------------------+     +-----------------+
```

### Agent Swarm Pattern (Parallel Analysis)

```
GitHub Repo URL
      |
      v
  Fetch Files (GitHub Trees API)
      |
      +----------- PARALLEL -----------+
      |                                |
  AWS Bedrock                    OpenRouter
  (priority files)              (tail files)
  - architecture                - extra bugs
  - concepts                    - file ratings
  - bugs, security
  - lessons, quality
      |                                |
      +------------ MERGE ------------+
                     |
               Final Report
```

Both models fire **simultaneously**. For secondary tasks (fix, diagram, quiz, translate), `Promise.any` races both and uses whichever responds first. If OpenRouter fails, Bedrock result is used -- zero errors shown.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 + React 19 + TypeScript 5.7 |
| **Styling** | Tailwind CSS 3.4 + Radix UI + Framer Motion |
| **State** | TanStack React Query + Zustand |
| **AI (Primary)** | AWS Bedrock (Amazon Nova Pro / Lite / Micro) |
| **AI (Parallel)** | OpenRouter (Arcee Trinity, Gemma 3 12B/4B, free router) |
| **Database** | AWS DynamoDB (6 tables) |
| **Storage** | AWS S3 |
| **Auth** | AWS Amplify (Cognito) |
| **Deployment** | Vercel |
| **Code Highlight** | Shiki |
| **Diagrams** | Mermaid.js via mermaid.ink |
| **Toasts** | Sonner |

---

## DynamoDB Tables

| Table | Purpose |
|-------|---------|
| `RepoIQ_Users` | User profiles, plans, quotas |
| `RepoIQ_Sessions` | Analysis sessions + full reports |
| `RepoIQ_Messages` | Chat conversation history |
| `RepoIQ_Gaps` | Knowledge gaps per concept |
| `RepoIQ_Analytics` | Event tracking |
| `RepoIQ_UserMemory` | Student learning profiles (memory.md) |

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/analyze` | Analyze a GitHub repository |
| `POST` | `/api/chat` | Socratic teaching conversation |
| `POST` | `/api/chat/line` | Explain a specific code line |
| `POST` | `/api/fix` | Generate bug fix suggestion |
| `POST` | `/api/diagram` | Generate Mermaid diagram (4 types) |
| `POST` | `/api/quiz` | Generate quiz (custom count & topic) |
| `POST` | `/api/translate` | Translate to Indian languages |
| `POST` | `/api/usage` | Search code usage across files |
| `GET` | `/api/sessions` | List all sessions |
| `GET` | `/api/session/[id]` | Get session details |
| `GET` | `/api/session/[id]/gaps` | Get knowledge gaps |
| `GET` | `/api/session/[id]/files` | Get session files |
| `GET` | `/api/session/[id]/lessons` | Get session lessons |
| `PATCH` | `/api/gaps/[id]` | Mark concept as understood |
| `GET` | `/api/user` | Get quota info |

---

## Quick Start

```bash
git clone https://github.com/SanjayGoffl/repoiq.git
cd repoiq
npm install
cp .env.example .env.local
# Edit .env.local with your AWS credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

See **[SETUP.md](./SETUP.md)** for detailed setup instructions and **[REQUIREMENTS.md](./REQUIREMENTS.md)** for all dependencies.

---

## Project Structure

```
repoiq/
  app/
    (app)/                    # App routes (dashboard, analyze, compare, leaderboard)
      analyze/[sessionId]/    # Report, teach, lessons, quiz, loading
    api/                      # 16 API routes
  components/
    report/                   # 22 report components
    teach/                    # Socratic teaching UI
    lessons/                  # Lesson components
    compare/                  # Repo comparison
    leaderboard/              # XP rankings
    codeviewer/               # Interactive code viewer
    dashboard/                # Dashboard widgets
    landing/                  # Landing page
    layout/                   # Navbar, Sidebar, MobileNav
    ui/                       # shadcn/ui primitives
  hooks/                      # useSession, useChat, useQuota, useAuth
  lib/
    bedrock.ts                # AWS Bedrock + GitHub file fetching
    dynamodb.ts               # All DynamoDB operations
    openrouter.ts             # OpenRouter client + Promise.any racing
    memory.ts                 # User memory system
    gamification.ts           # XP + badge calculations
    quality-score.ts          # Code quality A-F grading
    loc.ts                    # Lines of code counter
    dependencies.ts           # Dependency parser
    ram-estimator.ts          # Runtime memory estimation
    types.ts                  # All TypeScript types
    constants.ts              # App constants
    api.ts                    # Frontend API client
```

---

## Hackathon Scoring Alignment

| Criteria (Weight) | How We Address It |
|-------------------|------------------|
| **Ideation & Creativity (30%)** | Multi-model agent swarm, Socratic teaching, gamified learning, 9 Indian languages, 4 diagram types, AI memory |
| **Technical Aptness (30%)** | AWS Bedrock + DynamoDB + S3 + Amplify + Cognito, OpenRouter orchestration, Promise.any racing, GitHub Trees API |
| **Impact (20%)** | Helps millions of students who vibe-code understand their own projects. Multi-language support for Bharat |
| **Business Feasibility (20%)** | Freemium model (free/pro tiers), quota system, scalable serverless architecture, zero infrastructure cost at rest |

---

## Team

**Team Codeformers**
- **Sanjay G** -- Team Leader

---

<div align="center">
  <p><em>Built to make understanding codebases as intuitive as having a mentor beside you.</em></p>
  <p>AI for Bharat Hackathon 2026 | Powered by AWS</p>
</div>
