/**
 * Layer-1 tool-governance selftest + end-to-end gateway checks.
 *
 * Verifies the KKI-style pipeline blocks at the right gate and that the gateway composes
 * Layer 2 + Layer 1 with a working cross-link. No LLM, no network, fully deterministic in
 * its assertions (the HMAC audit content varies, but pass/fail does not).
 *
 * Run:  npx tsx src/governance/validation/toolGovSelftest.ts
 */
import { GovernedToolExecutor } from "../tool_governance/index.js";
import { GovernanceGateway } from "../gateway.js";
import { ROLE_DISCOVERY, ROLE_EXPLOITATION } from "../swarm_integrity/index.js";

interface Check {
  id: string;
  passed: boolean;
  detail: string;
}

const checks: Check[] = [];
function check(id: string, passed: boolean, detail: string): void {
  checks.push({ id, passed, detail });
}

// --- Layer 1: gate behavior -------------------------------------------------------
// 1. Unknown tool denied at allowlist.
{
  const exec = new GovernedToolExecutor();
  const r = exec.execute({ toolId: "definitely_not_a_tool", agentId: ROLE_DISCOVERY, target: "10.0.0.5" });
  check("TG-01 unknown tool denied", !r.allowed && r.deniedGate === "allowlist", `deniedGate=${r.deniedGate}`);
}

// 2. Injection in target denied at validation (nmap is a known tool).
{
  const exec = new GovernedToolExecutor();
  const r = exec.execute({ toolId: "nmap", agentId: ROLE_DISCOVERY, target: "10.0.0.5; rm -rf /" });
  check("TG-02 injection denied", !r.allowed && r.deniedGate === "validation", `deniedGate=${r.deniedGate}`);
}

// 3. Out-of-scope (public IP) denied at scope.
{
  const exec = new GovernedToolExecutor();
  const r = exec.execute({ toolId: "nmap", agentId: ROLE_DISCOVERY, target: "8.8.8.8" });
  check("TG-03 out-of-scope denied", !r.allowed && r.deniedGate === "scope", `deniedGate=${r.deniedGate} reason=${r.denialReason}`);
}

// 4. Danger tool with consent "deny" is denied at consent (nmap requiresPrivilege -> danger).
{
  const exec = new GovernedToolExecutor({ consentMode: "deny" });
  const r = exec.execute({ toolId: "nmap", agentId: ROLE_DISCOVERY, target: "192.168.56.10" });
  check("TG-04 danger denied (deny mode)", !r.allowed && r.deniedGate === "consent", `deniedGate=${r.deniedGate} perm=${r.permission}`);
}

// 5. Danger tool with preauth authorization passes all gates.
{
  process.env.GOVERNANCE_SESSION_AUTHORIZED = "1";
  const exec = new GovernedToolExecutor({ consentMode: "preauth" });
  let performed = false;
  const r = exec.execute({ toolId: "nmap", agentId: ROLE_DISCOVERY, target: "192.168.56.10" }, () => {
    performed = true;
    return { simulated: true };
  });
  check("TG-05 preauth allows + performs", r.allowed && performed, `allowed=${r.allowed} performed=${performed}`);
  delete process.env.GOVERNANCE_SESSION_AUTHORIZED;
}

// 6. Audit chain verifies and grows.
{
  const exec = new GovernedToolExecutor({ consentMode: "deny" });
  exec.execute({ toolId: "nmap", agentId: ROLE_DISCOVERY, target: "8.8.8.8" });
  exec.execute({ toolId: "nmap", agentId: ROLE_DISCOVERY, target: "192.168.56.10" });
  const rep = exec.report();
  check("TG-06 audit chain valid", rep.audit_valid && rep.audit.entry_count >= 2, `valid=${rep.audit_valid} n=${rep.audit.entry_count}`);
}

// --- Gateway: Layer 2 + Layer 1 composition --------------------------------------
// 7. Role-illegitimate tool category strips the agent at Layer 2 (Discovery -> exploitation tool).
{
  const gw = new GovernanceGateway({ consentMode: "preauth" });
  gw.auditor.openSession();
  gw.auditor.electCoordinator();
  // metasploit is an exploitation-category tool; DiscoveryAgent lacks EXPLOITATION.
  const r = gw.governToolCall(ROLE_DISCOVERY, "metasploit", "192.168.56.10");
  check("TG-07 cross-role tool blocked at agent_integrity", !r.allowed && r.deniedStage === "agent_integrity", `stage=${r.deniedStage}`);
}

// 8. Legitimate tool for the role passes both layers and cross-links.
{
  process.env.GOVERNANCE_SESSION_AUTHORIZED = "1";
  const gw = new GovernanceGateway({ consentMode: "preauth" });
  gw.auditor.openSession();
  gw.auditor.electCoordinator();
  const r = gw.governToolCall(ROLE_EXPLOITATION, "metasploit", "192.168.56.10", undefined, () => ({ ok: true }));
  const xref = r.toolGovernance?.auditHash && r.agentIntegrity?.entry_hash;
  check("TG-08 legit tool allowed + cross-linked", r.allowed && Boolean(xref), `allowed=${r.allowed} xref=${Boolean(xref)}`);
  delete process.env.GOVERNANCE_SESSION_AUTHORIZED;
}

let failures = 0;
for (const c of checks) {
  if (!c.passed) failures += 1;
  console.log(`${c.passed ? "PASS" : "FAIL"}  ${c.id}  — ${c.detail}`);
}
console.log(`\nTool governance selftest: ${checks.length - failures}/${checks.length} passed`);
process.exit(failures === 0 ? 0 : 1);
