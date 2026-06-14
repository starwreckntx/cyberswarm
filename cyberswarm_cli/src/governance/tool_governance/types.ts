/**
 * Shared types for Layer-1 tool governance.
 */
import type { SecurityTool } from "../../types.js";

/** Permission classification, mirroring CyberSwarm's risk vocabulary. */
export type Permission = "read-only" | "workspace-write" | "danger-full-access";

export const PERMISSION_READ_ONLY: Permission = "read-only";
export const PERMISSION_WORKSPACE_WRITE: Permission = "workspace-write";
export const PERMISSION_DANGER: Permission = "danger-full-access";

/** A single tool-call request the governor evaluates. */
export interface ToolCallRequest {
  toolId: string;
  agentId: string;
  target?: string;
  /** Free-text options/flags. Treated as untrusted and validated. */
  options?: Record<string, unknown>;
  taskId?: string;
  /** Cross-link: the Layer-2 agent-decision entry_hash that authorized this call. */
  agentDecisionRef?: string | null;
}

/** Per-gate outcome recorded into the governance trace. */
export interface GateOutcome {
  gate: string;
  allowed: boolean;
  detail: string;
}

/** Consent request surfaced to an operator (the agent never sees the nonce). */
export interface ConsentRequest {
  actionId: string;
  toolId: string;
  agentId: string;
  target?: string;
  permission: Permission;
  nonce: string;
}

/** A consent prompt returns the exact string "APPROVE <nonce>" to grant, or null to deny. */
export type ConsentPrompt = (req: ConsentRequest) => string | null;

/** The unified result of routing a tool call through the Layer-1 pipeline. */
export interface ToolGovResult {
  toolId: string;
  agentId: string;
  governed: true;
  allowed: boolean;
  permission: Permission | null;
  denialReason: string | null;
  deniedGate: string | null;
  trace: GateOutcome[];
  auditSeq: number | null;
  auditHash: string | null;
  tool: SecurityTool | null;
  result: unknown;
}
