---
schema_version: 1
title: Evals Executable Spine Spec Technical Review
type: he-technical-review
status: complete
date: 2026-05-18
review_target: .harness/specs/2026-05-18-evals-executable-spine-spec.md
source_plan: .harness/linear/2026-05-18-evals-executable-spine-linear-plan.md
subagent_policy: conditional
roles_used: spec-flow-analyzer, adversarial-document-reviewer, he-spec-inline
verdict: conditional_go_after_spec_tightening
---

# Evals Executable Spine Spec Technical Review

## Executive Verdict

Conditional go for implementation planning after the spec tightening applied on
2026-05-18.

The first draft was directionally strong but had four load-bearing ambiguities:

1. Linear tracker override could be bypassed without a concrete artifact.
2. Baseline status mixed presence, comparison, and promotion states.
3. The public command contract allowed undocumented equivalents and referenced
   an undefined validation subcommand.
4. Artifact run discovery was too loose for automation consumers.

Those issues were corrected in
`.harness/specs/2026-05-18-evals-executable-spine-spec.md`.

Remaining blocker: live Linear issue creation is still blocked because
`mcp__codex_apps__linear_save_issue` returned `unsupported call`. The spec
may guide implementation planning, but normal HE tracker completion requires a
created Linear parent issue or a Jamie-approved tracker override artifact.

## Review Inputs

- `.harness/specs/2026-05-18-evals-executable-spine-spec.md`
- `.harness/linear/2026-05-18-evals-executable-spine-linear-plan.md`
- `.harness/linear/2026-05-18-evals-linear-mutation-attempt.md`
- ADR-001 through ADR-006
- `.harness/core/2026-05-18-evals-core.md`

## Findings And Resolutions

### Finding 1: Tracker Override Was Underspecified

Severity: High

Original issue: the draft allowed completion with a tracker override but did
not define who could grant it, where it had to live, or what evidence it needed.

Risk: future agents could bypass the Linear tracker gate with ad hoc local
notes, weakening the HE control loop.

Resolution applied:

- Added `Tracker Override Contract`.
- Only Jamie may approve an override.
- Override must be recorded in this spec or a sibling
  `.harness/linear/*override*.md` artifact.
- Required fields include actor, timestamp, reason, blocked payload, failed
  tool, exact error, recovery condition, and scope limit.
- SA-028 now requires either a live parent issue or a Jamie-approved override
  artifact.

Status: resolved for spec purposes; live Linear blocker remains.

### Finding 2: Baseline Status Model Was Ambiguous

Severity: High

Original issue: baseline status mixed presence states, comparison outcomes, and
promotion workflow states into one enum.

Risk: different implementers could write incompatible baseline comparators,
which would damage cross-run comparability.

Resolution applied:

- Replaced single baseline status with:
  - `presence_status`: `missing` or `present`;
  - `comparison_status`: `not_compared`, `matched`, `changed`, or
    `error`;
  - `promotion_status`: `not_requested`, `promoted`, or `blocked`.
- SA-022 now validates these fields explicitly.
- Closure evidence now cites baseline field values rather than a vague
  baseline status.

Status: resolved.

### Finding 3: Command Contract Was Too Loose

Severity: Medium

Original issue: the spec allowed an equivalent command and referenced
`pnpm evals validate` without defining it as an interface.

Risk: future agents could implement multiple non-equivalent command surfaces
and still claim acceptance.

Resolution applied:

- Made `pnpm evals run fixtures/smoke/pr-closeout.case.json --json` the
  canonical required public command.
- Removed acceptance language allowing undocumented equivalents.
- Removed `pnpm evals validate` from the validation plan.
- Helpers are allowed, but they cannot replace the canonical command for
  acceptance or closure.

Status: resolved.

### Finding 4: Artifact Path Discovery Was Underspecified

Severity: Medium

Original issue: the artifact path only needed to be deterministic enough for
logs and closure artifacts.

Risk: CI and future agents would need custom guessing logic to find the latest
artifact bundle.

Resolution applied:

- Added required run ID shape:
  `<utc-basic-timestamp>-<case-id>-<short-input-hash>`.
- Added required local pointer:
  `.harness/evals/runs/latest.json`.
- `latest.json` must include run ID, case ID, manifest path, result path,
  report path, and command log path.

Status: resolved.

## Remaining Risks

### Linear Issue Creation Is Still Blocked

Severity: High

Evidence: `.harness/linear/2026-05-18-evals-linear-mutation-attempt.md`
records that `mcp__codex_apps__linear_save_issue` returned
`unsupported call`.

Impact: the spec cannot honestly claim normal Linear traceability until the
parent issue exists or Jamie approves the explicit tracker override.

Recommended response: retry Linear issue creation when the connector supports
`save_issue`, or create the parent/children manually from the ready payloads.

### Baseline Bootstrap Policy Still Needs A Product Decision

Severity: Medium

Evidence: the spec intentionally keeps an open question about whether the first
synthetic smoke run may pass with `presence_status: missing` and
`comparison_status: not_compared`.

Impact: implementation planning must choose the initial bootstrap behavior
before writing the comparator.

Recommended default: allow pass for the first synthetic smoke run when
deterministic scorers pass and missing baseline is explicit. Require owner
approval before promotion.

### Traceability Lint May Be Repo-External

Severity: Low

Evidence: the HE spec contract names
`Infrastructure/scripts/validation-and-linting/he_linear_traceability_lint.py`,
but this evals repo does not currently contain that path.

Impact: validation may need to record an environment/tooling blocker rather
than a failed spec.

Recommended response: keep the lint command in the spec as the HE contract, but
do not block implementation planning if the script is absent in this seed repo;
record absence as a tooling gap.

## Second-Pass Review Addendum

Follow-up review found one material specification gap after the first hardening
pass: non-functional, accessibility, security/privacy, and artifact-retention
requirements existed only weakly or implicitly. That would let a future
implementation satisfy the runner contract while still producing
color-dependent CLI output, incomplete JSON fields, unscanned fixture content,
or closure evals that omit blocked validation categories.

The spec now adds explicit requirements for:

- reliability, maintainability, and performance constraints;
- plain-text CLI and Markdown report accessibility;
- synthetic fixture privacy boundaries and local-only phase-one operation;
- artifact retention status and latest-run pointer requirements;
- SA-031 through SA-036 acceptance coverage for output accessibility,
  structured JSON evidence, privacy inspection, manifest retention evidence,
  diagram-independent root docs, and closure eval validation reporting.

Residual risk: the repo still lacks implementation files and dedicated
validators, so these requirements are implementation-ready constraints rather
than proven behavior.

## Acceptance Coverage Review

The spec now defines SA-001 through SA-036.

Coverage is adequate for the planned Linear parent and four child issues:

- Documentation authority compression: SA-001 through SA-004, SA-035.
- Canonical schemas and smoke fixture: SA-007 through SA-014, SA-024, SA-030,
  SA-033.
- Local runner and artifact bundle: SA-005, SA-006, SA-015 through SA-019,
  SA-025, SA-031, SA-032, SA-034.
- Deterministic scorers, baseline comparator, and closure eval: SA-020 through
  SA-023, SA-026, SA-027, SA-036.
- Tracker and delivery evidence: SA-028, SA-029.

No acceptance IDs currently authorize dashboards, adapters, telemetry
exporters, cloud execution, plugin architecture, broad source mining, or
required LLM judge gates.

## Implementation Planning Guidance

Proceed to implementation planning only with these constraints:

1. Start with root `README.md` and `AGENTS.md`.
2. Keep the public smoke command canonical.
3. Define local schemas before runner internals spread.
4. Keep artifacts local and authoritative.
5. Keep required verdicts deterministic.
6. Use the split baseline model.
7. Do not create expansion work until the executable spine closure eval exists.
8. Recover Linear tracking before PR or milestone closure.

## Final Review Decision

The deepened spec is fit for `he-plan` after acknowledging the Linear blocker.

Do not proceed to broad implementation or PR closure until one of these is true:

- Linear parent issue and children exist; or
- Jamie approves the tracker override artifact defined in the spec.

No-Go for dashboards, adapters, source mining, telemetry exporters, cloud
runners, plugin architecture, and required judge gates.
