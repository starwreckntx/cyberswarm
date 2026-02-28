# CyberSwarm - AI-Powered Cybersecurity Simulation Platform

## Project Overview
CyberSwarm is a multi-agent cybersecurity simulation platform deploying 19 specialized agents (7 Red, 7 Blue, 5 Purple) with sub-agent specialization and event-driven coordination via a Logic Pipe rule engine.

## Architecture
- **Runtime**: TypeScript/Node.js CLI (`cyberswarm_cli/`)
- **AI Backend**: Google Gemini 2.5 Pro for agent decision-making
- **Coordination**: Logic Pipe with 18+ cascading event rules
- **Tools**: 30+ integrated security tools (Nmap, Metasploit, YARA, Sigma, Volatility, etc.)

## Agent Teams

### Red Team (7 Agents) - Offensive Operations
1. DiscoveryAgent - Network scanning (Nmap, Masscan)
2. OSINTAgent - Open-source intelligence (Amass, Shodan, Maltego)
3. ReconAgent [NetworkScanner + WebCrawler] - Comprehensive reconnaissance
4. VulnerabilityScannerAgent - Vulnerability assessment (Nessus, OpenVAS, Nuclei)
5. ExploitationAgent - Controlled exploitation (Metasploit, SQLMap)
6. PersistenceAgent [ImplantDeployer + EvasionTuner] - Post-exploitation persistence
7. StrategyAdaptationAgent - Tactical adaptation when detected

### Blue Team (7 Agents) - Defensive Operations
1. NetworkMonitorAgent - Traffic monitoring (Zeek, Suricata, Wireshark)
2. LogAnalysisAgent - SIEM correlation (Elastic, Sigma)
3. PatchManagementAgent - Vulnerability remediation
4. ContainmentAgent - Rapid threat containment
5. ForensicsAgent [MemoryAnalyzer + FileInvestigator] - Digital forensics (Volatility, Autopsy)
6. RecoveryAgent [BackupRestorer + IntegrityVerifier] - System restoration
7. AIMonitoringAgent - AI reasoning chain integrity monitoring

### Purple Team (5 Agents) - Integrative Operations
1. ThreatHunterAgent - Proactive threat hunting (YARA, Sigma, osquery)
2. IncidentResponseAgent - Full IR lifecycle (TheHive, Cortex, GRR)
3. PostureAssessmentAgent - Gap analysis and MITRE coverage mapping
4. ThreatIntelligenceAgent - IOC correlation (MISP, OpenCTI, Maltego)
5. AdaptationAgent [IncidentLearner + StrategyOptimizer] - Swarm learning and optimization

## Key Files
- `cyberswarm_cli/src/agents/` - Agent implementations
- `cyberswarm_cli/src/orchestrator/` - Orchestrator and Logic Pipe
- `cyberswarm_cli/src/gemini/` - Gemini AI prompts
- `cyberswarm_cli/src/tools/` - Security tool registry
- `cyberswarm_cli/src/types.ts` - Type definitions
- `cyberswarm_cli/config/` - Scenarios, manifests, MCP config

## Rules of Engagement
- ONLY target authorized RFC1918 networks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
- Log ALL actions to audit trail
- Coordinate red/blue through purple team for validated testing
- Self-healing loop: detect anomaly → forensics → recovery → adaptation learning

## Agent Definitions
See `.claude/agents/` for individual agent instruction files used by Claude Code sub-agents.
See `.gemini/agents/` for Gemini CLI sub-agent definitions.
See `.kimi/agents/` for Kimi agent definitions.
