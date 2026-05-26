# Deep Module Fix Packet: Pre-Mutation Latest Integrity

Date: 2026-05-26
Slice: T002
Audit source: .harness/research/audits/2026-05-25-evidence-led-codebase-gap-audit.md

## Owner Module

scripts/verify.js owns aggregate verification ordering.

src/lib/latest-run.js remains the hidden implementation authority for latest
pointer validation, artifact existence, schema checks, manifest consistency,
hash consistency, baseline consistency, and trace timeline validation.

## Public Interface

pnpm verify must run a pre-mutation latest integrity check before either smoke
run command can rewrite .harness/evals/runs/latest.json.

The explicit check label is:

    pre-mutation latest integrity: .harness/evals/runs/latest.json

## Hidden Implementation Rule

If .harness/evals/runs/latest.json exists, scripts/verify.js validates it
through validateLatestRun() before any smoke command is allowed to mutate the
latest pointer.

If the latest pointer is absent, the check records a classified pass because a
clean setup may need the smoke run to create the first latest pointer before
the post-smoke check.

## Caller Contract

Callers may rely on pnpm verify to detect corrupt preexisting latest evidence
before the aggregate gate refreshes smoke artifacts.

Callers must not treat this pre-mutation check as proof that future smoke output
is valid. Post-smoke validation remains owned by pnpm evals check --json.

## Seam Test

test/verify.test.js covers:

- the pre-mutation check appears before the smoke mutation command;
- corrupt existing latest JSON fails before smoke can overwrite it;
- absent latest state is explicitly classified without blocking clean setup.

## Tracer Proof

Validation evidence is recorded in:

- docs/goals/2026-05-26-evals-evidence-led-gap-audit/receipts.jsonl
- .harness/implementation-notes/2026-05-26-evals-evidence-led-gap-audit-notes.mdx

## Rollback Path

Remove the preMutationLatestIntegrityCheck() check from scripts/verify.js and
remove the corresponding tests from test/verify.test.js.

Rollback should be used only if the check creates a false failure that cannot
be resolved by clarifying missing-latest semantics or latest validation errors.

## Validation Gate

Minimum required commands for this slice:

    pnpm test test/verify.test.js
    pnpm test
    pnpm evals check --json
    pnpm verify

pnpm verify is expected to mutate smoke run artifacts as part of the canonical
aggregate gate.
