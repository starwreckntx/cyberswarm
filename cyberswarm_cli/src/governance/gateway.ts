/**
 * GovernanceGateway — the unified chokepoint composing Layer 2 + Layer 1.
 *
 * A single object the swarm routes through for the two governed operations:
 *
 *   governHandoff(source, dest)            -> Layer 2 only  (control transfer integrity)
 *   governToolCall(agent, toolId, ...)     -> Layer 2 then Layer 1  (role gate, then tool gate)
 *
 * For a tool call the gateway first asks the ShadowAuditor "is this agent's ROLE entitled to
 * the capability this tool's category implies?" (Layer 2). Only if that ALLOWs does it run
 * the KKI-style tool pipeline (Layer 1: validation -> policy -> scope -> consent -> HMAC
 * audit). The Layer-1 audit entry carries the Layer-2 decision's entry_hash as
 * agent_decision_ref, so the two chains — agent decision and tool call — cross-link by
 * reference without merging (one is replay-deterministic, the other keyed/tamper-evident).
 *
 * Agent-level integrity governs *who acts and how control moves*; tool-level governance
 * governs *what each tool call may do*.
 */
import type { SecurityTool } from "../types.js";

import {
  ShadowAuditor,
  IntegrityVerdict,
  TOOL_CATEGORY_CAPABILITY,
} from "./swarm_integrity/index.js";
import {
  GovernedToolExecutor,
  GovernedToolExecutorOptions,
  ToolGovResult,
} from "./tool_governance/index.js";

export interface GatewayOptions extends GovernedToolExecutorOptions {
  auditor?: ShadowAuditor;
  enforceAgentIntegrity?: boolean;
}

export interface GatewayToolResult {
  toolId: string;
  agent: string;
  allowed: boolean;
  deniedStage: "agent_integrity" | "tool_governance" | null;
  denialReason: string | null;
  agentIntegrity: ReturnType<IntegrityVerdict["toDict"]> | null;
  toolGovernance: ToolGovResult | null;
  result: unknown;
}

export class GovernanceGateway {
  readonly auditor: ShadowAuditor;
  readonly executor: GovernedToolExecutor;
  private readonly enforceAgentIntegrity: boolean;

  constructor(opts: GatewayOptions = {}) {
    this.auditor = opts.auditor ?? new ShadowAuditor();
    this.executor = new GovernedToolExecutor(opts);
    this.enforceAgentIntegrity = opts.enforceAgentIntegrity ?? true;
  }

  /** Govern a control transfer (Logic Pipe routing source -> dest). Layer 2 only. */
  governHandoff(sourceAgentType: string, destAgentType: string): IntegrityVerdict {
    return this.auditor.submitHandoff(sourceAgentType, destAgentType);
  }

  /**
   * Govern a tool call by an agent. Returns a unified envelope; never throws for a policy
   * refusal. `perform` runs only when BOTH layers allow.
   */
  governToolCall(
    agentType: string,
    toolId: string,
    target?: string,
    options?: Record<string, unknown>,
    perform?: (tool: SecurityTool) => unknown,
    taskId?: string,
  ): GatewayToolResult {
    const base: Omit<GatewayToolResult, "allowed" | "deniedStage" | "denialReason" | "agentIntegrity" | "toolGovernance" | "result"> = {
      toolId,
      agent: agentType,
    };

    // Layer 2: role-integrity capability gate. The capability is implied by the tool's
    // category; resolve it once we know the tool exists.
    let agentVerdict: IntegrityVerdict | null = null;
    if (this.enforceAgentIntegrity) {
      const cap = this.capabilityForTool(toolId);
      if (cap) {
        agentVerdict = this.auditor.submitCapability(agentType, cap);
        if (!agentVerdict.allowed) {
          return {
            ...base,
            allowed: false,
            deniedStage: "agent_integrity",
            denialReason: agentVerdict.reason,
            agentIntegrity: agentVerdict.toDict(),
            toolGovernance: null,
            result: null,
          };
        }
      }
    }

    // Layer 1: tool governance pipeline, cross-linked to the Layer-2 decision.
    const toolResult = this.executor.execute(
      {
        toolId,
        agentId: agentType,
        target,
        options,
        taskId,
        agentDecisionRef: agentVerdict?.entryHash ?? null,
      },
      perform,
    );

    return {
      ...base,
      allowed: toolResult.allowed,
      deniedStage: toolResult.allowed ? null : "tool_governance",
      denialReason: toolResult.denialReason,
      agentIntegrity: agentVerdict?.toDict() ?? null,
      toolGovernance: toolResult,
      result: toolResult.result,
    };
  }

  /** Map a tool's registry category to the Layer-2 capability it asserts. */
  private capabilityForTool(toolId: string): string | null {
    const tool = this.executor.getTool(toolId);
    if (!tool) return null;
    return TOOL_CATEGORY_CAPABILITY[tool.category] ?? null;
  }

  report(): { agent_integrity: ReturnType<ShadowAuditor["sessionReport"]>; tool_governance: ReturnType<GovernedToolExecutor["report"]> } {
    return {
      agent_integrity: this.auditor.sessionReport(),
      tool_governance: this.executor.report(),
    };
  }
}
