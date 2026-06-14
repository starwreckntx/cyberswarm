/**
 * CyberSwarm governance — two complementary integrity layers ported from Decepticon.
 *
 *   Layer 2 (swarm_integrity): agent-level role/handoff integrity (ShadowAuditor),
 *            seed-deterministic, hash-chained — "who acts and how control moves".
 *   Layer 1 (tool_governance): tool-level validation -> policy -> scope -> consent -> HMAC
 *            audit — "what each tool call may do".
 *
 * Compose via GovernanceGateway; wire into the runtime via integration.ts (opt-in).
 * See docs/GOVERNANCE.md.
 */
export * as swarmIntegrity from "./swarm_integrity/index.js";
export * as toolGovernance from "./tool_governance/index.js";
export { GovernanceGateway } from "./gateway.js";
export type { GatewayOptions, GatewayToolResult } from "./gateway.js";
export {
  governanceEnabled,
  getGateway,
  resetGateway,
  governedHandoff,
  governTaskCreation,
  governedToolCall,
  exportGovernanceAudit,
} from "./integration.js";
export type { HandoffDecision } from "./integration.js";
