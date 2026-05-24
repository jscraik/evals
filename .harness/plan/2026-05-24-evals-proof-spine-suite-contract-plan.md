---
schema_version: 1
artifact_id: 2026-05-24-evals-proof-spine-suite-contract-plan
artifact_type: he-plan
canonical_slug: evals-proof-spine-suite-contract
title: Evals Proof-Spine Suite Contract Plan
status: ready_for_execution
date: 2026-05-24
source: .harness/specs/2026-05-24-evals-proof-spine-suite-contract-spec.md
source_artifact_type: he-spec
linear_plan: .harness/linear/2026-05-24-evals-proof-spine-suite-contract-linear-plan.md
origin: .harness/research/audits/2026-05-24-evidence-led-codebase-gap-audit.md
plan_path: .harness/plan/2026-05-24-evals-proof-spine-suite-contract-plan.md
route: standard-plan
stage: he-plan
scope: "Implementation sequencing for JSC-369 through JSC-372 from the proof-spine suite contract spec."
risk: high
interactive_status: complete_no_questions
selection_evidence: "Reviewed the canonical spec, repo doctrine, Linear issues JSC-369 through JSC-372, current implementation surfaces, and available validation gates."
safe_to_continue: true
blocked_reason: none
linear_parent_issue: JSC-369
linear_child_issues:
  - JSC-370
  - JSC-371
  - JSC-372
linear_mutation_status: already_linked
linear_action_required: recheck_before_closeout
traceability_required: true
git_staging_status: unstaged
staged_paths: []
post_plan_handoff_state: explicit_stop
confidence: 92_percent_plan_spec_aligned_after_subagent_review_pending_runtime_implementation_and_unavailable_identity_traceability_lints
---

# Evals Proof-Spine Suite Contract Plan

## Command Summary

BLUF: This plan gives Jamie, the implementation developer, the reviewer, and future agents an ordered execution contract for JSC-369 through JSC-372: fix the current latest/run false-success trust boundary first, then add the repo-local suite contract, then add claim/evidence and Codex runtime evidence packet v1. The work matters because evals is meant to be the shared executable proof spine for downstream repos, but it must not widen into cross-repo suites while current latest evidence, artifact identity, or success claims can still be overstated. Execution is bounded to local schemas, runner/check/state modules, fixtures, tests, and deterministic artifact validation; dashboards, plugin systems, networked suite execution, external adapters, required judge gates, source mining, and sibling repo runtime dependencies stay forbidden. The highest stop risk is a public CLI or JSON contract change that is not additive or schema-backed, so every unit requires a deep module fix packet, regression fixture, rollback note, and pnpm verify evidence before closeout. The handoff after this plan is an explicit stop: implementation should begin with JSC-370 only when he-work is separately authorized.

Decision Needed: None for planning. Implementation can start with JSC-370 when authorized.

Top Risks:

- JSC-370 may appear fixed if latest validation gains fields but check still compares the wrong proof context.
- JSC-370 may corrupt evidence if run IDs become unique but latest is still published before the full bundle validates.
- JSC-371 may accidentally introduce plugin, scorer-execution, network, or registry behavior instead of a data-only suite contract.
- JSC-372 may downgrade the existing runtime-evidence contract by relabeling scaffolded families as enforced proof.
- Parent closeout may be overstated if JSC-369 is reconciled from local plan state instead of live Linear, validation, and artifact evidence.

Next Action: Execute PU-001 through PU-003 for JSC-370 first. Do not start suite support or claim/evidence packet work until the current false-success boundary is closed and JSC-369 is reconciled.

## Objective

Implement the approved proof-spine suite contract in a proof-first sequence. The immediate objective is to close current false-success risks in latest validation, run artifact identity, and latest publication. The secondary objective is to add the smallest repo-local suite contract and claim/evidence runtime packet without violating evals phase-one hard blocks or making consumer repos runtime dependencies.

## Source Contract

| Source | Role | Freshness / Status |
|---|---|---|
| .harness/specs/2026-05-24-evals-proof-spine-suite-contract-spec.md | Canonical behavior and acceptance contract | present; status plan_aligned_ready_for_jsc_370_execution |
| .harness/linear/2026-05-24-evals-proof-spine-suite-contract-linear-plan.md | Local Linear mutation plan and issue payload evidence | present; live project assignment still deferred |
| .harness/research/audits/2026-05-24-evidence-led-codebase-gap-audit.md | Audit basis for gaps and prioritization | present |
| .harness/core/2026-05-18-evals-core.md | Core doctrine: artifacts decide, telemetry explains, repo-local suites own domain truth | binding |
| UBIQUITOUS_LANGUAGE.md | Stable repo vocabulary for executable spine, artifact bundle, runtime state packet, runtime evidence contract | binding |
| AGENTS.md | Mission, phase-one hard blocks, validation, closure evidence requirements | binding |
| .harness/refactors/2026-05-20-deep-module-fix-mechanics.md | Required patch discipline for runtime/schema/validation/artifact changes | binding for implementation |

Source acceptance IDs:

| Acceptance | Linear Trace | Required Proof |
|---|---|---|
| SA-001 | JSC-370 | Regression proves check fails when latest points at a different checked case or suite. |
| SA-002 | JSC-370 | Latest provenance contract is schema-backed or owned by one validation module before artifact reads are trusted. |
| SA-003 | JSC-370 | Regression or seam test proves concurrent identical runs do not share the same artifact directory. |
| SA-004 | JSC-370 | Latest publication does not advertise incomplete bundles as passing evidence. |
| SA-005 | JSC-370 | Existing smoke command behavior remains compatible. |
| SA-006 | JSC-371 | Neutral suite schema validates suite identity, owner, domain, purpose, cases, scorers, baseline, and artifact policy. |
| SA-007 | JSC-371 | Suite-root path resolution rejects traversal. |
| SA-008 | JSC-371 | Repo-local suite artifacts write to the evaluated repo, not implicitly to evals. |
| SA-009 | JSC-372 | Claim and evidence schemas define versioning, required fields, enums, and unknown-field behavior. |
| SA-010 | JSC-372 | Deterministic scorer fails a success claim with missing evidence. |
| SA-011 | JSC-372 | Codex runtime evidence packet v1 captures repo state, freshness, blockers, recommended commands, validation, claims, and evidence. |
| SA-012 | JSC-372 | Telemetry and model confidence remain advisory and cannot decide verdicts. |
| SA-013 | JSC-369 | Each child includes a deep module fix packet before code/schema edits. |
| SA-014 | JSC-369 | Human-readable output and reports remain plain-text readable and do not rely on color alone. |
| SA-015 | JSC-369 | No child introduces a phase-one hard-blocked capability. |
| SA-016 | JSC-369 | Parent closeout cites child states, validation commands, artifact paths, blockers, and deferrals. |
| SA-017 | JSC-371 | Suite artifact_policy.allow_network true fails validation in phase one. |
| SA-018 | JSC-371 | Executable repo-local scorer hook references fail validation in phase one. |
| SA-019 | JSC-369 | Public JSON output change is additive or records compatibility decision and migration note. |
| SA-020 | JSC-372 | Existing runtime-evidence families remain compatible or version-gated; scaffolded families are not reported as enforced. |
| SA-021 | JSC-370 | check --json exposes expected_context, observed_latest_context, context_match, and mismatch recovery fields through schema-backed or golden-output coverage. |

## Scope and Boundaries

Allowed paths and areas:

- src/commands/run.js
- src/commands/validation.js
- src/commands/state.js, if state output changes for JSC-372
- src/lib/latest-run.js
- src/lib/paths.js
- src/lib/json.js
- src/lib/runtime-state.js
- src/lib/runtime-evidence-contract.js
- new focused owner modules under src/lib/** when justified by deep module packet
- schemas/latest-run.schema.json
- schemas/runtime-state.schema.json
- schemas/runtime-evidence-case.schema.json
- new schemas/suite.schema.json, schemas/claim.schema.json, schemas/evidence.schema.json, or reviewed equivalents
- fixtures/** for smoke, suite, claim/evidence, runtime-evidence, and negative regression cases
- test/** or tests/** using the existing Node test style
- scripts/verify.js only when required to keep pnpm verify authoritative
- .harness/plan/** and implementation evidence artifacts required by repo guidance

Forbidden paths and areas for this plan:

- dashboards or hosted reporting
- plugin systems, plugin registries, or executable repo-local scorer hooks
- networked suite execution in phase one
- external adapter roots
- cloud runners
- required LLM judge gates
- source-mining automation from sessions, traces, PRs, or sibling repos
- runtime dependencies on coding-harness, agent-skills, diagram-cli, session collectors, or OTEL collectors
- baseline promotion automation
- project assignment or other Linear mutation without explicit authorization
- broad docs rewrites unrelated to this implementation chain
- package installs or dependency changes unless separately approved

Implementation-time unknowns:

- Whether latest provenance should be represented by additive fields in latest.json, result.json, manifest.json, or an internal resolved context object must be decided by the JSC-370 deep module packet.
- Whether check should remain smoke-bound by default or accept an internal expected-context parameter first is flexible only if the public command behavior and future suite handoff remain intact.
- Exact run-id uniqueness shape is open, but the chosen design must be collision-resistant and testable without relying on wall-clock flakiness.
- Exact suite fixture location is open, but the JSC-371 test must prove suite-root semantics and evaluated-repo artifact root behavior.
- Exact claim/evidence envelope naming is open, but claim and evidence field semantics must stay separate.

## Current State / Evidence

| Surface | Current Evidence | Gap |
|---|---|---|
| Smoke run | pnpm evals run fixtures/smoke/pr-closeout.case.json --json is canonical and currently passes under pnpm verify. | Must remain compatible. |
| Check command | src/commands/validation.js validates the smoke fixture and latest pointer artifacts. | It does not yet bind latest to the expected checked case or suite context. |
| Latest validation | src/lib/latest-run.js validates schema, artifact paths, hashes, manifest/result metadata, baseline linkage, and trace timelines. | It does not yet require suite_id, artifact_root, generated_at, or explicit expected-context matching. |
| Run command | src/commands/run.js currently builds run IDs from second-level timestamp, case ID, and input hash. | Identical same-second invocations can target the same artifact directory. |
| Latest publication | src/commands/run.js writes latest during run finalization. | JSC-370 must prove incomplete bundles are not advertised as latest passing evidence. |
| Runtime evidence contract | src/lib/runtime-evidence-contract.js and schemas/runtime-evidence-case.schema.json already enforce selected runtime evidence families. | JSC-372 must preserve implemented/enforced vs scaffolded/not-enforced status. |
| Runtime state | src/lib/runtime-state.js reports latest readiness and runtime-evidence contract health. | JSC-372 must extend packet shape without making telemetry authority. |
| CI gate | package.json, scripts/verify.js, .github/workflows/ci.yml, and .harness/ci-required-checks.json route to pnpm verify. | Every implementation child must preserve this gate. |
| Linear | JSC-369 through JSC-372 were read successfully during planning; status is Triage for parent evidence inspected. | Live tracker state must be rechecked before any closeout or status mutation. |
| HE plan identity/traceability lints | The reference names he_artifact_identity_lint.py and he_linear_traceability_lint.py. | Those scripts were not found in the active owner skill tree, so they are blocked/unavailable here. |

Current validation snapshot from this planning lane:

| Command / Check | Result | Notes |
|---|---|---|
| Linear read JSC-369 | pass | Parent issue exists; current status observed as Triage. |
| Linear read JSC-370 | pass | First child exists. |
| Linear read JSC-371 | pass | Suite contract child exists. |
| Linear read JSC-372 | pass | Claim/evidence runtime packet child exists. |
| find owner skill tree for he_artifact_identity_lint.py and he_linear_traceability_lint.py | blocked | Scripts were not found in /Users/jamiecraik/dev/agent-skills/Plugins/harness-engineering. |
| Plan BLUF validator | pass | check_bluf_structure.py accepted the written plan. |
| Plan artifact shape validator | pass | check_generated_artifact_shape.py accepted the written plan with kind plan. |
| pnpm verify | pass | Repository deterministic gate passed after plan write. |

## Implementation Strategy

Use a parent-child sequence, not a broad rewrite. JSC-370 is the only immediate execution slice. JSC-371 and JSC-372 should remain queued until JSC-370 has passed local validation and the parent queue is reconciled.

Implementation principles:

- Write the deep module fix packet before runtime/schema edits in each child.
- Prefer one owner module per trust boundary instead of spreading checks across callers.
- Add negative fixtures before or with implementation.
- Keep public JSON output additive unless a compatibility decision is recorded.
- Make check/state/run agree through shared validation helpers instead of parallel reimplementations.
- Surface expected and observed proof context in check --json so agents can cite what was compared without parsing prose.
- Keep report and CLI output readable without color-only status.
- Preserve existing smoke command and artifact bundle behavior unless the spec explicitly changes it.
- Treat telemetry, model confidence, Linear comments, and session summaries as explanation only.

Recommended child execution order:

1. JSC-370: latest proof context, collision-resistant run IDs, latest publication ordering.
2. Parent reconciliation checkpoint: verify JSC-370 evidence and decide whether JSC-371 remains next.
3. JSC-371: suite schema, suite-root resolver, data-only scorer refs, network/scorer-hook fail-closed checks.
4. Parent reconciliation checkpoint: verify suite behavior before expanding runtime proof model.
5. JSC-372: claim/evidence schemas, missing-evidence scorer, runtime evidence packet v1, scaffolded-family compatibility.
6. JSC-369 parent closeout: live tracker recheck, artifact citation, remaining blocker/deferral record.

## Enforcement Contract

essential_decisions:

- evals owns proof contracts, runner mechanics, schemas, artifact bundles, deterministic scoring, baseline result shape, and closure evidence.
- Consumer repos own suite intent, fixtures, domain scorers as data/config, thresholds, privacy approval, baseline promotion, and domain truth.
- Artifacts decide; telemetry explains.
- JSC-370 is first because it reduces current false-success risk before cross-repo breadth.
- Suite support is additive and repo-local.
- Phase-one suite execution fails closed for network requests and executable scorer hooks.
- Runtime-evidence scaffolded families must not be reported as enforced proof.
- No dashboards, plugin systems, cloud runners, external adapter roots, source mining, required judge gates, or sibling runtime dependencies are allowed.

fillable_gaps:

- Exact owner module names for latest context, suite loading, claim/evidence scoring, and runtime packet generation.
- Exact unique run-id shape and atomic/latest write mechanics.
- Exact schema file names where the spec allows an equivalent combined envelope.
- Exact test file placement under existing test layout.
- Exact JSON field placement for additive public output changes.
- Exact temporary external suite fixture location for JSC-371.

guardrails:

- pnpm test
- pnpm evals run fixtures/smoke/pr-closeout.case.json --json
- pnpm evals check --json
- pnpm evals state --json where state changes
- pnpm verify
- HE BLUF and generated artifact shape checks for updated HE artifacts
- Schema-backed or golden-output tests for public JSON changes
- Deep module fix packet per child before code/schema edits
- Live Linear recheck before parent or child closeout claims

refusal_triggers:

- Any implementation path that requires networked suite execution in phase one.
- Any implementation path that executes repo-local scorer code or loads plugins.
- Any implementation path that makes telemetry, spans, model confidence, or summaries decide verdicts.
- Any implementation path that imports coding-harness, agent-skills, diagram-cli, session collectors, or OTEL collectors at runtime.
- Any breaking CLI/schema/artifact contract change without explicit compatibility decision and migration note.
- Any parent closeout without live Linear state, validation evidence, artifact paths, and child status reconciliation.

durable_memory:

- Record transferable implementation lessons in .harness/memory/LEARNINGS.md or the relevant .harness/refactors surface when a repeated correction becomes durable.
- Preserve the stage boundary: he-spec owns durable behavior and contracts; he-plan owns sequencing, work units, rollback, and validation detail; he-linear-plan owns tracker-ready summaries.

professional_output:

- Closeout must list changed files, exact commands, pass/fail/blocked outcomes, generated artifact paths, Linear issue IDs, remaining blockers, rollback path, and next action.
- A child closeout must not claim JSC-369 parent completion.
- Blocked validation must be reported as blocked with exact reason and recovery step.

## Work Units

### PU-001: JSC-370 Deep Module Packet and Latest Context Owner

Objective: Define the owner boundary for latest context validation before editing runtime code.

Source trace: FR-001, FR-002, FR-013, FR-016, NFR-001, NFR-003, NFR-010, SA-001, SA-002, SA-013, SA-021, JSC-370.

Allowed paths:

- .harness/plan/**
- .harness/refactors/** or .harness/memory/LEARNINGS.md only if implementation creates durable reusable learning
- src/lib/latest-run.js
- src/commands/validation.js
- schemas/latest-run.schema.json
- test/** or tests/**

Forbidden paths:

- suite schema or suite execution implementation
- claim/evidence schema implementation
- runtime-state packet expansion
- plugin, network, adapter, dashboard, or judge-gate behavior

Implementation steps:

1. Fill the spec's Deep Module Fix Packet Template for JSC-370.
2. Choose one owner for expected latest context resolution and comparison.
3. Define caller contract for check: expected case or future expected suite context in, structured pass/fail with mismatch reason out.
4. Define additive check --json proof-context output fields: expected_context, observed_latest_context, context_match, context_mismatch_reason, and recovery_command.
5. Decide whether latest provenance fields live in latest.json, result/manifest metadata, or resolved latest context, keeping public output additive.
6. Add or adjust schema/golden tests before relying on new fields.
7. Document the rollback path before code edits: revert latest context fields and tests while preserving existing artifact validation.

Validation:

- Required before implementation closeout: pnpm test
- Required before implementation closeout: pnpm evals check --json
- Required before implementation closeout: pnpm verify
- Required when schema/public JSON changes: focused schema or golden-output test

Stop condition:

- Stop if the expected-context owner requires a breaking latest.json or public check output change without a compatibility decision, or if check --json cannot expose the compared expected and observed contexts.

Rollback note:

- Revert the JSC-370 owner module changes and latest provenance additions together; do not leave check comparing partially populated fields.

Handoff state:

- Ready for he-work as first implementation unit when implementation is authorized.

### PU-002: JSC-370 Latest Provenance Binding

Objective: Make check fail when latest evidence does not belong to the expected checked case or suite context.

Source trace: FR-001, FR-002, FR-005, FR-016, NFR-003, NFR-008, NFR-010, SA-001, SA-002, SA-005, SA-019, SA-021, JSC-370.

Allowed paths:

- src/commands/validation.js
- src/lib/latest-run.js
- schemas/latest-run.schema.json
- test/** or tests/**
- fixtures/** for focused negative latest fixtures

Forbidden paths:

- run-id uniqueness changes unless needed by PU-003
- suite execution behavior beyond an internal expected-context seam
- cross-repo runtime calls

Implementation steps:

1. Add a regression that constructs or points latest at a wrong-case bundle.
2. Verify current code fails the new test before patching where feasible.
3. Add expected-context validation in the owner selected by PU-001.
4. Return structured JSON output naming expected case/suite, actual case/suite, context_match, mismatch reason, and recovery command.
5. Add golden-output or schema-backed tests for the proof-context fields in pass and mismatch paths.
6. Keep existing smoke command output compatible.
7. Add future suite context seam without enabling suite execution in this unit.

Validation:

- Required: pnpm test
- Required: pnpm evals check --json
- Required: pnpm verify
- Conditional: pnpm evals run fixtures/smoke/pr-closeout.case.json --json if run output is touched

Stop condition:

- Stop if check can still pass while latest points at a different case after the regression is added, or if the failure cannot be explained from machine-readable JSON context fields.

Rollback note:

- Revert expected-context comparison and new provenance fields as one set; restore prior check behavior only if validation gate is failing and no partial provenance remains trusted.

Handoff state:

- Complete before PU-003 closeout; required for JSC-370.

### PU-003: JSC-370 Run Identity and Latest Publication Safety

Objective: Prevent concurrent identical runs from sharing an artifact directory and ensure latest is published only after the run bundle validates.

Source trace: FR-003, FR-004, FR-005, NFR-001, SA-003, SA-004, SA-005, JSC-370.

Allowed paths:

- src/commands/run.js
- src/lib/paths.js
- src/lib/json.js
- src/lib/latest-run.js
- test/** or tests/**
- fixtures/** for incomplete-bundle or forced-collision fixtures

Forbidden paths:

- suite runner implementation
- claim/evidence implementation
- broad filesystem rewrites outside artifact bundle creation

Implementation steps:

1. Add a seam test that forces or simulates identical run ID inputs.
2. Change run artifact directory creation to use a collision-resistant suffix, atomic mkdir behavior, retry, or fail-before-write strategy.
3. Add a test proving two identical invocations do not share the same artifact directory.
4. Move or guard latest publication so latest is written only after required artifacts, manifest hashes, scorer results, baseline result, and trace timeline validate.
5. Add an incomplete-bundle regression showing latest is not left pointing at a broken passing run.
6. Verify existing smoke output remains compatible.

Validation:

- Required: pnpm test
- Required: pnpm evals run fixtures/smoke/pr-closeout.case.json --json
- Required: pnpm evals check --json
- Required: pnpm verify

Stop condition:

- Stop if uniqueness relies on sleeping or wall-clock timing in a way the test cannot deterministically prove.

Rollback note:

- Revert run ID and latest-publication changes together; remove any new partial artifact directories produced by the failed local test run only if they are generated by the current patch and safe to delete.

Handoff state:

- Completes JSC-370 implementation slice when PU-001 and PU-002 are also green.

### PU-004: JSC-371 Suite Schema and Suite-Root Loader

Objective: Add the neutral repo-local suite contract as data without plugin complexity.

Source trace: FR-006, FR-007, FR-014, FR-015, NFR-002, NFR-007, SA-006, SA-007, SA-017, SA-018, JSC-371.

Allowed paths:

- schemas/suite.schema.json
- src/lib/** for a SuiteLoader or equivalent owner module
- src/commands/run.js only for dispatch to suite loader
- fixtures/** for suite cases and negative suite configs
- test/** or tests/**

Forbidden paths:

- executable scorer hooks
- plugin registry
- network execution
- package installs
- external adapter roots
- consumer repo imports

Implementation steps:

1. Add schemas/suite.schema.json or reviewed equivalent with schema_version, suite_id, owner_repo, domain, purpose, cases, scorers, baseline, and artifact_policy.
2. Add a SuiteLoader owner that resolves suite-root relative paths and rejects absolute paths or parent traversal before file reads.
3. Treat artifact_policy.allow_network true as a validation failure in phase one.
4. Treat executable scorer hook references as validation failures in phase one.
5. Add positive and negative suite fixtures for valid suite, traversal, network policy, and executable scorer hook.
6. Keep pnpm evals run fixtures/smoke/pr-closeout.case.json --json behavior unchanged.

Validation:

- Required: pnpm test
- Required: pnpm evals run fixtures/smoke/pr-closeout.case.json --json
- Required: suite fixture command introduced by this unit
- Required: pnpm verify

Stop condition:

- Stop if implementation requires executing consumer repo code, shell commands, network access, or plugin loading.

Rollback note:

- Revert suite schema, loader, dispatch, and fixtures together; preserve smoke runner compatibility.

Handoff state:

- Blocked until JSC-370 is closed or explicitly deferred with parent approval.

### PU-005: JSC-371 Evaluated-Repo Artifact Root Integration

Objective: Ensure repo-local suite artifacts write to the evaluated repo artifact root rather than implicitly to evals.

Source trace: FR-008, NFR-007, SA-008, SA-015, JSC-371.

Allowed paths:

- src/lib/paths.js
- src/commands/run.js
- SuiteLoader owner module from PU-004
- test/** or tests/**
- fixtures/** or temporary test repos created by tests

Forbidden paths:

- writes outside the evaluated repo artifact root except temporary test directories
- global config
- consumer repo source edits
- networked execution

Implementation steps:

1. Define evaluated repo root resolution in the suite loader or artifact path owner.
2. Add a test suite using a temporary repo/suite root outside the evals root.
3. Assert artifacts write under that evaluated repo's .harness/evals/runs/<run-id>/.
4. Assert path traversal in artifact root or suite paths fails before writes.
5. Keep latest pointer paths repo-relative to the evaluated repo.

Validation:

- Required: pnpm test
- Required: suite fixture command introduced by PU-004
- Required: pnpm verify

Stop condition:

- Stop if the path owner cannot prove writes are contained inside the evaluated repo root.

Rollback note:

- Revert evaluated-root routing and suite-root tests with PU-004 if needed; do not leave mixed artifact-root behavior.

Handoff state:

- Runs after PU-004.

### PU-006: JSC-372 Claim/Evidence Schemas and Missing-Evidence Scorer

Objective: Add deterministic claim/evidence contracts and prove unsupported success claims fail.

Source trace: FR-009, FR-010, NFR-002, NFR-003, SA-009, SA-010, JSC-372.

Allowed paths:

- schemas/claim.schema.json
- schemas/evidence.schema.json
- schemas/claim-evidence.schema.json or reviewed equivalent
- src/lib/** for claim/evidence validation and scoring
- fixtures/** for claim/evidence cases
- test/** or tests/**

Forbidden paths:

- LLM judge verdict gates
- telemetry-as-authority
- external service calls
- broad runtime packet changes before claim/evidence scorer is reliable

Implementation steps:

1. Add claim and evidence schema surfaces with versioning, required fields, enums, and unknown-field behavior.
2. Add fixtures for validation-passed claim with evidence, validation-passed claim without evidence, and artifact-exists claim without manifest/hash evidence.
3. Add a deterministic scorer that fails unsupported success claims with machine-readable failure class.
4. Ensure advisory confidence cannot override missing evidence.
5. Add JSON error output that names missing evidence and recovery path.

Validation:

- Required: pnpm test
- Required: pnpm evals check --json if check consumes claim/evidence cases in this slice
- Required: pnpm verify

Stop condition:

- Stop if the scorer requires model judgment or telemetry to decide pass/fail.

Rollback note:

- Revert claim/evidence schemas, scorer, and fixtures together; do not leave schemas accepted without enforcement tests if exposed by commands.

Handoff state:

- Blocked until JSC-370 is closed and JSC-371 sequencing has been reconciled.

### PU-007: JSC-372 Codex Runtime Evidence Packet v1

Objective: Add or extend the local runtime evidence packet without downgrading existing runtime-evidence enforcement.

Source trace: FR-011, FR-012, NFR-004, NFR-008, NFR-009, SA-011, SA-012, SA-014, SA-019, SA-020, JSC-372.

Allowed paths:

- schemas/codex-runtime-evidence.schema.json or reviewed equivalent
- schemas/runtime-state.schema.json
- src/lib/runtime-state.js
- src/lib/runtime-evidence-contract.js
- src/commands/state.js
- test/** or tests/**
- fixtures/runtime-evidence/**

Forbidden paths:

- telemetry exporters as authority
- session collector or OTEL collector runtime dependencies
- model-confidence verdict logic
- reclassifying scaffolded runtime-evidence families as enforced without scorer tests

Implementation steps:

1. Add or extend packet schema with repo, git_state, runtime_state, recommended_commands, blockers, validation_evidence, runtime_evidence_contract_health, claims, evidence, and generated_at.
2. Preserve implemented_enforced versus scaffolded_not_enforced family status.
3. Add regression proving a scaffolded family remains scaffolded until scorer enforcement exists.
4. Ensure pnpm evals state --json remains plain and readable, with additive public output or explicit compatibility decision.
5. Ensure telemetry and model confidence fields, if present, are advisory only.

Validation:

- Required: pnpm test
- Required: pnpm evals state --json
- Required: pnpm evals check --json
- Required: pnpm verify
- Conditional: schema or golden-output tests for runtime-state JSON changes

Stop condition:

- Stop if runtime state cannot represent scaffolded families distinctly from enforced proof.

Rollback note:

- Revert packet schema and state output changes together; preserve existing runtime-evidence contract checks.

Handoff state:

- Runs after PU-006.

### PU-008: JSC-369 Parent Reconciliation and Closeout Evidence

Objective: Reconcile the parent queue without treating any child completion as parent completion.

Source trace: SA-013, SA-014, SA-015, SA-016, SA-019, JSC-369.

Allowed paths:

- .harness/evals/**
- .harness/plan/**
- .harness/linear/**
- .harness/memory/LEARNINGS.md when durable learning exists
- PR or closeout artifacts when delivery stage is authorized

Forbidden paths:

- Linear status mutation unless explicitly authorized
- parent closeout without live tracker recheck
- claiming broader Codex autonomy readiness without implementation/runtime evidence

Implementation steps:

1. After each child implementation, record changed files, commands, outcomes, artifacts, rollback posture, and blockers.
2. Recheck live Linear state for JSC-369 and relevant child before closeout claims.
3. Confirm no phase-one hard-blocked capability was introduced.
4. Confirm public JSON changes are additive or have compatibility decisions.
5. Update parent queue: next child selected, deferred, or blocked with evidence.
6. Only close parent when all required child issues are Done or explicitly deferred with approved evidence.

Validation:

- Required per child: pnpm verify
- Required for HE artifacts: BLUF and generated artifact shape checks where applicable
- Required before parent closeout: live Linear recheck
- Conditional: PR checks and review artifacts if delivery includes PR stage

Stop condition:

- Stop if any child validation is failed, blocked without recovery, or not reconciled against live tracker state.

Rollback note:

- Parent closeout can be rolled back by reopening/reclassifying the parent queue and naming the child issue whose evidence was insufficient; code rollback remains child-specific.

Handoff state:

- Last unit only.

## Dependencies and Sequencing

Flow:

- PU-001 JSC-370 owner packet
  - then PU-002 latest provenance binding
  - then PU-003 run identity and latest publication
- PU-002 and PU-003 together create the JSC-370 validation checkpoint.
- JSC-370 validation checkpoint unlocks PU-004 suite schema and loader.
- PU-004 unlocks PU-005 evaluated repo artifact root.
- JSC-371 validation checkpoint unlocks PU-006 claim/evidence scorer.
- PU-006 unlocks PU-007 runtime evidence packet.
- PU-007 unlocks PU-008 parent reconciliation.

Sequencing rules:

- PU-001 is mandatory before any JSC-370 code/schema edit.
- PU-002 and PU-003 can be implemented in the same PR only if the diff remains reviewable and tests isolate both failure modes.
- PU-004 must not start until JSC-370 has green local validation or a documented parent decision defers it.
- PU-006 should not start until suite-bound proof context is settled or explicitly deferred.
- PU-008 runs after each child as a checkpoint and once at final parent closeout.

## Validation Gates

Current plan-artifact validation:

| Gate | Required | Result | Evidence / Blocker |
|---|---|---|---|
| HE artifact identity lint | required by reference when available | blocked | Script not found in active harness-engineering owner tree. |
| HE Linear traceability lint | required by reference when available | blocked | Script not found in active harness-engineering owner tree. |
| Plan BLUF structure | required | pass | check_bluf_structure.py accepted the written plan. |
| Plan generated artifact shape | required | pass | check_generated_artifact_shape.py accepted the written plan with kind plan. |
| Repo deterministic gate | required | pass | pnpm verify passed after plan write. |

Implementation validation by issue:

| Issue | Gates |
|---|---|
| JSC-370 | pnpm test; pnpm evals run fixtures/smoke/pr-closeout.case.json --json; pnpm evals check --json; pnpm verify |
| JSC-371 | pnpm test; pnpm evals run fixtures/smoke/pr-closeout.case.json --json; suite fixture command; pnpm verify |
| JSC-372 | pnpm test; pnpm evals state --json; pnpm evals check --json; pnpm verify |
| JSC-369 | All child evidence; live Linear recheck; generated artifact paths; remaining blocker/deferral record; pnpm verify |

Specific regression expectations:

| Requirement | Test Scenario | Expected Outcome |
|---|---|---|
| SA-001 | latest points at a wrong-case or wrong-suite bundle | pnpm evals check --json exits non-zero and names mismatch |
| SA-003 | two identical invocations attempt same run identity | distinct artifact directories or fail-before-write behavior |
| SA-004 | incomplete bundle generation is simulated | latest.json is not advertised as passing evidence |
| SA-007 | suite case/scorer/baseline path uses parent traversal | suite load fails before reads/writes |
| SA-017 | suite artifact_policy.allow_network is true | suite validation fails in phase one |
| SA-018 | suite scorer references executable hook | suite validation fails in phase one |
| SA-010 | success claim lacks required evidence | deterministic scorer fails |
| SA-020 | runtime family is scaffolded without scorer | output remains scaffolded_not_enforced |
| SA-021 | latest context mismatch | check --json exposes expected_context, observed_latest_context, context_match false, context_mismatch_reason, and recovery_command |

## Review Plan

Review should be staged by child issue:

- JSC-370: correctness, reliability, API contract, and testing review for latest context, run ID uniqueness, and latest publication ordering.
- JSC-371: API contract, security, path-boundary, and agent-native review for suite schema, path resolution, data-only scorer refs, and artifact root behavior.
- JSC-372: correctness, API contract, agent-native, and security review for claim/evidence semantics and runtime packet authority boundaries.
- JSC-369: delivery-state audit before parent closeout.

Independent review triggers:

- Use api-contract-reviewer if public CLI, JSON, schema, or artifact contract changes.
- Use security-reviewer if path handling, network policy, or executable hook rejection changes.
- Use agent-native-reviewer if state/check output or agent-consumable artifact fields change.
- Use correctness-reviewer for JSC-370 publication ordering and run collision tests.

## Rollback Plan

| Unit | Rollback |
|---|---|
| PU-001 | Revert the deep module packet only if no runtime edits depend on it; otherwise amend it to match the chosen owner. |
| PU-002 | Revert latest provenance fields, comparison helper, and tests together; do not leave check trusting partial context. |
| PU-003 | Revert run-id and latest-publication changes together; preserve generated failure artifacts unless they are safe current-run temp outputs. |
| PU-004 | Revert suite schema, suite loader, and suite validation fixtures together. |
| PU-005 | Revert evaluated-root artifact routing with suite loader changes; restore smoke-only artifact root behavior. |
| PU-006 | Revert claim/evidence schemas, scorer, and fixtures together. |
| PU-007 | Revert runtime packet schema/state output changes together; preserve existing runtime-evidence contract health if it predates the patch. |
| PU-008 | Reopen/reclassify parent queue if closeout evidence is incomplete; do not roll back code from parent reconciliation alone. |

Rollback stop rule: if rollback would remove a public schema or output field already consumed by a downstream agent or CI gate, stop and record a compatibility decision before reverting.

## Risk Register

| Risk | Severity | Likelihood | Mitigation |
|---|---|---:|---|
| Check compares latest to the wrong context | Critical | Medium | PU-001 owner contract plus SA-001 regression. |
| Latest is published before full artifact validation | High | Medium | PU-003 publication-order test and pnpm verify. |
| Run ID collision test is flaky | High | Medium | Use deterministic forced-collision seam rather than sleeps. |
| Suite support becomes a plugin system | High | Medium | PU-004 forbids executable hooks and network; SA-017/SA-018 regressions. |
| Evaluated repo artifact writes escape intended root | High | Medium | Suite-root and artifact-root path-boundary tests. |
| Claim/evidence scorer becomes subjective | High | Low | Deterministic missing-evidence scorer; no judge gate. |
| Runtime packet mislabels scaffolded families as proof | High | Medium | SA-020 regression and schema/status vocabulary. |
| Public JSON changes break consumers | Medium | Medium | Additive fields or compatibility decision and golden/schema tests. |
| Parent closeout overclaims child status | High | Medium | PU-008 live Linear recheck and child evidence matrix. |

## Observability and Evidence

Each child closeout must produce an evidence block with:

- changed files;
- deep module fix packet location or embedded section;
- exact validation commands and pass/fail/blocked outcomes;
- generated eval run ID and artifact paths when pnpm verify runs;
- schema or golden-output evidence for public JSON changes;
- rollback path;
- Linear issue ID and current state evidence;
- remaining blockers or deferrals.

Authoritative evidence remains local artifacts and deterministic validators. Telemetry, model confidence, Linear descriptions, and session summaries are supporting evidence only.

## Visual References / Diagrams

The dependency flow in Dependencies and Sequencing is the required visual reference for this plan. It clarifies execution order, phase boundaries, and parent reconciliation. Prose and validation gates are authoritative if a visual and text diverge.

| Sequence | Unit | Unlocks |
|---|---|---|
| 1 | PU-001 JSC-370 owner packet | PU-002 and PU-003 |
| 2 | PU-002 latest provenance binding plus PU-003 run identity/publication safety | JSC-370 validation checkpoint |
| 3 | PU-004 suite schema and loader | PU-005 evaluated repo artifact root |
| 4 | PU-006 claim/evidence scorer | PU-007 runtime evidence packet |
| 5 | PU-008 parent reconciliation | JSC-369 closeout only after child evidence |

Generated bitmap media is not required for this he-plan request. The previous spec-review media prompt and sidecar remain separate review artifacts under .harness/media/.

## Accessibility and Operator Ergonomics

- CLI and report changes must remain readable without color-only status.
- JSON output must include machine-readable failure classes and recovery commands where the spec requires them.
- Markdown reports should use semantic headings, concise tables, and plain text paths.
- Error text should name the failed requirement and next command.
- Do not hide critical state only in generated diagrams, colors, terminal formatting, or prose-only summaries.

## Open Questions

| ID | Question | Owner | Blocking? |
|---|---|---|---|
| OQ-001 | Should JSC-370 latest provenance fields be stored in latest.json, manifest/result metadata, or an internal resolved context object? | Implementation agent with deep module packet | Blocks PU-002 code edits, not planning |
| OQ-002 | Should PU-002 and PU-003 ship in one JSC-370 PR or separate PRs? | Implementation coordinator | Not blocking; choose based on diff size |
| OQ-003 | What temporary external suite fixture root should JSC-371 use to prove evaluated-repo artifact writes? | Implementation agent | Blocks PU-005 only |
| OQ-004 | Should claim/evidence schemas be separate files plus combined envelope, or separate files only? | Implementation agent; spec owner if public contract changes | Blocks PU-006 schema naming only |
| OQ-005 | Are unavailable HE artifact identity and Linear traceability lints expected to be installed later, or should this repo rely on BLUF/shape validators? | Harness Engineering owner | Not blocking implementation; record as validation debt |

## Final Decision

Proceed with this plan as the execution contract for the approved proof-spine suite contract spec. The first implementation slice is JSC-370 through PU-001, PU-002, and PU-003. JSC-371 and JSC-372 stay queued until the current false-success boundary is fixed and the parent queue is reconciled.

post_plan_handoff:

    state: explicit_stop
    selected_next_stage: none
    evidence: ".harness/plan/2026-05-24-evals-proof-spine-suite-contract-plan.md written for JSC-369 through JSC-372."
    next_action: "Start he-work on JSC-370 only when implementation is explicitly authorized."

## Appendix A. Harness Metadata / Traceability

| Field | Value |
|---|---|
| interactive_status | complete_no_questions |
| selection_evidence | Canonical spec, core doctrine, ubiquitous language, Linear issues, implementation surfaces, and plan artifact contract inspected. |
| route | standard-plan |
| stage | he-plan |
| scope | Implementation sequencing for JSC-369 through JSC-372. |
| source | .harness/specs/2026-05-24-evals-proof-spine-suite-contract-spec.md |
| plan_path | .harness/plan/2026-05-24-evals-proof-spine-suite-contract-plan.md |
| safe_to_continue | true |
| blocked_reason | none |
| linear_action_required | recheck_before_closeout |
| linear_mutation_status | already_linked |
| git_staging_status | unstaged |
| staged_paths | [] |
| confidence | 92 percent: strong source/validation evidence, spec and plan are aligned after subagent review, HE plan validators and pnpm verify pass, implementation still pending, identity/traceability lints unavailable. |

## Appendix B. Linear / Tracker Handoff

| Linear | Role | Current Planning Status | Handoff |
|---|---|---|---|
| JSC-369 | Parent | live issue read during planning | Recheck before parent closeout. |
| JSC-370 | First child | live issue read during planning | Start first when he-work is authorized. |
| JSC-371 | Second child | live issue read during planning | Wait for JSC-370 closeout or explicit deferral. |
| JSC-372 | Third child | live issue read during planning | Wait for JSC-370 and JSC-371 checkpoint or explicit sequencing decision. |

No Linear mutation was performed by this he-plan run.

## Appendix C. Review Outcomes

Plan review outcomes:

| Check | Status | Evidence |
|---|---|---|
| Canonical source clear | pass | Spec path exists and has he-spec frontmatter. |
| Repo doctrine loaded | pass | .harness/core/2026-05-18-evals-core.md and UBIQUITOUS_LANGUAGE.md inspected. |
| Linear linkage | pass | JSC-369 through JSC-372 read successfully. |
| Phase-one hard blocks preserved | pass | Forbidden paths and refusal triggers include dashboard, plugin, cloud, network suite, adapter, judge, source mining, sibling runtime dependency. |
| HE artifact identity lint | blocked | Script unavailable in active owner skill tree. |
| HE Linear traceability lint | blocked | Script unavailable in active owner skill tree. |
| BLUF validator | pass | check_bluf_structure.py accepted the plan. |
| Generated artifact shape validator | pass | check_generated_artifact_shape.py accepted the plan. |
| Repo gate | pass | pnpm verify passed after the plan was written. |
