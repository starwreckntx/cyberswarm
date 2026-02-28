---
name: cyberswarm-red-team
description: "Run CyberSwarm red team offensive operations. Use when asked to simulate attacks, perform reconnaissance, exploit vulnerabilities, or test defenses with red team agents."
---

# CyberSwarm Red Team Operations

Execute offensive cybersecurity operations using the 7 red team agents.

## Agents
1. **DiscoveryAgent** - Network scanning (Nmap, Masscan)
2. **OSINTAgent** - Open-source intelligence (Amass, Shodan, Maltego)
3. **ReconAgent** - Comprehensive recon with sub-agents:
   - *NetworkScanner* - Port/service enumeration
   - *WebCrawler* - Web asset discovery
4. **VulnerabilityScannerAgent** - Vuln assessment (Nessus, OpenVAS, Nuclei)
5. **ExploitationAgent** - Controlled exploitation (Metasploit, SQLMap)
6. **PersistenceAgent** - Post-exploitation with sub-agents:
   - *ImplantDeployer* - Backdoor deployment
   - *EvasionTuner* - Anti-forensic techniques
7. **StrategyAdaptationAgent** - Tactical adaptation when detected

## Attack Chain
```
OSINT → Recon → Discovery → VulnScan → Exploitation → Persistence → Adaptation
```

## Rules of Engagement
- ONLY target authorized RFC1918 networks
- Log ALL actions to audit trail
- Coordinate with purple team for validated testing
