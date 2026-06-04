---
schema_version: 1
artifact_id: 2026-06-04-external-evals-suite-authority-spec
artifact_type: he-spec
canonical_slug: external-evals-suite-authority
title: External Evals Suite Authority Spec
status: draft_ready_for_he_plan
date: 2026-06-04
origin: .harness/research/audits/2026-06-04-external-evals-suite-gap-review.md
source_audit: .harness/research/audits/2026-06-04-external-evals-suite-gap-review.md
risk: high
spec_depth: full
ui: false
traceability_required: true
linear_mutation_status: deferred_to_he-linear-plan
linear_action_required: create_or_link_external_evals_suite_authority_issue_if_implementation_is_approved
template_status: unavailable
git_staging_status: not_staged
staged_paths: []
stage_arc_boundary:
  left_arc:
    source_of_truth: local_audit_plus_approved_attachment_lenses
    entry_authority: explicit
    freshness_required: fresh
    not_proof: local_spec_does_not_prove_implementation_ci_pr_tracker_or_external_runtime_behavior
  active_arc:
    owned_stage: he-spec
    allowed_actions: read_source_artifacts_and_write_local_spec
    forbidden_actions: product_code_edits_tracker_mutation_pr_mutation_commit_push_merge
    mutation_boundary: local_artifact
  right_arc:
    handoff_target: he-plan
    handoff_artifact: .harness/specs/2026-06-04-external-evals-suite-authority-spec.md
    proof_required: he_artifact_shape_checks_and_repo_validation_before_implementation
    closure_boundary: not_closure
    resume_key: external-evals-suite-authority
  persona_lenses:
    coding_lens: required
    testing_lens: required
    coverage_parity_required: yes
---

# External Evals Suite Authority Spec

## Command Summary

BLUF: This spec defines the next approved behavior boundary for moving evals from a strong local proof-contract verifier toward a bounded independent external evaluation authority. It matters because artifact consistency can otherwise be mistaken for independent target behavior proof, creating false confidence for agents, reviewers, and release decisions. The decision is to keep artifact-only inspection intact and make the first implementable slice external project manifest plus authority-mode labeling; black-box execution, dataset lifecycle, judge validation, suite reports, and feedback-loop artifacts remain gated candidate contracts until later approval opens those phases. The spec deliberately preserves phase-one hard blocks: no dashboards, cloud runners, plugin systems, source-mining automation, hosted telemetry authority, required LLM judge gates, or runtime dependency on coding-harness or agent-skills. The first implementation action is not to build a broad adapter system; it is to add the smallest manifest and policy contract that makes external proof claims explicit, reviewable, and fail-closed.
Decision Needed: implementation approval and tracker creation are deferred to he-plan; this spec only locks the behavioral contract.
Top Risks: external artifact consistency can be mistaken for external behavior proof; black-box execution can become an implicit adapter system; LLM judge support can create false confidence without ground-truth validation.
Next Action: run he-plan on this spec, create or link the Linear issue if implementation is approved, then execute the implementable first-slice criteria before any later phase-opening work.

## Purpose

This spec turns the external evals suite gap review into an implementation-grade Harness Engineering specification. It answers one question: what must evals add, without violating its current proof boundaries, before it can independently evaluate target project behavior from outside the target project boundary?

The answer is a staged authority model. Evals already owns local schemas, artifact bundles, deterministic scorer contracts, latest-pointer validation, baseline shape, and external artifact inspection. It does not yet own the contracts needed to safely execute target behavior, classify externally observed failures, validate judgment-heavy evaluators, or report suite-level risk to a decision-maker.

## Problem Statement

Jamie needs evals to become more than a local smoke runner and artifact validator, but the repository's existing restraint is valuable. The unsafe state is not that evals is too small. The unsafe state is that future agents or users may read a valid external artifact bundle and infer that the target project itself was independently evaluated.

The external gap review found that evals can inspect a consumer repo's already-written ".harness/evals/runs/latest.json" packet through "--repo-root", and can run consumer-owned data contracts. It cannot yet ask a target project a question from outside the project boundary, record observed behavior, score that behavior with a declared evaluator, classify failure modes from traces or command output, validate an LLM judge against ground truth, or emit a suite-level report that separates severity, priority, confidence, and remaining uncertainty.

The attached references sharpen the requirement:

- AI eval systems should start from observability and error analysis, prefer code-based checks for objective properties, and validate LLM judges with ground truth, train/dev/test splits, TPR/TNR, confusion matrices, and bias correction before using them for governance.
- Context-driven testing says every test answers a question, test strategy follows mission and context, automation is software development, and status reports must help stakeholders make decisions rather than certify quality by assertion.
- Use-case practice says requirements should be organized around actors pursuing goals, with scope, stakeholders, preconditions, success guarantees, main success scenarios, and extensions.
- User-story practice says stories are placeholders for conversation and confirmation; acceptance tests are part of the requirement, and splitting should keep value visible while avoiding oversized epics.

## User / Operator Scenarios

1. As Jamie, I want to know whether evals inspected target artifacts or actually executed target behavior, so that I do not treat artifact consistency as external behavioral proof.
2. As an implementation agent, I want a project manifest that declares allowed external execution modes, commands, timeouts, environment policy, artifact write policy, privacy class, and runtime-evidence policy, so that I cannot invent hidden adapters during implementation.
3. As a target repo maintainer, I want black-box evals to run only declared commands or API calls under bounded cwd, timeout, stdin, env, and output capture rules, so that external evaluation is useful without giving evals ownership of my repo internals.
4. As a reviewer, I want every evaluator to declare the question it answers, its evidence inputs, score scale, severity/priority mapping, deterministic or judge-backed nature, and validation status, so that a pass/fail verdict can be investigated.
5. As a QA or product reviewer, I want failure notes and trace observations to become a small failure taxonomy with frequency and severity, so that the next evals target the defects that matter.
6. As a future judge author, I want judge prompts to stay advisory until labels, train/dev/test splits, inter-annotator agreement or review policy, TPR/TNR, confusion matrix, and bias notes exist, so that a judge cannot become governance by vibe.
7. As a release decision-maker, I want a suite report that separates deterministic verdict, observed failure modes, confidence, uncertainty, baseline status, drift, feedback items, and next commands, so that I can decide what risk remains.

### User Stories

1. As an evals operator, I want "pnpm evals check --repo-root <path> --json" to say "artifact_only" when no external behavior was executed, so that external proof claims stay honest.
2. As a target repo maintainer, I want ".evals/project.json" to declare allowed execution and privacy policy, so that evals cannot run undeclared behavior.
3. As a suite author, I want each eval case to name the question it answers and the evaluator IDs used to answer it, so that cases remain understandable after the original conversation is gone.
4. As a scorer author, I want a canonical score object with evidence references, severity, priority, confidence, and failure taxonomy fields, so that suite reports can compare results without parsing prose.
5. As a QA reviewer, I want datasets, labels, splits, and annotations to be first-class artifacts, so that judge validation and regression coverage can be audited.
6. As a downstream implementation agent, I want acceptance criteria and validation commands tied to stable IDs, so that I can prove completion without reinterpreting this spec.

## Goals

- Preserve artifact-only external inspection as a valid, clearly labeled mode.
- Add a project manifest contract before any black-box external execution.
- Classify bounded black-box execution as a blocked phase-opening candidate until a later ADR/spec or explicit user approval opens behavioral external mode.
- Make every eval answer a named question with declared evidence inputs.
- Prefer deterministic code-based evaluators where objective checks are possible.
- Add judge validation contracts before any LLM judge can influence required verdicts.
- Add dataset, label, split, and annotation lifecycle before judge or trend reporting work.
- Emit suite-level decision reports that separate severity, priority, confidence, drift, baseline, and recommended feedback-loop work.
- Keep target projects as owners of domain fixtures, thresholds, privacy approval, and baseline promotion.

## Spec Scope Classes

| Scope Class | Included Surfaces | Requirement / VAC IDs | Implementation Status |
| --- | --- | --- | --- |
| implementable_first_slice | Project manifest proposal, authority-mode labeling, artifact-only external inspection clarity, authority classifier owner, privacy approval shape, and current smoke compatibility. | FR-001, FR-002, FR-003, FR-004, FR-005, FR-008, FR-018, FR-019, VAC-001, VAC-002, VAC-003, VAC-005, VAC-013, VAC-014 | Eligible for he-plan after implementation approval. |
| blocked_phase_opening_candidate | Bounded black-box behavior execution from outside a target repo. | FR-006, FR-007, VAC-004 | Blocked until a later ADR/spec or explicit approval opens behavioral external mode and resolves the phase-one hard block. |
| future_contract_candidate | Evaluator descriptors, canonical score objects, datasets, annotations, judge validation, suite reports, and feedback-loop artifacts. | FR-009 through FR-017, VAC-006 through VAC-012 | Research-backed candidate contracts; not first he-plan scope unless explicitly approved. |
| out_of_scope_phase_one | Dashboards, cloud runners, plugin systems, source mining, hosted telemetry authority, required judge gates, and sibling runtime dependencies. | VAC-015 | Not implementable under this spec. |

## Non-Goals

- Do not add dashboards, cloud runners, hosted telemetry exporters as authority, plugin systems, source-mining automation, or required LLM judge gates.
- Do not import or depend on coding-harness, agent-skills, OpenTelemetry collectors, Phoenix, Langfuse, Braintrust, LangSmith, or any hosted observability tool.
- Do not make evals a white-box source oracle for target repos.
- Do not promote baselines for target repos.
- Do not certify PR mergeability, CI state, review-thread state, tracker state, or production readiness.
- Do not start with RAG, pipeline, multi-turn, safety, or production monitoring breadth before project manifest and bounded execution contracts exist.

## Current State / Evidence

| Evidence | Current Finding | Spec Consequence |
| --- | --- | --- |
| ".harness/research/audits/2026-06-04-external-evals-suite-gap-review.md" | Current maturity is C-/early external proof spine. The repo is strong as a local artifact verifier and early external artifact inspector, but not an independent external behavior authority. | Specify the next authority boundary rather than claiming readiness. |
| GAP-001 | No black-box target execution owner. Synthetic smoke execution cannot prove target behavior. | Add a bounded external execution owner after manifest policy exists. |
| GAP-002 | No project manifest contract. Suite identity and evaluated repo root are inferred from paths. | Add ".evals/project.json" before behavioral external mode. |
| GAP-003 | External runtime-evidence policy is effectively not configured. | Make policy explicit in manifest and output. |
| GAP-004 and GAP-005 | Evaluator descriptors and canonical score object are missing. | Add evaluator catalog and score object before broad reporting. |
| GAP-006 and GAP-007 | Dataset lifecycle and judge validation are missing. | Require labels, splits, and judge metrics before judge authority. |
| GAP-013 and GAP-014 | Reporting and feedback-loop artifacts are run-local, not suite-decision oriented. | Add suite report and feedback item artifacts after scoring contracts exist. |
| "AGENTS.md" | Phase-one hard blocks reject dashboards, adapters, cloud runners, plugin systems, source mining, required judge gates, and sibling runtime deps. | Keep all new contracts local, bounded, and additive. |
| AI evals attachment | Error analysis precedes automation; code-based evals handle objective checks; judges need validation against ground truth. | Sequence failure taxonomy and judge validation before judge authority. |
| Lessons Learned attachment | Question-driven tests, context-driven strategy, status reporting, automation-as-software. | Require question IDs, implementation-grade validation, and decision reports. |
| Use cases attachment | Actor-goal scenarios, preconditions, success scenarios, extensions. | Express external eval modes as actor-goal contracts. |
| User stories attachment | Story confirmation tests and value-preserving story splits. | Tie user stories to VAC IDs and executable proof. |

## Authority and Scope Boundary

requested_depth: full_spec_for_future_implementation.

approved_execution_boundary: local spec artifact only. No product code, tracker, PR, commit, push, or external mutation is authorized by this spec.

downscope_authority: the user asked for a spec from the audit and attachments, checked by architecture, simplification, and ubiquitous-language lenses. Any implementation, Linear mutation, or PR work is deferred to a later approved HE stage.

external_mutation_boundary: none in this stage. Future implementation MUST treat target repo command execution as local process execution under explicit manifest policy, not external service mutation.

freshness_required: fresh source audit and current repository instruction files were required for the spec. Live tracker state was not required because tracker mutation is deferred.

human_acceptance_boundary: Jamie accepts or revises the spec before he-plan turns it into implementation slices.

Truth boundary:

| Lane | What This Spec Can Prove | What It Cannot Prove |
| --- | --- | --- |
| Local artifact | The requested spec was written and can pass HE artifact-shape checks. | Runtime implementation exists. |
| Evals repository | The spec is compatible with current repo doctrine when validation passes. | All future tests, CI, PR, or tracker state. |
| Target repo | Required future contracts for external behavior proof. | Any target repo behavior today. |
| Attachments | Principles used as design lenses. | Legal, exhaustive, or canonical doctrine beyond this spec. |

## Proposed Behavior

### User-Facing Solution

Evals will expose explicit evidence-acquisition authority modes:

| Mode | Purpose | Authority | Must Not Claim |
| --- | --- | --- | --- |
| artifact_only | Inspect an existing target artifact bundle. | Artifact consistency, schema validity, latest pointer consistency. | Target behavior, CI, PR, review, tracker, or baseline promotion. |
| black_box_execution | Blocked candidate for running declared target commands or API calls from outside the target internals. | Not implementable until a later phase-opening decision. | Source correctness, root cause, white-box coverage, production readiness, or authorization under this spec. |

Judge output is not an authority mode. It is an evaluator axis. Future JSON SHOULD model it with fields such as "evaluator_kind: deterministic|judge_advisory", "judge_authority_status: blocked|advisory|promoted_by_later_spec", and "required_verdict_eligible: false" unless a later spec explicitly opens judge-backed required gates.

The first implementation slice MUST add the manifest and runtime-evidence policy that let evals distinguish artifact-only proof from non-proof claims in JSON output. Bounded black-box execution MAY NOT be implemented from this spec alone; it requires a later ADR/spec or explicit approval that opens behavioral external mode. Later candidate contracts MAY add evaluator catalog, canonical score objects, dataset lifecycle, judge validation, suite reports, and feedback artifacts after their own scope is approved.

### Actor-Goal Use Cases

#### UC-001: Inspect External Artifact Bundle

Primary actor: evals operator.

Stakeholders: Jamie, target repo maintainer, reviewer, future implementation agent.

Preconditions:

- Target repo has a ".harness/evals/runs/latest.json" packet.
- The operator invokes an artifact inspection command.

Main success scenario:

1. Operator runs "pnpm evals check --repo-root <target> --json".
2. Evals resolves the target repo artifact root without executing target behavior.
3. Evals validates latest pointer, manifest, result, report, command log, scorer results, baseline result, trace events, and artifact hashes.
4. Evals emits "authority_mode: artifact_only".
5. Evals reports pass/fail, recovery command, and explicit non-proof claims.

Extensions:

- If latest is missing or stale, output fails closed with a recovery command.
- If target artifacts are valid but behavior was not executed, output still says "artifact_only".

#### UC-002: Run Bounded Black-Box Suite

Status: blocked phase-opening candidate. This use case is included to define the future contract shape, not to authorize implementation in the first slice.

Primary actor: suite author or target repo maintainer.

Stakeholders: Jamie, target repo maintainer, reviewer, future implementation agent.

Preconditions:

- Target repo has ".evals/project.json".
- The manifest declares allowed commands, cwd policy, timeout, environment policy, stdin/payload policy, output capture, artifact write policy, privacy class, and runtime-evidence policy.
- Suite cases reference declared evaluator IDs.

Main success scenario:

1. Operator runs "pnpm evals run <target>/.evals/suite.json --json".
2. Evals loads ".evals/project.json" and rejects undeclared behavior.
3. Evals executes only declared black-box commands under bounded policy.
4. Evals captures stdout, stderr, exit code, timing, input hash, output hash, and declared artifacts.
5. Evals scores outputs through declared evaluators.
6. Evals writes a run artifact bundle and suite report under the evaluated repo artifact root.
7. Evals emits "authority_mode: black_box_execution".

Extensions:

- If network is requested, fail closed unless a later ADR/spec opens networked execution.
- If a command exceeds timeout, record timeout as an observed result and apply scorer rules.
- If manifest privacy class requires approval and approval evidence is absent, fail before execution.

#### UC-003: Validate Advisory Judge

Status: future contract candidate. This use case is included to preserve the research-backed validation shape, not to authorize judge-backed required verdicts.

Primary actor: judge author.

Stakeholders: QA reviewer, product reviewer, target repo maintainer, Jamie.

Preconditions:

- Dataset registry, label schema, annotation schema, and split schema exist.
- Human-reviewed labels or approved ground truth exist.
- Judge descriptor names prompt version, model family, temperature, criteria, expected JSON shape, cost notes, and evidence inputs.

Main success scenario:

1. Judge author runs a validation command against labeled data.
2. Evals checks train/dev/test split integrity.
3. Evals computes TPR, TNR, false positives, false negatives, confusion matrix, and agreement or review notes.
4. Evals records judge validation status as advisory.
5. Evals blocks judge output from required verdict authority unless a later spec explicitly promotes that authority.

Extensions:

- If dev/test data is reused incorrectly, validation fails as overfit risk.
- If TNR is weak for safety or policy failure detection, validation status remains blocked or advisory-low-confidence.

## Requirements

### Functional Requirements

| ID | Requirement | Validation Anchor |
| --- | --- | --- |
| FR-001 | Evals MUST expose "authority_mode" in external check/run JSON output once this program begins implementation. | VAC-001 |
| FR-002 | "authority_mode" MUST distinguish evidence-acquisition modes such as "artifact_only" and any later approved "black_box_execution"; judge status MUST be modeled on a separate evaluator axis. | VAC-001 |
| FR-003 | Artifact-only external inspection MUST NOT execute target commands, read undeclared source surfaces, promote baselines, or certify target behavior. | VAC-002 |
| FR-004 | A project manifest schema MUST define project identity, suite roots, allowed execution modes, runtime-evidence policy, privacy class, artifact policy, baseline authority, and compatibility version. | VAC-003 |
| FR-005 | Behavioral external mode MUST be blocked when a target suite lacks a valid project manifest. | VAC-003 |
| FR-006 | If a later phase-opening decision approves black-box execution, it MUST run only manifest-declared commands or calls under bounded cwd, timeout, stdin/payload, environment, output capture, and artifact-write policies. | VAC-004 |
| FR-007 | If a later phase-opening decision approves black-box execution, it MUST capture stdout, stderr, exit code, timing, input hash, output hash, command identity, working directory, timeout status, and declared artifact references. | VAC-004 |
| FR-008 | Manifest and suite paths MUST reject absolute paths and parent traversal unless a later explicit compatibility decision opens a narrow exception. | VAC-005 |
| FR-009 | Each eval case MUST declare the question it answers. | VAC-006 |
| FR-010 | Evaluator descriptors MUST declare evaluator ID, question, objective or judgment-heavy kind, evidence inputs, score scale, verdict mapping, severity/priority mapping, owner, version, and validation status. | VAC-007 |
| FR-011 | Canonical score objects MUST include evaluator ID, case ID, status, numeric or enum score where applicable, deterministic verdict, evidence references, failure taxonomy labels, severity, priority, confidence, and diagnostic assertions. | VAC-008 |
| FR-012 | Objective properties SHOULD be evaluated by deterministic code-based evaluators before judge-backed evaluators are considered. | VAC-008 |
| FR-013 | Dataset lifecycle schemas MUST define dataset identity, sampling dimensions, source provenance, privacy class, labels, annotations, splits, reviewer metadata, and retention notes. | VAC-009 |
| FR-014 | LLM judge descriptors MUST remain advisory until validation artifacts include ground truth, train/dev/test split integrity, TPR, TNR, confusion matrix, false-positive and false-negative counts, and prompt/model version. | VAC-010 |
| FR-015 | Required verdicts MUST NOT depend on LLM judge output unless a later ADR/spec explicitly opens judge-backed required gates. | VAC-010 |
| FR-016 | Suite-level reports MUST separate deterministic verdict, advisory judge status, failure taxonomy, severity, priority, confidence, baseline presence/comparison/promotion, drift, rollback, and next recommended commands. | VAC-011 |
| FR-017 | Feedback-loop artifacts MUST convert repeated failures into regression candidate items with root-cause hypothesis, evidence refs, owner repo, priority, and proposed eval/test addition. | VAC-012 |
| FR-018 | External runtime-evidence policy MUST classify unavailable or unconfigured target evidence as "not_configured", not success. | VAC-013 |
| FR-019 | The existing smoke case and artifact-only repo-root inspection behavior MUST remain compatible unless a later migration note explicitly changes them. | VAC-014 |
| FR-020 | Any trace or span evidence contract MUST use local artifact ingestion with declared provenance, privacy class, and redaction policy; hosted observability services MAY inspire shape but MUST NOT become runtime dependencies or proof authority. | VAC-015 |
| FR-021 | Judge threshold policy MUST remain "research_required" until a target domain, labeled dataset, failure severity model, and false-positive/false-negative cost model are available. | VAC-010 |
| FR-022 | Authority classifier output MUST expose machine-readable "agent_next_actions", "human_approval_required_actions", and "blocked_actions", each with reason and required proof or approval. | VAC-016 |

### Non-Functional Requirements

| ID | Requirement | Validation Anchor |
| --- | --- | --- |
| NFR-001 | New contracts MUST be additive and versioned. | VAC-003, VAC-007, VAC-009 |
| NFR-002 | Error JSON MUST name the failed requirement, observed value, expected value, evidence refs, and recovery command where applicable. | VAC-005, VAC-013 |
| NFR-003 | Implementation MUST preserve phase-one hard blocks until a later ADR or spec explicitly opens a blocked capability. | VAC-015 |
| NFR-004 | Automation MUST be treated as production code: schema, tests, negative cases, and validation gates are required for new execution behavior. | VAC-004, VAC-015 |
| NFR-005 | Status reporting MUST support decisions by separating severity, priority, confidence, uncertainty, and non-proof lanes. | VAC-011 |
| NFR-006 | Public JSON fields MUST be stable enough for future agents to cite without parsing prose. | VAC-001, VAC-011 |
| NFR-007 | The implementation MUST keep target repo domain truth, thresholds, privacy approval, and baseline promotion target-owned. | VAC-002, VAC-003 |
| NFR-008 | The implementation MUST remain locally runnable without hosted observability services. | VAC-015 |

## Interfaces

Existing interfaces that remain binding:

    pnpm evals run fixtures/smoke/pr-closeout.case.json --json
    pnpm evals check --json
    pnpm evals check --repo-root path/to/consumer-repo --json
    pnpm evals state --json
    pnpm evals state --repo-root path/to/consumer-repo --json
    pnpm verify

Candidate capabilities for later implementation:

    repo-local suite execution capability: command name already exists for suite files where current repo contracts allow it
    judge validation capability: command name TBD by he-plan or later ADR
    suite report generation capability: command name TBD by he-plan or later ADR

The candidate capability names are not authorized as final public command names by this spec. he-plan MUST record a compatibility decision before adding or renaming public commands.

## Data / Domain Contract

### Project Manifest

Candidate file: ".evals/project.json".

Required fields:

| Field | Rule |
| --- | --- |
| schema_version | Required integer or semver-compatible string. |
| project_id | Required stable ID. |
| project_name | Required human-readable name. |
| suite_roots | Required repo-relative paths. |
| authority_modes | Required enum list; allowed initial values: artifact_only, black_box_execution. |
| runtime_evidence_policy | Required object declaring expected evidence and fallback status. |
| privacy_class | Required enum; exact enum decided during schema design. |
| artifact_policy | Required artifact root, retention notes, and latest pointer behavior. |
| execution_policy | Required for black-box mode; absent or disabled for artifact-only mode. |
| baseline_authority | Required object saying target repo owns promotion. |
| unknown_field_policy | Required enum; recommended initial value: reject for manifests. |

### Authority Classifier

Future implementation MUST keep authority classification in one owner module or equivalent deep owner. That owner is the only place allowed to derive:

- authority_mode;
- non-proof claims;
- proof context;
- required recovery guidance;
- agent_next_actions;
- human_approval_required_actions;
- blocked_actions;
- whether black-box execution is unavailable, blocked, or later approved;
- whether judge output is advisory, blocked, or later promoted.

Callers MUST NOT reconstruct authority mode or next-action partitions from manifest fields, runner state, report text, or CLI flags independently. Agent-readable output MUST separate actions an agent may take from actions requiring human approval and actions blocked by phase, policy, or missing proof.

### Execution Policy

The execution policy MUST make unsafe behavior explicit:

- allowed command IDs;
- command argv or command template;
- cwd root and cwd relative path;
- timeout milliseconds;
- environment allowlist;
- stdin or payload policy;
- network policy, default false;
- artifact write policy;
- output byte limit;
- redaction policy;
- privacy approval reference when needed.

Execution policy is a blocked phase-opening candidate unless the implementation remains artifact-only.

### Privacy Approval Evidence

When a manifest or dataset requires privacy approval, the approval evidence object MUST include:

- approval_status: approved, blocked, expired, not_required, or pending;
- approved_by;
- approved_at;
- scope;
- data_classes;
- retention_policy_ref;
- redaction_policy_ref;
- review_due_at or expires_at.

Synthetic or public fixtures MUST record "approval_status: not_required" rather than omitting approval evidence when the schema requires the object.

### Evaluator Descriptor

Evaluator descriptors MUST be data contracts, not executable plugin hooks. Initial descriptor fields:

- evaluator_id;
- question;
- kind: deterministic or judge_advisory;
- evidence_inputs;
- score_scale;
- verdict_mapping;
- severity_mapping;
- priority_mapping;
- failure_taxonomy;
- validation_status;
- version;
- owner;
- notes.

### Canonical Score Object

Score objects MUST be comparable across evaluators without parsing report prose:

- case_id;
- evaluator_id;
- status;
- score;
- verdict;
- severity;
- priority;
- confidence;
- failure_taxonomy_labels;
- assertions;
- evidence_refs;
- trace_refs;
- cost_ms or duration_ms where applicable;
- diagnostic;
- reproduce_command.

### Dataset, Label, Annotation, and Split Contracts

Dataset contracts MUST support error analysis and judge validation without forcing a hosted observability stack:

- dataset identity and version;
- sampling dimensions;
- source provenance;
- privacy class;
- label schema;
- annotation schema;
- train/dev/test split IDs;
- reviewer or annotation policy;
- inter-annotator agreement or review note when available;
- retention and redaction notes;
- known limitations.

Judge threshold policy stays "research_required" for future candidate work until a target domain, labeled dataset, failure severity model, and false-positive/false-negative cost model are available. he-plan may design schema fields for thresholds, but MUST NOT set universal promotion thresholds from generic eval guidance.

## Enforcement Contract

essential_decisions:

- Public authority modes and non-proof claims.
- Single-owner authority classifier behavior.
- Manifest schema, execution policy schema, evaluator descriptor schema, score object schema, and dataset lifecycle schema.
- Blocked black-box execution safety boundary.
- Judge validation and non-authority boundary.
- Suite report decision fields.

fillable_gaps:

- Exact field enum names when they preserve the above meaning.
- Internal module names chosen by the implementation agent, provided deep module ownership remains explicit.
- Additional deterministic evaluator descriptors for existing smoke/runtime checks.
- Report formatting and wording that preserves required fields.

guardrails:

- JSON schema tests for every new contract.
- Positive and negative manifest fixture tests.
- Black-box execution fixture using a tiny local target command only after a later phase-opening decision approves behavioral mode.
- Path traversal and absolute path rejection tests.
- Judge validation fixture that proves weak TNR or split misuse blocks authority.
- pnpm test.
- pnpm evals run fixtures/smoke/pr-closeout.case.json --json.
- pnpm evals check --json.
- pnpm evals check --smoke --json.
- pnpm verify.

refusal_triggers:

- A proposed implementation requires network execution, hosted observability, dashboards, plugin hooks, source mining, or target repo runtime dependencies.
- Judge output is proposed as required verdict authority before validation and later explicit approval.
- Manifest fields cannot distinguish artifact-only from behavior execution.
- Privacy approval or target repo ownership is ambiguous.
- Public CLI or JSON breaking changes are required without a migration decision.

durable_memory:

- Update "UBIQUITOUS_LANGUAGE.md" only when implementation introduces accepted new terms.
- Record implementation lessons in ".harness/memory/LEARNINGS.md" when a repeated failure class is fixed.
- Keep spec/plan/closeout evidence under ".harness/**"; do not promote local telemetry or private attachments into durable memory.

professional_output:

- Closeout must list files changed, exact commands run, pass/fail/blocked outcomes, blocker class, residual risk, and next action.
- Local validation, PR state, CI state, review state, tracker state, and merge readiness must remain separate lanes.

## Proof and Runtime Boundary

proof_boundary: Only schema-backed artifacts, command output, scorer results, score objects, dataset validation artifacts, judge validation artifacts, and suite reports produced by evals can prove evals-owned claims. Trace and span evidence may explain or support evaluation only when ingested as local artifacts with provenance, privacy, and redaction metadata.

non_proof_sources: Chat summaries, session memory, telemetry spans, hosted observability dashboards, PR comments, Linear status, model confidence, and target repo prose do not prove evals-owned acceptance criteria unless a fresh command or artifact validates them.

runtime_state: The current stage writes a spec only. Future implementation must refresh repo state before editing and must not treat this spec as runtime proof.

runtime_invocation_receipt: not_applicable_for_spec_stage; future implementation must cite exact commands and artifact paths.

resumption_key: external-evals-suite-authority.

artifact_chain_key: external-evals-suite-authority.

persistent_artifacts:

- ".harness/specs/2026-06-04-external-evals-suite-authority-spec.md"
- future he-plan artifact;
- future implementation validation artifacts;
- future closure eval if code changes are implemented.

live_state_refresh: Required before he-plan implementation and again before closeout.

session_evidence_status: Useful as source-trace context only; not proof of implementation, tests, tracker, PR, or target runtime behavior.

## Coding and Testing Lenses

coding_lens:

- Own new behavior in deep modules: manifest contract owner, execution owner, evaluator catalog owner, score object owner, dataset lifecycle owner, judge validation owner, and suite report owner.
- Add an authority classifier owner before any caller uses authority-mode output.
- Keep callers from reconstructing authority mode, manifest policy, or score verdicts across scattered files.
- Preserve additive public JSON changes unless a compatibility decision says otherwise.
- Keep target project paths repo-relative and fail closed on escapes.
- Keep black-box execution policy data-driven, not a plugin system.
- Keep complexity staged; each slice must be useful without later slices.

testing_lens:

- Test externally observable behavior, not private helper choreography.
- Every VAC ID needs at least one positive or negative proof path before acceptance.
- Include known-good and known-bad evaluator fixtures.
- Include manifest missing, invalid, and disallowed behavior cases.
- Include black-box timeout, nonzero exit, stdout/stderr capture, and path escape cases.
- Include judge validation cases for weak TNR, reused test data, missing ground truth, and valid advisory status.
- Preserve canonical smoke and verify gates.

Architecture review lens from "$improve-codebase-architecture":

- Prefer an explicit interface move over a shallow patch because the audit gaps are authority-boundary gaps, not missing prose.
- The smallest durable owner split is manifest to execution to evaluator descriptor to score object to dataset/judge validation to suite report.
- Avoid an adapter framework until repeated target execution policies prove a narrower abstraction is insufficient.

Simplification lens from "$simplify":

- Do not implement RAG, pipeline, multi-turn, production monitoring, dashboards, or cloud workflows in the first slice.
- Do not require judge validation work before deterministic code-based scoring and manifest/execution safety exist.
- Merge delete/remove style external behavior into bounded command execution rather than separate command, API, and tool runner abstractions.

Ubiquitous-language lens:

- Reuse existing terms: artifact bundle, runtime state packet, runtime evidence contract, deterministic verdict, scorer result, assertion result, baseline result, deep module fix packet, tracer proof, local prior-art reuse.
- Candidate new terms are listed in Appendix A as blackboard deltas; implementation should update "UBIQUITOUS_LANGUAGE.md" only after the terms are accepted.

## Security, Privacy, and Safety

- Black-box execution MUST default to no network.
- Environment variables MUST be allowlisted, not inherited wholesale.
- Secrets, tokens, passwords, and private keys MUST be redacted from command logs and reports.
- Manifest privacy class MUST be checked before execution.
- Dataset and annotation artifacts MUST record source provenance and retention notes.
- Artifact paths MUST remain repo-relative.
- Target repo baseline promotion MUST remain target-owned.
- Judge output MUST stay advisory unless later explicitly promoted by spec/ADR.

## Accessibility and Operator Ergonomics

- JSON output MUST include machine-readable recovery commands.
- Markdown reports MUST not rely on color-only status.
- Failure diagnostics SHOULD follow assertion-shaped fields: given, should, actual, expected, evidence_refs, reproduce_command, status, and diagnostic.
- Suite reports SHOULD lead with decision-relevant state: verdict, severity, priority, confidence, uncertainty, drift, baseline status, and next action.

## Failure and Recovery

| Failure | Required Behavior | Recovery |
| --- | --- | --- |
| Missing manifest for behavioral run | Fail before execution. | Add ".evals/project.json" or run artifact-only inspection. |
| Manifest requests network | Fail closed during phase one. | Record blocked reason; later ADR/spec required. |
| Path escapes suite root | Fail before reading or writing. | Use repo-relative path under allowed root. |
| Command timeout | Record timeout as observed result. | Tune manifest timeout or target behavior. |
| Missing runtime evidence | Classify as "not_configured", not success. | Add declared evidence or keep mode artifact-only. |
| Weak judge TNR | Keep judge advisory or blocked. | Improve labels, prompt, criteria, or deterministic evaluator. |
| Report lacks severity/priority | Fail report validation. | Add decision fields from score objects. |

## Validation Plan

Spec-stage validation:

    python3 /Users/jamiecraik/dev/agent-skills/Plugins/cache/agent-skills-local/harness-engineering/0.1.0/scripts/check_bluf_structure.py .harness/specs/2026-06-04-external-evals-suite-authority-spec.md --json
    python3 /Users/jamiecraik/dev/agent-skills/Plugins/cache/agent-skills-local/harness-engineering/0.1.0/scripts/check_generated_artifact_shape.py .harness/specs/2026-06-04-external-evals-suite-authority-spec.md --kind spec --json
    pnpm test

Future implementation validation, expected minimum:

    pnpm test
    pnpm evals run fixtures/smoke/pr-closeout.case.json --json
    pnpm evals check --json
    pnpm evals check --smoke --json
    pnpm evals state --json
    pnpm verify

Future implementation MUST add focused tests for each accepted VAC ID.

## Acceptance Criteria

| ID | Acceptance Criterion | Proof |
| --- | --- | --- |
| VAC-001 | External JSON output exposes authority mode and distinguishes artifact-only from black-box execution where implemented. | JSON fixture tests and CLI output assertions. |
| VAC-002 | "--repo-root" artifact inspection remains read-side only and does not execute target behavior. | Negative test with target command that would fail if run. |
| VAC-003 | ".evals/project.json" schema validates required identity, policy, privacy, artifact, baseline, and execution fields; behavioral mode fails without it. | Schema tests and run negative test. |
| VAC-004 | Black-box execution remains blocked until a later phase-opening decision; if later approved, it captures stdout, stderr, exit code, timing, cwd, timeout status, input/output hashes, and declared artifacts under manifest policy. | Blocked-status assertion now; tiny target repo fixture and command log assertions only after approval. |
| VAC-005 | Absolute paths and parent traversal are rejected for manifest, suite, case, artifact, and dataset pointers. | Path-boundary tests. |
| VAC-006 | Eval cases declare the question they answer. | Schema and fixture tests. |
| VAC-007 | Evaluator descriptors declare question, kind, evidence inputs, scale, mapping, owner, version, and validation status. | Schema and catalog tests. |
| VAC-008 | Canonical score objects carry evidence refs, assertion diagnostics, deterministic verdict, severity, priority, confidence, and failure taxonomy labels. | Scorer result tests and report fixture. |
| VAC-009 | Dataset lifecycle schemas validate source provenance, sampling dimensions, labels, annotations, splits, privacy, and retention notes. | Schema tests with valid/invalid examples. |
| VAC-010 | Judge validation remains advisory unless ground truth, split integrity, TPR/TNR, confusion matrix, prompt/model version, and domain-specific threshold research exist. | Judge validation fixture tests and research-required threshold status. |
| VAC-011 | Suite reports separate verdict, advisory judge status, severity, priority, confidence, uncertainty, baseline, drift, rollback, and next commands. | Report schema/snapshot tests. |
| VAC-012 | Repeated failure modes can produce feedback-loop artifacts with root-cause hypothesis, evidence refs, owner repo, priority, and proposed regression eval/test. | Feedback artifact fixture test. |
| VAC-013 | Missing runtime evidence is "not_configured" or blocked, never success. | Runtime state tests. |
| VAC-014 | Existing smoke and artifact-only commands remain compatible. | Existing smoke checks and "pnpm verify". |
| VAC-015 | Phase-one hard blocks remain enforced. | Negative tests for network, plugin hooks, source mining, hosted telemetry authority, and required judge gates. |
| VAC-016 | Agent-readable next actions are partitioned into agent-allowed, human-approval-required, and blocked actions. | Authority classifier JSON fixture tests. |

## Visual References / Diagrams

| Step | Authority Increment | Depends On |
| --- | --- | --- |
| 1 | artifact_only: inspect latest packet | Existing repo-root artifact inspection |
| 2 | manifest contract | Step 1 |
| 3 | black_box_execution: bounded command observation | Blocked until later phase-opening decision after Step 2 |
| 4 | evaluator descriptor catalog | Step 2; Step 3 if behavior execution is later opened |
| 5 | canonical score object | Step 4 |
| 6 | dataset and annotation lifecycle | Step 5 |
| 7 | advisory judge validation | Step 6 |
| 8 | suite decision report and feedback-loop regression item | Steps 5 and 7 |

## Implementation Notes

Recommended scope sequence:

1. Implementable first slice: manifest proposal, artifact-only authority labeling, authority classifier owner, and privacy approval evidence shape.
2. Blocked phase-opening candidate: bounded black-box execution owner, only after later ADR/spec or explicit approval.
3. Future contract candidate: evaluator descriptor catalog and canonical score object.
4. Future contract candidate: dataset, label, annotation, and split contracts.
5. Future contract candidate: judge validation artifacts, still advisory and threshold policy "research_required".
6. Future contract candidate: suite-level decision report and feedback-loop item.

Deep module packet expectation:

Before each runtime/schema implementation slice, write or update the deep module fix packet with owner module, public interface, hidden implementation rule, caller contract, seam test, tracer proof, rollback path, and validation gate.

Architecture decision:

The first slice should be a public contract/schema move, not a runner rewrite. Execution without manifest policy and a later phase-opening decision would widen authority before it can be audited.

## Open Questions

1. Should the manifest file be exactly ".evals/project.json", or should it be ".evals/evals.project.json" to avoid collision with consumer tooling?
2. What privacy class enum should be canonical for target-owned fixtures?
3. What domain-specific TPR/TNR threshold should qualify an advisory judge as usable for reports after target domain, labeled dataset, failure severity model, and false-positive/false-negative cost model are available?
4. Should suite-level reports be one artifact or split into machine JSON plus human Markdown?

These questions do not block he-plan. They do block implementation choices that would make public schema or CLI commitments.

## Decision

Proceed to he-plan with this staged contract. The approved first implementation target should be manifest, authority classifier, artifact-only authority-mode output, and privacy approval evidence shape. Bounded black-box execution remains blocked until a later phase-opening decision explicitly opens behavioral external mode.

This decision does not classify evals as external-eval ready; it classifies the next contract work needed before that readiness claim can be made.

Do not implement dashboards, hosted observability, plugin execution, source mining, required judge gates, or broad AI-eval platform integration as part of this spec.

## Evidence and References

- ".harness/research/audits/2026-06-04-external-evals-suite-gap-review.md"
- ".harness/core/2026-05-18-evals-core.md"
- "UBIQUITOUS_LANGUAGE.md"
- "ARCHITECTURE.md"
- "/Users/jamiecraik/Documents/Coding Skill books/ai_evals_comprehensive_study_guide.md"
- "/Users/jamiecraik/Documents/Coding Skill books/Lessons Learned in Software Testing.pdf"
- "/Users/jamiecraik/Documents/Coding Skill books/Writing Effective Use Cases copy.pdf"
- "/Users/jamiecraik/Documents/Coding Skill books/User-Stories-Applied-Mike-Cohn copy.pdf"

## Appendix A. Harness Metadata / Traceability

Selected route:

- "$evals-router": evaluation audit evidence transformed into HE specification.
- "$harness-engineering:he-spec": spec artifact written under ".harness/specs/".
- "$improve-codebase-architecture": checked for authority boundary, owner modules, patch-vs-interface decision, and safe public contract sequencing.
- "$simplify": checked for smallest staged scope and removal of premature platform breadth.
- "$ubiquitous-language": checked against current evals glossary and candidate term deltas.

Source traceability:

| Source | Spec Use |
| --- | --- |
| External gap review | Primary gap queue, current readiness, and priority order. |
| AI evals guide | Error analysis, traces, code-based evals, judge validation, datasets. |
| Lessons Learned in Software Testing | Question-driven tests, context-driven strategy, status reporting, automation-as-software. |
| Writing Effective Use Cases | Actor-goal scenarios, preconditions, success scenarios, extensions. |
| User Stories Applied | Story confirmation tests and value-preserving story splits. |

Attachment-to-acceptance trace:

| Attachment Lens | Acceptance Links |
| --- | --- |
| AI evals guide | VAC-006, VAC-008, VAC-009, VAC-010, VAC-011 |
| Lessons Learned in Software Testing | VAC-006, VAC-008, VAC-011, VAC-012 |
| Writing Effective Use Cases | UC-001, UC-002, UC-003, VAC-003, VAC-004, VAC-005 |
| User Stories Applied | User Stories section, VAC table confirmation framing |

blackboard_delta:

| Candidate Term | Proposed Definition | Status |
| --- | --- | --- |
| Authority mode | Machine-readable classification of what an eval result is allowed to prove. | candidate |
| External project manifest | Target-owned ".evals" contract declaring identity, execution policy, runtime-evidence policy, privacy class, artifact policy, and baseline authority. | candidate |
| Black-box execution | Blocked phase-opening candidate for bounded target behavior observation through declared commands or calls without source or domain ownership. | blocked_candidate |
| Evaluator descriptor | Data contract describing the question, inputs, score scale, verdict mapping, owner, version, and validation status for an evaluator. | candidate |
| Canonical score object | Comparable machine-readable scorer output carrying verdict, evidence, diagnostics, severity, priority, confidence, and taxonomy. | candidate |
| Advisory judge | LLM judge output that can explain or support analysis but cannot decide required verdicts without later explicit authority. | candidate |
| Suite decision report | Human and machine report that separates verdict, severity, priority, confidence, uncertainty, baseline, drift, rollback, and next action. | candidate |
| Authority classifier | Deep owner that derives authority mode, non-proof claims, proof context, and recovery guidance from manifest and run evidence. | candidate |

## Appendix B. Inline Lens Outcomes

These were inline skill-lens checks during spec drafting, not independent reviewer approval.

Architecture lens:

- Pass with residual risk. The spec chooses explicit public contract boundaries before execution breadth.
- Residual risk: manifest schema naming and judge validation thresholds still require implementation-time decisions or approval.

Simplification lens:

- Pass. The spec removes platform breadth from the first slice and sequences the work so each slice has standalone value.
- Residual risk: evaluator catalog and score object could become overly abstract if implemented before the first black-box fixture proves the needed fields.

Ubiquitous-language lens:

- Pass with candidate deltas. Existing terms remain authoritative; new terms are candidates until accepted by implementation.
- Residual risk: future agents may use "external eval" ambiguously unless "authority_mode" lands early.

## Appendix C. he-plan Handoff

handoff_target: harness-engineering:he-plan

recommended_plan_mode: tracked implementation plan, pending user approval and tracker decision.

first_slice: manifest, authority classifier, artifact-only authority-mode output, and privacy approval evidence shape.

first_slice_required_outputs:

- project manifest schema proposal;
- authority classifier owner and authority mode JSON output for external check/state paths;
- machine-readable agent_next_actions, human_approval_required_actions, and blocked_actions output;
- tests proving artifact-only remains read-side only;
- privacy approval evidence shape with explicit not_required state;
- glossary update only if terms are accepted during implementation;
- validation evidence from focused tests plus "pnpm test".

blocked_until:

- implementation approval;
- he-plan selection of public schema names;
- Linear creation/link decision if tracked delivery is required.
