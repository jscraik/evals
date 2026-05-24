# JSC-371 Adversarial Review

## Findings (severity-ranked)

No new adversarial composition/cascade failures found in the reviewed JSC-371 slice.

## Previously reported findings status

1. Fixed: suite outside `.evals` could publish artifacts under unintended parent.
- Evidence:
  - `src/lib/suite-contract.js:56-63` derives eval root with `nearestEvalRoot` and fails closed when absent via `suite path must be inside a .evals directory`.
  - `src/commands/run.js:379-388` exits through `emitFailure` on suite validation errors before any call to `executeCase`.
  - `test/cli.test.js:294-306` asserts misplaced suite run fails and `.harness/evals/runs` is not created.
- Remediation status: complete for phase-one contract.

2. Fixed: `artifact_policy.write_bundle=false` / `retain_locally=false` accepted but ignored.
- Evidence:
  - `src/lib/suite-contract.js:82-87` explicitly rejects both flags unless `true`.
  - `src/commands/run.js:379-388` blocks execution on those validation errors before bundle creation.
  - `test/cli.test.js:312-328` validates failure output and absence of artifact publication.
- Remediation status: complete for phase-one fail-closed behavior.

## Residual adversarial risks

- Low: executable scorer detection uses a pattern heuristic (`src/lib/suite-contract.js:9,41-46`) rather than a strict allowlist. This is acceptable in phase one because non-`.scorer.json` refs are blocked by policy intent and tests, but future scorer extensibility should replace heuristic deny logic with explicit allowed scorer contract types.

## Final verdict

PASS: the two remediated adversarial findings are fixed with pre-publication fail-closed guards and regression coverage. No new cross-module failure chains were identified in the requested scope.

WROTE: artifacts/reviews/jsc-371-adversarial-reviewer.md

