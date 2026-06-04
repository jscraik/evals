---
schema_version: 1
artifact_id: 2026-06-04-external-evals-suite-authority-plan
artifact_type: he-plan
canonical_slug: external-evals-suite-authority
title: External Evals Suite Authority Plan
harness_stage: he-plan
status: plan_ready_implementation_approval_required
date: 2026-06-04
source: .harness/specs/2026-06-04-external-evals-suite-authority-spec.md
source_artifact_type: he-spec
origin: .harness/research/audits/2026-06-04-external-evals-suite-gap-review.md
plan_path: .harness/plan/2026-06-04-external-evals-suite-authority-plan.md
route: evals-router-to-he-plan
stage: he-plan
scope: implementable_first_slice_only
risk: high
interactive_status: complete_no_questions
selection_evidence: Reviewed the approved external evals suite authority spec, evals-router guidance, HE plan contract, repo core doctrine, ubiquitous language, architecture map, and current plan artifact shape.
safe_to_continue: false
blocked_reason: implementation_not_authorized_in_this_turn
linear_mutation_status: confirmation_required
linear_action_required: create_or_link_external_evals_suite_authority_issue_if_implementation_is_approved
linear_status: not_created_confirmation_required
linear_milestone: external-evals-suite-authority-pending-linear-confirmation
traceability_required: false
git_staging_status: unstaged
staged_paths: []
post_plan_handoff_state: awaiting_user_choice
confidence: 90_percent_plan_spec_aligned_pending_implementation_approval_tracker_decision_and_runtime_validation
stage_arc_boundary:
  left_arc:
    source_of_truth: local_spec_plus_repo_doctrine
    entry_authority: explicit_user_request
    freshness_required: fresh
    not_proof: plan_does_not_prove_code_tests_ci_pr_tracker_or_target_runtime_behavior
  active_arc:
    owned_stage: he-plan
    allowed_actions: read_source_artifacts_and_write_local_plan
    forbidden_actions: product_code_edits_tracker_mutation_pr_mutation_commit_push_merge
    mutation_boundary: local_artifact
  right_arc:
    handoff_target: he-work_or_he-linear-plan_after_user_choice
    handoff_artifact: .harness/plan/2026-06-04-external-evals-suite-authority-plan.md
    proof_required: artifact_shape_checks_identity_lint_traceability_lint_and_repo_validation_before_implementation_closeout
    closure_boundary: not_closure
    resume_key: external-evals-suite-authority
  persona_lenses:
    coding_lens: required
    testing_lens: required
    coverage_parity_required: yes
---

# External Evals Suite Authority Plan

## Command Summary

BLUF: This plan converts the approved external evals suite authority spec into a bounded first implementation slice: add an external project manifest contract, add one authority classifier owner, label artifact-only external inspection truthfully, expose agent/human/blocked next-action partitions, and add privacy approval evidence shape without opening black-box execution or judge authority. The work matters because evals can already validate artifact bundles from another repo, but that proof can be misread as independent target behavior proof unless the JSON contract states what authority was actually exercised. Execution is limited to local schemas, src/lib owner modules, command output wiring, fixtures, tests, and deterministic validation gates; dashboards, cloud runners, plugin systems, source mining, hosted telemetry authority, required judge gates, sibling runtime dependencies, and target command execution remain forbidden. The highest risk is widening external behavior authority before policy and proof boundaries exist, so each work unit preserves additive public JSON, repo-relative paths, fail-closed manifest policy, and explicit non-proof claims. The handoff after this plan is an explicit user choice: authorize he-work for PU-001 through PU-005 or run he-linear-plan to create/link a tracker first.

Decision Needed: Jamie must approve implementation and decide whether to create or link a Linear issue before he-work begins.

Execution Invariant: No he-work may start from this artifact until approval evidence exists for this exact plan path and scope.

Top Risks:

- External artifact consistency may still be mistaken for target behavior proof if authority_mode and non-proof claims are incomplete.
- Manifest work may accidentally become a broad adapter or execution framework instead of a local data contract.
- Black-box execution may be implemented prematurely even though the source spec marks it blocked until a later phase-opening decision.
- Judge terminology may be placed on the authority axis instead of the evaluator axis, creating false governance weight.
- Public schema names such as .evals/project.json and privacy_class enums may become durable before compatibility is consciously chosen.

Next Action: If implementation is approved, execute PU-001 first and stop before any black-box execution, judge validation, dataset lifecycle, suite report, feedback-loop artifact, tracker mutation, PR mutation, commit, or push that is not separately authorized.

## Objective

Create the first executable authority-boundary increment for external evals without changing evals into a target behavior oracle. The implementation objective is to make external artifact inspection self-describing and fail-closed by adding a manifest contract, a single authority classifier, artifact-only mode output, privacy approval evidence shape, and acceptance tests tied to the approved VAC IDs.

This plan deliberately does not implement the broader future contract candidates from the spec. Bounded black-box execution, evaluator descriptor catalogs, canonical score objects, dataset/label/split lifecycle, judge validation, suite decision reports, and feedback-loop artifacts stay outside the first implementation slice unless Jamie approves a later phase-opening artifact.

## Source Contract

| Source | Role | Freshness / Status |
|---|---|---|
| .harness/specs/2026-06-04-external-evals-suite-authority-spec.md | Canonical behavior and acceptance contract | present; status draft_ready_for_he_plan |
| .harness/research/audits/2026-06-04-external-evals-suite-gap-review.md | Gap queue and readiness assessment | present; origin for source spec |
| .harness/core/2026-05-18-evals-core.md | Core doctrine: artifacts decide, telemetry explains, local-first proof contracts | binding |
| UBIQUITOUS_LANGUAGE.md | Stable repo vocabulary and candidate term discipline | binding |
| ARCHITECTURE.md | Code placement and boundary map | binding for owner-module choices |
| AGENTS.md | Phase-one hard blocks, validation, closure evidence, tracker rule | binding |
| /Users/jamiecraik/dev/agent-skills/.agents/skills/evals-router/SKILL.md | Eval routing guidance | used to preserve deterministic, local-artifact-first eval planning |
| /Users/jamiecraik/dev/agent-skills/Plugins/cache/agent-skills-local/harness-engineering/0.1.0/skills/he-plan/SKILL.md | HE planning workflow | used to shape this durable plan |

Source acceptance IDs:

| Acceptance | Scope Class | Required Proof |
|---|---|---|
| VAC-001 | implementable_first_slice | External JSON exposes authority_mode and distinguishes artifact_only from later black_box_execution without modeling judges as authority modes. |
| VAC-002 | implementable_first_slice | --repo-root artifact inspection remains read-side only and does not execute target behavior. |
| VAC-003 | implementable_first_slice | A manifest path decision artifact exists; the approved manifest schema validates identity, policy, privacy, artifact, baseline, and execution fields; authority classifier output emits blocked or human-approval-required actions for requested black_box_execution when no valid manifest exists. No public behavioral run command or target execution path is added in this slice. |
| VAC-005 | implementable_first_slice | Manifest, suite, case, artifact, and dataset pointers reject absolute paths and parent traversal where first-slice fields exist. |
| VAC-013 | implementable_first_slice | Missing runtime evidence is not_configured or blocked, never success. |
| VAC-014 | implementable_first_slice | Existing smoke and artifact-only commands remain compatible. |
| VAC-015 | all scopes | Phase-one hard blocks remain enforced. |
| VAC-016 | implementable_first_slice | Agent-readable next actions are partitioned into agent-allowed, human-approval-required, and blocked actions. |
| VAC-004 | blocked_phase_opening_candidate | Black-box execution remains blocked until later approval. |
| VAC-006 through VAC-012 | future_contract_candidate | Out of first-slice scope; preserve as future plan candidates only. |

Requirement trace:

| Requirement | Planned Unit |
|---|---|
| FR-001, FR-002 | PU-002, PU-003 |
| FR-003, FR-019 | PU-003 |
| FR-004, FR-005, FR-008 | PU-001 |
| FR-018, FR-022 | PU-002 |
| NFR-001, NFR-002, NFR-006, NFR-007 | PU-001 through PU-005 |
| NFR-003, NFR-008 | PU-002 through PU-005 |

## Scope and Boundaries

Allowed implementation paths and areas:

- src/lib/schema.js, only if a new manifest schema key must be registered.
- src/lib/repo-root-option.js, only if artifact-only external inspection labeling needs read-side root context.
- src/lib/runtime-state.js, only if state --repo-root output needs authority classification and next-action partitions.
- src/lib/latest-run.js, only if check --repo-root output needs proof context or recovery data already owned by latest validation.
- src/commands/validation.js, for check command output wiring only.
- src/commands/state.js, for state command output wiring only.
- new focused owner modules under src/lib/**, especially a manifest contract owner and authority classifier owner.
- schemas/** for project manifest, authority classification, privacy approval evidence, or additive runtime-state/check output schema where needed.
- fixtures/** for positive and negative manifest, artifact-only, and path-boundary cases.
- test/** or tests/** following the existing Node test style.
- UBIQUITOUS_LANGUAGE.md only if implementation accepts new terms and needs durable vocabulary.
- ARCHITECTURE.md only if implementation introduces a new stable owner module worth mapping.
- .harness/decisions/** for the manifest path compatibility decision.
- .harness/approvals/** or .harness/linear/** for approval or tracker evidence when separately authorized.
- .harness/review/** for reviewer artifacts.
- .harness/plan/**, .harness/specs/**, .harness/evals/**, .harness/memory/** evidence surfaces when required by repo guidance.

Forbidden paths, capabilities, and areas for this plan:

- Black-box target command execution, API calls, or target behavior observation.
- Networked execution, hosted telemetry authority, dashboards, cloud runners, plugin systems, source-mining automation, or external adapter roots.
- Required LLM judge gates or judge-backed required verdicts.
- Runtime dependencies on coding-harness, agent-skills, OpenTelemetry collectors, Phoenix, Langfuse, Braintrust, LangSmith, or sibling repos.
- Target repo baseline promotion, target domain threshold ownership, PR readiness, CI readiness, review-thread readiness, tracker closure, or production readiness claims.
- Public command additions or renames without a compatibility decision.
- Package installs or dependency changes unless separately approved.
- Tracker mutation, PR mutation, commit, push, merge, or branch deletion from this planning stage.

Implementation-time unknowns:

- Whether the manifest filename remains .evals/project.json or becomes .evals/evals.project.json must be decided in PU-001 before code commits to a public schema path.
- The privacy_class enum must be small and target-owned, but exact enum values should be chosen during schema design.
- The first-slice output schema may either introduce a dedicated authority-classification object or embed fields in existing check/state JSON; the authority classifier must remain the single owner either way.
- If current schema tooling cannot express a needed semantic rule, place semantic validation in one src/lib owner rather than spreading checks through command modules.

Required decision artifact:

- Before schema registration, PU-001 MUST write .harness/decisions/2026-06-04-external-project-manifest-path.md or an explicitly equivalent .harness/decisions artifact naming the selected manifest path, rejected alternative, compatibility rationale, migration risk, and reviewer acceptance condition.
- Implementation MUST stop if that decision artifact is absent or does not name this plan path.

## Authority and Scope Boundary

requested_depth: standard_tracked_implementation_plan.

approved_execution_boundary: local plan artifact only for this turn. Implementation, tracker mutation, PR mutation, commit, push, and target repo execution are not authorized by plan creation.

downscope_authority: evals-router frames this as an eval-contract plan, and the approved spec restricts implementation to the implementable_first_slice. This plan cannot expand into blocked_phase_opening_candidate or future_contract_candidate scope without a later user approval or ADR/spec.

external_mutation_boundary: none during planning. Future implementation must not mutate target repos except by reading existing artifact bundles through artifact-only inspection paths already supported by evals.

proof_boundary: This plan can prove only that a durable planning artifact exists and passes plan validation. It cannot prove implementation, tests, CI, PR state, review state, tracker state, target behavior, or merge readiness.

non_proof_sources: Chat summaries, session memory, model confidence, telemetry spans, hosted dashboards, PR comments, Linear status, and target repo prose do not prove evals-owned acceptance criteria unless fresh commands or schema-backed local artifacts validate them.

freshness_required: before implementation, refresh git status, current source files, current tests, and tracker state if a tracker lane is used.

human_acceptance_boundary: Jamie must approve he-work and tracker action before code changes or Linear mutation.

approval_evidence_required: implementation may proceed only after a current-turn user instruction explicitly authorizes he-work for this plan, or after a durable approval artifact under .harness/approvals/ or .harness/linear/ names this plan path, approved scope, tracker decision, approver, timestamp, and still-forbidden scope.

## Current State / Evidence

| Surface | Current Evidence | Plan Consequence |
|---|---|---|
| Source spec | First slice is manifest, authority classifier, artifact-only authority-mode output, and privacy approval evidence shape. | Plan only PU-001 through PU-005 first-slice work. |
| Source spec blocked scope | Black-box execution is explicitly blocked until a later phase-opening decision. | No work unit implements target commands or API calls. |
| Source spec judge boundary | Judge output is an evaluator axis, not authority_mode. | PU-002 keeps judge status out of authority-mode enum. |
| Repo core | Artifacts decide, telemetry explains, judges advise until calibrated. | Validation uses deterministic checks and local artifacts. |
| UBIQUITOUS_LANGUAGE.md | Existing vocabulary includes artifact bundle, runtime state packet, runtime evidence contract, deterministic verdict, scorer result, baseline result. | New terms remain candidate unless implementation accepts them. |
| ARCHITECTURE.md | src/cli.js routes; command modules wire; src/lib owners hold proof behavior. | New authority logic belongs in src/lib owner modules, not command duplication. |
| AGENTS.md | Phase-one hard blocks and pnpm verify gate are binding. | PU-005 includes full repo validation and hard-block proof. |

Planning-stage validation snapshot:

| Command / Check | Expected Result | Notes |
|---|---|---|
| HE plan BLUF validator | required | Run after this artifact is written. |
| HE plan artifact shape validator | required | Run after this artifact is written with kind plan. |
| HE artifact identity lint | required | Run because identity lint script exists. |
| HE Linear traceability lint | not_applicable_until_linear_issue_exists | Run after he-linear-plan creates or links a real Linear issue key. |
| pnpm test | required | Proves current repo tests still pass with planning artifact present. |
| pnpm verify | required before implementation closeout | Optional for plan-only closeout but recommended if time permits. |

## Implementation Strategy

Execute the first slice as a sequence of small, reversible public-contract moves. Start with the manifest schema because it defines what external authority may be claimed. Then add an authority classifier owner because callers must not reconstruct authority mode from flags, manifest fields, or prose. Only after the owner exists should check/state output expose artifact_only, non-proof claims, and next-action partitions.

Implementation principles:

- Write or update a deep module fix packet before runtime/schema edits.
- Keep each public JSON change additive unless a compatibility decision records otherwise.
- Keep manifest and artifact paths repo-relative and fail closed on absolute paths or parent traversal.
- Keep --repo-root read-side only.
- Put authority classification in one src/lib owner.
- Keep target repo domain truth, thresholds, privacy approval, and baseline promotion target-owned.
- Prefer deterministic tests and schema validation over judge or narrative evidence.
- Preserve canonical smoke behavior and existing artifact bundle checks.
- Treat black-box execution as blocked output, not implementation work.

Recommended execution order:

1. PU-001: decide and add the project manifest contract.
2. PU-002: add the authority classifier owner and machine-readable action partitions.
3. PU-003: wire artifact-only authority output into external check/state paths while proving read-side behavior.
4. PU-004: add privacy approval evidence shape and not_required handling.
5. PU-005: update accepted vocabulary and architecture notes only where implementation changed durable terms or owner modules, then run validation and record evidence.

## Runtime Persistence and State

runtime_state: planning_artifact_written; implementation_not_started.

proof_boundary: the plan artifact and its validation commands prove only planning completeness, not implementation, tests, CI, PR, tracker state, merge readiness, or target behavior.

resumption_key: external-evals-suite-authority.

runtime_invocation_receipt: not_applicable_for_plan_creation; future implementation must cite exact commands, artifact paths, and test outputs.

artifact_chain_key: external-evals-suite-authority.

persistent_artifacts:

- .harness/specs/2026-06-04-external-evals-suite-authority-spec.md
- .harness/plan/2026-06-04-external-evals-suite-authority-plan.md
- future implementation evidence artifacts, if he-work is approved
- future closure eval, if code changes are implemented and closed

live_state_refresh: required before he-work starts and again before closeout.

session_evidence_status: useful as planning trace only; not proof of implementation or external runtime behavior.

## Enforcement Contract

essential_decisions:

- authority_mode must be machine-readable and distinguish artifact_only from later approved black_box_execution.
- Judge output must remain an evaluator axis and cannot become authority_mode.
- --repo-root artifact inspection must remain read-side only.
- The project manifest must exist before any later behavioral external mode can run.
- Missing or unavailable runtime evidence must be not_configured or blocked, never success.
- Agent-allowed, human-approval-required, and blocked next actions must be separately machine-readable.
- Phase-one hard blocks remain binding.

fillable_gaps:

- Exact manifest file name, as long as the compatibility decision is recorded before schema commitment.
- Exact privacy_class enum names.
- Exact module names, as long as src/lib ownership stays clear and command modules do not duplicate classification logic.
- Exact JSON nesting for authority classification, as long as stable fields are schema-backed or covered by golden output tests.
- Exact fixture path placement under existing fixture/test conventions.

guardrails:

- JSON schema tests for manifest and privacy approval evidence.
- Positive and negative manifest fixture tests.
- Missing manifest test expressed only through authority classifier output: requested black_box_execution produces blocked_actions or human_approval_required_actions when no valid manifest exists. Do not add a public behavioral run command or target execution path in the first slice.
- Path traversal and absolute path rejection tests for manifest-controlled paths.
- Artifact-only read-side test using a sentinel target command that would fail if executed.
- Output tests for authority_mode, non-proof claims, not_configured runtime evidence, and next-action partitions.
- pnpm test.
- pnpm evals run fixtures/smoke/pr-closeout.case.json --json.
- pnpm evals check --json.
- pnpm evals check --smoke --json.
- pnpm evals state --json.
- pnpm verify before closeout.

refusal_triggers:

- An implementation tries to run target commands or APIs under this first slice.
- An implementation requires network execution, hosted observability, dashboards, plugin hooks, source mining, or sibling repo runtime dependencies.
- Judge output is proposed as required verdict authority.
- authority_mode cannot distinguish artifact-only inspection from behavior execution.
- Privacy approval ownership or baseline promotion ownership becomes ambiguous.
- Public CLI or JSON breaking changes are required without a migration decision.

durable_memory:

- Update UBIQUITOUS_LANGUAGE.md only when implementation accepts new terms.
- Record repeated failure classes in .harness/memory/LEARNINGS.md when a durable fix is made.
- Keep .harness/specs, .harness/plan, .harness/evals, and future closure artifacts as evidence surfaces.

professional_output:

- Closeout must separate local code/test truth, PR state, CI state, review state, tracker state, artifact state, and merge readiness.
- Validation evidence must include exact commands and pass, fail, or blocked outcomes.

action_item_contract:

- Every agent_next_actions, human_approval_required_actions, and blocked_actions item must include action_id, actor, status, reason, required_proof_or_approval, and source_requirement.
- Each item must include command when the next step is runnable, artifact_path when the next step produces or inspects durable evidence, and blocked_until when the item is human-gated, phase-gated, policy-gated, or proof-gated.
- String-only action arrays are not acceptable for public agent-readable output.

## Coding and Testing Lenses

coding_lens:

- Add a manifest contract owner before using manifest policy in command output.
- Add an authority classifier owner before any caller emits authority_mode, non-proof claims, recovery guidance, or action partitions.
- Keep src/cli.js boring; command modules wire output but do not derive authority independently.
- Keep proof behavior in src/lib owners and schema-backed contracts.
- Keep external target paths repo-relative and fail closed on escapes.
- Keep black-box execution data modeled as blocked, not executed.
- Keep implementation useful without later judge, dataset, score object, or suite report phases.

testing_lens:

- Test externally observable CLI JSON and schema behavior, not private helper choreography.
- Tie each accepted VAC ID to at least one positive or negative proof path.
- Include manifest missing, invalid, traversal, and absolute path cases.
- Include artifact-only external inspection with a sentinel that proves no target command executed.
- Include missing runtime evidence not_configured or blocked status.
- Include next-action partition output for agent, human, and blocked actions.
- Preserve canonical smoke and verify gates.

architecture_lens:

- Prefer explicit interface ownership over a shallow command-output patch because the gap is an authority-boundary gap.
- Keep owner split minimal for the first slice: manifest contract owner and authority classifier owner.
- Do not introduce an adapter framework until repeated approved execution policies prove one is needed.

simplification_lens:

- Do not implement RAG, pipeline, multi-turn, production monitoring, dashboards, cloud workflows, datasets, judge validation, or suite decision reports in this first slice.
- Do not require judge validation before deterministic authority labeling and manifest safety exist.
- Do not split execution into command, API, and tool runner abstractions because execution is not approved yet.

ubiquitous_language_lens:

- Reuse current terms where possible: artifact bundle, runtime state packet, runtime evidence contract, deterministic verdict, scorer result, assertion result, baseline result, deep module fix packet, tracer proof.
- Candidate new terms are authority mode, external project manifest, authority classifier, and privacy approval evidence.
- Update UBIQUITOUS_LANGUAGE.md only if implementation accepts those terms into durable vocabulary.

## Work Units

| Unit | Objective | Source Trace | Dependencies |
|---|---|---|---|
| PU-001 | Add the external project manifest contract. | FR-004, FR-005, FR-008, VAC-003, VAC-005 | none |
| PU-002 | Add the authority classifier owner and action partitions. | FR-001, FR-002, FR-018, FR-022, VAC-001, VAC-013, VAC-016 | PU-001 schema decision |
| PU-003 | Wire artifact-only authority output into external check/state inspection. | FR-001, FR-003, FR-019, VAC-001, VAC-002, VAC-014 | PU-002 |
| PU-004 | Add privacy approval evidence shape with not_required handling. | FR-004, NFR-007, VAC-003 | PU-001 |
| PU-005 | Validate, document accepted vocabulary/architecture deltas, and preserve hard blocks. | NFR-001 through NFR-008, VAC-014, VAC-015 | PU-001 through PU-004 |

### PU-001. External Project Manifest Contract

Objective: create the smallest schema-backed external project manifest contract needed to classify artifact-only and later blocked behavioral modes without adding execution behavior.

Source trace: FR-004, FR-005, FR-008, VAC-003, VAC-005, NFR-001, NFR-006, NFR-007.

Allowed paths:

- schemas/**
- src/lib/schema.js
- new src/lib/** manifest contract owner, if semantic validation is needed
- fixtures/** for valid and invalid manifest examples
- test/** or tests/**
- UBIQUITOUS_LANGUAGE.md only if terms are accepted

Forbidden paths and behaviors:

- src/commands/run.js changes that execute target behavior
- target command execution
- network policy enablement
- dependency installs
- baseline promotion automation

Steps:

1. Write the manifest path compatibility decision artifact at .harness/decisions/2026-06-04-external-project-manifest-path.md or an explicitly equivalent .harness/decisions path before schema registration.
2. Add the manifest schema with project identity, suite roots, authority modes, runtime evidence policy, privacy class, artifact policy, baseline authority, compatibility version, execution policy, and unknown field policy.
3. Add semantic validation in one owner if schema.js cannot enforce repo-relative path and first-slice phase constraints alone.
4. Add valid manifest, missing required field, unknown field, absolute path, and parent traversal fixtures.
5. Add tests that requested black_box_execution is represented only as blocked_actions or human_approval_required_actions without a valid manifest. Do not add a public behavioral run command or execute target behavior.

Validation and evidence:

- schema fixture tests pass.
- path-boundary tests reject absolute paths and parent traversal.
- manifest path decision artifact exists and names this plan path.
- missing-manifest authority classifier test emits blocked or human-approval-required actions rather than executing.

Stop condition: stop if manifest naming or enum choices would create a breaking public contract without the required decision artifact and explicit approval.

Rollback note: remove the schema registration, manifest owner, fixtures, and tests; existing smoke/check/state behavior should remain unchanged.

Handoff state: proceed to PU-002 only after manifest shape and path policy are test-covered.

### PU-002. Authority Classifier Owner

Objective: add one deep owner that derives authority_mode, proof context, non-proof claims, recovery guidance, agent_next_actions, human_approval_required_actions, blocked_actions, runtime evidence unavailable/not_configured status, black-box blocked status, and judge advisory boundary.

Source trace: FR-001, FR-002, FR-018, FR-022, VAC-001, VAC-013, VAC-016, NFR-002, NFR-006.

Allowed paths:

- new src/lib/authority-classifier.js or equivalent deep owner
- schemas/** if output is schema-backed
- src/lib/runtime-state.js only as a caller
- src/lib/latest-run.js only as evidence input
- test/** or tests/**
- fixtures/**

Forbidden paths and behaviors:

- Command modules deriving authority_mode independently.
- Modeling judge output as authority_mode.
- Treating missing runtime evidence as success.
- Running target commands.

Steps:

1. Define the authority classifier input contract from manifest state, repo-root inspection context, latest validation state, runtime evidence policy, and phase-blocked capabilities.
2. Define output fields for authority_mode, proof_context, non_proof_claims, recovery guidance, agent_next_actions, human_approval_required_actions, and blocked_actions.
3. Encode black_box_execution as blocked unless later explicit approval opens that mode.
4. Encode judge status on evaluator axis fields or blocked/advisory notes, never authority_mode.
5. Add tests for artifact_only, missing manifest, missing runtime evidence, blocked black-box action, and human approval required actions.
6. Enforce the action_item_contract from the Enforcement Contract for every action partition item.

Validation and evidence:

- authority classifier unit or golden-output tests pass.
- missing runtime evidence produces not_configured or blocked.
- next-action partitions are machine-readable and separated.
- action partition items include action_id, actor, status, reason, required_proof_or_approval, source_requirement, and command or artifact_path where applicable.

Stop condition: stop if callers must duplicate classifier logic to produce required output.

Rollback note: remove the authority owner and output schema changes; keep existing command behavior.

Handoff state: proceed to PU-003 only after callers can use the owner without reconstructing authority mode.

### PU-003. Artifact-Only External Inspection Output

Objective: wire authority classification into external check/state inspection so --repo-root output explicitly says artifact_only and does not claim target behavior proof.

Source trace: FR-001, FR-003, FR-019, VAC-001, VAC-002, VAC-014, NFR-005.

Allowed paths:

- src/commands/validation.js
- src/commands/state.js
- src/lib/repo-root-option.js
- src/lib/runtime-state.js
- src/lib/latest-run.js
- schemas/** if output schema is updated
- fixtures/**
- test/** or tests/**

Forbidden paths and behaviors:

- Executing commands inside the target repo.
- Reading undeclared source surfaces from the target repo.
- Promoting baselines.
- Certifying CI, PR, review, tracker, or production readiness.

Steps:

1. Add authority classifier calls to check --repo-root and state --repo-root output paths.
2. Ensure local check/state behavior remains compatible where --repo-root is absent.
3. Add non-proof claims that explicitly deny target behavior, CI, PR, review, tracker, and baseline promotion proof.
4. Add a sentinel target fixture or test double proving --repo-root inspection does not execute target behavior.
5. Add golden-output or JSON assertions for authority_mode: artifact_only.

Validation and evidence:

- --repo-root artifact-only tests pass.
- existing smoke tests pass.
- pnpm evals check --json and pnpm evals state --json retain compatible local output.

Stop condition: stop if artifact-only output requires target source reads or command execution.

Rollback note: remove added output fields and caller wiring; existing latest validation remains intact.

Handoff state: proceed to PU-004 after external output is honest and read-side only.

### PU-004. Privacy Approval Evidence Shape

Objective: add privacy approval evidence shape so manifests and future datasets can fail closed or explicitly record not_required for synthetic and public fixtures.

Source trace: FR-004, VAC-003, NFR-007.

Allowed paths:

- schemas/**
- manifest owner module from PU-001
- fixtures/**
- test/** or tests/**

Forbidden paths and behaviors:

- Scanning private target data beyond declared manifest fixtures.
- Promoting local approval prose as proof without schema-backed fields.
- Making evals own target repo privacy decisions.

Steps:

1. Add approval_status enum with approved, blocked, expired, not_required, and pending.
2. Add fields for approved_by, approved_at, scope, data_classes, retention_policy_ref, redaction_policy_ref, and review_due_at or expires_at where applicable.
3. Require not_required rather than omission when schema requires privacy evidence for synthetic or public fixtures.
4. Add valid not_required, missing evidence, expired, and blocked fixtures.
5. Ensure privacy status feeds blocked or human_approval_required_actions where appropriate.

Validation and evidence:

- privacy approval schema tests pass.
- synthetic/public not_required fixture passes.
- blocked or missing approval produces deterministic blocked output.

Stop condition: stop if privacy policy would require evals to decide target-owned privacy approval outside manifest evidence.

Rollback note: remove privacy approval schema additions and fixtures; manifest remains without privacy evidence if rollback is needed before release.

Handoff state: proceed to PU-005 after privacy evidence is schema-backed and connected to action partitions.

### PU-005. Validation, Vocabulary, and Closeout Evidence

Objective: prove the first slice, update durable vocabulary or architecture notes only for accepted changes, and preserve phase-one hard blocks.

Source trace: VAC-014, VAC-015, NFR-001 through NFR-008.

Allowed paths:

- UBIQUITOUS_LANGUAGE.md when new terms are accepted.
- ARCHITECTURE.md when new owner modules become stable map entries.
- .harness/memory/LEARNINGS.md only for repeated failure classes fixed during implementation.
- .harness/evals/** closure evidence if code changes are implemented.
- test/** or tests/** and fixtures/** for final coverage gaps.

Forbidden paths and behaviors:

- Broad documentation rewrites unrelated to implementation.
- CI, PR, review, tracker, or merge-readiness claims without fresh lane evidence.
- Required judge gate implementation.
- Black-box execution implementation.

Steps:

1. Run focused tests for PU-001 through PU-004.
2. Run the canonical smoke and check/state commands.
3. Run pnpm test and pnpm verify before implementation closeout.
4. Update UBIQUITOUS_LANGUAGE.md only if authority mode, external project manifest, authority classifier, or privacy approval evidence are accepted terms.
5. Update ARCHITECTURE.md only if new owner modules are stable enough to document.
6. Record closeout evidence with exact command outcomes and residual risks.

Validation and evidence:

- pnpm test passes.
- pnpm evals run fixtures/smoke/pr-closeout.case.json --json passes.
- pnpm evals check --json passes.
- pnpm evals check --smoke --json passes.
- pnpm evals state --json passes.
- pnpm verify passes.
- Any blocked validation includes concrete blocker reason and fallback.

Stop condition: stop if validation fails due to introduced behavior or if a phase-one hard block is violated.

Rollback note: revert the first-slice schema, owner module, caller wiring, fixtures, tests, and docs as one bounded change set.

Handoff state: after PU-005, reconcile local validation, artifact evidence, tracker state if applicable, PR state if applicable, CI state if applicable, and review state before claiming completion.

## Dependencies

| Dependency | Needed For | Status |
|---|---|---|
| Implementation approval | he-work code edits | required_before_work |
| Tracker decision | he-linear-plan or Linear link/create | confirmation_required |
| Manifest path compatibility decision | PU-001 | durable .harness/decisions artifact required before public schema commitment |
| Privacy class enum decision | PU-001 and PU-004 | decide during schema design |
| Current tests and architecture map | all PUs | refresh before implementation |
| Later phase-opening ADR/spec | black-box execution | blocked_not_first_slice |
| Judge threshold research | judge authority | research_required_future_scope |

## Validation Gates

Planning artifact validation:

- python3 /Users/jamiecraik/dev/agent-skills/Plugins/cache/agent-skills-local/harness-engineering/0.1.0/scripts/check_bluf_structure.py .harness/plan/2026-06-04-external-evals-suite-authority-plan.md --json
- python3 /Users/jamiecraik/dev/agent-skills/Plugins/cache/agent-skills-local/harness-engineering/0.1.0/scripts/check_generated_artifact_shape.py .harness/plan/2026-06-04-external-evals-suite-authority-plan.md --kind plan --json
- python3 /Users/jamiecraik/dev/agent-skills/Infrastructure/scripts/validation-and-linting/he_artifact_identity_lint.py .harness/plan/2026-06-04-external-evals-suite-authority-plan.md
- python3 /Users/jamiecraik/dev/agent-skills/Infrastructure/scripts/validation-and-linting/he_linear_traceability_lint.py .harness/plan/2026-06-04-external-evals-suite-authority-plan.md, only after a real Linear issue key is added

Implementation validation minimum:

- pnpm test
- pnpm evals run fixtures/smoke/pr-closeout.case.json --json
- pnpm evals check --json
- pnpm evals check --smoke --json
- pnpm evals state --json
- pnpm verify

Focused implementation tests required:

- manifest schema positive and negative tests.
- manifest path traversal and absolute path rejection tests.
- missing manifest behavioral-mode blocked test.
- artifact-only --repo-root read-side sentinel test.
- authority_mode artifact_only output test.
- non-proof claims output test.
- runtime evidence not_configured or blocked test.
- agent_next_actions, human_approval_required_actions, and blocked_actions partition tests.
- privacy approval evidence not_required, pending, blocked, and expired tests where schema scope includes them.
- manifest path decision artifact existence and plan-path reference check.

## Review Plan

- Architecture review: verify behavior is owned by manifest and authority-classifier modules, not duplicated in command callers.
- Simplification review: verify no first-slice work implements dashboards, hosted integrations, black-box execution, datasets, judge validation, or suite reports.
- Ubiquitous-language review: verify new terms are either accepted and recorded or remain candidate-only in implementation notes.
- Agent-native review: verify JSON output gives future agents actionable, machine-readable next steps without requiring hidden UI or human-only interpretation.
- Autoresearch validation: verify judge and AI-evals principles remain advisory and do not become release authority before ground-truth validation.

## Review Swarm Evidence

When a reviewer loop is requested for this plan or its implementation, the coordinator must require durable artifact-first reviewer outputs rather than relying on mailbox prose alone.

Required reviewer evidence:

- One artifact per requested reviewer under .harness/review/external-evals-suite-authority/ or an explicitly equivalent .harness/review path.
- Each artifact must include reviewer role, reviewed artifact path, findings or NO FINDINGS, severity, file/line evidence, remediation, and status.
- Each artifact-producing reviewer must end with WROTE: <artifact path>.
- The coordinator must verify each expected artifact exists and is non-empty before synthesis.
- If an expected artifact is missing, retry that reviewer once with an artifact-only request.
- Final synthesis must list reviewers requested, reviewers completed, reviewers blocked, reviewers failed artifact verification, and reviewers closed.
- Mailbox text may summarize reviewer state, but it is not completion evidence when an artifact was required.

## Rollback Plan

Rollback the first slice by removing the new manifest schema, authority classifier owner, privacy approval evidence shape, output wiring, fixtures, tests, and any accepted vocabulary/architecture deltas. Existing smoke run, latest validation, check --json, check --repo-root, state --json, and state --repo-root behavior should continue to work as before. Do not roll back unrelated generated latest artifacts or user-owned dirty files.

## Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Artifact-only proof is overstated as target behavior proof. | high | PU-002 and PU-003 add authority_mode and non-proof claims. |
| Manifest becomes an execution adapter framework. | high | PU-001 is schema/data only; execution remains blocked. |
| Command modules duplicate authority logic. | medium | PU-002 requires one src/lib owner and caller tests. |
| Public schema naming is premature. | medium | PU-001 records compatibility decision before schema commitment. |
| Privacy approval becomes evals-owned rather than target-owned. | medium | PU-004 records approval evidence and action partitions but keeps ownership target-side. |
| Judge output gains release authority by implication. | high | PU-002 keeps judge on evaluator axis and blocked/advisory until later approval. |
| Existing smoke behavior regresses. | high | PU-003 and PU-005 preserve VAC-014 and run canonical gates. |

## Observability / Evidence

Evidence to collect during implementation:

- changed files list.
- manifest schema fixture outputs.
- authority classifier test output.
- --repo-root artifact-only sentinel proof.
- exact command outcomes for focused tests, pnpm test, smoke run, check, state, and pnpm verify.
- artifact paths for any generated run bundles.
- residual risk note separating local validation, tracker state, PR state, CI state, review state, artifact state, and merge readiness.

Telemetry, session summaries, and model reasoning may explain why a choice was made, but they do not prove acceptance criteria.

## Visual References / Diagrams

| Step | Authority Increment | Work Unit | Depends On | Status |
|---|---|---|---|---|
| 1 | Project manifest contract | PU-001 | source spec | implementable |
| 2 | Authority classifier owner | PU-002 | PU-001 decision | implementable |
| 3 | artifact_only JSON labeling | PU-003 | PU-002 | implementable |
| 4 | Privacy approval evidence shape | PU-004 | PU-001 | implementable |
| 5 | Validation and accepted vocabulary | PU-005 | PU-001 through PU-004 | implementable |
| 6 | black_box_execution | later plan | later ADR/spec or explicit approval | blocked |
| 7 | evaluator descriptors, score objects, datasets, judges, reports | later plan | later approved future-contract scope | deferred |

## Accessibility

Human-readable reports and Markdown closeout notes must not rely on color-only status. JSON output must include machine-readable recovery commands or action partitions so future agents can act without scraping prose. Failure diagnostics should retain assertion-shaped fields where applicable: given, should, actual, expected, evidence_refs, reproduce_command, status, and diagnostic.

## Open Questions

1. Should the manifest file be exactly .evals/project.json or .evals/evals.project.json?
2. What privacy_class enum should be canonical for target-owned fixtures?
3. Should authority classification be schema-backed as a standalone schema or tested through golden check/state output first?
4. If tracker creation is required, should he-linear-plan create a single parent issue for the first slice or separate children for manifest, authority classifier, and artifact-only output?

These questions do not block plan creation. The first two block public schema implementation until PU-001 records a compatibility decision.

## Final Decision

Proceed only with the implementable_first_slice when Jamie approves he-work: manifest, authority classifier, artifact-only authority-mode output, next-action partitions, and privacy approval evidence shape. Do not implement black-box execution, judge validation, dataset lifecycle, evaluator catalog, canonical score object, suite decision report, feedback-loop artifacts, dashboards, hosted telemetry, plugin systems, source mining, required judge gates, or sibling runtime dependencies from this plan.

post_plan_handoff:

- state: awaiting_user_choice
- recommended_next_skill: harness-engineering:he-work if implementation is approved; harness-engineering:he-linear-plan if tracker creation/linking should happen first
- implementation_start_unit: PU-001
- tracker_action: confirmation_required
- closure_boundary: not_closure

## Appendices

### Appendix A. Blackboard Delta

| Candidate Term | Plan Treatment |
|---|---|
| Authority mode | Candidate term; implement only if output lands. |
| External project manifest | Candidate term; implement through PU-001 if approved. |
| Authority classifier | Candidate term; implement through PU-002 if approved. |
| Privacy approval evidence | Candidate term; implement through PU-004 if approved. |
| Black-box execution | Blocked candidate; do not implement. |
| Advisory judge | Future candidate; do not promote to authority. |

### Appendix B. Linear Payload Seed

If Jamie approves tracker creation, use this as the seed, not as proof of live tracker state:

- title: Add external evals authority first-slice contracts
- parent or project: to be selected by he-linear-plan
- source_spec: .harness/specs/2026-06-04-external-evals-suite-authority-spec.md
- source_plan: .harness/plan/2026-06-04-external-evals-suite-authority-plan.md
- first_slice: manifest, authority classifier, artifact-only authority-mode output, next-action partitions, privacy approval evidence shape
- blocked_scope: black-box execution, judge authority, datasets, evaluator catalog, suite decision reports, dashboards, hosted telemetry, plugin systems, source mining
- acceptance: VAC-001, VAC-002, VAC-003, VAC-005, VAC-013, VAC-014, VAC-015, VAC-016

### Appendix C. Current Artifact Validation Record

This section should be updated by the coordinator after validators run.

| Validation | Outcome |
|---|---|
| BLUF structure | pass: check_bluf_structure.py accepted the plan. |
| HE artifact shape | pass: check_generated_artifact_shape.py accepted the plan with kind plan. |
| HE artifact identity lint | pass: he_artifact_identity_lint.py accepted the plan. |
| HE Linear traceability lint | pass: he_linear_traceability_lint.py accepted the plan because no live Linear issue trace is required until he-linear-plan creates or links one. |
| pnpm test | pass: 164 tests passed. |
| pnpm verify | pass: deterministic repository gate passed, including smoke run, check/state validation, and credential scan. |
