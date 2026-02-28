#!/bin/bash
# CyberSwarm Context Injection Hook
# Injects current swarm state before each agent turn

SWARM_STATE=""
STATE_FILE="${GEMINI_PROJECT_DIR:-$(pwd)}/output/swarm-state.json"

if [ -f "$STATE_FILE" ]; then
  AGENT_COUNT=$(jq -r '.agents | length // 0' "$STATE_FILE" 2>/dev/null || echo "0")
  EVENTS=$(jq -r '.events | length // 0' "$STATE_FILE" 2>/dev/null || echo "0")
  SWARM_STATE="[CyberSwarm] Active agents: $AGENT_COUNT | Events processed: $EVENTS"
fi

if [ -n "$SWARM_STATE" ]; then
  jq -n --arg msg "$SWARM_STATE" '{"systemMessage": $msg}'
else
  echo '{}'
fi
exit 0
