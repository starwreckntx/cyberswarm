/**
 * Symbolic constants for the CyberSwarm agent-integrity layer (Layer 2).
 *
 * TypeScript port of Decepticon's `src/swarm_integrity/constants.py`, re-targeted from
 * Decepticon's four-agent swarm onto CyberSwarm's 19 agents (7 Red / 7 Blue / 5 Purple).
 *
 * Zero raw string literals in the integrity/strip logic: every role, capability, state,
 * decision type and algorithm identifier is named here so the hash-chained audit is
 * self-describing and the bundle validator can assert against a fixed vocabulary.
 *
 * Where Decepticon elected a *coordinator* among four peers and gated *handoffs* the way
 * a mesh gated *routes*, CyberSwarm has no direct agent-to-agent calls: control transfers
 * when one agent emits an event and the Logic Pipe routes a downstream task to another
 * agent. That source-agent -> dest-agent edge IS the handoff this layer governs, and the
 * legal-edge graph below is derived directly from the Logic Pipe rules.
 */

// --- Determinism -------------------------------------------------------------------
// Same seed + same event script -> identical chain head. This is the property the whole
// bundle is verifiable on; do not introduce wall-clock or nonce entropy into hashed data.
export const SWARM_SEED = 424242;

// --- Agent roles (CyberSwarm 19-agent swarm; role === agentType) --------------------
export const ROLE_DISCOVERY = "DiscoveryAgent";
export const ROLE_OSINT = "OSINTAgent";
export const ROLE_RECON = "ReconAgent";
export const ROLE_VULN_SCANNER = "VulnerabilityScannerAgent";
export const ROLE_EXPLOITATION = "ExploitationAgent";
export const ROLE_PERSISTENCE = "PersistenceAgent";
export const ROLE_STRATEGY_ADAPTATION = "StrategyAdaptationAgent";

export const ROLE_NETWORK_MONITOR = "NetworkMonitorAgent";
export const ROLE_LOG_ANALYSIS = "LogAnalysisAgent";
export const ROLE_PATCH_MANAGEMENT = "PatchManagementAgent";
export const ROLE_CONTAINMENT = "ContainmentAgent";
export const ROLE_FORENSICS = "ForensicsAgent";
export const ROLE_RECOVERY = "RecoveryAgent";
export const ROLE_AI_MONITORING = "AIMonitoringAgent";

export const ROLE_THREAT_HUNTER = "ThreatHunterAgent";
export const ROLE_INCIDENT_RESPONSE = "IncidentResponseAgent";
export const ROLE_POSTURE_ASSESSMENT = "PostureAssessmentAgent";
export const ROLE_THREAT_INTELLIGENCE = "ThreatIntelligenceAgent";
export const ROLE_ADAPTATION = "AdaptationAgent";

export const TEAM_RED = "red";
export const TEAM_BLUE = "blue";
export const TEAM_PURPLE = "purple";

export const ROLE_TEAM: Record<string, string> = {
  [ROLE_DISCOVERY]: TEAM_RED,
  [ROLE_OSINT]: TEAM_RED,
  [ROLE_RECON]: TEAM_RED,
  [ROLE_VULN_SCANNER]: TEAM_RED,
  [ROLE_EXPLOITATION]: TEAM_RED,
  [ROLE_PERSISTENCE]: TEAM_RED,
  [ROLE_STRATEGY_ADAPTATION]: TEAM_RED,
  [ROLE_NETWORK_MONITOR]: TEAM_BLUE,
  [ROLE_LOG_ANALYSIS]: TEAM_BLUE,
  [ROLE_PATCH_MANAGEMENT]: TEAM_BLUE,
  [ROLE_CONTAINMENT]: TEAM_BLUE,
  [ROLE_FORENSICS]: TEAM_BLUE,
  [ROLE_RECOVERY]: TEAM_BLUE,
  [ROLE_AI_MONITORING]: TEAM_BLUE,
  [ROLE_THREAT_HUNTER]: TEAM_PURPLE,
  [ROLE_INCIDENT_RESPONSE]: TEAM_PURPLE,
  [ROLE_POSTURE_ASSESSMENT]: TEAM_PURPLE,
  [ROLE_THREAT_INTELLIGENCE]: TEAM_PURPLE,
  [ROLE_ADAPTATION]: TEAM_PURPLE,
};

export const ALL_ROLES: readonly string[] = Object.keys(ROLE_TEAM);

// Coordinator nomination priority (lower rank = stronger claim). CyberSwarm's Rules of
// Engagement require red/blue to be coordinated *through the Purple team*, so the
// coordinator is elected from Purple. The IncidentResponseAgent owns the IR lifecycle and
// is the strongest claim; ties break lexicographically on agentId (mirrors Decepticon's
// LEXICOGRAPHIC_AGENT_ID_TIEBREAKER). Non-Purple roles are not coordinator-eligible.
export const ROLE_COORDINATOR_PRIORITY: Record<string, number> = {
  [ROLE_INCIDENT_RESPONSE]: 0,
  [ROLE_ADAPTATION]: 1,
  [ROLE_POSTURE_ASSESSMENT]: 2,
  [ROLE_THREAT_INTELLIGENCE]: 3,
  [ROLE_THREAT_HUNTER]: 4,
};

// --- Capabilities (the things a strip revokes) -------------------------------------
// Control capabilities:
export const CAP_HANDOFF = "HANDOFF"; // may transfer control to another agent
export const CAP_COORDINATE = "COORDINATE"; // may hold the coordinator role

// Tool-class capabilities — one per CyberSwarm ToolCategory. An agent asserting a
// capability outside its role set is privilege escalation -> strip. These map 1:1 onto the
// security-tool-registry categories so that any tool legitimately assigned to an agent
// (via getToolsForAgent) asserts a capability that agent's role already holds.
export const CAP_RECONNAISSANCE = "RECONNAISSANCE";
export const CAP_VULNERABILITY_SCANNING = "VULNERABILITY_SCANNING";
export const CAP_EXPLOITATION = "EXPLOITATION";
export const CAP_POST_EXPLOITATION = "POST_EXPLOITATION";
export const CAP_FORENSICS = "FORENSICS";
export const CAP_THREAT_HUNTING = "THREAT_HUNTING";
export const CAP_INCIDENT_RESPONSE = "INCIDENT_RESPONSE";
export const CAP_THREAT_INTELLIGENCE = "THREAT_INTELLIGENCE";
export const CAP_NETWORK_MONITORING = "NETWORK_MONITORING";
export const CAP_DEFENSE_EVASION = "DEFENSE_EVASION";
export const CAP_PAYLOAD_GENERATION = "PAYLOAD_GENERATION";
export const CAP_CREDENTIAL_ACCESS = "CREDENTIAL_ACCESS";
export const CAP_LATERAL_MOVEMENT = "LATERAL_MOVEMENT";
export const CAP_PERSISTENCE = "PERSISTENCE";
export const CAP_DETECTION_ENGINEERING = "DETECTION_ENGINEERING";

// ToolCategory (string) -> capability. 1:1, so a category and its capability are the same
// concept under two names (category in the tool registry, capability in the integrity layer).
export const TOOL_CATEGORY_CAPABILITY: Record<string, string> = {
  reconnaissance: CAP_RECONNAISSANCE,
  vulnerability_scanning: CAP_VULNERABILITY_SCANNING,
  exploitation: CAP_EXPLOITATION,
  post_exploitation: CAP_POST_EXPLOITATION,
  forensics: CAP_FORENSICS,
  threat_hunting: CAP_THREAT_HUNTING,
  incident_response: CAP_INCIDENT_RESPONSE,
  threat_intelligence: CAP_THREAT_INTELLIGENCE,
  network_monitoring: CAP_NETWORK_MONITORING,
  defense_evasion: CAP_DEFENSE_EVASION,
  payload_generation: CAP_PAYLOAD_GENERATION,
  credential_access: CAP_CREDENTIAL_ACCESS,
  lateral_movement: CAP_LATERAL_MOVEMENT,
  persistence: CAP_PERSISTENCE,
  detection_engineering: CAP_DETECTION_ENGINEERING,
};

// Which tool categories each agent role is assigned — mirrors the agentToolMap in
// security-tool-registry.ts exactly. ROLE_CAPABILITIES is derived from this below, so the
// two never drift: a tool an agent is allowed to hold always maps to a capability it owns.
export const AGENT_TOOL_CATEGORIES: Record<string, readonly string[]> = {
  [ROLE_DISCOVERY]: ["reconnaissance"],
  [ROLE_OSINT]: ["reconnaissance", "threat_intelligence"],
  [ROLE_RECON]: ["reconnaissance", "vulnerability_scanning"],
  [ROLE_VULN_SCANNER]: ["vulnerability_scanning"],
  [ROLE_EXPLOITATION]: ["exploitation", "post_exploitation", "payload_generation", "credential_access"],
  [ROLE_PERSISTENCE]: ["exploitation", "post_exploitation", "payload_generation", "defense_evasion", "persistence"],
  [ROLE_STRATEGY_ADAPTATION]: ["exploitation", "post_exploitation", "defense_evasion", "lateral_movement"],
  [ROLE_NETWORK_MONITOR]: ["network_monitoring", "detection_engineering"],
  [ROLE_LOG_ANALYSIS]: ["threat_hunting", "network_monitoring", "detection_engineering"],
  [ROLE_PATCH_MANAGEMENT]: ["incident_response", "defense_evasion"],
  [ROLE_CONTAINMENT]: ["incident_response", "network_monitoring"],
  [ROLE_FORENSICS]: ["forensics", "threat_hunting", "incident_response"],
  [ROLE_RECOVERY]: ["incident_response", "forensics"],
  [ROLE_AI_MONITORING]: ["detection_engineering", "threat_hunting"],
  [ROLE_THREAT_HUNTER]: ["threat_hunting", "forensics", "detection_engineering", "network_monitoring"],
  [ROLE_INCIDENT_RESPONSE]: ["incident_response", "forensics", "network_monitoring"],
  [ROLE_POSTURE_ASSESSMENT]: ["vulnerability_scanning", "detection_engineering", "network_monitoring"],
  [ROLE_THREAT_INTELLIGENCE]: ["threat_intelligence", "threat_hunting"],
  [ROLE_ADAPTATION]: ["detection_engineering", "threat_hunting", "threat_intelligence"],
};

/** Capabilities each role legitimately holds, derived from AGENT_TOOL_CATEGORIES. */
function buildRoleCapabilities(): Record<string, ReadonlySet<string>> {
  const out: Record<string, ReadonlySet<string>> = {};
  for (const role of ALL_ROLES) {
    const caps = new Set<string>([CAP_HANDOFF]);
    if (ROLE_TEAM[role] === TEAM_PURPLE) caps.add(CAP_COORDINATE);
    for (const cat of AGENT_TOOL_CATEGORIES[role] ?? []) {
      const cap = TOOL_CATEGORY_CAPABILITY[cat];
      if (cap) caps.add(cap);
    }
    out[role] = caps;
  }
  return out;
}

export const ROLE_CAPABILITIES: Record<string, ReadonlySet<string>> = buildRoleCapabilities();

// Legal handoff destinations per role (the role graph). Derived from the Logic Pipe rules
// in orchestrator/logic-pipe.ts: each rule consumes an event emitted by a source agent and
// creates a task for a destination agent. The (source -> dest) edges below are exactly
// those routes. An agent handing control anywhere outside its edge set is an illegal
// handoff -> strip. Terminal agents (no rule consumes their events) have no legal
// destinations; they never initiate handoffs.
export const ROLE_HANDOFF_GRAPH: Record<string, ReadonlySet<string>> = {
  // RECON_DATA -> vuln_scan
  [ROLE_DISCOVERY]: new Set([ROLE_VULN_SCANNER]),
  // OSINT_DATA_COLLECTED -> targeted_scan (Discovery) + correlate_iocs (ThreatIntel)
  [ROLE_OSINT]: new Set([ROLE_DISCOVERY, ROLE_THREAT_INTELLIGENCE]),
  // RECON_SCAN_COMPLETE -> domain_analysis (OSINT) + targeted_scan (Discovery)
  [ROLE_RECON]: new Set([ROLE_OSINT, ROLE_DISCOVERY]),
  // VULNERABILITY_FOUND -> remediate_vuln (Patch) + execute_exploit (Exploitation) + log (LogAnalysis)
  [ROLE_VULN_SCANNER]: new Set([ROLE_PATCH_MANAGEMENT, ROLE_EXPLOITATION, ROLE_LOG_ANALYSIS]),
  // ACCESS_GAINED -> network_isolate (Containment) + log_collection (LogAnalysis)
  [ROLE_EXPLOITATION]: new Set([ROLE_CONTAINMENT, ROLE_LOG_ANALYSIS]),
  // PERSISTENCE_ACHIEVED -> investigate_files (Forensics) + hunt_ttp (ThreatHunter) + monitor (AIMonitoring)
  [ROLE_PERSISTENCE]: new Set([ROLE_FORENSICS, ROLE_THREAT_HUNTER, ROLE_AI_MONITORING]),
  // ATTACK_ADAPTATION -> correlate_iocs / profile_threat_actor (ThreatIntel)
  [ROLE_STRATEGY_ADAPTATION]: new Set([ROLE_THREAT_INTELLIGENCE]),
  // INTRUSION_DETECTED -> adapt_strategy (StrategyAdaptation) + hunt_ioc (ThreatHunter) + isolate (Containment)
  [ROLE_NETWORK_MONITOR]: new Set([ROLE_STRATEGY_ADAPTATION, ROLE_THREAT_HUNTER, ROLE_CONTAINMENT]),
  // LOG_ANOMALY_DETECTED -> hunt_ttp (ThreatHunter)
  [ROLE_LOG_ANALYSIS]: new Set([ROLE_THREAT_HUNTER]),
  // DEFENSE_ACTION -> reevaluate_targets (StrategyAdaptation) + evaluate_controls (Posture)
  [ROLE_PATCH_MANAGEMENT]: new Set([ROLE_STRATEGY_ADAPTATION, ROLE_POSTURE_ASSESSMENT]),
  // CONTAINMENT_ACTION is consumed by no rule -> terminal
  [ROLE_CONTAINMENT]: new Set([]),
  // FORENSIC_ANALYSIS_COMPLETE -> verify_integrity (Recovery) + block_ip_domain (Containment)
  [ROLE_FORENSICS]: new Set([ROLE_RECOVERY, ROLE_CONTAINMENT]),
  // RECOVERY_COMPLETE -> learn_from_incident (Adaptation) + assess_posture (Posture)
  [ROLE_RECOVERY]: new Set([ROLE_ADAPTATION, ROLE_POSTURE_ASSESSMENT]),
  // AI_REASONING_ALERT -> self; SWARM_ANOMALY -> rebuild_service (Recovery) + optimize_strategy (Adaptation)
  [ROLE_AI_MONITORING]: new Set([ROLE_AI_MONITORING, ROLE_RECOVERY, ROLE_ADAPTATION]),
  // THREAT_HUNT_FINDING -> triage_incident (IncidentResponse) + hunt_ttp (self)
  [ROLE_THREAT_HUNTER]: new Set([ROLE_INCIDENT_RESPONSE, ROLE_THREAT_HUNTER]),
  // INCIDENT_CONTAINED -> eradicate_threat (self); INCIDENT_ERADICATED -> recover_systems (self) + assess_posture (Posture)
  [ROLE_INCIDENT_RESPONSE]: new Set([ROLE_INCIDENT_RESPONSE, ROLE_POSTURE_ASSESSMENT]),
  // DETECTION_GAP_FOUND -> enrich_indicators (ThreatIntel) + map_mitre_coverage (self)
  [ROLE_POSTURE_ASSESSMENT]: new Set([ROLE_THREAT_INTELLIGENCE, ROLE_POSTURE_ASSESSMENT]),
  // THREAT_INTEL_REPORT is consumed by no rule -> terminal
  [ROLE_THREAT_INTELLIGENCE]: new Set([]),
  // ADAPTATION_INSIGHT / STRATEGY_OPTIMIZED -> prompt_sanity_check (AIMonitoring) + log (LogAnalysis)
  [ROLE_ADAPTATION]: new Set([ROLE_AI_MONITORING, ROLE_LOG_ANALYSIS]),
};

// Where control falls back when a handoff is denied or the acting agent is stripped. The
// coordinator is the safe sink; if there is none, control routes to the IncidentResponseAgent.
export const SAFE_FALLBACK_ROLE = ROLE_INCIDENT_RESPONSE;

// Canonical emitting role for each Logic Pipe event type. Lets the orchestrator identify
// the *source* of a control transfer (the agent whose event triggered a downstream task)
// without threading agentType through every event. Mirrors the agent->event emissions in
// the agent layer. Events not listed are not governed as handoffs (no source role).
export const EVENT_SOURCE_ROLE: Record<string, string> = {
  RECON_DATA: ROLE_DISCOVERY,
  OSINT_DATA_COLLECTED: ROLE_OSINT,
  RECON_SCAN_COMPLETE: ROLE_RECON,
  VULNERABILITY_FOUND: ROLE_VULN_SCANNER,
  ACCESS_GAINED: ROLE_EXPLOITATION,
  PERSISTENCE_ACHIEVED: ROLE_PERSISTENCE,
  ATTACK_ADAPTATION: ROLE_STRATEGY_ADAPTATION,
  INTRUSION_DETECTED: ROLE_NETWORK_MONITOR,
  LOG_ANOMALY_DETECTED: ROLE_LOG_ANALYSIS,
  DEFENSE_ACTION: ROLE_PATCH_MANAGEMENT,
  FORENSIC_ANALYSIS_COMPLETE: ROLE_FORENSICS,
  RECOVERY_COMPLETE: ROLE_RECOVERY,
  AI_REASONING_ALERT: ROLE_AI_MONITORING,
  SWARM_ANOMALY: ROLE_AI_MONITORING,
  THREAT_HUNT_FINDING: ROLE_THREAT_HUNTER,
  INCIDENT_CONTAINED: ROLE_INCIDENT_RESPONSE,
  INCIDENT_ERADICATED: ROLE_INCIDENT_RESPONSE,
  DETECTION_GAP_FOUND: ROLE_POSTURE_ASSESSMENT,
  ADAPTATION_INSIGHT: ROLE_ADAPTATION,
  STRATEGY_OPTIMIZED: ROLE_ADAPTATION,
};

// --- Agent integrity states --------------------------------------------------------
export const STATE_ISOLATED = "ISOLATED"; // registered, not yet active
export const STATE_ACTIVE = "ACTIVE"; // full capabilities, not coordinator
export const STATE_COORDINATOR = "COORDINATOR"; // the elected hub
export const STATE_SUSPENDED = "SUSPENDED"; // flagged, capabilities intact, pending review
export const STATE_QUARANTINED = "QUARANTINED"; // STRIPPED: capabilities revoked, cannot act

// --- Strip / quarantine reasons ----------------------------------------------------
export const STRIP_PRIVILEGE_ESCALATION = "PRIVILEGE_ESCALATION"; // asserted a capability it lacks
export const STRIP_ILLEGAL_HANDOFF = "ILLEGAL_HANDOFF"; // destination not in role graph
export const STRIP_RUNAWAY_LOOP = "RUNAWAY_LOOP"; // ping-pong beyond depth bound
export const STRIP_COORDINATOR_IMPERSONATION = "COORDINATOR_IMPERSONATION";
export const STRIP_POST_STRIP_ACTION = "POST_STRIP_ACTION"; // acted while quarantined
export const STRIP_OPERATOR = "OPERATOR_DIRECTED"; // human-initiated strip

// --- Bounds ------------------------------------------------------------------------
export const MAX_HANDOFF_DEPTH = 6; // max consecutive transfers before loop suspicion
export const MAX_PAIR_BOUNCES = 2; // A<->B ping-pong tolerance before strip

// --- Decision types (what lands on the hash chain) ---------------------------------
export const DECISION_SESSION_BOUNDARY = "SESSION_BOUNDARY";
export const DECISION_AGENT_REGISTER = "AGENT_REGISTER";
export const DECISION_COORDINATOR_NOMINATION = "COORDINATOR_NOMINATION";
export const DECISION_AGENT_HANDOFF = "AGENT_HANDOFF";
export const DECISION_CAPABILITY_ASSERTION = "CAPABILITY_ASSERTION";
export const DECISION_ROLE_INTEGRITY_CHECK = "ROLE_INTEGRITY_CHECK";
export const DECISION_AGENT_STRIP = "AGENT_STRIP";
export const DECISION_AGENT_REINSTATE = "AGENT_REINSTATE";
export const DECISION_INVARIANT_VIOLATION = "INVARIANT_VIOLATION";
export const DECISION_COORDINATOR_REELECTION = "COORDINATOR_REELECTION";

// --- Algorithm identifiers (every resolved decision names one) ---------------------
export const ALGO_COORDINATOR_PRIORITY = "COORDINATOR_PRIORITY_RULE";
export const ALGO_ROLE_GRAPH_GATE = "ROLE_HANDOFF_GRAPH_GATE";
export const ALGO_CAPABILITY_OWNERSHIP = "CAPABILITY_OWNERSHIP_RULE";
export const ALGO_LOOP_DETECTION = "HANDOFF_LOOP_DETECTION";
export const ALGO_STRIP_ON_VIOLATION = "STRIP_ON_VIOLATION_RULE";
export const ALGO_QUARANTINE_GATE = "QUARANTINE_GATE";
export const ALGO_LEXICOGRAPHIC_TIEBREAK = "LEXICOGRAPHIC_AGENT_ID_TIEBREAKER";
export const ALGO_REINSTATE_OPERATOR = "OPERATOR_REINSTATE_RULE";
export const ALGO_SESSION = "SESSION_LIFECYCLE";

export const VALID_ALGORITHMS: ReadonlySet<string> = new Set([
  ALGO_COORDINATOR_PRIORITY,
  ALGO_ROLE_GRAPH_GATE,
  ALGO_CAPABILITY_OWNERSHIP,
  ALGO_LOOP_DETECTION,
  ALGO_STRIP_ON_VIOLATION,
  ALGO_QUARANTINE_GATE,
  ALGO_LEXICOGRAPHIC_TIEBREAK,
  ALGO_REINSTATE_OPERATOR,
  ALGO_SESSION,
]);

// --- Verdicts ----------------------------------------------------------------------
export const VERDICT_ALLOW = "ALLOW";
export const VERDICT_DENY = "DENY";
export const VERDICT_STRIP = "STRIP";
