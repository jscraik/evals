# Support

This repository is a local executable-spine project. The first support path is
to reproduce the smoke eval and inspect the generated artifact bundle.

## Reproduce

~~~bash
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
pnpm evals check --json
~~~

The latest run pointer is:

~~~text
.harness/evals/runs/latest.json
~~~

Use that pointer to find the latest result, report, manifest, scorer results,
baseline result, and command log.

## Common Failure Classes

| Symptom | First Check |
| --- | --- |
| Fixture rejected | 'pnpm evals validate fixtures/smoke/pr-closeout.case.json --json' |
| Latest run rejected | 'pnpm evals validate .harness/evals/runs/latest.json --json' |
| Missing artifact | inspect '.harness/evals/runs/<run-id>/manifest.json' |
| Tracker confusion | read '.harness/linear/2026-05-18-evals-tracker-override-approved.md' |
| Scope drift | read 'AGENTS.md' and the phase-one hard blocks |

## Tracker State

The current Linear state is an approved local override, not a live Linear issue.
Issue creation failed with 'unsupported call: mcp__codex_apps__linear_save_issue'.
Preserve the recovery condition to create or link the Linear parent issue when
issue creation becomes available.

## What This Repo Does Not Support Yet

- dashboards or hosted run viewers;
- external adapters;
- cloud runners;
- telemetry as authority;
- plugin systems;
- source-mining automation;
- required LLM judge gates;
- runtime dependencies on sibling repos.
