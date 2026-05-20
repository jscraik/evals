# Local Observability Feedback Loop

Date: 2026-05-20
Status: phase-one observability architecture map
Source image: Codex observability stack reference
Reusable local prior art:
- ~/.agents/otel-collector
- ~/.agents/session-collector

## Purpose

The reference pattern is an app emitting logs, metrics, and traces into an
observability stack that Codex can query, correlate, reason over, patch, rerun,
and verify. For this repository, the phase-one version must stay local and
artifact-first:

- artifacts decide;
- telemetry explains;
- external observability services are future adapters;
- no dashboard, cloud runner, telemetry exporter, or hosted trace backend is
  allowed to become authority in phase one.

This file maps the observability idea into the current executable spine without
violating those constraints.

The local collectors in ~/.agents are approved prior-art sources for this
design. They can inform schema shape, freshness checks, privacy-safe provenance,
low-cardinality stats, raw/processed storage separation, and validation scripts.
They must not become runtime dependencies of this repo during phase one.

## Local Stack View

~~~mermaid
flowchart TB
  APP["Evals CLI\nsrc/cli.js + src/commands/*"]

  subgraph LOCAL["Local observability stack"]
    LOGS["Command log\ncommand-log.json"]
    SCORE["Scorer evidence\nscorer-results.json"]
    BASELINE["Baseline evidence\nbaseline-result.json"]
    MANIFEST["Artifact manifest\nmanifest.json"]
    REPORT["Human report\nreport.md"]
    LATEST["Current pointer\nlatest.json"]
    TRACE["Future trace events\ntrace-events.jsonl"]
  end

  CODEX["Codex"]
  CODEBASE["Codebase"]
  TEST["Tracer proof\npnpm test + pnpm evals check --json"]

  APP --> LOGS
  APP --> SCORE
  APP --> BASELINE
  APP --> MANIFEST
  APP --> REPORT
  APP --> LATEST
  APP -. future .-> TRACE

  LATEST --> CODEX
  MANIFEST --> CODEX
  LOGS --> CODEX
  SCORE --> CODEX
  BASELINE --> CODEX
  REPORT --> CODEX
  TRACE -. future .-> CODEX

  CODEX -->|"query, correlate, reason"| CODEBASE
  CODEBASE -->|"implement focused change"| APP
  APP -->|"rerun workload"| TEST
  TEST -->|"new local evidence"| CODEX
~~~

## Local Equivalent Of The Reference Stack

| Reference Concept | Phase-One Local Equivalent | Owner |
| --- | --- | --- |
| App | Evals CLI run/check/validate commands. | src/cli.js and src/commands/*.js |
| Logs | command-log.json plus structured failure JSON. | src/commands/run.js and src/lib/failures.js |
| Metrics | Deterministic scorer statuses and pass/fail counts. | src/lib/scoring.js |
| Traces | Future append-only trace-events.jsonl, not yet implemented. | Future trace module |
| Vector fan-out | Local artifact bundle creation and latest.json pointer. | src/commands/run.js and src/lib/latest-run.js |
| Query APIs | pnpm evals check --json and future state/query commands. | src/commands/validation.js |
| Codex feedback loop | Inspect evidence, patch owner module, rerun workload, validate artifacts. | AGENTS.md and deep module mechanics |

## Local Collector Prior Art

| Source | Reusable Pattern | How evals Should Adapt It | Boundary |
| --- | --- | --- | --- |
| ~/.agents/otel-collector | Local OTLP/HTTP endpoints for logs, traces, metrics; raw NDJSON storage; processed stats; health/freshness endpoints. | Reuse the raw/processed split, freshness fields, low-cardinality counters, service/signal grouping, and verify script pattern for local eval artifacts. | Do not expose evals to network ingest or depend on the collector process. |
| ~/.agents/session-collector | Privacy-safe session summaries, hashed provenance, sensitive-provenance split, downstream evidence bundles. | Reuse provenance redaction, local-only sensitive evidence separation, session/run grouping, and summary artifact structure for future trace-to-fixture promotion. | Do not publish sensitive local IDs or paths; do not make session collection required for smoke evals. |

Concrete adaptation candidates:

- \`.harness/refactors/2026-05-20-collector-observability-extraction.eval.json\`
  defines the exact information evals wants to extract from collector-style
  sources before any code reads them.
- \`schemas/trace-event.schema.json\` can borrow the collector idea of raw events
  plus processed stats, but stay local to \`.harness/evals/runs/<run_id>/\`.
- A future \`pnpm evals state --json\` can borrow \`/stats\` freshness fields:
  \`last_run_at\`, \`latest_run_id\`, \`last_artifact_validation_at\`,
  \`artifact_validation_status\`, and per-surface status.
- A future \`pnpm evals verify --json\` can borrow the collector verification
  script style: classify each source as \`pass\`, \`fail\`, \`blocked\`, or
  \`not_applicable\`, with exact evidence paths.
- Trace-to-fixture promotion can borrow the session collector's split between
  public privacy-safe provenance and local-only sensitive provenance.

## Operating Rules

1. Do not add external observability infrastructure until a later ADR or spec
   opens that phase.
2. Treat command-log, scorer-results, baseline-result, manifest, report, and
   latest.json as the current local observability surfaces.
3. Add query commands before adding exporters. Codex needs stable local JSON
   first.
4. When trace events are added, write JSONL locally and validate it with a
   schema before considering OTLP, Vector, Victoria, OpenTelemetry, or remote
   backends.
5. Do not let metrics, traces, summaries, or dashboards replace artifact
   validation or deterministic scorer verdicts.
6. Every observability improvement needs a tracer proof: rerun the workload,
   inspect the generated evidence, and validate the latest bundle.

## Fix Placement Guide

| Need | First Module To Touch | Notes |
| --- | --- | --- |
| Add local trace events | New src/lib/trace-events.js plus schemas/trace-event.schema.json | Must be JSONL-local and schema-backed first. |
| Add current-state query | New src/commands/state.js plus state schema | Should summarize latest, dirty state, tracker state, and recommended command. |
| Add verifier wrapper | New src/commands/verify.js | Should orchestrate the AGENTS minimum lane and report structured outcomes. |
| Improve failure correlation | src/lib/failures.js and src/lib/latest-run.js | Link failure_class, artifact paths, and recovery guidance. |
| Add scorer metrics | src/lib/scoring.js | Keep metrics derived from deterministic scorer results. |
| Add external adapters | Future adapter layer only after ADR/spec approval | Must not become runtime authority. |
| Adapt collector freshness stats | Future state/query module | Reuse fields and semantics, not collector runtime. |
| Adapt session provenance split | Future promotion/trace module | Keep sensitive provenance local-only. |

## Immediate Implementation Candidates

1. Add a local trace-event schema and write events for run_started,
   command_recorded, scoring_completed, manifest_written, latest_updated, and
   run_finished.
2. Add pnpm evals state --json to query latest artifact status, tracker state,
   and recommended next command.
3. Add pnpm evals verify --json as the local equivalent of querying and
   correlating the stack before claiming readiness.
4. Add privacy-safe provenance fields for any promoted trace/session evidence,
   using the session collector's public-vs-sensitive split as the model.
5. Keep the extraction eval JSON current as the source of truth for collector
   adaptation fields.

These should be implemented in that order only after the current modular split
is accepted, because each one needs a clear owner module and a narrow tracer
proof.

## Non-Goals

- No direct imports from ~/.agents/otel-collector or ~/.agents/session-collector.
- No requirement that either collector is running for \`pnpm evals run\`,
  \`pnpm evals validate\`, or \`pnpm evals check\`.
- No external OTLP, Vector, Victoria, Prometheus, LogQL, TraceQL, or dashboard
  backend as release authority.
- No raw local transcript, rollout, trace, tool-call, or filesystem provenance
  in public artifacts unless it has been explicitly redacted or hashed.

## Validation

The phase-one observability tracer proof is:

~~~bash
pnpm test
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
pnpm evals check --json
~~~

For docs-only changes to this map, use:

~~~bash
pnpm test
pnpm evals check --json
~~~
