# JSON Parse Diagnostics Deep Module Fix Packet

## Owner Module

src/lib/json.js owns trusted JSON file parsing for repository artifacts, schemas,
suite contracts, latest pointers, runtime state packets, and validation inputs.

## Public Interface

- readJson(path) reads a UTF-8 JSON file and returns the parsed value.
- parseJson(raw, options) parses JSON text supplied by callers that already
  own file reading.

Both interfaces reject duplicate object keys and raise actionable errors that
include the logical path when supplied by the caller.

## Hidden Implementation Rule

Duplicate-key detection is centralized in the JSON module. Callers must not
perform separate pre-scans or silently accept duplicate authority fields before
schema validation. The scanner is intentionally bounded to JSON syntax needed to
locate object member names; semantic schema validation remains owned by
src/lib/schema.js and contract-specific modules.

## Caller Contract

Callers that parse trusted artifact inputs use readJson(path) or
parseJson(raw, { path }). The thrown error message must identify:

- the affected path or logical path;
- the parse failure class, either JSON syntax or duplicate JSON key;
- the duplicate key name and object location when duplicate detection fires.

## Seam Test

The slice seam lives in test/cli.test.js and covers runtime-facing trusted
artifact paths:

- latest pointer duplicate-key rejection through pnpm evals check --json;
- trace event duplicate-key rejection through pnpm evals check --json;
- existing malformed JSON diagnostics remain path-specific.

## Tracer Proof

The validation command output is the tracer proof. Failed checks expose
path-specific errors in the same command JSON surfaces consumed by agents:

- validation.errors[]
- failed check entries under validation.checks[]
- runtime state validation fields when state --json reads latest.

## Rollback Path

Revert src/lib/json.js to direct JSON.parse(readFileSync(...)), restore any
callers that moved to the shared parser, and remove the duplicate-key regression
tests. Existing schema validation and malformed JSON syntax failures should
continue to work after rollback.

## Validation Gate

- pnpm test test/cli.test.js
- pnpm test
- pnpm verify

## Constraints

- No new runtime dependencies.
- No public JSON output break.
- No parser claims beyond the locally enforced duplicate-key and syntax checks.
- Preserve phase-one hard blocks and avoid introducing source-mining,
  telemetry-exporter authority, plugin, dashboard, or external-runner behavior.
