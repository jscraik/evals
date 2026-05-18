---
schema_version: 1
title: Evals Executable Spine Spec
type: he-spec
status: draft
date: 2026-05-18
origin: .harness/linear/2026-05-18-evals-executable-spine-linear-plan.md
plan: .harness/plans/2026-05-18-evals-executable-spine-plan.md
risk: high
depth: deepened
ui: false
traceability_required: true
linear_status: linear_blocked
linear_team: JSC
linear_project: missing_or_unverified
linear_parent_title: Build local eval runner and artifact contract
linear_label: Repo › evals
linear_blocker: mcp__codex_apps__linear_save_issue rejected issue creation with unsupported call
subagent_policy: conditional
roles_used: he-spec-inline
roles_recommended: planning-specialist-agent, spec-flow-analyzer, adversarial-document-reviewer
roles_missing: none_checked_after_draft
---

# Evals Executable Spine Spec

## Mode Decision

Mode: tracked HE spec with blocked Linear issue creation.

Reason: the source artifact is a Linear-ready plan for non-trivial tracked
delivery. Linear is the tracker of record, but the connector could create the
repo label and could not create issues in this session.

Current tracker state:

- JSC team lookup succeeded.
- Existing issue search for `Evals Executable Spine` and
  `Build local eval runner and artifact contract` returned no results.
- Label `Repo › evals` was created with ID
  `103e1d5a-920c-4290-b2e5-dd5bcddad351`.
- Parent issue and child issues are not created.
- Mutation blocker is recorded in
  `.harness/linear/2026-05-18-evals-linear-mutation-attempt.md`.

This spec is allowed to exist as local requirements evidence, but the work
should not be treated as normally tracker-ready until the parent issue exists.
If Linear issue creation remains blocked, only Jamie may approve a tracker
override, and that override must be recorded in this spec or a sibling
`.harness/linear/*override*.md` artifact with actor, timestamp, reason,
blocked payload, attempted Linear command, exact error, and the recovery
condition for returning to normal Linear tracking.

## Problem

The evals repo has strong strategy and architectural cognition, but no
executable eval spine. The current repo can explain what should happen, but it
cannot run one fixture, produce one canonical result, write one replayable
artifact bundle, compare one baseline, or close one eval with deterministic
evidence.

That makes every later idea fragile:

- external frameworks can pull the repo into their data models;
- dashboards can hide the absence of proof;
- telemetry can become mistaken for authority;
- LLM judges can become uncalibrated gates;
- future agents must scan thousands of lines of `.harness` docs to find the
  next action.

The first release-quality behavior is not a platform. It is one local command
that takes one smoke fixture and writes one trustworthy artifact bundle.

## Goals

- Define the smallest behavior contract for the executable spine.
- Make the phase-one command, schemas, artifacts, scorers, baseline comparison,
  and closure proof testable.
- Preserve ADR decisions: executable spine first, local schemas authoritative,
  artifacts decide, repo-local suites own truth, judges advisory, fixtures
  provenance-backed.
- Reduce future-agent ambiguity by adding root operating documentation.
- Prevent phase-one drift into adapters, dashboards, telemetry exporters, cloud
  execution, plugin architecture, source-mining automation, or judge gates.

## Requirements Summary

The executable spine must provide a local, replayable, deterministic eval loop:

1. A future agent can discover the operating path from root docs.
2. A local command can run one synthetic smoke fixture without network access.
3. Local schemas define the canonical case, result, artifact, scorer, and
   baseline contracts.
4. The run writes machine-readable and human-readable local artifacts.
5. Deterministic scorers decide the required verdict.
6. Baseline state is explicit and does not hide missing or changed evidence.
7. Closure evidence is recorded in a `.harness/evals` artifact.
8. Phase-one work does not expand into adapters, dashboards, telemetry,
   source-mining automation, plugin systems, cloud execution, or judge gates.

## Non-Goals

- Do not implement external framework adapters.
- Do not make Braintrust, OpenAI Evals, DeepEval, FastEval, AutoEvals, or
  OpenEvals the base architecture.
- Do not download or mine external eval repos as phase-one implementation work.
- Do not treat local prior-art inspection in sibling Jamie repos as permission
  to import their lifecycle authority, plugin systems, or domain truth into the
  shared evals repo.
- Do not create a dashboard, UI, hosted run viewer, or cloud runner.
- Do not require LLM judge output for pass/fail.
- Do not centralize `coding-harness` or `agent-skills` domain truth inside
  the shared evals repo.
- Do not create a plugin architecture before repeated adapter duplication
  exists.
- Do not make a broad dataset registry before fixture provenance and one smoke
  lane exist.

## Linear Work Item Contract

linear_status: linear_blocked

ready_to_create_payload:

```yaml
team: JSC
title: Build local eval runner and artifact contract
priority: 2
state: Todo
labels:
  - Repo › evals
  - Eval
  - Reliability
  - Developer Experience
  - Roadmap: Now
description_sections:
  - Problem / actual behavior
  - Expected behavior or decision needed
  - Acceptance criteria
  - Source artifacts and HE stage links
children:
  - Compress documentation authority into README and AGENTS
  - Define canonical eval schemas and smoke fixture contract
  - Implement local runner and artifact bundle writer
  - Add deterministic scorers, baseline comparator, and closure eval
blocked_by: []
source_artifacts:
  - .harness/linear/2026-05-18-evals-executable-spine-linear-plan.md
  - .harness/specs/2026-05-18-evals-executable-spine-spec.md
```

Payload note: these labels reflect the live Linear label checks performed on
2026-05-18 after the Linear plan was generated. `Repo › evals` was created
successfully; the parent and child issues were not created because issue
mutation failed with `unsupported call`.

The Linear issue must include a link or reference to this spec before
implementation starts.

### Tracker Override Contract

A tracker override is exceptional. It may be used only when Linear issue
creation remains unavailable after a retry, and only Jamie may authorize it.

Required override artifact:

```yaml
linear_status: override_approved
approved_by: Jamie
approved_at: "<ISO-8601 timestamp>"
reason: "<why local execution may proceed without live Linear issue>"
blocked_payload: "<ready-to-create payload or path>"
failed_tool: mcp__codex_apps__linear_save_issue
exact_error: unsupported call: mcp__codex_apps__linear_save_issue
recovery_condition: "create/link Linear parent issue before PR closure or milestone closure"
scope_limit: "documentation/schema/runner work only; no expansion work"
```

Without this artifact, `linear_status: linear_blocked` remains active and
implementation may prepare local artifacts but must not be presented as normally
tracker-complete.

## Ownership And Decision Authority

Shared evals repo owns:

- local runner mechanics;
- canonical schema shape;
- artifact bundle contract;
- deterministic scorer interface;
- baseline result contract;
- closure eval artifact expectations.

Consuming repos own:

- suite intent;
- real fixtures;
- domain rubrics;
- acceptance thresholds;
- baseline promotion decisions;
- privacy approval for real evidence.

Jamie owns decisions that change:

- tracker override status;
- phase-one scope;
- canonical command name;
- baseline bootstrap policy for promoted suites;
- fixture privacy policy;
- any move from advisory judges to required gates.

## Boundary

### In Bounds

- Root `README.md` and `AGENTS.md` operating surface.
- Package/runtime skeleton needed for the first local command.
- Canonical local schemas.
- One synthetic smoke fixture.
- Local runner command.
- Artifact bundle writer.
- Deterministic scorer interface and first deterministic scorers.
- Baseline comparator.
- Closure eval artifact.
- Validation commands and artifact checks.
- Local prior-art reuse map for existing `coding-harness` and `agent-skills`
  artifacts that may inform phase-one schemas without becoming dependencies.

### Out Of Bounds

- External adapters.
- Framework-native schemas.
- Hosted-only telemetry.
- Dashboards.
- Cloud-only runners.
- Plugin systems.
- Required LLM judges.
- Broad source mining.
- Real/private fixtures without provenance and privacy review.
- Runtime dependency on `coding-harness` or `agent-skills` internals for the
  phase-one smoke command.

### Protected Decisions

- ADR-001: executable spine before expansion.
- ADR-002: canonical schemas and adapter boundary.
- ADR-003: local artifacts authoritative; telemetry explanatory.
- ADR-004: repo-local suites own domain truth.
- ADR-005: LLM judges advisory until calibrated.
- ADR-006: fixture provenance, privacy, and holdout policy.

## Baseline

Current repo baseline:

- `.harness/**` documents exist.
- `.harness/linear/2026-05-18-evals-executable-spine-linear-plan.md`
  exists.
- `.harness/linear/2026-05-18-evals-linear-mutation-attempt.md`
  exists.
- Root `README.md` is absent.
- Root `AGENTS.md` is absent.
- `package.json` is absent.
- No schema files exist.
- No fixtures exist.
- No runner exists.
- No artifact writer exists.
- No scorer implementation exists.
- No baseline comparator exists.
- No eval closure artifact exists.

Baseline risk: the repo has direction but no feedback loop.

## Local Prior-Art Reuse

Local prior art may be inspected before schema finalization, but only to reduce
reinvention and preserve compatibility with existing Jamie repo workflows. This
is not external source mining, and it does not move ownership of consuming-repo
domain truth into the shared evals repo.

Required reuse-map artifact:

- `.harness/references/local-reuse-map.md`

Minimum references to inspect:

- `/Users/jamiecraik/dev/coding-harness/contracts/agent-run-manifest.schema.json`
- `/Users/jamiecraik/dev/coding-harness/contracts/consistency-baseline-pointer.json`
- `/Users/jamiecraik/dev/coding-harness/contracts/agent-metric-registry.json`
- `/Users/jamiecraik/dev/coding-harness/src/lib/pilot-evaluation/`
- `/Users/jamiecraik/dev/coding-harness/UBIQUITOUS_LANGUAGE.md`
- `/Users/jamiecraik/dev/agent-skills/Infrastructure/EVALUATION/eval-harness.md`
- `/Users/jamiecraik/dev/agent-skills/Infrastructure/references/evals.yaml`
- `/Users/jamiecraik/dev/agent-skills/bin/plugin-eval`

Allowed reuse:

- artifact reference shape, including path plus checksum;
- run-record vocabulary and evidence completeness expectations;
- baseline pointer semantics;
- metric registry concepts for later non-phase-one hardening;
- lightweight case examples for synthetic smoke fixtures;
- plugin/skill eval wrapper behavior as downstream-suite precedent.

Forbidden reuse:

- copying `coding-harness` agent-run manifest as the eval result schema
  unchanged;
- making `agent-skills` plugin-eval outputs the canonical shared result
  contract;
- introducing runtime imports from either sibling repo in the phase-one smoke
  command;
- centralizing repo-specific suite thresholds, rubrics, or promotion authority
  inside `evals`;
- expanding into broad source mining, adapter design, dashboards, telemetry, or
  judge gates before local artifact proof exists.

## Domain Model

The initial domain model is intentionally small.

### Eval Case

An eval case is a file that describes one replayable evaluation input.

Required properties:

- stable case ID;
- owning repo or synthetic owner;
- suite ID;
- fixture source type;
- privacy class;
- redaction status;
- promotion status;
- input payload;
- expected deterministic evidence;
- scorer selection;
- baseline reference if applicable.

### Eval Run

An eval run is one execution of one or more eval cases through the local runner.

Required properties:

- run ID;
- timestamp;
- command;
- tool/runtime versions available locally;
- fixture paths;
- result path;
- artifact manifest path;
- exit status;
- deterministic verdict.

### Eval Result

An eval result is the canonical machine-readable outcome of a run.

Required properties:

- run ID;
- case ID;
- suite ID;
- status;
- deterministic verdict;
- scorer results;
- artifact references;
- baseline result reference;
- errors, if any.

### Artifact Bundle

An artifact bundle is the local proof package for a run.

Minimum contents:

- `result.json`;
- `report.md`;
- command log;
- `manifest.json`;
- scorer result JSON;
- baseline result JSON or explicit baseline-missing result.

### Scorer Result

A scorer result is one deterministic check outcome.

Required properties:

- scorer ID;
- scorer version;
- inputs inspected;
- pass/fail status;
- evidence path or evidence value;
- failure reason when failed.

### Baseline Result

A baseline result compares current output to a prior accepted state or records
that no baseline exists yet.

Required properties:

- `presence_status`: `missing` or `present`;
- `comparison_status`: `not_compared`, `matched`, `changed`, or
  `error`;
- `promotion_status`: `not_requested`, `promoted`, or `blocked`;
- baseline owner when promotion occurs;
- comparison evidence;
- current artifact reference.

Report-level summaries may say `missing`, `matched`, `changed`, or
`delta`, but the machine-readable baseline result must keep presence,
comparison, and promotion separate.

## Lifecycle

1. A user or agent selects an eval case.
2. The local runner validates the case against the local schema.
3. The runner executes the case without network or hosted service dependency.
4. The runner writes raw execution evidence.
5. Deterministic scorers inspect the run evidence.
6. The baseline comparator compares or records baseline absence.
7. The artifact writer writes the complete bundle.
8. The CLI returns JSON when `--json` is passed.
9. Closure requires an eval artifact citing command output, artifact paths,
   validation status, drift status, and rollback status.

## Interfaces

### CLI

Canonical command:

```bash
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
```

This is the required public command unless a later ADR or spec supersedes it.
An implementation may add helper commands, but helpers do not replace this
command for acceptance or closure.

Required CLI behavior:

- exits non-zero on validation or scoring failure;
- writes structured failure artifacts when execution fails after run start;
- prints machine-readable JSON when `--json` is present;
- prints a concise human-readable summary otherwise;
- never requires network access for the smoke case;
- never treats telemetry, dashboard, judge output, or PR comment as proof.

### Schema Files

Expected initial files, names may vary only if documented:

- `schemas/eval-case.schema.json`
- `schemas/eval-result.schema.json`
- `schemas/artifact-manifest.schema.json`
- `schemas/scorer-result.schema.json`
- `schemas/baseline-result.schema.json`

### Fixture

Expected first fixture:

- `fixtures/smoke/pr-closeout.case.json`

The smoke fixture should be synthetic unless Jamie explicitly approves use of
real session, PR, or Linear-derived evidence.

### Artifact Output

Expected artifact root:

- `.harness/evals/runs/<run-id>/`

Required run ID shape:

- `<utc-basic-timestamp>-<case-id>-<short-input-hash>`

Example:

- `20260518T143000Z-pr-closeout-3f2a91c8`

The runner must also write or update a local pointer:

- `.harness/evals/runs/latest.json`

`latest.json` must include the run ID, case ID, manifest path, result path,
report path, and command log path for the most recent run. Automation consumers
must not have to guess the latest artifact directory.

## Invariants

- Local artifacts are authoritative.
- Telemetry is explanatory.
- Required pass/fail is deterministic.
- LLM judge output is advisory until calibrated.
- External frameworks are adapter leaves, not roots.
- Canonical schemas are local.
- Repo-local suites own domain truth.
- Fixture trust requires provenance and privacy metadata.
- Missing artifacts are failures.
- Closure requires an eval artifact.

## Failure And Recovery

### Case Validation Failure

Behavior:

- return non-zero;
- print structured error in JSON mode;
- do not create a passing result;
- if an artifact bundle is created, mark it failed.

Recovery:

- fix the fixture or schema;
- rerun the same command;
- preserve failed artifact if useful for debugging.

### Runner Failure

Behavior:

- return non-zero;
- write failure artifact when execution started;
- include command, stderr/stdout capture, and failure class.

Recovery:

- fix runner defect;
- rerun smoke fixture;
- compare failure artifact to new passing artifact.

### Scorer Failure

Behavior:

- required verdict fails;
- report names scorer ID and evidence inspected;
- closure blocked.

Recovery:

- correct output or scorer contract;
- do not suppress failure with judge opinion.

### Baseline Missing

Behavior:

- record baseline status `missing`;
- do not fake a match;
- allow first smoke run to pass only if the acceptance criteria explicitly allow
  baseline bootstrap.

Recovery:

- create baseline through documented promotion flow later.

### Artifact Incomplete

Behavior:

- run fails;
- missing path names are reported;
- Linear closure is blocked.

Recovery:

- fix artifact writer;
- rerun command;
- cite complete bundle.

## Observability

Phase one observability is local artifact visibility, not hosted telemetry.

Required local observability:

- command log;
- result JSON;
- scorer result JSON;
- baseline result JSON;
- manifest with artifact paths and generation metadata;
- Markdown report for human inspection.

Optional later observability:

- Braintrust export;
- OTEL trace;
- dashboard;
- run index.

Optional observability must point back to local artifact paths and cannot become
closure authority.

## Non-Functional Requirements

### Reliability

- The smoke run must be repeatable on a clean local checkout after dependencies
  are installed.
- Failure after runner start must still produce structured failure evidence.
- Missing artifact paths fail the run.
- The latest-run pointer must remove the need for agents to guess artifact
  locations.

### Maintainability

- Core runner code must not import future adapter dependencies.
- Canonical schemas must be small enough for future agents to inspect quickly.
- Any helper command must preserve the canonical public command.
- Optional future integrations must remain removable without changing core
  result interpretation.

### Performance

- The smoke run should stay small enough for routine local validation.
- No performance target is asserted until the implementation exists.
- If the smoke run becomes slow enough to discourage local use, that is an
  implementation-readiness defect and must be recorded in the closure eval.

## Accessibility Requirements

This is a CLI and artifact workflow, not a visual UI. Accessibility still
applies to terminal output, Markdown reports, and future-agent readability.

- Human-readable CLI output must not rely on color alone.
- JSON output must carry the same verdict and artifact paths as human output.
- Markdown reports must use semantic headings and tables that remain readable in
  plain text.
- Error messages must name the failed requirement, failed artifact path or
  schema path, and next recovery step.
- Root `README.md` and `AGENTS.md` must be scan-friendly: short sections,
  command examples, hard blocks, and clear load order.
- Decorative diagrams are optional; they cannot be the only source of required
  information.

## Security & Privacy Requirements

- The phase-one smoke run must not require network access.
- The synthetic smoke fixture must not include secrets, credentials, private
  session transcripts, private Linear issue text, private PR content, or raw
  prompts.
- Real evidence fixtures are out of scope until provenance, privacy class,
  redaction status, owner, retention status, and promotion status are enforced.
- Artifact bundles must not export data to hosted telemetry or third-party
  services in phase one.
- If future telemetry is added, it must point back to local artifacts and must
  not contain raw sensitive fixture content.
- Secret scanning is not currently evidenced in this repo; closure must not
  claim secret-scan coverage unless an actual scan is run and recorded.

## Artifact Retention

Phase-one run artifacts are local review evidence.

- `.harness/evals/runs/latest.json` must point to the latest run.
- Run manifests must include creation timestamp, case ID, and artifact paths.
- The spec does not define automatic deletion or retention duration yet.
- Real/private fixture retention is blocked until a privacy owner decision.
- Closure may not delete the evidence bundle it cites.

## Acceptance Matrix

| ID | Requirement | Source | Validation |
| --- | --- | --- | --- |
| SA-001 | Root `README.md` exists and states the executable-spine doctrine. | Linear plan docs sub-issue; core doctrine | Read file; verify doctrine text and command path. |
| SA-002 | Root `AGENTS.md` exists and defines agent read order, phase-one hard blocks, and closure evidence. | Documentation authority reframe; core agent rules | Read file; verify no contradiction with ADR-001..ADR-006. |
| SA-003 | Root docs identify `.harness/core/2026-05-18-evals-core.md` as the compressed context entrypoint. | Core cognition layer | Read file; verify link/path. |
| SA-004 | Root docs block adapters, dashboards, cloud runners, plugin systems, source-mining automation, and required judge gates before local artifact proof. | ADR-001; linear plan | Read files; grep blocked terms and phase-one rule. |
| SA-005 | `package.json` or equivalent command surface defines the local eval command. | Linear parent issue | Run command or inspect script. |
| SA-006 | `pnpm evals run fixtures/smoke/pr-closeout.case.json --json` runs locally. | Strategy; linear plan | Execute command and record output. |
| SA-007 | `schemas/eval-case.schema.json` exists or an explicitly documented local equivalent exists. | ADR-002 | Validate schema file. |
| SA-008 | `schemas/eval-result.schema.json` exists or an explicitly documented local equivalent exists. | ADR-002 | Validate schema file. |
| SA-009 | `schemas/artifact-manifest.schema.json` exists or equivalent exists. | ADR-003 | Validate schema file. |
| SA-010 | `schemas/scorer-result.schema.json` exists or equivalent exists. | Linear sub-issue 4 | Validate schema file. |
| SA-011 | `schemas/baseline-result.schema.json` exists or equivalent exists. | Linear sub-issue 4 | Validate schema file. |
| SA-012 | The smoke fixture exists and validates against the local case contract. | Linear sub-issue 2 | Run schema validation. |
| SA-013 | The smoke fixture includes owner, source/provenance, privacy class, redaction status, and promotion status. | ADR-006 | Inspect fixture; schema validation enforces fields. |
| SA-014 | Smoke fixture is synthetic unless human-approved real evidence is documented. | ADR-006 | Inspect provenance field. |
| SA-014A | Local prior-art reuse map exists and separates borrowed concepts from rejected dependencies before schema finalization. | Reuse policy; ADR-002; ADR-004 | Inspect `.harness/references/local-reuse-map.md`; verify it cites `coding-harness` and `agent-skills` references and preserves consuming-repo ownership. |
| SA-015 | The runner writes a local artifact bundle for a passing run. | ADR-003 | Run smoke command; inspect artifact root. |
| SA-016 | The runner writes structured failure artifacts for post-start failures. | Linear sub-issue 3 | Introduce/fixture invalid failure mode or unit test. |
| SA-017 | Artifact bundle includes `result.json`, `report.md`, command log, manifest, scorer results, and baseline result. | ADR-003; execution invariants | Inspect manifest and paths. |
| SA-018 | `result.json` validates against the canonical local result contract. | ADR-002 | Run validator. |
| SA-019 | Artifact manifest verifies all referenced paths exist. | Execution invariants | Run manifest check. |
| SA-020 | Required verdict is computed from deterministic scorers only. | ADR-005 | Inspect result and scorer metadata. |
| SA-021 | At least exit-code, required-artifact/artifact-completeness, and required-output or equivalent deterministic scorers exist. | Linear sub-issue 4 | Unit tests and smoke run output. |
| SA-022 | Baseline comparator records separate `presence_status`, `comparison_status`, and `promotion_status` fields. | Linear sub-issue 4 | Inspect baseline result. |
| SA-023 | No LLM judge output can pass, fail, block, promote, or close the smoke run. | ADR-005 | Inspect scorer policy/result schema. |
| SA-024 | No external framework dependency is required for the smoke run. | ADR-001; ADR-002 | Inspect package deps and command execution. |
| SA-025 | No network or hosted service is required for the smoke run. | ADR-003 | Run in local/offline mode or inspect command. |
| SA-026 | Closure eval artifact exists at `.harness/evals/evals-evals-executable-spine-eval.md`. | Linear plan | Read artifact. |
| SA-027 | Closure eval cites command output, artifact paths, schema validation, scorer verdict, baseline field values, drift status, and rollback status. | Execution invariants | Inspect closure eval. |
| SA-028 | Linear parent issue exists, or a Jamie-approved tracker override artifact exists using the Tracker Override Contract. | Linear tracker gate | Fetch Linear issue or inspect override artifact. |
| SA-029 | Git branch, commit body, PR title/body, or release note references the primary Linear issue once created. | Linear plan | Inspect delivery evidence. |
| SA-030 | External source mining remains deferred until schema, runner, artifacts, and deterministic scorer proof exist. | Triage; review | Inspect active issue set and docs. |
| SA-031 | Human-readable CLI output does not rely on color alone and names verdict plus artifact paths. | Accessibility requirements | Run command without `--json`; inspect plain output. |
| SA-032 | JSON CLI output carries verdict, run ID, manifest path, result path, report path, and command log path. | Accessibility and observability requirements | Run command with `--json`; inspect structured fields. |
| SA-033 | Smoke fixture and generated phase-one artifacts contain no secrets, credentials, private transcripts, or raw private issue/PR content. | Security and privacy requirements | Inspect synthetic fixture and artifact bundle; verify provenance/privacy/redaction fields; run regex inspection and any repo-owned secret/privacy check if available. |
| SA-034 | Artifact manifest records timestamp, case ID, artifact paths, and retention status or explicit retention policy gap. | Artifact retention requirements | Inspect manifest. |
| SA-035 | Root docs are readable without diagrams and include load order, canonical command, hard blocks, and closure evidence. | Accessibility and documentation authority requirements | Read `README.md` and `AGENTS.md`; verify required text is present outside images/diagrams. |
| SA-036 | Closure eval states whether security, accessibility, docs, schema, smoke, and traceability checks passed, failed, were blocked, or were not applicable. | Validation reporting requirements | Inspect closure eval evidence table. |

## Linear Acceptance Traceability

| Linear Item | Acceptance IDs |
| --- | --- |
| Parent: Build local eval runner and artifact contract | SA-001 through SA-036 |
| Child: Compress documentation authority into README and AGENTS | SA-001, SA-002, SA-003, SA-004, SA-035 |
| Child: Define canonical eval schemas and smoke fixture contract | SA-007, SA-008, SA-009, SA-010, SA-011, SA-012, SA-013, SA-014, SA-014A, SA-024, SA-030, SA-033 |
| Child: Implement local runner and artifact bundle writer | SA-005, SA-006, SA-015, SA-016, SA-017, SA-018, SA-019, SA-025, SA-031, SA-032, SA-034 |
| Child: Add deterministic scorers, baseline comparator, and closure eval | SA-020, SA-021, SA-022, SA-023, SA-026, SA-027, SA-036 |
| Tracker / delivery evidence | SA-028, SA-029 |

## First Slice

The first gate is tracker recovery or an explicit tracker-blocked local-prep
note. Documentation authority compression is the first implementation slice
allowed while `linear_blocked` remains explicit.

Why first:

- current repo has no root operating surface;
- future agents otherwise must read 5,000+ lines of `.harness` docs;
- root docs can enforce hard blocks before code exists;
- it is reversible and low-risk.

First slice acceptance:

- SA-001;
- SA-002;
- SA-003;
- SA-004;
- SA-035.

First slice output:

- `README.md`;
- `AGENTS.md`;
- `.harness/evals/2026-05-18-evals-documentation-authority-compression-eval.md`.

## Validation Plan

Phase 1 validation:

```bash
test -f README.md
test -f AGENTS.md
rg -n "Executable Spine|artifact|dashboard|adapter|judge|telemetry|cloud|plugin" README.md AGENTS.md
```

Phase 2 validation:

```bash
find schemas -maxdepth 1 -type f -name "*.schema.json" -print
test -f fixtures/smoke/pr-closeout.case.json
rg -n "sk-|api[_-]?key|token|secret|password|BEGIN (RSA|OPENSSH|PRIVATE) KEY" fixtures
```

Minimum SA-033 evidence for phase two:

- regex inspection reports no obvious secret markers;
- fixture provenance, privacy class, redaction status, owner, and promotion
  status are present;
- any generated artifact manifest later records redaction/privacy status.

This is not full secret-scanner coverage. A dedicated scanner or privacy
inspection command remains an open hardening decision before real/private
fixtures are promoted.

Phase 3 validation:

```bash
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
test -f .harness/evals/runs/latest.json
RUN_POINTER=.harness/evals/runs/latest.json
RESULT_PATH=$(jq -r '.result_path' "$RUN_POINTER")
REPORT_PATH=$(jq -r '.report_path' "$RUN_POINTER")
MANIFEST_PATH=$(jq -r '.manifest_path' "$RUN_POINTER")
COMMAND_LOG_PATH=$(jq -r '.command_log_path' "$RUN_POINTER")
test -f "$RESULT_PATH"
test -f "$REPORT_PATH"
test -f "$MANIFEST_PATH"
test -f "$COMMAND_LOG_PATH"
```

If `jq` is unavailable, the implementation must provide an equivalent
repo-owned latest-run resolver before phase three can close.

Phase 4 validation:

```bash
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
test -f .harness/evals/evals-evals-executable-spine-eval.md
rg -n "deterministic|baseline|artifact|rollback|drift" .harness/evals/evals-evals-executable-spine-eval.md
```

Accessibility and security inspection:

```bash
pnpm evals run fixtures/smoke/pr-closeout.case.json
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
rg -n "sk-|api[_-]?key|token|secret|password|BEGIN (RSA|OPENSSH|PRIVATE) KEY" fixtures .harness/evals
```

The `rg` pattern is only a lightweight inspection aid. Do not claim full
secret-scan coverage unless a dedicated scanner exists and is run. For SA-033,
the minimum acceptable phase-one evidence is regex inspection, manual fixture
provenance/privacy/redaction review, and artifact manifest privacy/redaction
fields.

Spec traceability validation:

```bash
python3 Infrastructure/scripts/validation-and-linting/he_linear_traceability_lint.py .harness/specs/2026-05-18-evals-executable-spine-spec.md
```

If the traceability lint script is unavailable in this repo, record that as an
environment/tooling blocker rather than weakening traceability.

## Open Questions

1. Should the first implementation create an `evals` repo project in Linear,
   or keep issues unprojected with `Repo › evals` until the repo has code?
2. Should the first synthetic smoke run be allowed to pass with
   `presence_status: missing` and `comparison_status: not_compared`, or
   should baseline creation be a separate explicit command?
3. What exact artifact retention duration should apply to
   `.harness/evals/runs` after the first real/private fixture is introduced?
4. Which dedicated secret-scan or privacy-inspection command, if any, should be
   adopted before promoting real/private fixtures?

## Done

The executable spine is done when:

- SA-001 through SA-036 are satisfied or explicitly superseded by a later spec;
- the local smoke command produces a complete artifact bundle;
- deterministic scorers produce the required verdict;
- baseline status is recorded;
- closure eval exists and cites replayable evidence;
- Linear parent issue is created, or a Jamie-approved tracker override artifact
  exists and still requires Linear recovery before PR or milestone closure;
- no blocked phase-one work entered the implementation.

## HE Plan Handoff

Handoff status: plan exists; implementation handoff remains tracker-blocked.

Plan artifact:

- `.harness/plans/2026-05-18-evals-executable-spine-plan.md`

Planning result:

- EP-001: tracker recovery or explicit override;
- EP-002: documentation authority compression;
- EP-003: canonical schemas and smoke fixture;
- EP-004: local runner and artifact bundle writer;
- EP-005: deterministic scorers and baseline comparator;
- EP-006: closure eval and drift proof.

Local documentation, schema, and runner preparation may proceed while
`linear_blocked` is explicit, but implementation may be represented as normal
tracked delivery, PR-ready work, or milestone-complete only after one of:

- Linear parent and children are created and linked; or
- Jamie approves the tracker override artifact defined in this spec.

Until then, the plan is valid sequencing evidence and any local implementation
work must preserve `linear_blocked` status.

Handoff inputs:

- this spec;
- `.harness/plans/2026-05-18-evals-executable-spine-plan.md`;
- `.harness/linear/2026-05-18-evals-executable-spine-linear-plan.md`;
- `.harness/linear/2026-05-18-evals-linear-mutation-attempt.md`;
- ADR-001 through ADR-006;
- `.harness/core/2026-05-18-evals-core.md`.

Planning constraints:

- Start with tracker recovery or an explicit tracker-blocked local-prep note.
- Then documentation authority compression.
- Then schemas and smoke fixture.
- Then local runner and artifact writer.
- Then deterministic scorers, baseline comparator, and closure eval.
- Do not create external adapter, dashboard, telemetry exporter, cloud runner,
  plugin system, source-mining task, or judge gate in phase one.

blackboard_delta:

```yaml
stage: he-spec
artifact: .harness/specs/2026-05-18-evals-executable-spine-spec.md
plan: .harness/plans/2026-05-18-evals-executable-spine-plan.md
linear_status: linear_blocked
next_stage: implementation_after_tracker_recovery_or_jamie_override
acceptance_ids: SA-001..SA-036
plan_ids: EP-001..EP-006
first_slice: tracker_recovery_then_documentation_authority_compression
blocked_mutation:
  tool: mcp__codex_apps__linear_save_issue
  error: unsupported call
```
