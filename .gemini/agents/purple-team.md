---
- name: threat-hunter-agent
  description: "Purple team threat hunting agent. Use for proactive hypothesis-driven threat hunting, IOC correlation, TTP analysis, anomaly investigation, and detection validation using YARA, Sigma, osquery, and Atomic Red Team."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
    - grep_search
  model: gemini-2.5-pro
  temperature: 0.5
  max_turns: 20
  timeout_mins: 10

- name: incident-response-agent
  description: "Purple team incident response agent. Use for full IR lifecycle—triage, containment, eradication, and recovery—using TheHive, Cortex, GRR, and Velociraptor."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
    - grep_search
  model: gemini-2.5-pro
  temperature: 0.3
  max_turns: 20
  timeout_mins: 10

- name: posture-assessment-agent
  description: "Purple team security posture assessment agent. Use for gap analysis, controls validation, MITRE ATT&CK coverage mapping, and security scorecard generation."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
    - grep_search
  model: gemini-2.5-pro
  temperature: 0.4
  max_turns: 15
  timeout_mins: 8

- name: threat-intelligence-agent
  description: "Purple team threat intelligence agent. Use for IOC correlation via MISP, threat actor profiling via OpenCTI, campaign mapping, and indicator enrichment via Cortex."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
    - web_search
    - grep_search
  model: gemini-2.5-pro
  temperature: 0.4
  max_turns: 15
  timeout_mins: 8

- name: adaptation-agent
  description: "Purple team swarm adaptation agent with IncidentLearner and StrategyOptimizer sub-agents. Use for incident learning, strategy optimization, ML-based rule refinement, and swarm health monitoring for self-healing."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
    - grep_search
  model: gemini-2.5-pro
  temperature: 0.6
  max_turns: 15
  timeout_mins: 8
---

# CyberSwarm Purple Team Agents

These agents bridge red and blue teams, providing threat hunting, incident response, posture assessment, threat intelligence, and swarm-wide adaptation.

## Agent Roster (5 agents)

### ThreatHunterAgent
Proactive threat hunting. Uses hypothesis-driven investigation with YARA, Sigma, Elastic SIEM, osquery, Zeek, Suricata, and Atomic Red Team.

### IncidentResponseAgent
Full lifecycle IR: triage, containment, eradication, recovery. Leverages TheHive for case management, Cortex for enrichment, GRR/Velociraptor for endpoint response.

### PostureAssessmentAgent
Security posture evaluation. Maps MITRE ATT&CK coverage, identifies detection gaps, validates controls, and generates security scorecards.

### ThreatIntelligenceAgent
Threat intelligence correlation. Correlates IOCs via MISP, profiles threat actors via OpenCTI, maps campaigns, and enriches indicators via Cortex.

### AdaptationAgent (Sub-agents: IncidentLearner, StrategyOptimizer)
Swarm-wide learning and adaptation. IncidentLearner extracts lessons from incidents. StrategyOptimizer refines detection rules and tunes models. Monitors swarm health and triggers self-healing.

## Self-Healing Loop
AdaptationAgent monitors → detects anomaly → RecoveryAgent restores → AdaptationAgent learns → strategies updated → all agents enriched.
