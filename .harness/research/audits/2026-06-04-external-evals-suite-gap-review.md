# External Evals Suite Gap Review

Date: 2026-06-04
Repository: /Users/jamiecraik/dev/evals
Review type: architecture, structure, setup, and runtime-path audit
Reference lens:
- /Users/jamiecraik/Documents/Coding Skill books/ai_evals_comprehensive_study_guide.md
- /Users/jamiecraik/Documents/Coding Skill books/Lessons Learned in Software Testing.pdf

## Executive Summary

Current maturity: C-/early external proof spine.

The project is already strong as a local artifact-contract verifier. It has a
small CLI, data-only suite contracts, deterministic scorer results, schema-backed
artifact bundles, latest-pointer validation, trace-event timelines, runtime
evidence fixtures, and external artifact inspection through `--repo-root`.
Those are real executable strengths, not just README claims.

The project is not yet an independent external evaluation authority for multiple
projects in the black-box or gray-box sense requested by this review. It can
inspect a consumer repo's already-written eval artifact bundle, and it can run a
consumer-owned `.evals/suite.json` data contract. It cannot yet execute target
project behavior from outside the boundary, ingest production traces, run
pipeline or multi-turn evals, validate LLM judges, manage labeled datasets, emit
suite-history reports, or close the loop into regression cases and project
backlog items.

Strongest areas:
- Artifact authority is clear: artifacts decide and telemetry explains.
- Deterministic code-based checks are favored over LLM judges.
- `--repo-root` inspection keeps external artifact proof separate from consumer
  behavior, CI, review, tracker, and merge readiness.
- Phase-one hard blocks prevent premature dashboards, adapters, cloud runners,
  plugin systems, source mining, and required judge gates.
- Scorer assertions are readable and schema-backed enough for humans and agents
  to investigate failures.

Weakest areas:
- No black-box target execution contract.
- No first-class project manifest or adapter contract.
- No dataset registry, sampling, split, label, annotation, or judge validation
  workflow.
- No RAG, retrieval, pipeline-stage, multi-turn, production monitoring, or
  safety-eval contract.
- Reporting is run-local, not suite-level, trend-level, release-level, or
  decision-maker-oriented.

Highest-risk gaps:
- External readiness can be mistaken for artifact consistency unless the
  `not_configured` runtime-evidence policy boundary stays visible.
- The current `simulate-pr-closeout` execution path is too synthetic to verify
  target project behavior.
- LLM judge support is intentionally advisory, but there is no path yet to
  validate and promote a judge safely.
- Real fixture governance is documented but not yet operationalized through
  datasets, privacy approval, labels, splits, or baseline promotion.

Highest-leverage next improvements:
1. Add an external project manifest and runtime-evidence policy contract.
2. Add a black-box execution owner for bounded target commands.
3. Add a canonical score object and evaluator descriptor catalog.
4. Add dataset, annotation, and split schemas before any LLM judge runner.
5. Add suite-level reporting and feedback-loop artifacts.

External-eval readiness: partially external. The repo is independent enough to
verify shared artifact contracts from outside a project boundary. It is not yet
independent enough to verify that a target project works from outside that
boundary.

## Reference Lens Used

The AI evals guide emphasizes that strong eval systems start from observability
and error analysis, then build code-based evaluators and validated LLM judges.
It treats traces, spans, tool calls, inputs, outputs, model metadata, latency,
cost, prompt versions, and feature flags as the substrate for evaluation. It
also warns that error analysis comes before automation, that objective checks
should be code, and that LLM judges need train/dev/test splits, ground truth,
TPR/TNR, confusion matrices, and bias correction before they can support
governance.

Lessons Learned in Software Testing adds the context-driven testing lens: a test
strategy must fit the mission, every test answers a question, tests are models,
confusion is signal, bug reports must be persuasive, severity and priority are
different, automation is software development, and status reports should give
decision-makers enough information rather than pretending to certify quality.

Applied to this repo, those references imply a clear target:
- Evals should remain project-agnostic and external.
- Each eval must declare the question it answers.
- Objective properties should be checked by code.
- Judgment-heavy properties may use judges only after validation.
- Failures should become taxonomy, root-cause evidence, regression cases, and
  feedback-loop work.
- Reports should explain risk and remaining uncertainty.

## External Eval Boundary Assessment

Current state: partially external.

The repo correctly says it is a shared contract verifier, not a behavior oracle:
`README.md:9` through `README.md:13` separate shared artifact/schema/scorer
proof from project-specific behavior, thresholds, CI, and baseline promotion.
`ARCHITECTURE.md:19` through `ARCHITECTURE.md:28` repeats the same boundary:
evals writes and validates local artifact bundles while project-local suites and
tests prove project behavior.

The strongest external boundary is `--repo-root`. `README.md:51` through
`README.md:63` documents external artifact inspection commands and states that
they do not execute consumer behavior, prove domain correctness, prove CI/PR
readiness, or promote baselines. `ARCHITECTURE.md:117` through
`ARCHITECTURE.md:126` makes this a code boundary: `--repo-root` is read-side
artifact authority only, not an adapter system, plugin hook, source-mining root,
or hidden permission to run consumer commands.

The current coupling risk is the opposite of ordinary over-coupling: the repo is
so careful not to execute or inspect target projects that it cannot yet act as
the requested independent verifier of target behavior. It can validate an
artifact packet from a consumer repo, but it cannot independently ask the target
project a question and score the observed answer.

Required boundary model:

| Mode | What evals may do | What evals must not claim |
| --- | --- | --- |
| Artifact-only external | Validate a consumer repo's existing `.harness/evals/runs/latest.json` bundle | Consumer behavior, CI, reviews, tracker state, mergeability |
| Black-box external | Execute declared target commands/API calls through a bounded manifest and score outputs | Internal code correctness or root cause unless evidence supports it |
| Gray-box external | Read declared source/artifact surfaces for context and evidence | Ownership of project internals, hidden source mining, or domain truth |
| White-box/internal | Should stay project-owned | External independent authority |

The repo currently supports the first row well and only scaffolds pieces of the
second and third rows.

## Overall Gradecard

| Area | Grade | Confidence | Notes |
|---|---:|---:|---|
| External Boundary | B- | High | Artifact-only boundary is clear; behavioral external authority is missing. |
| Evaluator Architecture | C | High | Deterministic scorer functions exist, but evaluator taxonomy is not first-class. |
| Scorer Architecture | C+ | High | Pass/fail scorer results and assertions exist; canonical score object lacks severity, priority, confidence, trace/span IDs, cost, latency, and rubric IDs. |
| Dataset Management | D | High | Fixtures and suites exist; no dataset registry, split, sampling, labels, or benchmark lifecycle. |
| Error Analysis Workflow | D+ | Medium | Assertion diagnostics help investigation; no open/axial coding or failure-taxonomy workflow. |
| LLM Judge Validation | F | High | Judges are explicitly advisory/blocked; no validation workflow exists. |
| Code-Based Evaluators | B | High | Schema, artifact, output, baseline, trace, and contract checks are executable. |
| RAG/Retrieval Evals | F | High | No retrieval schema, metrics, or evidence model. |
| Pipeline Evals | D | Medium | Trace events are lifecycle events, not stage-level pipeline scoring. |
| Multi-Turn Agent Evals | D | Medium | Runtime-evidence fixtures cover some agent-like events; no conversation/session model. |
| Production Monitoring | F | High | No online/offline production execution modes, alerts, or monitoring loop. |
| Reporting | C- | High | Run report exists; suite, trend, risk, release, and critic reports are missing. |
| Feedback Loop | D+ | Medium | State recommends commands; no root-cause/backlog/regression-case loop. |
| CI/CD Integration | C | High | `pnpm verify` exists; downstream machine-readable CI evidence is not emitted. |
| Project Adapter Model | D | High | Suite files are data contracts; external adapters are intentionally phase-blocked. |

## Gap Findings

### GAP-001: No Black-Box Target Execution Owner

Category: External boundary / execution

Evidence:
- `schemas/eval-case.schema.json:50` through `schemas/eval-case.schema.json:57`
  restrict input to one command enum: `simulate-pr-closeout`.
- `src/commands/run.js:183` builds a synthetic execution instead of spawning a
  target command.
- `src/lib/scoring.js:22` through `src/lib/scoring.js:36` hardcodes simulated
  output lines.

Why it matters: An external verifier must be able to ask a target system a
question from outside the project boundary. Current evals can validate the shape
of an expected synthetic proof, but it cannot independently observe target
behavior.

Risk: External readiness may be overstated if synthetic smoke proof is treated
as project behavior proof.

Recommended fix: Add a deep owner module such as `src/lib/external-execution.js`
that accepts a manifest-declared command, cwd policy, timeout, env policy,
stdin/payload, and artifact-write policy. Keep synthetic execution as one mode,
but add bounded black-box execution as a separate mode.

Priority: P0
Implementation difficulty: Medium
Validation method: Add a temp consumer repo fixture with a tiny executable CLI,
run `pnpm evals run <consumer>/.evals/suite.json --json`, and assert the
command log records actual stdout/stderr/exit code and bounded cwd.

### GAP-002: Missing Project Manifest Contract

Category: External contract / adapter model

Evidence:
- `schemas/suite.schema.json` exists, but the runtime uses suite identity,
  cases, scorer refs, baseline, and artifact policy without a project-level
  manifest.
- `README.md:27` through `README.md:31` says suite files are data contracts
  under a consumer repo's `.evals/` directory.
- `src/lib/suite-contract.js:64` through `src/lib/suite-contract.js:132`
  derives the evaluated repo root from the nearest `.evals` directory rather
  than a declared project manifest.

Why it matters: External evaluation needs a stable contract for project ID,
entrypoints, supported modes, trace locations, privacy class, fixture ownership,
runtime-evidence policy, and baseline authority.

Risk: Consumer projects may invent incompatible `.evals` conventions, making
cross-project comparison brittle.

Recommended fix: Add `schemas/project-manifest.schema.json` and a
`.evals/project.json` convention. The suite should point to the manifest or
inherit from it.

Priority: P0
Implementation difficulty: Medium
Validation method: Add schema tests plus a consumer temp repo test proving
missing/invalid manifest blocks behavioral external mode while artifact-only
inspection remains available.

### GAP-003: External Runtime-Evidence Policy Is Always Not Configured

Category: Governance / readiness

Evidence:
- `src/commands/validation.js:206` through `src/commands/validation.js:219`
  injects a failing `not_configured` runtime-evidence policy for external
  `--repo-root` checks.
- `README.md:201` through `README.md:206` explains that external roots remain
  fail/advisory until the repository has explicit runtime-evidence policy.
- `test/cli.test.js:368` through `test/cli.test.js:410` asserts this
  separation.

Why it matters: This is a good safety boundary, but it also means external
artifact consistency cannot become external readiness yet.

Risk: CI or agents may see many artifact checks pass and miss that readiness is
still blocked by missing policy.

Recommended fix: Add a consumer runtime-evidence policy schema with declared
families, enforcing scorers, scaffolded-not-enforced reasons, and readiness
rules.

Priority: P0
Implementation difficulty: Medium
Validation method: Add one fixture where policy is missing and readiness fails,
and one where explicit policy evidence allows readiness to pass.

### GAP-004: Evaluator Taxonomy Is Not First-Class

Category: Evaluator architecture

Evidence:
- `schemas/eval-case.schema.json:151` through `schemas/eval-case.schema.json:155`
  limits scorers to four built-in strings.
- `src/lib/scoring.js:55` through `src/lib/scoring.js:221` implements the
  deterministic scorer functions directly.
- `src/lib/suite-contract.js:51` through `src/lib/suite-contract.js:57`
  rejects executable scorer hooks, and `src/lib/suite-contract.js:104` through
  `src/lib/suite-contract.js:110` treats scorer refs mostly as data references.

Why it matters: A cross-project eval system needs to distinguish code-based
evaluators, LLM judges, human annotation evaluators, retrieval evaluators,
pipeline-state evaluators, multi-turn evaluators, safety evaluators, regression
evaluators, smoke evaluators, drift evaluators, cost/latency evaluators, and
governance evaluators.

Risk: Scorer growth will either overfit one schema enum or reintroduce hidden
executable hooks without lifecycle control.

Recommended fix: Add `schemas/evaluator.schema.json` and a data-only evaluator
catalog. The first version can describe built-in deterministic evaluators only.

Priority: P1
Implementation difficulty: Medium
Validation method: Validate the built-in evaluator catalog, then assert every
case scorer ID resolves to a catalog entry.

### GAP-005: Canonical Score Object Is Too Narrow

Category: Scorer architecture

Evidence:
- `schemas/scorer-result.schema.json:15` through
  `schemas/scorer-result.schema.json:22` requires scorer ID, version, pass/fail
  status, inputs inspected, evidence, and failure reason.
- It lacks project ID, run ID, case ID, trace ID, span ID, score type, severity,
  priority, confidence, evaluator version, model version, prompt version, cost,
  latency, and created timestamp.
- `schemas/score-vector.schema.json` has coverage, dimensions, gates, and
  readiness, but it is a proof-contract schema, not the per-evaluator canonical
  score object.

Why it matters: Decision support needs more than pass/fail. Lessons Learned in
Software Testing explicitly separates severity from priority; the AI evals guide
also needs confidence, judge versioning, and trace linkage.

Risk: Reports cannot rank fixes well, compare evaluator health, or explain why a
failure is severe but not urgent, or urgent but low severity.

Recommended fix: Add `schemas/score.schema.json` with the prompt's canonical
shape, then let `scorer-result` reference or embed it in a backward-compatible
way.

Priority: P1
Implementation difficulty: Medium
Validation method: Schema tests plus a smoke run assertion that scorer output can
be projected into canonical score objects.

### GAP-006: Dataset Lifecycle Is Missing

Category: Dataset and case management

Evidence:
- `fixtures/smoke/pr-closeout.case.json` and runtime-evidence fixtures exist.
- `schemas/eval-case.schema.json:21` through `schemas/eval-case.schema.json:40`
  captures fixture source and privacy.
- No `datasets/`, `annotations/`, `splits/`, or dataset registry exists in
  `rg --files`.

Why it matters: The AI evals guide expects diverse test queries, dimensional
sampling, train/dev/test splits, stratification, regression cases, and labeled
holdouts. A durable external suite needs reproducible datasets, not only
individual fixtures.

Risk: The suite can pass a few local fixtures while missing important classes of
project behavior.

Recommended fix: Add `schemas/dataset.schema.json` with dataset ID, project ID,
case refs, scenario dimensions, split assignment, provenance, privacy approval,
label status, and promotion status.

Priority: P0
Implementation difficulty: Medium
Validation method: Add one smoke dataset fixture and a `validate-schema dataset`
command.

### GAP-007: Error Analysis Workflow Is Not Operational

Category: Error analysis / feedback loop

Evidence:
- Assertion diagnostics exist in `src/lib/scoring.js` and
  `schemas/scorer-result.schema.json:23` through
  `schemas/scorer-result.schema.json:46`.
- `UBIQUITOUS_LANGUAGE.md` defines a local observability loop.
- There is no schema or workflow for open-coded notes, axial-code categories,
  failure taxonomy, frequency x severity ranking, theoretical saturation, or
  human review queues.

Why it matters: The AI evals guide says error analysis is more important than
LLM judges or dashboards. Lessons Learned treats confusion and investigation as
core testing work.

Risk: The project may automate known checks without discovering the next useful
checks.

Recommended fix: Add `schemas/error-analysis.schema.json` and a markdown/JSON
audit template for trace review sessions.

Priority: P1
Implementation difficulty: Low
Validation method: Validate one sample error-analysis packet that turns failed
assertions into taxonomy categories and candidate evaluators.

### GAP-008: LLM Judge Validation Is Absent

Category: LLM-as-judge / governance

Evidence:
- `README.md:97` says LLM judges advise until calibrated.
- `README.md:139` and `AGENTS.md:63` block required LLM judge gates in phase
  one.
- `test/schema.test.js:303` through `test/schema.test.js:308` rejects
  `llm-judge` in scenario-contract scorers.

Why it matters: The AI evals guide requires ground truth labels, train/dev/test
splits, stratification, TPR, TNR, precision, recall, confusion matrix, bias
correction, confidence intervals, prompt versioning, and model versioning before
a judge can support governance.

Risk: Without a validation path, the future first judge may become trusted by
habit rather than by evidence.

Recommended fix: Add judge contracts before judge execution: `judge.schema.json`,
`judge-validation.schema.json`, and `annotation.schema.json`. Keep every judge
status `UNVALIDATED JUDGE - not suitable for governance decisions` until the
validation artifact passes.

Priority: P1
Implementation difficulty: Medium
Validation method: Schema-only validation for a toy labeled dataset, with tests
that fail a judge validation artifact missing TPR/TNR or split provenance.

### GAP-009: Code-Based Evaluators Are Strong But Too Local

Category: Code-based evaluator support

Evidence:
- `pnpm evals check --json`, `check --smoke --json`, and
  `validate-schema` are documented in `README.md:33` through `README.md:75`.
- `src/commands/validation.js:146` through `src/commands/validation.js:204`
  validates latest artifacts, proof boundaries, smoke context, and runtime
  evidence coverage.
- `scripts/verify.js` runs deterministic gates.

Why it matters: Objective checks should be code. The current code-based checks
are a strength, but they mostly validate evals-owned artifacts rather than
target project behavior.

Risk: The repo may look mature because code checks are numerous, while the
external target behavior remains unobserved.

Recommended fix: After black-box execution exists, add built-in code evaluators
for CLI output JSON, required fields, prohibited patterns, artifact presence,
runtime-card fields, status lifecycle, PR evidence packets, latency, and cost.

Priority: P1
Implementation difficulty: Medium
Validation method: Add evaluator catalog entries and fixtures that prove each
objective rule catches a failing target output without an LLM judge.

### GAP-010: RAG and Retrieval Evaluation Have No Contract

Category: RAG / retrieval / evidence evaluation

Evidence:
- No schema or source path mentions Recall@K, MRR, citation correctness,
  retrieval result sets, document chunks, or query generation outside the review
  prompt and reference material.
- `schemas/evidence.schema.json` and claim/evidence contracts exist, but they
  do not model retrieval candidates, relevance labels, chunk IDs, or reciprocal
  rank.

Why it matters: Agent Skills, Codex memory, docs search, and codebase context
retrieval need evaluation that separates retrieval failure from generation
failure.

Risk: A future agent may blame model output when the real defect was missing or
misranked context.

Recommended fix: Add retrieval dataset and result schemas: query, expected
documents/chunks, retrieved candidates, rank, relevance labels, citation
evidence, Recall@K, MRR, and failure class.

Priority: P2
Implementation difficulty: Medium
Validation method: Validate a small static retrieval result fixture and compute
Recall@K/MRR deterministically.

### GAP-011: Pipeline Stage Evaluation Is Not Modeled

Category: Multi-step pipeline evaluation

Evidence:
- `schemas/trace-event.schema.json:24` through
  `schemas/trace-event.schema.json:34` models run lifecycle events, not project
  pipeline stages.
- `schemas/eval-case.schema.json` has no stage graph, stage inputs, stage
  outputs, or stage-level scorers.

Why it matters: Coding Harness and Agent Skills workflows often look like
plan -> route -> execute -> observe -> verify -> recover -> report. An external
suite needs to score stage behavior and identify bottlenecks.

Risk: End-to-end pass/fail hides which stage caused the defect.

Recommended fix: Add `pipeline-run.schema.json` and `pipeline-stage.schema.json`
with stage ID, input refs, output refs, span refs, evaluator refs, and failure
taxonomy.

Priority: P2
Implementation difficulty: Medium
Validation method: Static fixture where one stage fails and the report attributes
the failure to that stage.

### GAP-012: Multi-Turn Agent Evaluation Is Not Modeled

Category: Multi-turn / long-running agents

Evidence:
- Runtime-evidence fixtures cover permission fallback, plugin attribution, and
  subagent artifact obligations.
- No schema models conversations, turns, context carry-forward, steering events,
  interruptions, resume packets, contradictions, stale-state use, or escalation.

Why it matters: Codex-style workflows need evaluation of memory, recovery,
review convergence, false success, repeated steering, and stop/escalation
behavior.

Risk: The suite may validate artifact shape while missing the agent failure
classes Jamie most cares about.

Recommended fix: Add a `session-eval-case.schema.json` with turn sequence,
state snapshots, tool calls, user steering, expected retention, expected
escalation, and outcome criteria.

Priority: P1
Implementation difficulty: High
Validation method: Use a small recorded synthetic session with one contradiction
and one recovery case; score with code-based checks first.

### GAP-013: Production Monitoring And Guardrails Are Missing

Category: Production evals / guardrails

Evidence:
- Phase one blocks cloud runners and telemetry as authority in
  `README.md:129` through `README.md:141`.
- No execution modes exist for offline batch, CI, pre-merge, post-merge,
  scheduled, production monitoring, or real-time guardrail mode.

Why it matters: Production evals need online/offline separation, safety checks,
guardrails, degradation alerts, and clear blocking rules for merge, release,
deployment, autonomous continuation, and judge promotion.

Risk: The project may remain useful locally but fail to provide ecosystem-level
quality signals.

Recommended fix: Define execution modes as data contracts before adding
services: `offline_batch`, `ci`, `pre_merge`, `post_merge`,
`scheduled_monitor`, and `guardrail_advisory`.

Priority: P2
Implementation difficulty: Medium
Validation method: Schema tests and state output that reports mode, authority,
blocking policy, and unsupported modes explicitly.

### GAP-014: Reporting Is Not Yet Decision Support

Category: Reporting / status

Evidence:
- `src/lib/report.js` emits a per-run markdown report and explicitly states no
  LLM judge participates in the smoke decision.
- `README.md:158` through `README.md:187` documents local artifacts and state
  packets.
- No suite summary, score trend, evaluator health report, judge validation
  report, safety report, project comparison report, release readiness report, or
  critic-risk report is emitted by normal runs.

Why it matters: Lessons Learned says status reports should use multiple
independent coverage measures and explain risk, not certify quality from one
number.

Risk: A run report can answer "what happened in this run" but not "what should a
decision-maker do next."

Recommended fix: Add `report.schema.json` and a suite-level report artifact
with top failure modes, severity, priority, confidence, evidence, recommended
actions, and "10 worst things critics might say."

Priority: P1
Implementation difficulty: Medium
Validation method: Run a multi-case suite and assert the suite report includes
failure aggregation and separate severity/priority fields.

### GAP-015: Feedback Loop Does Not Create Regression Cases Or Backlog Items

Category: Closing the loop

Evidence:
- `src/commands/state.js` prints state and recommended commands but does not
  mutate backlog, fixtures, baselines, or issue trackers.
- `README.md:179` through `README.md:187` says the state packet classifies
  proof surfaces and names next validation commands.

Why it matters: The evals guide's loop is eval result -> root cause ->
improvement -> regression case -> permanent suite. Current evals stops at
evidence and recommendation.

Risk: The same failure class can recur without becoming durable suite coverage.

Recommended fix: Add a feedback artifact, not automatic mutation first:
`feedback-item.schema.json` with failure ID, root-cause hypothesis, evidence
refs, proposed fix owner, regression-case proposal, tracker status, and rerun
command.

Priority: P1
Implementation difficulty: Low
Validation method: Convert one failing scorer result into a feedback-item
fixture and validate it with schema plus semantic checks.

## Recommended Project Structure

Recommended structure after the next two phases:

```text
src/
  cli/
    commands/
  core/
    execution/
    paths/
    schemas/
  adapters/
    README.md
  datasets/
    dataset-contract.js
    split-contract.js
  evaluators/
    catalog.js
    code-based/
    judge/
    human/
  scorers/
    score-object.js
    deterministic/
  judges/
    validation-contract.js
    prompts/
  rubrics/
    rubric-contract.js
  experiments/
    experiment-contract.js
  reports/
    run-report.js
    suite-report.js
    readiness-report.js
  traces/
    trace-input-contract.js
    span-contract.js
  annotations/
    annotation-contract.js
  regression/
    regression-case-contract.js
  safety/
    safety-policy-contract.js
  rag/
    retrieval-result-contract.js
    metrics.js
  pipelines/
    pipeline-run-contract.js
  conversations/
    session-eval-contract.js
  integrations/
    github/
    ci/
  telemetry/
    telemetry-input-contract.js
  governance/
    runtime-evidence-policy.js
schemas/
  project-manifest.schema.json
  evaluator.schema.json
  score.schema.json
  dataset.schema.json
  annotation.schema.json
  judge.schema.json
  judge-validation.schema.json
  trace-input.schema.json
  pipeline-run.schema.json
  session-eval-case.schema.json
  feedback-item.schema.json
fixtures/
  smoke/
  datasets/
  annotations/
  retrieval/
  pipelines/
  conversations/
  feedback/
examples/
  consumer-project/
  coding-harness/
  agent-skills/
docs/
  external-contract.md
  judge-validation.md
  dataset-lifecycle.md
.harness/
  research/audits/
  evals/runs/
```

Ownership:
- `src/core` owns local path, artifact, schema, and execution primitives.
- `src/evaluators` owns evaluator catalog and type-specific evaluator rules.
- `src/scorers` owns score projection and deterministic verdicts.
- `src/datasets` and `src/annotations` own dataset lifecycle and labels.
- `src/reports` owns human and machine-readable decision support.
- `src/governance` owns blocking policy and readiness boundaries.

Generated files:
- Run bundles remain under `.harness/evals/runs/`.
- Review/audit artifacts remain under `.harness/research/audits/`.
- Consumer project output remains in the consumer repo unless explicitly copied
  as cited proof.

Test strategy:
- Schema tests for every new contract.
- One temp consumer repo test per external mode.
- Golden failure fixtures for each failure taxonomy category.
- Regression tests that prove local artifact proof is not confused with
  CI/review/tracker/merge readiness.

## Canonical Contracts To Add

| Contract | Purpose | First useful fields |
| --- | --- | --- |
| project manifest | Declares target project identity and safe evaluation surfaces | project_id, repo_root_policy, entrypoints, trace_paths, privacy class, runtime-evidence policy ref |
| eval suite manifest | Groups cases, datasets, evaluators, baselines, and reports | suite_id, project_id, cases, datasets, evaluator_refs, artifact_policy |
| eval case | Already exists; extend for real execution and stage/session cases | question_answered, execution_mode, target_command_ref, expected evidence |
| evaluator | First-class evaluator catalog entry | evaluator_id, type, version, input_contract, output_contract, authority |
| scorer | Canonical score projection | score_type, label, severity, priority, confidence, evidence refs |
| judge | LLM judge definition | judge_id, prompt_version, model_version, rubric_id, output_schema |
| annotation | Human or high-quality label | labeler_id, label, rationale, split, adjudication status |
| trace input | External trace/span ingestion | trace_id, span_id, tool_calls, model metadata, cost, latency |
| eval run | Execution envelope | run_id, project_id, suite_id, mode, started_at, finished_at, artifact refs |
| eval result | Current result plus external score projection | verdict, score refs, failure taxonomy, readiness claims |
| report | Decision support artifact | audience, risks, top failures, severity, priority, confidence, recommended actions |
| regression case | Permanent case from a failure | source_failure_id, root cause, fix ref, recurrence guard |
| adapter | Optional future adapter leaf | adapter_id, provider, input mapping, output mapping, canonical schema version |

## What Should Be Internal vs External

| Responsibility | Project Internal | ~/dev/evals External |
|---|---|---|
| Unit tests | yes | no |
| Integration tests | yes | no, except black-box probes by contract |
| Trace emission | yes | consumes and validates declared trace shape |
| Eval scoring | project-specific scoring may exist | yes, for independent scoring contracts |
| Judge validation | may label domain truth | yes, validates judge behavior before governance use |
| Regression cases | yes, for local bugs | yes, for cross-project or external-verifier failures |
| Safety checks | yes, product-specific | yes, for external guardrail and policy evidence |
| Release readiness | owns release decision | provides evidence and risk, does not certify alone |
| Project-specific fixtures | yes | consumes declared fixtures, does not invent domain truth |
| Cross-project benchmarks | participates | owns benchmark contract, scoring, reporting |
| CI status | yes | records as evidence only when current |
| Review/tracker state | yes | records as evidence only when current |
| Baseline promotion | yes, owner-approved | verifies promotion evidence and drift boundaries |

## Highest-Leverage Implementation Roadmap

### 1. Add Project Manifest And Runtime-Evidence Policy

WHAT: Add `.evals/project.json` plus schemas for project manifest and runtime
evidence policy.

WHY: External readiness cannot move beyond advisory artifact consistency without
a declared consumer boundary.

HOW: Keep it data-only. Require project ID, allowed eval modes, artifact root,
trace sources, privacy class, and runtime-evidence families.

WHERE: `schemas/project-manifest.schema.json`, `src/lib/project-manifest.js`,
`test/cli.test.js`.

VALIDATION: `pnpm evals validate-schema project-manifest <file> --json` and a
temp consumer repo test.

PRIORITY: P0

### 2. Add Bounded Black-Box Execution

WHAT: Add a real execution owner that can run declared target commands safely.

WHY: External authority requires independent observation of target behavior.

HOW: Separate synthetic, artifact-only, and black-box modes. Record cwd, command,
env policy, timeout, stdout, stderr, exit code, latency, and failure class.

WHERE: `src/lib/external-execution.js`, `src/commands/run.js`,
`schemas/eval-case.schema.json`, `schemas/command-log.schema.json`.

VALIDATION: Temp CLI fixture with passing and failing target commands.

PRIORITY: P0

### 3. Add Evaluator Catalog And Canonical Score Object

WHAT: Make evaluator and score contracts first-class.

WHY: Scorer growth needs metadata, authority, severity, priority, confidence,
rubric IDs, and trace/span links.

HOW: Introduce data-only evaluator descriptors and score projection.

WHERE: `schemas/evaluator.schema.json`, `schemas/score.schema.json`,
`src/lib/evaluator-catalog.js`, `src/lib/score-object.js`.

VALIDATION: Every scorer in a case resolves to a catalog entry and emits a score
projection.

PRIORITY: P1

### 4. Add Dataset, Annotation, And Split Contracts

WHAT: Introduce dataset registry, labels, splits, and sampling metadata.

WHY: Error analysis, judge validation, and benchmark confidence need labeled and
versioned data.

HOW: Start with schema-only fixtures and no LLM execution.

WHERE: `schemas/dataset.schema.json`, `schemas/annotation.schema.json`,
`fixtures/datasets/`, `fixtures/annotations/`.

VALIDATION: Validate a small dataset with stratified split metadata.

PRIORITY: P1

### 5. Add Suite-Level Decision Reports And Feedback Items

WHAT: Emit suite report and feedback-item artifacts from failed eval runs.

WHY: Decision-makers need risk, top failures, recommended action, and regression
case proposals.

HOW: Aggregate case scores and failed assertions into report and feedback
schemas.

WHERE: `src/reports/`, `schemas/report.schema.json`,
`schemas/feedback-item.schema.json`.

VALIDATION: Multi-case suite fixture with at least one failure and one generated
feedback item.

PRIORITY: P1

## 30 / 60 / 90 Day Plan

### First 30 Days - External Boundary And Core Schemas

Deliverables:
- Project manifest schema.
- Runtime-evidence policy schema.
- Canonical score schema.
- Evaluator catalog schema for current deterministic evaluators.
- Updated README/ARCHITECTURE boundary language for artifact-only vs black-box.

Acceptance criteria:
- A consumer temp repo can declare `.evals/project.json`.
- `check/state --repo-root` can distinguish missing policy from present policy.
- Current smoke artifacts still validate.
- No dashboards, adapters, cloud runners, plugin systems, or judge gates added.

Validation commands:
- `pnpm test`
- `pnpm evals validate-schema project-manifest fixtures/... --json`
- `pnpm evals check --smoke --json`

Risks:
- Schema churn could break current proof bundles.
- Manifest semantics could accidentally claim project truth.

Dependencies:
- Agreement on the first consumer project manifest shape.

### Days 31-60 - Evaluators, Scorers, Datasets, Reports

Deliverables:
- Bounded black-box execution owner.
- Deterministic evaluator catalog.
- Dataset and annotation schemas.
- Suite-level report schema.
- Feedback-item schema.

Acceptance criteria:
- A target command can be executed and scored without importing target code.
- Objective checks are code-based.
- Dataset fixture includes split and provenance metadata.
- Suite report separates severity, priority, confidence, evidence, and action.

Validation commands:
- `pnpm test`
- `pnpm evals run examples/consumer-project/.evals/suite.json --json`
- `pnpm evals check --repo-root examples/consumer-project --json`

Risks:
- Black-box execution can create sandbox and permission complexity.
- Reports can become decorative unless grounded in score artifacts.

Dependencies:
- Project manifest from first 30 days.
- Clear command permission policy.

### Days 61-90 - Judge Validation, Replay, Monitoring, Feedback Loops

Deliverables:
- Judge definition schema.
- Judge validation artifact schema with train/dev/test, TPR/TNR, confusion
  matrix, and prompt/model versions.
- Pipeline-stage and multi-turn session eval schemas.
- Retrieval metric fixture for Recall@K and MRR.
- Scheduled/offline/CI mode metadata.

Acceptance criteria:
- Any judge without validation is labeled `UNVALIDATED JUDGE - not suitable for
  governance decisions`.
- Pipeline fixture can localize a failure to one stage.
- Multi-turn fixture can score retention or contradiction with code-based checks.
- Feedback artifacts can propose regression cases without mutating target repos.

Validation commands:
- `pnpm test`
- `pnpm evals validate-schema judge-validation fixtures/... --json`
- `pnpm evals validate-schema pipeline-run fixtures/... --json`
- `pnpm verify`

Risks:
- Judge workflows may be promoted too early.
- Monitoring mode may drift into dashboards before trace/evidence quality.

Dependencies:
- Labeled dataset fixtures.
- Human annotation ownership decision.
- At least one consumer project willing to emit trace/session evidence.

## Bottom Line

The project is structurally pointed in the right direction because it already
protects the most important trust boundary: external eval artifacts are not the
same thing as project truth. That is the right instinct.

The next maturity jump is not "more tests" and not "add a judge." The next
jump is to make externality executable: project manifest, runtime-evidence
policy, bounded black-box execution, evaluator catalog, canonical score object,
dataset/annotation lifecycle, and reports that turn failures into decisions and
regression cases.

Until those exist, classify /Users/jamiecraik/dev/evals as a strong local
proof-contract spine and an early external artifact inspector, not yet a durable
independent evaluation authority for multiple projects.
