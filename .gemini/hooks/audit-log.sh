#!/bin/bash
# CyberSwarm Audit Log Hook
# Records all tool executions to audit trail for forensic review

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName // "unknown"')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SESSION_ID="${GEMINI_SESSION_ID:-unknown}"
LOG_DIR="${GEMINI_PROJECT_DIR:-$(pwd)}/output/audit"

mkdir -p "$LOG_DIR" 2>/dev/null

echo "{\"timestamp\":\"$TIMESTAMP\",\"session\":\"$SESSION_ID\",\"tool\":\"$TOOL_NAME\"}" >> "$LOG_DIR/audit.jsonl" 2>/dev/null

echo '{"decision": "allow"}'
exit 0
