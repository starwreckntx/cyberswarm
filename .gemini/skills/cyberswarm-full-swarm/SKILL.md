---
name: cyberswarm-full-swarm
description: "Run a full CyberSwarm simulation with all 19 agents (7 red, 7 blue, 5 purple). Use when asked to run a full swarm, complete simulation, or all-agent exercise."
---

# CyberSwarm Full Swarm Simulation

Execute a comprehensive red/blue/purple team cybersecurity simulation deploying all 19 agents with sub-agent specialization.

## Workflow

### 1. Pre-Flight Checks
- Verify `GEMINI_API_KEY` is set
- Check that `cyberswarm_cli/` project structure exists
- Load configuration from `config/scenarios/full-swarm.yaml`

### 2. Initialize Swarm (19 Agents)

**Red Team (7):** DiscoveryAgent, OSINTAgent, ReconAgent (NetworkScanner + WebCrawler), VulnerabilityScannerAgent, ExploitationAgent, PersistenceAgent (ImplantDeployer + EvasionTuner), StrategyAdaptationAgent

**Blue Team (7):** NetworkMonitorAgent, LogAnalysisAgent, PatchManagementAgent, ContainmentAgent, ForensicsAgent (MemoryAnalyzer + FileInvestigator), RecoveryAgent (BackupRestorer + IntegrityVerifier), AIMonitoringAgent

**Purple Team (5):** ThreatHunterAgent, IncidentResponseAgent, PostureAssessmentAgent, ThreatIntelligenceAgent, AdaptationAgent (IncidentLearner + StrategyOptimizer)

### 3. Execute Phases
1. **Baseline:** Blue establishes monitoring, Recovery verifies integrity
2. **Reconnaissance:** Red performs OSINT, Recon, Discovery in parallel
3. **Assessment:** Purple assesses posture, correlates intel, hunts proactively
4. **Attack Chain:** Logic Pipe cascades vuln scanning → exploitation → persistence
5. **Response Chain:** Containment → Forensics → Recovery → Adaptation
6. **Learning:** AdaptationAgent processes outcomes, updates strategies

### 4. Logic Pipe Rules (18 cascading rules)
All event-driven coordination flows through the Logic Pipe rule engine. Key flows:
- Recon → OSINT enrichment → Discovery targeting
- Vulnerability → Exploitation → Containment
- Persistence → Forensics → Recovery → Adaptation
- Swarm anomaly → self-healing (Recovery + Adaptation)

### 5. Report Generation
Generate final report with: event timeline, agent performance, MITRE coverage, detection gaps, lessons learned.

## Tools
- `cyberswarm_cli/` TypeScript project
- Security tools: Nmap, Metasploit, YARA, Sigma, Elastic, Volatility, etc.
- AI: Gemini 2.5 Pro for agent decision-making

## Run Command
```bash
cd cyberswarm_cli && npm run start -- --scenario full-swarm --target 192.168.1.0/24
```
