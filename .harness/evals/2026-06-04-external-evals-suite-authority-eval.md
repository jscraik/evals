# External Evals Suite Authority Closeout Evidence

Date: 2026-06-04

Source plan: .harness/plan/2026-06-04-external-evals-suite-authority-plan.md

Goal board: docs/goals/external-evals-suite-authority/goal.md

Status: local implementation validated; final review and PR/git triage still separate lanes.

## Scope Implemented

PU-001 through PU-004 implemented the first executable authority-boundary
increment:

- external project manifest schema and owner module;
- manifest path decision for .evals/project.json;
- authority classification schema and owner module;
- artifact-only external check/state output for --repo-root;
- privacy approval evidence shape and action partitioning;
- focused fixtures and tests for manifest, classifier, privacy, path-boundary,
  and external inspection behavior.

PU-005 added accepted vocabulary, architecture map entries, implementation note
hygiene, and this closeout evidence artifact.

## Validation Commands

- Command: pnpm test test/external-project-manifest.test.js test/authority-classifier.test.js test/cli.test.js -> pass, 132 focused and integration tests.
- Command: pnpm test -> pass, 186 tests.
- Command: pnpm evals run fixtures/smoke/pr-closeout.case.json --json -> pass, direct run_id 20260604T131419Z-pr-closeout-a0c7036a, verdict pass.
- Command: pnpm evals check --json -> pass.
- Command: pnpm evals check --smoke --json -> pass.
- Command: pnpm evals state --json -> pass, runtime state ready and missing-evidence scorer pass.
- Command: pnpm verify -> pass, including smoke check and credential-pattern scan.
- Command: python3 /Users/jamiecraik/dev/agent-skills/Skills/agent-ops/goal-governor/scripts/check_goal_board.py docs/goals/external-evals-suite-authority -> pass after PU-004 board receipt update.

## Artifact Evidence

The direct smoke run produced local ignored run artifacts under:

- .harness/evals/runs/20260604T131419Z-pr-closeout-a0c7036a/result.json
- .harness/evals/runs/20260604T131419Z-pr-closeout-a0c7036a/manifest.json
- .harness/evals/runs/20260604T131419Z-pr-closeout-a0c7036a/report.md
- .harness/evals/runs/20260604T131419Z-pr-closeout-a0c7036a/command-log.json
- .harness/evals/runs/20260604T131419Z-pr-closeout-a0c7036a/baseline-result.json
- .harness/evals/runs/20260604T131419Z-pr-closeout-a0c7036a/scorer-results.json
- .harness/evals/runs/20260604T131419Z-pr-closeout-a0c7036a/trace-events.jsonl

pnpm verify generated a later local ignored smoke run as part of the gate. The
tracked .harness/evals/runs/latest.json pointer was restored after validation
because .gitignore excludes .harness/evals/runs/20*/ directories; committing a
tracked latest pointer to ignored run artifacts would create pointer-only churn.
The validation evidence above records the fresh local commands instead.

## Deterministic Evidence

- Manifest schema registration is covered by test/external-project-manifest.test.js.
- Manifest positive and negative fixtures cover valid evidence, public
  not_required privacy evidence, missing privacy evidence, unknown fields,
  POSIX absolute paths, Windows absolute paths, POSIX traversal, and backslash
  traversal.
- Authority classifier tests cover missing manifests, artifact-only latest
  evidence, black-box blocked scope, missing runtime evidence, privacy blocked,
  privacy expired, and privacy pending action partitions.
- CLI tests cover external check/state --repo-root authority_classification
  output and validate the nested packet against the authorityClassification
  schema.

## Truth Lanes

- Local code/test truth: pass for the commands listed above.
- Generated artifact truth: fresh local smoke artifacts were produced and
  checked; generated run directories remain ignored by repo policy.
- Remote PR checks: not checked in this closeout slice.
- Review-thread state: not checked in this closeout slice.
- Tracker state: confirmation_required; no Linear mutation was requested or
  performed.
- Merge readiness: not claimed.

## Phase-One Hard Blocks

No dashboard, external adapter root, cloud runner, telemetry authority, plugin
system, source-mining automation, required LLM judge gate, or sibling runtime
dependency was added. External repo inspection remains artifact-only and
read-side.

## Residual Risks

- approved privacy evidence is schema-shaped, not policy-adjudicated. Target
  repositories still own actual privacy approval decisions.
- authority_classification is included as an additive object field in runtime
  state and validation result schemas; tests validate the nested classifier
  packet because the local schema engine does not use cross-schema refs here.
- Browser live preview was requested for implementation-notes.html, but the
  Browser skill requires a Node REPL browser-control tool that is not exposed in
  this session. The HTML file is maintained at
  .harness/implementation-notes/implementation-notes.html.

## Rollback

Rollback this increment as one bounded change set: remove the external project
manifest schema and owner, authority classification schema and owner, external
check/state output wiring, manifest fixtures, classifier and manifest tests,
PU-005 glossary/architecture entries, and this closeout evidence artifact.
