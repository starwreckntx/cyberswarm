/**
 * AgentAuditTrail — seed-deterministic, hash-chained, append-only log of agent decisions.
 *
 * TypeScript port of Decepticon's `src/swarm_integrity/trail.py`.
 *
 * Chain properties:
 * - Every entry hashes its predecessor (prevHash) and itself (entryHash).
 * - The genesis hash is seeded with SWARM_SEED, so the same seed + same decision sequence
 *   reproduce the identical chain head — the replay-determinism property the bundle is
 *   validated on.
 * - Unresolved decisions are *recorded*, never suppressed.
 *
 * This chain is deliberately separate from the Layer-1 HMAC tool-governance audit: that one
 * is keyed/non-reproducible by design, this one is reproducible by design. They cross-link
 * by reference (entries may carry kkiAuditRef) rather than merging.
 *
 * Determinism note: hashing uses a canonical JSON encoder that recursively sorts object
 * keys (the analogue of Python's json.dumps(sort_keys=True)). No wall-clock, RNG, UUID, or
 * Date ever enters a hashed entry. The chain only needs to be self-consistent and
 * reproducible across runs of THIS port — it is not byte-identical to Decepticon's Python
 * chain, and is not meant to be.
 */
import { createHash } from "node:crypto";

import type { Decision } from "./decision.js";

export interface TrailEntry {
  entry_index: number;
  prev_hash: string;
  step: number;
  actor: string | null;
  decision_type: string;
  context: Record<string, unknown>;
  outcome: unknown;
  rationale: string | null;
  algorithm: string | null;
  alternatives: unknown[];
  kki_audit_ref: unknown;
  resolved: boolean;
  unresolved_reason?: string;
  entry_hash?: string;
}

export interface TrailExport {
  swarm_seed: number;
  chain_head: string;
  entry_count: number;
  entries: TrailEntry[];
}

/** Recursively sort object keys so serialization is canonical and deterministic. */
function canonicalize(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    out[key] = canonicalize(obj[key]);
  }
  return out;
}

function sha256Hex(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export class AgentAuditTrail {
  private readonly _entries: TrailEntry[] = [];
  private readonly _seed: number;
  private _headHash: string;

  constructor(seed: number) {
    this._seed = seed;
    this._headHash = AgentAuditTrail.genesisHash(seed);
  }

  static genesisHash(seed: number): string {
    return sha256Hex(`GENESIS:${seed}`);
  }

  /** Append a resolved decision; return its entry hash. Called by Decision.resolve(). */
  record(decision: Decision): string {
    const entry: TrailEntry = {
      entry_index: this._entries.length,
      prev_hash: this._headHash,
      step: decision.step,
      actor: decision.actor,
      decision_type: decision.decisionType,
      context: decision.context,
      outcome: AgentAuditTrail.serialize(decision.outcomeRaw),
      rationale: decision.rationale,
      algorithm: decision.algorithm,
      alternatives: decision.alternatives ?? [],
      kki_audit_ref: decision.kkiAuditRef ?? null,
      resolved: true,
    };
    return this._append(entry);
  }

  /** Forced failure record for a decision that was never resolved. Cannot be suppressed. */
  recordUnresolved(decision: Partial<Decision>, reason: string): string {
    const entry: TrailEntry = {
      entry_index: this._entries.length,
      prev_hash: this._headHash,
      step: decision.step ?? -1,
      actor: decision.actor ?? null,
      decision_type: decision.decisionType ?? "UNKNOWN",
      context: decision.context ?? {},
      outcome: null,
      rationale: null,
      algorithm: null,
      alternatives: [],
      kki_audit_ref: null,
      resolved: false,
      unresolved_reason: reason,
    };
    return this._append(entry);
  }

  private _append(entry: TrailEntry): string {
    const entryHash = AgentAuditTrail.hashEntry(entry);
    entry.entry_hash = entryHash;
    this._entries.push(entry);
    this._headHash = entryHash;
    return entryHash;
  }

  /** Walk the chain; any break returns [false, reason]. Used by the bundle validator. */
  verifyChain(): [boolean, string] {
    if (this._entries.length === 0) return [true, "OK (empty chain)"];
    let prev = AgentAuditTrail.genesisHash(this._seed);
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i];
      if (entry.prev_hash !== prev) {
        return [false, `chain break at entry ${i}: prev_hash mismatch`];
      }
      const { entry_hash, ...rest } = entry;
      const recomputed = AgentAuditTrail.hashEntry(rest);
      if (recomputed !== entry_hash) {
        return [false, `chain break at entry ${i}: entry_hash mismatch`];
      }
      prev = entry_hash as string;
    }
    return [true, "OK"];
  }

  export(): TrailExport {
    return {
      swarm_seed: this._seed,
      chain_head: this._headHash,
      entry_count: this._entries.length,
      entries: this._entries,
    };
  }

  static hashEntry(entry: unknown): string {
    return sha256Hex(JSON.stringify(canonicalize(entry)));
  }

  /** Serialize an outcome to a JSON-safe value (objects with toDict() are honored). */
  static serialize(outcome: unknown): unknown {
    if (
      outcome === null ||
      outcome === undefined ||
      ["string", "number", "boolean"].includes(typeof outcome)
    ) {
      return outcome ?? null;
    }
    if (Array.isArray(outcome)) return outcome;
    const o = outcome as { toDict?: () => unknown };
    if (typeof o.toDict === "function") return o.toDict();
    return outcome;
  }

  get seed(): number {
    return this._seed;
  }

  get headHash(): string {
    return this._headHash;
  }

  get entryCount(): number {
    return this._entries.length;
  }

  get entries(): TrailEntry[] {
    return this._entries;
  }
}
