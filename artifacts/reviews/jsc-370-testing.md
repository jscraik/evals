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
- pnpm evals run fixtures/smoke/pr-closeout.case.json --json -> pass, produced
  a passing smoke run with suite_id and artifact_root in the JSON output.
- pnpm evals check --json -> pass, emitted expected_context,
  observed_latest_context, context_match true, and latest proof context pass.
- pnpm evals state --json -> pass, runtime state ready.
- pnpm verify -> pass, repository aggregate verification passed.

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
