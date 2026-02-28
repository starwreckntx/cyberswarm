---
- name: discovery-agent
  description: "Red team network reconnaissance agent. Use for host discovery, port scanning, service enumeration, and network mapping against authorized targets."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
    - grep_search
  model: gemini-2.5-pro
  temperature: 0.4
  max_turns: 15
  timeout_mins: 5

- name: osint-agent
  description: "Red team OSINT agent. Use for open-source intelligence gathering including subdomain enumeration, credential exposure analysis, employee profiling, and certificate transparency log mining."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - web_search
    - grep_search
  model: gemini-2.5-pro
  temperature: 0.5
  max_turns: 20
  timeout_mins: 8

- name: recon-agent
  description: "Red team reconnaissance agent with NetworkScanner and WebCrawler sub-agents. Use for comprehensive target footprinting combining port scanning, service enumeration, and web asset discovery."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
    - web_search
    - grep_search
  model: gemini-2.5-pro
  temperature: 0.4
  max_turns: 20
  timeout_mins: 8

- name: vulnerability-scanner-agent
  description: "Red team vulnerability scanning agent. Use for automated vulnerability assessment, CVE detection, web application scanning, and configuration auditing."
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

- name: exploitation-agent
  description: "Red team exploitation agent for authorized penetration testing. Use for vulnerability exploitation, payload delivery, and post-exploitation actions in controlled environments only."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
  model: gemini-2.5-pro
  temperature: 0.3
  max_turns: 15
  timeout_mins: 8

- name: persistence-agent
  description: "Red team persistence agent with ImplantDeployer and EvasionTuner sub-agents. Use for testing persistence mechanisms, backdoor simulation, and evasion technique validation in authorized tests."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - write_file
  model: gemini-2.5-pro
  temperature: 0.3
  max_turns: 15
  timeout_mins: 8

- name: strategy-adaptation-agent
  description: "Red team strategy adaptation agent. Use when blue team detects and blocks attacks—adapts offensive strategy, selects new TTPs, and reevaluates targets."
  kind: local
  tools:
    - run_shell_command
    - read_file
    - grep_search
  model: gemini-2.5-pro
  temperature: 0.7
  max_turns: 10
  timeout_mins: 5
---

# CyberSwarm Red Team Agents

These agents form the offensive red team in the CyberSwarm multi-agent cybersecurity simulation. They operate within authorized penetration testing scope only.

## Agent Roster (7 agents)

### DiscoveryAgent
Network reconnaissance specialist. Discovers live hosts, open ports, running services, and OS fingerprints using Nmap and Masscan.

### OSINTAgent
Open-source intelligence gatherer. Maps attack surface through subdomain enumeration (Amass), exposed service discovery (Shodan), and entity relationship analysis (Maltego).

### ReconAgent (Sub-agents: NetworkScanner, WebCrawler)
Comprehensive reconnaissance combining infrastructure scanning and web asset discovery. NetworkScanner handles port/service enumeration. WebCrawler discovers directories, APIs, and technologies.

### VulnerabilityScannerAgent
Automated vulnerability assessment using Nessus, OpenVAS, Nuclei, and Nikto. Identifies CVEs, misconfigurations, and exploitable weaknesses.

### ExploitationAgent
Controlled exploitation using Metasploit, SQLMap, and Cobalt Strike. Validates vulnerabilities through authorized penetration testing.

### PersistenceAgent (Sub-agents: ImplantDeployer, EvasionTuner)
Tests persistence mechanisms. ImplantDeployer simulates backdoors and scheduled tasks. EvasionTuner applies anti-forensic techniques to test blue team detection.

### StrategyAdaptationAgent
AI-driven tactical adaptation. When detected by blue team, analyzes defensive responses and pivots to alternative attack vectors.

## MITRE ATT&CK Coverage
Reconnaissance (TA0043), Resource Development (TA0042), Initial Access (TA0001), Execution (TA0002), Persistence (TA0003), Privilege Escalation (TA0004), Defense Evasion (TA0005), Credential Access (TA0006), Discovery (TA0007), Lateral Movement (TA0008).

## Rules of Engagement
- Only target RFC1918 (private) network ranges
- All actions logged to audit trail
- Exploitation requires explicit authorization
- Evasion techniques for detection testing only
