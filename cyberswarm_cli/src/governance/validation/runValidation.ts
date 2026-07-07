/**
 * Emit the governance evidence bundle.
 *
 * Runs the AV matrix and the tool-governance selftest, drives a scripted ShadowAuditor +
 * GovernedToolExecutor session to populate both audit chains, then writes the artifacts a
 * reviewer can independently re-verify with validateBundle.ts.
 *
 * Run:  npx tsx src/governance/validation/runValidation.ts [--output-dir DIR]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  ShadowAuditor,
  clearLiveDecisions,
  CAP_RECONNAISSANCE,
  ROLE_DISCOVERY,
  ROLE_VULN_SCANNER,
  ROLE_EXPLOITATION,
} from "../swarm_integrity/index.js";
import { GovernedToolExecutor } from "../tool_governance/index.js";
import { runMatrix } from "./avMatrix.js";

function parseOutputDir(): string {
  const idx = process.argv.indexOf("--output-dir");
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return join(process.cwd(), "governance_output");
}

export function generateBundle(outDir: string): { closed: boolean; summary: Record<string, unknown> } {
  mkdirSync(outDir, { recursive: true });

  // 1. AV matrix.
  const avResults = runMatrix();
  const avPassed = avResults.filter((r) => r.passed).length;

  // 2. A scripted agent-integrity session (deterministic).
  clearLiveDecisions();
  const auditor = new ShadowAuditor();
  auditor.openSession("evidence-bundle");
  auditor.electCoordinator();
  auditor.submitHandoff(ROLE_VULN_SCANNER, ROLE_EXPLOITATION); // legal
  auditor.submitCapability(ROLE_DISCOVERY, CAP_RECONNAISSANCE); // in-role
  auditor.submitHandoff(ROLE_DISCOVERY, "NonexistentAgent"); // strip
  const agentReport = auditor.closeSession();

  // 3. A scripted tool-governance session populating the HMAC chain.
  process.env.GOVERNANCE_SESSION_AUTHORIZED = "1";
  const exec = new GovernedToolExecutor({ consentMode: "preauth", auditKey: "evidence-bundle-key" });
  exec.execute({ toolId: "nmap", agentId: ROLE_DISCOVERY, target: "8.8.8.8" }); // scope deny
  exec.execute({ toolId: "nmap", agentId: ROLE_DISCOVERY, target: "192.168.56.10" }, () => ({ simulated: true })); // allow
  delete process.env.GOVERNANCE_SESSION_AUTHORIZED;
  const toolReport = exec.report();

  // 4. Write artifacts.
  const artifacts: Record<string, unknown> = {
    "av_matrix_results.json": { passed: avPassed, total: avResults.length, results: avResults },
    "agent_decision_log.json": auditor.trail.export(),
    "agent_integrity_report.json": agentReport,
    "tool_audit_log.json": toolReport.audit,
    "tool_governance_report.json": { audit_valid: toolReport.audit_valid, audit_reason: toolReport.audit_reason },
  };
  for (const [name, data] of Object.entries(artifacts)) {
    writeFileSync(join(outDir, name), JSON.stringify(data, null, 2));
  }

  const closed = avPassed === avResults.length && agentReport.chain_valid && toolReport.audit_valid;
  const summary = {
    av: `${avPassed}/${avResults.length}`,
    agent_chain_valid: agentReport.chain_valid,
    agent_chain_head: agentReport.chain_head,
    tool_audit_valid: toolReport.audit_valid,
    stripped_agents: agentReport.stripped_agents,
  };

  const reportMd =
    `# CyberSwarm Governance Evidence Bundle\n\n` +
    `- AV matrix: **${avPassed}/${avResults.length}**\n` +
    `- Agent decision chain valid: **${agentReport.chain_valid}** (head \`${agentReport.chain_head}\`)\n` +
    `- Tool audit chain valid: **${toolReport.audit_valid}**\n` +
    `- Stripped in scripted session: ${agentReport.stripped_agents.join(", ") || "none"}\n\n` +
    `Re-verify independently with \`npx tsx src/governance/validation/validateBundle.ts --output-dir ${outDir}\`.\n`;
  writeFileSync(join(outDir, "integrity_report.md"), reportMd);

  return { closed, summary };
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const outDir = parseOutputDir();
  const { closed, summary } = generateBundle(outDir);
  console.log(`Evidence bundle written to ${outDir}`);
  console.log(JSON.stringify(summary, null, 2));
  console.log(closed ? "\nBundle generation: OK" : "\nBundle generation: INCOMPLETE");
  process.exit(closed ? 0 : 1);
}
