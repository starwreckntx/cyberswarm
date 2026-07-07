/**
 * Decision — structural audit wrapper for every agent-integrity branch point.
 *
 * TypeScript port of Decepticon's `src/swarm_integrity/decision.py`. The invariant is the
 * whole point:
 *
 *   No agent-integrity decision may occur without producing its own audit evidence as a
 *   structural side-effect of being made.
 *
 * You cannot read a Decision's outcome before it is resolved, and resolution atomically
 * writes to the AgentAuditTrail. A Decision that is never resolved can be force-recorded as
 * a failure via the live-decision sweep (auditLiveDecisions) — it cannot silently escape
 * the chain.
 *
 * Divergence from the Python original: Python relies on __del__ at garbage collection to
 * force-record unresolved decisions. JavaScript's FinalizationRegistry runs at a
 * non-deterministic time and would inject nondeterminism into the (deterministic) chain, so
 * this port instead exposes an explicit synchronous sweep. In practice every gate resolves
 * its decision synchronously before returning, so the live set is empty at session close —
 * which the AV-012 "zero unresolved" assertion verifies.
 */
import type { AgentAuditTrail } from "./trail.js";

export class DecisionNotResolvedError extends Error {}

const _liveDecisions = new Set<Decision>();

/** Snapshot of currently live (unresolved) Decision objects — used in tick/step audits. */
export function getLiveDecisions(): Decision[] {
  return Array.from(_liveDecisions);
}

export function clearLiveDecisions(): void {
  _liveDecisions.clear();
}

/**
 * Force-record every still-unresolved decision onto its trail as a failure. Returns the
 * number swept. Call at session close to guarantee nothing escaped the chain.
 */
export function auditLiveDecisions(reason = "Decision swept unresolved at session close"): number {
  let n = 0;
  for (const d of Array.from(_liveDecisions)) {
    if (!d.resolved) {
      d.forceRecordUnresolved(reason);
      n += 1;
    }
  }
  return n;
}

export class Decision {
  readonly decisionType: string;
  readonly step: number;
  readonly context: Record<string, unknown>;
  readonly trail: AgentAuditTrail;
  readonly actor: string | null;

  private _resolved = false;
  private _outcome: unknown = null;
  private _rationale: string | null = null;
  private _algorithm: string | null = null;
  private _alternatives: unknown[] | null = null;
  private _kkiAuditRef: unknown = null;
  private _entryHash: string | null = null;

  constructor(
    decisionType: string,
    step: number,
    context: Record<string, unknown>,
    trail: AgentAuditTrail,
    actor: string | null = null,
  ) {
    this.decisionType = decisionType;
    this.step = step;
    this.context = context;
    this.trail = trail;
    this.actor = actor;
    _liveDecisions.add(this);
  }

  /**
   * Resolve, write to the trail, and return the outcome. The ONLY path to the outcome;
   * there is no other way to read it.
   */
  resolve(
    outcome: unknown,
    rationale: string,
    algorithm: string,
    alternatives: unknown[] | null = null,
    kkiAuditRef: unknown = null,
  ): unknown {
    if (this._resolved) return this._outcome;
    if (!rationale || typeof rationale !== "string") {
      throw new Error("rationale must be a non-empty string");
    }

    this._resolved = true;
    this._outcome = outcome;
    this._rationale = rationale;
    this._algorithm = algorithm;
    this._alternatives = alternatives ?? [];
    this._kkiAuditRef = kkiAuditRef;

    try {
      this._entryHash = this.trail.record(this);
    } catch (err) {
      this._resolved = false; // roll back so the failure is visible, then re-throw
      throw err;
    }

    _liveDecisions.delete(this);
    return this._outcome;
  }

  /** Force-record this decision as unresolved (called by the sweep). */
  forceRecordUnresolved(reason: string): void {
    try {
      this.trail.recordUnresolved(this, reason);
    } finally {
      _liveDecisions.delete(this);
    }
  }

  get outcome(): unknown {
    if (!this._resolved) {
      throw new DecisionNotResolvedError(
        `${this.decisionType} at step ${this.step} was read before resolution. ` +
          `context=${JSON.stringify(this.context)}`,
      );
    }
    return this._outcome;
  }

  get resolved(): boolean {
    return this._resolved;
  }

  get entryHash(): string | null {
    return this._entryHash;
  }

  // Accessors the trail reads when recording (mirror the Python record() field reads).
  get outcomeRaw(): unknown {
    return this._outcome;
  }
  get rationale(): string | null {
    return this._rationale;
  }
  get algorithm(): string | null {
    return this._algorithm;
  }
  get alternatives(): unknown[] | null {
    return this._alternatives;
  }
  get kkiAuditRef(): unknown {
    return this._kkiAuditRef;
  }
}
