---
- name: network-monitor-agent
  description: "Blue team network monitoring agent. Use for real-time traffic analysis, intrusion detection, protocol anomaly detection, and network baseline establishment using Zeek and Suricata."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
    - grep_search
  model: gemini-2.5-pro
  temperature: 0.3
  max_turns: 15
  timeout_mins: 10

- name: log-analysis-agent
  description: "Blue team log analysis agent. Use for centralized log collection, SIEM correlation, Sigma rule matching, and anomaly detection across syslog, Windows events, firewall, and IDS sources."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
    - grep_search
  model: gemini-2.5-pro
  temperature: 0.3
  max_turns: 15
  timeout_mins: 8

- name: patch-management-agent
  description: "Blue team patch management agent. Use for vulnerability remediation, patch deployment, and verification of security fixes across affected systems."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
  model: gemini-2.5-pro
  temperature: 0.2
  max_turns: 10
  timeout_mins: 5

- name: containment-agent
  description: "Blue team rapid containment agent. Use for immediate threat containment including network isolation of compromised hosts, malicious process termination, and IP/domain blocking."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
  model: gemini-2.5-pro
  temperature: 0.2
  max_turns: 10
  timeout_mins: 3

- name: forensics-agent
  description: "Blue team digital forensics agent with MemoryAnalyzer and FileInvestigator sub-agents. Use for post-incident evidence collection, memory dump analysis, disk forensics, YARA scanning, and incident timeline reconstruction."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
    - grep_search
  model: gemini-2.5-pro
  temperature: 0.2
  max_turns: 20
  timeout_mins: 10

- name: recovery-agent
  description: "Blue team system recovery agent with BackupRestorer and IntegrityVerifier sub-agents. Use for automated backup restoration, system rollback, integrity verification against known-good baselines, and service rebuilding."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
  model: gemini-2.5-pro
  temperature: 0.2
  max_turns: 15
  timeout_mins: 10

- name: ai-monitoring-agent
  description: "Blue team AI monitoring agent. Use for monitoring AI reasoning chains for logic loops, model drift, adversarial prompt injection, and confidence anomalies across all swarm agents."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - grep_search
  model: gemini-2.5-pro
  temperature: 0.3
  max_turns: 10
  timeout_mins: 5
---

# CyberSwarm Blue Team Agents

These agents form the defensive blue team in the CyberSwarm simulation. They detect, contain, investigate, and recover from threats.

## Agent Roster (7 agents)

### NetworkMonitorAgent
Real-time network traffic monitoring using Zeek and Suricata. Establishes baselines and detects intrusions through signature and anomaly-based detection.

### LogAnalysisAgent
Centralized log analysis using Elastic SIEM and Sigma rules. Correlates events across multiple log sources to identify attack indicators.

### PatchManagementAgent
Automated vulnerability remediation. Deploys patches and verifies fixes for vulnerabilities discovered by scanning agents.

### ContainmentAgent
Rapid threat containment. Isolates compromised hosts, terminates malicious processes, and blocks attacker IPs/domains.

### ForensicsAgent (Sub-agents: MemoryAnalyzer, FileInvestigator)
Post-incident forensics. MemoryAnalyzer examines volatile data for injected processes and rootkits using Volatility. FileInvestigator performs disk forensics and YARA malware scanning using Autopsy.

### RecoveryAgent (Sub-agents: BackupRestorer, IntegrityVerifier)
System restoration. BackupRestorer automates snapshot recovery and rollback. IntegrityVerifier validates checksums and configurations against baselines.

### AIMonitoringAgent
AI reasoning chain monitor. Detects logic loops, model drift, adversarial inputs, and prompt injection across all swarm agents.

## Detection Coverage
Network layer (IDS/IPS), Host layer (EDR/SIEM), Application layer (WAF/logs), AI layer (reasoning integrity).
