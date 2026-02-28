---
name: cyberswarm-remote-agents
description: "CyberSwarm Remote Agent Registry - All 19 agents with A2A-compatible remote endpoints"
version: "1.0.0"
remote_agents:
  # Red Team (ports 9100-9106)
  - name: discovery-agent
    team: red
    endpoint: "http://localhost:9100/agent"
    protocol: a2a
    health_check: "http://localhost:9100/health"

  - name: osint-agent
    team: red
    endpoint: "http://localhost:9101/agent"
    protocol: a2a
    health_check: "http://localhost:9101/health"

  - name: recon-agent
    team: red
    endpoint: "http://localhost:9102/agent"
    protocol: a2a
    health_check: "http://localhost:9102/health"
    sub_agents: [network-scanner, web-crawler]

  - name: vulnerability-scanner-agent
    team: red
    endpoint: "http://localhost:9103/agent"
    protocol: a2a
    health_check: "http://localhost:9103/health"

  - name: exploitation-agent
    team: red
    endpoint: "http://localhost:9104/agent"
    protocol: a2a
    health_check: "http://localhost:9104/health"

  - name: persistence-agent
    team: red
    endpoint: "http://localhost:9105/agent"
    protocol: a2a
    health_check: "http://localhost:9105/health"
    sub_agents: [implant-deployer, evasion-tuner]

  - name: strategy-adaptation-agent
    team: red
    endpoint: "http://localhost:9106/agent"
    protocol: a2a
    health_check: "http://localhost:9106/health"

  # Blue Team (ports 9200-9206)
  - name: network-monitor-agent
    team: blue
    endpoint: "http://localhost:9200/agent"
    protocol: a2a
    health_check: "http://localhost:9200/health"

  - name: log-analysis-agent
    team: blue
    endpoint: "http://localhost:9201/agent"
    protocol: a2a
    health_check: "http://localhost:9201/health"

  - name: patch-management-agent
    team: blue
    endpoint: "http://localhost:9202/agent"
    protocol: a2a
    health_check: "http://localhost:9202/health"

  - name: containment-agent
    team: blue
    endpoint: "http://localhost:9203/agent"
    protocol: a2a
    health_check: "http://localhost:9203/health"

  - name: forensics-agent
    team: blue
    endpoint: "http://localhost:9204/agent"
    protocol: a2a
    health_check: "http://localhost:9204/health"
    sub_agents: [memory-analyzer, file-investigator]

  - name: recovery-agent
    team: blue
    endpoint: "http://localhost:9205/agent"
    protocol: a2a
    health_check: "http://localhost:9205/health"
    sub_agents: [backup-restorer, integrity-verifier]

  - name: ai-monitoring-agent
    team: blue
    endpoint: "http://localhost:9206/agent"
    protocol: a2a
    health_check: "http://localhost:9206/health"

  # Purple Team (ports 9300-9304)
  - name: threat-hunter-agent
    team: purple
    endpoint: "http://localhost:9300/agent"
    protocol: a2a
    health_check: "http://localhost:9300/health"

  - name: incident-response-agent
    team: purple
    endpoint: "http://localhost:9301/agent"
    protocol: a2a
    health_check: "http://localhost:9301/health"

  - name: posture-assessment-agent
    team: purple
    endpoint: "http://localhost:9302/agent"
    protocol: a2a
    health_check: "http://localhost:9302/health"

  - name: threat-intelligence-agent
    team: purple
    endpoint: "http://localhost:9303/agent"
    protocol: a2a
    health_check: "http://localhost:9303/health"

  - name: adaptation-agent
    team: purple
    endpoint: "http://localhost:9304/agent"
    protocol: a2a
    health_check: "http://localhost:9304/health"
    sub_agents: [incident-learner, strategy-optimizer]
---

# CyberSwarm Remote Agent Registry (Kimi)

## Port Allocation
| Team   | Agents | Port Range  |
|--------|--------|-------------|
| Red    | 7      | 9100-9106   |
| Blue   | 7      | 9200-9206   |
| Purple | 5      | 9300-9304   |

## A2A Protocol
All remote agents follow the Agent-to-Agent (A2A) protocol:
- Each agent exposes a `/agent` endpoint for task delegation
- Health checks available at `/health`
- Agents with sub-agents delegate internally to specialized handlers

## Deployment
```bash
# Start all agents
cd cyberswarm_cli && npm run start:agents

# Start specific team
npm run start:agents -- --team red
npm run start:agents -- --team blue
npm run start:agents -- --team purple
```
