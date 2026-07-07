/**
 * GovernedToolExecutor — the Layer-1 pipeline.
 *
 * Routes every tool call through, in strict fail-closed order:
 *   validation -> policy -> network-scope -> consent -> HMAC audit -> execute
 *
 * The first gate that refuses short-circuits; the refusal (and an audit record of it) is
 * returned as data — the executor never throws for a policy refusal. CyberSwarm tools are
 * simulated, so "execute" runs an optional caller-supplied `perform` callback (e.g. the
 * agent's logToolUsage path) only after every gate clears.
 */
import type { SecurityTool } from "../../types.js";
import { SecurityToolRegistry, getToolRegistry } from "../../tools/security-tool-registry.js";

import { validateRequest } from "./validation.js";
import { classify } from "./policy.js";
import { NetworkScope } from "./scope.js";
import { ConsentGate, ConsentMode } from "./consent.js";
import { AuditLog } from "./audit.js";
import { ConsentPrompt, GateOutcome, ToolCallRequest, ToolGovResult } from "./types.js";

export interface GovernedToolExecutorOptions {
  registry?: SecurityToolRegistry;
  scopeCidrs?: string[];
  strictScope?: boolean;
  consentMode?: ConsentMode;
  consentPrompt?: ConsentPrompt;
  auditKey?: string;
}

export class GovernedToolExecutor {
  private readonly registry: SecurityToolRegistry;
  private readonly scope: NetworkScope;
  private readonly consent: ConsentGate;
  readonly audit: AuditLog;

  constructor(opts: GovernedToolExecutorOptions = {}) {
    this.registry = opts.registry ?? getToolRegistry();
    this.scope = new NetworkScope(opts.scopeCidrs ?? [], opts.strictScope ?? false);
    this.consent = new ConsentGate(opts.consentMode ?? "deny", opts.consentPrompt);
    this.audit = new AuditLog(opts.auditKey ?? process.env.GOVERNANCE_AUDIT_KEY);
  }

  /**
   * Evaluate (and, if cleared, perform) one governed tool call. `perform` is invoked only
   * when every gate passes; its return value is surfaced as `result`.
   */
  execute(req: ToolCallRequest, perform?: (tool: SecurityTool) => unknown): ToolGovResult {
    const trace: GateOutcome[] = [];
    const base: Omit<ToolGovResult, "allowed" | "denialReason" | "deniedGate" | "permission" | "auditSeq" | "auditHash" | "result"> = {
      toolId: req.toolId,
      agentId: req.agentId,
      governed: true,
      trace,
      tool: null,
    };

    const deny = (gate: string, reason: string, permission: ToolGovResult["permission"] = null): ToolGovResult => {
      const rec = this.audit.record({
        toolId: req.toolId,
        agentId: req.agentId,
        target: req.target,
        permission,
        decision: "DENY",
        reason: `${gate}: ${reason}`,
        agentDecisionRef: req.agentDecisionRef,
      });
      return { ...base, allowed: false, permission, denialReason: reason, deniedGate: gate, auditSeq: rec.seq, auditHash: rec.hmac, result: null };
    };

    // Gate 0: tool must exist in the registry (positive allowlist).
    const tool = this.registry.getTool(req.toolId);
    if (!tool) {
      trace.push({ gate: "allowlist", allowed: false, detail: "unknown tool" });
      return deny("allowlist", `unknown tool ${JSON.stringify(req.toolId)}`);
    }
    base.tool = tool;
    trace.push({ gate: "allowlist", allowed: true, detail: tool.name });

    // Gate 1: input validation (injection-class characters).
    const valid = validateRequest(req.target, req.options ?? {});
    trace.push({ gate: "validation", allowed: valid.valid, detail: valid.detail });
    if (!valid.valid) return deny("validation", valid.detail);

    // Gate 2: policy classification.
    const policy = classify(tool);
    trace.push({ gate: "policy", allowed: true, detail: policy.detail });

    // Gate 3: network scope.
    const scope = this.scope.check(req.target);
    trace.push({ gate: "scope", allowed: scope.allowed, detail: scope.detail });
    if (!scope.allowed) return deny("scope", scope.detail, policy.permission);

    // Gate 4: consent (danger tools only).
    if (policy.requiresConsent) {
      const consent = this.consent.request(req.toolId, req.agentId, policy.permission, req.target);
      trace.push({ gate: "consent", allowed: consent.approved, detail: consent.detail });
      if (!consent.approved) return deny("consent", consent.detail, policy.permission);
    } else {
      trace.push({ gate: "consent", allowed: true, detail: "not required for this permission" });
    }

    // Gate 5: audit ALLOW, then execute.
    const rec = this.audit.record({
      toolId: req.toolId,
      agentId: req.agentId,
      target: req.target,
      permission: policy.permission,
      decision: "ALLOW",
      reason: "all gates cleared",
      agentDecisionRef: req.agentDecisionRef,
    });

    let result: unknown = null;
    if (perform) {
      try {
        result = perform(tool);
      } catch (err) {
        result = { performError: (err as Error).message };
      }
    }

    return {
      ...base,
      allowed: true,
      permission: policy.permission,
      denialReason: null,
      deniedGate: null,
      auditSeq: rec.seq,
      auditHash: rec.hmac,
      result,
    };
  }

  /** Look up a tool definition without side effects (used by the gateway for capability mapping). */
  getTool(toolId: string): SecurityTool | undefined {
    return this.registry.getTool(toolId);
  }

  report(): { audit_valid: boolean; audit_reason: string; audit: ReturnType<AuditLog["export"]> } {
    const [valid, reason] = this.audit.verifyChain();
    return { audit_valid: valid, audit_reason: reason, audit: this.audit.export() };
  }
}
