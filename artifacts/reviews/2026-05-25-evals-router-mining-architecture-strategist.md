# Architecture Review: Evals Router External Code Tree Mining
Date: 2026-05-25
Reviewer: architecture-strategist
Target: .harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md

## Findings (Severity-Ranked)

### 1) High - Owner-module boundary is underspecified for OPP-001 and risks split authority
Evidence:
- .harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:266-281
- .harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:617-620

Why this is an architecture issue:
- The recommendation spans both `src/lib/suite-contract.js` and `src/lib/proof-contract-validation.js` without naming a single deep owner for "suite health classification."
- That creates likely choreography drift between suite parsing, proof validation, and runtime-state reporting, which conflicts with the repo's deep-module fix mechanics (one owner, explicit interface, caller contract).

Remediation:
- In the audit doc, define one owner module for health classification (likely `src/lib/proof-contract-validation.js` or a new dedicated `suite-health.js`) and explicitly constrain other modules to consume its output only.
- Add a short interface contract in the audit: input surfaces, classification enum, and where readiness capping is applied.

Fixable in audit doc now: Yes.

### 2) High - OPP-002 says "one owner module" but proposed touch list reintroduces multi-owner coupling
Evidence:
- .harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:312-323

Why this is an architecture issue:
- The text correctly asks for one owner module, but the suggested files include `json.js`, `schema.js`, and `proof-contract-validation.js` together, which invites duplicated diagnostic shaping and parsing behavior.
- This can produce inconsistent diagnostic formats and hidden dependency flow from parser to validator to proof layer.

Remediation:
- Tighten the audit doc to explicitly assign ownership (for example: `src/lib/json.js` owns parse + duplicate-key + source-map diagnostics; `schema.js` and `proof-contract-validation.js` only consume normalized diagnostics).
- Add a "do not duplicate diagnostics formatting outside owner module" constraint under acceptance.

Fixable in audit doc now: Yes.

### 3) Medium - Contract lifecycle metadata proposal lacks clear placement boundary, risking governance/data coupling
Evidence:
- .harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:351-369

Why this is an architecture issue:
- Suggested file location is ambiguous (`fixtures/contracts/**` or `.harness/contracts/**`), which can blur runtime contract data vs governance-only evidence surfaces.
- Without one canonical home, downstream tooling and validators may drift into dual-source behavior.

Remediation:
- Choose one canonical location in the audit doc now.
- State whether lifecycle metadata is runtime-loaded, check-time-only, or governance-only, and make non-authoritative mirrors explicitly forbidden.

Fixable in audit doc now: Yes.

### 4) Medium - Failure replay capsule design is missing authority/retention boundary and can accidentally become proof authority
Evidence:
- .harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:444-456
- .harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:474-477

Why this is an architecture issue:
- The doc says replay is advisory, but it does not define where capsules live, how they are indexed relative to latest-run pointers, or how stale capsules are prevented from being interpreted as current truth.
- That is a common authority drift path in executable-spine systems.

Remediation:
- Add explicit storage and lifecycle rules in the audit (for example: per-run artifact bundle only, never read by readiness gates, optional GC policy, no latest pointer promotion semantics).
- Add one acceptance bullet that readiness checks ignore replay capsules.

Fixable in audit doc now: Yes.

### 5) Low - Sequence order underplays trace-stability precondition for evidence-bearing expansions
Evidence:
- .harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:594-601

Why this is an architecture issue:
- OPP-007 (trace stability classification) is sequenced after OPP-004 to OPP-006, even though those opportunities increase evidence richness that may rely on trustworthy trace semantics.
- Running richer metadata/aggregation work before trace stability can increase rework and validation ambiguity.

Remediation:
- Move OPP-007 earlier (immediately after OPP-002 or OPP-003), or add a dependency note that OPP-004 to OPP-006 must not require trace-backed readiness until OPP-007 lands.

Fixable in audit doc now: Yes.

## Overall Assessment
The audit is directionally strong and phase-one aware, but several opportunities are still phrased as multi-module implementation sketches instead of deep-owner contracts. Tightening owner boundaries, authority rules, and dependency ordering in this document will materially reduce architecture drift during implementation.

WROTE: artifacts/reviews/2026-05-25-evals-router-mining-architecture-strategist.md
