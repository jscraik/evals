# Evals Structural Triage

Date: 2026-05-18
Repository: `/Users/jamiecraik/dev/evals`
Triage artifact: `.harness/triage/2026-05-18-evals-triage.md`
Inputs:

- `.harness/features/2026-05-18-evals-intent.md`
- `.harness/review/2026-05-18-evals-architecture-review.md`

## 1. Executive Triage Summary

The architecture findings compress into one execution rule:

> Build the smallest local proof path before adding any strategy, dashboard,
> cloud runner, external adapter, or judge sophistication.

The seed repo currently has a strong intent artifact and architecture review,
but no implementation. That means the highest-leverage work is not another
review, not source mining, and not integration selection. It is a tiny
executable spine:

1. canonical schemas;
2. one local command-backed runner;
3. deterministic scorers;
4. artifact bundle writer;
5. baseline comparison;
6. one smoke fixture;
7. one report.

Everything else is noise until this exists.

Operational triage:

- High-leverage: schema, runner, artifact bundle, deterministic scorers,
  baseline comparison, first two repo-owned suites.
- Medium-leverage: OTEL local trace, redaction policy, judge metadata, source
  mining report.
- Low-leverage now: dashboard, cloud execution, multi-framework adapters,
  release-note judging, GitHub issue judging, private holdouts.
- False sophistication: universal agent score, framework-native canonical
  schema, LLM judge required gates, prompt-library expansion, plugin system.

## 2. Immediate Architectural Risks

| Risk | Severity | Likelihood | Blast radius | Why it matters | Recommended response |
| --- | --- | --- | --- | --- | --- |
| Documentation-only architecture persists | Critical | High | Entire repo | The repo has no executable feedback loop; more docs will make the architecture feel real without proving anything | Block further strategy docs until a local runner writes an artifact bundle |
| External framework gravity takes over | High | High | Schema, runner, adapters | The source list is broad enough to pull the repo into someone else's data model | Define `eval-result.schema.json` before any adapter |
| LLM judges promoted too early | High | Medium | Required gates, trust | Judge drift will create false pass/fail confidence | Keep all judge use advisory until calibration artifacts exist |
| Repo-local ownership collapses | High | Medium | `coding-harness`, `agent-skills` | Central eval repo will misclassify domain behavior if it owns fixtures/rubrics | Schema must require `owner_repo`, `owner_surface`, and `failure_owner` |
| Artifact proof omitted | Critical | Medium | All eval trust | Without durable artifacts, results become polished assertions | First runner must write `result.json`, `report.md`, command log, and manifest |
| Privacy leakage through fixtures or telemetry | Critical | Medium | Trust, security | Real session/log fixtures are high value and high risk | Add redaction/provenance fields before ingesting real logs |
| PR eval lane becomes too slow | Medium | Medium | Adoption | Slow gates become ceremonial and bypassed | Split smoke/nightly/release lanes from the start |

## 3. Strategic Findings

### High-Leverage

**Shared mechanics, local truth.**

- Category: Strategic, Architectural, Governance.
- Evidence: both prior artifacts state `evals` owns shared mechanics while
  `coding-harness` and `agent-skills` own domain behavior.
- Operational impact: prevents wrong-layer centralization.
- Strategic impact: protects the only plausible moat: repo-native operational
  fixture quality.
- Action: make this an ADR before broader implementation.

**Moat is the fixture corpus, not the runner.**

- Category: Strategic.
- Evidence: architecture review says schemas, CLI runner, artifact writer, and
  adapters are easy to copy; real-regression fixtures are harder.
- Operational impact: prioritizes fixture capture and provenance over platform
  polish.
- Strategic impact: avoids fake defensibility from technical sophistication.
- Action: create a fixture provenance schema and make first fixtures
  real-regression-oriented.

### Medium-Leverage

**Standalone seed repo is acceptable.**

- Category: Strategic, Governance.
- Evidence: intent file declares standalone `/Users/jamiecraik/dev/evals` as
  non-negotiable.
- Operational impact: gives a clean shared contract home.
- Strategic impact: useful only if it remains thin.
- Action: keep standalone, but block domain-specific logic in core.

### Low-Leverage / Do Not Turn Into Work

- Broad market positioning.
- More source recommendation discussion.
- Naming debates beyond stable schema terms.
- Commercial packaging.

## 4. Architectural Findings

### High-Leverage

**Canonical schema is the first architecture.**

- Category: Architectural, Agent-Native, Governance.
- Evidence: both artifacts identify framework lock-in and multiple schemas as
  top drift risks.
- Operational impact: all future adapters, reports, and suites depend on it.
- Strategic impact: keeps external frameworks subordinate.
- Execution artifact: ADR plus implementation issue.

**Artifact bundle is the core abstraction.**

- Category: Architectural, Operational.
- Evidence: intent doctrine says artifacts decide; review says artifact writer
  can become a deep module.
- Operational impact: turns evals into replayable proof.
- Strategic impact: makes the system harder to copy than a simple scorer.
- Execution artifact: refactor/program issue for `artifact-manifest`,
  writer, and report layout.

**Runner must be a tracer bullet.**

- Category: Architectural, Operational.
- Evidence: review identifies no executable feedback loop as the central
  weakness.
- Operational impact: creates the first red/green loop.
- Strategic impact: prevents architecture theater.
- Execution artifact: Linear issue, not initiative.

### Medium-Leverage

**Telemetry is useful but secondary.**

- Category: Operational.
- Evidence: prior artifacts say telemetry explains but does not decide.
- Operational impact: improves diagnosis once results exist.
- Strategic impact: optional Braintrust path without cloud lock-in.
- Action: implement local trace after artifact bundle, before Braintrust export.

## 5. Operational Findings

### High-Leverage

**Local smoke lane must exist before any cloud or adapter lane.**

- Category: Operational, Agent-Native.
- Evidence: architecture review says current feedback is human document review.
- Impact: without local smoke, no adoption and no trust.
- Route: Linear issue.

**Deterministic scorers should precede LLM judges.**

- Category: Operational, Governance.
- Evidence: both artifacts repeatedly require deterministic required gates.
- Impact: prevents judge drift from corrupting required proof.
- Route: implementation issue plus merge-blocking rule.

### Medium-Leverage

**Source mining should be a bounded research artifact.**

- Category: Operational, Strategic.
- Evidence: external sources are user-supplied and not live-audited.
- Impact: useful after core schema exists.
- Route: `.harness/research` or `.harness/strategy`, not immediate code.

## 6. Governance Findings

### High-Leverage

**The repo needs an `AGENTS.md` immediately.**

- Category: Governance, Agent-Native.
- Evidence: architecture review found no repo-local instructions.
- Operational impact: future agents lack local operating contract.
- Strategic impact: weakens agent-native posture.
- Route: implementation issue.

**Merge-blocking rules should be executable.**

- Category: Governance, Operational.
- Evidence: intent file lists merge-blocking rules, but no CI or validators
  exist.
- Operational impact: rules remain aspirational.
- Route: add schema/test validators after first runner.

### Low-Leverage / Ignore For Now

- Full governance hierarchy.
- Multi-stage promotion workflow beyond `draft/advisory/required`.
- Complex review swarm rules.

## 7. Agent-Native Findings

### High-Leverage

**Machine-readable boundaries are missing.**

- Category: Agent-Native, Architectural.
- Evidence: only prose exists; no manifest/schema/CLI.
- Impact: agents cannot operate deterministically.
- Route: schema and CLI first.

**Future agents need one obvious command.**

- Category: Agent-Native, Operational.
- Evidence: review proposes `pnpm evals run --suite smoke --json`.
- Impact: discoverability and local reasoning improve sharply.
- Route: CLI issue.

### Medium-Leverage

**Report format must separate fact, interpretation, and speculation.**

- Category: Agent-Native, Governance.
- Evidence: both prior artifacts model this separation.
- Impact: reduces hallucinated repo understanding.
- Route: report template issue.

## 8. Complexity Without Leverage

| Item | Why it exists | Why it survived | Why harmful now | Disposition |
| --- | --- | --- | --- | --- |
| Dashboard-first roadmap | Dashboards feel like product | Easy to visualize value | Hides lack of local proof | Remove from phase one |
| Multi-adapter sprint | Many good source candidates exist | Looks comprehensive | Creates framework lock-in before schema | Defer until two suites run |
| Cloud runner | Braintrust/cloud evals are attractive | Useful for later scale | Makes proof non-local too early | Defer |
| Universal agent quality score | Simplifies communication | Seductive executive metric | Destroys domain-specific truth | Delete |
| Required LLM judge | Easy to score fuzzy artifacts | Feels modern | Drift-prone and uncalibrated | Block |
| Prompt library expansion | Prompt sources were provided | Looks like improvement | Adds token cost without measured reliability | Convert only into fixtures/rubrics |
| Plugin system | Future extensibility | Familiar pattern from agent-skills | Premature indirection | Ignore until two real adapters need it |
| Generic dataset registry | Eval frameworks often have one | Sounds canonical | No real cases yet | Defer |

## 9. Moat-Critical Systems

| System | Why it matters | Compounds? | Strategic investment? | Complexity effect |
| --- | --- | --- | --- | --- |
| Real-regression fixture corpus | Captures expensive mistakes as replayable proof | Yes | Yes, highest | Complexity strengthens only with provenance and replay |
| Artifact bundle contract | Makes eval proof durable and auditable | Yes | Yes | Complexity strengthens if standardized |
| Blocker/status taxonomy | Lets agents classify reality honestly | Yes | Yes | Complexity strengthens if small and enforced |
| Repo-local ownership model | Prevents wrong-layer fixes | Yes | Yes | Complexity strengthens if schema-backed |
| Deterministic smoke lane | Builds trust and adoption | Yes | Yes | Complexity should stay low |
| Prompt-injection boundary suite | Protects hostile input surfaces | Yes | Yes, after smoke | Complexity strengthens if fixture-backed |
| Judge calibration corpus | Enables safe fuzzy evaluation | Later | Medium | Complexity weakens if premature |
| OTEL/local trace | Diagnoses failures | Later | Medium | Complexity weakens if it replaces artifacts |

Fake moat systems:

- dashboards;
- generic adapters;
- generic prompt libraries;
- universal quality scores;
- public-framework wrappers;
- uncalibrated judge scores.

Easy-to-copy systems:

- CLI shell;
- schema shape;
- markdown reporter;
- OTEL exporter;
- adapter wrappers.

Harder-to-copy systems:

- real-regression fixture corpus;
- operational blocker taxonomy;
- repo-native closeout/readiness suites;
- private holdouts;
- calibrated judge examples.

## 10. Fake Sophistication Signals

Do not turn these into work items:

- adding every named external eval framework;
- building a Braintrust export before local trace exists;
- writing more prompt policy without a prompt-change regression fixture;
- creating a plugin API before adapter duplication is real;
- scoring generated prose before command behavior proof;
- adding release notes and GitHub issue suites before the smoke lane;
- creating an "agent intelligence" dashboard.

These sound advanced. They do not currently reduce execution ambiguity.

Hard block rule: if a proposed task does not help produce or validate the first
local artifact bundle, it is not phase-one work. The burden of proof is on the
new task, not on the executable-spine slice.

Phase-one blocked work:

- any external adapter implementation;
- any hosted service integration;
- any dashboard, UI, or visualization;
- any LLM judge gate;
- any prompt optimization pass;
- any release-note or issue-quality suite;
- any private holdout mechanism;
- any plugin architecture;
- any source-mining implementation beyond a short research note;
- any governance expansion that does not become a schema, validator, or test.

Allowed exception: a task may enter phase one only if it directly reduces risk
for the executable spine: schema validation, local command execution, artifact
writing, deterministic scoring, report writing, or first-fixture proof.

## 11. Recommended Deletions

There is nothing to delete from the seed repo except future bad ideas if they
appear.

Deletion candidates from the roadmap:

| Candidate | Why it exists | Why it survived | Why remove | Impact |
| --- | --- | --- | --- | --- |
| Universal agent score | Communication shortcut | Easy to imagine dashboarding | Lowers truth into a vanity metric | Improves domain fidelity |
| Phase-one dashboard | Product instinct | Visible output | Masks lack of proof | Forces CLI-first execution |
| Required LLM judge | Handles fuzzy quality | Modern eval habit | Uncalibrated drift risk | Preserves trust |
| Framework-native schema | Fast adoption | External libs provide formats | Creates lock-in | Protects canonical contract |
| Prompt library | Source material exists | Feels useful | Adds context cost | Forces fixture/rubric conversion |
| Plugin lifecycle duplication | Adjacent repo has plugin system | Familiar abstraction | Wrong bounded context | Keeps evals thin |

Deletion posture: delete ideas earlier than feels comfortable. The project is
most likely to fail by carrying attractive adjacent concepts too long. The seed
repo does not need to be comprehensive; it needs to be hard to misuse.

If any of the following appear in a PR before the executable spine exists, the
default review position should be "remove it":

- `adapters/` with real framework dependencies;
- `dashboard/`, `web/`, or UI assets;
- `cloud/` runner code;
- judge prompts used as required gates;
- generic prompt examples not tied to a fixture;
- docs that introduce new lifecycle stages without a validator;
- abstraction layers with only one implementation;
- configuration files for services the local smoke command does not need.

## 12. Refactor Candidates

Pre-implementation refactor candidates are really seam candidates:

1. `schemas/`
   - Type: architecture initiative.
   - Purpose: canonical contract.
   - Priority: critical.

2. `src/runner/`
   - Type: refactor program after first runner.
   - Purpose: keep command execution separate from scoring/reporting.
   - Priority: high.

3. `src/scorers/`
   - Type: implementation issue.
   - Purpose: deterministic proof units.
   - Priority: high.

4. `src/reporters/`
   - Type: implementation issue.
   - Purpose: human-readable artifact output.
   - Priority: medium.

5. `src/telemetry/`
   - Type: operational project.
   - Purpose: local trace and optional export.
   - Priority: medium after artifact proof.

6. `adapters/`
   - Type: deferred refactor program.
   - Purpose: external framework isolation.
   - Priority: low until core is proven.

## 13. Anti-Drift Priorities

| Priority | Finding | Increases drift if ignored? | Improves determinism? | Improves cognition? | Reduces coupling? | Simplifies execution? | Future-agent impact |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Canonical result schema | Yes | Yes | Yes | Yes | Yes | High |
| 2 | Local runner + artifact bundle | Yes | Yes | Yes | Medium | Yes | High |
| 3 | Repo ownership fields | Yes | Yes | Yes | Yes | Medium | High |
| 4 | Deterministic scorers | Yes | Yes | Medium | Medium | Yes | High |
| 5 | AGENTS.md + README | Medium | Medium | Yes | Medium | Yes | High |
| 6 | Redaction/provenance fields | Yes | Medium | Medium | Medium | Medium | Medium |
| 7 | Judge advisory metadata | Yes | Medium | Medium | Medium | Medium | Medium |
| 8 | Adapter boundary | Yes | Medium | Medium | Yes | Medium | Medium |

## 14. Execution Priority Matrix

| Work | Impact | Complexity | Strategic importance | Risk class | Route | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| Create canonical schemas | Critical | Moderate | Moat-critical | Drift/cognition | ADR + Linear issue | Do now |
| Build local command runner | Critical | Moderate | Operational | Execution/drift | Linear issue | Do now |
| Write artifact bundle contract | Critical | Moderate | Moat-critical | Governance/cognition | ADR + issue | Do now |
| Add deterministic scorers | High | Moderate | Operational | Regression | Linear issue | Do now |
| Add first smoke fixture | High | Moderate | Moat-critical | Regression/cognition | Linear issue | Do now |
| Add AGENTS.md/README | High | Trivial | Agent-native | Cognition | Linear issue | Do now |
| Add baseline comparator | High | Moderate | Operational | Regression | Linear issue | Do soon |
| Add redaction/provenance policy | High | Moderate | Governance | Security | ADR + issue | Do soon |
| Add local trace writer | Medium | Moderate | Operational | Observability | Operational project | Later |
| Mine external sources | Medium | Moderate | Architectural | Framework drift | Research artifact | Later |
| Add OpenEvals/AutoEvals adapter | Medium | Moderate | Architectural | Framework drift | Deferred issue | Not yet |
| Add Braintrust export | Medium | Moderate | Operational | Cloud dependency | Deferred issue | Not yet |
| Add release-note evals | Medium | Moderate | Workflow | Prose drift | Eval program | Not yet |
| Add GitHub issue evals | Medium | Moderate | Workflow | Tracker noise | Eval program | Not yet |
| Dashboard | Low | Difficult | Cosmetic | Governance/cognition | None | Do not implement |
| Universal score | Low | Moderate | Cosmetic | Moat/cognition | None | Delete idea |

## 15. Recommended Linear Initiatives

### Initiative 1: Evals Executable Spine

- Goal: turn seed architecture into local proof.
- Issues:
  - create schema package;
  - implement command runner;
  - implement artifact bundle writer;
  - implement deterministic scorers;
  - add smoke fixture and CLI.
- Success condition: one command writes `result.json`, `report.md`, command
  log, and manifest.

### Initiative 2: Repo-Owned First Suites

- Goal: prove shared runtime serves real consumers.
- Issues:
  - `coding-harness.pr-closeout-trajectory` fixture;
  - `agent-skills.skills-doctor-contract` fixture;
  - ownership fields and result taxonomy validation.
- Success condition: two repo-owned suites run without moving domain truth into
  `evals`.

### Initiative 3: Trust, Privacy, And Judge Discipline

- Goal: prevent fixture and judge trust failures.
- Issues:
  - redaction/provenance schema;
  - judge advisory metadata;
  - calibration policy;
  - prompt-injection boundary fixture.
- Success condition: no real fixture can be promoted without provenance and
  privacy classification.

## 16. Recommended ADRs

1. ADR: Canonical Eval Result Schema And External Adapter Boundary.
2. ADR: Local Artifact Bundles Are Authoritative; Telemetry Is Explanatory.
3. ADR: Repo-Local Suites Own Domain Truth.
4. ADR: LLM Judges Are Advisory Until Calibrated.
5. ADR: Fixture Provenance, Privacy, And Holdout Policy.

## 17. Recommended Refactor Programs

No refactor program should start before implementation exists.

Future refactor programs:

- scorer interface consolidation after three deterministic scorers;
- adapter isolation after two external adapters;
- telemetry/export split after local trace plus one exporter;
- suite manifest consolidation after two repo-owned suites.

## 18. Future Agent Operational Risks

Future agents will struggle with:

- no local instructions;
- no obvious command;
- prose-only architecture;
- no schema-enforced boundaries;
- ambiguity between `.harness` durable docs and runtime `artifacts/**`;
- external framework temptation;
- broad source list that can trigger tool-chasing;
- no concrete fixture to imitate.

Anti-agent patterns to prevent:

- context-heavy strategy docs without command entrypoints;
- unclear owner surfaces;
- optional artifact output;
- hidden cloud dependencies;
- judge scores without raw artifacts;
- adapters that leak external terminology into core.

## 19. Recommended Compression Opportunities

Compress the next planning layer into a single execution slice:

```text
Slice: executable-spine-v0

Files:
- package.json
- README.md
- AGENTS.md
- schemas/eval-case.schema.json
- schemas/eval-result.schema.json
- schemas/artifact-manifest.schema.json
- src/runner/command-case-runner.ts
- src/scorers/exit-code.ts
- src/scorers/artifact-exists.ts
- src/reporters/markdown.ts
- fixtures/smoke/pr-closeout.case.json
- tests/runner.test.ts

Command:
- pnpm evals run fixtures/smoke/pr-closeout.case.json --json

Proof:
- artifacts/evals/<run-id>/result.json
- artifacts/evals/<run-id>/report.md
- artifacts/evals/<run-id>/command.log
- artifacts/evals/<run-id>/manifest.json
```

Do not split this into separate strategy initiatives. It is one tracer bullet.

## 20. Evidence & Traceability Matrix

| Conclusion | Evidence | Affected files/modules | Confidence | Operational impact | Strategic impact | Why it matters |
| --- | --- | --- | --- | --- | --- | --- |
| Highest priority is executable spine | Review says repo has no implementation, no feedback loop, and only one intent file | future package, schemas, runner, tests | High | Creates first red/green loop | Prevents architecture theater | Without this, all triage is inert |
| Canonical schema must precede adapters | Intent and review both identify framework-native schema takeover as drift risk | `schemas/*`, future `adapters/*` | High | Keeps results comparable | Prevents lock-in | External source list is broad and tempting |
| Artifact bundle is core | Intent doctrine: artifacts decide; review: artifact-writer can be deep module | artifact writer, manifest, reports | High | Makes proof replayable | Builds trust/moat | Reports alone are too easy to fake |
| Repo-local ownership must be schema-backed | Intent: evals owns mechanics, repos own truth; review: ownership fields needed | `eval-case`, `eval-result`, suite manifests | High | Prevents wrong-layer fixes | Protects strategic boundary | Central repo cannot own every domain |
| LLM judges must stay advisory | Intent/review both warn about judge drift | judge metadata, scorer policy | High | Avoids false required gates | Preserves trust | Judge outputs are useful but unstable |
| Dashboard is low-leverage now | Intent/review both reject dashboard before proof | no current module | High | Avoids product theater | Keeps focus on moat | UI without artifacts hides weakness |
| External source mining is later | Sources are user-supplied but not live-audited; review says mine after schema | research/adapters | Medium-high | Avoids tool-chasing | Keeps strategy adapter-first | Research before schema will sprawl |
| AGENTS.md/README are immediate agent-native needs | Review found no repo-local instructions or first command | `AGENTS.md`, `README.md` | High | Improves discoverability | Supports agent-native claim | Future agents need entry contracts |
| Moat is fixture corpus, not runner | Intent/review both say runner is easy to copy | fixtures, provenance, holdouts | Medium-high | Prioritizes real cases | Builds defensibility | Tooling alone has weak moat |
| Prompt library is false sophistication | Intent says prompt research must become fixtures/rubrics; review warns against prompt growth | future prompt/rubric docs | Medium | Controls token/cognition cost | Avoids AI-themed bloat | Prompt text without eval delta is not leverage |

## Final Triage Decision

Create exactly one immediate execution initiative: **Evals Executable Spine**.

Everything else either supports that slice or waits. The repo does not need more
architecture cognition right now. It needs the smallest working mechanism that
proves the doctrine:

> local command, deterministic checks, durable artifacts, repo ownership,
> baseline comparison.

If the next work item is not part of that mechanism, it should be challenged,
deferred, or deleted.

Ruthless execution test:

> Can this work make `pnpm evals run fixtures/smoke/pr-closeout.case.json --json`
> produce a more trustworthy local artifact bundle?

If no, it waits.
