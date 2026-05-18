# Stabilize Evals Executable Spine

# Refactor Classification

- execution determinism
- eval stabilization
- cognition compression
- anti-drift hardening
- moat reinforcement
- Linear execution hygiene

# Problem Statement

The repository currently has strong strategic documents but no executable eval
spine: no package manifest, runner, schemas, tests, fixture, artifact bundle, or
baseline comparator. This creates the highest architectural risk in the system:
documentation can keep accumulating while the project still cannot prove one
local regression case.

Operational issue: future work can appear strategic while never producing a
run, result, report, or baseline delta.

Cognition issue: future agents must read long intent/review/triage/strategy
documents to infer what to do, instead of running one command and inspecting one
artifact bundle.

Future-agent issue: without a deterministic command contract, agents will
invent runners, schemas, and reports ad hoc.

Linear issue: without this program, Linear will split into many plausible but
low-leverage tickets: adapters, dashboards, telemetry, judge experiments,
prompt libraries, and research tasks.

Moat risk: the project's moat is not the runner, but the runner is the required
container for the moat. Without an executable spine, the real-regression corpus
cannot compound.

# Root Cause Analysis

This architecture emerged from strategic exploration before implementation. The
user supplied many relevant sources and asked for strategy first, which
correctly produced doctrine before code. That sequence is useful, but it now
creates pressure to keep producing higher-order documents rather than the first
local proof loop.

The issue survived because documentation is easier to expand than runtime
contracts. The prior artifacts intentionally held back framework and dashboard
work, but they also made the strategic surface feel complete before the repo can
execute.

The failure is operational, not historical legacy. There is no old code to
clean up. The migration is from documented intent to executable authority.

# Evidence

Facts:

- The architecture review states the repo had no package manifest, source tree,
  test suite, CI config, schema directory, runner, telemetry code, or plugin
  system at review time.
- The triage artifact names exactly one immediate initiative: Evals Executable
  Spine.
- The strategy artifact makes the phase-one test whether work can make pnpm
  evals run fixtures/smoke/pr-closeout.case.json --json produce a more
  trustworthy local artifact bundle.
- The intent artifact defines artifact bundle, deterministic scorer, baseline
  comparator, and repo-local suite adapter as core stable interfaces.

Interpretation:

- The first architectural migration is not a refactor of code. It is a refactor
  of authority from prose into executable contracts.

Assumptions:

- The first implementation will likely use TypeScript because the first
  consumer, coding-harness, already exposes pnpm eval-related command surfaces.
  This can change if an ADR chooses another runtime.

# Architectural Impact

Affected systems:

- package manifest and command surface;
- schema contracts;
- runner;
- artifact writer;
- deterministic scorer interface;
- baseline comparator;
- smoke fixtures;
- README and AGENTS operating surface;
- future Linear initiative structure.

Blast radius: repo-local at first; later cross-repo once coding-harness and
agent-skills suites consume the runner.

Migration complexity: moderate. The implementation is small, but the contract
choices become long-lived.

Drift risk: high if schemas, artifact layout, and command names are created
piecemeal.

Rollback difficulty: low before consumers exist; medium after first suite
adoption.

Likely files/directories touched:

- package.json
- src/
- schemas/
- fixtures/smoke/
- .harness/evals/
- README.md
- AGENTS.md
- .harness/decisions/

Systems that must not be touched:

- external framework adapters;
- dashboard/web UI;
- cloud runner;
- required LLM judge gates;
- repo-local domain fixture logic inside coding-harness or agent-skills before
  an ownership boundary exists.

# Desired End State

The repo has one obvious local command that executes one smoke case and writes
a complete artifact bundle.

The improved reasoning model:

- source case goes in;
- local runner executes;
- deterministic scorers evaluate;
- baseline comparator records delta;
- artifact bundle is written;
- JSON and Markdown outputs explain the verdict.

The improved Linear shape:

- one parent issue represents the executable spine;
- sub-issues are bounded to schema, runner, artifact writer, scorers, smoke
  fixture, baseline compare, and operating docs.

# Migration Strategy

Use a staged migration from documentation authority to executable authority.

Sequencing:

1. Establish contracts before adapters.
2. Establish local runner before telemetry.
3. Establish artifact bundle before dashboard.
4. Establish deterministic scorers before LLM judges.
5. Establish smoke fixture before repo-wide suite adoption.
6. Establish baseline comparison before claiming regression capability.

Coexistence rules:

- Strategy documents remain guidance, not runtime authority.
- Until the CLI exists, do not start adapter, dashboard, or judge-gate work.
- The first runner may be minimal, but it must write the final artifact shape or
  a versioned transitional shape with a removal condition.

Rollback strategy:

- If schema or artifact layout proves wrong before consumers exist, replace it
  with a new version and mark the old one experimental.
- If a consumer has adopted the contract, add a compatibility shim with a sunset
  condition and migration eval.

Linear milestone/parent issue shape:

- Milestone: Evals Executable Spine
- Parent issue: Build local eval runner and artifact contract
- Keep active sub-issues <= 6.

# Execution Phases

## Phase 1 - Contract Freeze

Objective: define minimal case, result, artifact manifest, scorer result, and
baseline result schemas.
Affected systems: schemas, ADRs, README draft.
Expected risk: medium.
Can run in parallel: no.
Validation requirements: schema examples validate; no adapter schema imported.
Rollback conditions: schema cannot represent command output, artifact paths, or
baseline delta.
Linear mapping: sub-issue under Build local eval runner and artifact contract.
Agent-safe: assisted.
Human review required: yes.

## Phase 2 - Local Runner And Artifact Writer

Objective: implement the smallest command that runs a fixture and writes
result.json, report.md, command log, and manifest.
Affected systems: package manifest, src/runner, src/artifacts.
Expected risk: medium.
Can run in parallel: yes, after Phase 1.
Validation requirements: smoke command writes complete bundle.
Rollback conditions: runner cannot preserve deterministic command evidence.
Linear mapping: sub-issue under executable spine parent.
Agent-safe: yes.
Human review required: no unless contract changes.

## Phase 3 - Deterministic Scorers

Objective: add required scorer interface and first deterministic checks.
Affected systems: src/scorers, result schema.
Expected risk: medium.
Can run in parallel: partial.
Validation requirements: missing artifact, failed command, invalid schema, and
expected blocker cases are classified deterministically.
Rollback conditions: scorer outputs are subjective or untraceable.
Linear mapping: sub-issue under executable spine parent.
Agent-safe: yes.
Human review required: no.

## Phase 4 - Baseline Comparator

Objective: compare current result to an accepted baseline.
Affected systems: src/baseline, artifact manifest, report.
Expected risk: medium.
Can run in parallel: after Phase 2.
Validation requirements: unchanged, improved, regressed, and missing-baseline
states are represented.
Rollback conditions: comparator hides raw evidence or mutates baselines without
explicit approval.
Linear mapping: sub-issue under executable spine parent.
Agent-safe: assisted.
Human review required: yes for baseline promotion.

## Phase 5 - Agent Operating Surface

Objective: write minimal README.md and AGENTS.md that route agents to the single
command, artifact contract, and non-negotiables.
Affected systems: docs and agent instructions.
Expected risk: low.
Can run in parallel: yes, after Phase 1.
Validation requirements: future-agent smoke instructions fit on one screen and
do not contradict strategy.
Rollback conditions: docs introduce new authority not reflected in schemas or
runner.
Linear mapping: small sub-issue, not a separate refactor program.
Agent-safe: yes.
Human review required: no.

# Linear Mapping

Workspace/team: Jscraik
Team key: JSC
Top-level initiative: Dev Portfolio
Cross-repo project: Portfolio Ops
Target Linear project: evals
Repo-specific or cross-repo: repo-specific first; cross-repo once suites adopt.
Belongs under Portfolio Ops: yes, as portfolio infrastructure.
Affects Dev Portfolio: yes.
Recommended milestone name: Evals Executable Spine
Recommended parent issue title: Build local eval runner and artifact contract
Suggested priority: urgent.
Suggested labels: evals, architecture, agent-native, moat, determinism.
Dependencies: none.
Project reactivation: create or reactivate only the repo-specific evals project;
keep active set small.

Recommended sub-issues:

- Define canonical eval schemas.
- Implement local runner command.
- Write artifact bundle contract and writer.
- Add deterministic scorer interface.
- Add smoke fixture.
- Add baseline comparison.
- Add minimal README and AGENTS.

# Anti-Regression Constraints

Must not regress:

- local artifact authority;
- deterministic required gates;
- baseline comparison;
- schema-first adapter boundary;
- future-agent command clarity.

Anti-patterns must not reappear:

- dashboard before artifact proof;
- framework-native result schema;
- required LLM judge gate;
- hidden orchestration;
- report-only implementation;
- telemetry as proof;
- Linear issue explosion.

# Eval Requirements

Expected eval artifact:

.harness/evals/evals-evals-executable-spine-eval.md

Required proof:

- exact smoke command and output;
- artifact bundle path;
- schema validation outcome;
- deterministic scorer examples;
- baseline comparator behavior;
- docs/agent operating surface check;
- confirmation that no adapter, dashboard, or judge gate was introduced.

No Linear parent issue should close without this artifact.

# Success Criteria

- One command runs a smoke fixture locally.
- One artifact bundle includes machine-readable and human-readable evidence.
- Result schema validates against fixtures.
- At least three deterministic scorer outcomes are tested.
- Baseline state is represented.
- README and AGENTS route future agents to the command.
- No phase-one external adapters exist.
- No dashboard or telemetry exporter exists.
- Active Linear issue set remains bounded.

# Safe Rollback Conditions

Rollback or stop if:

- artifact bundle does not include raw command evidence;
- schema cannot express baseline state;
- scorer outputs are ambiguous;
- implementation requires a hosted service;
- adapter work is introduced before the runner passes;
- fixture content lacks provenance fields.

Linear status recommendation if triggered: Blocked or Needs rework, not
Complete with follow-up.

# Future-Agent Guidance

Preserve the boring path. The first runner should be small, explicit, and easy
to inspect. Complexity is intentional only in schema clarity, artifact
integrity, baseline comparison, and deterministic scoring.

Safe to modify: implementation internals, command help text, report wording,
test layout.

Human review required: schema breaking changes, baseline promotion semantics,
required-gate semantics.

Proof required before closure: local eval artifact plus passing validation.

# Related Systems

- .harness/features/2026-05-18-evals-intent.md
- .harness/review/2026-05-18-evals-architecture-review.md
- .harness/triage/2026-05-18-evals-triage.md
- .harness/strategy/2026-05-18-evals-strategy.md
- Future ADR: canonical eval result schema and external adapter boundary.
- Future ADR: local artifact bundles are authoritative.
- Related refactor: preserve-repo-local-suite-boundaries.md
- Related refactor: quarantine-framework-judge-telemetry-sprawl.md

