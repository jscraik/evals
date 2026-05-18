# Quarantine Framework, Judge, And Telemetry Sprawl

# Refactor Classification

- governance reduction
- anti-drift hardening
- plugin boundary correction
- execution determinism
- eval stabilization
- moat reinforcement
- context-load reduction

# Problem Statement

The project has a rich source list: Braintrust recipes, OpenAI Evals,
AutoEvals, DeepEval, FastEval, OpenEvals, Awesome LLM Judges, and prompt
engineering repositories. These are useful, but they create a strong gravity
toward framework-first architecture, judge-first scoring, telemetry-first proof,
and dashboard-first visibility.

Architectural issue: external models can leak into canonical schemas and make
the shared runtime subordinate to public frameworks.

Operational issue: teams may spend phase-one effort on adapters, hosted
logging, dashboards, or judge scoring before the local runner proves anything.

Cognition issue: future agents may mistake a long integration list for
strategic maturity.

Future-agent issue: agents may add adapters whenever a new framework is named,
even if no local suite needs it.

Moat risk: generic integrations are easy to copy. The moat is the local corpus,
not framework breadth.

# Root Cause Analysis

The architecture pressure emerged because the user supplied several credible
eval sources and Braintrust recipes while deciding whether to create a shared
evals project. That was correct research input, but every named source creates
an implicit implementation temptation.

It survived because the prior artifacts kept the sources visible as useful
reference material. The strategy correctly demoted them to adapters, but without
a refactor program future agents may still treat them as a backlog.

The issue is strategic and accidental: strategic because integrations may become
valuable later, accidental because adopting them too early would solve the wrong
problem.

# Evidence

Facts:

- The intent artifact says external frameworks should provide adapters and must
  not own canonical schema.
- The architecture review identifies framework-native schema takeover,
  dashboard-first development, telemetry as proof, and LLM judge gates as drift
  risks.
- The triage artifact blocks external adapters, dashboards, cloud execution, and
  judge sophistication before the local smoke lane exists.
- The strategy artifact says Braintrust recipes are useful later but not
  phase-one base, and that external frameworks are adapters.

Interpretation:

- The source list should become a quarantine/backlog boundary, not an
  implementation queue.

Assumptions:

- At least one external adapter or telemetry exporter may become useful after
  two local suites run.

# Architectural Impact

Affected systems:

- future adapters/;
- future src/telemetry/;
- future judge/rubric metadata;
- future dashboard/report aggregation;
- ADRs;
- Linear routing;
- source-mining notes.

Blast radius: medium. The quarantine mostly prevents premature work, but later
adapter boundaries affect all consumers.

Migration complexity: low now, high if delayed until adapters already exist.

Drift risk: critical if framework schemas leak into canonical result shape.

Rollback difficulty: low before implementation; high after external data model
becomes embedded in fixtures or reports.

Likely files/directories touched:

- .harness/decisions/
- adapters/ later
- src/telemetry/ later
- src/judges/ or src/scorers/ later
- source research notes
- Linear parent issue descriptions

Systems that must not be touched:

- core runner before executable spine exists;
- canonical schema in service of a framework;
- required gate policy in service of uncalibrated judges.

# Desired End State

The repo has an explicit quarantine policy:

- framework sources are reference material until a local suite needs an adapter;
- adapters translate outward from canonical result schema;
- telemetry is emitted from local run events and never replaces artifacts;
- judges are advisory until calibration artifacts exist;
- dashboards wait until repeated artifact bundles provide trustworthy data.

The improved reasoning model:

- core result schema is stable;
- adapters are optional leaves;
- telemetry explains core events;
- judge outputs are metadata, not authority;
- dashboard aggregates artifacts instead of inventing proof.

The improved Linear shape:

- integration ideas are parked as deferred issues or notes;
- no integration parent issue activates before executable spine and first suites
  meet exit criteria.

# Migration Strategy

Stage the quarantine as policy first, code later.

1. Write ADRs that freeze adapter direction, telemetry authority, and judge
   advisory status.
2. Add a source-mining note that classifies each external source as reference,
   adapter candidate, evaluator idea, or later suite inspiration.
3. Add a guard to Linear descriptions: no adapter/dashboard/judge/telemetry work
   starts without executable-spine artifact proof.
4. After two local suites run, select at most one adapter or telemetry exporter
   for a thin proof.
5. Require every adapter to emit canonical result schema and record source
   framework metadata separately.
6. Require every judge experiment to record rubric version, judge mode,
   evaluator version, prompt hash, calibration set, and advisory status.

Coexistence rules:

- External source notes may exist before implementation.
- Adapter code may not be imported by core runner.
- Telemetry exporter may not be required for local pass/fail.
- Judge output may not set required verdicts until calibration ADR permits it.

Rollback strategy:

- If an adapter leaks framework fields into core schema, remove adapter from
  required path and add translation layer outward.
- If telemetry becomes required proof, demote it to optional report metadata.
- If judge output gates pass/fail early, disable required status and mark
  results advisory.

Linear milestone/parent issue shape:

- Milestone: Framework, Judge, And Telemetry Quarantine
- Parent issue: Keep external eval systems behind local artifact authority

# Execution Phases

## Phase 1 - Quarantine ADRs

Objective: define adapter direction, telemetry authority, and judge advisory
status.
Affected systems: .harness/decisions/, strategy references.
Expected risk: low.
Can run in parallel: yes, but after executable-spine contract draft.
Validation requirements: ADRs do not introduce implementation scope.
Rollback conditions: ADRs contradict artifact authority or repo-local ownership.
Linear mapping: guardrail sub-issue.
Agent-safe: yes.
Human review required: yes.

## Phase 2 - Source Classification

Objective: classify user-provided sources into reference categories without
turning them into implementation tasks.
Affected systems: research notes, Linear deferred backlog.
Expected risk: low.
Can run in parallel: yes.
Validation requirements: every source has category, allowed use, and blocked
use.
Rollback conditions: note becomes a roadmap for phase-one adapters.
Linear mapping: small sub-issue or checklist under quarantine parent.
Agent-safe: yes.
Human review required: no.

## Phase 3 - Adapter Boundary Proof

Objective: after two local suites run, implement at most one adapter proof that
cannot mutate canonical schema.
Affected systems: adapters/, schema tests, artifact report.
Expected risk: medium.
Can run in parallel: no.
Validation requirements: adapter output validates against canonical result
schema and records external metadata separately.
Rollback conditions: adapter requires framework-native schema in core.
Linear mapping: deferred sub-issue, not phase-one.
Agent-safe: assisted.
Human review required: yes.

## Phase 4 - Telemetry Export Proof

Objective: after local run events stabilize, add optional telemetry export that
explains runs without deciding them.
Affected systems: src/telemetry, exporter config, report metadata.
Expected risk: medium.
Can run in parallel: after local trace exists.
Validation requirements: run passes without exporter; artifact bundle remains
complete without telemetry.
Rollback conditions: hosted service becomes required for local proof.
Linear mapping: deferred sub-issue.
Agent-safe: assisted.
Human review required: yes for privacy/security.

## Phase 5 - Judge Calibration Gate

Objective: define when an LLM judge can move from advisory to required, if ever.
Affected systems: judge metadata schema, scorer policy, calibration artifacts.
Expected risk: high.
Can run in parallel: no.
Validation requirements: calibration eval shows reliability, disagreement
handling, rubric versioning, and failure examples.
Rollback conditions: judge score is unstable, untraceable, or suppresses
deterministic evidence.
Linear mapping: separate future parent issue.
Agent-safe: assisted.
Human review required: yes.

# Linear Mapping

Workspace/team: Jscraik
Team key: JSC
Top-level initiative: Dev Portfolio
Cross-repo project: Portfolio Ops
Target Linear project: evals
Repo-specific or cross-repo: repo-specific guardrail with later cross-repo
effect.
Belongs under Portfolio Ops: yes.
Affects Dev Portfolio: yes.
Recommended milestone name: Framework, Judge, And Telemetry Quarantine
Recommended parent issue title: Keep external eval systems behind local artifact
authority
Suggested priority: high as guardrail; implementation deferred.
Suggested labels: evals, anti-drift, adapters, judges, telemetry.
Dependencies: executable-spine contract for implementation phases.
Project reactivation: no separate project. Keep under evals and Portfolio Ops.
Active set: one guardrail issue only until executable spine exits.

Recommended sub-issues:

- Write adapter and telemetry authority ADRs.
- Classify external source list.
- Add adapter proof after two suites run.
- Add telemetry export proof after local trace exists.
- Define judge calibration gate after deterministic scorers stabilize.

# Anti-Regression Constraints

Must not regress:

- external frameworks remain adapters;
- core result schema remains local;
- telemetry remains explanatory;
- judge outputs remain advisory until calibrated;
- dashboards wait for repeated artifact bundles.

Anti-patterns must not reappear:

- framework-native canonical schema;
- adapter sprint before local suites;
- Braintrust or OTEL as proof source;
- Awesome-LLM-Judges as direct implementation plan;
- prompt-engineering corpus as architecture;
- judge-as-gate without calibration;
- dashboard as adoption strategy.

# Eval Requirements

Expected eval artifact:

.harness/evals/evals-framework-judge-telemetry-quarantine-eval.md

Required proof:

- ADRs or policy notes cite artifact authority;
- source classification exists;
- no phase-one adapters/dashboard/judge gates were added;
- any later adapter validates against canonical schema;
- any telemetry proof is optional;
- any judge proof records calibration metadata and advisory status.

# Success Criteria

- Every external source has an allowed-use classification.
- No external framework owns canonical schema.
- No telemetry exporter is required for local pass/fail.
- No LLM judge is required before calibration.
- No dashboard work starts before repeated artifact bundles.
- Future agents can tell whether an integration is allowed now, deferred, or
  blocked.

# Safe Rollback Conditions

Rollback or stop if:

- adapter imports leak into core runner;
- telemetry becomes required;
- judge output changes required verdict;
- framework metadata appears as canonical result fields;
- dashboard or UI work starts before artifact proof;
- source classification becomes a backlog dump.

Linear status recommendation if triggered: Blocked for phase-one violations,
Needs rework for boundary leakage.

# Future-Agent Guidance

Treat external eval systems as useful but subordinate. Mine them for ideas only
after the local artifact contract exists. Add one adapter because a real suite
needs it, not because a framework exists.

Safe to modify: source classification notes, adapter internals, telemetry
export formatting, advisory judge report wording.

Human review required: promoting judge outputs to required gates, adding hosted
telemetry, changing canonical schema for an external framework.

Proof required before closure: eval artifact showing quarantine preserved local
artifact authority.

# Related Systems

- .harness/features/2026-05-18-evals-intent.md
- .harness/review/2026-05-18-evals-architecture-review.md
- .harness/triage/2026-05-18-evals-triage.md
- .harness/strategy/2026-05-18-evals-strategy.md
- Future ADR: canonical eval result schema and external adapter boundary.
- Future ADR: local artifact bundles are authoritative; telemetry explanatory.
- Future ADR: LLM judges advisory until calibrated.
- Related refactor: stabilize-evals-executable-spine.md
- Related refactor: preserve-repo-local-suite-boundaries.md

