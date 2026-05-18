# Evals Plan Confidence Review

Date: 2026-05-18
Status: optimal within available evidence
Reviewed plan: .harness/plans/2026-05-18-evals-executable-spine-plan.md
Associated spec: .harness/specs/2026-05-18-evals-executable-spine-spec.md

## Initial Confidence

Initial confidence: 84%

Band: strong candidate with validation gaps.

Evidence:

- plan and spec exist;
- plan maps EP-001 through EP-006 to SA-001 through SA-036;
- spec and plan preserve the Linear blocker and phase-one hard blocks;
- implementation files are still absent, so runtime behavior is untested.

## Review Coverage

Requested reviewer perspectives:

- CodeRabbit-style review: usable findings returned.
- adversarial-reviewer: invalid/off-route output; created unrelated scratch AGENTS.md and was discarded.
- agent-native-reviewer: invalid/off-route output; created unrelated scratch AGENTS.md and was discarded.
- architecture-strategist: invalid/off-route output; created unrelated scratch AGENTS.md and was discarded.

The scratch AGENTS.md was deleted. Only the CodeRabbit-style findings and local
file evidence were used for plan/spec changes.

## Material Issues Found And Fixed

### EP-006 Traceability Row Drift

Problem: EP-006 was mapped to the existing Linear child label, but the wording
duplicated EP-005 and hid the closure/drift-proof intent.

Fix: plan traceability row now says "Close executable spine with replayable
closure eval and drift proof."

Spec impact: none required; spec already maps SA-026, SA-027, and SA-036 to the
existing scorer/baseline/closure child.

### Placeholder Artifact Paths

Problem: EP-004 validation checked `<run-id>` placeholder paths without a
deterministic resolution step.

Fix: plan and spec now require reading `.harness/evals/runs/latest.json` and
resolving concrete result, report, manifest, and command log paths. If `jq` is
unavailable, an equivalent repo-owned latest-run resolver is required.

Spec impact: updated phase-three validation.

### SA-033 Secret/Privacy Evidence Was Too Heuristic

Problem: regex inspection was correctly labeled as lightweight, but the plan and
spec did not define the minimum acceptable phase-one evidence set.

Fix: plan and spec now require regex inspection, manual
provenance/privacy/redaction review, and artifact manifest privacy/redaction
fields. Dedicated scanner adoption remains an open hardening decision before
real/private fixture promotion.

Spec impact: updated SA-033 validation language and phase-two validation notes.

### First Slice Wording Drift

Problem: one spec section said documentation authority compression was the first
implementation slice while another said tracker recovery/local-prep note comes
first.

Fix: spec now states the first gate is tracker recovery or explicit
tracker-blocked local-prep note; documentation authority compression is the
first implementation slice allowed while `linear_blocked` remains explicit.

Spec impact: updated First Slice section.

## Remaining Blockers

| Blocker | Status | Reason |
| --- | --- | --- |
| Linear parent and child issues | blocked | Issue creation previously failed with unsupported call. |
| README.md | blocked_missing | Implementation has not started. |
| AGENTS.md | blocked_missing | Implementation has not started. |
| package.json | blocked_missing | Runner command does not exist. |
| schemas/ | blocked_missing | Schema work not implemented. |
| fixtures/smoke/pr-closeout.case.json | blocked_missing | Smoke fixture not implemented. |
| traceability lint script | blocked_missing | Repo lacks the HE traceability lint path. |
| runtime smoke command | blocked | Command surface does not exist. |

## Final Confidence

Final confidence: 88%

Band: strong candidate with validation gaps.

Confidence cannot exceed this band because the plan/spec pair is not yet
validated against implementation, runtime artifacts, Linear recovery, schemas,
or a real smoke command.

## Verdict

Go for local preparatory execution with `linear_blocked` preserved.

No-Go for normal tracker-complete handoff, PR closure, milestone closure, or
production-readiness claims until Linear recovery or Jamie override plus runtime
evidence exists.

blackboard_delta:

```yaml
status: updated
learning: "Plan/spec review tightened EP-006 traceability, latest-run artifact resolution, SA-033 minimum privacy evidence, and first-slice tracker wording."
target_surface: plan
owner: he-plan
follow_up: "Recover Linear tracking or approve override, then execute EP-002 through EP-006 with runtime evidence."
```
