/**
 * Coordinator nomination — the agent-level analogue of a hub election.
 *
 * TypeScript port of Decepticon's `src/swarm_integrity/coordinator.py`.
 *
 * A swarm has no geometry, so the deterministic rule is: among non-quarantined agents that
 * hold the COORDINATE capability, pick the lowest coordinator-priority rank, breaking ties
 * lexicographically on agentId. Every nomination is wrapped in a Decision, so the choice
 * and its alternatives land on the hash chain.
 *
 * Re-election is the same rule run again after the incumbent coordinator is stripped or
 * removed.
 */
import {
  CAP_COORDINATE,
  STATE_ACTIVE,
  STATE_COORDINATOR,
  DECISION_COORDINATOR_NOMINATION,
  DECISION_COORDINATOR_REELECTION,
  ALGO_COORDINATOR_PRIORITY,
  ALGO_LEXICOGRAPHIC_TIEBREAK,
} from "./constants.js";
import { Decision } from "./decision.js";
import type { AgentIdentity, AgentRoster } from "./roster.js";
import type { AgentAuditTrail } from "./trail.js";

/** Sort key: (priority rank, agentId) — deterministic and total. */
function rankCompare(a: AgentIdentity, b: AgentIdentity): number {
  if (a.coordinatorPriority !== b.coordinatorPriority) {
    return a.coordinatorPriority - b.coordinatorPriority;
  }
  return a.agentId < b.agentId ? -1 : a.agentId > b.agentId ? 1 : 0;
}

/**
 * Deterministically nominate (or re-elect) the swarm coordinator and record it. Returns the
 * elected agent, or null when no eligible agent exists (the swarm has no coordinator).
 */
export function nominateCoordinator(
  roster: AgentRoster,
  trail: AgentAuditTrail,
  step: number,
  reelection = false,
): AgentIdentity | null {
  const eligible = roster
    .activeAgents()
    .filter((a) => a.holds(CAP_COORDINATE))
    .sort(rankCompare);

  const decision = new Decision(
    reelection ? DECISION_COORDINATOR_REELECTION : DECISION_COORDINATOR_NOMINATION,
    step,
    {
      eligible: eligible.map((a) => a.agentId),
      priorities: Object.fromEntries(eligible.map((a) => [a.agentId, a.coordinatorPriority])),
      reelection,
    },
    trail,
    "ShadowAuditor",
  );

  if (eligible.length === 0) {
    decision.resolve(
      null,
      "no non-quarantined COORDINATE-capable agent available; swarm has no coordinator",
      ALGO_COORDINATOR_PRIORITY,
      [],
    );
    return null;
  }

  const winner = eligible[0];
  const runnersUp = eligible.slice(1).map((a) => a.agentId);
  const tie = eligible.length > 1 && eligible[1].coordinatorPriority === winner.coordinatorPriority;
  decision.resolve(
    { agent_id: winner.agentId, role: winner.role },
    `${winner.agentId} has lowest coordinator priority ${winner.coordinatorPriority}` +
      (tie ? " (lexicographic tiebreak applied)" : ""),
    tie ? ALGO_LEXICOGRAPHIC_TIEBREAK : ALGO_COORDINATOR_PRIORITY,
    runnersUp,
  );

  // Demote any prior coordinator, promote the winner.
  const prior = roster.coordinator();
  if (prior && prior.agentId !== winner.agentId && !prior.isQuarantined) {
    prior.state = STATE_ACTIVE;
  }
  winner.state = STATE_COORDINATOR;
  return winner;
}
