# Evals Refactor Program Reframe

Date: 2026-05-18
Repository: /Users/jamiecraik/dev/evals
Status: refactor-program index and migration compression

## Inputs Read

- .harness/features/2026-05-18-evals-intent.md
- .harness/review/2026-05-18-evals-architecture-review.md
- .harness/triage/2026-05-18-evals-triage.md
- .harness/strategy/2026-05-18-evals-strategy.md

No .harness/decisions/*.md or .harness/core/*.md files existed at generation
time.

## Reframe Decision

Generate three high-leverage refactor programs:

1. stabilize-evals-executable-spine.md
   Build the local runner, schemas, artifact bundle, deterministic scorer
   contract, smoke fixture, and baseline comparison path before any expansion.

2. preserve-repo-local-suite-boundaries.md
   Prevent the shared evals repo from absorbing coding-harness and agent-skills
   domain truth. Define suite ownership, fixture provenance, and promotion
   boundaries.

3. quarantine-framework-judge-telemetry-sprawl.md
   Keep Braintrust, OpenAI Evals, DeepEval, AutoEvals, FastEval, OpenEvals,
   OTEL, prompt libraries, dashboards, and LLM judges behind explicit adapter or
   advisory boundaries until the executable spine and first suites prove value.

## Findings Deliberately Not Promoted To Refactor Programs

- Add AGENTS.md and README.md.
  This is high-priority but small enough for a focused Linear issue under the
  executable-spine initiative.

- Add first package manifest.
  This belongs inside stabilize-evals-executable-spine.md, not a separate
  architecture migration.

- Add a dashboard.
  Rejected. The strategy and triage artifacts classify dashboard-first work as
  false sophistication until repeated local artifact bundles exist.

- Add source-mining automation for all referenced eval frameworks.
  Rejected for phase one. A short research note is acceptable later, but
  automation before schemas and artifact proof would create framework gravity.

- Add a plugin system.
  Rejected. The triage and strategy artifacts say plugin architecture is
  premature until two real adapters need it.

## Linear Shape

Workspace/team: Jscraik
Team key: JSC
Top-level initiative: Dev Portfolio
Cross-repo project: Portfolio Ops
Repo-specific project: evals

Recommended active set:

- one active parent issue for Evals Executable Spine;
- one dependent parent issue for Repo-Owned Suite Boundaries;
- one guardrail parent issue for Framework/Judge/Telemetry Quarantine.

Do not explode this into many concurrent Linear issues. The active work should
stay small until the first artifact bundle exists.

## Closure Rule

No parent issue or milestone mapped from these refactor programs should close
without a matching eval artifact at:

.harness/evals/evals-<milestone-or-parent-issue>-eval.md

The eval artifact must include local command evidence, artifact paths, drift
checks, and whether the migration preserved the non-negotiables from
.harness/strategy/2026-05-18-evals-strategy.md.

