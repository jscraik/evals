# coding-harness First-Adopter Recipe

This recipe turns the first external adoption path from the Theory of Constraints review into a small, artifact-only evals contract. It keeps suite intent and product behavior owned by `coding-harness`; evals only classifies declared evidence and preserves authority boundaries.

## Goal

Create one `coding-harness` owned `.evals/project.json` and one narrow suite around PR closeout truth. The first useful result is an authority packet that says what evals can prove, what remains non-proof, and what input is missing next.

## Start With Classification

Do not start by executing target project code. The first path should use:

```bash
pnpm evals state --repo-root <coding-harness-root> --json
pnpm evals check --repo-root <coding-harness-root> --json
```

The expected first authority mode may still be `not_configured` or `blocked`. That is useful when `authority_classification.adoption_readiness.status` names the live adoption state: `missing_input`, `blocked`, `warning`, or `ready`.

## Minimal Manifest Shape

The first `.evals/project.json` should declare:

- `suite_roots`: the target-owned suite directory, usually `.evals`.
- `authority.default_mode`: `artifact_only`.
- `runtime_evidence_policy.required`: `false` until coding-harness has target-owned runtime evidence ready for evals to classify.
- `privacy.approval_status`: `not_required`, `approved`, `pending`, `blocked`, or `expired`.
- `artifact_policy.artifact_roots`: target-owned run artifact roots.
- `execution_policy.allow_target_execution`: `false`.
- `execution_policy.black_box_execution_status`: `blocked`.
- `suite_quality`: warning-only metadata for the first PR closeout suite.

Use `suite_quality` to declare:

- `steady_state_hypothesis`: PR closeout evidence separates local validation from CI, review, tracker, and merge-readiness claims.
- `decision_metric`: a reviewer can classify which closeout claims have artifact evidence.
- `guardrail_metrics`: CI, review, tracker, and merge readiness stay non-proof unless explicit evidence exists.
- `unit_of_analysis`: one PR closeout packet.
- `denominator`: all closeout packets selected for the suite.
- `residual_uncertainty`: artifact-only inspection cannot prove product behavior.
- `oracle_type`: `artifact_contract` for the first suite.
- `evaluator_authority_status`: `deterministic` unless a judge path is deliberately introduced later.

## First Suite Boundary

The first suite should evaluate one narrow claim:

> Given a PR closeout packet, the evidence distinguishes local validation, CI state, review-thread state, branch state, tracker state, and merge readiness.

Keep the suite target-owned. Evals should classify the manifest and artifact packet; it should not become the owner of coding-harness product behavior.

## Exit Criteria

The first adoption slice is useful when:

- `pnpm evals state --repo-root <coding-harness-root> --json` emits `authority_classification.adoption_readiness.status`.
- Missing adoption input appears in `authority_classification.adoption_readiness.next_missing_input`.
- Complete suite-quality metadata changes adoption readiness from `warning` to `ready` only when the manifest is valid and `authority_classification.authority_mode` is not `blocked`.
- `authority_classification.proof_context.target_behavior_execution` remains `false`.
- The packet still lists target behavior, CI, review, tracker, and merge readiness as non-proof unless explicit evidence exists.

Do not add black-box execution, dashboards, external adapters, cloud runners, or required LLM judges for this slice.
