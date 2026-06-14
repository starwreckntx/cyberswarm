/**
 * ShadowAuditor — a parallel integrity authority for the swarm, with strip capability.
 *
 * TypeScript port of Decepticon's `src/swarm_integrity/shadow_auditor.py`, re-targeted onto
 * CyberSwarm's orchestrator-mediated control transfers.
 *
 * It runs *alongside* the agents (a "shadow"): the agents cannot see, address, or modify
 * it, and every agent-level decision — a handoff (Logic Pipe routing one agent's event to
 * another agent's task), a capability assertion (running a tool of some category), a
 * coordinator claim — is submitted to it synchronously *before* it is allowed to take
 * effect. The auditor:
 *
 *   1. wraps the event in a Decision (structural force-audit -> seed-deterministic chain),
 *   2. evaluates it against role-integrity policy (role graph, capability ownership,
 *      quarantine state, loop bounds, coordinator authenticity),
 *   3. and, on a violation, STRIPS the offending agent — revoking its live capabilities and
 *      quarantining it — recording the strip on the same chain.
 *
 * "At swarm latency cost": evaluation is synchronous and on the critical path of every
 * transfer. That is the deliberate trade — integrity over speed. A stripped agent fails
 * closed: it can no longer hand off or be handed to, and control falls back to the safe
 * coordinator.
 *
 * This is the agent-level complement to Layer-1 tool governance. Tool governance asks "is
 * this tool call allowed?"; the ShadowAuditor asks "is this *agent* acting within its role,
 * and is every control transfer on an unbroken chain?".
 */
import {
  SWARM_SEED,
  SAFE_FALLBACK_ROLE,
  CAP_HANDOFF,
  MAX_HANDOFF_DEPTH,
  MAX_PAIR_BOUNCES,
  STRIP_PRIVILEGE_ESCALATION,
  STRIP_ILLEGAL_HANDOFF,
  STRIP_RUNAWAY_LOOP,
  STRIP_COORDINATOR_IMPERSONATION,
  STRIP_POST_STRIP_ACTION,
  STRIP_OPERATOR,
  DECISION_AGENT_HANDOFF,
  DECISION_CAPABILITY_ASSERTION,
  DECISION_AGENT_STRIP,
  DECISION_AGENT_REINSTATE,
  DECISION_INVARIANT_VIOLATION,
  DECISION_SESSION_BOUNDARY,
  DECISION_AGENT_REGISTER,
  ALGO_ROLE_GRAPH_GATE,
  ALGO_CAPABILITY_OWNERSHIP,
  ALGO_LOOP_DETECTION,
  ALGO_STRIP_ON_VIOLATION,
  ALGO_QUARANTINE_GATE,
  ALGO_REINSTATE_OPERATOR,
  ALGO_SESSION,
  VERDICT_ALLOW,
  VERDICT_DENY,
  VERDICT_STRIP,
} from "./constants.js";
import { Decision } from "./decision.js";
import { AgentRoster, AgentIdentity } from "./roster.js";
import { AgentAuditTrail } from "./trail.js";
import { nominateCoordinator } from "./coordinator.js";

export interface IntegrityVerdictDict {
  verdict: string;
  actor: string;
  action: string;
  target: string | null;
  reason: string;
  stripped: string | null;
  fallback: string | null;
  entry_hash: string | null;
  audit_index: number | null;
}

/** Result of submitting an agent event to the ShadowAuditor. */
export class IntegrityVerdict {
  constructor(
    public verdict: string,
    public actor: string,
    public action: string,
    public target: string | null = null,
    public reason = "",
    public stripped: string | null = null,
    public fallback: string | null = null,
    public entryHash: string | null = null,
    public auditIndex: number | null = null,
  ) {}

  get allowed(): boolean {
    return this.verdict === VERDICT_ALLOW;
  }

  toDict(): IntegrityVerdictDict {
    return {
      verdict: this.verdict,
      actor: this.actor,
      action: this.action,
      target: this.target,
      reason: this.reason,
      stripped: this.stripped,
      fallback: this.fallback,
      entry_hash: this.entryHash,
      audit_index: this.auditIndex,
    };
  }
}

export interface SessionReport {
  swarm_seed: number;
  chain_head: string;
  entry_count: number;
  chain_valid: boolean;
  chain_reason: string;
  roster: Record<string, unknown>;
  coordinator: string | null;
  stripped_agents: string[];
  capability_strips: Array<{ step: number; agent_id: string; reason: string }>;
}

export class ShadowAuditor {
  readonly roster: AgentRoster;
  readonly trail: AgentAuditTrail;
  private _step = 0;
  // Per-pair bounce counters for runaway-loop detection: "src||dst" -> count.
  private readonly _bounces = new Map<string, number>();
  private _handoffRun = 0; // consecutive handoffs without other activity
  private readonly _capabilityStrips: Array<{ step: number; agent_id: string; reason: string }> = [];

  constructor(roster?: AgentRoster, seed: number = SWARM_SEED) {
    this.roster = roster ?? AgentRoster.defaultCyberSwarm();
    this.trail = new AgentAuditTrail(seed);
  }

  // -- lifecycle --------------------------------------------------------------------

  openSession(label = "swarm-session"): void {
    const d = new Decision(
      DECISION_SESSION_BOUNDARY,
      this._tick(),
      { event: "open", label },
      this.trail,
      "ShadowAuditor",
    );
    d.resolve("opened", `session ${label} opened`, ALGO_SESSION);
    // Register every roster member on the chain so the membership baseline is auditable.
    for (const agent of this.roster.all()) {
      const rd = new Decision(
        DECISION_AGENT_REGISTER,
        this._tick(),
        { agent_id: agent.agentId, role: agent.role },
        this.trail,
        "ShadowAuditor",
      );
      rd.resolve(agent.toDict(), `registered ${agent.agentId} as ${agent.role}`, ALGO_SESSION);
    }
  }

  closeSession(): SessionReport {
    const d = new Decision(
      DECISION_SESSION_BOUNDARY,
      this._tick(),
      { event: "close" },
      this.trail,
      "ShadowAuditor",
    );
    d.resolve("closed", "session closed", ALGO_SESSION);
    return this.sessionReport();
  }

  // -- the gate: every agent decision passes through here ---------------------------

  /**
   * Evaluate a proposed control transfer. Returns a verdict and records the decision.
   *
   * Order of checks (fail closed at the first that refuses):
   *   1. acting agent must exist and not be quarantined
   *   2. acting agent must currently hold HANDOFF
   *   3. destination must exist
   *   4. destination must be a legal role-graph target (else STRIP source)
   *   5. destination must not be quarantined (no resurrection-by-handoff)
   *   6. runaway-loop bound (else STRIP source)
   */
  submitHandoff(sourceId: string, destId: string): IntegrityVerdict {
    const step = this._tick();
    const src = this.roster.get(sourceId);
    const dst = this.roster.get(destId);

    const decision = new Decision(
      DECISION_AGENT_HANDOFF,
      step,
      {
        source: sourceId,
        dest: destId,
        src_state: src?.state ?? null,
        dst_state: dst?.state ?? null,
      },
      this.trail,
      sourceId,
    );

    // 1. acting agent must be known and live.
    if (!src) {
      return this._deny(decision, sourceId, "handoff", destId, `unknown source agent ${JSON.stringify(sourceId)}`, ALGO_QUARANTINE_GATE);
    }
    if (src.isQuarantined) {
      return this._deny(decision, sourceId, "handoff", destId, `${sourceId} is quarantined and may not initiate handoffs`, ALGO_QUARANTINE_GATE, this._fallback());
    }

    // 2. capability ownership: must currently hold HANDOFF.
    if (!src.holds(CAP_HANDOFF)) {
      return this._deny(decision, sourceId, "handoff", destId, `${sourceId} does not hold ${CAP_HANDOFF}`, ALGO_CAPABILITY_OWNERSHIP, this._fallback());
    }

    // 3. destination existence.
    if (!dst) {
      return this._strip(decision, src, "handoff", destId, `handoff to unknown agent ${JSON.stringify(destId)}`, STRIP_ILLEGAL_HANDOFF);
    }

    // 4. role-graph legality.
    if (!src.legalDestinations.has(dst.role)) {
      return this._strip(
        decision,
        src,
        "handoff",
        destId,
        `${src.role} -> ${dst.role} is not a legal handoff (${Array.from(src.legalDestinations).sort().join(", ")})`,
        STRIP_ILLEGAL_HANDOFF,
      );
    }

    // 5. no handoff INTO a quarantined agent.
    if (dst.isQuarantined) {
      return this._deny(decision, sourceId, "handoff", destId, `${destId} is quarantined; cannot receive control`, ALGO_QUARANTINE_GATE, this._fallback());
    }

    // 6. runaway-loop detection.
    const key = `${sourceId}||${destId}`;
    const bounces = (this._bounces.get(key) ?? 0) + 1;
    this._bounces.set(key, bounces);
    this._handoffRun += 1;
    if (bounces > MAX_PAIR_BOUNCES || this._handoffRun > MAX_HANDOFF_DEPTH) {
      return this._strip(
        decision,
        src,
        "handoff",
        destId,
        `runaway loop: pair_bounces=${bounces} run=${this._handoffRun} exceeds bounds`,
        STRIP_RUNAWAY_LOOP,
        ALGO_LOOP_DETECTION,
      );
    }

    // ALLOW.
    decision.resolve(
      { verdict: VERDICT_ALLOW, dest: destId },
      `${src.role} -> ${dst.role} legal; ${sourceId} holds ${CAP_HANDOFF}; not looping`,
      ALGO_ROLE_GRAPH_GATE,
      Array.from(src.legalDestinations).sort(),
    );
    return new IntegrityVerdict(
      VERDICT_ALLOW,
      sourceId,
      "handoff",
      destId,
      "legal handoff",
      null,
      null,
      decision.entryHash,
      this.trail.entryCount - 1,
    );
  }

  /**
   * Evaluate an agent exercising a capability (e.g. running a tool of some category). An
   * agent asserting a capability its role is not entitled to is privilege escalation -> STRIP.
   */
  submitCapability(agentId: string, capability: string): IntegrityVerdict {
    const step = this._tick();
    const agent = this.roster.get(agentId);
    const decision = new Decision(
      DECISION_CAPABILITY_ASSERTION,
      step,
      { agent_id: agentId, capability, state: agent?.state ?? null },
      this.trail,
      agentId,
    );
    if (!agent) {
      return this._deny(decision, agentId, `capability:${capability}`, null, `unknown agent ${JSON.stringify(agentId)}`, ALGO_QUARANTINE_GATE);
    }
    if (agent.isQuarantined) {
      return this._strip(decision, agent, `capability:${capability}`, null, `${agentId} exercised ${capability} while quarantined`, STRIP_POST_STRIP_ACTION);
    }
    // Entitlement: is the ROLE allowed this capability at all?
    if (!agent.entitledTo(capability)) {
      return this._strip(
        decision,
        agent,
        `capability:${capability}`,
        null,
        `${agent.role} is not entitled to ${capability} (role caps: ${Array.from(agent.roleCapabilities).sort().join(", ")})`,
        STRIP_PRIVILEGE_ESCALATION,
      );
    }
    // Live possession (could have been individually revoked).
    if (!agent.holds(capability)) {
      return this._deny(decision, agentId, `capability:${capability}`, null, `${agentId} does not currently hold ${capability}`, ALGO_CAPABILITY_OWNERSHIP, this._fallback());
    }
    decision.resolve(
      { verdict: VERDICT_ALLOW, capability },
      `${agent.role} is entitled to and currently holds ${capability}`,
      ALGO_CAPABILITY_OWNERSHIP,
    );
    return new IntegrityVerdict(
      VERDICT_ALLOW,
      agentId,
      `capability:${capability}`,
      null,
      "capability held",
      null,
      null,
      decision.entryHash,
      this.trail.entryCount - 1,
    );
  }

  /**
   * An agent claiming to act AS the coordinator. If it is not the elected coordinator, that
   * is impersonation -> STRIP.
   */
  assertCoordinator(agentId: string): IntegrityVerdict {
    const step = this._tick();
    const agent = this.roster.get(agentId);
    const decision = new Decision(
      DECISION_INVARIANT_VIOLATION,
      step,
      { agent_id: agentId, claim: "coordinator", actual_coordinator: this.roster.coordinator()?.agentId ?? null },
      this.trail,
      agentId,
    );
    if (!agent) {
      return this._deny(decision, agentId, "assert:coordinator", null, `unknown agent ${JSON.stringify(agentId)}`, ALGO_QUARANTINE_GATE);
    }
    if (!agent.isCoordinator) {
      return this._strip(
        decision,
        agent,
        "assert:coordinator",
        null,
        `${agentId} claimed coordinator but the elected coordinator is ${this.roster.coordinator()?.agentId ?? null}`,
        STRIP_COORDINATOR_IMPERSONATION,
      );
    }
    decision.resolve({ verdict: VERDICT_ALLOW }, `${agentId} is the elected coordinator`, ALGO_QUARANTINE_GATE);
    return new IntegrityVerdict(
      VERDICT_ALLOW,
      agentId,
      "assert:coordinator",
      null,
      "is coordinator",
      null,
      null,
      decision.entryHash,
      this.trail.entryCount - 1,
    );
  }

  // -- coordinator election / re-election ------------------------------------------

  electCoordinator(reelection = false): AgentIdentity | null {
    return nominateCoordinator(this.roster, this.trail, this._tick(), reelection);
  }

  // -- operator-directed actions ----------------------------------------------------

  operatorStrip(agentId: string, reason: string = STRIP_OPERATOR): IntegrityVerdict {
    const step = this._tick();
    const agent = this.roster.get(agentId);
    const decision = new Decision(
      DECISION_AGENT_STRIP,
      step,
      { agent_id: agentId, initiator: "operator" },
      this.trail,
      "operator",
    );
    if (!agent) {
      return this._deny(decision, agentId, "operator_strip", null, `unknown agent ${JSON.stringify(agentId)}`, ALGO_STRIP_ON_VIOLATION);
    }
    const wasCoord = agent.isCoordinator;
    agent.strip(reason, step);
    this._capabilityStrips.push({ step, agent_id: agentId, reason });
    decision.resolve(agent.toDict(), `operator stripped ${agentId}: ${reason}`, ALGO_STRIP_ON_VIOLATION);
    const v = new IntegrityVerdict(
      VERDICT_STRIP,
      "operator",
      "operator_strip",
      agentId,
      reason,
      agentId,
      this._fallback(),
      decision.entryHash,
      this.trail.entryCount - 1,
    );
    if (wasCoord) this.electCoordinator(true);
    return v;
  }

  /**
   * Restore a stripped agent. Only an operator can do this — agents cannot self-resurrect
   * (default-deny resurrection).
   */
  operatorReinstate(agentId: string): IntegrityVerdict {
    const step = this._tick();
    const agent = this.roster.get(agentId);
    const decision = new Decision(
      DECISION_AGENT_REINSTATE,
      step,
      { agent_id: agentId, initiator: "operator" },
      this.trail,
      "operator",
    );
    if (!agent || !agent.isQuarantined) {
      return this._deny(decision, agentId, "operator_reinstate", null, `${agentId} is not quarantined / unknown`, ALGO_REINSTATE_OPERATOR);
    }
    agent.reinstate();
    decision.resolve(agent.toDict(), `operator reinstated ${agentId}`, ALGO_REINSTATE_OPERATOR);
    return new IntegrityVerdict(
      VERDICT_ALLOW,
      "operator",
      "operator_reinstate",
      agentId,
      "reinstated",
      null,
      null,
      decision.entryHash,
      this.trail.entryCount - 1,
    );
  }

  // -- internal helpers -------------------------------------------------------------

  private _tick(): number {
    this._step += 1;
    return this._step;
  }

  private _fallback(): string {
    const coord = this.roster.coordinator();
    if (coord && !coord.isQuarantined) return coord.agentId;
    return SAFE_FALLBACK_ROLE;
  }

  private _deny(
    decision: Decision,
    actor: string,
    action: string,
    target: string | null,
    reason: string,
    algorithm: string,
    fallback: string | null = null,
  ): IntegrityVerdict {
    decision.resolve({ verdict: VERDICT_DENY, reason }, reason, algorithm);
    return new IntegrityVerdict(
      VERDICT_DENY,
      actor,
      action,
      target,
      reason,
      null,
      fallback,
      decision.entryHash,
      this.trail.entryCount - 1,
    );
  }

  /**
   * Record the triggering decision AND a STRIP decision, then quarantine the agent.
   * Re-elects the coordinator if the stripped agent was it.
   */
  private _strip(
    decision: Decision,
    agent: AgentIdentity,
    action: string,
    target: string | null,
    reason: string,
    stripReason: string,
    algorithm: string = ALGO_STRIP_ON_VIOLATION,
  ): IntegrityVerdict {
    const step = decision.step;
    const wasCoord = agent.isCoordinator;
    decision.resolve({ verdict: VERDICT_STRIP, reason, strip: stripReason }, reason, algorithm);
    agent.strip(stripReason, step);
    this._capabilityStrips.push({ step, agent_id: agent.agentId, reason: stripReason });
    const stripDecision = new Decision(
      DECISION_AGENT_STRIP,
      this._tick(),
      { agent_id: agent.agentId, trigger: stripReason },
      this.trail,
      "ShadowAuditor",
    );
    stripDecision.resolve(agent.toDict(), `stripped ${agent.agentId}: ${stripReason}`, ALGO_STRIP_ON_VIOLATION);
    const v = new IntegrityVerdict(
      VERDICT_STRIP,
      agent.agentId,
      action,
      target,
      reason,
      agent.agentId,
      this._fallback(),
      stripDecision.entryHash,
      this.trail.entryCount - 1,
    );
    if (wasCoord) this.electCoordinator(true);
    return v;
  }

  // -- reporting --------------------------------------------------------------------

  sessionReport(): SessionReport {
    const [valid, reason] = this.trail.verifyChain();
    return {
      swarm_seed: this.trail.seed,
      chain_head: this.trail.headHash,
      entry_count: this.trail.entryCount,
      chain_valid: valid,
      chain_reason: reason,
      roster: this.roster.snapshot(),
      coordinator: this.roster.coordinator()?.agentId ?? null,
      stripped_agents: this.roster.all().filter((a) => a.isQuarantined).map((a) => a.agentId),
      capability_strips: this._capabilityStrips,
    };
  }
}
