# Evals Executable Spine Plan Technical Review

Date: 2026-05-18
Status: patched after review
Reviewed artifacts:

- .harness/specs/2026-05-18-evals-executable-spine-spec.md
- .harness/plans/2026-05-18-evals-executable-spine-plan.md

## Review Scope

This review checks whether the HE plan can safely hand off the executable-spine
spec into implementation without losing tracker discipline, acceptance
traceability, sequencing, validation, rollback, or phase-one scope boundaries.

## Reviewer Coverage

- planning-specialist-agent: completed read-only review with actionable
  findings.
- adversarial-document-reviewer: failed route discipline by creating an
  unrelated scratch AGENTS.md outside the evals repo. That artifact was deleted
  and its output was not used as evidence for this review.

Coverage gap: adversarial document review should be rerun only if a bounded,
artifact-first route is available. The planning-specialist review was sufficient
to identify the concrete fixable issues in this pass.

## Findings And Resolution

### Finding 1 — Tracker Gate Semantics Were Too Strict In The Plan

Severity: High

Evidence before patch:

- Spec allowed local artifacts while preserving `linear_blocked` status.
- Plan said implementation readiness required Linear recovery or override before
  implementation could start.

Impact: future agents could deadlock and refuse useful local documentation,
schema, or runner preparation even though the spec only blocks normal
tracker-complete claims.

Fix applied:

- Plan now states local preparatory artifacts may be created while
  `linear_blocked` is explicit, but normal HE handoff, PR/milestone closure,
  and tracker-complete claims remain blocked.
- Spec HE Plan Handoff now uses the same policy.

Resolution status: fixed.

### Finding 2 — EP-003 Validation Required An EP-004 Deliverable

Severity: High

Evidence before patch:

- EP-003 validation included `pnpm evals run fixtures/smoke/pr-closeout.case.json --json`.
- EP-004 is where `package.json` and the command surface are introduced.

Impact: EP-003 could fail because the runner does not exist yet, not because the
schemas or smoke fixture are wrong.

Fix applied:

- Removed the smoke command from EP-003 validation.
- Added explicit note that runtime schema validation is proven in EP-004, while
  EP-003 may use a repo-owned static schema validator if one exists.

Resolution status: fixed.

### Finding 3 — EP-006 Linear Mapping Invented A Separate Closure Child

Severity: Medium

Evidence before patch:

- Spec maps closure acceptance IDs SA-026, SA-027, and SA-036 under the existing
  child issue: "Add deterministic scorers, baseline comparator, and closure
  eval".
- Plan traceability table mapped EP-006 to a separate "Closure eval" item.

Impact: Linear/spec/plan traceability could drift and create extra issue noise.

Fix applied:

- Plan traceability table now maps EP-006 to the existing scorer/baseline/closure
  child item.

Resolution status: fixed.

## Remaining Risks

| Risk | Status | Required Action |
| --- | --- | --- |
| Linear issue creation remains blocked | blocked | Recover Linear issue creation or create Jamie-approved override artifact. |
| Implementation files do not exist | blocked | Execute EP-002 through EP-006 after tracker policy is accepted. |
| Runtime smoke command cannot run yet | blocked | Implement EP-004. |
| Schema validation command is not available yet | blocked | Implement EP-003 and EP-004 validation path. |
| Dedicated adversarial review output was invalid | coverage gap | Rerun with stricter artifact-first instructions only if needed. |

## Go / No-Go

Go for local preparatory implementation planning.

No-Go for normal tracker-complete handoff, PR closure, or milestone closure
until Linear is recovered or Jamie records the tracker override artifact.

No-Go for dashboards, adapters, telemetry exporters, cloud execution, plugin
systems, source mining, or required judge gates.

## Validation Evidence

Mechanical checks to run after patch:

- plan/spec contain the plan path and EP-001..EP-006 mapping;
- EP-003 no longer requires the smoke command;
- EP-006 maps to the existing scorer/baseline/closure child;
- README.md, AGENTS.md, package.json, schemas, fixture, runner, and closure eval
  remain missing implementation deliverables rather than completed work.

blackboard_delta:

```yaml
status: updated
learning: "HE plan review found and fixed tracker-gate wording, EP-003 validation sequencing, and EP-006 Linear mapping drift."
target_surface: plan
owner: he-plan
follow_up: "Recover Linear tracking or approve override before normal implementation handoff."
```
