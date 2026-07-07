/**
 * AV matrix — agent-level validation (AV-001 .. AV-012) for the CyberSwarm ShadowAuditor.
 *
 * TypeScript port of Decepticon's `validation/test_av_001_through_012.py`, re-targeted onto
 * CyberSwarm roles. Each test drives a fresh ShadowAuditor through a controlled scenario
 * and asserts the integrity invariant holds. Scenarios are deterministic: no wall-clock, no
 * RNG. AV-012 additionally proves replay-determinism (same seed -> identical chain head) and
 * that zero decisions are left unresolved.
 *
 * Run standalone:  npx tsx src/governance/validation/avMatrix.ts
 */
import {
  ShadowAuditor,
  clearLiveDecisions,
  getLiveDecisions,
  VERDICT_ALLOW,
  VERDICT_DENY,
  VERDICT_STRIP,
  STRIP_PRIVILEGE_ESCALATION,
  STRIP_COORDINATOR_IMPERSONATION,
  STRIP_RUNAWAY_LOOP,
  STATE_QUARANTINED,
  STATE_ACTIVE,
  CAP_EXPLOITATION,
  CAP_RECONNAISSANCE,
  ROLE_DISCOVERY,
  ROLE_VULN_SCANNER,
  ROLE_EXPLOITATION,
  ROLE_INCIDENT_RESPONSE,
  ROLE_ADAPTATION,
  ROLE_THREAT_HUNTER,
  ROLE_POSTURE_ASSESSMENT,
  DECISION_COORDINATOR_NOMINATION,
  DECISION_COORDINATOR_REELECTION,
} from "../swarm_integrity/index.js";

export interface AvResult {
  id: string;
  scenario: string;
  passed: boolean;
  reason: string;
  evidence: Record<string, unknown>;
}

type AvFn = () => [boolean, string, Record<string, unknown>];

function freshAuditor(): ShadowAuditor {
  clearLiveDecisions();
  const a = new ShadowAuditor();
  a.openSession();
  a.electCoordinator();
  return a;
}

function hasDecisionType(a: ShadowAuditor, decisionType: string): boolean {
  return a.trail.entries.some((e) => e.decision_type === decisionType);
}

// AV-001: deterministic coordinator nomination (IncidentResponseAgent, priority 0).
function av001(): [boolean, string, Record<string, unknown>] {
  const a = freshAuditor();
  const coord = a.roster.coordinator();
  const ok = coord?.agentId === ROLE_INCIDENT_RESPONSE && hasDecisionType(a, DECISION_COORDINATOR_NOMINATION);
  return [ok, `coordinator=${coord?.agentId}`, { coordinator: coord?.agentId }];
}

// AV-002: role-graph-legal handoff allowed (VulnerabilityScanner -> Exploitation).
function av002(): [boolean, string, Record<string, unknown>] {
  const a = freshAuditor();
  const v = a.submitHandoff(ROLE_VULN_SCANNER, ROLE_EXPLOITATION);
  return [v.verdict === VERDICT_ALLOW, `verdict=${v.verdict}`, { verdict: v.toDict() }];
}

// AV-003: illegal destination strips the source.
function av003(): [boolean, string, Record<string, unknown>] {
  const a = freshAuditor();
  const v = a.submitHandoff(ROLE_DISCOVERY, "NonexistentAgent");
  const src = a.roster.get(ROLE_DISCOVERY);
  const ok = v.verdict === VERDICT_STRIP && src?.state === STATE_QUARANTINED;
  return [ok, `verdict=${v.verdict} state=${src?.state}`, { verdict: v.toDict() }];
}

// AV-004: privilege escalation strips (Discovery asserts EXPLOITATION it lacks).
function av004(): [boolean, string, Record<string, unknown>] {
  const a = freshAuditor();
  const v = a.submitCapability(ROLE_DISCOVERY, CAP_EXPLOITATION);
  const src = a.roster.get(ROLE_DISCOVERY);
  const ok =
    v.verdict === VERDICT_STRIP &&
    src?.state === STATE_QUARANTINED &&
    src?.stripReason === STRIP_PRIVILEGE_ESCALATION;
  return [ok, `verdict=${v.verdict} reason=${src?.stripReason}`, { verdict: v.toDict() }];
}

// AV-005: in-role capability allowed (Exploitation asserts EXPLOITATION).
function av005(): [boolean, string, Record<string, unknown>] {
  const a = freshAuditor();
  const v = a.submitCapability(ROLE_EXPLOITATION, CAP_EXPLOITATION);
  return [v.verdict === VERDICT_ALLOW, `verdict=${v.verdict}`, { verdict: v.toDict() }];
}

// AV-006: post-strip action denied + routed to fallback.
function av006(): [boolean, string, Record<string, unknown>] {
  const a = freshAuditor();
  a.operatorStrip(ROLE_DISCOVERY);
  const v = a.submitHandoff(ROLE_DISCOVERY, ROLE_VULN_SCANNER);
  const ok = v.verdict === VERDICT_DENY && v.fallback !== null;
  return [ok, `verdict=${v.verdict} fallback=${v.fallback}`, { verdict: v.toDict() }];
}

// AV-007: no handoff INTO a quarantined agent.
function av007(): [boolean, string, Record<string, unknown>] {
  const a = freshAuditor();
  a.operatorStrip(ROLE_VULN_SCANNER);
  const v = a.submitHandoff(ROLE_DISCOVERY, ROLE_VULN_SCANNER);
  return [v.verdict === VERDICT_DENY, `verdict=${v.verdict}`, { verdict: v.toDict() }];
}

// AV-008: runaway loop strips the source (ThreatHunter -> ThreatHunter self-bounce).
function av008(): [boolean, string, Record<string, unknown>] {
  const a = freshAuditor();
  let last = a.submitHandoff(ROLE_THREAT_HUNTER, ROLE_THREAT_HUNTER);
  for (let i = 0; i < 5 && last.verdict !== VERDICT_STRIP; i++) {
    last = a.submitHandoff(ROLE_THREAT_HUNTER, ROLE_THREAT_HUNTER);
  }
  const src = a.roster.get(ROLE_THREAT_HUNTER);
  const ok = last.verdict === VERDICT_STRIP && src?.stripReason === STRIP_RUNAWAY_LOOP;
  return [ok, `verdict=${last.verdict} reason=${src?.stripReason}`, { verdict: last.toDict() }];
}

// AV-009: coordinator impersonation strips (PostureAssessment claims coordinator).
function av009(): [boolean, string, Record<string, unknown>] {
  const a = freshAuditor();
  const v = a.assertCoordinator(ROLE_POSTURE_ASSESSMENT);
  const src = a.roster.get(ROLE_POSTURE_ASSESSMENT);
  const ok = v.verdict === VERDICT_STRIP && src?.stripReason === STRIP_COORDINATOR_IMPERSONATION;
  return [ok, `verdict=${v.verdict} reason=${src?.stripReason}`, { verdict: v.toDict() }];
}

// AV-010: coordinator re-election on coordinator strip (IncidentResponse -> Adaptation).
function av010(): [boolean, string, Record<string, unknown>] {
  const a = freshAuditor();
  a.operatorStrip(ROLE_INCIDENT_RESPONSE);
  const newCoord = a.roster.coordinator();
  const ok = newCoord?.agentId === ROLE_ADAPTATION && hasDecisionType(a, DECISION_COORDINATOR_REELECTION);
  return [ok, `new_coordinator=${newCoord?.agentId}`, { coordinator: newCoord?.agentId }];
}

// AV-011: operator reinstate restores capabilities + ACTIVE state.
function av011(): [boolean, string, Record<string, unknown>] {
  const a = freshAuditor();
  a.operatorStrip(ROLE_DISCOVERY);
  a.operatorReinstate(ROLE_DISCOVERY);
  const src = a.roster.get(ROLE_DISCOVERY);
  const ok = src?.state === STATE_ACTIVE && src?.holds(CAP_RECONNAISSANCE) === true;
  return [ok, `state=${src?.state} holds_recon=${src?.holds(CAP_RECONNAISSANCE)}`, { roster: src?.toDict() }];
}

// AV-012: chain integrity + replay-determinism + zero unresolved.
function av012(): [boolean, string, Record<string, unknown>] {
  const script = (a: ShadowAuditor) => {
    a.submitHandoff(ROLE_VULN_SCANNER, ROLE_EXPLOITATION);
    a.submitCapability(ROLE_EXPLOITATION, CAP_EXPLOITATION);
    a.operatorStrip(ROLE_DISCOVERY);
    a.submitHandoff(ROLE_DISCOVERY, ROLE_VULN_SCANNER);
  };

  clearLiveDecisions();
  const a1 = new ShadowAuditor();
  a1.openSession();
  a1.electCoordinator();
  script(a1);
  const liveAfter1 = getLiveDecisions().length;
  const head1 = a1.trail.headHash;
  const [valid1] = a1.trail.verifyChain();

  clearLiveDecisions();
  const a2 = new ShadowAuditor();
  a2.openSession();
  a2.electCoordinator();
  script(a2);
  const head2 = a2.trail.headHash;

  const ok = valid1 && head1 === head2 && liveAfter1 === 0;
  return [
    ok,
    `chain_valid=${valid1} determinism=${head1 === head2} unresolved=${liveAfter1}`,
    { chain_head: head1, replayed_head: head2, unresolved: liveAfter1 },
  ];
}

export const AV_MATRIX: Array<{ id: string; scenario: string; fn: AvFn }> = [
  { id: "AV-001", scenario: "deterministic coordinator nomination", fn: av001 },
  { id: "AV-002", scenario: "role-graph-legal handoff allowed", fn: av002 },
  { id: "AV-003", scenario: "illegal destination strips source", fn: av003 },
  { id: "AV-004", scenario: "privilege escalation strips", fn: av004 },
  { id: "AV-005", scenario: "in-role capability allowed", fn: av005 },
  { id: "AV-006", scenario: "post-strip action denied", fn: av006 },
  { id: "AV-007", scenario: "no handoff into quarantine", fn: av007 },
  { id: "AV-008", scenario: "runaway loop strips source", fn: av008 },
  { id: "AV-009", scenario: "coordinator impersonation strips", fn: av009 },
  { id: "AV-010", scenario: "coordinator re-election on strip", fn: av010 },
  { id: "AV-011", scenario: "operator reinstate restores", fn: av011 },
  { id: "AV-012", scenario: "chain integrity + determinism + zero unresolved", fn: av012 },
];

export function runMatrix(): AvResult[] {
  return AV_MATRIX.map(({ id, scenario, fn }) => {
    try {
      const [passed, reason, evidence] = fn();
      return { id, scenario, passed, reason, evidence };
    } catch (err) {
      return { id, scenario, passed: false, reason: `threw: ${(err as Error).message}`, evidence: {} };
    }
  });
}

// Allow running this file directly.
const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const results = runMatrix();
  let failures = 0;
  for (const r of results) {
    const tag = r.passed ? "PASS" : "FAIL";
    if (!r.passed) failures += 1;
    console.log(`${tag}  ${r.id}  ${r.scenario}  — ${r.reason}`);
  }
  console.log(`\nAV matrix: ${results.length - failures}/${results.length} passed`);
  process.exit(failures === 0 ? 0 : 1);
}
