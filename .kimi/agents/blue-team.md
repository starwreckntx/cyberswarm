---
name: cyberswarm-blue-team
description: "CyberSwarm Blue Team - 7 defensive security agents for threat detection and response"
version: "1.0.0"
agents:
  - name: network-monitor-agent
    role: "Real-Time Network Traffic Monitor"
    team: blue
    tools: [zeek, suricata, wireshark, tcpdump]
    detection: [T1071, T1572, T1048, T1095]
    temperature: 0.3
    events:
      emits: [ALERT_TRIGGERED]
      subscribes: []

  - name: log-analysis-agent
    role: "SIEM Correlation Analyst"
    team: blue
    tools: [elastic_siem, sigma, logstash]
    detection: [T1059, T1078, T1098]
    temperature: 0.3
    events:
      emits: [LOG_ANOMALY_DETECTED]
      subscribes: [ALERT_TRIGGERED, ADAPTATION_INSIGHT]

  - name: patch-management-agent
    role: "Vulnerability Remediation Specialist"
    team: blue
    tools: [ansible, package_managers]
    temperature: 0.2
    events:
      emits: [PATCH_DEPLOYED, PATCH_VERIFIED]
      subscribes: [VULNERABILITY_FOUND]

  - name: containment-agent
    role: "Rapid Threat Containment Operator"
    team: blue
    tools: [iptables, fail2ban, containment_scripts]
    temperature: 0.2
    events:
      emits: [CONTAINMENT_ACTION]
      subscribes: [ALERT_TRIGGERED, EXPLOIT_SUCCESS, PERSISTENCE_ACHIEVED]

  - name: forensics-agent
    role: "Digital Forensics Investigator"
    team: blue
    tools: [volatility, autopsy, yara, velociraptor, grr]
    detection: [T1055, T1014, T1070]
    temperature: 0.2
    sub_agents:
      - name: memory-analyzer
        role: "Volatile memory examination - RAM dumps, injected processes, rootkits"
        primary_tool: volatility
        tasks: [analyze_memory]
      - name: file-investigator
        role: "Disk forensics - file analysis, YARA scanning, deleted file recovery"
        primary_tool: autopsy
        tasks: [investigate_files, build_timeline]
    events:
      emits: [FORENSIC_ANALYSIS_COMPLETE]
      subscribes: [CONTAINMENT_ACTION, PERSISTENCE_ACHIEVED]

  - name: recovery-agent
    role: "System Restoration Coordinator"
    team: blue
    tools: [rsync, lvm_snapshots, aide, tripwire]
    temperature: 0.2
    sub_agents:
      - name: backup-restorer
        role: "Automated snapshot recovery, system rollback, point-in-time recovery"
        tasks: [restore_backup, rollback_system]
      - name: integrity-verifier
        role: "Checksum validation, config drift detection, service health checks"
        tasks: [verify_integrity, rebuild_service]
    events:
      emits: [RECOVERY_COMPLETE, RECOVERY_FAILED]
      subscribes: [FORENSIC_ANALYSIS_COMPLETE, SWARM_ANOMALY]

  - name: ai-monitoring-agent
    role: "AI Reasoning Chain Integrity Monitor"
    team: blue
    tools: [monitoring_scripts, confidence_scoring]
    temperature: 0.3
    events:
      emits: [SWARM_ANOMALY]
      subscribes: [ALL_AGENT_OUTPUTS]
---

# CyberSwarm Blue Team Agents (Kimi)

## 7 Defensive Agents

### Defense Chain
```
Monitor → Detect → Contain → Investigate → Recover → Verify
```

### Sub-Agent Architecture
- **ForensicsAgent**: MemoryAnalyzer (Volatility) + FileInvestigator (Autopsy/YARA)
- **RecoveryAgent**: BackupRestorer (snapshots) + IntegrityVerifier (checksums/FIM)

### Self-Healing Loop
AIMonitoring detects anomaly → Forensics investigates → Recovery restores → AdaptationAgent learns

### Detection Coverage
- Network layer: IDS/IPS (Zeek, Suricata)
- Host layer: EDR/SIEM (Elastic, Sigma)
- Application layer: WAF/logs
- AI layer: Reasoning chain integrity monitoring
