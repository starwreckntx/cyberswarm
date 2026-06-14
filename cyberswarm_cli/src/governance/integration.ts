/**
 * Integration surface — wires the GovernanceGateway into the live CyberSwarm runtime.
 *
 * Design goals:
 *  - Non-regressing: governance is OPT-IN. With GOVERNANCE_ENABLED unset, every helper is a
 *    transparent pass-through and the existing simulation behaves exactly as before.
 *  - Fail-closed when on: once enabled, a denied handoff routes control to the safe
 *    coordinator and a denied tool call is reported as denied data (the agent can reason
 *    over the refusal).
 *  - Documented kill-switch: GOVERNANCE_DISABLED=1 forces pass-through even if
 *    GOVERNANCE_ENABLED=1, to isolate a suspected governance bug.
 *
 * Environment:
 *   GOVERNANCE_ENABLED=1            turn governance on in the live path (default: off)
 *   GOVERNANCE_DISABLED=1          hard kill-switch (overrides ENABLED)
 *   GOVERNANCE_CONSENT_MODE        "deny" | "preauth" (default when enabled: "preauth")
 *   GOVERNANCE_SESSION_AUTHORIZED  "1" to auto-approve danger tools under preauth
 *   GOVERNANCE_SCOPE_CIDRS         comma-separated extra engagement CIDRs
 *   GOVERNANCE_STRICT_SCOPE=1      deny non-IP / non-RFC1918 targets
 *   GOVERNANCE_AUDIT_KEY           HMAC key for the Layer-1 tool audit
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { SecurityTool } from "../types.js";

import { GovernanceGateway } from "./gateway.js";
import type { GatewayToolResult } from "./gateway.js";
import { ConsentMode } from "./tool_governance/index.js";
import { EVENT_SOURCE_ROLE } from "./swarm_integrity/index.js";

export function governanceEnabled(): boolean {
  if (process.env.GOVERNANCE_DISABLED === "1") return false;
  return process.env.GOVERNANCE_ENABLED === "1";
}

let _gateway: GovernanceGateway | null = null;

/** The process-wide gateway. Lazily created, session opened, coordinator elected. */
export function getGateway(): GovernanceGateway {
  if (_gateway) return _gateway;
  const consentMode = (process.env.GOVERNANCE_CONSENT_MODE as ConsentMode) || "preauth";
  const scopeCidrs = (process.env.GOVERNANCE_SCOPE_CIDRS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const gw = new GovernanceGateway({
    consentMode,
    scopeCidrs,
    strictScope: process.env.GOVERNANCE_STRICT_SCOPE === "1",
    auditKey: process.env.GOVERNANCE_AUDIT_KEY,
  });
  gw.auditor.openSession("cyberswarm-live");
  gw.auditor.electCoordinator();
  _gateway = gw;
  return gw;
}

/** Drop the singleton (for tests / fresh runs). */
export function resetGateway(): void {
  _gateway = null;
}

export interface HandoffDecision {
  allowed: boolean;
  /** Where control should go: the destination if allowed, else the safe fallback. */
  route: string;
  reason: string;
  verdict: string;
}

/**
 * Govern an orchestrator control transfer (one agent's event routed to another agent's
 * task). When governance is off this always allows and routes to dest.
 */
export function governedHandoff(sourceAgentType: string, destAgentType: string): HandoffDecision {
  if (!governanceEnabled()) {
    return { allowed: true, route: destAgentType, reason: "governance disabled", verdict: "ALLOW" };
  }
  const v = getGateway().governHandoff(sourceAgentType, destAgentType);
  return {
    allowed: v.allowed,
    route: v.allowed ? destAgentType : v.fallback ?? destAgentType,
    reason: v.reason,
    verdict: v.verdict,
  };
}

/**
 * Govern a tool call by an agent. When governance is off, runs `perform` directly and
 * returns a transparent allowed envelope. When on, routes through Layer 2 then Layer 1.
 */
export function governedToolCall(
  agentType: string,
  toolId: string,
  target: string | undefined,
  options: Record<string, unknown> | undefined,
  perform?: (tool: SecurityTool) => unknown,
  taskId?: string,
): GatewayToolResult {
  if (!governanceEnabled()) {
    return {
      toolId,
      agent: agentType,
      allowed: true,
      deniedStage: null,
      denialReason: null,
      agentIntegrity: null,
      toolGovernance: null,
      result: perform ? perform(undefined as unknown as SecurityTool) : null,
    };
  }
  return getGateway().governToolCall(agentType, toolId, target, options, perform, taskId);
}

/**
 * Govern a Logic Pipe task creation: the source is the canonical emitter of `eventType`,
 * the dest is the agentType the rule is about to task. Returns whether the downstream task
 * may proceed. When governance is off, or the event has no known source role, it allows.
 */
export function governTaskCreation(eventType: string, destAgentType: string): HandoffDecision {
  if (!governanceEnabled()) {
    return { allowed: true, route: destAgentType, reason: "governance disabled", verdict: "ALLOW" };
  }
  const sourceRole = EVENT_SOURCE_ROLE[eventType];
  if (!sourceRole) {
    return { allowed: true, route: destAgentType, reason: `no source role for ${eventType}`, verdict: "ALLOW" };
  }
  return governedHandoff(sourceRole, destAgentType);
}

/** Persist both audit chains to a directory. Returns the written paths. */
export function exportGovernanceAudit(dir: string): { agent: string; tool: string } {
  mkdirSync(dir, { recursive: true });
  const gw = getGateway();
  const agentPath = join(dir, "agent_decision_log.json");
  const toolPath = join(dir, "tool_audit_log.json");
  writeFileSync(agentPath, JSON.stringify(gw.auditor.trail.export(), null, 2));
  writeFileSync(toolPath, JSON.stringify(gw.executor.audit.export(), null, 2));
  return { agent: agentPath, tool: toolPath };
}
