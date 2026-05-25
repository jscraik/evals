# JSC-370 Deep Module Fix Packet: Latest Proof Context

## Source Gap

JSC-370 closes the latest/run false-success trust boundary before the repo-local
suite contract expands scope. The current runner and validator have three
runtime gaps:

- latest.json can be published before the full artifact bundle is complete.
- check --json validates the smoke fixture and the latest run independently,
  but does not prove that latest belongs to the expected smoke proof context.
- Run IDs use second-level time plus case/hash and can collide when identical
  runs start in the same second.

## Owner Modules

- src/lib/run-bundle.js owns collision-resistant run artifact directory
  allocation.
- src/lib/latest-run.js owns latest pointer validation, artifact-bundle
  validation, expected/observed proof-context comparison, and mismatch recovery
  metadata.
- src/lib/paths.js owns repository root containment for case paths, latest
  paths, manifest artifact paths, and other repo-relative proof artifacts.
  Containment must be symlink-aware before any trust-boundary owner reads an
  artifact.
- src/commands/run.js calls the run-bundle owner and publishes latest.json
  only after final bundle validation.
- src/commands/validation.js supplies the expected smoke context to
  validateLatestRun for check --json.

## Public Interface

### Run Bundle Allocation

createRunBundleDirectory({ runsRoot, startedAt, caseId, rawCase })

Returns a runId, runDir, and repo-relative artifactRoot. The first ID remains
compatible with the existing format. Collisions append a stable numeric suffix
such as -01.

### Latest Proof Context

validateLatestRun(latestPath, { expectedContext })

When expectedContext is supplied, the return object includes:

- expected_context
- observed_latest_context
- context_match
- context_mismatch_reason
- recovery_command

Direct validate latest.json remains artifact-integrity focused and does not
require an expected context.

### CLI Output

pnpm evals check --json must include the proof-context fields above. The change
is additive.

## Hidden Implementation Rule

- Allocate artifact directories with atomic mkdir and retry only on EEXIST.
- Publish the shared latest pointer with same-directory temp-file replacement
  so readers observe either the previous complete pointer or the new complete
  pointer.
- Validate latest provenance before trusting artifact paths when expected
  context is supplied.
- Resolve repository containment through real filesystem paths, not only
  string-prefix checks, so an in-repo symlink cannot redirect case or artifact
  validation to a path outside the evaluated repository.
- Validate a run-local latest candidate before publishing .harness/evals/runs/latest.json.
- Keep latest.json data-only. Do not introduce plugin hooks, executable scorer
  references, dashboards, cloud execution, networked suite execution, or
  telemetry authority.

## Caller Contract

- run.js must not publish latest.json until result, report, command log,
  baseline result, scorer results, trace events, and manifest are written and
  validated through the latest-run owner.
- validation.js must derive expected context from the canonical smoke case,
  not from narrative text, prior run state, or a second independent fixture
  read after validation.
- Callers must treat proof-context mismatch as failure and show the recovery
  command instead of reading stale artifacts as proof.

## Seam Tests

- A unit seam proves two identical run allocations in the same second receive
  distinct run directories.
- A CLI regression proves check --json fails when latest.json points at a
  different case or suite than the smoke proof context.
- A CLI regression proves check --json exposes matching proof-context fields
  for the current smoke run.
- A runner regression proves incomplete latest candidates are not advertised as
  passing latest evidence.
- A path-containment regression proves case validation rejects a path that is
  syntactically inside the repository but escapes through an in-repo symlink.

## Tracer Proof

The existing trace event file remains part of the final bundle. JSC-370 does
not promote trace or telemetry to authority; it only ensures the published
latest pointer is written after the trace artifact has a final manifest hash and
the full bundle validates.

## Rollback Path

Rollback is a revert of:

- src/lib/run-bundle.js
- modifications to src/commands/run.js
- modifications to src/commands/validation.js
- modifications to src/lib/latest-run.js
- modifications to src/lib/paths.js
- schemas/latest-run.schema.json
- related tests and fixtures

Rollback restores the previous latest pointer behavior. The risk is returning
to stale-latest and collision false-success exposure; record that explicitly if
rollback is used.

## Validation Gate

Minimum local gate before marking JSC-370 ready:

- pnpm test
- pnpm evals run fixtures/smoke/pr-closeout.case.json --json
- pnpm evals check --json
- pnpm verify

The narrow proof must include the new negative regression for context mismatch
and the run-allocation collision seam. Review-thread repair also requires the
symlink escape regression.
