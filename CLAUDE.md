# CLAUDE.md - Project Configuration for Claude Code

## Antigravity Skills & Agents Setup

### Skills (1,223 skills installed)
- **Location:** `~/.claude/skills/` (global)
- **Usage:** Reference any skill with `@skill-name` in your prompt
- **Example:** `Use @brainstorming to plan the architecture`

### Agents (20 specialist agents)
- **Location:** `.agent/agents/` (project-level)
- **Usage:** Reference any agent with `@agent-name` in your prompt

#### Available Agents:
| Agent | Role |
|-------|------|
| `@frontend-specialist` | React/Next.js UI/UX |
| `@backend-specialist` | Node.js/Python APIs |
| `@database-architect` | Schema design & SQL |
| `@mobile-developer` | iOS, Android, React Native |
| `@game-developer` | Game mechanics & logic |
| `@devops-engineer` | CI/CD, Docker, deployment |
| `@penetration-tester` | Offensive security testing |
| `@security-auditor` | Vulnerability scanning |
| `@test-engineer` | Unit, E2E, integration tests |
| `@debugger` | Root cause analysis |
| `@performance-optimizer` | Speed & Core Web Vitals |
| `@qa-automation-engineer` | E2E automation & CI |
| `@project-planner` | Task breakdown & planning |
| `@orchestrator` | Multi-agent coordination |
| `@product-manager` | Requirements & user stories |
| `@product-owner` | Strategy & backlog |
| `@documentation-writer` | Documentation generation |
| `@seo-specialist` | SEO & E-E-A-T |
| `@code-archaeologist` | Legacy code refactoring |
| `@explorer-agent` | Codebase analysis |

### Workflows (slash commands)
| Command | Purpose |
|---------|---------|
| `/brainstorm` | Explore options before implementation |
| `/create` | Build new features or apps |
| `/debug` | Systematic debugging |
| `/deploy` | Deployment procedures |
| `/enhance` | Improve existing code |
| `/orchestrate` | Multi-agent coordination |
| `/plan` | Create task breakdown |
| `/preview` | Preview changes locally |
| `/status` | Check project status |
| `/test` | Generate and run tests |
| `/ui-ux-pro-max` | Design with 50+ styles |

### How to Use
1. **Auto-detect:** Just describe your task - the right agent/skill loads automatically
2. **Explicit:** Mention `@agent-name` or `@skill-name` in your prompt
3. **Workflows:** Use slash commands like `/plan`, `/debug`, `/create`
4. **Chain:** Combine agents: `@backend-specialist and @database-architect build a REST API with PostgreSQL`

### Agent Files
- Agents: `.agent/agents/*.md`
- Skills: `.agent/skills/`
- Workflows: `.agent/workflows/*.md`
- Rules: `.agent/rules/`
- Scripts: `.agent/scripts/`
