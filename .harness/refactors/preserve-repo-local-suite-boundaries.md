# Preserve Repo-Local Suite Boundaries

# Refactor Classification

- modularity correction
- cognition compression
- moat reinforcement
- anti-drift hardening
- execution determinism
- Linear execution hygiene

# Problem Statement

The shared evals repo must support coding-harness, agent-skills, and later
agent-heavy repos without absorbing their domain truth. The risk is centralizing
suite logic, fixtures, rubrics, and workflow meaning inside the shared runtime
because it feels efficient.

Architectural issue: shared mechanics and repo-local behavior can collapse into
one layer.

Operational issue: centralizing domain truth makes local repo validation weaker,
because suites no longer evolve with the owning repo's workflows.

Cognition issue: future agents will not know whether a failure belongs to the
eval runtime, the suite adapter, or the consuming repo.

Linear issue: cross-repo work can become one large ambiguous initiative instead
of small repo-specific adoption milestones.

Moat risk: the moat is real-regression corpus plus operating discipline. If
fixtures lose provenance or local ownership, the corpus becomes generic and easy
to copy.

# Root Cause Analysis

This pressure emerges from the correct desire to create one reusable eval
runtime. Reuse becomes harmful when it crosses from shared mechanics into
domain judgment.

It survived because the first two consumers are already known:
coding-harness.pr-closeout-trajectory and agent-skills.skills-doctor-contract.
Known consumers make it tempting to design their suite logic centrally before
the runtime boundary is proven.

The issue is strategic and operational. It is not legacy. It is a boundary risk
created by a shared control-plane repo serving multiple local domains.

# Evidence

Facts:

- The intent artifact says this repo should not own each repo's domain truth and
  that coding-harness and agent-skills should own their behavior.
- The strategy artifact makes repo-local suite ownership an architectural
  non-negotiable.
- The triage artifact identifies real-regression fixture corpus and provenance
  as moat-critical.
- The architecture review identifies shared runtime plus local suites as the
  deep boundary to preserve.

Interpretation:

- Suite ownership is not a documentation preference. It is a moat protection
  boundary.

Assumptions:

- First suite adoption will involve both local repo changes and shared evals
  runtime changes.

# Architectural Impact

Affected systems:

- suite registry or suite manifest;
- fixture provenance schema;
- repo adapter interface;
- local suite files in consuming repos;
- baseline promotion process;
- Linear project routing;
- future ADRs about ownership.

Blast radius: cross-repo once adoption begins.

Migration complexity: moderate-high because boundaries must be encoded before
first suites become precedent.

Drift risk: high if suite examples are copied into shared repo without
ownership metadata.

Rollback difficulty: medium. Misplaced fixtures can be moved, but baseline
history and issue references become noisy.

Likely files/directories touched:

- schemas/suite-manifest.schema.json
- schemas/fixture-provenance.schema.json
- fixtures/smoke/
- suites/ or adapters/repos/ if introduced
- consuming repo .harness/evals/ or equivalent suite directories
- .harness/decisions/

Systems that must not be touched:

- broad framework adapters;
- dashboard aggregation;
- generic dataset registry;
- unrelated repo governance files.

# Desired End State

The shared evals repo owns:

- runner mechanics;
- canonical result schema;
- artifact bundle contract;
- deterministic scorer contract;
- suite manifest format;
- fixture provenance and privacy schema;
- baseline comparison semantics.

The consuming repo owns:

- suite intent;
- fixtures;
- repo-specific rubrics;
- domain assertions;
- acceptance thresholds;
- baseline promotion decisions.

The improved reasoning model:

- runtime failures point to evals repo;
- domain failures point to the owning repo;
- adapter failures point to the boundary layer;
- fixture trust depends on provenance metadata.

The improved Linear shape:

- shared runtime parent remains in evals;
- suite adoption gets repo-specific parent issues;
- cross-repo coordination stays under Portfolio Ops but active sets remain
  small.

# Migration Strategy

Sequence the boundary before the first real suite.

1. Define suite ownership fields in schema.
2. Define fixture provenance and privacy fields.
3. Create smoke suite with explicit owner metadata.
4. Create adoption guide that says where repo-owned suite logic lives.
5. Add first coding-harness suite without moving coding-harness judgment into
   shared runtime.
6. Add first agent-skills suite with its own vocabulary preserved.
7. Only then generalize repeated patterns.

Coexistence rules:

- Shared repo may contain smoke fixtures and contract examples.
- Real repo fixtures should live in or be generated from the owning repo unless
  an ADR approves promotion.
- Shared repo may reference external paths, but must not silently copy private
  logs or session data without provenance and redaction status.

Rollback strategy:

- If suite logic is centralized accidentally, move it back to the owning repo
  and leave only a manifest or adapter contract.
- If fixture provenance is missing, quarantine the fixture and block baseline
  promotion.

Linear milestone/parent issue shape:

- Milestone: Repo-Owned First Suites
- Parent issue: Add first repo-owned eval suites without centralizing domain
  truth

# Execution Phases

## Phase 1 - Ownership Contract

Objective: define suite owner, repo, source path, fixture source, privacy, and
promotion metadata.
Affected systems: schemas, ADRs, docs.
Expected risk: medium.
Can run in parallel: no.
Validation requirements: example suite manifests validate and show owner repo.
Rollback conditions: ownership fields cannot represent both first suites.
Linear mapping: sub-issue under repo-owned first suites parent.
Agent-safe: assisted.
Human review required: yes.

## Phase 2 - Provenance Gate

Objective: prevent fixture promotion without source, redaction, sensitivity, and
retention metadata.
Affected systems: fixture schema, validation checks, artifact report.
Expected risk: medium.
Can run in parallel: yes after Phase 1.
Validation requirements: fixture without provenance fails validation.
Rollback conditions: provenance gate blocks all useful local smoke cases.
Linear mapping: sub-issue under repo-owned first suites parent.
Agent-safe: yes.
Human review required: yes for privacy classes.

## Phase 3 - Coding-Harness Suite Adoption

Objective: add coding-harness.pr-closeout-trajectory through the shared contract
while preserving coding-harness ownership.
Affected systems: evals suite adapter, coding-harness suite files, baseline.
Expected risk: medium-high.
Can run in parallel: no.
Validation requirements: suite produces shared result shape and cites local
repo-owned fixture/provenance source.
Rollback conditions: suite requires moving coding-harness domain logic into
shared evals repo.
Linear mapping: repo-specific parent issue in coding-harness project, linked to
Portfolio Ops.
Agent-safe: assisted.
Human review required: yes.

## Phase 4 - Agent-Skills Suite Adoption

Objective: add agent-skills.skills-doctor-contract without losing existing skill
vocabulary and judge metadata precedent.
Affected systems: evals suite adapter, agent-skills suite files, judge metadata
schema.
Expected risk: medium-high.
Can run in parallel: after Phase 2, but preferably after Phase 3 learnings.
Validation requirements: suite result preserves repo-local vocabulary and
shared result contract.
Rollback conditions: shared schema cannot represent skill doctor evidence
without genericizing it.
Linear mapping: repo-specific parent issue in agent-skills project, linked to
Portfolio Ops.
Agent-safe: assisted.
Human review required: yes.

## Phase 5 - Boundary Drift Validation

Objective: validate that shared runtime has not absorbed domain truth.
Affected systems: docs, schemas, examples, Linear closure eval.
Expected risk: low.
Can run in parallel: no.
Validation requirements: closure eval lists owner for every suite and fixture.
Rollback conditions: any real suite lacks owner metadata.
Linear mapping: final sub-issue before milestone closure.
Agent-safe: yes.
Human review required: no unless ownership is disputed.

# Linear Mapping

Workspace/team: Jscraik
Team key: JSC
Top-level initiative: Dev Portfolio
Cross-repo project: Portfolio Ops
Target Linear project: evals plus repo-specific projects for first suites.
Repo-specific or cross-repo: cross-repo.
Belongs under Portfolio Ops: yes.
Affects Dev Portfolio: yes.
Recommended milestone name: Repo-Owned First Suites
Recommended parent issue title: Add first repo-owned eval suites without
centralizing domain truth
Suggested priority: high, after executable spine starts producing artifacts.
Suggested labels: evals, cross-repo, suite-boundary, moat, governance.
Dependencies: Evals Executable Spine.
Project reactivation: only reactivate repo-specific projects when the runner can
produce a valid smoke artifact.
Active set: keep one suite adoption active at a time.

Recommended sub-issues:

- Define suite ownership and provenance schema.
- Add fixture provenance validation.
- Adopt coding-harness PR closeout trajectory suite.
- Adopt agent-skills skill doctor contract suite.
- Validate boundary drift before milestone closure.

# Anti-Regression Constraints

Must not regress:

- owning repo controls suite truth;
- fixtures include provenance and privacy metadata;
- shared evals repo owns mechanics only;
- baseline promotion is explicit;
- local vocabulary is preserved.

Anti-patterns must not reappear:

- central dataset registry before real cases;
- copied private logs without redaction status;
- genericized suite names that hide domain meaning;
- shared thresholds imposed on repo-local workflows;
- one parent Linear issue representing all repo adoption.

# Eval Requirements

Expected eval artifact:

.harness/evals/evals-repo-owned-first-suites-eval.md

Required proof:

- validated suite manifests;
- fixture provenance validation output;
- first coding-harness suite artifact path;
- first agent-skills suite artifact path;
- evidence that domain logic remains in owning repos;
- boundary drift check;
- baseline promotion status.

# Success Criteria

- Every real suite has an owning repo and owner metadata.
- Every promoted fixture has provenance and privacy metadata.
- Shared evals runtime contains no repo-specific domain assertions except smoke
  examples or approved references.
- First two suites emit the canonical result shape.
- Future agents can tell whether a failure is runtime, adapter, or repo-domain.
- Linear suite adoption issues are repo-specific and linked, not merged into one
  ambiguous cross-repo blob.

# Safe Rollback Conditions

Rollback or quarantine if:

- suite ownership is ambiguous;
- fixture lacks provenance;
- shared repo starts containing repo-specific acceptance logic;
- privacy class is missing or unsafe;
- baseline promotion happens without owner approval;
- result schema cannot represent local suite meaning.

Linear status recommendation if triggered: Blocked for privacy/provenance
issues, Needs rework for ownership drift.

# Future-Agent Guidance

Preserve the boundary even when copying a fixture looks faster. The durable
system is shared mechanics plus local truth, not centralized intelligence.

Safe to modify: manifest shape before real adoption, fixture naming, adapter
helper internals.

Human review required: moving fixtures across repos, promoting baselines,
changing privacy classes, changing ownership semantics.

Proof required before closure: eval artifact with owner and provenance evidence.

# Related Systems

- .harness/features/2026-05-18-evals-intent.md
- .harness/triage/2026-05-18-evals-triage.md
- .harness/strategy/2026-05-18-evals-strategy.md
- Future ADR: repo-local suites own domain truth.
- Future ADR: fixture provenance, privacy, and holdout policy.
- Related refactor: stabilize-evals-executable-spine.md
- Related refactor: quarantine-framework-judge-telemetry-sprawl.md

