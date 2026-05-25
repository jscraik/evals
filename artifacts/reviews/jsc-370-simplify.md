# JSC-370 Simplify Ledger

## Status

pass

## Scope Reviewed

- src/commands/run.js
- src/commands/validation.js
- src/lib/latest-run.js
- src/lib/run-bundle.js
- schemas/latest-run.schema.json
- test/cli.test.js
- .harness/refactors/2026-05-24-jsc-370-latest-proof-context.md

## Cleanup Applied

- Folded proof-context comparison into the existing latest validation owner,
  src/lib/latest-run.js, after architecture review showed the separate
  latest-proof-context helper would split one trust boundary across two modules.
- Kept src/lib/run-bundle.js as the only new runtime owner because run ID and
  artifact directory allocation were previously inline in src/commands/run.js
  and had no reusable owner seam.

## No-Change Rationale

- Kept latest-candidate.json as a run-local validation scratch artifact instead
  of adding a broader transaction abstraction. It solves the false-publication
  risk without adding a framework.
- Kept check --json as the only caller that supplies expected proof context.
  Direct validate remains useful for artifact integrity checks on arbitrary
  latest pointers.

## Validation Evidence

- pnpm test -> pass, 111 tests passed.
  - validation_provenance:
    - command: `pnpm test`
    - outcome: `pass`
    - tests_passed: `111`
    - evidence_artifact_path: `artifacts/reviews/jsc-370-simplify.md`
    - artifact_commit_sha: `5698723aad345f7eb34ecf4bbe36d42a04018519`
    - artifact_commit_timestamp_utc: `2026-05-25T15:33:22Z`
    - validation_timestamp_utc: `not_recorded_in_original_ledger`
    - note: `This ledger predates the reviewer-remediation test-count increase; post-remediation validation is recorded in artifacts/reviews/jsc-370-testing.md.`
- pnpm verify -> pass, aggregate repository gate passed.
  - validation_provenance:
    - command: `pnpm verify`
    - outcome: `pass`
    - evidence_artifact_path: `artifacts/reviews/jsc-370-simplify.md`
    - artifact_commit_sha: `5698723aad345f7eb34ecf4bbe36d42a04018519`
    - artifact_commit_timestamp_utc: `2026-05-25T15:33:22Z`
    - validation_timestamp_utc: `not_recorded_in_original_ledger`
