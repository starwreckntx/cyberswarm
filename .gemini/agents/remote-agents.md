---
# CyberSwarm Remote Sub-agents (A2A Protocol)
# These agents run as remote services and communicate via Agent-to-Agent protocol.
# Deploy each as an A2A-compliant server and update URLs below.

# Red Team Remote Agents
- kind: remote
  name: remote-discovery
  agent_card_url: http://localhost:9100/.well-known/agent.json

- kind: remote
  name: remote-osint
  agent_card_url: http://localhost:9101/.well-known/agent.json

- kind: remote
  name: remote-recon
  agent_card_url: http://localhost:9102/.well-known/agent.json

- kind: remote
  name: remote-vuln-scanner
  agent_card_url: http://localhost:9103/.well-known/agent.json

- kind: remote
  name: remote-exploitation
  agent_card_url: http://localhost:9104/.well-known/agent.json

- kind: remote
  name: remote-persistence
  agent_card_url: http://localhost:9105/.well-known/agent.json

- kind: remote
  name: remote-strategy
  agent_card_url: http://localhost:9106/.well-known/agent.json

# Blue Team Remote Agents
- kind: remote
  name: remote-net-monitor
  agent_card_url: http://localhost:9200/.well-known/agent.json

- kind: remote
  name: remote-log-analysis
  agent_card_url: http://localhost:9201/.well-known/agent.json

- kind: remote
  name: remote-patch-mgmt
  agent_card_url: http://localhost:9202/.well-known/agent.json

- kind: remote
  name: remote-containment
  agent_card_url: http://localhost:9203/.well-known/agent.json

- kind: remote
  name: remote-forensics
  agent_card_url: http://localhost:9204/.well-known/agent.json

- kind: remote
  name: remote-recovery
  agent_card_url: http://localhost:9205/.well-known/agent.json

- kind: remote
  name: remote-ai-monitor
  agent_card_url: http://localhost:9206/.well-known/agent.json

# Purple Team Remote Agents
- kind: remote
  name: remote-threat-hunter
  agent_card_url: http://localhost:9300/.well-known/agent.json

- kind: remote
  name: remote-incident-response
  agent_card_url: http://localhost:9301/.well-known/agent.json

- kind: remote
  name: remote-posture-assess
  agent_card_url: http://localhost:9302/.well-known/agent.json

- kind: remote
  name: remote-threat-intel
  agent_card_url: http://localhost:9303/.well-known/agent.json

- kind: remote
  name: remote-adaptation
  agent_card_url: http://localhost:9304/.well-known/agent.json
---

# CyberSwarm Remote Agents (A2A Protocol)

Remote sub-agents that run as independent A2A-compliant services. Each agent exposes a `.well-known/agent.json` card endpoint describing its capabilities.

## Deployment

Each remote agent runs as a standalone service:

```bash
# Start all remote agents
docker-compose -f docker/cyberswarm-agents.yml up -d

# Or start individually
python -m cyberswarm.agents.discovery --port 9100
python -m cyberswarm.agents.osint --port 9101
# ... etc
```

## Port Allocation

| Port Range | Team   | Agents                                                    |
|-----------|--------|-----------------------------------------------------------|
| 9100-9106 | Red    | Discovery, OSINT, Recon, VulnScanner, Exploit, Persist, Strategy |
| 9200-9206 | Blue   | NetMonitor, LogAnalysis, PatchMgmt, Contain, Forensics, Recovery, AIMonitor |
| 9300-9304 | Purple | ThreatHunter, IncidentResponse, PostureAssess, ThreatIntel, Adaptation |

## A2A Agent Card Format

Each service must expose `/.well-known/agent.json`:

```json
{
  "name": "discovery-agent",
  "description": "Network reconnaissance and host discovery",
  "url": "http://localhost:9100",
  "version": "1.0.0",
  "capabilities": {
    "streaming": false,
    "pushNotifications": false
  },
  "skills": [
    {"id": "network_scan", "name": "Network Scan"},
    {"id": "targeted_scan", "name": "Targeted Scan"}
  ]
}
```
