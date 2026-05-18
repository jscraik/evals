# Evals Architecture Review

Date: 2026-05-18
Repository: `/Users/jamiecraik/dev/evals`
Review artifact: `.harness/review/2026-05-18-evals-architecture-review.md`
Reviewer posture: multi-disciplinary architecture, skill, plugin, and moat audit
Primary evidence: seed repository contents plus adjacent `coding-harness` and
`agent-skills` evidence

## Evidence Boundary

Hard fact: this repository currently contains exactly one tracked-intent style
file:

- `.harness/features/2026-05-18-evals-intent.md`

Hard fact: there is no package manifest, source tree, test suite, CI config,
schema directory, plugin system, skill implementation, runner, telemetry code,
or git metadata in `/Users/jamiecraik/dev/evals` at review time.

Interpretation: this review is therefore an architecture cognition audit of a
seed architecture, not a conventional codebase review. Claims about implemented
runtime behavior are marked as absent. Claims about strategic fit are grounded
in the seed intent file and nearby implementation evidence from
`coding-harness` and `agent-skills`.

## 1. Executive Summary

The project is coherent as a strategy and almost nonexistent as an
implementation. That is not a problem yet. It becomes a problem only if the
repo starts accumulating framework adapters, prompt documents, dashboards, or
judge recipes before it has a tiny command-backed local runner and two real
regression suites.

The strongest architectural idea is correct: `evals` should own shared eval
mechanics while repo-local suites own domain truth. That is a deep boundary.
It compresses the most dangerous complexity: the tendency for a central eval
project to become a second governance system.

The weakest part is also obvious: the repo has no executable spine. The current
moat is only a thesis. It becomes real only when real-regression fixtures begin
to accumulate and agents can replay them locally.

Direct assessment:

- Coherence: high at the intent level, unproven at implementation level.
- Pragmatism: strong if the first slice stays local, deterministic, and small.
- Complexity risk: high if external framework mining happens before schema and
  runner proof.
- Agent-native quality: conceptually strong; operationally absent until CLI,
  manifests, artifacts, and replay exist.
- Moat: not technical yet. The potential moat is operational memory encoded as
  high-quality fixtures, not the eval runner.

## 2. Architectural Risk Assessment

### P0 Risk: Architecture Without Execution

Fact: the repo has no implementation beyond `.harness/features/2026-05-18-evals-intent.md`.

Impact: every architectural claim is currently unenforced. The document says
artifacts decide, but no artifact writer exists. It says deterministic checks
should decide required gates, but no scorer exists. It says external frameworks
must be adapters, but no adapter boundary exists.

Recommendation: the next change must be executable infrastructure, not more
strategy. Add a minimal schema, command runner, deterministic scorer, and one
local report artifact before any external-source mining.

### P1 Risk: Framework Gravity

Fact: the intent file lists many external sources: `openevals`,
`autoevals`, `deepeval`, `openai/evals`, `fasteval`, Braintrust recipes,
LLM judge references, and prompt-engineering guides.

Interpretation: this is useful as a mining map but dangerous as an
implementation backlog. Each source carries its own data model and worldview.

Recommendation: create `schemas/eval-result.schema.json` before adding any
adapter. Block any adapter that returns framework-native results without
normalizing into the canonical result.

### P1 Risk: Judge Policy Before Calibration

Fact: the intent file correctly says LLM judges are advisory until calibrated.
Adjacent `agent-skills` artifacts show historical judge metadata such as
`judge_mode`, `rubric_version`, `evaluator_version`, `prompt_hash`, and
`run_id`.

Impact: the repo has a real precedent for judge-scored iteration, but not yet a
calibration gate.

Recommendation: implement judge metadata and calibration status early, but do
not implement any required LLM judge gate until deterministic suites exist.

### P2 Risk: Governance Drift Into Ceremony

Fact: the seed intent artifact is long, careful, and governance-heavy. The repo
itself has no runner.

Impact: the architecture can easily become impressive documentation around
nothing. That would violate both Pragmatic Programmer tracer-bullet thinking and
XP feedback-loop discipline.

Recommendation: keep this review and the intent file, then stop writing
strategic docs until the first executable proof exists.

## 3. Repository Cognition Review

The repository cognition is currently excellent for strategic orientation and
poor for operational execution.

Strengths:

- The intent artifact states non-goals clearly.
- It separates facts, interpretations, and missing capabilities.
- It names stable interfaces before code exists.
- It creates drift signals and merge-blocking rules.
- It explicitly prevents framework lock-in.

Weaknesses:

- There is no `README.md` for a first-time human.
- There is no `AGENTS.md` for a first-time coding agent.
- There is no package manifest, command list, or validation entrypoint.
- There is no machine-readable schema to enforce the doctrine.
- The only source of truth is prose.

Pragmatic Programmer lens: the repo has the right map, but no tracer bullet.
The next commit should be a walking skeleton: one command, one fixture, one
result, one report.

Philosophy of Software Design lens: the current module is shallow because it is
only a document. It is not bad shallow; it is seed shallow. It becomes bad if
more documents wrap it before implementation.

## 4. Complexity Audit

### Intentional Complexity

The following complexity is justified:

- separating shared runtime from repo-local suites;
- artifact bundles as canonical proof;
- status taxonomy beyond pass/fail;
- deterministic gates versus advisory judges;
- fixture provenance and privacy labels;
- baseline/current comparison;
- prompt-injection and untrusted-content cases;
- optional OTEL tracing.

Why: these are the failure modes that make agent-operation evals different from
generic answer evals.

### Accidental Complexity Pressure

The following complexity would be accidental if implemented before the first
two suites:

- plugin architecture;
- dashboard;
- multi-framework adapter set;
- cloud runner;
- generic dataset registry;
- all-purpose scoring model;
- large prompt/rubric library;
- release notes and issue judging before command behavior proof.

Why: these do not reduce the uncertainty of the core thesis. They increase
surface area before the repo knows whether its canonical case shape is right.

## 5. Deep vs Shallow Module Analysis

No code modules exist yet, so this section evaluates proposed modules from the
intent file.

### Deep Proposed Modules

`schemas/*` can be deep if it encodes ownership, evidence, blocker classes,
artifact references, judge metadata, and baseline deltas behind a small stable
interface. This should be core.

`runner/command-case-runner` can be deep if it hides process execution,
timeout handling, environment capture, stdout/stderr capture, and artifact
writing behind a simple `run case -> result bundle` interface.

`baseline-compare` can be deep if it prevents every suite from inventing its
own regression semantics.

`artifact-writer` can be deep if it standardizes durable proof and protects
against mailbox-only completion claims.

### Shallow Proposed Modules

`adapters/openevals`, `adapters/autoevals`, and `adapters/deepeval` will
be shallow if they only translate names and pass through framework objects.
They become useful only if they normalize into the canonical schema and hide
dependency churn.

`report-writer` is shallow if it just pretty-prints JSON. It becomes deep if
it consistently separates hard evidence, interpretation, speculation, blockers,
and next safe action.

`telemetry/braintrust-exporter` is shallow if it merely forwards spans. It
becomes deep only if it enforces redaction, hash references, and the rule that
telemetry explains but does not decide.

### Fake Modularity To Avoid

Do not create separate modules for every external framework before there is a
stable evaluator adapter interface. That is fake modularity: many folders, no
compressed complexity.

## 6. Domain Integrity Review

The domain language is unusually strong for a seed repo because it borrows from
adjacent mature surfaces.

Verified adjacent evidence:

- `agent-skills/UBIQUITOUS_LANGUAGE.md` defines `Release-Readiness Claim`,
  `Strict Skill Audit`, `Repeated Error Research Gate`, `Durable Surface`,
  `Environment Refinement`, `Diagnostic Debt Classification`, and
  `CTF Workflow Eval`.
- `coding-harness/.harness/README.md` defines authority levels and admission
  rules for `.harness` artifacts.
- `coding-harness/package.json` exposes validation language through scripts
  such as `test:evals`, `test:artifacts:evals`, `quality:self-affirming`,
  and `docs:steering:guard`.

Interpretation: the `evals` bounded context should be:

- Eval Runtime Contract;
- Eval Case;
- Eval Result;
- Artifact Bundle;
- Scorer;
- Judge;
- Suite;
- Fixture;
- Baseline;
- Drift Signal;
- Promotion Stage.

It should not absorb:

- `coding-harness` PR closeout domain;
- `agent-skills` skill readiness domain;
- Linear ownership;
- GitHub review-state semantics;
- skill/plugin lifecycle rules.

DDD assessment: the intended bounded context is sound. The risk is context
leakage. The first implementation must make ownership explicit in schemas:
`owner_repo`, `owner_surface`, `suite_id`, `fixture_source`, and
`failure_owner`.

## 7. Skill/Plugin Architecture Review

There is no skill or plugin architecture in `evals` yet.

Adjacent evidence indicates what the repo must interoperate with:

- `agent-skills` has canonical skill sources, runtime projections, generated
  command handles, strict skill audit, external skill intake, and plugin eval
  surfaces.
- `coding-harness` packages an agent-facing skill under
  `.agents/skills/coding-harness` according to `package.json`.

Architectural recommendation:

- Do not make `evals` a skill/plugin authoring system.
- Do not duplicate `agent-skills` lifecycle concepts.
- Provide a small adapter contract so `agent-skills` can call the eval runtime
  for skill-readiness suites.
- Keep skill/plugin-specific fixtures and commands in `agent-skills`.

Complexity detector: if `evals` starts containing skill installer logic,
projection logic, or plugin packaging rules, it has crossed the bounded context.

## 8. Agent-Native Capability Review

The intended architecture is genuinely agent-native in concept because it is
not just AI-themed prose. It names machine-readable contracts, local replay,
artifact proof, blocker classes, ownership surfaces, and drift signals.

Current capability is absent because there is no:

- `AGENTS.md`;
- CLI;
- manifest;
- schema;
- fixture;
- local command;
- validation script;
- example artifact bundle.

Agent-native benchmark:

An agent entering this repo should be able to run:

```bash
pnpm evals run --suite smoke --json
```

or an equivalent command and receive:

- exact case outcomes;
- artifact paths;
- blocker classes;
- baseline deltas;
- advisory judge labels;
- next safe action.

Until that exists, agent-native status is aspirational.

## 9. Governance & Workflow Review

The seed intent file imports the right governance ideas:

- local-first proof;
- repo-local ownership;
- deterministic required gates;
- advisory judge promotion;
- merge-blocking rules;
- drift detection.

This is good governance. It becomes bad governance if it is not executable.

XP lens: feedback is currently slow because the only feedback loop is human
review of a document. The repo needs a fast red/green loop immediately.

Recommended workflow:

1. Add minimal package and schema validation.
2. Add one fixture and expected result.
3. Add one command runner.
4. Add one report writer.
5. Run in local CI or a local script.
6. Only then mine external frameworks.

## 10. Refactor Recommendations

There is no implementation to refactor, so these are pre-refactor seams.

Create these seams immediately:

- `src/schema` or `schemas`: no external imports except validator tooling.
- `src/runner`: process execution and artifact capture.
- `src/scorers`: deterministic scorers only.
- `src/reporters`: markdown and JSON report writers.
- `src/telemetry`: local trace writer first, optional exporters later.
- `adapters/*`: external framework adapters, never imported by core runner
  unless explicitly configured.
- `fixtures/smoke`: tiny repo-local examples.

Five Lines of Code lens: avoid nested branching in the runner by making each
step explicit and composable:

```text
load case -> prepare workspace -> run command -> capture artifacts -> score ->
compare baseline -> write bundle -> emit report
```

Each step should be testable alone. Do not build one giant orchestrator.

## 11. Anti-Patterns Identified

Present anti-patterns:

- Documentation-only architecture.
- No executable tracer bullet.
- No local validation command.

Potential anti-patterns called out by the intent file:

- framework-native schema takeover;
- dashboard-first development;
- cloud-only proof;
- LLM judge required gates without calibration;
- universal agent quality score;
- prompt growth replacing harness improvement;
- centralized domain truth;
- synthetic fixtures promoted before real-regression fixtures;
- telemetry as proof rather than explanation.

## 12. Drift Risks

Highest-risk drift signals:

- `evals` owns `coding-harness` or `agent-skills` domain semantics.
- Multiple result schemas appear.
- External adapter output bypasses canonical result schema.
- Required gates depend on LLM judges before calibration.
- Artifact bundle is optional.
- Braintrust or another cloud surface becomes the only source of truth.
- Prompt-engineering docs grow without reliability deltas.
- New suites test final prose rather than action traces and evidence.

Severity: high. These should become merge-blocking rules once implementation
exists.

## 13. Technical Debt Hotspots

Current debt:

- no git repository metadata;
- no package manifest;
- no README;
- no AGENTS.md;
- no schemas;
- no source;
- no tests;
- no CI;
- no validation command;
- no example case;
- no artifact bundle.

This is acceptable only because the repo is newly seeded. It stops being
acceptable after the next implementation slice.

Strategic debt:

- external source list is not audited live;
- Braintrust recipes are not archived or summarized in repo-local research;
- no decision record yet for TypeScript versus Python runner ownership;
- no redaction policy;
- no calibration policy artifact separate from the intent file.

## 14. Strategic Review

What I actually think:

The idea is good, but only because it is narrower than "build an evals
platform." The useful product is an evidence regression system for agent
operations. That is a real problem. The generic eval platform market is already
crowded and not where the differentiation is.

The architecture is pragmatic if the repo stays boring. Boring means schemas,
local files, deterministic scorers, command runners, and artifact bundles. The
moment it becomes a tour of every eval library, it loses the plot.

The complexity is justified only if it is paid for by real failures. Do not add
abstractions because a framework suggests them. Add abstractions when the same
failure pattern appears in at least two suites or two repos.

The governance helps because this problem is governance-shaped: agents need to
know what counts as proof. But governance will slow everything down if it stays
in prose. Every durable rule should eventually become a schema field, scorer,
fixture, validator, or merge gate.

Smallest compelling version:

- `evals run fixtures/smoke/pr-closeout.json --json`;
- writes `artifacts/evals/<run-id>/result.json`;
- writes `report.md`;
- proves an artifact exists;
- classifies a blocker;
- compares a baseline;
- exits nonzero on regression.

If the project fails, it will fail from abstraction appetite. If it succeeds,
it will succeed because it makes agent mistakes concrete, replayable, and hard
to repeat.

## 15. Recommended Simplifications

Simplify now:

- One runtime language first.
- One case format.
- One result schema.
- One artifact layout.
- One smoke command.
- Two first suites only.
- Deterministic scorers only in the first implementation.

Defer:

- Braintrust export;
- LangChain/OpenEvals adapter;
- DeepEval adapter;
- OpenAI Evals adapter;
- release-note judging;
- GitHub issue judging;
- private holdout runner;
- dashboard;
- cloud execution.

## 16. Recommended Deletions

Nothing in the seed repo should be deleted.

Delete from the roadmap if they appear before the first executable proof:

- dashboard;
- universal agent quality score;
- framework-native canonical schema;
- cloud-only proof path;
- required LLM judge;
- generic prompt library;
- multi-adapter implementation sprint;
- skill/plugin lifecycle duplication.

## 17. Recommended Core Investments

Invest first in:

1. `schemas/eval-case.schema.json`
2. `schemas/eval-result.schema.json`
3. `schemas/artifact-manifest.schema.json`
4. `src/runner/command-case-runner.ts`
5. `src/scorers/artifact-exists.ts`
6. `src/scorers/json-schema.ts`
7. `src/scorers/exit-code.ts`
8. `src/baseline/compare.ts`
9. `src/reporters/markdown.ts`
10. one smoke fixture
11. one CLI command
12. one test file proving the runner writes artifacts

## 18. Long-Term Scalability Risks

- Fixture corpus becomes large but low quality.
- Holdout cases rot because they are not visible in daily work.
- Each repo invents local exceptions and weakens shared schema.
- Adapter count grows faster than core usage.
- Judge rubrics become hard to reason about.
- Telemetry volume leaks private information or becomes expensive.
- PR gates become slow, so teams bypass them.
- Governance vocabulary diverges from implementation.

Mitigation: keep a hard distinction between smoke, nightly, release, and
manual lanes. Make every required gate cheap, local, and deterministic unless
explicitly promoted.

## 19. Moat Analysis

### What Is The Actual Moat?

The actual moat is not the eval runner. A smaller competitor can build a runner
quickly.

The moat is a curated corpus of real-regression agent-operation fixtures plus
the discipline to keep those fixtures tied to repo-native proof. That corpus
can encode hard-won lessons about PR closeout, skill readiness, steering uptake,
prompt injection, release-note truthfulness, issue actionability, and workflow
artifact quality.

### Is The Moat Durable?

Potentially, yes. It compounds if every real failure becomes a fixture and each
fixture is replayable. It is not durable if fixtures are synthetic, vague, or
only evaluate final prose.

### Is The Moat Measurable?

It can be measurable through:

- repeated-failure recurrence rate;
- eval pass rate by suite;
- regression catch rate;
- fixture provenance mix;
- time-to-diagnose failures;
- PR closeout false-positive rate;
- agent correction recurrence;
- holdout failure rate before release.

### Is The Moat Merely Complexity?

Currently, yes: at seed stage, the moat is only complexity and intent. It
becomes real only after the repo accumulates high-signal fixtures and proves
they prevent repeat failures.

### Could A Smaller Competitor Rebuild This Quickly?

They could rebuild the runner quickly. They could not quickly rebuild the
operational fixture corpus if that corpus is grounded in real failure evidence.

### Which Parts Are Strategically Defensible?

- real-regression fixtures;
- blocker taxonomy;
- repo-local ownership discipline;
- calibrated judge examples;
- prompt-injection cases from real workflow surfaces;
- evidence-to-workflow artifact evals;
- integration with actual agent operating loops.

### Which Parts Only Feel Sophisticated?

- dashboards;
- many adapters;
- judge scores without calibration;
- prompt libraries;
- generic benchmark claims;
- elaborate schema sets before a runner exists.

### What Should Be Aggressively Protected?

Protect local replay, artifact proof, fixture provenance, redaction discipline,
owner surfaces, and the rule that domain truth lives in owning repos.

### What Should Be Simplified Because It Weakens The Moat?

Simplify any abstraction that increases setup cost without improving repeat
failure prevention. Complexity that does not turn into fixtures, gates, or
diagnostic clarity weakens the moat.

### What Moat Assumptions Are Likely False?

False assumption: technical sophistication is a moat.

False assumption: adopting many eval frameworks creates defensibility.

False assumption: LLM judge quality is the differentiator.

False assumption: a central eval repo can understand every repo's domain better
than the owning repo.

### If This Succeeds, Why Will Competitors Struggle?

Competitors will struggle only if the fixture corpus and operational taxonomy
compound. They will not struggle against the CLI or schemas alone.

### If Competitors Catch Up Quickly, Why?

They will catch up quickly if this repo stays a thin wrapper around public eval
libraries or if its fixtures are generic. Public frameworks plus shallow tests
are easy to copy.

## 20. Competitive Replication Risk

Replication risk is high for the tooling layer and low-to-medium for the
operational corpus if built well.

High replication risk:

- schemas;
- CLI runner;
- artifact writer;
- markdown reporter;
- OTEL export;
- external adapters.

Lower replication risk:

- curated real-regression cases;
- local governance integration;
- domain-specific closeout and skill-readiness suites;
- private holdouts;
- calibrated judge examples;
- trust built from catching real failures.

Strategic recommendation: spend less energy making the runner clever and more
energy making fixture capture, provenance, and replay excellent.

## 21. Evidence & Traceability Matrix

| Conclusion | Evidence category | Evidence | Affected files/modules | Architectural impact | Confidence | Why it matters |
| --- | --- | --- | --- | --- | --- | --- |
| The repo is a seed, not an implementation | source/repo structure | `find /Users/jamiecraik/dev/evals -maxdepth 5 -type f` returned only the intent file | `.harness/features/2026-05-18-evals-intent.md` | Review must assess intended architecture, not nonexistent code | High | Prevents hallucinated capabilities |
| No repo-local instructions exist yet | governance | `find /Users/jamiecraik/dev/evals -name AGENTS.md` returned no files | missing `AGENTS.md` | Future agents lack local operating contract | High | Agent-native repo needs entry instructions |
| No git metadata exists | developer workflow | `git -C /Users/jamiecraik/dev/evals status` previously failed as not a git repository | entire repo | No branch/CI/review workflow yet | High | Limits delivery and traceability |
| The intended boundary is shared runtime plus local suites | docs | intent file sections `Project Intent`, `Shared Runtime, Local Suites`, `Non-Negotiable Strategic Decisions` | future schemas, runner, suite adapters | Strong bounded-context design if preserved | High | Prevents central eval repo from owning domain truth |
| The repo currently has no executable feedback loop | source/repo structure | no package manifest, source, tests, scripts, CI found | missing implementation | Architecture is not yet testable | High | Next work must be tracer bullet |
| `coding-harness` is a natural first consumer | config | `/Users/jamiecraik/dev/coding-harness/package.json` includes `test:evals`, `test:artifacts:evals`, `observed:eval-usage` | future `coding-harness.pr-closeout-trajectory` suite | First suite can align with existing command culture | High | Avoids invented consumer |
| `coding-harness` separates durable harness artifacts from runtime output | governance/docs | `/Users/jamiecraik/dev/coding-harness/.harness/README.md`; assurance plan runtime boundary | artifact layout | Evals must distinguish `.harness` context from `artifacts/**` runtime bundles | High | Prevents evidence/provenance confusion |
| `agent-skills` has existing domain language for eval readiness | docs | `/Users/jamiecraik/dev/agent-skills/UBIQUITOUS_LANGUAGE.md` | future `agent-skills.skills-doctor-contract` suite | Shared runtime should reuse language, not replace it | High | Preserves bounded context and DDD integrity |
| Existing `agent-skills` artifacts show judge metadata precedent | telemetry/artifacts | `Infrastructure/artifacts/skill-graphs/**/iteration_journal.jsonl` includes `judge_mode`, `rubric_version`, `evaluator_version`, `prompt_hash` | future judge schema | Useful precedent but not canonical by default | Medium | Supports advisory judge metadata design |
| External libraries are strategically useful but dangerous as roots | docs/user-supplied sources | intent file mining map lists openevals, autoevals, deepeval, openai/evals, fasteval, Braintrust recipes | future adapters | Adapter-first design needed | Medium-high | Prevents framework lock-in |
| Prompt-injection handling should be core | prompts/security | user supplied Braintrust PromptInjectionDetector plus intent file security posture | future security suite | Untrusted surfaces are central to agent workflows | Medium-high | Security and instruction hierarchy are operational risks |
| Moat is not the runner | strategic interpretation | seed intent and absence of implementation | all future runtime modules | Runner is easy to copy; fixture corpus is harder | Medium-high | Directs investment toward high-leverage assets |

## Final Architectural Verdict

This repo has a good spine and no muscles yet. The spine is worth preserving:
local-first proof, repo-owned suites, shared contracts, deterministic gates,
artifact bundles, advisory judges, and external adapters kept behind canonical
schema.

The next move should be aggressively boring implementation. If the next changes
are another strategy doc, a dashboard, or a pile of external adapters, the
project is drifting before it has started. If the next change is one local
runner that writes one honest artifact bundle for one real regression case, the
architecture is on the right path.

