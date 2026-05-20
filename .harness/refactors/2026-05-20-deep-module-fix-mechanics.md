# Deep Module Fix Mechanics

Date: 2026-05-20
Status: binding implementation contract for evidence-led fixes
Source audit: .harness/research/audits/2026-05-20-evidence-led-codebase-gap-audit.md

## Purpose

Use the evidence-led audit as the backlog, but implement each fix in deep
module format. A fix is not complete because a note exists, a test exists, or a
caller learns a new order of operations. A fix is complete when the owning
module hides the coordination rule behind a small public interface and the repo
has a fast proof that the interface works through real wiring.

This contract applies to changes that touch runner behavior, CLI contracts,
schemas, artifact bundles, baseline state, trace/session evidence, current
state packets, validation gates, recovery handling, governance rules, or audit
gap closeout.

## Deep Module Rule

For every audit gap selected for implementation, create or update a compact
fix packet before editing runtime code. The packet may live in the issue, PR
description, implementation note, or a short .harness/refactors file, but it
must answer these fields:

| Field | Required Answer |
| --- | --- |
| Source gap | Audit gap ID and the evidence pattern being addressed. |
| Owner module | The file or module that owns the rule after the fix. |
| Public interface | The CLI command, schema field, function, artifact, or validation command callers use. |
| Hidden implementation | The behavior callers should no longer need to choreograph manually. |
| Caller contract | Inputs, outputs, error shape, ordering guarantees, and compatibility expectations. |
| Seam test | The smallest test or validator that fails before the fix and passes after it. |
| Tracer proof | The smallest production-like command path through real wiring. |
| Rollback path | The simple revert or feature-flag path if the interface is wrong. |
| Phase-one check | Confirmation that the fix does not add a hard-blocked capability. |
| Validation gate | Exact command that proves the fix worked. |

## Implementation Sequence

1. Pick one audit gap, not a theme cluster.
2. Follow the live runtime path before editing: CLI entrypoint, helper
   functions, schema, fixture, artifact output, tests, and documented command.
3. Classify the candidate as safe, risky, or blocked:
   - safe: stable public interface plus seam test or tracer proof already
     exists or can be added narrowly.
   - risky: interface is plausible, but tests are weak or callers depend on
     hidden behavior.
   - blocked: owner module, public interface, caller contract, or validation
     command is unknown.
4. Compare the smallest patch with the deeper interface move.
5. Stop for a shared decision if the fix changes public CLI behavior, schema
   shape, artifact shape, validation strategy, durable terminology, or future
   agent workflow.
6. Implement the smallest deep module move that hides coordination from callers.
7. Add or update the seam test and tracer proof in the same patch.
8. Run the smallest relevant pnpm validation first, then broader checks only
   when the touched surface requires them.
9. Record validation as pass, fail, blocked, or not applicable with exact
   command text.

## Audit Gap Translation

Use this mapping when turning the 2026-05-20 audit into implementation work.

| Gap | Deep Module Target | First Interface Move | Required Proof |
| --- | --- | --- | --- |
| GAP-001 simulated runs | Runner execution module | Introduce an execution result owner that records real vs synthetic mode explicitly. | Fixture with failing command fails; smoke synthetic fixture still passes. |
| GAP-002 validate/run mismatch | Fixture validation module | Make one full fixture contract function serve both validate and run. | A policy-invalid fixture fails validate and run with matching errors. |
| GAP-003 baseline presence | Baseline observation module | Derive presence from baseline artifact existence and hash evidence. | Missing claimed baseline reports missing, not present. |
| GAP-004 runtime card | Current state module | Add a schema-backed state command before adding recovery automation. | pnpm evals state --json returns repo, latest, tracker, dirty-state, and command guidance. |
| GAP-005 validation wrapper | Verification module | Add one repo-native command that owns the AGENTS minimum lane. | Wrapper fails when any required command fails and reports ownership. |
| GAP-006 latest schema | Latest pointer module | Add schemas/latest-run.schema.json and route check/validate through it. | Malformed latest.json fails schema before artifact reads. |
| GAP-008 trace events | Trace module | Add append-only event schema after real execution has an owner. | Run emits ordered events for start, command result, scoring, manifest, and final status. |
| GAP-009 trace promotion | Promotion module | Add schema-only promotion packet first; no source-mining automation in phase one. | Promotion packet validates provenance, privacy approval, and allowed use. |

## Collector Prior-Art Boundary

Jamie has local collector projects available under ~/.agents:

- session-collector;
- otel-collector.

They can be used as reference implementations for local telemetry shape,
freshness checks, raw/processed artifact separation, provenance redaction,
session grouping, and verification-script style. They must stay prior art for
this repository unless a later ADR or spec opens an integration phase. Do not
add imports, subprocess calls, network assumptions, launchd assumptions, or
runtime requirements on those projects while implementing phase-one audit fixes.

## Do Not Build Yet

These stay out of scope until a later ADR or spec opens the phase:

- dashboards;
- external adapters;
- cloud runners;
- telemetry exporters as authority;
- plugin systems;
- source-mining automation;
- required LLM judge gates;
- runtime dependencies on coding-harness or agent-skills.

## Review Checklist

Before calling an audit fix done, confirm:

- the source audit gap is named;
- the owner module is named;
- the caller interface got simpler or stayed stable;
- hidden coordination moved into the owner module instead of into docs or tests;
- a seam test or validator fails for the old behavior;
- the tracer proof uses a real command path;
- artifacts or schemas changed only when they are the owning surface;
- validation output is recorded with exact commands;
- any blocked proof is labeled as blocked, not passed;
- no phase-one hard block was introduced.
