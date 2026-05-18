# Evals Strategic Direction

Date: 2026-05-18
Repository: /Users/jamiecraik/dev/evals
Status: strategic compression artifact

## Evidence Boundary

This document compresses the existing harness cognition artifacts for the seed
evals repository:

- .harness/features/2026-05-18-evals-intent.md
- .harness/review/2026-05-18-evals-architecture-review.md
- .harness/triage/2026-05-18-evals-triage.md

Fact: at the time of the review and triage artifacts, this repository had no
package manifest, source tree, test suite, runner, CI, schemas, or executable
eval implementation. All architectural claims about the future system are
therefore strategic commitments, not implemented capability.

Interpretation: the prior artifacts are coherent enough to set direction, but
the repo is still pre-product. Strategy must therefore bias toward executable
proof and reject expansion until that proof exists.

# 1. Executive Strategic Summary

The evals repo should become a small, local-first regression harness for
agentic software work. It should not become a generic eval platform, hosted
analytics product, prompt library, dashboard, or wrapper around Braintrust,
OpenAI Evals, DeepEval, AutoEvals, FastEval, OpenEvals, or any other framework.

The strategic spine is:

Real agent failures become replayable local cases. Local artifacts decide.
Telemetry explains. LLM judges advise until calibrated. Repo-local suites own
domain truth.

The immediate direction is exactly one initiative: Evals Executable Spine.
Every phase-one task must pass this test:

Can this work make pnpm evals run fixtures/smoke/pr-closeout.case.json --json
produce a more trustworthy local artifact bundle?

If the answer is no, the work waits.

This project becomes valuable only if it captures Jamie-specific operational
truth: PR closeout mistakes, skill-contract drift, artifact quality failures,
false green checks, missing live-state proof, uncalibrated judge claims, and
repo-specific governance failures. The runner is not the moat. The corpus,
taxonomy, provenance discipline, and replayable proof loop are the moat.

Confidence: high.

Why it matters: without this compression, the repo will drift into framework
collection and governance prose before it earns an executable feedback loop.

# 2. Core Thesis

The project fundamentally exists to convert repeated agent-work failures into
local, deterministic, replayable eval cases that improve future execution.

It should answer one operational question:

Did this agent workflow produce trustworthy evidence for the work it claims to
have completed?

The repo should optimize for:

- artifact quality;
- deterministic required checks;
- baseline comparison;
- repo-local suite ownership;
- calibrated advisory judging;
- fixture provenance;
- future-agent cognition.

It should not optimize for:

- broad benchmark coverage;
- framework breadth;
- generic prompt quality;
- leaderboard-style scoring;
- dashboard aesthetics;
- platform extensibility before proof;
- centralized ownership of coding-harness or agent-skills behavior.

Fact: the intent artifact explicitly states the system philosophy as
Artifacts decide. Telemetry explains. LLM judges advise until calibrated.

Interpretation: this is the governing doctrine. Every architecture decision
should be evaluated against it.

# 3. Irreducible Core

The irreducible architecture is smaller than the ecosystem conversation around
evals suggests.

The core system is:

1. Canonical schema
   A versioned result schema that records case identity, inputs, command
   execution, scorer outputs, artifact paths, evaluator metadata, baseline
   comparison, and verdict taxonomy.

2. Local runner
   A boring CLI that executes a case locally, captures command output, records
   environment metadata, and writes a complete artifact bundle.

3. Artifact bundle
   A stable output directory containing at minimum result.json, report.md,
   command log, manifest, and scorer evidence. This bundle is the authority.

4. Deterministic scorers
   Required phase-one gates should be deterministic: schema checks, file
   existence, command outcomes, artifact completeness, exact-text blockers,
   contract adherence, and baseline deltas.

5. Baseline comparator
   The harness must compare current runs against prior accepted runs. Without
   baseline comparison, it is only a smoke-test wrapper.

6. Repo-owned suites
   coding-harness owns coding-harness behavior. agent-skills owns skill
   behavior. This repo owns shared mechanics, result contracts, runner
   behavior, and cross-repo reporting semantics.

7. Advisory judge policy
   LLM judges may score summary quality, instruction following, narrative
   clarity, or subjective artifact usefulness only after rubric versioning,
   calibration, and judge metadata exist. They must not be required gates in
   phase one.

8. Optional adapters
   External frameworks may be useful adapters, but none should become the
   canonical data model.

Operational identity: a local proof system for agent-work reliability.

Cognition model: future agents should need one command, one result schema, one
artifact bundle, and one obvious place to inspect failure evidence.

Orchestration philosophy: minimal orchestration, explicit execution boundaries,
no hidden routing, no tool proliferation before repeated case evidence.

Governance philosophy: enforce only the rules that protect local proof,
artifact integrity, fixture provenance, and domain ownership.

# 4. Actual Moat

The actual moat is operational and cognitive, not technical.

The defensible asset is a curated corpus of real-regression agent-operation
fixtures tied to:

- observed workflow failures;
- exact blocker classifications;
- repo-local governance contracts;
- artifact evidence expectations;
- baseline histories;
- privacy and provenance rules;
- calibrated scorer behavior;
- repeated closeout mistakes that generic eval suites do not encode.

Why it is difficult to replicate:

- Public eval frameworks can provide runners, judges, and metrics. They cannot
  cheaply reproduce Jamie's accumulated workflow failures, repository-specific
  artifact expectations, Linear/PR/review-state closeout mistakes, skill doctor
  contracts, and governance habits.
- The valuable data is not generic prompts. It is operational evidence from
  actual agent work.
- The compounding effect comes from converting every repeated failure into a
  reusable fixture and baseline, then routing future agents through that proof.

Does complexity strengthen or weaken the moat?

Complexity strengthens the moat only when it captures real failure structure in
schemas, fixtures, scorers, or baseline comparisons. Complexity weakens the
moat when it appears as adapters, dashboards, judge chains, plugin systems, or
governance documents before executable cases exist.

Moat type:

- operational: high;
- cognitive: high;
- workflow-based: high;
- trust-based: medium-high after artifact proof exists;
- architectural: medium if schemas stay stable;
- governance-based: medium if enforcement stays simple;
- ecosystem-based: low;
- distribution-based: currently none.

Moat-critical systems:

- fixture provenance and privacy;
- result schema;
- local artifact bundle;
- baseline comparator;
- repo-local suites;
- blocker taxonomy;
- deterministic scorers;
- judge calibration metadata.

Systems that weaken the moat:

- generic framework wrappers;
- dashboard-first work;
- LLM judges as required gates before calibration;
- broad public benchmark ingestion;
- prompt-library accumulation;
- speculative plugin architecture;
- centralization of repo-local domain truth.

Likely false moat assumptions:

- Technical sophistication is defensibility.
- A larger framework surface makes the project stronger.
- A universal score will help adoption.
- LLM judges can safely start as merge-blocking gates.
- Prompt-engineering sources are core eval infrastructure.
- Braintrust integration creates the system.

What a smart competitor would remove immediately:

- dashboard scope;
- framework fan-out;
- generic judge metrics;
- universal scoring;
- prompt-library ingestion;
- unproven plugin surfaces;
- duplicated governance prose.

What future agents must avoid weakening:

- local artifact authority;
- repo-local suite ownership;
- deterministic required gates;
- fixture provenance;
- baseline comparison;
- the first two suites.

# 5. False Moat Signals

These may look sophisticated but do not create defensibility by themselves:

- Braintrust, OpenAI Evals, DeepEval, AutoEvals, FastEval, or OpenEvals as the
  base architecture.
- OTEL logging before there is a meaningful run lifecycle to observe.
- Prompt injection detector recipes before there are security-boundary cases.
- Release-note or GitHub issue quality suites before artifact-spine proof.
- Prompt-engineering-guide ingestion as eval strategy.
- Awesome-LLM-Judges as an implementation plan rather than calibration input.
- Dashboards before repeated local artifact bundles.
- Multi-agent judge panels before deterministic scoring.
- Plugin architecture before one repo can consume the runner.
- AI-native language without deterministic agent-operable contracts.

Interpretation: these sources are useful reference material. They are not the
strategic base. The base is the local artifact contract.

# 6. Strategic Contradictions

## Standalone Shared Repo vs Repo-Local Truth

Fact: the intent artifact says coding-harness and agent-skills must own their
own domain behavior.

Contradiction: a shared evals repo can easily centralize too much and strip
meaning away from local workflows.

Resolution: keep this repo responsible for common mechanics only. Suites,
fixtures, and domain rubrics remain owned by the consuming repo unless
explicitly promoted through an ADR.

## Framework Mining vs Framework Independence

Fact: the strategy discussion included multiple external eval frameworks and
Braintrust recipes.

Contradiction: mining those sources is useful, but using one as the base would
make external abstractions more authoritative than Jamie's local proof model.

Resolution: mine for patterns, not ownership. Import adapters only after the
canonical schema and artifact bundle exist.

## Governance Ambition vs No Executable Loop

Fact: the current repo began with rich harness documents and no runner, source,
tests, manifest, or CI.

Contradiction: governance without execution becomes ceremony.

Resolution: phase-one governance must be limited to schema validation,
artifact-contract checks, fixture provenance, and a short AGENTS.md and README
that tell future agents the one correct path.

## Agent-Native Intent vs Missing Agent Entry Points

Fact: the prior review found no package manifest, command list, validation
entrypoint, or repo-local AGENTS.md in the seed repo.

Contradiction: the project claims to help agents but does not yet give agents a
deterministic operating surface.

Resolution: the first implementation must create the command contract and
artifact layout before adding any deeper architecture.

# 7. Complexity Without Leverage

The following complexity has no phase-one leverage:

- external adapter matrix;
- hosted service integration;
- dashboard or UI;
- LLM judge gates;
- generic prompt-quality scoring;
- source-mining automation;
- private holdout management;
- plugin lifecycle;
- multi-run analytics;
- release-note and GitHub-issue suites;
- telemetry exporters;
- governance expansion beyond executable contract enforcement.

Why this exists: eval infrastructure invites ecosystem collection. The user has
identified many good sources, and the natural failure mode is to preserve all of
them as architecture.

Why it survived in the prior artifacts: the artifacts kept these ideas visible
but pushed them behind the executable spine.

Why it is harmful now: each item increases architecture surface before the repo
can prove a single local case.

Decision: ignore or defer all of it until the first artifact bundle exists and
two repo-owned suites can run.

# 8. What Should Be Deleted

Nothing in the current seed repo should be deleted solely because the existing
artifacts are useful orientation surfaces. The deletion list applies to roadmap
and implementation choices.

Delete or block before phase one:

1. Universal agent score
   Why it exists: stakeholders like simple numbers.
   Why it survived: scoring feels like eval maturity.
   Why remove it: it hides context and encourages false comparability.

2. Framework-native canonical schema
   Why it exists: adopting a framework reduces short-term design work.
   Why it survived: the framework list is high-quality.
   Why remove it: it makes external abstractions the source of truth.

3. Dashboard-first implementation
   Why it exists: dashboards make evaluation visible.
   Why it survived: visibility feels like progress.
   Why remove it: without reliable artifact bundles, the dashboard displays
   weak evidence.

4. Required LLM judge gates
   Why it exists: judges can assess qualitative outputs.
   Why it survived: many eval systems emphasize judge scoring.
   Why remove it: uncalibrated judges are drift-prone and unsafe as required
   gates.

5. Prompt-library ingestion
   Why it exists: prompt-engineering repos contain useful examples.
   Why it survived: they seem adjacent to eval design.
   Why remove it: prompt material is reference input, not harness architecture.

6. Plugin architecture
   Why it exists: extensibility feels prudent.
   Why it survived: this repo may later support multiple frameworks.
   Why remove it: phase one needs one local runner, not a plugin lifecycle.

7. Cloud-only proof path
   Why it exists: Braintrust and OTEL recipes encourage hosted observability.
   Why it survived: production eval systems often need central reporting.
   Why remove it: local artifacts must remain authoritative.

# 9. What Should Become Core

Core investments, in order:

1. Evals Executable Spine
   Package manifest, CLI, schemas, runner, deterministic scorer interface,
   artifact writer, smoke fixture, and local report generation.

2. First Two Repo-Owned Suites
   coding-harness.pr-closeout-trajectory and agent-skills.skills-doctor-contract.

3. Baseline Comparison
   A current run must be compared to a prior accepted run before the harness can
   claim regression value.

4. Fixture Provenance And Privacy
   Every case needs source, sensitivity, redaction, and retention metadata.

5. Judge Discipline
   Rubric version, judge mode, evaluator version, prompt hash, calibration set,
   and advisory/required status must be explicit.

6. Agent Operating Surface
   Minimal README.md, AGENTS.md, example command, artifact layout, and validation
   command.

7. Optional Observability
   OTEL and Braintrust export only after local run semantics are stable.

# 10. Architectural Non-Negotiables

1. Local artifact bundles are authoritative.
2. Telemetry is explanatory, never the only proof.
3. Domain truth stays in the owning repo.
4. External eval frameworks are adapters, not the canonical model.
5. Required gates are deterministic until judge calibration is proven.
6. Every fixture records provenance, privacy class, and redaction status.
7. Every run writes machine-readable output and human-readable evidence.
8. Every scorer records version and rationale.
9. Baseline comparison is a core behavior, not an optional report flourish.
10. No orchestration layer is allowed without measurable reliability gain.
11. No dashboard before repeated local artifact bundles.
12. No universal score without a documented reason and loss model.
13. No phase-one work that does not strengthen the executable spine.
14. Future agents must be able to run the smallest smoke case without reading
    multiple strategy documents.

# 11. Safe To Rewrite

These areas are safe to evolve once the non-negotiables remain intact:

- CLI command wording and flags.
- Internal file layout under source directories.
- Runner implementation language.
- Reporter formatting.
- Markdown report templates.
- Adapter internals.
- Telemetry exporter implementation.
- Optional framework integrations.
- Prompt and rubric wording when versions are preserved.
- Fixture directory naming.
- Docs organization outside canonical command and contract surfaces.
- Early package tooling if a better repo-standard path emerges.

Safe rewrite rule: rewrite aggressively when it reduces cognitive load while
preserving schema compatibility, artifact authority, and deterministic local
execution.

# 12. Strategic Risks

## Risk: The Repo Becomes A Framework Sampler

Severity: critical.
Likelihood: high.
Impact: destroys differentiation.

Response: require all framework-related work to name the canonical schema field
or runner behavior it improves. Otherwise defer.

## Risk: The Moat Remains A Thesis

Severity: critical.
Likelihood: high until fixtures exist.
Impact: no defensible system, only good documents.

Response: create real fixtures from coding-harness and agent-skills before
expanding scope.

## Risk: Generic Evals Replace Agent-Operation Evals

Severity: high.
Likelihood: medium-high.
Impact: the repo becomes easy to copy.

Response: bias cases toward workflow evidence, closeout quality, blocker
classification, artifact truth, and repo-governance failure.

# 13. Operational Risks

## Risk: No One Command

Severity: high.
Impact: future agents cannot operate reliably.

Response: first implementation must expose a single smoke command and stable
JSON output.

## Risk: Artifact Layout Drifts

Severity: high.
Impact: downstream tools and future agents lose trust.

Response: validate artifact bundle structure in tests.

## Risk: CI Arrives Before Local Proof

Severity: medium.
Impact: remote checks obscure weak local semantics.

Response: keep CI minimal until the local runner and smoke fixture are stable.

# 14. Long-Term Scaling Risks

Over 2-5 years, the system naturally evolves into a shared proof layer for
agentic development workflows across Jamie-owned repos.

Scaling pressure will appear in:

- fixture volume;
- privacy and redaction;
- baseline storage;
- scorer version migration;
- cross-repo suite discovery;
- result comparison over time;
- flaky external dependencies;
- judge calibration drift;
- context cost for future agents.

What breaks first:

1. fixture provenance if not enforced early;
2. suite ownership if centralization becomes convenient;
3. scorer trust if judge outputs are promoted too soon;
4. discoverability if docs grow faster than command surfaces;
5. adapter boundaries if external frameworks are added before schema stability.

Positive compounding occurs when repeated failures become cases quickly and
each case carries enough evidence for future agents to understand why it exists.

# 15. Governance Risks

Governance helps only when it protects execution truth.

Governance becomes drag when it adds:

- more documents than checks;
- more approval language than executable constraints;
- more architecture categories than implementation boundaries;
- more anti-drift prose than validators;
- more review ceremony than replayable cases.

Recommended governance posture:

- create a short ADR set for schema authority, local artifact authority,
  repo-local suite ownership, judge policy, and fixture provenance;
- keep merge-blocking rules tied to concrete files and commands;
- defer governance expansion until it can be enforced by validators or tests.

# 16. Agent-Native Risks

The project is agent-native only if future agents can operate it cheaply and
correctly.

Current risks:

- no repo-local AGENTS.md;
- no README.md;
- no package manifest;
- no command contract;
- no examples;
- no schema;
- no artifact bundle;
- no tests;
- no runner.

Impact: future agents will over-read strategy documents and under-execute.

Response: create a minimal agent operating surface with:

- one command;
- one smoke fixture;
- one artifact example;
- one validation command;
- one rule: artifacts decide.

# 17. Recommended Strategic Direction

## Phase 1: Evals Executable Spine

Build only:

- package manifest;
- pnpm evals run command;
- case schema;
- result schema;
- artifact writer;
- deterministic scorer interface;
- smoke fixture;
- baseline compare stub or first implementation;
- local report;
- minimal tests.

Exit condition:

- one smoke case produces a valid artifact bundle with JSON and Markdown output.

## Phase 2: Repo-Owned First Suites

Add:

- coding-harness.pr-closeout-trajectory;
- agent-skills.skills-doctor-contract;
- fixture ownership metadata;
- suite adapters that preserve repo-local truth.

Exit condition:

- both suites run locally and expose different domain evidence through the same
  result contract.

## Phase 3: Trust, Privacy, And Judge Discipline

Add:

- provenance policy;
- redaction policy;
- holdout policy;
- judge metadata;
- advisory judge examples;
- calibration requirements.

Exit condition:

- subjective evaluation can be inspected without becoming an unearned gate.

## Phase 4: Optional Integrations

Only after the above:

- Braintrust export;
- OTEL spans;
- framework adapters;
- workflow-output suites;
- dashboard/report aggregation.

Exit condition:

- integrations improve visibility without changing artifact authority.

# 18. Recommended Simplifications

- Treat all external eval frameworks as reference and adapter candidates.
- Collapse all phase-one planning into the executable-spine initiative.
- Replace broad source-mining with a short adapter-research note.
- Defer dashboard, hosted logging, and framework selection.
- Keep judge work advisory and metadata-first.
- Keep the first CLI boring.
- Keep the first schema explicit rather than extensible.
- Keep governance to contracts that can be tested.

# 19. Core Investment Priorities

1. Schema quality
   Poor schemas will make every later adapter and suite expensive.

2. Artifact integrity
   The artifact bundle is the trust surface.

3. Baseline comparison
   Regression detection is the point of the repo.

4. First suite realism
   Generic examples will not create moat.

5. Deterministic scorer library
   Required checks must be explainable and replayable.

6. Future-agent ergonomics
   Agents need cheap cognition: command, schema, artifact, failure reason.

7. Judge calibration
   Useful later, dangerous early.

# 20. Future Agent Guidance

Future agents should preserve:

- artifact authority;
- deterministic required gates;
- repo-local suite ownership;
- fixture provenance;
- baseline comparison;
- explicit judge advisory status;
- minimal command surface;
- first two suite priority.

Future agents may rewrite:

- implementation internals;
- adapter code;
- report templates;
- CLI names after migration;
- telemetry exporter details;
- docs structure;
- scorer internals when result semantics remain stable.

Future agents should challenge:

- every new abstraction;
- every new integration;
- every generic metric;
- every dashboard request;
- every judge-as-gate proposal;
- every attempt to centralize repo domain truth.

Operational rule:

If a change does not make local artifact proof more trustworthy, easier to
produce, or easier for future agents to interpret, it is probably not core.

# 21. Evidence & Traceability Matrix

| Strategic conclusion | Evidence type | Files | Affected systems/modules | Confidence | Why it matters | Operational impact |
| --- | --- | --- | --- | --- | --- | --- |
| The repo is currently strategic seed, not implemented system | repo structure and review evidence | .harness/review/2026-05-18-evals-architecture-review.md | package manifest, source, tests, CI, runner | High | Prevents treating intended capability as delivered capability | Forces executable proof before expansion |
| Local artifacts must be authoritative | intent and triage doctrine | .harness/features/2026-05-18-evals-intent.md; .harness/triage/2026-05-18-evals-triage.md | artifact bundle, result schema, runner | High | Establishes trust surface | Makes result.json and report.md core |
| Telemetry should explain, not decide | intent doctrine | .harness/features/2026-05-18-evals-intent.md | OTEL, Braintrust export, observability | High | Avoids cloud/logging-first drift | Defers Braintrust and OTEL until local run semantics exist |
| LLM judges must remain advisory until calibrated | intent, review, triage | .harness/features/2026-05-18-evals-intent.md; .harness/review/2026-05-18-evals-architecture-review.md | judge policy, scorer interface, rubric metadata | High | Prevents unstable subjective gates | Required phase-one gates stay deterministic |
| Repo-local suites own domain truth | intent and triage | .harness/features/2026-05-18-evals-intent.md; .harness/triage/2026-05-18-evals-triage.md | coding-harness, agent-skills, suite adapters | High | Avoids centralizing meaning away from owner repos | This repo owns mechanics, not repo behavior |
| The immediate initiative is Evals Executable Spine | triage decision | .harness/triage/2026-05-18-evals-triage.md | CLI, schemas, runner, artifact writer, scorers | High | Compresses execution ambiguity | All phase-one work routes to one initiative |
| The first two suites are fixed | intent and triage | .harness/features/2026-05-18-evals-intent.md; .harness/triage/2026-05-18-evals-triage.md | coding-harness.pr-closeout-trajectory; agent-skills.skills-doctor-contract | High | Prevents suite sprawl | Blocks unrelated first-suite proposals |
| The moat is not the runner | review and intent | .harness/review/2026-05-18-evals-architecture-review.md; .harness/features/2026-05-18-evals-intent.md | runner, fixture corpus, blocker taxonomy | High | Separates commodity infrastructure from defensible assets | Prioritizes real-regression corpus over platform polish |
| External frameworks are adapters, not base architecture | intent and triage | .harness/features/2026-05-18-evals-intent.md; .harness/triage/2026-05-18-evals-triage.md | Braintrust, OpenAI Evals, DeepEval, AutoEvals, FastEval, OpenEvals | Medium-high | Prevents vendor or framework lock-in | Defers adapter work until schema stability |
| Dashboard-first work is false sophistication | review and triage | .harness/review/2026-05-18-evals-architecture-review.md; .harness/triage/2026-05-18-evals-triage.md | UI and report aggregation | High | Visibility without trustworthy data is misleading | Blocks dashboard before repeated artifact bundles |
| Agent-native status is not real until command surfaces exist | review and triage | .harness/review/2026-05-18-evals-architecture-review.md; .harness/triage/2026-05-18-evals-triage.md | README, AGENTS, CLI, examples | High | Agents need deterministic operation, not just strategy | Requires minimal operating surface early |
| Governance must stay executable | interpretation from all artifacts | .harness/features/*.md; .harness/review/*.md; .harness/triage/*.md | ADRs, validators, schema checks | Medium-high | Avoids ceremony | Governance should become tests or validators |
| Prompt-engineering sources are reference material, not core eval architecture | user source list and strategy interpretation | current strategy thread and prior artifacts | prompt guide ingestion, rubric design | Medium | Avoids prompt-library drift | Keep source mining as optional research note |
| Braintrust recipes are useful later but not phase-one base | user source list and intent doctrine | current strategy thread; .harness/features/2026-05-18-evals-intent.md | OTEL logging, API agent recipe, prompt injection detector, release notes, GitHub issues | Medium-high | Separates observability/use-case examples from core proof loop | Defer until local artifact and suites exist |
| Baseline comparison is core, not optional analytics | intent and triage | .harness/features/2026-05-18-evals-intent.md; .harness/triage/2026-05-18-evals-triage.md | baseline store, comparator, report | High | Evals need regression signal | Include baseline semantics in executable spine |

## Final Strategic Decision

Build the smallest local proof system that can make one real agent-work failure
replayable, scored, reported, and comparable.

Do not build an eval platform yet.

Do not choose a framework as the base.

Do not add dashboards, judge gates, or telemetry before local artifact proof.

Protect the corpus, the schema, the artifact contract, the provenance model,
and the repo-local ownership boundary. Everything else is replaceable.
