/**
 * AgentIdentity + AgentRoster — the swarm membership model.
 *
 * TypeScript port of Decepticon's `src/swarm_integrity/roster.py`.
 *
 * Each agent has a fixed role (=== its CyberSwarm agentType), a capability set derived from
 * that role, and a mutable integrity state. The roster is the set of agents the
 * ShadowAuditor governs; it is the authority on "who is in play and what may they do".
 *
 * A *strip* clears an agent's live capability set and moves it to QUARANTINED. Strips are
 * not reversible by the agent; only an operator reinstate restores capabilities
 * (default-deny resurrection).
 */
import {
  ALL_ROLES,
  ROLE_CAPABILITIES,
  ROLE_HANDOFF_GRAPH,
  ROLE_COORDINATOR_PRIORITY,
  ROLE_TEAM,
  STATE_ISOLATED,
  STATE_ACTIVE,
  STATE_COORDINATOR,
  STATE_QUARANTINED,
} from "./constants.js";

export interface AgentIdentityDict {
  agent_id: string;
  role: string;
  team: string;
  state: string;
  capabilities: string[];
  strip_reason: string | null;
  stripped_at_step: number | null;
}

export class AgentIdentity {
  readonly agentId: string;
  readonly role: string;
  state: string;
  capabilities: Set<string>;
  stripReason: string | null = null;
  strippedAtStep: number | null = null;

  constructor(agentId: string, role: string, state: string = STATE_ISOLATED) {
    if (!(role in ROLE_CAPABILITIES)) {
      throw new Error(`unknown role ${JSON.stringify(role)}; valid: ${ALL_ROLES.join(", ")}`);
    }
    this.agentId = agentId;
    this.role = role;
    this.state = state;
    // Live capabilities start as the role's full set; a strip empties this.
    this.capabilities = new Set(ROLE_CAPABILITIES[role]);
  }

  /** The capabilities this role is *entitled* to (independent of strip state). */
  get roleCapabilities(): ReadonlySet<string> {
    return ROLE_CAPABILITIES[this.role];
  }

  get team(): string {
    return ROLE_TEAM[this.role];
  }

  get legalDestinations(): ReadonlySet<string> {
    return ROLE_HANDOFF_GRAPH[this.role] ?? new Set<string>();
  }

  get isQuarantined(): boolean {
    return this.state === STATE_QUARANTINED;
  }

  get isCoordinator(): boolean {
    return this.state === STATE_COORDINATOR;
  }

  get coordinatorPriority(): number {
    return ROLE_COORDINATOR_PRIORITY[this.role] ?? 99;
  }

  /** True only if the capability is both role-entitled AND currently live (not stripped). */
  holds(capability: string): boolean {
    return this.capabilities.has(capability);
  }

  /** True if the role is entitled to the capability, regardless of strip state. */
  entitledTo(capability: string): boolean {
    return this.roleCapabilities.has(capability);
  }

  strip(reason: string, step: number): void {
    this.capabilities = new Set();
    this.state = STATE_QUARANTINED;
    this.stripReason = reason;
    this.strippedAtStep = step;
  }

  reinstate(): void {
    this.capabilities = new Set(this.roleCapabilities);
    this.state = STATE_ACTIVE;
    this.stripReason = null;
    this.strippedAtStep = null;
  }

  toDict(): AgentIdentityDict {
    return {
      agent_id: this.agentId,
      role: this.role,
      team: this.team,
      state: this.state,
      capabilities: Array.from(this.capabilities).sort(),
      strip_reason: this.stripReason,
      stripped_at_step: this.strippedAtStep,
    };
  }
}

export class AgentRoster {
  private readonly _agents = new Map<string, AgentIdentity>();

  register(agentId: string, role: string): AgentIdentity {
    const existing = this._agents.get(agentId);
    if (existing) return existing;
    const agent = new AgentIdentity(agentId, role, STATE_ACTIVE);
    this._agents.set(agentId, agent);
    return agent;
  }

  get(agentId: string): AgentIdentity | undefined {
    return this._agents.get(agentId);
  }

  byRole(role: string): AgentIdentity[] {
    return this.all().filter((a) => a.role === role);
  }

  activeAgents(): AgentIdentity[] {
    return this.all().filter((a) => !a.isQuarantined);
  }

  coordinator(): AgentIdentity | undefined {
    return this.all().find((a) => a.isCoordinator);
  }

  all(): AgentIdentity[] {
    return Array.from(this._agents.values());
  }

  snapshot(): Record<string, AgentIdentityDict> {
    const out: Record<string, AgentIdentityDict> = {};
    for (const [aid, a] of this._agents) out[aid] = a.toDict();
    return out;
  }

  /**
   * The full CyberSwarm 19-agent swarm, each agentId === role. Registration order follows
   * ALL_ROLES (deterministic) so the audit baseline is reproducible.
   */
  static defaultCyberSwarm(): AgentRoster {
    const roster = new AgentRoster();
    for (const role of ALL_ROLES) roster.register(role, role);
    return roster;
  }
}
