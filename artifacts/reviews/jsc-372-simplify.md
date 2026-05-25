# JSC-372 Simplify Ledger

Status: complete

## Scope

Reviewed the JSC-372 diff for behavior-preserving simplification after implementing the claim/evidence schemas, missing-evidence scorer, and runtime evidence packet v1.

## Cleanup Applied

- Removed an unreachable conditional branch in `src/lib/claim-evidence-contract.js` so artifact evidence always uses the single phase-one `artifact` type while manifest evidence remains separate.
- Kept claim/evidence proof logic inside `src/lib/claim-evidence-contract.js` instead of spreading missing-evidence checks across CLI callers, runtime-state callers, or tests.

## No-Change Rationale

- The packet shape is duplicated in `schemas/runtime-state.schema.json` and `schemas/runtime-evidence-packet.schema.json` because the repo-local schema validator does not advertise `$ref` support in `src/lib/schema.js:61`. Replacing that with schema composition would be a validator-contract change outside this slice.
- Git state collection remains in the claim/evidence owner because it is additive runtime packet evidence and fails closed as `unavailable` when git commands cannot run.

## Evidence

- `src/lib/claim-evidence-contract.js:15` keeps missing-evidence scoring as one function.
- `src/lib/claim-evidence-contract.js:54` builds the runtime evidence packet in the proof-contract owner.
- `src/lib/runtime-state.js:216` publishes the packet through the existing runtime-state owner.

WROTE: artifacts/reviews/jsc-372-simplify.md
