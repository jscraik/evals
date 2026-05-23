# Evals Real-Case Adoption Reframe

schema_version: 1
date: 2026-05-23
status: proposed
selected_candidate: real-case adoption contract

## Command Summary

BLUF: This artifact defines how Jamie and future agents should move evals from a self-verifying executable spine into a real-case adoption loop without importing sibling repo authority. The document matters because local readiness can otherwise hide the risk that evals remains strategically unproven for coding-harness and other projects. The next step is to plan one manual case-promotion record for a sanitized coding-harness review-artifact failure before changing schemas, scorers, adapters, dashboards, source mining, or judge gates.

Decision Needed: approve, revise, or block the real-case adoption migration before implementation starts.

Top Risks: private source leakage, sibling-runtime dependency drift, subjective scoring, and local readiness being mistaken for downstream usefulness.

Next Action: route to he-plan or he-work for one manual case-promotion record with privacy, provenance, deterministic classification, rollback, and validation fields.

## Migration Preamble

Migration decision: move evals from a self-verifying executable spine to a real-case adoption loop that can promote one sanitized downstream failure into a deterministic fixture without importing sibling repo authority.

Risk consequence: if this migration is skipped, evals can keep reporting local readiness while remaining strategically unproven for coding-harness and other projects.

Smallest reversible step: add one manual case-promotion record for a sanitized coding-harness review-artifact failure candidate before changing schemas, scorers, adapters, dashboards, or source-mining workflows.

Stop or pivot condition: stop if the candidate needs private unredacted data, imports coding-harness runtime code, depends on subjective prose judgment, or requires a dashboard, adapter, cloud runner, plugin system, or LLM judge gate to produce value.

## Stage Arc Boundary

    stage_arc_boundary:
      left_arc:
        source_of_truth:
          - /Users/jamiecraik/dev/evals on main
          - AGENTS.md
          - README.md
          - UBIQUITOUS_LANGUAGE.md
          - .harness/core/2026-05-18-evals-core.md
          - .harness/references/local-reuse-map.md
          - .harness/evals/evals-evals-executable-spine-eval.md
        entry_authority: explicit
        freshness_required: fresh
        not_proof:
          - local evals readiness is not downstream project usefulness
          - synthetic runtime fixtures are not real project adoption proof
          - this reframe does not create Linear issues, implementation, or closure
      active_arc:
        owned_stage: he-reframe
        allowed_actions:
          - write a local architecture-evolution artifact
          - define staged migration boundaries
          - define rollback and eval proof
        forbidden_actions:
          - mutate runtime code
          - create Linear or GitHub objects
          - add dashboards, adapters, cloud runners, source mining, plugin systems, or judge gates
          - import sibling repo runtime authority
        mutation_boundary: local_artifact
      right_arc:
        handoff_target: he-plan or he-work
        handoff_artifact: .harness/reframes/2026-05-23-evals-real-case-adoption.md
        proof_required:
          - one manual case-promotion record
          - one sanitized coding-harness-derived fixture
          - deterministic expected classification
          - pnpm test
          - pnpm evals check --json
          - pnpm evals state --json
          - pnpm verify
        closure_boundary: not_closure
        resume_key: evals-real-case-adoption
      persona_lenses:
        coding_lens: conditional
        testing_lens: required
        coverage_parity_required: no

## Reframe Classification

- architecture-evolution safety rail
- downstream adoption boundary
- deterministic eval-quality hardening
- governance simplification
- anti-drift control surface

## Problem Statement

The evals repo now has a working executable spine and runtime-evidence
trust-boundary checks, but its usefulness is still mostly proven against
synthetic or repo-local cases. The current local state can be healthy while the
project remains unproven as a tool for coding-harness.

The structural issue is that the project has a strong artifact contract but no
bounded promotion path from a real downstream delivery failure into an eval case.
Without that path, future work can drift toward attractive expansion surfaces:
dashboards, adapters, cloud runners, source mining, plugin architecture, or
judge gates. Those surfaces would make evals look more complete while delaying
the first proof that it catches a real project failure earlier.

This reframe defines the migration from self-proof to real-case adoption. It is
not an implementation spec and does not authorize broad runtime changes.

## Root Cause Analysis

The current shape emerged intentionally. Phase one had to prove local schemas,
runner mechanics, artifacts, deterministic scorers, baseline result shape,
trace events, and closure evidence before evals could safely consume real
project failures.

That structure survived because the repo's doctrine is correct: artifacts
decide, telemetry explains, judges advise until calibrated, and repo-local
suites own domain truth. Building adapters or mining sibling repos before the
local artifact spine worked would have created hidden lifecycle authority.

The pressure has changed. The local spine is now healthy enough that the next
risk is not missing infrastructure; it is strategic self-reference. A healthy
local spine can still fail the practical test Jamie cares about: catching a
repeatable coding-harness failure in a way that is deterministic, redacted, and
locally replayable.

The force keeping the current structure in place is safety. The repo correctly
blocks dashboards, adapters, source mining, and runtime dependencies. The next
migration must preserve those blocks while introducing a narrow manual bridge
from real incidents to sanitized cases.

## Evidence

Fact:

- AGENTS.md says evals owns shared runner mechanics, schemas, artifact bundles,
  deterministic scorer contracts, baseline shape, and closure evidence.
- AGENTS.md says consuming repositories own suite intent, real fixtures,
  rubrics, thresholds, privacy approval, and baseline promotion.
- .harness/core/2026-05-18-evals-core.md states: artifacts decide, telemetry
  explains, LLM judges advise until calibrated, repo-local suites own truth, and
  external frameworks are adapters.
- UBIQUITOUS_LANGUAGE.md defines the runtime evidence contract as a portable
  offline fixture/scorer contract for Codex-shaped runtime behavior.
- .harness/evals/evals-evals-executable-spine-eval.md records that JSC-346
  runtime-evidence hardening is locally complete for runtime state health,
  policy coverage, subagent artifact identity, and credential scan proof roots.
- .harness/references/local-reuse-map.md says sibling repos may inform schema
  design but must not become runtime dependencies or shared verdict authority.
- Current local evidence before this reframe showed git status --short --branch
  clean on main, pnpm evals state --json passing with runtime-evidence health
  ready, and pnpm evals check --json passing.

Interpretation:

- Evals has enough machinery to prove local artifact health.
- Evals does not yet have a proven downstream adoption loop.
- The next useful migration is case promotion, not platform expansion.
- The first real-case fixture should be narrow enough to exercise existing
  artifact and runtime-evidence strengths without requiring a new adapter.

Assumption:

- A sanitized coding-harness review-artifact or closeout-contradiction case can
  be represented without private content and without importing coding-harness
  runtime code.
- The first downstream case can start as a manual promotion record before a
  formal schema is accepted.
- Linear objects may remain represented as mapping guidance until tracker
  mutation is explicitly authorized and available.

Confidence: high that the migration is needed; medium that the first fixture
should be the review-artifact failure until the exact sanitized source evidence
is selected.

## Architectural Impact

Affected systems:

- fixtures/**
- schemas/**
- src/lib/runtime-evidence-contract.js
- src/lib/runtime-state.js
- scripts/verify.js
- .harness/evals/**
- .harness/reframes/**
- future case-promotion records

Blast radius: medium if implemented as a new public contract; low for the first
manual promotion record and fixture candidate.

Schema impact: likely, but not in phase 1. A durable case-promotion schema
should be introduced only after the first manual record proves the field set.

Runtime impact: none in the reframe stage. Runtime changes require downstream
he-plan or he-work.

Data boundary: real project evidence must be redacted, provenance-backed, and
owned by the consuming repo's suite intent. Evals can store the sanitized case
and deterministic expected classification, not private source material.

Rollback posture: delete the candidate promotion record and fixture, then return
to synthetic runtime-evidence cases. No external service state should be needed.

Maintainability risk: uncontrolled field growth in the promotion record. Keep
the first record deliberately small and let observed scorer needs drive schema
promotion.

## Desired End State

Evals can answer a practical usefulness question:

Did this repo catch a real, sanitized delivery failure from a downstream project
through a deterministic local fixture before that failure would have escaped
again?

Desired operating loop:

    real failure
      -> sanitized promotion candidate
      -> deterministic expected classification
      -> eval fixture
      -> scorer result
      -> artifact bundle
      -> state/check proof
      -> baseline promotion decision

Desired status split:

- local spine readiness remains a repo-health signal.
- downstream adoption status becomes a separate usefulness signal.
- scaffolded runtime-evidence families are promoted only when backed by real
  cases.
- consuming repos retain domain truth and privacy approval.

## Migration Strategy

Use manual, reversible adoption before automation.

1. Record one real-case promotion candidate without changing runtime code.
2. Convert the candidate into one sanitized fixture only after privacy and
   deterministic expected classification are clear.
3. Add the smallest scorer or scorer extension needed to classify that fixture.
4. Extend state/check output only after there is at least one downstream suite
   signal worth reporting.
5. Promote the field set into a schema only after one manual record survives
   implementation and validation.

Coexistence rule: synthetic smoke and runtime-evidence fixtures remain valid.
The new downstream fixture adds adoption proof; it does not replace local spine
readiness.

Compatibility rule: no runtime dependency on /Users/jamiecraik/dev/coding-harness
or /Users/jamiecraik/dev/agent-skills.

Deletion rule: remove any proposed field, phase, or artifact that does not help
classify the first real-case fixture deterministically.

## Smallest Reversible Step

Create one manual case-promotion candidate for a sanitized coding-harness
review-artifact failure, with these fields:

- candidate id
- source repo
- source incident reference
- privacy and redaction status
- promoted failure class
- expected deterministic classification
- required artifact identities
- scorer owner
- baseline expectation
- approval status
- rollback condition

Do not add a new schema in this first step unless implementation discovers that
manual validation cannot protect the boundary.

## Execution Phases

### Phase 1 - Manual Promotion Candidate

Objective: prove the field set for one real-case promotion before changing
runtime contracts.

Affected systems: .harness/evals/** or a future .harness/case-promotions/**
path selected by he-plan.

Expected risk: low.

Feedback expected from this phase: whether the source evidence can be redacted,
owned, and classified without private content or sibling runtime dependencies.

Stop or pivot condition: the candidate requires private raw transcript content,
subjective prose scoring, or imported coding-harness code.

Can run in parallel: no.

Validation requirements: manual record contains all required fields and cites
only repo-safe evidence.

Rollback conditions: delete the candidate record; no runtime behavior changes.

Linear mapping: child issue under the evals real-case adoption parent.

Agent-safe: yes.

Human review required: yes, for privacy and source ownership.

### Phase 2 - Sanitized Fixture

Objective: convert the accepted candidate into one fixture that represents the
failure without carrying private source material.

Affected systems: fixtures/**, schemas/runtime-evidence-case.schema.json if the
existing schema cannot express the case, and related tests.

Expected risk: medium.

Feedback expected from this phase: whether the existing runtime-evidence case
shape can represent downstream review-artifact failures.

Stop or pivot condition: the fixture needs a new adapter, source miner, hosted
runner, or judge to be meaningful.

Can run in parallel: no.

Validation requirements: fixture validates and expected classification is
deterministic.

Rollback conditions: delete the fixture and tests; keep the manual candidate as
deferred evidence if privacy approval remains valid.

Linear mapping: child issue for sanitized fixture admission.

Agent-safe: assisted.

Human review required: yes, if source provenance or redaction is uncertain.

### Phase 3 - Scorer Or Extension

Objective: implement the smallest deterministic scorer behavior required by the
fixture.

Affected systems: src/lib/runtime-evidence-contract.js, related tests, and
possibly runtime-evidence schema definitions.

Expected risk: medium.

Feedback expected from this phase: whether the case can be classified through
artifact identity and event evidence rather than narrative claims.

Stop or pivot condition: the scorer would need project-specific thresholds,
private repo state, or subjective quality judgment.

Can run in parallel: no.

Validation requirements: positive, negative, stale, and path-boundary tests for
the expected classification.

Rollback conditions: revert scorer changes and keep the fixture quarantined.

Linear mapping: child issue for deterministic classification.

Agent-safe: assisted.

Human review required: no, unless scorer semantics change public terminology.

### Phase 4 - Adoption Status Signal

Objective: separate local spine readiness from downstream project usefulness.

Affected systems: src/lib/runtime-state.js, schemas/runtime-state.schema.json,
README.md, and closure eval artifacts.

Expected risk: medium.

Feedback expected from this phase: whether state output can report downstream
suite adoption without overstating project authority.

Stop or pivot condition: the status implies evals owns coding-harness domain
truth, thresholds, or baseline promotion.

Can run in parallel: yes, after Phase 2 produces a stable fixture shape.

Validation requirements: state/check output distinguishes local readiness from
downstream adoption status.

Rollback conditions: remove the adoption field and leave fixture/scorer proof
intact.

Linear mapping: child issue for state signal hardening.

Agent-safe: assisted.

Human review required: no, unless public CLI semantics change.

### Phase 5 - Schema Promotion

Objective: promote the manual case-promotion record into a canonical schema only
after the first adoption loop proves the field set.

Affected systems: schemas/**, scripts/verify.js, tests, and documentation.

Expected risk: medium.

Feedback expected from this phase: whether future real-case promotions can be
validated without source-mining automation.

Stop or pivot condition: the schema becomes a generic dataset registry,
workflow tracker, or broad incident-management format.

Can run in parallel: no.

Validation requirements: schema validation, fixture validation, state/check, and
verify gates pass.

Rollback conditions: revert the schema and keep the first candidate as a local
documented exception.

Linear mapping: child issue for promotion contract hardening.

Agent-safe: assisted.

Human review required: yes, for final field semantics.

## Linear Mapping

Workspace/team: Jscraik / JSC.

Recommended parent issue title: Tighten evals real-case adoption loop.

Recommended child issues:

- Record first manual coding-harness case-promotion candidate.
- Add sanitized review-artifact failure fixture.
- Implement deterministic classification for promoted fixture.
- Separate local readiness from downstream adoption status.
- Promote case-promotion fields into schema after first proof.

Tracker note: do not create or mutate Linear objects from this reframe. Preserve
the repo's tracker override rule until Linear issue creation is explicitly
available and authorized.

## Anti-Regression Constraints

- Do not add dashboards before local downstream fixture proof.
- Do not add external adapters before at least one repo-local downstream suite
  exists and passes.
- Do not add source-mining automation for the first case.
- Do not make telemetry, PR comments, summaries, or judge reports authoritative.
- Do not import sibling repo runtime code.
- Do not let evals own coding-harness thresholds, rubrics, baseline promotion,
  or domain truth.
- Do not represent local spine readiness as downstream usefulness.
- Do not promote scaffolded runtime-evidence families without a real fixture.

## Eval Requirements

Expected closure proof artifact:

    .harness/evals/2026-05-23-evals-real-case-adoption-eval.md

Required proof for the first implementation slice:

- manual promotion candidate exists and is redacted
- source repo and source incident reference are recorded
- privacy approval status is explicit
- deterministic expected classification is named
- fixture validates
- scorer reports the expected classification
- latest artifact bundle includes result, manifest, scorer result, baseline
  result, trace events, and latest pointer
- state/check output remains truthful about local readiness versus downstream
  adoption

Minimum commands for the first implementation slice:

- pnpm test
- pnpm evals check --json
- pnpm evals state --json
- pnpm verify

## Success Criteria

- One coding-harness-derived failure is represented as a sanitized local case.
- The case can be classified deterministically without private source material.
- The result is visible in artifact evidence, not only prose.
- Evals continues to run without sibling repo runtime dependencies.
- The repo can truthfully report both local spine readiness and first downstream
  adoption proof.
- Deferred expansion surfaces remain blocked until the adoption loop has real
  proof.

## Safe Rollback Conditions

Rollback is safe when:

- the manual candidate is ambiguous, sensitive, or not deterministic;
- the fixture requires private content or sibling runtime code;
- the scorer would encode coding-harness domain thresholds as shared evals
  authority;
- validation fails for reasons introduced by the migration;
- state/check output becomes less truthful about readiness versus usefulness.

Rollback action:

1. Delete the candidate fixture and related tests.
2. Revert scorer or state changes.
3. Keep this reframe as deferred evidence if the migration remains desirable.
4. Record the blocker in the expected closure eval path.

## Future-Agent Guidance

Start with the smallest real failure. Prefer a review-artifact or closeout
contradiction case because the current runtime-evidence contract already has
subagent artifact and artifact identity concepts.

Before editing runtime code, write the promotion candidate and ask whether the
case can be judged from artifact/event evidence alone. If not, stop.

When implementing, preserve deep module ownership. Do not spread promotion
logic across fixtures, docs, generated artifacts, and agent prompts without a
single owner module and validation gate.

Treat this reframe as a migration safety rail. It is not permission to build a
dashboard, adapter, source miner, cloud runner, plugin system, or judge gate.

## Related Systems

- /Users/jamiecraik/dev/evals/AGENTS.md
- /Users/jamiecraik/dev/evals/README.md
- /Users/jamiecraik/dev/evals/UBIQUITOUS_LANGUAGE.md
- /Users/jamiecraik/dev/evals/.harness/core/2026-05-18-evals-core.md
- /Users/jamiecraik/dev/evals/.harness/references/local-reuse-map.md
- /Users/jamiecraik/dev/evals/.harness/evals/evals-evals-executable-spine-eval.md
- /Users/jamiecraik/dev/evals/schemas/runtime-evidence-case.schema.json
- /Users/jamiecraik/dev/evals/src/lib/runtime-evidence-contract.js
- /Users/jamiecraik/dev/coding-harness as source evidence only, not runtime dependency

## Source Prompt Family Status

source_prompt_family_status: preserved

The source strategy readout is treated as strategic intake evidence. This
program converts it into a bounded migration safety rail and does not replace
the existing strategy artifact lane.

## Subagent Policy

he-reframe: applied

subagent_policy: conditional

roles_used: none

roles_recommended:

- repo-research-analyst
- learnings-researcher
- architecture-strategist
- scope-guardian-reviewer
- deployment-verification-agent

roles_missing: none blocking

## Git Staging Status

git_staging_status: not_staged

staged_paths: []
