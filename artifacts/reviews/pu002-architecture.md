# PU-002 Architecture Review

STATUS: completed

Scope: PU-002 runtime-evidence policy coverage enforcement.

## Findings

### blocker

None.

### high

None.

### medium

None.

### low

- src/lib/runtime-evidence-contract.js:179 includes per-check policy_coverage as well as the canonical runtime_evidence.policy_coverage surface in src/commands/validation.js:91. This is acceptable for traceability, but it increases public JSON surface area. Keep runtime_evidence.policy_coverage as the documented canonical aggregate and avoid downstream consumers treating per-check coverage as the only source of truth.

### informational

- src/lib/runtime-evidence-contract.js:11 owns the policy-family mapping in the runtime-evidence contract module, which keeps scorer authority and coverage authority in one owner module.
- src/lib/runtime-evidence-contract.js:241 fails closed with RTE_POLICY_*_UNSCORED when a declared enforced policy lacks its scorer.
- src/lib/runtime-evidence-contract.js:248 through src/lib/runtime-evidence-contract.js:257 keeps phase-one scaffold families non-authoritative by requiring explicit scaffolded_not_enforced reasons.
- src/commands/validation.js:91 exposes aggregate coverage under runtime_evidence.policy_coverage, matching the plan/spec requirement for a machine-readable check-output location.
- schemas/runtime-evidence-case.schema.json:117 through schemas/runtime-evidence-case.schema.json:158 extends fixture shape without adding unsupported $ref or $defs constructs.

## Recommendation

No architecture blocker remains for PU-002. Document the canonical aggregate location in the implementation evidence and continue to state/readiness only after this slice remains green under the full gate.

WROTE: artifacts/reviews/pu002-architecture.md
