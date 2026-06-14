/**
 * HMAC hash-chained audit (Mnemosyne analogue) — Layer 1.
 *
 * Append-only, keyed, tamper-evident trail of every governed tool decision. Each entry is
 * chained: hmac_i = HMAC-SHA256(key, prevHmac || canonical(entry)). Any edit to a past
 * entry (or a reorder) breaks every subsequent link under verifyChain().
 *
 * Deliberately DIFFERENT from the Layer-2 agent chain: this one is keyed and includes a
 * wall-clock timestamp, so it is NOT replay-reproducible — that is by design (tamper-
 * evidence over determinism). The two chains cross-link by reference (the Layer-2 decision
 * carries this chain's seq + hmac as kkiAuditRef) rather than merging.
 */
import { createHmac, randomBytes } from "node:crypto";

export interface AuditEntry {
  seq: number;
  prev_hmac: string;
  timestamp: string;
  tool_id: string;
  agent_id: string;
  target: string | null;
  permission: string | null;
  decision: string; // "ALLOW" | "DENY"
  reason: string;
  /** Cross-link: the Layer-2 agent-decision entry_hash that authorized this tool call. */
  agent_decision_ref: string | null;
  hmac?: string;
}

export interface AuditExport {
  algorithm: "HMAC-SHA256";
  key_fingerprint: string;
  entry_count: number;
  head_hmac: string;
  entries: AuditEntry[];
}

function canonical(obj: Record<string, unknown>): string {
  const sorted: Record<string, unknown> = {};
  for (const k of Object.keys(obj).sort()) sorted[k] = obj[k];
  return JSON.stringify(sorted);
}

export class AuditLog {
  private readonly key: Buffer;
  private readonly _entries: AuditEntry[] = [];
  private _head: string;

  constructor(key?: string) {
    this.key = key ? Buffer.from(key, "utf8") : randomBytes(32);
    this._head = createHmac("sha256", this.key).update("GENESIS").digest("hex");
  }

  private hmacOf(entry: Omit<AuditEntry, "hmac">): string {
    return createHmac("sha256", this.key).update(entry.prev_hmac + canonical(entry)).digest("hex");
  }

  record(fields: {
    toolId: string;
    agentId: string;
    target?: string;
    permission?: string | null;
    decision: string;
    reason: string;
    agentDecisionRef?: string | null;
  }): { seq: number; hmac: string } {
    const entry: AuditEntry = {
      seq: this._entries.length,
      prev_hmac: this._head,
      timestamp: new Date().toISOString(),
      tool_id: fields.toolId,
      agent_id: fields.agentId,
      target: fields.target ?? null,
      permission: fields.permission ?? null,
      decision: fields.decision,
      reason: fields.reason,
      agent_decision_ref: fields.agentDecisionRef ?? null,
    };
    const hmac = this.hmacOf(entry);
    entry.hmac = hmac;
    this._entries.push(entry);
    this._head = hmac;
    return { seq: entry.seq, hmac };
  }

  verifyChain(): [boolean, string] {
    let prev = createHmac("sha256", this.key).update("GENESIS").digest("hex");
    for (let i = 0; i < this._entries.length; i++) {
      const { hmac, ...rest } = this._entries[i];
      if (rest.prev_hmac !== prev) return [false, `audit break at entry ${i}: prev_hmac mismatch`];
      const recomputed = this.hmacOf(rest);
      if (recomputed !== hmac) return [false, `audit break at entry ${i}: hmac mismatch`];
      prev = hmac as string;
    }
    return [true, "OK"];
  }

  get headHmac(): string {
    return this._head;
  }

  get entryCount(): number {
    return this._entries.length;
  }

  export(): AuditExport {
    const fp = createHmac("sha256", this.key).update("FINGERPRINT").digest("hex").slice(0, 16);
    return {
      algorithm: "HMAC-SHA256",
      key_fingerprint: fp,
      entry_count: this._entries.length,
      head_hmac: this._head,
      entries: this._entries,
    };
  }
}
