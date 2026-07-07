/**
 * Consent gate (Mirror_RTC analogue) — Layer 1.
 *
 * Default-deny human-in-the-loop gate for danger-full-access tools. The agent never sees
 * the nonce: only an operator (via the prompt strategy) can return the exact "APPROVE
 * <nonce>" string that grants the action. A prompt-injected or runaway agent cannot forge
 * approval.
 *
 * Strategies:
 *  - "deny"    : every danger action is denied (no operator present).
 *  - "preauth" : approve iff env GOVERNANCE_SESSION_AUTHORIZED === "1" (evaluated
 *                dynamically per call, so authorization can be toggled mid-session).
 *  - custom    : an operator-supplied ConsentPrompt (e.g. an out-of-band file broker).
 */
import { randomBytes } from "node:crypto";

import { ConsentPrompt, ConsentRequest, Permission } from "./types.js";

export type ConsentMode = "deny" | "preauth";

export interface ConsentDecision {
  approved: boolean;
  detail: string;
  nonce: string;
}

function denyPrompt(): ConsentPrompt {
  return () => null;
}

function preauthPrompt(): ConsentPrompt {
  return (req: ConsentRequest) => {
    if (process.env.GOVERNANCE_SESSION_AUTHORIZED === "1") return `APPROVE ${req.nonce}`;
    return null;
  };
}

export class ConsentGate {
  private readonly prompt: ConsentPrompt;

  constructor(mode: ConsentMode = "deny", customPrompt?: ConsentPrompt) {
    this.prompt = customPrompt ?? (mode === "preauth" ? preauthPrompt() : denyPrompt());
  }

  /** Evaluate consent for a danger action. Returns approved iff prompt returns "APPROVE <nonce>". */
  request(toolId: string, agentId: string, permission: Permission, target?: string): ConsentDecision {
    const nonce = randomBytes(8).toString("hex");
    const req: ConsentRequest = { actionId: `${toolId}-${nonce}`, toolId, agentId, target, permission, nonce };
    let reply: string | null = null;
    try {
      reply = this.prompt(req);
    } catch {
      reply = null; // fail closed if the prompt itself errors
    }
    if (reply === `APPROVE ${nonce}`) {
      return { approved: true, detail: `operator approved ${req.actionId}`, nonce };
    }
    return { approved: false, detail: "consent not granted (default-deny)", nonce };
  }
}
