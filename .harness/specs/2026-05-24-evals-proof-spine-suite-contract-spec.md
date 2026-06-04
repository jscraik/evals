---
schema_version: 1
artifact_id: 2026-05-24-evals-proof-spine-suite-contract-spec
artifact_type: he-spec
canonical_slug: evals-proof-spine-suite-contract
title: Evals Proof-Spine Suite Contract Spec
status: plan_aligned_ready_for_jsc_370_execution
date: 2026-05-24
origin: .harness/linear/2026-05-24-evals-proof-spine-suite-contract-linear-plan.md
source_audit: .harness/research/audits/2026-05-24-evidence-led-codebase-gap-audit.md
risk: high
spec_depth: full
ui: false
traceability_required: true
linear_mutation_status: created
linear_action_required: not_needed_for_issue_creation
linear_team: JSC
linear_label: Repo › evals
linear_parent: JSC-369
linear_children:
  - JSC-370
  - JSC-371
  - JSC-372
associated_plan: .harness/plan/2026-05-24-evals-proof-spine-suite-contract-plan.md
template_status: unavailable
git_staging_status: not_staged
staged_paths: []
---

# Evals Proof-Spine Suite Contract Spec

## Command Summary

BLUF: This spec defines the next behavior contract for evals after the 2026-05-24 audit, Linear mutation, and validated HE plan: close the current false-success holes first, then add a neutral repo-local suite contract, then add claim/evidence and Codex runtime evidence packets without turning evals into a domain runtime. It matters because evals is intended to be the shared executable proof spine for coding-harness, agent-skills, and diagram-cli/archscope, but the current code can still overstate trust when latest evidence is stale, run artifacts collide, or claims are not tied to artifacts. The decision is to keep JSC-370 as the first implementation slice and to treat JSC-371 and JSC-372 as additive contract slices that preserve the phase-one hard blocks: no plugin system, dashboard, cloud runner, external adapter root, required judge gate, or runtime dependency on consumer repos. The main risk is false success spreading into downstream autonomy, so every accepted change must add deterministic validation before new breadth. The next action is to execute JSC-370 through the associated HE plan only when implementation is explicitly authorized, then reconcile JSC-369 before selecting JSC-371 or JSC-372.
Decision Needed: none for issue creation or planning; implementation authorization is needed before starting JSC-370 code changes.
Top Risks: unsupported success claims can mislead agents; a suite contract can drift into plugin or registry complexity; runtime evidence can accidentally make telemetry authoritative instead of explanatory.
Next Action: execute PU-001 through PU-003 for JSC-370 from .harness/plan/2026-05-24-evals-proof-spine-suite-contract-plan.md when implementation is authorized, then reconcile JSC-369 before selecting JSC-371 or JSC-372.

## Purpose

This document specifies the behavior that the created Linear spine must deliver for evals to become a safer shared proof substrate. It is not an implementation plan. It locks the acceptance boundaries, data contracts, validation gates, and sequence constraints that future implementation work must satisfy.

The parent issue is JSC-369. The child issues are:

| Issue | Purpose | Firstness |
| --- | --- | --- |
| JSC-370 | Close current proof-spine false-success bugs | First implementation slice |
| JSC-371 | Add repo-local suite contract without plugin complexity | Next contract slice |
| JSC-372 | Add claim/evidence and Codex runtime evidence packet v1 | Next proof-model slice |

## Problem Statement

The repo has a working local executable spine, canonical schemas, artifact bundles, deterministic scorer outputs, baseline result shape, trace timelines, runtime-state output, runtime-evidence contract fixtures, and a pnpm verify gate. The audit shows that these are strong foundations, but not yet enough for cross-repo autonomy.

From an operator perspective, the unsafe state is simple: an agent can see a passing local command and infer that the latest proof is trustworthy, even when the latest pointer may not be bound to the checked case or when concurrent runs could corrupt evidence. From a downstream repo perspective, coding-harness, agent-skills, and diagram-cli/archscope need a shared proof contract, but their domain truth must stay local to each repo. From a governance perspective, the existing runtime-evidence contract already scores selected Codex-shaped event families, but it is not yet a general claim/evidence packet or full Codex runtime card; that next packet must evaluate claims and runtime facts without making telemetry or prompt prose the verdict.

## User / Operator Scenarios

1. As Jamie, I want pnpm evals check --json to fail when the latest artifact does not belong to the expected case or suite, so that closeout proof cannot silently point at stale or unrelated evidence.
2. As a future implementation agent, I want concurrent eval runs to produce isolated artifact bundles, so that retry or parallel execution cannot corrupt the proof trail.
3. As a consumer repo maintainer, I want to keep .evals/suite.json, cases, scorers, baselines, thresholds, and domain fixtures in my repo, so that evals owns the proof contract without absorbing domain truth.
4. As a reviewer, I want every validation or success claim to cite artifacts, commands, or schema-backed evidence, so that unsupported claims fail deterministically.
5. As an agent operator, I want Codex runtime evidence packets to classify stale state, blocked state, recommended commands, and validation evidence locally, so that telemetry remains explanatory and not authoritative.

## Goals

- Close current false-success risks before adding cross-repo breadth.
- Preserve the doctrine that artifacts decide and telemetry explains.
- Add the smallest domain-neutral suite contract needed for repo-local suites.
- Add claim/evidence and runtime evidence packet contracts that can fail overclaims.
- Keep consumer repositories as owners of domain fixtures, domain scorers, thresholds, privacy approval, and baseline promotion.
- Keep existing smoke-case behavior compatible while adding suite and runtime evidence capabilities.

## Non-Goals

- Do not create a plugin system, scorer registry, dashboard, cloud runner, hosted adapter, source-mining pipeline, or required LLM judge gate.
- Do not make coding-harness, agent-skills, or diagram-cli runtime dependencies.
- Do not centralize consumer domain truth, thresholds, fixtures, or baseline promotion in evals.
- Do not replace local artifacts with telemetry, PR comments, Linear status, or narrative session summaries.
- Do not implement recovery automation before the evidence packet and claim contracts exist.

## Current State / Evidence

| Evidence | Current Finding | Spec Consequence |
| --- | --- | --- |
| .harness/research/audits/2026-05-24-evidence-led-codebase-gap-audit.md | Overall C+; strong artifact spine but cross-repo suite and claim/runtime proof gaps remain. | Sequence trust-boundary fixes before breadth. |
| GAP-005 | check validates smoke fixture and latest artifacts independently; latest can be non-smoke. | Require latest provenance binding. |
| GAP-006 | Run ID uses second-level timestamp plus case slug/hash, which can collide for identical concurrent runs. | Require collision-resistant artifact directory creation. |
| GAP-001 | No neutral repo-local suite contract or suite-root artifact authority. | Add suite schema and suite-root path resolution. |
| GAP-002, GAP-003, GAP-004 | Runtime evidence exists as a partial offline contract for permission, subagent-artifact, and plugin-attribution evidence; goal, thread, network, and package provenance families are currently scaffolded where present, and claim/evidence verification is not first-class. | Add versioned claim/evidence and Codex runtime packet contracts without downgrading existing runtime-evidence enforcement. |
| AGENTS.md | Phase-one hard blocks reject dashboards, external adapters, cloud runners, plugin systems, source-mining automation, required judge gates, and runtime deps on siblings. | Keep these as non-negotiable guardrails. |
| .harness/core/2026-05-18-evals-core.md | Artifacts decide; telemetry explains; repo-local suites own domain truth. | Make artifacts and local schemas the authority. |
| Live Linear | JSC-369 through JSC-372 exist in Triage with Repo › evals labels. | Use live issue IDs in traceability. |

## Proposed Behavior

### User-Facing Solution

For Jamie and downstream repo maintainers, evals will provide a local CLI proof spine whose output can be trusted without reading agent prose. The next accepted work must first make current proof impossible to overstate: latest evidence must match the checked case or suite, concurrent runs must write isolated bundles, and latest publication must happen only after the bundle validates. That gives operators a practical safety property: a green check means the named artifact bundle is the one being judged.

After that, evals may add a domain-neutral suite file shape so consumer repos can run their local suites through the shared runner while keeping their own truth. The shared suite is a contract verifier, not a behavior oracle: it proves reusable promises, while project-local tests and evals prove project-specific behavior. Finally, evals may add claim/evidence and Codex runtime evidence packet schemas so agent claims can be checked against local artifacts and validation commands instead of trusted as prose.

### Do

- Do make JSC-370 the first implementation slice.
- Do use local schemas and deterministic validation as authority.
- Do keep suite paths relative to the suite root.
- Do write run artifacts into the evaluated repo for repo-local suites.
- Do allow check/state to inspect an already-written consumer artifact bundle by explicit repo root.
- Do fail unsupported success claims.
- Do preserve existing smoke command compatibility.

### Do Not

- Do not start with JSC-371 or JSC-372 while JSC-370 remains open.
- Do not add plugin or registry infrastructure for first suite support.
- Do not treat telemetry, Linear status, PR comments, or model summaries as verdict authority.
- Do not let suite paths escape the suite root or artifact root.
- Do not require consumer repos as runtime imports.
- Do not treat external repo-root artifact validation as proof of consumer domain behavior, CI/PR readiness, or baseline promotion.

## Requirements

### Functional Requirements

| ID | Requirement | Validation Anchor |
| --- | --- | --- |
| FR-001 | pnpm evals check --json MUST validate that the latest pointer belongs to the expected checked case or suite context. | SA-001, SA-002 |
| FR-002 | Latest pointer validation MUST fail closed when provenance fields are missing, malformed, or inconsistent. | SA-001 |
| FR-003 | Run artifact directory creation MUST be collision-resistant for concurrent identical case invocations. | SA-003 |
| FR-004 | latest.json MUST be updated only after result, report, command log, manifest, scorer results, baseline result, trace timeline, and manifest hashes validate. | SA-004 |
| FR-005 | The existing single-case smoke command MUST remain supported. | SA-005 |
| FR-006 | A repo-local suite file MUST define suite identity, owner repo, domain, purpose, cases, scorers, baseline, and artifact policy. | SA-006 |
| FR-007 | Suite case, scorer, and baseline paths MUST resolve relative to the suite root unless explicitly documented otherwise by the suite schema. | SA-007 |
| FR-008 | Suite artifacts MUST be written to the evaluated repository artifact root. | SA-008 |
| FR-009 | evals MUST provide generic claim/evidence schema support for validation, artifact, command, state, and baseline claims. | SA-009 |
| FR-010 | A deterministic scorer MUST fail a success or validation claim when required evidence is missing. | SA-010 |
| FR-011 | Codex runtime evidence packet v1 MUST capture repo identity, branch/head freshness, dirty state, recommended command, blocker state, validation artifacts, existing runtime-evidence coverage state, and generated-at metadata. | SA-011 |
| FR-012 | Runtime evidence MUST keep telemetry explanatory; no telemetry exporter, span, or summary may decide pass/fail. | SA-012 |
| FR-013 | Each implementation child MUST record a deep module fix packet before runtime/schema changes. | SA-013 |
| FR-014 | Phase-one suite execution MUST fail closed when artifact_policy.allow_network is true unless a later ADR/spec explicitly opens networked suite execution. | SA-017 |
| FR-015 | Phase-one suite scorer references MUST be built-in scorer IDs or schema-validated JSON config only; executable repo-local scorer hooks are out of scope until a later plugin/adapter decision. | SA-018 |
| FR-016 | pnpm evals check --json MUST surface the expected proof context, observed latest context, context_match status, and mismatch reason when checking latest provenance. | SA-021 |
| FR-017 | pnpm evals check --repo-root <path> --json MUST validate the target repo's .harness/evals/runs/latest.json and repo-relative artifacts without executing consumer behavior. | SA-022 |
| FR-018 | pnpm evals state --repo-root <path> --json MUST emit target artifact runtime state and classify evals-local runtime-evidence fixture health as not_configured for external roots. | SA-023 |

### Non-Functional Requirements

| ID | Requirement | Validation Anchor |
| --- | --- | --- |
| NFR-001 | The first trust-boundary patch SHOULD be small enough to validate with pnpm test, pnpm evals check --json, and pnpm verify. | SA-001..SA-005 |
| NFR-002 | New schemas MUST define versioning, required fields, unknown-field behavior, and enum values. | SA-006, SA-009, SA-011 |
| NFR-003 | Error output MUST name the failed proof requirement and recovery command in JSON mode. | SA-001, SA-010 |
| NFR-004 | Markdown reports and CLI output MUST remain readable without color-only status. | SA-014 |
| NFR-005 | The implementation MUST NOT add a runtime dependency on coding-harness, agent-skills, diagram-cli, session collectors, or OTEL collectors. | SA-015 |
| NFR-006 | The implementation MUST NOT introduce network requirements for smoke verification. | SA-015 |
| NFR-007 | Artifact and suite path handling MUST reject absolute paths and parent traversal where local authority would be escaped. | SA-007, SA-008 |
| NFR-008 | Public JSON output changes MUST be additive unless the implementation records an explicit compatibility decision and migration note. | SA-019 |
| NFR-009 | Check and state commands MUST classify scaffolded runtime-evidence families distinctly from implemented/enforced families. | SA-011 |
| NFR-010 | Agent-facing JSON proof-context fields MUST be stable enough for future agents to cite the expected case or suite, observed latest case or suite, and recovery command without parsing prose. | SA-021 |
| NFR-011 | External repo-root inspection MUST be additive, read-side only, and incompatible with the evals-owned --smoke proof-context check. | SA-022, SA-023 |

## Interfaces

Existing CLI interface that remains binding:

    pnpm evals run fixtures/smoke/pr-closeout.case.json --json
    pnpm evals check --json
    pnpm evals state --json
    pnpm verify

Additive suite interface for JSC-371:

    pnpm evals run path/to/.evals/suite.json --json

Additive external artifact inspection interface:

    pnpm evals check --repo-root path/to/consumer-repo --json
    pnpm evals state --repo-root path/to/consumer-repo --json

These commands inspect the target repo's latest packet and artifact bundle only.
They MUST NOT run consumer commands, certify consumer domain behavior, certify
CI/PR readiness, or promote a baseline. The --smoke proof-context check remains
evals-owned and MUST fail when combined with an external --repo-root.

The suite interface is additive. It MUST NOT remove or rename the smoke case interface.

For JSC-370, check context becomes explicit even before suite execution exists. The first implementation may hard-code the expected smoke case for pnpm evals check --json, but the owning validation module MUST expose one internal comparison point so JSC-371 can later pass expected suite context without reworking artifact validation.

The JSON output for pnpm evals check --json MUST expose additive proof-context fields when latest provenance is checked:

| Field | Required | Rule |
| --- | --- | --- |
| expected_context | yes | Names the expected case_id for single-case checks or suite_id for suite-bound checks. |
| observed_latest_context | yes | Names the case_id or suite_id found in the latest pointer or resolved latest metadata. |
| context_match | yes | Boolean or enum status showing whether expected_context and observed_latest_context match. |
| context_mismatch_reason | yes on mismatch | Machine-readable reason suitable for agent closeout and recovery guidance. |
| recovery_command | yes on failure | Command an operator or agent can run next without parsing prose. |
| artifact_repo_root | yes for external check, null for default root | Absolute path selected for artifact inspection; it is not execution authority. |

Current artifact bundle shape remains:

    .harness/evals/runs/<run-id>/
      result.json
      report.md
      command-log.json
      manifest.json
      scorer-results.json
      baseline-result.json
      trace-events.jsonl

JSC-370 may add provenance fields to latest.json, the manifest, or result files, but the owning module must keep callers from manually reconstructing provenance across multiple files.

Expected new or changed schema surfaces:

| Schema | First Issue | Purpose |
| --- | --- | --- |
| schemas/latest-run.schema.json or equivalent latest contract | JSC-370 | Bind latest pointer to expected case or suite context. |
| schemas/suite.schema.json | JSC-371 | Define neutral repo-local suite contract. |
| schemas/claim.schema.json | JSC-372 | Define claim shape and supported claim kinds. |
| schemas/evidence.schema.json | JSC-372 | Define evidence references and required proof fields. |
| schemas/claim-evidence.schema.json or equivalent combined envelope | JSC-372 | Allowed only if it preserves separate claim and evidence field semantics. |
| schemas/codex-runtime-evidence.schema.json or equivalent | JSC-372 | Define local runtime evidence packet v1. |

## Data / Domain Contract

### Latest Provenance Contract

A latest pointer or resolved latest metadata MUST expose enough data for check to answer:

| Field | Required | Rule |
| --- | --- | --- |
| run_id | yes | Matches run artifact directory. |
| case_id | yes for single case | Must match checked case when check is case-bound. |
| suite_id | yes for suite runs | Must match checked suite when check is suite-bound. |
| manifest_path | yes | Repo-relative pointer inside artifact root. |
| result_path | yes | Repo-relative pointer inside artifact root. |
| generated_at | yes | ISO timestamp or existing repo timestamp contract. |
| artifact_root | yes | Repo-relative root for the run bundle. |

Unknown fields MAY be allowed for forward compatibility, but unknown fields MUST NOT override required proof fields.

### Suite Contract

A suite file MUST include at least:

| Field | Required | Type / Rule |
| --- | --- | --- |
| schema_version | yes | Numeric or semver-like contract version. |
| suite_id | yes | Stable ID. |
| owner_repo | yes | Repository identity such as jscraik/evals. |
| domain | yes | Domain label owned by the consumer repo. |
| purpose | yes | Human-readable reason for the suite. |
| cases | yes | Array of suite-root relative case paths. |
| scorers | yes | Array of suite-root relative scorer config paths or built-in scorer IDs. |
| baseline | optional | Suite-root relative baseline pointer. |
| artifact_policy | yes | Includes write_bundle, retain_locally, and allow_network. In phase one, allow_network true is a validation failure, not permission to access the network. |

Suite roots MUST reject path traversal that escapes the suite root unless a later ADR explicitly introduces a safe external reference mechanism.

Phase-one scorer references are data, not executable extensions. The schema may accept built-in scorer IDs and JSON scorer config paths. It MUST NOT execute arbitrary repo-local scorer code, load plugins, or shell out to consumer repos in the first suite-contract slice.

### Claim / Evidence Contract

A claim MUST include claim_id, claim_type, claim_text, required_evidence, and optional advisory confidence. Evidence MUST include evidence_id, evidence_type, status, observed_at, and either a path, command, validation artifact, scorer result, baseline result, trace event, or Linear issue reference as appropriate. Evidence hashes are required when artifact integrity is asserted.

### Codex Runtime Evidence Packet v1

The packet MUST be local-file first and domain-neutral. Minimum fields are schema_version, repo, git_state, runtime_state, recommended_commands, blockers, validation_evidence, runtime_evidence_contract_health, claims, evidence, and generated_at.

The packet MUST preserve the current distinction between implemented/enforced runtime-evidence families and scaffolded/not-enforced families. It MUST NOT present scaffolded goal, thread, network, or package provenance fields as enforced proof unless a scorer and regression test exist.

## Enforcement Contract

This section uses the Skills SDK apparatus lens to separate decisions from fillable implementation detail.

| Apparatus | Contract |
| --- | --- |
| essential_decisions | evals owns proof contracts; consumer repos own domain truth; artifacts decide; telemetry explains; JSC-370 is first; suite support is additive; no plugin/dashboard/adapter/cloud/judge/runtime-dependency expansion. |
| fillable_gaps | Exact module names, helper names, nonce shape, schema file naming when equivalent, and test file placement may be selected by the implementation agent if the public behavior and validation remain intact. |
| guardrails | pnpm test, pnpm evals check --json, pnpm evals state --json where touched, pnpm verify, schema validation, deep module fix packet, and Linear traceability to JSC-369..JSC-372. |
| refusal_triggers | Stop for Jamie or a new ADR if implementation requires a plugin registry, dashboard, external adapter root, networked runtime, telemetry authority, required judge gate, consumer repo runtime import, or breaking CLI/schema change not covered here. |
| durable_memory | Record transferable implementation lessons in .harness/memory/LEARNINGS.md or the relevant .harness/refactors surface when a repeated correction becomes durable. |
| professional_output | Closeout must name changed files, exact commands, pass/fail/blocked outcomes, artifact paths, Linear issue IDs, remaining blockers, and rollback path. |

## Security, Privacy, and Safety

- Smoke and validation commands MUST remain locally runnable without network access.
- Suite fixtures from consumer repos MUST keep privacy approval and domain truth in the consumer repo.
- Artifacts MUST NOT include secrets or raw private evidence unless the fixture contract explicitly permits it and privacy approval is recorded.
- Credential scanning in pnpm verify remains a lightweight guardrail; do not claim full secret-scan coverage unless a dedicated scanner is added and run.
- Destructive commands, project assignment changes, or baseline promotion remain human-governed unless a later spec narrows them.

## Accessibility and Operator Ergonomics

This is a CLI and artifact specification, not a visual UI. Operator-facing output MUST be usable in plain text:

- JSON output must carry the same verdict, issue, run ID, and artifact paths as human output where applicable.
- Markdown reports must use semantic headings and tables.
- Error messages must name the failed requirement and the recovery command.
- Color may be used only as enhancement, not as the only status signal.

## Failure and Recovery

| Failure | Required Behavior | Recovery |
| --- | --- | --- |
| Latest does not match checked case or suite | check exits non-zero and names the mismatch. | Run the expected case or suite, then rerun check. |
| Latest provenance missing | check exits non-zero and names missing fields. | Regenerate latest with a compatible runner or migrate pointer shape. |
| Concurrent run collision | Runner chooses a distinct artifact root or fails before corrupting existing evidence. | Rerun after fixing collision logic; preserve failed artifact if written. |
| Suite path escapes root | Suite load fails before execution. | Fix suite paths or add a later approved external-reference contract. |
| Suite requests network in phase one | Suite validation fails before execution. | Set allow_network false or obtain a later ADR/spec that opens networked suite execution. |
| Suite references executable scorer hook | Suite validation fails before execution. | Replace with a built-in scorer ID or JSON config, or defer to a later plugin/adapter decision. |
| Claim lacks evidence | Claim scorer fails deterministically. | Add evidence artifact or downgrade/remove claim. |
| Runtime packet stale, blocked, or partially scaffolded | State reports stale/blocked/scaffolded status explicitly, not passed. | Run recommended command, resolve blocker, or add scorer enforcement for scaffolded families. |
| Project assignment unknown | Issues remain unprojected with Repo › evals. | Assign only after live evals project is visible or Jamie names another destination. |

## Validation Plan

Minimum validation by child:

| Issue | Required Commands |
| --- | --- |
| JSC-370 | pnpm test; pnpm evals check --json; pnpm verify |
| JSC-371 | pnpm test; pnpm evals run fixtures/smoke/pr-closeout.case.json --json; suite fixture command; pnpm verify |
| JSC-372 | pnpm test; pnpm evals state --json; pnpm evals check --json; pnpm verify |

Minimum JSC-370 regression fixtures:

- latest mismatch: construct latest.json for a non-smoke or wrong-case bundle, then verify pnpm evals check --json exits non-zero and names the expected versus actual case or suite.
- latest context output: verify pnpm evals check --json includes expected_context, observed_latest_context, context_match, and the recovery command in both pass and mismatch cases where applicable.
- run collision: force or simulate identical run IDs, then verify the runner creates a distinct artifact directory or fails before writing/advertising latest.
- latest publication: simulate incomplete bundle generation, then verify latest.json is not left pointing at an incomplete passing bundle.

Minimum JSC-371 regression fixtures:

- valid suite outside the evals repo resolves cases, scorers, and baseline paths relative to the suite root and writes artifacts under the evaluated repo.
- path traversal in cases, scorers, baseline, or artifact root fails before file reads/writes.
- artifact_policy.allow_network true fails in phase one.
- executable scorer hook references fail in phase one.

Minimum JSC-372 regression fixtures:

- validation-passed claim without validation evidence fails.
- artifact-exists claim without manifest/hash evidence fails.
- scaffolded runtime-evidence family remains classified as scaffolded_not_enforced until a scorer and regression test exist.

Spec validation commands:

    python3 /Users/jamiecraik/dev/agent-skills/Plugins/harness-engineering/scripts/check_bluf_structure.py .harness/specs/2026-05-24-evals-proof-spine-suite-contract-spec.md --json
    python3 /Users/jamiecraik/dev/agent-skills/Plugins/harness-engineering/scripts/check_generated_artifact_shape.py .harness/specs/2026-05-24-evals-proof-spine-suite-contract-spec.md --kind spec --json
    pnpm verify

## Acceptance Criteria

| ID | Acceptance Criterion | Linear |
| --- | --- | --- |
| SA-001 | A regression test proves check fails when latest points at a different checked case or suite. | JSC-370 |
| SA-002 | The latest provenance contract is schema-backed or validated through one owning module before artifact reads are trusted. | JSC-370 |
| SA-003 | A regression test or stress-style seam test proves concurrent identical runs do not share the same artifact directory. | JSC-370 |
| SA-004 | Latest publication is atomic enough that incomplete bundles are not advertised as latest passing evidence. | JSC-370 |
| SA-005 | Existing smoke command behavior remains compatible. | JSC-370 |
| SA-006 | schemas/suite.schema.json or an explicitly named equivalent validates the neutral suite contract. | JSC-371 |
| SA-007 | Suite-root path resolution is tested, including rejection of path traversal. | JSC-371 |
| SA-008 | Repo-local suite artifacts write to the evaluated repo, not implicitly to the evals repo. | JSC-371 |
| SA-009 | Claim and evidence schemas exist and define versioning, required fields, enums, and unknown-field behavior. | JSC-372 |
| SA-010 | A deterministic scorer fails a success claim with missing evidence. | JSC-372 |
| SA-011 | Codex runtime evidence packet v1 captures repo state, freshness, blocker, recommended command, validation, claim, and evidence fields. | JSC-372 |
| SA-012 | Telemetry and model confidence remain advisory and cannot decide verdicts. | JSC-372 |
| SA-013 | Each implementation child includes a deep module fix packet before code/schema edits. | JSC-369 |
| SA-014 | Human-readable output and reports remain plain-text readable and do not rely on color alone. | JSC-369 |
| SA-015 | No child introduces a phase-one hard-blocked capability. | JSC-369 |
| SA-016 | Parent closeout cites all child issue states, validation commands, generated artifact paths, and remaining blockers or deferrals. | JSC-369 |
| SA-017 | Suite artifact_policy.allow_network true fails validation in phase one. | JSC-371 |
| SA-018 | Executable repo-local scorer hook references fail validation in phase one. | JSC-371 |
| SA-019 | Any public JSON output change is additive or has an explicit compatibility decision and migration note. | JSC-369 |
| SA-020 | Existing runtime-evidence contract families remain compatible or are version-gated; scaffolded families are not reported as enforced. | JSC-372 |
| SA-021 | check --json exposes expected_context, observed_latest_context, context_match, and mismatch recovery fields through schema-backed or golden-output coverage. | JSC-370 |
| SA-022 | check --repo-root validates a consumer repo's latest pointer and artifact manifest hashes without executing consumer behavior. | JSC-371 |
| SA-023 | state --repo-root emits consumer artifact state and reports evals-local runtime-evidence health as not_configured for external roots. | JSC-372 |

## Visual References / Diagrams

The issue and proof dependency is easier to inspect as a table. The requirements above are authoritative if this visual summary and text ever diverge.

| Parent | Child | Proof Boundary | Gate |
| --- | --- | --- | --- |
| JSC-369 | JSC-370 | Latest provenance is bound to the checked case or suite, concurrent runs cannot share an artifact directory, and latest is not published for incomplete bundles. | pnpm verify |
| JSC-369 | JSC-371 | .evals/suite.json stays repo-local, artifacts are written in the evaluated repo, network requests fail closed, and scorer refs stay data-only. | pnpm verify |
| JSC-369 | JSC-372 | Unsupported claims fail, existing runtime-evidence enforcement is preserved, scaffolded families stay marked scaffolded, and runtime packets stay local artifact authority. | pnpm verify |

## Implementation Notes

- For JSC-370, compare the smallest patch against a deeper latest-pointer owner module before editing. The owner module should hide provenance comparison, run-directory uniqueness, and latest publication order from callers.
- For JSC-371, prefer a SuiteLoader or equivalent owner that resolves suite-root paths and returns a normalized suite execution request. Avoid adding registry or plugin behavior. Treat allow_network true and executable scorer hooks as explicit validation failures in this slice.
- For JSC-372, add schemas before scorer complexity. The first scorer should prove one unsupported success claim fails, and the packet must ingest or reference current runtime-evidence contract health without reclassifying scaffolded policy families as enforced.
- Preserve compatibility where possible. Breaking changes to public CLI output, schema shape, or artifact contract require a new decision artifact or explicit amendment.

### Deep Module Fix Packet Template

Each child implementation should fill this before runtime code changes:

| Field | Required Answer |
| --- | --- |
| Source gap | Audit gap ID and evidence pattern. |
| Owner module | File or module that owns the rule. |
| Public interface | CLI, function, schema, artifact, or validation command. |
| Hidden implementation | Coordination callers no longer do manually. |
| Caller contract | Inputs, outputs, errors, ordering, compatibility. |
| Seam test | Smallest test that fails before and passes after. |
| Tracer proof | Smallest production-like command path. |
| Rollback path | Revert or compatibility fallback. |
| Phase-one check | No hard-blocked capability introduced. |
| Validation gate | Exact command proving the fix. |

## Open Questions

1. Should a live evals Linear project be created, or should repo work continue with Repo › evals labels only?
2. Which exact built-in scorer IDs and JSON scorer config fields should be accepted by suite.schema.json in the first suite slice?
3. Which retention policy should apply to cross-repo suite artifacts after real consumer fixtures are promoted?
4. Should claim/evidence packets become part of every result or only selected suite families at first?

## Decision

JSC-370 is the first implementation slice. JSC-371 and JSC-372 are accepted as next slices only after JSC-370 closes or is explicitly deferred with evidence. The suite contract and runtime evidence packet are additive to the existing smoke spine and must preserve all phase-one hard blocks.

## Evidence and References

- .harness/research/audits/2026-05-24-evidence-led-codebase-gap-audit.md
- .harness/linear/2026-05-24-evals-proof-spine-suite-contract-linear-plan.md
- .harness/research/audits/reviewers/2026-05-24-agent-native-reviewer.md
- .harness/research/audits/reviewers/2026-05-24-api-contract-reviewer.md
- .harness/research/audits/reviewers/2026-05-24-adversarial-reviewer.md
- .harness/core/2026-05-18-evals-core.md
- UBIQUITOUS_LANGUAGE.md
- AGENTS.md
- Linear: JSC-369, JSC-370, JSC-371, JSC-372

## Appendix A. Harness Metadata / Traceability

interactive_status: not_needed

selection_evidence:

- User requested Linear mutation and he-spec for the 2026-05-24 Linear plan and audit.
- Live Linear mutation created JSC-369 through JSC-372.
- The user clarified that evals is the project name or repo name; this spec treats evals as repo/project identity and uses the verified Repo › evals label.

route: he-spec

stage: spec

scope: JSC-369 parent queue with JSC-370 first.

safe_to_continue: true

blocked_reason: none for spec or issue creation; project assignment remains deferred.

linear_mutation_status: created

linear_action_required: not_needed_for_issue_creation

validation_status:

- opening summary validation: pass
- generated artifact shape validation: pass
- associated plan validation: pass
- repository validation: pass

validation_evidence:

- python3 /Users/jamiecraik/dev/agent-skills/Plugins/harness-engineering/scripts/check_bluf_structure.py .harness/specs/2026-05-24-evals-proof-spine-suite-contract-spec.md --json -> pass
- python3 /Users/jamiecraik/dev/agent-skills/Plugins/harness-engineering/scripts/check_generated_artifact_shape.py .harness/specs/2026-05-24-evals-proof-spine-suite-contract-spec.md --kind spec --json -> pass
- python3 /Users/jamiecraik/dev/agent-skills/Plugins/harness-engineering/scripts/check_bluf_structure.py .harness/plan/2026-05-24-evals-proof-spine-suite-contract-plan.md --json -> pass
- python3 /Users/jamiecraik/dev/agent-skills/Plugins/harness-engineering/scripts/check_generated_artifact_shape.py .harness/plan/2026-05-24-evals-proof-spine-suite-contract-plan.md --kind plan --json -> pass
- pnpm verify -> pass; latest generated run recorded by .harness/evals/runs/latest.json during final validation

git_staging_status: not_staged

staged_paths: []

confidence:

- high that Linear issues exist because tool responses returned JSC-369, JSC-370, JSC-371, and JSC-372 URLs.
- high that JSC-370 is first because the audit and plan both rank false-success risk before suite expansion.
- medium on exact implementation module names because he-plan must inspect the latest runtime path before editing.

## Linear Acceptance Traceability

| Linear Item | Acceptance IDs |
| --- | --- |
| JSC-369: [evals] Close 2026-05-24 proof-spine and suite-contract gaps | SA-013, SA-014, SA-015, SA-016, SA-019 |
| JSC-370: [evals] Close current proof-spine false-success bugs | SA-001, SA-002, SA-003, SA-004, SA-005, SA-021 |
| JSC-371: [evals] Add repo-local suite contract without plugin complexity | SA-006, SA-007, SA-008, SA-017, SA-018, SA-022 |
| JSC-372: [evals] Add claim/evidence and Codex runtime evidence packet v1 | SA-009, SA-010, SA-011, SA-012, SA-020, SA-023 |

## Appendix B. Review Outcomes

No additional spec review swarm was requested for this he-spec pass. The source audit already includes reviewer artifacts from agent-native, API-contract, and adversarial reviewers. Future he-plan work should request targeted review only when a child changes public CLI, schema, artifact, validation, or safety behavior in a way the local tests do not cover.

## Appendix C. he-work Handoff

handoff_status: ready_for_jsc_370_execution_when_authorized

recommended_first_plan_target: JSC-370

associated_plan_path: .harness/plan/2026-05-24-evals-proof-spine-suite-contract-plan.md

handoff_constraints:

- Execute PU-001 through PU-003 for JSC-370 before JSC-371 or JSC-372.
- Do not start implementation without explicit authorization.
- Require a deep module fix packet for each selected child.
- Preserve smoke command compatibility.
- Do not add plugin, registry, dashboard, cloud, external adapter root, telemetry authority, required judge gate, source-mining automation, or sibling-repo runtime dependency.
- Treat suite network requests and executable scorer hooks as fail-closed in phase one.
- Preserve existing runtime-evidence contract behavior; do not collapse scaffolded_not_enforced into implemented_enforced.
- Include pnpm verify in closeout for every child.
- Reconcile JSC-369 after each child issue closes.

blackboard_delta:

    stage: he-spec
    artifact: .harness/specs/2026-05-24-evals-proof-spine-suite-contract-spec.md
    source_linear_plan: .harness/linear/2026-05-24-evals-proof-spine-suite-contract-linear-plan.md
    source_audit: .harness/research/audits/2026-05-24-evidence-led-codebase-gap-audit.md
    associated_plan: .harness/plan/2026-05-24-evals-proof-spine-suite-contract-plan.md
    linear_parent: JSC-369
    linear_children:
      - JSC-370
      - JSC-371
      - JSC-372
    next_stage: he-work
    first_slice: JSC-370
    acceptance_ids: SA-001..SA-021
    project_assignment: deferred_until_live_evals_project_visible
