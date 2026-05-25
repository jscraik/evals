# JSC-370 Testing Ledger

## Status

pass

## Narrow Proofs

- Added a run-bundle allocation seam test proving identical same-second inputs
  allocate distinct directories and suffix the second run ID with -01.
- Added a check --json regression proving a latest suite mismatch fails before
  closure latest consistency or artifact trust.
- Added a runner regression proving a schema-invalid candidate run does not
  replace the previous latest pointer.
- Added a proof-context seam proving case validation returns the already parsed
  case document so check --json does not perform a second fixture read.
- Added an atomic JSON writer seam proving latest publication can replace a
  complete document without leaving temporary files behind.

## Commands Run

- pnpm test -> pass, 113 tests passed after reviewer-remediation changes.
  - validation_provenance:
    - command: `pnpm test`
    - outcome: `pass`
    - tests_passed: `113`
    - evidence_artifact_path: `artifacts/reviews/jsc-370-testing.md`
    - remediation_commit_sha: `0206e406abfa6326e97d59e2ad50445ec9c698af`
    - remediation_commit_timestamp_utc: `2026-05-25T00:03:38Z`
    - artifact_commit_sha: `5698723aad345f7eb34ecf4bbe36d42a04018519`
    - artifact_commit_timestamp_utc: `2026-05-25T15:33:22Z`
    - validation_timestamp_utc: `not_recorded_in_original_ledger`
    - related_ledgers: `artifacts/reviews/jsc-370-simplify.md`, `artifacts/reviews/jsc-370-unslopify.md`
- pnpm evals run fixtures/smoke/pr-closeout.case.json --json -> pass, produced
  a passing smoke run with suite_id and artifact_root in the JSON output.
  - validation_provenance:
    - command: `pnpm evals run fixtures/smoke/pr-closeout.case.json --json`
    - outcome: `pass`
    - evidence_artifact_path: `artifacts/reviews/jsc-370-testing.md`
    - artifact_commit_sha: `5698723aad345f7eb34ecf4bbe36d42a04018519`
    - artifact_commit_timestamp_utc: `2026-05-25T15:33:22Z`
    - validation_timestamp_utc: `not_recorded_in_original_ledger`
- pnpm evals check --json -> pass, emitted expected_context,
  observed_latest_context, context_match true, and latest proof context pass.
  - validation_provenance:
    - command: `pnpm evals check --json`
    - outcome: `pass`
    - evidence_artifact_path: `artifacts/reviews/jsc-370-testing.md`
    - artifact_commit_sha: `5698723aad345f7eb34ecf4bbe36d42a04018519`
    - artifact_commit_timestamp_utc: `2026-05-25T15:33:22Z`
    - validation_timestamp_utc: `not_recorded_in_original_ledger`
- pnpm evals state --json -> pass, runtime state ready.
  - validation_provenance:
    - command: `pnpm evals state --json`
    - outcome: `pass`
    - evidence_artifact_path: `artifacts/reviews/jsc-370-testing.md`
    - artifact_commit_sha: `5698723aad345f7eb34ecf4bbe36d42a04018519`
    - artifact_commit_timestamp_utc: `2026-05-25T15:33:22Z`
    - validation_timestamp_utc: `not_recorded_in_original_ledger`
- pnpm verify -> pass, repository aggregate verification passed.
  - validation_provenance:
    - command: `pnpm verify`
    - outcome: `pass`
    - evidence_artifact_path: `artifacts/reviews/jsc-370-testing.md`
    - artifact_commit_sha: `5698723aad345f7eb34ecf4bbe36d42a04018519`
    - artifact_commit_timestamp_utc: `2026-05-25T15:33:22Z`
    - validation_timestamp_utc: `not_recorded_in_original_ledger`

## Residual Testing Risk

The current tests prove same-process sequential collision handling through the
atomic directory seam. They do not simulate true multi-process parallel CLI
contention. The implementation uses mkdir as the filesystem arbiter, so the
remaining risk is low, but a future stress test could add concurrent process
coverage if repeated collisions become operationally relevant.

The atomic JSON writer seam proves replacement behavior but does not perform a
concurrent reader stress test. The shared latest publication now uses
same-directory temp-file replacement, which removes the known partial-write
window without introducing a broader runtime dependency.
