# Riteway Prior-Art Assertion Result Fix

## Source Gap

- GAP-RW-001: no first-class assertion result shape
- GAP-RW-002: human reports do not surface assertion diagnostics
- GAP-RW-003: shared contract assertions do not use the scorer diagnostic grammar
- GAP-RW-006: failure artifacts are command-oriented instead of assertion-oriented

GAP-RW-004, GAP-RW-005, and GAP-RW-007 remain phase-one guardrail fixes rather
than runtime feature work. Prompt authoring, external producer import contracts,
and LLM judge aggregation require a later ADR before they can become executable
behavior.

## Owner Module

`src/lib/assertion-results.js` owns assertion-result construction and flattening.
`src/lib/scoring.js` owns deterministic scorer emission. `src/lib/contract-catalog.js`
adapts shared contract assertions into the same diagnostic grammar.

## Public Interface

- `schemas/assertion-result.schema.json`
- `schemas/scorer-result.schema.json` `results[].assertions`
- `schemas/eval-result.schema.json` `failed_assertions`
- `report.md` `## Deterministic Assertions`
- `pnpm evals validate-contracts --json` `checks[].assertion_results[]`

## Hidden Implementation Rule

Riteway is prior art only. The implementation may borrow the human-readable
Given/should grammar, but it must not import Riteway, TAP, `.sudo` prompt suites,
external source-mining contracts, or required LLM judge aggregation into the
phase-one runtime.

## Caller Contract

Callers must inspect scorer results, failed assertions, or the deterministic
assertion report table for failure triage. They must not infer assertion state
from command text alone.

## Seam Test

- Run bundle tests assert scorer assertions exist and report rows render.
- Malformed JSON stdout tests assert actual/expected assertion diagnostics.
- Shared contract tests assert good and bad fixtures emit normalized assertion
  fields.
- Architecture tests reject Riteway and required LLM judge dependencies.

## Tracer Proof

`pnpm evals run fixtures/smoke/pr-closeout.case.json --json` writes
`scorer-results.json`, `result.json`, and `report.md` with assertion diagnostics.
`pnpm evals check --json` validates the latest scorer-result artifact through
the normal latest pointer path.

## Rollback Path

Remove `schemas/assertion-result.schema.json`, the scorer `assertions` field,
the result `failed_assertions` field, the report assertion section, and the
contract-catalog normalized fields. Re-run the smoke command and `pnpm verify`
to restore the previous scorer-only artifact shape.

## Validation Gate

- `pnpm test`
- `pnpm evals run fixtures/smoke/pr-closeout.case.json --json`
- `pnpm evals check --json`
- `pnpm evals check --smoke --json`
- `pnpm verify`
