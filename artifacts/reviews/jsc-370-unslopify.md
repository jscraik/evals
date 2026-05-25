# JSC-370 Unslopify Ledger

## Status

pass

## Unsupported or Misleading Surfaces Removed

- Removed the separate src/lib/latest-proof-context.js module before commit.
  The behavior is now part of src/lib/latest-run.js, which is already the owner
  of latest pointer validation and artifact trust.

## Surfaces Kept

- src/lib/run-bundle.js: kept because it hides atomic run directory allocation
  and collision suffixing behind a testable seam.
- .harness/refactors/2026-05-24-jsc-370-latest-proof-context.md: kept because
  the repo requires a deep module fix packet before runner/schema/artifact
  behavior changes.
- .harness/implementation-notes/2026-05-24-jsc-370-implementation-notes.html:
  kept because Jamie explicitly requested a running browser-visible
  implementation notes artifact.

## Phase-One Hard Block Check

No dashboards, plugin systems, cloud runners, networked suite execution,
required LLM judge gates, source-mining automation, telemetry authority, or
runtime dependencies on consumer repos were introduced.

## Validation Evidence

- pnpm test -> pass, 111 tests passed.
  - validation_provenance:
    - command: `pnpm test`
    - outcome: `pass`
    - tests_passed: `111`
    - evidence_artifact_path: `artifacts/reviews/jsc-370-unslopify.md`
    - artifact_commit_sha: `5698723aad345f7eb34ecf4bbe36d42a04018519`
    - artifact_commit_timestamp_utc: `2026-05-25T15:33:22Z`
    - validation_timestamp_utc: `not_recorded_in_original_ledger`
- pnpm evals check --json -> pass, proof context matched smoke latest.
  - validation_provenance:
    - command: `pnpm evals check --json`
    - outcome: `pass`
    - evidence_artifact_path: `artifacts/reviews/jsc-370-unslopify.md`
    - artifact_commit_sha: `5698723aad345f7eb34ecf4bbe36d42a04018519`
    - artifact_commit_timestamp_utc: `2026-05-25T15:33:22Z`
    - validation_timestamp_utc: `not_recorded_in_original_ledger`
- pnpm verify -> pass, aggregate repository gate passed.
  - validation_provenance:
    - command: `pnpm verify`
    - outcome: `pass`
    - evidence_artifact_path: `artifacts/reviews/jsc-370-unslopify.md`
    - artifact_commit_sha: `5698723aad345f7eb34ecf4bbe36d42a04018519`
    - artifact_commit_timestamp_utc: `2026-05-25T15:33:22Z`
    - validation_timestamp_utc: `not_recorded_in_original_ledger`
