# JSC-372 HE Code Review

Status: complete

## Findings

No blocking findings.

### Fixed: runtime packet schema duplication now has parity enforcement

Evidence: `schemas/runtime-state.schema.json` embeds the `evidence_packet` object shape while `schemas/runtime-evidence-packet.schema.json` also defines the standalone packet contract. The local validator's supported keyword set in `src/lib/schema.js:61` does not include `$ref`, so this is an accepted phase-one duplication rather than a current defect.

Remediation: complete for phase one. `test/schema.test.js` now asserts that `runtime-state.schema.json` embeds the same `evidence_packet.required` and `evidence_packet.properties` contract as `runtime-evidence-packet.schema.json`. When the schema validator supports references or schema composition, collapse the duplicate packet shape into one canonical reusable definition.

### Fixed: packet readiness was ambiguous when evidence completeness passed in non-ready states

Evidence: reviewer feedback showed that `missing-evidence` could pass while `runtime_state.status` was `missing` or `invalid`, because that scorer is evidence-completeness-only. The slice now emits `readiness_verdict` in `src/lib/claim-evidence-contract.js` and validates it in both packet schemas. `test/cli.test.js` asserts the ready path returns `readiness_verdict.status: pass` and the latest-missing path returns `readiness_verdict.status: fail`.

Remediation: complete.

### Fixed: latest-missing blocker detail was too generic for agent retry

Evidence: the latest-missing path now emits `.harness/evals/runs/latest.json is missing; run pnpm evals run fixtures/smoke/pr-closeout.case.json --json` through the packet blocker. `test/cli.test.js` asserts the exact blocker code and recovery detail.

Remediation: complete.

## Positive Checks

- `src/lib/claim-evidence-contract.js:15` centralizes missing-evidence scoring rather than letting callers decide proof sufficiency.
- `src/lib/claim-evidence-contract.js` emits an explicit `readiness_verdict` so consumers do not mistake evidence completeness for runtime readiness.
- `src/lib/claim-evidence-contract.js:31` prevents artifact-exists claims from passing on path presence alone.
- `src/lib/runtime-state.js:216` integrates packet publication through the existing runtime-state owner.
- `src/lib/schema.js:39` registers claim, evidence, and runtime evidence packet schemas as executable contracts.
- `test/cli.test.js:393` verifies the state command emits a schema-valid runtime evidence packet.
- `test/cli.test.js:436` and `test/cli.test.js:452` prove the two false-success regressions fail deterministically.

## Validation Reviewed

- `git diff --check`: pass
- `pnpm test`: pass
- `pnpm evals run fixtures/smoke/pr-closeout.case.json --json`: pass
- `pnpm evals check --json`: pass
- `pnpm evals state --json`: pass
- `pnpm test`: pass, 122 tests after reviewer-driven readiness, blocker-detail, and schema-parity fixes
- `pnpm verify`: pass after reviewer-driven readiness, blocker-detail, and schema-parity fixes

WROTE: artifacts/reviews/jsc-372-he-code-review.md
