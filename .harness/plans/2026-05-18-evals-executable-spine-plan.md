---
schema_version: 1
title: Evals Executable Spine Plan
type: he-plan
status: linear_blocked_ready
date: 2026-05-18
source_spec: .harness/specs/2026-05-18-evals-executable-spine-spec.md
source_linear_plan: .harness/linear/2026-05-18-evals-executable-spine-linear-plan.md
linear_status: linear_blocked
linear_team: JSC
linear_parent_title: Build local eval runner and artifact contract
linear_label: Repo › evals
plan_ids: EP-001..EP-006
acceptance_ids: SA-001..SA-036
---

# Evals Executable Spine Plan

## Planning Decision

This plan is ready for implementation sequencing. Normal HE handoff,
PR/milestone closure, and tracker-complete claims remain blocked until Linear
tracking is recovered or Jamie records the tracker override allowed by the
spec.

Reason: the source spec is a tracked HE spec and Linear is the tracker of
record. The existing spec records that the Linear label was created, but issue
creation failed with an unsupported tool call. Local planning can proceed as
requirements evidence; implementation must not be presented as normally
tracker-complete until tracker recovery occurs. Local preparatory artifacts may
be created while blocked only if they preserve `linear_blocked` status and do
not claim normal delivery completion.

## Source Evidence

| Artifact | Role | Status |
| --- | --- | --- |
| .harness/specs/2026-05-18-evals-executable-spine-spec.md | canonical spec | present |
| .harness/linear/2026-05-18-evals-executable-spine-linear-plan.md | Linear routing source | present |
| .harness/linear/2026-05-18-evals-linear-mutation-attempt.md | mutation blocker evidence | present |
| .harness/refactors/stabilize-evals-executable-spine.md | refactor/migration rationale | present |
| .harness/core/2026-05-18-evals-core.md | compressed invariants | present |
| .harness/references/local-reuse-map.md | local prior-art reuse boundary | present |
| README.md | first-slice output | missing |
| AGENTS.md | first-slice output | missing |
| package.json | command surface | missing |
| schemas/*.schema.json | schema contracts | missing |
| fixtures/smoke/pr-closeout.case.json | smoke fixture | missing |

## Execution Contract

The first executable value is not framework breadth. It is one local command:

    pnpm evals run fixtures/smoke/pr-closeout.case.json --json

The command must run without network access, validate one synthetic smoke case,
write one local artifact bundle, compute deterministic scorer verdicts, record
baseline state, and produce closure evidence under `.harness/evals/`.

## Implementation Units

### EP-001 — Tracker Recovery Or Explicit Override

Objective: restore normal Linear traceability or record the exceptional override
before implementation is claimed as tracked work.

Scope:

- retry or manually create the Linear parent and children from the spec payload;
- or create the Jamie-approved tracker override artifact required by the spec;
- link the plan and spec from the tracker or override artifact.

Acceptance IDs: SA-028, SA-029.

Validation:

- Linear issue key/URL exists and is cited; or
- `.harness/linear/*override*.md` contains actor, timestamp, reason, blocked
  payload, failed tool, exact error, recovery condition, and scope limit.

Rollback:

- if Linear recovery creates the wrong issue shape, close or correct the issue
  before implementation continues;
- if override scope expands beyond documentation/schema/runner work, stop and
  require Jamie decision.

Linear mapping:

- parent: Build local eval runner and artifact contract;
- labels: Repo › evals, Eval, Reliability, Developer Experience;
- state: Todo until implementation starts.

### EP-002 — Documentation Authority Compression

Objective: create root operating docs so future agents do not need to read the
full `.harness` stack to find the executable-spine route.

Scope:

- create `README.md`;
- create `AGENTS.md`;
- document doctrine, load order, canonical command, phase-one hard blocks,
  tracker status, closure evidence, and `.harness/core` entrypoint;
- keep diagrams optional and non-authoritative.

Acceptance IDs: SA-001, SA-002, SA-003, SA-004, SA-035.

Validation commands:

- `test -f README.md`
- `test -f AGENTS.md`
- `rg -n "Executable Spine|artifact|dashboard|adapter|judge|telemetry|cloud|plugin" README.md AGENTS.md`

Rollback:

- revert only the root docs if they contradict ADR-001 through ADR-006;
- do not weaken hard blocks to make later work easier.

### EP-003A — Local Prior-Art Reuse Map

Objective: inspect existing local implementations in `coding-harness` and
`agent-skills` before schema finalization, without importing their domain
truth or runtime dependencies into `evals`.

Scope:

- create or update `.harness/references/local-reuse-map.md`;
- inspect local references named by the spec, including coding-harness run
  manifest, baseline pointer, metric registry, pilot-evaluation files,
  ubiquitous language, agent-skills eval harness, `evals.yaml`, and plugin-eval
  wrapper;
- classify each candidate as `reuse concept`, `downstream consumer`,
  `reference only`, or `reject as dependency`;
- record the language recommendation for the phase-one runner;
- preserve the rule that consuming repos own suite intent, fixtures,
  thresholds, privacy approval, and baseline promotion.

Acceptance IDs: SA-014A, SA-024, SA-030.

Validation commands:

- `test -f .harness/references/local-reuse-map.md`
- `rg -n "agent-run-manifest|consistency-baseline-pointer|plugin-eval|evals.yaml|runtime dependency|domain truth|TypeScript" .harness/references/local-reuse-map.md`

Rollback:

- if the reuse map recommends importing sibling repo internals into the
  phase-one smoke command, revise it before EP-003 starts;
- if the reuse map centralizes repo-local suite authority in `evals`, restore
  ADR-004 ownership boundaries.

### EP-003 — Canonical Schemas And Smoke Fixture

Objective: define the minimum local contracts before runner internals spread.

Scope:

- consume `.harness/references/local-reuse-map.md` as prior art only;
- add `schemas/eval-case.schema.json`;
- add `schemas/eval-result.schema.json`;
- add `schemas/artifact-manifest.schema.json`;
- add `schemas/scorer-result.schema.json`;
- add `schemas/baseline-result.schema.json`;
- add `fixtures/smoke/pr-closeout.case.json`;
- fixture must be synthetic and include provenance, privacy class, redaction
  status, owner, and promotion status.

Acceptance IDs: SA-007, SA-008, SA-009, SA-010, SA-011, SA-012, SA-013,
SA-014, SA-014A, SA-024, SA-030, SA-033.

Validation commands:

- `find schemas -maxdepth 1 -type f -name "*.schema.json" -print`
- `test -f fixtures/smoke/pr-closeout.case.json`
- `rg -n "sk-|api[_-]?key|token|secret|password|BEGIN (RSA|OPENSSH|PRIVATE) KEY" fixtures .harness/evals`

Minimum SA-033 evidence for this phase is:

- regex inspection reports no obvious secret markers;
- fixture provenance, privacy class, redaction status, owner, and promotion
  status are present;
- artifact manifest records redaction/privacy status for generated artifacts.

This is not full secret-scanner coverage. A dedicated scanner or privacy
inspection command is a future hardening gate before real/private fixtures are
promoted.

The smoke command is intentionally excluded from EP-003 validation because the
public command surface is introduced in EP-004. EP-003 may use a repo-owned
static schema validator if one exists by then; otherwise schema runtime
validation is proven in EP-004.

Rollback:

- if schema shape starts copying an external framework model, stop and revise
  against ADR-002;
- if the fixture contains real/private evidence without approval, remove it and
  replace it with synthetic content.

### EP-004 — Local Runner And Artifact Bundle Writer

Objective: implement the smallest local runner that produces replayable proof.

Scope:

- add `package.json` command surface;
- implement the canonical command path;
- validate the case contract;
- execute the synthetic smoke case locally;
- write `.harness/evals/runs/<run-id>/`;
- write `result.json`, `report.md`, command log, `manifest.json`, scorer
  results, baseline result, and `.harness/evals/runs/latest.json`;
- ensure human output and JSON output expose verdict and artifact paths.

Acceptance IDs: SA-005, SA-006, SA-015, SA-016, SA-017, SA-018, SA-019,
SA-025, SA-031, SA-032, SA-034.

Validation commands:

- `pnpm evals run fixtures/smoke/pr-closeout.case.json`
- `pnpm evals run fixtures/smoke/pr-closeout.case.json --json`
- `test -f .harness/evals/runs/latest.json`
- `RUN_POINTER=.harness/evals/runs/latest.json`
- `RESULT_PATH=$(jq -r '.result_path' "$RUN_POINTER")`
- `REPORT_PATH=$(jq -r '.report_path' "$RUN_POINTER")`
- `MANIFEST_PATH=$(jq -r '.manifest_path' "$RUN_POINTER")`
- `COMMAND_LOG_PATH=$(jq -r '.command_log_path' "$RUN_POINTER")`
- `test -f "$RESULT_PATH"`
- `test -f "$REPORT_PATH"`
- `test -f "$MANIFEST_PATH"`
- `test -f "$COMMAND_LOG_PATH"`

If `jq` is unavailable, the implementation must provide an equivalent
repo-owned latest-run resolver before EP-004 can close.

Rollback:

- if artifacts are incomplete, fail the run and keep the failure artifact;
- if the command needs network or hosted services, stop and remove that
  dependency before continuing.

### EP-005 — Deterministic Scorers And Baseline Comparator

Objective: make required pass/fail independent of LLM judge opinion.

Scope:

- implement deterministic scorer interface;
- implement exit-code scorer;
- implement artifact-completeness scorer;
- implement required-output or equivalent smoke scorer;
- implement baseline comparator with separate `presence_status`,
  `comparison_status`, and `promotion_status`;
- keep LLM judge output advisory only.

Acceptance IDs: SA-020, SA-021, SA-022, SA-023.

Validation commands:

- `pnpm evals run fixtures/smoke/pr-closeout.case.json --json`
- `rg -n "presence_status|comparison_status|promotion_status" .harness/evals/runs`
- `rg -n "judge|advisory|deterministic" .harness/evals/runs`

Rollback:

- if a judge can pass, fail, promote, or close the smoke run, remove that path;
- if baseline fields are collapsed into one ambiguous status, restore the split
  fields before closure.

### EP-006 — Closure Eval And Drift Proof

Objective: close the executable-spine milestone with replayable evidence, not
summary prose.

Scope:

- write `.harness/evals/evals-evals-executable-spine-eval.md`;
- cite command output, artifact paths, schema validation, scorer verdicts,
  baseline field values, drift status, rollback status, and tracker state;
- classify docs, schema, smoke, security, accessibility, traceability, and
  implementation checks as pass, fail, blocked, or not applicable.

Acceptance IDs: SA-026, SA-027, SA-036.

Validation commands:

- `test -f .harness/evals/evals-evals-executable-spine-eval.md`
- `rg -n "deterministic|baseline|artifact|rollback|drift|blocked|not applicable" .harness/evals/evals-evals-executable-spine-eval.md`
- `python3 Infrastructure/scripts/validation-and-linting/he_linear_traceability_lint.py .harness/specs/2026-05-18-evals-executable-spine-spec.md`

If the traceability lint script is unavailable, record that as `blocked`, not
`pass`.

Rollback:

- if closure evidence omits blocked categories, reopen EP-006;
- if closure relies on dashboard, telemetry, PR comments, or judge text instead
  of local artifacts, mark the milestone incomplete.

## Sequencing

1. EP-001 must be resolved or explicitly overridden before implementation can be
   represented as tracker-complete or closed.
2. EP-002 should run first because it reduces future-agent context load.
3. EP-003A must run before EP-003 so schemas can reuse local evidence patterns
   without copying sibling repo authority.
4. EP-003 must precede EP-004 so runner behavior targets local contracts.
5. EP-004 must precede EP-005 so scorers inspect real local artifacts.
6. EP-006 closes only after EP-002 through EP-005 have evidence.

Parallelism:

- EP-002 and EP-003A can run in parallel as local preparatory work while
  `linear_blocked` is explicit, but neither can be represented as
  tracker-complete until EP-001 is resolved or explicitly overridden.
- EP-003 may begin only after EP-003A exists and must not close until the reuse
  map has been applied as prior art without creating a sibling-repo runtime
  dependency.
- EP-004 depends on EP-003.
- EP-005 depends on EP-004 artifact shape.
- EP-006 depends on every prior unit.

## Traceability Matrix

| Plan ID | Spec Acceptance IDs | Linear Item | Primary Files |
| --- | --- | --- | --- |
| EP-001 | SA-028, SA-029 | Tracker / delivery evidence | .harness/linear/* |
| EP-002 | SA-001..SA-004, SA-035 | Compress documentation authority into README and AGENTS | README.md, AGENTS.md |
| EP-003A | SA-014A, SA-024, SA-030 | Local prior-art reuse map | .harness/references/local-reuse-map.md |
| EP-003 | SA-007, SA-008, SA-009, SA-010, SA-011, SA-012, SA-013, SA-014, SA-014A, SA-024, SA-030, SA-033 | Define canonical eval schemas and smoke fixture contract | schemas/, fixtures/smoke/ |
| EP-004 | SA-005, SA-006, SA-015..SA-019, SA-025, SA-031, SA-032, SA-034 | Implement local runner and artifact bundle writer | package.json, src/, .harness/evals/runs/ |
| EP-005 | SA-020..SA-023 | Add deterministic scorers and baseline comparator | src/, schemas/, .harness/evals/runs/ |
| EP-006 | SA-026, SA-027, SA-036 | Close executable spine with replayable closure eval and drift proof | .harness/evals/evals-evals-executable-spine-eval.md |

## Risk Register

| Risk | Severity | Response |
| --- | --- | --- |
| Linear remains unavailable | high | keep plan `linear_blocked_ready`; require issue recovery or Jamie override |
| First code copies external framework vocabulary | high | enforce ADR-002 and local schema review |
| Local prior art becomes hidden dependency | high | keep `coding-harness` and `agent-skills` as reference/consumer inputs only |
| Dashboard/telemetry work starts early | high | block via README/AGENTS and acceptance matrix |
| Fixture privacy is hand-waved | high | require synthetic fixture first and SA-033 before closure |
| Baseline bootstrap hides missing evidence | medium | preserve split baseline fields and explicit bootstrap decision |
| Validation command drifts from spec | medium | keep canonical command in README, AGENTS, spec, plan, and closure eval |

## Slack Policy

Status updates should be short and blocker-first:

- `linear_blocked`: issue creation unavailable; ready payload exists.
- `docs_ready`: README/AGENTS added and hard blocks visible.
- `reuse_map_ready`: local prior-art map exists and rejects sibling-repo
  runtime dependencies.
- `schemas_ready`: local schemas and synthetic fixture exist.
- `runner_ready`: smoke command writes full artifact bundle.
- `closure_ready`: eval artifact cites command, artifact, scorer, baseline,
  drift, rollback, and tracker evidence.

Do not announce completion from a passing command alone. Completion requires the
closure eval artifact and tracker recovery or approved override.

## Handoff Readiness

Ready for normal implementation handoff or closure only after one of:

- Linear parent and children are created and linked; or
- Jamie approves the tracker override artifact.

Until then, this plan is valid as local sequencing evidence. Local
documentation, schema, and runner preparation may proceed only with
`linear_blocked` status preserved and no claim of normal tracker completion.

blackboard_delta:

```yaml
status: updated
learning: "The evals executable spine is planned as six bounded units, but implementation remains tracker-blocked until Linear recovery or Jamie override."
target_surface: plan
owner: he-plan
follow_up: "Recover Linear parent issue or create Jamie-approved tracker override before implementation handoff."
```
