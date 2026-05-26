# Check and State Semantics Boundary

Date: 2026-05-26
Goal slice: T003
Audit source: .harness/research/audits/2026-05-25-evidence-led-codebase-gap-audit.md
Related gap: GAP-002, check hard-binds proof context to smoke

## Owner Module

The owner module is src/commands/validation.js.

It owns the public check command semantics and decides whether a caller is asking
for observed latest validation or strict smoke proof-context validation.

## Public Interface

Default latest validation:

~~~bash
pnpm evals check --json
~~~

This validates the currently observed .harness/evals/runs/latest.json bundle for
schema, artifact, manifest, hash, trace, baseline, runtime-evidence, and
self-consistency. It must not require the latest bundle to be the smoke fixture.

Strict smoke proof validation:

~~~bash
pnpm evals check --smoke --json
~~~

This validates the same latest bundle and additionally compares its proof
context to fixtures/smoke/pr-closeout.case.json. If the latest bundle is not the
canonical smoke proof, the command fails with a smoke recovery command.

## Hidden Implementation Rule

src/lib/latest-run.js remains the hidden artifact-trust authority. The command
layer may decide whether to pass expectedContext, but it must not duplicate
latest schema, artifact, manifest, hash, baseline, or trace validation logic.

Default check mode must call validateLatestRun(latestPath) without an expected
proof context. Smoke mode must derive expectedContext from the canonical smoke
case and pass it to validateLatestRun().

## Caller Contract

Agents and humans can use pnpm evals check --json to validate the actual latest
evidence they are looking at, including repo-local suite output.

Agents and humans can use pnpm evals check --smoke --json when they specifically
need to prove the canonical smoke latest pointer.

The JSON output must identify the check mode so machine consumers do not infer
smoke validation from an observed-latest validation.

## Seam Test

The seam test belongs in test/cli.test.js:

- default check passes for a valid non-smoke repo-local latest bundle;
- smoke check fails for that same non-smoke latest bundle with a context
  mismatch and recovery command;
- smoke check passes for a canonical smoke latest bundle;
- malformed latest JSON still carries explicit mode and proof-context fields.

## Tracer Proof

Required validation evidence:

- pnpm test test/cli.test.js
- pnpm test
- pnpm evals check --json
- pnpm evals check --smoke --json
- pnpm evals state --json
- pnpm verify

Reviewer artifacts required before marking T003 done:

- artifacts/reviews/2026-05-26-t003-check-state-semantics-adversarial-reviewer.md
- artifacts/reviews/2026-05-26-t003-check-state-semantics-agent-native-reviewer.md

## Rollback Path

Rollback by removing explicit check mode parsing, restoring checkCommand() to
always pass the smoke expectedContext, and removing T003 tests and docs updates.

Rollback risk: returning to the prior behavior reopens GAP-002, where valid
non-smoke latest bundles fail the general check and operators may overwrite
evidence with smoke output.

## Validation Gate

T003 can close only when:

- default check validates observed latest evidence without smoke binding;
- strict smoke mode preserves the old smoke-context assertion;
- pnpm verify still performs a smoke-backed aggregate gate;
- docs and AGENTS references do not imply default check proves smoke context;
- required reviewer artifacts exist and are non-empty.
