---
schema_version: 2
---

# Evals Agent Instructions

These instructions apply to all work in this repository.

## Mission

Build the executable spine first. The repository owns shared runner mechanics,
canonical schemas, artifact bundles, deterministic scorer contracts, baseline
result shape, and closure evidence. Consuming repositories own suite intent,
real fixtures, rubrics, thresholds, privacy approval, and baseline promotion.

## Discovery

Always read:

1. '.harness/core/2026-05-18-evals-core.md'
2. 'UBIQUITOUS_LANGUAGE.md'
3. The specific schema, fixture, runner, or artifact file being changed.

Load the deeper planning surfaces only when the task touches their scope:

- '.harness/specs/2026-05-18-evals-executable-spine-spec.md' for acceptance
  IDs, scope changes, closure criteria, or implementation-status changes.
- '.harness/plans/2026-05-18-evals-executable-spine-plan.md' for phase
  sequencing, validation expansion, or delivery-state edits.
- '.harness/references/local-reuse-map.md' when borrowing concepts from
  'coding-harness' or 'agent-skills'.
- '.harness/refactors/2026-05-20-deep-module-fix-mechanics.md' before
  implementing fixes from evidence-led audits or changing runner, schema,
  validation, artifact, baseline, trace, state, or governance mechanics.
- '.harness/refactors/2026-05-20-parent-child-loop-guardrail.md' before
  continuing an evidence-led implementation program after a PR heartbeat,
  CodeRabbit sweep, GitHub review sweep, or single Linear issue closeout.

## Canonical Command

~~~bash
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
~~~

This command is the acceptance command for the phase-one executable spine unless
a later ADR or spec supersedes it.

## Phase-One Hard Blocks

Until a later ADR or spec explicitly opens the next phase, do not add:

- dashboards;
- external adapters;
- cloud runners;
- telemetry exporters as authority;
- plugin systems;
- source-mining automation;
- required LLM judge gates;
- runtime dependencies on 'coding-harness' or 'agent-skills'.

Local prior-art reuse from sibling repos is allowed only as documented evidence
and schema inspiration. It must not become hidden lifecycle authority or a
runtime dependency.

## Deep Module Fix Mechanics

When implementing audit findings, preserve deep module format:

- define the owner module, public interface, hidden implementation rule,
  caller contract, seam test, tracer proof, rollback path, and validation gate
  before editing runtime code;
- prefer one deep owner module over spreading choreography across callers,
  docs, tests, generated artifacts, or agent prompts;
- do not count a docs-only update as a fix for runtime, validation,
  governance, traceability, or safety gaps unless the gap is explicitly
  documentation-only;
- compare the smallest patch with the deeper interface move before changing
  public CLI, schema, artifact, or validation contracts;
- stop for a shared decision when a fix changes public interfaces, durable
  terminology, validation strategy, or future agent workflow.

Use the deep module fix mechanics file as the required checklist for these
changes. Keep phase-one hard blocks intact unless a later ADR or spec explicitly
opens the next phase.

## Parent/Child Loop Guardrail

Evidence-led implementation work has two loop levels:

- the parent loop owns the audit phase queue, Linear issue queue, validation,
  review, PR, closeout, and next issue selection;
- the child loop owns one PR, one review sweep, one CodeRabbit thread cluster,
  one Linear child issue, or one heartbeat resume slice.

A child loop cannot close the parent loop. After any child closeout, reconcile
the parent queue before claiming the program is done: active phase, owning
Linear parent or queue, closed child unit, validation evidence, next issue or
queue-complete proof, and heartbeat state.

## Tracker Rule

Current tracker state is 'override_approved'. The Linear parent issue is not
created because 'mcp__codex_apps__linear_save_issue' fails with
'unsupported call', but Jamie approved the exceptional override recorded at
'.harness/linear/2026-05-18-evals-tracker-override-approved.md'. Do not
represent the override as a live Linear issue; preserve the recovery condition
to create or link the parent issue when issue creation becomes available.

## Validation

Use the plan's validation commands for each phase. At minimum:

~~~bash
test -f README.md
test -f AGENTS.md
find schemas -maxdepth 1 -type f -name "*.schema.json" -print
test -f fixtures/smoke/pr-closeout.case.json
pnpm test
pnpm evals run fixtures/smoke/pr-closeout.case.json
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
pnpm evals state --json
pnpm evals check --json
pnpm verify
~~~

`pnpm verify` is the CI gate command (see `.harness/ci-required-checks.json`). It
runs all deterministic checks including file-existence guards, the smoke run,
latest-artifact validation, and credential scanning with a Node fallback when
`rg` is unavailable. Run it locally before pushing to confirm the same gate CI
enforces.

For a lightweight direct credential scan when `rg` is available:

~~~bash
rg -n "sk-|api[_-]?key|token|secret|password|BEGIN (RSA|OPENSSH|PRIVATE) KEY" fixtures .harness/evals
~~~

The check command validates the smoke fixture against
'schemas/eval-case.schema.json' and validates the latest result, manifest,
scorer results, baseline result, trace event timeline, and manifest artifact
hashes from '.harness/evals/runs/latest.json'.

The regex check is a lightweight phase-one privacy aid, not full secret-scan
coverage.

## Closure Evidence

Do not claim completion unless
'.harness/evals/evals-evals-executable-spine-eval.md' exists and cites:

- command output;
- artifact paths;
- schema validation;
- deterministic scorer verdicts;
- baseline 'presence_status', 'comparison_status', and 'promotion_status';
- drift status;
- rollback status;
- tracker state;
- docs, schema, smoke, security, accessibility, traceability, and
  implementation check classifications.

If this directory is not a git repository, classify git add, commit, push, PR,
and Linear-delivery references as blocked. Do not fake delivery evidence.
