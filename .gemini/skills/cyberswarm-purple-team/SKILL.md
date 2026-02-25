---
name: cyberswarm-purple-team
description: "Run CyberSwarm purple team integrative operations. Use when asked to hunt threats, respond to incidents, assess security posture, correlate threat intelligence, or adapt swarm strategies."
---

# CyberSwarm Purple Team Operations

Execute integrative cybersecurity operations using the 5 purple team agents.

## Agents
1. **ThreatHunterAgent** - Proactive threat hunting (YARA, Sigma, osquery, Atomic Red Team)
2. **IncidentResponseAgent** - Full IR lifecycle (TheHive, Cortex, GRR, Velociraptor)
3. **PostureAssessmentAgent** - Gap analysis and MITRE coverage mapping
4. **ThreatIntelligenceAgent** - IOC correlation (MISP, OpenCTI, Maltego)
5. **AdaptationAgent** - Swarm learning with sub-agents:
   - *IncidentLearner* - Feedback loop analysis and lessons learned
   - *StrategyOptimizer* - ML-based rule refinement and model tuning

## Integration Flows
- Hunt findings → Incident Response triage
- Defense actions → Posture Assessment evaluation
- Attack adaptation → Threat Intel correlation
- Recovery complete → Adaptation learning loop
- Swarm anomaly → self-healing (Recovery + Adaptation)
