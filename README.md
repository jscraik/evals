# Evals Executable Spine

This repository owns the shared local eval runner and artifact contract. The
first useful behavior is intentionally small: one offline command runs one
synthetic smoke fixture, writes one replayable artifact bundle, computes
deterministic scorer verdicts, records baseline state, and leaves closure
evidence under '.harness/evals/'.

Canonical command:

```bash
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
```

Canonical validation command:

```bash
pnpm evals check --json
```

Regression test command:

```bash
pnpm test
```

## Documentation

- 'AGENTS.md': agent operating rules and scoped discovery.
- 'CONTRIBUTING.md': contribution workflow, validation, artifact policy, and PR
  expectations.
- 'LICENSE.md': current license status.
- 'SECURITY.md': phase-one security and privacy handling.
- 'SUPPORT.md': reproduction and troubleshooting path.
- 'UBIQUITOUS_LANGUAGE.md': project terms and wording boundaries.

## Doctrine

- Artifacts decide.
- Telemetry explains.
- LLM judges advise until calibrated.
- Repo-local suites own domain truth.
- External frameworks are adapters, not roots.

The compressed context entrypoint is
'.harness/core/2026-05-18-evals-core.md'. Read that before deeper strategy,
review, or triage files.

## Discovery

Always read:

1. '.harness/core/2026-05-18-evals-core.md'
2. 'UBIQUITOUS_LANGUAGE.md'
3. The focused schema, fixture, runner, or artifact file being changed.

Load deeper planning surfaces only when the task touches their scope:

- '.harness/specs/2026-05-18-evals-executable-spine-spec.md' for acceptance
  IDs, scope changes, closure criteria, or implementation-status changes.
- '.harness/plans/2026-05-18-evals-executable-spine-plan.md' for phase
  sequencing, validation expansion, or delivery-state edits.
- '.harness/references/local-reuse-map.md' when borrowing concepts from
  'coding-harness' or 'agent-skills'.

## Phase-One Hard Blocks

Until a later ADR or spec explicitly opens the next phase, do not add:

- dashboard or hosted run viewer;
- external adapter or framework-native schema root;
- cloud runner or hosted service dependency;
- telemetry exporter as authority;
- plugin system;
- source-mining automation;
- required LLM judge gate;
- runtime dependency on 'coding-harness' or 'agent-skills'.

Sibling repos are prior-art references and future consumers. They do not own
this repo's phase-one runtime behavior.

## Tracker State

Linear issue creation remains unavailable because
`mcp__codex_apps__linear_save_issue` fails with 'unsupported call'. Jamie
approved the exceptional tracker override recorded in
'.harness/linear/2026-05-18-evals-tracker-override-approved.md'. This does not
create a Linear issue; it satisfies the spec's override path for the phase-one
local executable spine and preserves the recovery condition to create or link
the Linear parent issue when issue creation becomes available.

## Local Artifacts

A passing smoke run writes:

- '.harness/evals/runs/<run-id>/result.json'
- '.harness/evals/runs/<run-id>/report.md'
- '.harness/evals/runs/<run-id>/command-log.json'
- '.harness/evals/runs/<run-id>/manifest.json'
- '.harness/evals/runs/<run-id>/scorer-results.json'
- '.harness/evals/runs/<run-id>/baseline-result.json'
- '.harness/evals/runs/latest.json'

'latest.json' names the latest run ID, case ID, manifest path, result path,
report path, command log path, baseline result path, and scorer results path
so agents do not have to guess the newest artifact directory or detour through
result.json for first-order evidence.

Phase-one run artifacts are retained locally. Automatic retention duration is
not defined yet; keep committed artifact bundles only when they are part of
cited proof or closure evidence.

## Closure Evidence

Completion requires '.harness/evals/evals-evals-executable-spine-eval.md'
with command output, artifact paths, schema validation, scorer verdicts,
baseline field values, drift status, rollback status, tracker state, and a
pass/fail/blocked/not-applicable classification for docs, schema, smoke,
security, accessibility, traceability, and implementation checks.

Schema validation is proven by `pnpm evals check --json`, which validates the
smoke fixture, latest result, latest manifest, latest scorer results, latest
baseline result, and manifest artifact hashes.

Passing the command alone is not completion.

`pnpm test` covers the CLI success path, structured fixture failures, path
traversal rejection, invalid fixture policy/schema fields, manifest hash
mismatches, and malformed generated artifact JSON.
