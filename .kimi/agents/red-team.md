---
name: cyberswarm-red-team
description: "CyberSwarm Red Team - 7 offensive security agents for attack simulation"
version: "1.0.0"
agents:
  - name: discovery-agent
    role: "Network Discovery Scanner"
    team: red
    tools: [nmap, masscan, zmap]
    mitre: [T1046, T1018, T1016]
    temperature: 0.4
    events:
      emits: [SCAN_COMPLETE]
      subscribes: []

  - name: osint-agent
    role: "Open-Source Intelligence Gatherer"
    team: red
    tools: [amass, shodan, maltego, theHarvester]
    mitre: [T1589, T1590, T1591, T1593]
    temperature: 0.5
    events:
      emits: [OSINT_DATA_COLLECTED]
      subscribes: [RECON_SCAN_COMPLETE]

  - name: recon-agent
    role: "Comprehensive Reconnaissance Coordinator"
    team: red
    tools: [nmap, masscan, amass, gobuster, wappalyzer]
    mitre: [T1595, T1592, T1590]
    temperature: 0.4
    sub_agents:
      - name: network-scanner
        role: "Port/service enumeration, banner grabbing, protocol analysis"
        tasks: [network_scan, service_enumeration]
      - name: web-crawler
        role: "Web asset discovery, directory enumeration, tech stack ID"
        tasks: [web_crawl, footprint_target]
    events:
      emits: [RECON_SCAN_COMPLETE]
      subscribes: [SCAN_COMPLETE]

  - name: vulnerability-scanner-agent
    role: "Vulnerability Assessment Specialist"
    team: red
    tools: [nessus, openvas, nuclei, nikto]
    mitre: [T1595.002, T1190]
    temperature: 0.3
    events:
      emits: [VULNERABILITY_FOUND]
      subscribes: [SCAN_COMPLETE, RECON_SCAN_COMPLETE]

  - name: exploitation-agent
    role: "Controlled Exploitation Operator"
    team: red
    tools: [metasploit, sqlmap, crackmapexec, impacket]
    mitre: [T1190, T1068, T1210]
    temperature: 0.3
    events:
      emits: [EXPLOIT_ATTEMPTED, EXPLOIT_SUCCESS]
      subscribes: [VULNERABILITY_FOUND]

  - name: persistence-agent
    role: "Post-Exploitation Persistence Specialist"
    team: red
    tools: [cobalt_strike, sliver, msfvenom, metasploit]
    mitre: [T1547, T1053, T1543, T1055, T1070]
    temperature: 0.3
    sub_agents:
      - name: implant-deployer
        role: "C2 implant deployment, backdoor installation, beacon config"
        tasks: [deploy_implant, establish_persistence]
      - name: evasion-tuner
        role: "Anti-forensic techniques, detection evasion, process injection"
        tasks: [tune_evasion, validate_persistence]
    events:
      emits: [PERSISTENCE_ACHIEVED, PERSISTENCE_DETECTED]
      subscribes: [EXPLOIT_SUCCESS]

  - name: strategy-adaptation-agent
    role: "Tactical Adaptation Controller"
    team: red
    tools: [metasploit]
    mitre: [T1036, T1027, T1480]
    temperature: 0.5
    events:
      emits: [STRATEGY_ADAPTED]
      subscribes: [CONTAINMENT_ACTION]
---

# CyberSwarm Red Team Agents (Kimi)

## 7 Offensive Agents

### Attack Chain
```
OSINT → Recon → Discovery → VulnScan → Exploitation → Persistence → Adaptation
```

### Sub-Agent Architecture
- **ReconAgent**: NetworkScanner + WebCrawler sub-agents for deep reconnaissance
- **PersistenceAgent**: ImplantDeployer + EvasionTuner sub-agents for post-exploitation

### Rules of Engagement
- ONLY target authorized RFC1918 networks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
- Log ALL actions to audit trail
- Coordinate with purple team for validated testing
- All implants must have kill switches
