---
name: cyberswarm-blue-team
description: "Run CyberSwarm blue team defensive operations. Use when asked to monitor networks, analyze logs, contain threats, perform forensics, or recover systems."
---

# CyberSwarm Blue Team Operations

Execute defensive cybersecurity operations using the 7 blue team agents.

## Agents
1. **NetworkMonitorAgent** - Traffic monitoring (Zeek, Suricata, Wireshark)
2. **LogAnalysisAgent** - SIEM correlation (Elastic, Sigma)
3. **PatchManagementAgent** - Vulnerability remediation
4. **ContainmentAgent** - Rapid threat containment
5. **ForensicsAgent** - Digital forensics with sub-agents:
   - *MemoryAnalyzer* - Volatile data examination (Volatility)
   - *FileInvestigator* - Disk forensics and YARA scanning (Autopsy)
6. **RecoveryAgent** - System restoration with sub-agents:
   - *BackupRestorer* - Automated snapshot recovery
   - *IntegrityVerifier* - Checksum and configuration validation
7. **AIMonitoringAgent** - AI reasoning chain integrity

## Defense Chain
```
Monitor → Detect → Contain → Investigate → Recover → Verify
```

## Self-Healing Loop
AIMonitoring detects anomaly → Forensics investigates → Recovery restores → AdaptationAgent learns
