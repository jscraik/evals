# Evidence-Led Codebase Gap Audit

Date: 2026-05-26
Target codebase: /Users/jamiecraik/dev/evals
Evidence lens: shared eval suite as contract verifier, not behavior oracle
Primary skill: improve-codebase-architecture
Review inputs: agent-native-reviewer, api-contract-reviewer, adversarial-reviewer

## 1. Executive Summary

Overall maturity grade: C

Confidence: High for current local executable-spine mechanics, schemas, CLI routing, CI gate, and documentation state. Medium for future external-consumer adoption because no real consumer repository fixture is wired into the current gate.

The project has a credible local executable spine. It can run deterministic smoke cases, emit latest-result artifacts, validate local artifacts, compare baseline shape, scan for credential-shaped values, and reject several forbidden architecture directions through `pnpm verify`. The north-star boundary is also unusually clear in docs: this repo should verify reusable external contracts, while consuming repositories own product behavior and domain truth.

The main gap is that the new contract-verifier architecture is still mostly a doctrine and proof-spine scaffold, not yet a versioned contract package with enforceable contract metadata, adopted-contract manifests, negative fixtures, provenance checks, and contract reports. The suite currently proves local artifact consistency more strongly than it proves that a consumer project satisfies declared shared contracts.

Top 5 gaps:

1. No first-class contract metadata catalog exists for `proves`, `does_not_prove`, risk, scope, owner, fixtures, or adopted-contract manifests.
2. External `--repo-root` checks validate structurally consistent artifacts but do not prove producer provenance or execution origin.
3. Public schema/runtime contracts drift: `suite_id` grammar differs between suite and case schemas, and `input.command` is broad in schema but narrowed in runtime.
4. Proof-boundary language exists in docs, but `check`, `state`, and validation-result schemas do not expose machine-readable proof and non-proof fields.
5. Promotion and contract-report workflows are absent or non_enforced; `promotion_status` is hardcoded as `not_requested`, and no promoted-candidates report exists.

Top 5 risks:

1. A consumer artifact bundle can appear externally valid without proving it came from an actual run.
2. Agents may overread `check --repo-root` as consumer readiness rather than artifact consistency.
3. Consumer suite authors can create IDs or commands that pass one schema surface and fail another.
4. Baseline promotion can be discussed in fixtures and docs without a reachable runtime authority path.
5. The suite may grow toward project-local behavior ownership unless the contract metadata layer forces every eval to declare what it proves and what it does not prove.

Strongest existing foundations:

1. The README, ARCHITECTURE, AGENTS, and core doctrine consistently distinguish shared contract verification from project-local truth.
2. `src/commands/run.js` produces deterministic artifacts with manifest hashes and validates latest candidates before writing them.
3. `src/commands/validation.js` exposes `check --json`, `check --repo-root`, and guarded external-root semantics.
4. `scripts/verify.js` is wired into GitHub Actions through `.github/workflows/ci.yml` and is the canonical deterministic gate.
5. `scripts/validate-architecture.js` already blocks several phase-one hard-block violations, including sibling runtime dependencies, telemetry authority, dashboards, plugins, and adapter roots.

Highest-leverage next fixes:

1. Add `schemas/contract.schema.json` plus a small `contracts/` catalog for the first shared contracts.
2. Add `schemas/project-contract-manifest.schema.json` for consumer adoption declarations.
3. Extend `check` and `state` outputs with `proves`, `does_not_prove`, `shared_contract_status`, and `adopted_contracts`.
4. Fix `suite_id` and `input.command` schema/runtime drift with regression tests.
5. Add artifact producer provenance fields and validate them in `check --repo-root`.

## 2. Overall Gradecard

| Area | Grade | Confidence | Current Status | Main Gap | Recommended Fix |
|---|---|---:|---|---|---|
| Repository as Control Plane | B | High | Architecture, AGENTS, core doctrine, specs, plans, CI gate, and audit surfaces exist. | Control-plane docs are stronger than contract-package metadata. | Promote contract doctrine into schemas, `contracts/`, and verifier outputs. |
| Runtime Truth and Decision Packets | C | High | Latest artifacts, manifests, state output, drift status, and evidence packets exist. | External roots can be artifact-valid without producer provenance or adopted-contract truth. | Add producer provenance and adopted-contract manifest validation. |
| Claim-vs-Evidence Verification | C | High | Local artifacts and hashes are checked; runtime evidence scaffold exists. | Machine outputs do not declare what they prove and cannot prove CI/PR/project truth. | Add proof-boundary fields and fail unsupported success claims at contract-report level. |
| Mechanical Architecture Enforcement | B | High | `validate-architecture.js` blocks forbidden deps and phase-one hard blocks; CI runs `pnpm verify`. | No contract-catalog validator or import graph layer rules beyond bespoke checks. | Add contract catalog validation to `scripts/verify.js`; keep bespoke zero-dependency checks. |
| Harness Runtime Loop | C | Medium | Run/check/state commands and deterministic latest lifecycle exist. | No attempt budgets, recovery handlers, or retry classification in the suite runtime. | Add minimal run provenance, stop reason, and failure classification before richer recovery. |
| Trace and Session Evidence | C | High | Trace events and runtime evidence fixtures exist for local contract families. | Telemetry is scaffolded and intentionally not authoritative; no OTel-backed contract proof. | Keep telemetry non-authoritative in phase one; add local trace contract schema and report fields first. |
| Context Engineering | D | Medium | Docs describe hot/cold ownership and source-of-truth boundaries. | No executable stale-context, retrieval-boundary, or skill-routing checks. | Defer broad context checks; add narrow no-stale-canon contract once contract schema exists. |
| Skills and Workflow Density | D | Medium | Agent instructions and skill-trigger docs exist. | No executable project-facing skill/capability manifest for agents. | Add machine-readable capability manifest generated from CLI usage and supported commands. |
| Recovery and Failure Handling | D | Medium | Errors are classified in check output and verify exits non-zero. | Missing deterministic recovery handlers, retry classification, and stale branch recovery semantics. | Add failure classes to validation result schema; leave branch recovery to consumers. |
| Governance and Safety | C | High | Phase-one hard blocks, credential scan, external-root guardrails, and no sibling deps are enforced. | Approval gates, promotion policy, privacy/provenance policy, and retention policy are mostly docs. | Add promotion/retention/privacy schemas and require them in contract metadata before real fixtures broaden. |

## 3. Evidence-to-Code Mapping

| Evidence Pattern | Source File | Code Location | Runtime Status | Grade | Confidence |
|---|---|---|---|---|---:|
| Shared suite verifies reusable contracts, not project-local behavior | Pasted evidence; README; core doctrine | `README.md:9-13`, `.harness/core/2026-05-18-evals-core.md:7-12`, `AGENTS.md:11-14` | partial | B | High |
| Consuming repos own domain truth, fixtures, rubrics, thresholds, privacy, baseline promotion | Pasted evidence; AGENTS; architecture | `AGENTS.md:11-14`, `ARCHITECTURE.md:426-427` | documented_only | C | High |
| Versioned contract package with stable contract IDs | Pasted evidence | No `contracts/` catalog or `contract.schema.json`; `package.json:8-15` only exposes local CLI scripts | missing | F | High |
| Adapter boundary so shared suite avoids hard-coded project knowledge | Pasted evidence | `ARCHITECTURE.md:117-126` defines external roots as artifact roots; `scripts/validate-architecture.js:17-18` blocks adapter roots | documented_only | D | High |
| G0 shape evals: JSON/schema validity | Pasted evidence | `schemas/*.schema.json`, `src/lib/schema-validation.js`, `scripts/verify.js:42-95` | implemented_enforced | A | High |
| G1 behavior contract evals: common behavioral rules | Pasted evidence | `src/lib/scoring.js:18-80`, `fixtures/smoke/pr-closeout.case.json` | partial | C | High |
| G2 evidence evals: command evidence, changed files, local pass vs CI unknown | Pasted evidence | `src/lib/claim-evidence-contract.js:54-102`, `src/lib/runtime-state.js:246-260` | partial | C | High |
| G3 telemetry evals: spans/logs/retry fields | Pasted evidence | `src/lib/runtime-evidence-contract.js:11-61`, `scripts/validate-architecture.js:15-16` blocks telemetry authority | scaffolded | D | High |
| G4 regression evals: known bad outputs fail forever | Pasted evidence | `fixtures/smoke/`, `test/cli.test.js`, `test/architecture-boundaries.test.js` | partial | C | High |
| Contract metadata declares `proves` and `does_not_prove` | Pasted evidence | No such fields in `schemas/validation-result.schema.json` or `schemas/runtime-state.schema.json` | missing | F | High |
| Project eval manifest declares adopted shared contracts | Pasted evidence | No project contract manifest schema or loader | missing | F | High |
| Useful reports: latest, failures, promoted candidates, telemetry summary | Pasted evidence | `.harness/evals/runs/latest.json` exists; no contract report writer | partial | D | High |
| Promotion workflow turns local failures into shared fixtures | Pasted evidence | `src/commands/run.js:130-138` hardcodes `promotion_status: "not_requested"` | scaffolded | D | High |
| No fake success claims without runtime evidence | Pasted evidence | `src/commands/validation.js:143`, `src/commands/validation.js:168-178` mark external runtime evidence as `not_configured`; overall check can still pass | partial | C | High |
| External artifact inspection is limited and non-authoritative | README; architecture | `README.md:51-63`, `ARCHITECTURE.md:117-126`, `src/commands/validation.js:121-131` | implemented_not_enforced | C | High |
| Mechanical CI enforcement rejects architecture drift | AGENTS; architecture | `scripts/verify.js:42-95`, `scripts/validate-architecture.js:13-23`, `.github/workflows/ci.yml:16-43` | implemented_enforced | A | High |
| Privacy/provenance checks before real fixtures broaden | Pasted evidence; AGENTS | Credential scan in `scripts/verify.js`; no artifact retention/provenance policy schema | partial | C | Medium |

## 4. Gap Register

### GAP-001: First-Class Contract Metadata Catalog Is Missing

**Category:**
validation / governance

**Current State:**
The repository has strong prose about shared contracts and phase-one boundaries, but no `contracts/` catalog, no `schemas/contract.schema.json`, and no validator requiring every contract to declare `proves`, `does_not_prove`, risk, scope, owner, fixtures, or category.

**Expected State:**
Each shared contract is a versioned data file with stable ID, category, severity, applicability, proof boundary, fixture references, and validation requirements.

**Evidence Basis:**
The external evidence explicitly requires contract metadata for every eval and says `does_not_prove` prevents eval overclaiming.

**Code Evidence:**
`README.md:9-13` states the doctrine. `schemas/validation-result.schema.json:1-129` and `schemas/runtime-state.schema.json:105-122` do not expose contract metadata. `package.json:8-15` has no contract validation script.

**Risk:**
New evals can become ad hoc prompt tests or behavior oracles because the runtime does not force authors to define the reusable invariant they are proving.

**Severity:**
High

**Fix Grade:**
P0

**Recommended Fix:**
Add `schemas/contract.schema.json` and seed `contracts/evidence/no-fake-ci-pass.v1.json`, `contracts/evidence/local-pass-is-not-pr-done.v1.json`, and `contracts/output/strict-json-when-requested.v1.json`. Add a zero-dependency validator in `scripts/validate-contracts.js` and call it from `scripts/verify.js`.

**Suggested Software / Method:**
JSON Schema, Node built-ins, deterministic repository validator, GitHub Actions through existing `pnpm verify`.

**Files Likely To Change:**
`schemas/contract.schema.json`, `contracts/**`, `scripts/validate-contracts.js`, `scripts/verify.js`, `test/contract-catalog.test.js`.

**Validation Command:**
`pnpm verify`

**Acceptance Criteria:**
Every contract file validates against schema; every contract declares `proves` and `does_not_prove`; missing fixture references fail the gate; `pnpm verify` fails if contract metadata drifts.

### GAP-002: Machine-Readable Proof Boundaries Are Absent From Outputs

**Category:**
traceability / validation

**Current State:**
Docs say artifacts decide and telemetry explains, but `check --json`, `state --json`, and the validation-result schema do not explicitly tell downstream agents what the result proves and what it does not prove.

**Expected State:**
Every externally consumed result includes `proves`, `does_not_prove`, `shared_contract_status`, and `local_project_truth_status` or equivalent fields.

**Evidence Basis:**
The evidence says a useful report must make local-vs-shared boundaries explicit and avoid claiming product correctness, PR readiness, or full release readiness.

**Code Evidence:**
`src/commands/validation.js:146-160` emits status, mode, roots, runtime evidence, checks, and errors. `src/lib/runtime-state.js:246-260` emits an evidence packet. Neither surface declares proof boundaries.

**Risk:**
Agents can collapse `artifact consistency passed` into `project ready`, especially for consumer roots.

**Severity:**
High

**Fix Grade:**
P0

**Recommended Fix:**
Add proof-boundary fields to `schemas/validation-result.schema.json` and `schemas/runtime-state.schema.json`, then populate them in `checkCommand` and `buildRuntimeState`.

**Suggested Software / Method:**
JSON Schema, deterministic CLI snapshots, Vitest or Node test runner.

**Files Likely To Change:**
`schemas/validation-result.schema.json`, `schemas/runtime-state.schema.json`, `src/commands/validation.js`, `src/lib/runtime-state.js`, `test/cli.test.js`.

**Validation Command:**
`pnpm test`

**Acceptance Criteria:**
`pnpm evals check --json` includes proof-boundary arrays; external `--repo-root` mode states that project behavior, CI, PR readiness, and domain truth are outside proof; tests fail if fields disappear.

### GAP-003: External Repo-Root Artifacts Lack Producer Provenance

**Category:**
runtime / traceability

**Current State:**
`check --repo-root` validates latest artifact shape, manifest paths, hashes, and runtime evidence status. For external roots, runtime evidence validation is skipped as `not_configured`.

**Expected State:**
External artifact checks should verify that the artifact packet contains producer metadata: CLI version or package identity, command, case/suite ID, timestamp, evaluated repo root, artifact root, and content hashes tied to the run.

**Evidence Basis:**
The evidence demands runtime proof for claims: command run, exit code, timestamp, artifact hash, and trace/validator evidence. The adversarial review identified forged artifact bundles as the highest-risk gap.

**Code Evidence:**
`src/commands/validation.js:134-143` validates latest and skips runtime evidence for external roots. `src/lib/latest-run.js:113` and `src/lib/latest-run.js:145` validate latest/manifest consistency but not producer origin.

**Risk:**
A consumer repo can present hand-crafted artifacts that pass external checks without proving a run happened.

**Severity:**
High

**Fix Grade:**
P0

**Recommended Fix:**
Add `producer` metadata to latest run artifacts and require it in external-root validation. Start with deterministic provenance, not cryptographic signing: command, package name/version when available, case path hash, suite path hash when applicable, generated_at, evaluated_repo_root, and artifact_root_prefix.

**Suggested Software / Method:**
JSON Schema, artifact hash validation, Node crypto hashing, jq-readable JSON reports.

**Files Likely To Change:**
`schemas/latest-run.schema.json`, `src/commands/run.js`, `src/lib/latest-run.js`, `src/commands/validation.js`, `test/cli.test.js`.

**Validation Command:**
`pnpm evals run fixtures/smoke/pr-closeout.case.json --json && pnpm evals check --json`

**Acceptance Criteria:**
Fresh local runs include producer metadata; external roots without producer metadata fail with a specific provenance error; existing bootstrap behavior is either migrated or explicitly classified as legacy.

### GAP-004: Public Schema and Runtime Contracts Drift

**Category:**
validation / architecture

**Current State:**
`suite.schema.json` allows dotted `suite_id` values while `eval-case.schema.json` rejects them. `eval-case.schema.json` accepts any non-empty `input.command`, but `validateCaseContract` rejects anything except `simulate-pr-closeout`.

**Expected State:**
Public schemas and runtime validators should agree. If phase one only supports synthetic `simulate-pr-closeout`, the schema should say so. If dotted suite IDs are valid, all schema surfaces should accept them.

**Evidence Basis:**
The evidence requires output schema validity and structured contract compliance.

**Code Evidence:**
`schemas/suite.schema.json:10`, `schemas/eval-case.schema.json:11`, `schemas/eval-case.schema.json:55`, `src/lib/case-contract.js:55-57`.

**Risk:**
Consumer-authored suites can pass one contract surface and fail another, making the suite feel arbitrary and brittle.

**Severity:**
High

**Fix Grade:**
P0

**Recommended Fix:**
Unify the `suite_id` pattern across schemas and encode the phase-one command restriction in schema. Add regression fixtures for `team.alpha` or explicitly reject dots everywhere.

**Suggested Software / Method:**
JSON Schema, focused regression tests.

**Files Likely To Change:**
`schemas/suite.schema.json`, `schemas/eval-case.schema.json`, `test/cli.test.js`, `fixtures/smoke/*.json` if IDs change.

**Validation Command:**
`pnpm test`

**Acceptance Criteria:**
A suite and case with the same valid `suite_id` pass both schema and runtime validation; unsupported commands fail at schema validation before runtime.

### GAP-005: Downstream Schema Validation Parity Is Missing

**Category:**
validation / agent-native

**Current State:**
`check` and `state` accept `--repo-root`, but `validate-schema` uses `insideRepo(targetPath)` and cannot validate consumer proof contracts outside the evals repo.

**Expected State:**
The same artifact roots that can be checked should be schema-validatable without copying files into this repository.

**Evidence Basis:**
The evidence asks every project to consume the shared suite as an external contract package through adapters/manifests, not by becoming this repo.

**Code Evidence:**
`src/cli.js:33-39` only permits `--repo-root` for `check` and `state`. `src/commands/validation.js:77-96` calls `insideRepo(targetPath)`.

**Risk:**
Agent-native and downstream adoption remains shell-local and human-mediated; consumers cannot validate shared proof contracts in place.

**Severity:**
Medium

**Fix Grade:**
P1

**Recommended Fix:**
Add `pnpm evals validate-schema --repo-root <path> <target>` or a dedicated `validate-artifact --repo-root` command. Keep it data-only and inside the artifact root; do not execute consumer code.

**Suggested Software / Method:**
CLI option parsing, path containment guard, JSON Schema.

**Files Likely To Change:**
`src/cli.js`, `src/commands/validation.js`, `src/lib/repo-root-option.js`, `test/cli.test.js`.

**Validation Command:**
`pnpm test`

**Acceptance Criteria:**
An external temp artifact root can validate a proof contract file by relative path; traversal outside the repo root fails; docs describe the non-execution boundary.

### GAP-006: External Evidence Packet Uses the Wrong Validation Command

**Category:**
traceability / runtime

**Current State:**
`runtime-state` recommends `pnpm evals check --repo-root <root> --json` for external roots, but `claim-evidence-contract` records `pnpm evals check --json` as the latest-validation command.

**Expected State:**
Evidence packets should report the exact command needed to reproduce the observed claim for the current artifact root.

**Evidence Basis:**
The evidence requires command evidence and no unsupported success claims.

**Code Evidence:**
`src/lib/runtime-state.js:40-46` computes the right external command. `src/lib/claim-evidence-contract.js:82-94` hardcodes the local command.

**Risk:**
An agent following the evidence packet may validate the evals repo instead of the consumer artifact root.

**Severity:**
Medium

**Fix Grade:**
P1

**Recommended Fix:**
Thread `artifactRepoRoot` into the command evidence builder and emit the repo-root command when external roots are inspected.

**Suggested Software / Method:**
Small function parameter fix, snapshot test.

**Files Likely To Change:**
`src/lib/claim-evidence-contract.js`, `src/lib/runtime-state.js`, `test/cli.test.js`.

**Validation Command:**
`pnpm test`

**Acceptance Criteria:**
`pnpm evals state --repo-root <tmp> --json` reports replayable commands that include `--repo-root <tmp>`.

### GAP-007: Baseline Promotion Is Scaffolded but Non-Enforced

**Category:**
governance / validation

**Current State:**
Run output includes baseline statuses, but promotion is hardcoded as `not_requested`. Scoring does not consume promotion intent as an authority path.

**Expected State:**
Promotion should either be explicitly out of phase-one scope in machine outputs or implemented as a governed workflow with manifest, approval, fixture, and baseline mutation rules.

**Evidence Basis:**
The evidence calls for baseline promotion policy and a promotion workflow that distinguishes local-only failures from reusable invariants.

**Code Evidence:**
`src/commands/run.js:130-138`, `src/lib/scoring.js:112-124`, `src/lib/case-contract.js:40`.

**Risk:**
Promotion language can appear in artifacts without any runtime path that enforces who can promote, what evidence is required, or what changed.

**Severity:**
Medium

**Fix Grade:**
P1

**Recommended Fix:**
For the small first patch, rename or document the current status as `promotion_not_supported_phase_one` in machine output. For the later patch, add `promote` as a separate command that writes a candidate fixture and checklist but does not mutate baselines without approval.

**Suggested Software / Method:**
JSON Schema enum, explicit workflow command, PR checklist artifact.

**Files Likely To Change:**
`schemas/validation-result.schema.json`, `src/commands/run.js`, `src/lib/scoring.js`, `README.md`, `test/cli.test.js`.

**Validation Command:**
`pnpm test`

**Acceptance Criteria:**
Machine output no longer implies promotion is a latent live path; later promotion command produces bad/good fixture candidates and a checklist without hidden baseline mutation.

### GAP-008: Contract Report Outputs Are Missing

**Category:**
traceability / governance

**Current State:**
The repo writes `.harness/evals/runs/latest.json` and artifacts for smoke runs. It does not emit `.evals/reports/latest.md`, `failures.json`, `promoted-candidates.md`, or `telemetry-summary.json` style reports.

**Expected State:**
A contract run should produce an agent-consumable report listing passed/failed shared contracts, evidence, unsupported claims, and promotion candidates.

**Evidence Basis:**
The evidence explicitly asks for useful reports, not just pass/fail.

**Code Evidence:**
`src/commands/run.js:333-343` writes latest run state. No reporter module exists for contract reports.

**Risk:**
Humans and agents must infer contract status from raw artifacts, making repeated failure promotion slower and less reliable.

**Severity:**
Medium

**Fix Grade:**
P1

**Recommended Fix:**
Add a report writer after contract metadata exists. Keep phase one simple: JSON plus Markdown under `.harness/evals/reports/`, with explicit proof boundary and failed-contract table.

**Suggested Software / Method:**
Markdown reporter, JSON report schema, jq-readable output.

**Files Likely To Change:**
`schemas/contract-report.schema.json`, `src/lib/reporting.js`, `src/commands/run.js`, `test/cli.test.js`.

**Validation Command:**
`pnpm evals run fixtures/smoke/pr-closeout.case.json --json && test -s .harness/evals/reports/latest.md`

**Acceptance Criteria:**
Report identifies shared contract status, failed contracts, evidence, non-proof areas, and promotion candidates; report generation is deterministic.

### GAP-009: The First Shared Contract Families Are Not Seeded as Fixtures

**Category:**
validation / regression

**Current State:**
Smoke and runtime-evidence fixtures exist, but the proposed first 10 contract families do not exist as good/bad fixtures with reusable IDs.

**Expected State:**
The suite should include small negative-fixture-heavy contracts for no fake CI, local-pass-is-not-PR-done, validation claims require commands, changed files linked to claims, strict JSON, no placeholders, no destructive action, and no color-only status.

**Evidence Basis:**
The evidence says useful eval suites need negative examples and recommends the first 10 contracts.

**Code Evidence:**
`fixtures/smoke/pr-closeout.case.json`, `src/lib/runtime-evidence-contract.js:7-61`, `test/cli.test.js`.

**Risk:**
The north-star can drift while the actual regression suite still mostly proves the original smoke scenario.

**Severity:**
Medium

**Fix Grade:**
P1

**Recommended Fix:**
After GAP-001, seed five contracts first: no fake CI, local pass is not PR done, validation claims require commands, strict JSON when requested, and no placeholder production paths.

**Suggested Software / Method:**
Contract JSON, good/bad fixture folders, deterministic assertions.

**Files Likely To Change:**
`contracts/evidence/**`, `contracts/output/**`, `fixtures/good/**`, `fixtures/bad/**`, `src/lib/contract-assertions.js`.

**Validation Command:**
`pnpm verify`

**Acceptance Criteria:**
Each seeded contract has at least one good and one bad fixture; bad fixtures fail for the named reason; good fixtures pass without LLM judges.

### GAP-010: Telemetry Contracts Are Scaffolded but Not Authoritative

**Category:**
observability / traceability

**Current State:**
Runtime evidence fixtures exist, but phase-one architecture explicitly blocks telemetry exporters as authority. This is the right current boundary, but the desired G3 telemetry contracts are not yet executable.

**Expected State:**
Before real telemetry becomes authoritative, define local telemetry contract shape: trace ID, span name, validator run, result, duration, retry count, and log correlation fields.

**Evidence Basis:**
The evidence asks for OTel-backed runtime proof but AGENTS phase-one hard blocks prohibit telemetry exporters as authority.

**Code Evidence:**
`src/lib/runtime-evidence-contract.js:11-61`, `scripts/validate-architecture.js:15-16`, `AGENTS.md:53-64`.

**Risk:**
The repo may jump from no telemetry proof to external telemetry authority too quickly, violating phase-one constraints and creating a harder-to-debug gate.

**Severity:**
Medium

**Fix Grade:**
P2

**Recommended Fix:**
Add a data-only `schemas/telemetry-snapshot.schema.json` and contract fixtures first. Defer OTel collector queries until a later ADR opens telemetry authority.

**Suggested Software / Method:**
JSON Schema, local fixture snapshots, OpenTelemetry later by ADR.

**Files Likely To Change:**
`schemas/telemetry-snapshot.schema.json`, `contracts/telemetry/**`, `fixtures/good/**`, `fixtures/bad/**`.

**Validation Command:**
`pnpm verify`

**Acceptance Criteria:**
Telemetry contracts can validate a fixture snapshot; no runtime dependency on OTel collector is introduced; architecture validator still rejects telemetry authority imports.

### GAP-011: Suite Runs Collapse Latest State to the Final Case

**Category:**
runtime / traceability

**Current State:**
`runSuite` executes all suite cases, but each case writes the same latest pointer. After a suite run, `state` and `check` observe the final case artifact, not a suite-level readiness packet.

**Expected State:**
Suite runs should write a suite-level result artifact that summarizes every case, then either point latest at the suite result or expose separate `latest-suite.json` and `latest-case.json` semantics.

**Evidence Basis:**
The evidence wants macro-level fixtures and repeated behavior patterns, not only single smoke behavior.

**Code Evidence:**
`src/commands/run.js:389-430` iterates cases and emits suite results; `src/commands/run.js:333-343` writes latest per case.

**Risk:**
A suite can contain a failing or risky case while the externally visible latest pointer tells a narrower story.

**Severity:**
Medium

**Fix Grade:**
P2

**Recommended Fix:**
Add a suite-level latest artifact with case summaries, failed-contract counts, and artifact references. Keep case latest behavior for backward compatibility.

**Suggested Software / Method:**
JSON Schema, deterministic suite result, manifest hash validation.

**Files Likely To Change:**
`schemas/suite-result.schema.json`, `src/commands/run.js`, `src/lib/latest-run.js`, `test/cli.test.js`.

**Validation Command:**
`pnpm evals run <suite.json> --json && pnpm evals check --json`

**Acceptance Criteria:**
Suite result includes every case; check can validate suite-level manifest; latest status cannot hide earlier suite failures.

### GAP-012: Agent-Native Capability Manifest Is Missing

**Category:**
skills / agent-native

**Current State:**
CLI usage and README describe available commands, but agents have no machine-readable manifest explaining supported commands, proof boundaries, schemas, and safe external-root modes.

**Expected State:**
Expose a small `evals.capabilities.json` or generated `schemas/capability-manifest.schema.json` surface for agent-native discovery.

**Evidence Basis:**
The evidence says projects should consume shared contracts through declared manifests, and agent-native review flagged discoverability as docs-only.

**Code Evidence:**
`src/cli.js:12-20`, `README.md:15`.

**Risk:**
Agents infer capabilities from prose and may choose unsupported commands or overstate supported proof.

**Severity:**
Low

**Fix Grade:**
P2

**Recommended Fix:**
After proof-boundary fields land, generate or maintain a machine-readable capability manifest that lists commands, accepted root modes, proof boundaries, and validation commands.

**Suggested Software / Method:**
JSON Schema, generated manifest test, CLI help snapshot.

**Files Likely To Change:**
`schemas/capability-manifest.schema.json`, `evals.capabilities.json`, `test/cli.test.js`.

**Validation Command:**
`pnpm test`

**Acceptance Criteria:**
Manifest validates, names every CLI command, and distinguishes local execution from external artifact inspection.

## 5. Contradictions

| Claim | Actual Implementation | Evidence | Severity | Operational Impact | Recommended Fix |
|---|---|---|---|---|---|
| Contract evals should declare what they prove and do not prove. | No schema or output surface requires `proves` or `does_not_prove`. | `schemas/validation-result.schema.json:1-129`, `schemas/runtime-state.schema.json:105-122` | High | Agents can overclaim eval meaning. | Add contract metadata schema and proof-boundary result fields. |
| Suite IDs are shared identifiers across suite and case artifacts. | Suite schema allows dotted IDs; case schema rejects them. | `schemas/suite.schema.json:10`, `schemas/eval-case.schema.json:11` | High | Consumer fixtures can pass suite validation and fail case validation. | Unify `suite_id` grammar and add regression tests. |
| Case schema accepts generic input commands. | Runtime only accepts `simulate-pr-closeout`. | `schemas/eval-case.schema.json:55`, `src/lib/case-contract.js:55-57` | High | Schema-valid consumer cases fail at runtime. | Encode the phase-one command enum in schema or broaden runtime intentionally. |
| External root state/check commands are replayable from evidence packets. | Runtime-state recommends `--repo-root), but claim-evidence packet hardcodes local `pnpm evals check --json`. | `src/lib/runtime-state.js:40-46`, `src/lib/claim-evidence-contract.js:82-94` | Medium | Agents may validate the wrong root. | Parameterize command evidence by artifact root. |
| Baseline promotion is part of the shared-learning loop. | Runtime always emits `promotion_status: "not_requested"` and has no promotion authority path. | `src/commands/run.js:130-138`, `src/lib/scoring.js:112-124` | Medium | Promotion can become a docs-only ritual. | Either mark promotion unsupported in phase one or implement a governed candidate workflow. |
| External artifact checks are limited and non-authoritative. | Human docs say this, but `check --repo-root --json` can still return `status: "passed"` with runtime evidence `not_configured`. | `README.md:51-63`, `src/commands/validation.js:143`, `src/commands/validation.js:168-178` | Medium | Automated consumers may treat artifact consistency as readiness. | Add `does_not_prove` and `external_root_mode: artifact_consistency_only` fields. |

No broad `tested_but_unreachable` runtime path was found for the core smoke runner. The closest pattern is promotion semantics: promotion fields are present in the result shape but the authority path is non_enforced rather than reachable runtime behavior.

## 6. Missing Features

Runtime state:

- Producer provenance for latest artifacts.
- Suite-level latest/result packet.
- Explicit stop reason and run-origin fields.

Command selection:

- `validate-schema --repo-root` or equivalent external artifact schema validation.
- Exact replay commands in evidence packets for external roots.
- Stable `brainwav-evals run --contracts <manifest>` equivalent is not present.

Verification:

- Proof-boundary fields in `check` and `state`.
- Adopted-contract manifest validation.
- Negative fixtures for first shared contract families.

Validation:

- Contract catalog validator.
- Project contract manifest schema.
- Unified schema/runtime grammar for suite IDs and commands.

Architecture enforcement:

- Contract metadata gate in `pnpm verify`.
- Optional import graph check is absent; current bespoke architecture gate is useful but narrow.

Traces:

- Data-only telemetry snapshot schema.
- Validator span/log/retry fixture contracts.
- External trace correlation remains out of phase-one authority.

Context:

- No executable stale-canon, context-boundary, or source-evidence contract.
- Hot/cold context policy remains documented_only.

Skills:

- No agent-readable capability manifest.
- No consumer adoption skill should be added yet; contract metadata should land first.

Recovery:

- No retry classification schema.
- No recovery handler registry.
- No blind-retry prevention contract.

Governance:

- No promotion command or promotion checklist generator.
- No artifact retention policy schema.
- No privacy/provenance approval policy for real consumer fixtures.

CI/CD:

- CI runs `pnpm verify`, but verify does not yet validate contract catalog, adopted-contract manifests, or external-root provenance.

Observability:

- Telemetry contracts are fixture-level scaffolds, not OTel-backed proof.
- No telemetry summary report exists.

## 7. Fix Roadmap

### Phase 1 — Critical Trust Boundary Fixes

Objective: reduce false-success, stale-state, unsafe-command, and missing-evidence risk without opening dashboards, adapters, plugins, source mining, LLM judges, or telemetry authority.

Fixes included:

- GAP-001: contract metadata schema and seed catalog.
- GAP-002: proof-boundary fields in check/state.
- GAP-003: producer provenance in latest artifacts.
- GAP-004: schema/runtime drift fixes.
- GAP-006: external-root replay command correction.

Files likely affected:

`schemas/contract.schema.json`, `contracts/**`, `schemas/validation-result.schema.json`, `schemas/runtime-state.schema.json`, `schemas/latest-run.schema.json`, `src/commands/run.js`, `src/commands/validation.js`, `src/lib/runtime-state.js`, `src/lib/claim-evidence-contract.js`, `scripts/verify.js`, `test/*.test.js`.

Validation gates:

`pnpm test`, `pnpm evals run fixtures/smoke/pr-closeout.case.json --json`, `pnpm evals check --json`, `pnpm verify`.

Expected risk reduction:

External artifacts become harder to forge, validation outputs become harder to overread, and contract authors must state proof boundaries before adding suites.

### Phase 2 — Mechanical Enforcement

Objective: convert contract-package doctrine into native repo enforcement.

Fixes included:

- GAP-005: downstream schema validation parity.
- GAP-008: contract report schema and writer.
- GAP-009: first five shared contract families as negative-fixture-heavy contracts.
- Add adopted-contract manifest schema.

Files likely affected:

`schemas/project-contract-manifest.schema.json`, `schemas/contract-report.schema.json`, `src/lib/contract-assertions.js`, `src/lib/reporting.js`, `fixtures/good/**`, `fixtures/bad/**`, `contracts/**`.

Validation gates:

`pnpm verify`, plus a temp external-root test that exercises `check --repo-root` and schema validation.

Expected risk reduction:

The shared suite starts behaving like a real contract package rather than a local smoke harness.

### Phase 3 — Runtime Harness Maturity

Objective: mature suite runs, trace evidence, and failure classification without making external telemetry authoritative.

Fixes included:

- GAP-010: local telemetry snapshot schema and fixtures.
- GAP-011: suite-level latest/result packet.
- Add failure class, stop reason, attempt number, and retry count fields to run artifacts.

Files likely affected:

`schemas/telemetry-snapshot.schema.json`, `schemas/suite-result.schema.json`, `src/commands/run.js`, `src/lib/latest-run.js`, `src/lib/runtime-evidence-contract.js`.

Validation gates:

`pnpm test`, `pnpm evals run <suite> --json`, `pnpm evals check --json`, `pnpm verify`.

Expected risk reduction:

Macro fixtures and repeated-pattern suites can be evaluated without hiding earlier failures behind the final case.

### Phase 4 — Context and Skill Compression

Objective: add narrow context and skill boundaries only after contract metadata exists.

Fixes included:

- GAP-012: capability manifest.
- Add `docs.no-stale-canon.v1` or equivalent data-only contract.
- Add skill-routing contract only for manifest-discoverable commands.

Files likely affected:

`schemas/capability-manifest.schema.json`, `evals.capabilities.json`, `contracts/docs/**`, `contracts/tool-use/**`.

Validation gates:

`pnpm test`, `pnpm verify`.

Expected risk reduction:

Agents can discover the suite’s actual supported surfaces without relying on prose or stale context.

### Phase 5 — Governance and Scaling

Objective: govern real fixture promotion, privacy, retention, and broader adoption.

Fixes included:

- Promotion candidate workflow.
- Artifact retention policy schema.
- Privacy/provenance policy for real consumer fixtures.
- Later ADR for OTel-backed telemetry proof if still needed.

Files likely affected:

`src/commands/promote.js`, `schemas/promotion-candidate.schema.json`, `schemas/artifact-retention-policy.schema.json`, `schemas/privacy-review.schema.json`, `README.md`, `ARCHITECTURE.md`.

Validation gates:

`pnpm verify`, plus promotion dry-run fixture tests.

Expected risk reduction:

Real-world failures can be harvested into shared contracts without leaking sensitive data or letting a shared suite absorb project-local authority.

## 8. Highest-Leverage Fixes

| Rank | Fix | Impact | Difficulty | Risk Reduced | Why First |
|---:|---|---|---|---|---|
| 1 | Add contract metadata schema and seed catalog | Very High | Medium | Behavior-oracle drift | It forces every eval to state reusable proof boundaries. |
| 2 | Add `proves` / `does_not_prove` to check/state outputs | Very High | Low | False readiness claims | It protects downstream agents immediately. |
| 3 | Add producer provenance to latest artifacts | Very High | Medium | Forged external packets | It makes `--repo-root` more than shape validation. |
| 4 | Fix suite_id and input.command drift | High | Low | Consumer contract breakage | It removes two concrete API contradictions. |
| 5 | Parameterize external-root evidence commands | High | Low | Wrong-root validation | It makes evidence packets replayable. |
| 6 | Add project contract manifest schema | High | Medium | Adoption ambiguity | It lets consumers declare adopted shared contracts. |
| 7 | Add first five shared contract fixtures | High | Medium | Missing regressions | It turns the north-star into failing/passing examples. |
| 8 | Add contract report writer | Medium | Medium | Weak failure handoff | It gives agents actionable failure evidence. |
| 9 | Add suite-level latest result | Medium | Medium | Hidden suite failures | It supports macro-level fixtures honestly. |
| 10 | Add capability manifest | Medium | Low | Agent discoverability drift | It makes the CLI agent-native without adding runtime complexity. |

## 9. Implementation Advice

What to build first:

Build the contract metadata schema and proof-boundary output fields before adding more suites. This gives the rest of the project a durable language for what shared evals prove.

What not to build yet:

Do not build dashboards, external runtime adapters, plugin systems, source-mining automation, OTel collector authority, required LLM judge gates, or broad promotion automation. They conflict with phase-one hard blocks or would add machinery before the contract format is stable.

What to remove:

Do not remove the current deterministic smoke spine. If anything, remove ambiguous promotion wording from machine outputs until promotion is an executable governed workflow.

What to simplify:

Keep contracts as JSON first because the repo currently has no runtime dependencies. YAML can come later if a parser dependency is accepted by ADR.

What should become a validator:

- Contract catalog validity.
- Project contract manifest validity.
- Producer provenance validity.
- Proof-boundary field presence.
- First shared contract fixtures.

What should become a schema:

- `contract.schema.json`
- `project-contract-manifest.schema.json`
- `contract-report.schema.json`
- `telemetry-snapshot.schema.json`
- `capability-manifest.schema.json`
- `promotion-candidate.schema.json`

What should become a skill:

Only after contract metadata and reports are real, add a consumer-adoption skill that helps a project create its manifest and local fixtures. Do not make the skill a substitute for schema validation.

What should become documentation:

Document the shared/project-local boundary, external-root proof limits, promotion governance, privacy review, and artifact retention. Treat docs as explanatory surfaces, not enforcement.

What should become CI:

Add contract catalog validation, manifest validation, provenance validation, and fixture assertions to `pnpm verify`.

What should remain manual:

Baseline promotion approval, privacy approval for real fixtures, deciding whether a local failure is reusable enough to promote, and any future ADR that opens telemetry authority.

## 10. Final Recommendation

Immediate next action:

Create `schemas/contract.schema.json`, seed three contract files under `contracts/`, and add a validator to `pnpm verify`.

Safest first patch:

Fix the schema/runtime drift for `suite_id` and `input.command` while adding tests. This is small, deterministic, and reduces consumer confusion immediately.

Highest-risk missing system:

External artifact producer provenance. Without it, `check --repo-root` proves artifact consistency but not that a real run produced the packet.

Best validation command to add first:

`pnpm evals validate-contracts --json`, wired into `pnpm verify`.

Broader Codex autonomy readiness:

Not yet for autonomous consumer adoption. The local executable spine is good enough for tightly scoped Codex changes with `pnpm test` and `pnpm verify`, but broader autonomy should wait until proof boundaries, contract metadata, and external-root provenance are enforced in machine outputs.
