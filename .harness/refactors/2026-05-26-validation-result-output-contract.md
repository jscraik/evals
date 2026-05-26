# Validation Result Output Contract

Date: 2026-05-26
Goal slice: T004
Audit source: .harness/research/audits/2026-05-25-evidence-led-codebase-gap-audit.md
Related gap: GAP-003, machine JSON outputs for validate/check have no published schema contract

## Source Gap

The audit found that agent-facing validation commands emit JSON that is consumed
by humans, agents, and aggregate gates, but the command result shape is not
registered as a schema-backed contract. That leaves callers inferring durable
fields from examples, tests, or prose.

## Owner Module

schemas/validation-result.schema.json owns the published JSON result shape for
validation-style command output.

src/lib/schema.js owns schema target registration so the contract is
discoverable by repo-native schema checks.

src/commands/validation.js remains the runtime owner for validate, validate
schema, and check command behavior. It must not duplicate schema definitions.

## Public Interface

The schema target is validationResult.

The schema covers the stable machine fields emitted by:

~~~bash
pnpm evals validate fixtures/smoke/pr-closeout.case.json --json
pnpm evals check --json
pnpm evals check --smoke --json
~~~

The public command-output contract requires status, checks, and errors. Check
mode and proof-context fields are additive fields for callers that need to
distinguish observed-latest validation from strict smoke validation.

## Hidden Implementation Rule

Callers may depend on the schema-backed fields, not on incidental object layout
or prose examples. The schema should describe the result envelope and core check
items while leaving detailed nested evidence payloads owned by their existing
schemas and runtime validators.

The schema must stay additive unless a compatibility decision and migration note
are recorded before narrowing or renaming public JSON fields.

## Caller Contract

Agents and humans can parse validation command output as a JSON object with:

- status: passed or failed;
- checks: ordered validation evidence records;
- errors: top-level failure messages;
- optional check/proof-context metadata when the command validates latest run
  evidence.

Consumers must not treat a passing validation-result schema check as proof that
the underlying implementation is correct. It proves only that the command result
shape is compatible with the published contract.

## Seam Test

test/schema.test.js validates representative validate and check JSON outputs
against schemas/validation-result.schema.json.

The tests also prove that required envelope fields are enforced, invalid core
field values are rejected, and unknown top-level fields remain accepted for
additive compatibility. Accidental drift in the stable envelope becomes visible
during pnpm test without blocking future additive metadata.

## Tracer Proof

Required validation evidence:

- pnpm test test/schema.test.js
- pnpm test
- pnpm evals validate fixtures/smoke/pr-closeout.case.json --json
- pnpm evals check --json
- pnpm evals check --smoke --json
- pnpm verify

Reviewer artifacts required before marking T004 done:

- artifacts/reviews/2026-05-26-t004-validation-result-contract-adversarial-reviewer.md
- artifacts/reviews/2026-05-26-t004-validation-result-contract-agent-native-reviewer.md

## Rollback Path

Rollback by removing schemas/validation-result.schema.json, removing the
validationResult schema target registration from src/lib/schema.js, and removing
the representative schema tests.

Rollback risk: callers return to inferring validation JSON shape from examples
and mutable command implementations, reopening GAP-003.

## Phase-One Check

This slice adds a local schema contract and tests only. It does not introduce
dashboards, external adapters, cloud runners, telemetry authority, plugin
systems, source-mining automation, LLM judge gates, or runtime dependencies on
coding-harness or agent-skills.

## Validation Gate

T004 can close only when:

- validation-result schema exists and is registered;
- representative validate and check outputs validate against the schema;
- required envelope fields are enforced by tests;
- existing eval commands still pass;
- pnpm verify remains green;
- required reviewer artifacts exist and are non-empty or a coverage gap is
  recorded after the required retry.
