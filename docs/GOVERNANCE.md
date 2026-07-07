# CyberSwarm Governance — two-layer integrity for the autonomous swarm

This document describes the governance stack added under
`cyberswarm_cli/src/governance/`. It is a TypeScript port of the two-layer integrity model
first built for the Decepticon swarm (see that repo's
`docs/AGENT_INTEGRITY.md` / `docs/GOVERNED_KKI_INTEGRATION.md`), re-targeted onto
CyberSwarm's 19 agents and its Logic-Pipe-mediated control flow.

Both layers **fail closed**, are **tamper-evident**, and need **no LLM** for their
test/validation paths. Governance is **opt-in** in the live runtime so existing simulations
are unaffected until it is explicitly enabled.

```
agent decision  ──▶  ShadowAuditor (role/handoff/strip, seed-deterministic chain)   [Layer 2]
       │  (allowed handoff; agent then calls a tool)
       ▼
tool call        ──▶  GovernedToolExecutor (validation→policy→scope→consent→HMAC audit)  [Layer 1]
```

Layer 2 governs **who acts and how control moves**; Layer 1 governs **what each tool call
may do**. They cross-link by reference — each Layer-1 tool-audit entry records the Layer-2
agent-decision `entry_hash` that authorized it — so the two verifiable chains stay separate
(one replay-deterministic, the other keyed/tamper-evident) without merging.

---

## Layer 2 — Agent-level integrity (ShadowAuditor)

`src/governance/swarm_integrity/`

A parallel authority that runs alongside the swarm with power to **strip** (quarantine) any
agent that violates role integrity. In CyberSwarm there are no direct agent-to-agent calls:
control transfers when one agent emits an event and the Logic Pipe routes a downstream task
to another agent. That **source-agent → dest-agent** edge is the "handoff" this layer
governs. The legal-edge graph (`ROLE_HANDOFF_GRAPH`) is derived directly from the Logic Pipe
rules in `orchestrator/logic-pipe.ts`.

- **Roles** are the 19 agent types; **teams** are red/blue/purple.
- **Capabilities** are the 15 tool categories (1:1 with `security-tool-registry`'s
  `agentToolMap`) plus `HANDOFF` and `COORDINATE`. Because capabilities are derived from the
  same map the registry uses, any tool legitimately assigned to an agent asserts a
  capability that agent's role already holds — so legitimate use never false-strips.
- **Coordinator** is elected from the Purple team (RoE: coordinate red/blue *through*
  purple), `IncidentResponseAgent` first, ties broken lexicographically.

Fail-closed gates, in order: quarantine state → `HANDOFF` ownership → role-graph legality →
no-handoff-into-quarantine → runaway-loop bound. **Strips** on illegal handoff, privilege
escalation, coordinator impersonation, runaway loop, and post-strip action. Stripping the
coordinator triggers deterministic **re-election**. **Reinstate is operator-only** (no
self-resurrection).

**Audit chain:** seed-deterministic and hash-chained — the same seed + same event sequence
reproduce an identical `chain_head`. No wall-clock, RNG, UUID, or `Date` ever enters a
hashed entry. Every branch point is a `Decision` whose outcome is unreadable until it is
`resolve()`d, and resolution atomically appends to the chain; unresolved decisions can be
swept and force-recorded, never silently dropped.

### AV matrix (AV-001 … AV-012)

`src/governance/validation/avMatrix.ts` — 12 deterministic scenarios asserting: coordinator
nomination, legal/illegal handoff, privilege escalation, in-role capability, post-strip
denial, no-handoff-into-quarantine, runaway-loop strip, coordinator impersonation,
re-election, operator reinstate, and chain integrity + replay-determinism + zero unresolved.

---

## Layer 1 — Tool-level governance (GovernedToolExecutor)

`src/governance/tool_governance/`

Every governed tool call traverses, fail-closed at the first refusal:

1. **allowlist** — tool must exist in the registry.
2. **validation** — target and option values rejected if they contain injection-class
   characters (`; & | \` $ ( ) < > \ \n { } ' "`).
3. **policy** — classify by risk: high/critical or `requiresPrivilege` ⇒
   `danger-full-access` (consent required); medium ⇒ `workspace-write`; low ⇒ `read-only`.
4. **network-scope** — RoE enforcement: IPv4 targets must be RFC1918 (or an operator-supplied
   engagement CIDR); public IPs are denied. Hostnames are allowed but flagged
   un-range-verified (or denied under `strict`).
5. **consent** — danger tools require an out-of-band operator `APPROVE <nonce>`; default-deny.
   The agent never sees the nonce.
6. **HMAC audit** — append-only, keyed, hash-chained record of every ALLOW/DENY. Keyed and
   timestamped by design (tamper-evidence over reproducibility), so it is *deliberately
   different* from the Layer-2 chain.

---

## Composition — GovernanceGateway

`src/governance/gateway.ts`

```ts
gateway.governHandoff(sourceAgentType, destAgentType)              // Layer 2 only
gateway.governToolCall(agentType, toolId, target, options, perform) // Layer 2 → Layer 1
```

A tool call first passes the Layer-2 capability gate (is this agent's role entitled to the
capability this tool's category implies?). Only on ALLOW does it run the Layer-1 pipeline,
which records the Layer-2 `entry_hash` as its `agent_decision_ref`.

---

## Wiring into the runtime (opt-in)

Two integration points, both transparent no-ops unless enabled:

- **Logic Pipe** (`orchestrator/logic-pipe.ts`): after a rule creates downstream tasks, each
  control transfer is checked with `governTaskCreation(eventType, destAgentType)`; denied
  transfers are dropped (fail-closed) and logged.
- **Agents** (`agents/base-agent.ts`): `logToolUsage(...)` routes through
  `governedToolCall(...)`, annotating each `ToolExecution` with the governance verdict.

### Environment

| Variable | Effect |
|---|---|
| `GOVERNANCE_ENABLED=1` | turn governance on in the live path (default: **off**) |
| `GOVERNANCE_DISABLED=1` | hard kill-switch (overrides `ENABLED`) — isolate a suspected governance bug |
| `GOVERNANCE_CONSENT_MODE` | `deny` or `preauth` (default when enabled: `preauth`) |
| `GOVERNANCE_SESSION_AUTHORIZED=1` | auto-approve danger tools under `preauth` |
| `GOVERNANCE_SCOPE_CIDRS` | comma-separated extra engagement CIDRs |
| `GOVERNANCE_STRICT_SCOPE=1` | deny non-IP / non-RFC1918 targets |
| `GOVERNANCE_AUDIT_KEY` | HMAC key for the Layer-1 tool audit |

---

## Running the validation

```bash
cd cyberswarm_cli
npx tsx src/governance/validation/avMatrix.ts          # AV 12/12
npx tsx src/governance/validation/toolGovSelftest.ts   # Layer-1 + gateway checks
npx tsx src/governance/validation/runValidation.ts     # emit evidence bundle
npx tsx src/governance/validation/validateBundle.ts    # independently re-verify -> CLOSED
```

The bundle validator re-walks the agent chain from raw entries, re-runs the AV matrix
in-process, and writes `GOVERNANCE-INTEGRITY-CLOSED.txt` (per-artifact SHA-256 + explicit
non-claims) on success. A single tampered entry breaks the re-walk and aborts the close.

## Scope / non-claims

Proof-of-concept. Closure means the integrity **rules** behave correctly in deterministic
simulation. It does **not** claim correctness of any Gemini/LLM output, host integrity, a
tamper-proof auditor process, or production authorization. Layer-1 network-scope is
meaningful for IP targets; hostnames are not range-verified. Layer-1 binary attestation
(present in the Decepticon original) is omitted here because CyberSwarm tool calls are
simulated, not executed against co-located binaries.
