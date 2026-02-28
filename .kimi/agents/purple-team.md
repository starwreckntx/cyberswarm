---
name: cyberswarm-purple-team
description: "CyberSwarm Purple Team - 5 integrative security agents for threat hunting, IR, and swarm optimization"
version: "1.0.0"
agents:
  - name: threat-hunter-agent
    role: "Proactive Threat Hunter"
    team: purple
    tools: [yara, sigma, osquery, atomic_red_team]
    temperature: 0.4
    events:
      emits: [THREAT_DETECTED]
      subscribes: [ALERT_TRIGGERED, PERSISTENCE_ACHIEVED, ADAPTATION_INSIGHT]

  - name: incident-response-agent
    role: "Incident Response Lifecycle Manager"
    team: purple
    tools: [thehive, cortex, grr, velociraptor]
    temperature: 0.3
    events:
      emits: [INCIDENT_RESPONSE_ACTION]
      subscribes: [THREAT_DETECTED, ALERT_TRIGGERED, EXPLOIT_SUCCESS]

  - name: posture-assessment-agent
    role: "Security Posture Evaluator"
    team: purple
    tools: [mitre_navigator, compliance_frameworks]
    temperature: 0.3
    events:
      emits: [POSTURE_ASSESSED]
      subscribes: [RECOVERY_COMPLETE, PATCH_VERIFIED, ADAPTATION_INSIGHT]

  - name: threat-intelligence-agent
    role: "IOC Correlation Analyst"
    team: purple
    tools: [misp, opencti, maltego, stix_taxii]
    temperature: 0.4
    events:
      emits: [THREAT_INTEL_ENRICHED]
      subscribes: [OSINT_DATA_COLLECTED, THREAT_DETECTED, ALERT_TRIGGERED]

  - name: adaptation-agent
    role: "Swarm Learning and Strategy Optimizer"
    team: purple
    tools: [ml_pipeline, statistical_analysis, rule_engine]
    temperature: 0.4
    sub_agents:
      - name: incident-learner
        role: "Feedback loop analysis, lessons learned, detection scoring, pattern recognition"
        tasks: [learn_from_incident]
      - name: strategy-optimizer
        role: "ML rule refinement, model tuning, false positive reduction, swarm optimization"
        tasks: [optimize_strategy, tune_models, assess_swarm_health]
    events:
      emits: [ADAPTATION_INSIGHT, STRATEGY_OPTIMIZED, SWARM_ANOMALY]
      subscribes: [RECOVERY_COMPLETE, INCIDENT_RESPONSE_ACTION, FORENSIC_ANALYSIS_COMPLETE]
---

# CyberSwarm Purple Team Agents (Kimi)

## 5 Integrative Agents

### Integration Flows
- Hunt findings → Incident Response triage
- Defense actions → Posture Assessment evaluation
- Attack adaptation → Threat Intel correlation
- Recovery complete → Adaptation learning loop
- Swarm anomaly → self-healing (Recovery + Adaptation)

### Sub-Agent Architecture
- **AdaptationAgent**: IncidentLearner + StrategyOptimizer sub-agents
  - IncidentLearner: Feedback loop analysis and lessons learned
  - StrategyOptimizer: ML-based rule refinement and model tuning

### Logic Pipe Cascading Rules
1. RECON_ENRICHES_OSINT: Recon findings → Discovery+OSINT
2. PERSISTENCE_TRIGGERS_FORENSICS: Persistence → Forensics+ThreatHunt+AIMonitor
3. FORENSIC_TRIGGERS_RECOVERY: Forensics → Recovery+Containment
4. RECOVERY_TRIGGERS_ADAPTATION: Recovery → Adaptation+PostureAssessment
5. ADAPTATION_ENRICHES_BLUE: Adaptation → AIMonitor+LogAnalysis
6. SWARM_ANOMALY_TRIGGERS_HEAL: Anomaly → Recovery+Adaptation
