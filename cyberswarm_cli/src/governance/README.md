# `src/governance/` — CyberSwarm two-layer integrity

A TypeScript port of Decepticon's governance model, re-targeted onto CyberSwarm. Full design
in [`../../../docs/GOVERNANCE.md`](../../../docs/GOVERNANCE.md).

```
governance/
├── swarm_integrity/        Layer 2 — agent role/handoff integrity (ShadowAuditor)
│   ├── constants.ts          roles, capabilities, role-handoff graph, decision/algorithm vocab
│   ├── decision.ts           structural force-audit wrapper (resolve-or-record)
│   ├── trail.ts              seed-deterministic, hash-chained decision log
│   ├── roster.ts             AgentIdentity / AgentRoster (strip / reinstate)
│   ├── coordinator.ts        deterministic coordinator election
│   └── shadowAuditor.ts      the gates: submitHandoff / submitCapability / assertCoordinator
├── tool_governance/        Layer 1 — tool pipeline
│   ├── validation.ts         injection-class character rejection
│   ├── policy.ts             risk -> permission, danger ⇒ consent
│   ├── scope.ts              RFC1918 network-scope gate
│   ├── consent.ts            default-deny human consent (out-of-band nonce)
│   ├── audit.ts              HMAC hash-chained tool audit
│   └── executor.ts           validation→policy→scope→consent→audit→execute
├── gateway.ts              GovernanceGateway — composes Layer 2 + Layer 1 (cross-linked)
├── integration.ts          opt-in wiring helpers + process-wide singleton + kill-switch
└── validation/
    ├── avMatrix.ts           AV-001..012
    ├── toolGovSelftest.ts    Layer-1 + gateway behavior checks
    ├── runValidation.ts      emit the evidence bundle
    └── validateBundle.ts     independently re-verify -> GOVERNANCE-INTEGRITY-CLOSED.txt
```

Governance is **off by default**. Enable with `GOVERNANCE_ENABLED=1`. See the env table in
the design doc.

Quick check:

```bash
npx tsx src/governance/validation/avMatrix.ts        # 12/12
npx tsx src/governance/validation/toolGovSelftest.ts # 8/8
```
