# CyberSwarm — AI-Powered Cybersecurity Simulation Platform

## Project Overview
CyberSwarm is a multi-agent cybersecurity simulation platform that deploys **19 specialized
agents** (7 Red, 7 Blue, 5 Purple) — several with sub-agent specialization — coordinated by an
event-driven **Logic Pipe** rule engine. Agents reason with an LLM and "execute" simulated
security tooling against authorized RFC1918 networks.

The repository ships **two independent runtimes** that share the same domain model:

| Component | Path | Stack | Role |
|-----------|------|-------|------|
| **CyberSwarm CLI** | `cyberswarm_cli/` | TypeScript / Node.js (ESM) + Google Gemini | Headless simulation engine. Full 19-agent swarm, all Logic Pipe rules, security tool registry, knowledge bases. This is the canonical implementation. |
| **CyberSwarm Dashboard** | `app/` | Next.js 14 / React 18 / Prisma (Postgres) | Real-time web UI for monitoring & controlling a simulation. Ships its own self-contained orchestrator with a **subset** of agents (mock/deterministic, no Gemini calls) and SSE streaming. |

> The two runtimes are **not** wired together — `app/` does not import from `cyberswarm_cli/`.
> They are parallel implementations of the same concepts. When changing shared behavior
> (event types, task shapes, agent semantics), keep both in mind but treat the CLI as the
> source of truth.

## Repository Layout
```
.
├── cyberswarm_cli/          # Core simulation engine (canonical)
│   ├── src/
│   │   ├── index.ts             # Entry point — parses argv via cli.ts
│   │   ├── cli.ts               # Commander commands: start, report, scenarios, validate
│   │   ├── types.ts             # All shared types, AgentType/EventType/LogicPipeRule enums
│   │   ├── agents/              # base-agent.ts + 19 agent implementations
│   │   ├── orchestrator/        # cybersecurity-orchestrator, agent-manager, logic-pipe
│   │   ├── gemini/              # gemini-client.ts (Google Generative AI), prompts.ts
│   │   ├── tools/               # security-tool-registry.ts (30+ tools, MITRE-mapped)
│   │   ├── output/              # console-formatter.ts (chalk/cli-table3/boxen)
│   │   └── utils/               # config.ts (YAML+env), logger.ts (winston), file-tools.ts
│   ├── config/
│   │   ├── default.yaml         # Base config (gemini/simulation/logging/output)
│   │   ├── scenarios/           # *.yaml run scenarios (basic-scan, full-swarm, self-heal-swarm, ...)
│   │   └── manifests/           # Per-agent YAML manifests (one per agent)
│   ├── knowledge/               # cve-database.json, mitre-attack-techniques.json, threat-intelligence.json
│   ├── output/logs/             # winston log output (gitignored)
│   ├── dist/                    # tsc build output (gitignored)
│   ├── PROJECT_SUMMARY.md, QUICKSTART.md
│   └── package.json
├── app/                     # Next.js dashboard
│   ├── app/                     # App Router: page.tsx, layout.tsx, api/*
│   │   └── api/                 # agents, knowledge-base, simulation (+ /stream SSE, /inject-task)
│   ├── components/              # dashboard/* panels + ui/* (shadcn/Radix primitives)
│   ├── lib/
│   │   ├── orchestrator/        # Self-contained orchestrator/agent-manager/logic-pipe
│   │   ├── agents/              # base-agent + subset of agents (mock execution)
│   │   ├── types.ts             # Mirror of CLI domain types
│   │   └── db.ts                # Prisma client
│   ├── prisma/schema.prisma     # Postgres schema (Agent, Task, Event, ChainOfThought, ...)
│   └── package.json
├── .claude/agents/          # 19 Claude Code sub-agent definitions (one .md per agent)
├── .gemini/                 # Gemini CLI: agents/, skills/, hooks/, settings.json
├── .kimi/agents/            # Kimi agent definitions
├── ARCHITECTURE.md, DEPLOYMENT.md, CONTRIBUTING.md, README.md, AGENTS.md
└── AI_PROTOCOL_SYNTHESIS_LOG.md
```

## Agent Teams (19 total)

### Red Team (7) — Offensive
1. **DiscoveryAgent** — Network scanning (Nmap, Masscan)
2. **OSINTAgent** — Open-source intelligence (Amass, Shodan, Maltego)
3. **ReconAgent** `[NetworkScanner + WebCrawler]` — Comprehensive reconnaissance
4. **VulnerabilityScannerAgent** — Vulnerability assessment (Nessus, OpenVAS, Nuclei)
5. **ExploitationAgent** — Controlled exploitation (Metasploit, SQLMap)
6. **PersistenceAgent** `[ImplantDeployer + EvasionTuner]` — Post-exploitation persistence
7. **StrategyAdaptationAgent** — Tactical adaptation when detected

### Blue Team (7) — Defensive
1. **NetworkMonitorAgent** — Traffic monitoring (Zeek, Suricata, Wireshark)
2. **LogAnalysisAgent** — SIEM correlation (Elastic, Sigma)
3. **PatchManagementAgent** — Vulnerability remediation
4. **ContainmentAgent** — Rapid threat containment
5. **ForensicsAgent** `[MemoryAnalyzer + FileInvestigator]` — Digital forensics (Volatility, Autopsy)
6. **RecoveryAgent** `[BackupRestorer + IntegrityVerifier]` — System restoration
7. **AIMonitoringAgent** — AI reasoning-chain integrity monitoring

### Purple Team (5) — Integrative
1. **ThreatHunterAgent** — Proactive hunting (YARA, Sigma, osquery)
2. **IncidentResponseAgent** — Full IR lifecycle (TheHive, Cortex, GRR)
3. **PostureAssessmentAgent** — Gap analysis & MITRE coverage mapping
4. **ThreatIntelligenceAgent** — IOC correlation (MISP, OpenCTI, Maltego)
5. **AdaptationAgent** `[IncidentLearner + StrategyOptimizer]` — Swarm learning & optimization

Agent ↔ type names are enumerated in `AgentType` (`cyberswarm_cli/src/types.ts`). The
`app/` runtime currently implements only a subset (Discovery, NetworkMonitor, PatchManagement,
StrategyAdaptation, VulnerabilityScanner).

## How a Simulation Works
1. `CyberSecurityOrchestrator` instantiates all 19 agents, an `AgentManager`, and a `LogicPipe`,
   then wires callbacks (events, chain-of-thought, status changes).
2. Initial tasks come from a scenario YAML (`config/scenarios/*.yaml`) or CLI flags.
3. `AgentManager.assignTasks()` routes each `Task` to an agent whose `supportedTasks` include
   `task.taskName` (`agent.canHandleTask(...)`), respecting `maxConcurrentAgents`.
4. An agent's `executeTask()` calls Gemini for a decision, "executes" simulated tools, logs
   chain-of-thought steps, and emits a `CyberEvent`.
5. The orchestrator pushes each event into `LogicPipe.processEvent()`, which matches the event
   type against cascading rules and spawns **new** tasks — producing the red/blue/purple loop.
6. The run ends on timeout/duration; results are serialized and can be turned into a Markdown
   report via the `report` command.

### Logic Pipe rules (event → reaction)
Rules live in `cyberswarm_cli/src/orchestrator/logic-pipe.ts`; enum in `LogicPipeRule`. Core set:
- **RED_DISCOVERS_BLUE_REACTS** — `RECON_DATA`/`VULNERABILITY_FOUND` → defensive scan/remediate
- **BLUE_DETECTS_RED_ADAPTS** — `INTRUSION_DETECTED` → StrategyAdaptation
- **BLUE_DEFENDS_RED_REEVALUATES** — `DEFENSE_ACTION` → red re-targets
- **OSINT_ENRICHES_DISCOVERY**, **RECON_ENRICHES_OSINT**, **VULN_TRIGGERS_EXPLOIT**,
  **EXPLOIT_TRIGGERS_CONTAINMENT**, **LOG_ANOMALY_TRIGGERS_HUNT**,
  **INTRUSION_TRIGGERS_CONTAINMENT**, **AI_MONITORS_REASONING**
- **Purple:** `PURPLE_HUNT_ON_INTRUSION`, `PURPLE_INCIDENT_ON_HUNT_FINDING`,
  `PURPLE_POSTURE_ON_DEFENSE`, `PURPLE_INTEL_ON_ADAPTATION`
- **Self-healing swarm:** `PERSISTENCE_TRIGGERS_FORENSICS` → `FORENSIC_TRIGGERS_RECOVERY` →
  `RECOVERY_TRIGGERS_ADAPTATION` → `ADAPTATION_ENRICHES_BLUE`; and
  `SWARM_ANOMALY_TRIGGERS_HEAL` (detect anomaly → forensics → recovery → adaptation learning)

Event names live in the `EventType` enum (`types.ts`). When adding a rule, add the event(s) to
`EventType`, the rule to `LogicPipeRule`, a `processEvent` branch, and an `apply*` method.

## Development Workflows

### CLI (`cyberswarm_cli/`)
```bash
cd cyberswarm_cli
npm install
echo "GEMINI_API_KEY=<your-key>" > .env   # config reads ${GEMINI_API_KEY} from env/.env
npm run build                   # tsc → dist/
npm run cyberswarm -- validate  # check config + API key
npm run cyberswarm -- scenarios # list config/scenarios/*.yaml
npm run cyberswarm -- start --target 192.168.1.0/24 --duration 30
npm run cyberswarm -- start --scenario full-swarm
npm run cyberswarm -- report --input <results.json> --format markdown
```
- `npm run dev` / `npm run cyberswarm` run from source via **tsx** (no build step).
- `npm start` runs the compiled `dist/index.js`.
- There is **no test runner or linter configured** in the CLI package. Validate changes by
  building (`npm run build`) and running a short scenario.

### Dashboard (`app/`)
```bash
cd app
yarn install                    # repo uses Yarn (.yarnrc.yml); node_modules is symlinked
npx prisma generate             # requires DATABASE_URL (Postgres)
yarn dev                        # Next.js dev server
yarn build && yarn start        # production
yarn lint                       # next lint / eslint
```
- The dashboard's orchestrator is in-memory and instantiated lazily per server process
  (`app/app/api/simulation/route.ts`); live updates stream over SSE from
  `app/app/api/simulation/stream/route.ts` consumed by `hooks/use-simulation-stream.ts`.
- `prisma/schema.prisma` hard-codes a generator `output` path from the original authoring
  environment — regenerate locally; don't assume that path exists.

## Conventions
- **TypeScript ESM everywhere.** The CLI uses `"type": "module"`; **relative imports must
  carry the `.js` extension** (e.g. `import { LogicPipe } from './logic-pipe.js'`) even though
  the source is `.ts`. Match this exactly.
- **Agents** extend `BaseAgent` (`agents/base-agent.ts`) and implement
  `async executeTask(task): Promise<CyberEvent>`. Use the inherited helpers rather than
  re-implementing them:
  - `logChainOfThought(stepNumber, stepType, description, reasoning, data?, confidence?, taskId?)`
  - `emitEvent(eventType, payload, severity?, target?, taskId?)`
  - `getGeminiDecision<T>(prompt)` / `getGeminiDecisionWithFiles<T>(prompt, fileUris)`
  - `getAvailableTools()` / `getToolContextForPrompt()` / `logToolUsage(...)`
- **Tools never run for real.** The `SecurityToolRegistry` and agent tool calls are *simulated*
  and logged for the chain-of-thought; nothing executes against the network.
- **Tool ↔ agent mapping** is by `ToolCategory` in `getToolsForAgent()` — add new tools with
  correct `category`, `riskLevel`, and `mitreTechniques` so the right agents pick them up.
- **Config** loads `config/default.yaml`, interpolates `${ENV_VARS}`, and is overridden by
  scenario YAML and CLI flags (`utils/config.ts`).
- **Logging** goes through the shared winston `logger` (`utils/logger.ts`); avoid raw
  `console.log` in CLI code (the dashboard side uses `console.*` deliberately).
- **Naming:** files kebab-case (`threat-hunter-agent.ts`), classes PascalCase
  (`ThreatHunterAgent`), agent `agentType` strings match the `AgentType` enum values.

## Multi-Platform Agent Definitions
The same swarm is described for several agent runtimes — keep them consistent when agent
behavior changes:
- `.claude/agents/*.md` — one instruction file per agent for Claude Code sub-agents
- `.gemini/agents/*.md`, `.gemini/skills/*/SKILL.md`, `.gemini/hooks/*.sh` — Gemini CLI
  (security-gate, audit-log, context-inject hooks)
- `.kimi/agents/*.md` — Kimi agent definitions
- `cyberswarm_cli/config/manifests/*.yaml` — runtime agent manifests (capabilities, tools)

## Rules of Engagement
- **ONLY** target authorized RFC1918 networks: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
- All offensive tooling is **simulated** — this is a training/research platform, not a live
  pentest framework. Do not add code that performs real network attacks or exfiltration.
- Log ALL actions to the audit trail (chain-of-thought + events).
- Coordinate red/blue through the purple team for validated testing.
- Self-healing loop: detect anomaly → forensics → recovery → adaptation learning.

## Key Files (quick reference)
- `cyberswarm_cli/src/types.ts` — domain model, `AgentType`/`EventType`/`LogicPipeRule` enums
- `cyberswarm_cli/src/orchestrator/cybersecurity-orchestrator.ts` — wiring & lifecycle
- `cyberswarm_cli/src/orchestrator/logic-pipe.ts` — all cascading coordination rules
- `cyberswarm_cli/src/orchestrator/agent-manager.ts` — task routing & concurrency
- `cyberswarm_cli/src/agents/base-agent.ts` — shared agent behavior
- `cyberswarm_cli/src/gemini/{gemini-client,prompts}.ts` — LLM integration
- `cyberswarm_cli/src/tools/security-tool-registry.ts` — tool catalog & MITRE mapping
- `app/lib/orchestrator/*`, `app/app/api/simulation/*` — dashboard backend & SSE
- `ARCHITECTURE.md` — deep design reference; `DEPLOYMENT.md` — deployment guide
