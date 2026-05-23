# PU-001 Architecture Review (JSC-346)

## Scope
Reviewed working-tree changes in `src/lib/runtime-evidence-contract.js` and `test/cli.test.js` against PU-001 intent (artifact identity proof), deep-module mechanics, and phase-one constraints.

## Findings

### high
1. `src/lib/runtime-evidence-contract.js:237` to `src/lib/runtime-evidence-contract.js:241` only flags duplicate ArtifactWritten identity events when duplicate entries have distinct `event_id` values. Because `event_id` is optional in `schemas/runtime-evidence-case.schema.json`, two duplicate writes with missing `event_id` currently collapse to the same empty-string ID and evade ambiguity detection.
Remediation: treat duplicate identity writes as ambiguous regardless of `event_id`, or enforce required unique `event_id` for ArtifactWritten events at schema/validation level.

### low
1. `src/lib/runtime-evidence-contract.js:261` to `src/lib/runtime-evidence-contract.js:264` checks whether matching ArtifactWritten events came from a different subagent, but `writtenByIdentity` keys are built as `subagent_id:artifact_type:artifact_path` at `src/lib/runtime-evidence-contract.js:308`, so cross-subagent mismatches cannot reach this branch.
Remediation: either remove this unreachable branch to keep the owner-module contract crisp, or change identity indexing to `artifact_type:artifact_path` and keep explicit subagent verification as a separate step.

## Architecture Fit
- Change direction is aligned with PU-001 and the deep owner module boundary: artifact closeout moved from count-based to identity-based checks inside `scoreSubagentArtifactContract`.
- No phase-one hard-block violations detected (no dashboards, adapters, cloud runners, plugin systems, or cross-repo runtime dependencies introduced).
- Public contract drift appears additive and localized (`subagent-artifact-contract` scorer behavior hardening + tests).

## Residual Risk
- Duplicate-write ambiguity can still be under-detected in schema-valid fixtures lacking `event_id`, which weakens the intended trust-boundary guarantee for artifact identity.

WROTE: artifacts/reviews/pu001-architecture.md
