/**
 * Layer 2 — CyberSwarm agent-integrity (ShadowAuditor).
 *
 * Public surface for the seed-deterministic, hash-chained role/handoff integrity layer.
 * See ../README or docs/GOVERNANCE.md for the design.
 */
export * from "./constants.js";
export { Decision, DecisionNotResolvedError, getLiveDecisions, clearLiveDecisions, auditLiveDecisions } from "./decision.js";
export { AgentAuditTrail } from "./trail.js";
export type { TrailEntry, TrailExport } from "./trail.js";
export { AgentIdentity, AgentRoster } from "./roster.js";
export type { AgentIdentityDict } from "./roster.js";
export { nominateCoordinator } from "./coordinator.js";
export { ShadowAuditor, IntegrityVerdict } from "./shadowAuditor.js";
export type { IntegrityVerdictDict, SessionReport } from "./shadowAuditor.js";
