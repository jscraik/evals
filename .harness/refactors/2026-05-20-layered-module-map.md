# Layered Module Map

Date: 2026-05-20
Status: first-pass source modularization map
Decision: staged split selected

## Purpose

The project started with a single CLI file that owned command routing, fixture
validation, schema validation, scoring, artifact writing, latest-run checks,
failure handling, and reporting. That made the executable spine compact, but it
also made audit fixes harder to place.

This map keeps the CLI contract stable while making each owner module visible.
Future audit fixes should land in the module that owns the rule, not in caller
choreography or prompt prose.

## Layered View

~~~mermaid
flowchart TB
  CLI["CLI router\nsrc/cli.js"]

  subgraph Domain["Evals execution domain"]
    RUN["Run command\nsrc/commands/run.js"]
    VALIDATE["Validation commands\nsrc/commands/validation.js"]
    CASE["Fixture contract\nsrc/lib/case-contract.js"]
    LATEST["Latest-run integrity\nsrc/lib/latest-run.js"]
    SCORING["Deterministic scoring\nsrc/lib/scoring.js"]
    REPORT["Report rendering\nsrc/lib/report.js"]
    SCHEMA["Schema validator\nsrc/lib/schema.js"]
    FAILURES["Failure artifacts\nsrc/lib/failures.js"]
    JSON["JSON IO\nsrc/lib/json.js"]
    HASH["Hashing\nsrc/lib/hash.js"]
    PATHS["Repo paths\nsrc/lib/paths.js"]
  end

  CLI --> RUN
  CLI --> VALIDATE
  RUN --> CASE
  RUN --> SCORING
  RUN --> REPORT
  RUN --> LATEST
  RUN --> FAILURES
  RUN --> JSON
  RUN --> HASH
  RUN --> PATHS
  VALIDATE --> LATEST
  VALIDATE --> FAILURES
  VALIDATE --> PATHS
  CASE --> SCHEMA
  CASE --> FAILURES
  CASE --> PATHS
  LATEST --> SCHEMA
  LATEST --> JSON
  LATEST --> HASH
  LATEST --> PATHS
  SCHEMA --> JSON
  SCHEMA --> PATHS
  FAILURES --> JSON
  FAILURES --> PATHS
~~~

## Module Ownership

| Module | Owns | Does Not Own |
| --- | --- | --- |
| src/cli.js | Argument parsing and command dispatch. | Runtime behavior, schema policy, artifact writing. |
| src/commands/run.js | The run workflow and artifact bundle assembly. | Schema mechanics, fixture policy, individual scorer logic. |
| src/commands/validation.js | User-facing validate/check commands and exit behavior. | Latest-run integrity rules themselves. |
| src/lib/case-contract.js | Fixture parse, schema validation, and phase-one fixture policy. | Command execution or artifact output. |
| src/lib/latest-run.js | latest.json path checks, artifact schema checks, manifest hash checks. | CLI printing or fixture validation. |
| src/lib/scoring.js | Deterministic scorer results and verdict calculation. | Fixture loading, command execution, artifact persistence. |
| src/lib/report.js | Markdown report text for the smoke run. | Result status or scorer decisions. |
| src/lib/schema.js | Local JSON Schema subset validation and schema target registry. | Business policy beyond schema shape. |
| src/lib/failures.js | Structured failure emission and post-start failure artifact writing. | Deciding whether a runtime rule passed. |
| src/lib/json.js | Repository JSON reads and writes. | Validation or path authorization. |
| src/lib/hash.js | Hash calculation. | Artifact trust decisions. |
| src/lib/paths.js | Repository root, relative paths, and repo-boundary checks. | Artifact existence or schema semantics. |

## Fix Placement Guide

| Audit Gap | First Module To Touch | Reason |
| --- | --- | --- |
| GAP-001 simulated runs | src/commands/run.js, then a future execution owner module | The run workflow currently creates the execution object. |
| GAP-002 validate/run mismatch | src/lib/case-contract.js and src/lib/latest-run.js | Fixture policy should be owned once and reused by run and validate. |
| GAP-003 baseline presence | src/commands/run.js, then a future baseline owner module | Baseline result is assembled during artifact bundle creation. |
| GAP-004 runtime card | New state command plus src/lib/paths.js and src/lib/latest-run.js | State needs repo, latest-run, and command guidance evidence. |
| GAP-005 validation wrapper | New verification command module | The wrapper should own command orchestration, not tests or docs. |
| GAP-006 latest schema | src/lib/latest-run.js and schemas/latest-run.schema.json | Latest-run integrity is now isolated. |

## Tracer Proof

The first tracer proof for this modularization is unchanged CLI behavior:

~~~bash
pnpm test
pnpm evals check --json
~~~

The first command proves the existing CLI behavior and documentation checks
survive the split. The second command proves the latest artifact bundle still
validates through the new module wiring.

## Observability Companion Map

Use .harness/refactors/2026-05-20-local-observability-feedback-loop.md with
this module map. The layered source map explains where implementation rules
live. The observability map explains how Codex should inspect run evidence,
correlate failures, implement a focused change, rerun the workload, and verify
the feedback loop without making external telemetry authoritative.
