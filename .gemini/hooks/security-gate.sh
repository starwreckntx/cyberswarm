#!/bin/bash
# CyberSwarm Security Gate Hook
# Validates tool calls against security policy before execution
# Blocks dangerous operations outside authorized simulation scope

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName // empty')
ARGS=$(echo "$INPUT" | jq -r '.arguments // empty')

echo "security-gate: checking $TOOL_NAME" >&2

# Block destructive commands outside simulation
if echo "$ARGS" | grep -qiE '(rm -rf /|mkfs|dd if=|:(){ :|fork bomb|shutdown|reboot)'; then
  echo '{"decision": "deny", "reason": "Blocked: destructive system command detected outside simulation scope"}'
  exit 0
fi

# Block network attacks against non-authorized targets
if echo "$ARGS" | grep -qiE '(nmap|masscan|nikto|sqlmap|metasploit)' && ! echo "$ARGS" | grep -qE '192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.'; then
  echo '{"decision": "deny", "reason": "Blocked: offensive tool targeting non-RFC1918 address. Only authorized lab networks allowed."}'
  exit 0
fi

echo '{"decision": "allow"}'
exit 0
