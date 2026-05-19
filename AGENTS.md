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
pnpm evals check --json
rg -n "sk-|api[_-]?key|token|secret|password|BEGIN (RSA|OPENSSH|PRIVATE) KEY" fixtures .harness/evals
~~~

The check command validates the smoke fixture against
'schemas/eval-case.schema.json' and validates the latest result, manifest,
scorer results, baseline result, and manifest artifact hashes from
'.harness/evals/runs/latest.json'.

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
