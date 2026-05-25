# Date-Time Review Thread Fix

Date: 2026-05-25
Source gap: PR #5 unresolved review thread `PRRT_kwDOShQiR86DnKM9`
Status: implementation packet

## Owner Module

`src/lib/schema.js` owns the local JSON Schema `format: "date-time"` rule.

## Public Interface

Callers continue to use `validateWithSchema(value, schema)` with schemas that
declare `{ "type": "string", "format": "date-time" }`.

## Hidden Implementation Rule

The validator accepts RFC3339 timestamps with either uppercase or lowercase
`T`/`Z` separators while still requiring an explicit time component and
rejecting date-only strings.

## Caller Contract

- Inputs: string values checked against schema `format: "date-time"`.
- Outputs: an empty error array for valid explicit timestamps, or
  `must be a date-time string` for invalid values.
- Compatibility: the public error shape and schema keyword support are unchanged.

## Seam Test

`test/schema.test.js` covers uppercase `T`/`Z`, lowercase `t`/`z`, and
date-only rejection through the real exported validator.

## Tracer Proof

`pnpm test test/schema.test.js` exercises the schema validator through the repository
test runner.

## Rollback Path

Revert this packet plus the small changes to `src/lib/schema.js` and
`test/schema.test.js` if the repository intentionally narrows date-time
validation beyond RFC3339 compatibility.

## Phase-One Check

This fix changes only local deterministic schema validation. It does not add a
dashboard, plugin system, cloud runner, external adapter root, source-mining
automation, required LLM judge gate, telemetry authority, or runtime dependency
on sibling repositories.

## Validation Gate

`pnpm test test/schema.test.js`
