# Evidence-Led Codebase Gap Audit

Date: 2026-05-22
Repository: /Users/jamiecraik/dev/evals
Primary skill: /Users/jamiecraik/dev/agent-skills/Skills/agent-ops/improve-codebase-architecture/SKILL.md
Output: .harness/research/audits/2026-05-22-evidence-led-codebase-gap-audit.md

## Audit Method

This audit inspected implementation, tests, schemas, fixtures, validation scripts, CI, and harness instruction files. It does not treat documentation as implementation. Runtime status labels use the requested vocabulary: implemented_enforced, implemented_not_enforced, documented_only, scaffolded, partial, contradicted, missing, unreachable, and overbuilt.

Required repository context loaded:

- AGENTS.md
- .harness/core/2026-05-18-evals-core.md
- UBIQUITOUS_LANGUAGE.md
- README.md
- .harness/linear/2026-05-20-evals-evidence-led-gap-fixes-linear-plan.md

Primary code surfaces inspected:

- package.json
- src/cli.js
- src/commands/run.js
- src/commands/state.js
- src/commands/validation.js
- src/lib/case-contract.js
- src/lib/latest-run.js
- src/lib/runtime-state.js
- src/lib/runtime-evidence-contract.js
- src/lib/trace-events.js
- src/lib/schema.js
- schemas/*.schema.json
- fixtures/smoke/pr-closeout.case.json
- fixtures/runtime-evidence/*.case.json
- scripts/verify.js
- test/cli.test.js
- tests/docs-pr-changes.test.js
- test/workflow-guardrails.test.js
- .github/workflows/ci.yml
- .harness/ci-required-checks.json

Reviewer coverage:

- agent-native reviewer completed and wrote /private/tmp/evals-agent-native-audit.md. It also reported pnpm evals check --json passed. Its artifact-first finding maps most directly to GAP-003, where subagent artifact closure needed artifact identity proof instead of event counts.
- api-contract reviewer returned structured findings in the agent completion payload, but did not write the requested /private/tmp report. Its substantive findings were incorporated into GAP-001, GAP-002, and the public JSON/schema compatibility risks.
- adversarial reviewer returned structured findings in the agent completion payload, but did not write the requested /private/tmp report. Its substantive findings were incorporated into GAP-004, GAP-005, and the false-readiness, fixture-tampering, and stale-tracker risks.

Skill lens selection:

- Deep Module Examiner: used to distinguish narrow patch fixes from interface-level runtime evidence design.
- Architectural Pattern Cartographer: used to compare the current executable spine against broader runtime-evidence architecture.
- Pragmatic Delivery Partner: used to rank fixes by reversible validation value.

No request_user_input decision was made in this audit. The audit recommends implementation order; it does not select a public interface change for immediate execution.

## 1. Executive Summary

Overall maturity grade: B-.

The repository has moved beyond documentation-only planning. It has a small executable spine, local schemas, deterministic validation, artifact bundle checks, latest-run consistency checks, JSONL trace validation, runtime state output, runtime-evidence fixtures, negative-path tests, and a pinned CI gate. That is a real foundation.

The main gap is narrower and more dangerous: several new runtime-evidence ideas are present as schema or planning language but are not all enforced by scorers, state, or CI. The repo can prove its phase-one smoke bundle well. It cannot yet prove the full Codex runtime truth machine described by the evidence document.

Top 5 gaps:

1. Runtime Evidence Contract V1 is only partial: permission drift, subagent artifact contract, and plugin attribution are scored, but goal, thread, network, package provenance, MCP, compaction, hook, warmup, recovery, and tool spec completeness are not enforced.
2. pnpm evals state --json can report readiness from latest artifact validation while pnpm evals check --json can fail runtime-evidence validation, creating a state/check alignment gap.
3. Runtime-evidence fixtures are synthetic and manually authored; there is no safe fixture promotion path from real rollouts or session evidence, and source-mining automation is correctly phase-one blocked.
4. The runtime state packet is local-artifact aware but not environment aware: it does not include git state, tracker override status, permission profile, MCP environment provenance, runtime version, or stale-age policy.
5. The CI credential scan covers fixtures and .harness/evals, but not .harness/research, src, test, or other repo surfaces where audit and implementation files can introduce secret-like content.

Top 5 risks:

1. False confidence from schema-shaped but unscored runtime policies.
2. False readiness when state and check disagree on runtime-evidence health.
3. Count-only subagent artifact closure that can be satisfied without verifying artifact identity.
4. Fixture policy tampering, where declared policy and observed evidence live in the same mutable file.
5. Premature expansion into adapters, dashboards, source mining, packaged runtimes, or plugin systems before the offline contract is complete.

Strongest existing foundations:

1. The CLI is small and discoverable: run, check, and state are explicit in src/cli.js and README.md.
2. Schema validation is local and fail-closed through src/lib/schema.js, including unsupported keyword detection.
3. Latest-run validation checks path boundaries, artifact presence, schema validity, manifest hashes, and cross-file consistency.
4. Trace event timelines are written as JSONL and validated for order, sequence, run ID, case ID, status, and artifact-path boundaries.
5. CI runs pnpm verify, and tests already exercise malformed fixtures, missing artifacts, path traversal, invalid latest pointers, and runtime-evidence negative paths.

Highest-leverage next fixes:

1. Make state and check agree on runtime-evidence health.
2. Require artifact identity for subagent artifact closure.
3. Add a runtime-evidence enforcement coverage gate for declared policy blocks.
4. Expand the credential scan scope or introduce explicit repo-wide include/exclude policy.
5. Add the first tool spec completeness schema and deterministic negative fixture before building runtime launchers or adapters.

## 2. Overall Gradecard

| Area | Grade | Confidence | Current Status | Main Gap | Recommended Fix |
|---|---|---:|---|---|---|
| Repository as Control Plane | B | High | implemented_enforced for core docs, phase-one hard blocks, CI contract, tracker override docs, and command contracts | Runtime-evidence future work is split across plans, schemas, fixtures, and tests without a single enforcement coverage map | Add a runtime-evidence contract coverage register generated or validated by pnpm evals check --json |
| Runtime Truth and Decision Packets | C+ | High | partial: pnpm evals state --json emits schema-backed packet from latest artifacts | State omits runtime-evidence suite health and environment provenance | Include runtime-evidence validation status in state and add env/provenance fields behind offline fixtures |
| Claim-vs-Evidence Verification | B | High | implemented_enforced for latest artifacts, manifest hashes, trace invariants, baseline observation, and CI gate | Claims about runtime evidence beyond three scorers are not enforced | Add scorer coverage gate and JSON output contract tests |
| Mechanical Architecture Enforcement | B- | High | implemented_enforced for JSON schema subset and repo-relative artifact rules | No import/layer boundary validation and no API response schema snapshot for CLI JSON | Add lightweight structural tests, not dependency tooling, unless modules expand |
| Harness Runtime Loop | C | Medium | partial: one deterministic smoke loop writes artifacts and classifies validation | No retry budgets, attempt metadata, recovery handlers, or stop-reason taxonomy beyond run status | Add attempt/recovery event types only after state/check alignment and scorer coverage |
| Trace and Session Evidence | C+ | High | implemented_enforced for local eval lifecycle trace | Trace does not capture tool calls, hooks, MCP startup, compaction, subagent stop, warmup/logical request split, or session evidence | Extend runtime-evidence fixtures first; do not turn telemetry into authority |
| Context Engineering | C | Medium | documented_only plus glossary and phase-one routing | Hot/cold context and stale context detection are not machine-enforced | Keep as docs until runtime state has environment and freshness fields |
| Skills and Workflow Density | C | Medium | partial: repo prefers scripts/CLI over repo-local skills | No executable repo-local skill for runtime-evidence case promotion or audit-to-fix packets | Make a small checklist or script before adding a skill |
| Recovery and Failure Handling | C- | High | partial: structured failures exist for fixtures/latest/artifacts/schema | No auth/session/MCP/stale branch/reconnect recovery cases | Add offline recovery fixtures after tool spec and provenance fields |
| Governance and Safety | B- | High | partial: CI pinned, permission doctrine documented, credential scan exists | Secret scan scope is narrow; fixture policy changes have no approval metadata | Expand scan roots and add policy-change approval metadata for runtime evidence |

## 3. Evidence-to-Code Mapping

| Evidence Pattern | Source File | Code Location | Runtime Status | Grade | Confidence |
|---|---|---|---|---|---:|
| Runtime Evidence Contract V1 | Evidence document, .harness/linear/2026-05-20-evals-evidence-led-gap-fixes-linear-plan.md:124-232 | schemas/runtime-evidence-case.schema.json; src/lib/runtime-evidence-contract.js | partial | C | High |
| Rollout/session case mining into fixtures | Evidence document; .harness/linear plan lines 211-232 | No source-mining or promotion code found; phase-one hard block in README.md:72-83 | documented_only | D | High |
| Mandatory tool spec completeness gate | Evidence document | No tool spec schema, fixture, scorer, or validator found | missing | F | High |
| Permission profile matrix | Evidence document | schemas/runtime-evidence-case.schema.json; src/lib/runtime-evidence-contract.js:146-190; fixtures/runtime-evidence/approval-disabled-readonly-fallback.case.json | partial | B- | High |
| Explicit MCP environment provenance | Evidence document | environment_profile is a string in schema, but no MCP server/config/cwd/env/startup failure fields are enforced | scaffolded | D | High |
| Subagent and hook identity tracking | Evidence document | src/lib/runtime-evidence-contract.js:192-239; schemas/runtime-evidence-case.schema.json event enum | partial | C+ | High |
| Goal/budget/continuation scoring | Evidence document | goal_policy and goal_state fields exist in schema but no scorer/classification exists | implemented_not_enforced | D | High |
| Compaction and remote parity fixtures | Evidence document | thread_policy/thread_settings fields exist in schema but no scorer/fixture enforces compaction or remote parity | scaffolded | D | High |
| Recovery and reconnect scenarios | Evidence document | No auth/reconnect/stale exec/retry case family found | missing | F | High |
| Packaged runtime launcher adapter | Evidence document | No adapter found; README phase-one hard block rejects external adapters/cloud/source mining before local proof | missing_by_design | D | High |
| Plugin hook contract tests | Evidence document | plugin attribution scorer exists; hook firing/payload/blocking contract absent | partial | C | High |
| Repo-owned judgment boundary | Evidence document; README.md:43-50,72-86; UBIQUITOUS_LANGUAGE.md:35-38 | No runtime dependencies on sibling repos in package.json; fixtures synthetic only | implemented_enforced | A- | High |
| Negative path hardening before UI | Evidence document | src/lib/schema.js, src/lib/latest-run.js, test/cli.test.js, scripts/verify.js | implemented_enforced | A- | High |
| Telemetry explains, artifacts decide | Evidence document; README.md:43-49 | Artifact bundle/trace/latest validation enforced; external telemetry not authority | implemented_enforced | A- | High |

## 4. Gap Register

### GAP-001: State and Check Can Disagree on Runtime-Evidence Health

**Category:** validation / runtime

**Current State:** pnpm evals state --json builds status from validateLatestRun(latestPath) through src/lib/runtime-state.js. pnpm evals check --json validates latest artifacts and also validates the runtime-evidence suite through src/commands/validation.js.

**Expected State:** A current-state packet should not report the proof surface as ready when the stronger validation gate would fail on runtime-evidence contracts.

**Evidence Basis:** Runtime truth and decision packets must catch blocker/stale-state conditions before downstream automation trusts readiness.

**Code Evidence:** src/lib/runtime-state.js:20-109; src/commands/validation.js:80-96; README.md:115-138.

**Risk:** Automation or an agent can trust state.status ready while check would fail. This is a false-readiness risk.

**Severity:** High

**Fix Grade:** P0

**Recommended Fix:** Add runtime-evidence suite validation to buildRuntimeState, or add a contract_validation field and make overall status non-ready when contract validation fails.

**Suggested Software / Method:** Existing local validator functions; no new dependency. Reuse validateRuntimeEvidenceSuite and schema-backed runtime-state output.

**Files Likely To Change:** src/lib/runtime-state.js; schemas/runtime-state.schema.json; test/cli.test.js.

**Validation Command:** pnpm test && pnpm evals state --json && pnpm evals check --json

**Acceptance Criteria:**

- A deliberately broken runtime-evidence fixture makes pnpm evals check --json fail.
- The same broken fixture makes pnpm evals state --json report invalid or contract_validation failed.
- Existing valid fixture suite still reports ready.

### GAP-002: Runtime-Evidence Policy Fields Are Declared but Not Scored

**Category:** runtime / traceability

**Current State:** schemas/runtime-evidence-case.schema.json models goal_policy, thread_policy, network_policy, package_provenance_policy, goal_state, thread_settings, network_policy, and package_provenance. src/lib/runtime-evidence-contract.js only registers permission-drift, subagent-artifact-contract, and plugin-attribution.

**Expected State:** Every declared policy family should either be enforced by a scorer, explicitly marked scaffolded/non-enforced in a machine-readable way, or absent from passing fixtures.

**Evidence Basis:** The evidence brief asks for permission/MCP provenance, goal/compaction/recovery packs, package provenance, and runtime truth. The repo doctrine says artifacts decide, so unscored declarations must not look authoritative.

**Code Evidence:** schemas/runtime-evidence-case.schema.json:77-116 and 127-173; src/lib/runtime-evidence-contract.js:9 and 96-116; fixtures/runtime-evidence/approval-disabled-readonly-fallback.case.json includes optional policy blocks that do not affect scoring.

**Risk:** A fixture can claim goal, thread, network, or package provenance expectations while the verdict ignores them. That is a false-success risk.

**Severity:** High

**Fix Grade:** P0

**Recommended Fix:** Add scorer registry metadata that maps policy blocks to enforcing scorers. Fail closed when a fixture includes a policy block without either an enforcing scorer or explicit enforcement_status scaffolded_not_enforced.

**Suggested Software / Method:** JSON Schema plus existing custom validator; table-driven scorer registry; Node test negative fixtures.

**Files Likely To Change:** src/lib/runtime-evidence-contract.js; schemas/runtime-evidence-case.schema.json; fixtures/runtime-evidence/*.case.json; test/cli.test.js.

**Validation Command:** pnpm test && pnpm evals check --json

**Acceptance Criteria:**

- A fixture with goal_policy and no goal scorer fails with a policy coverage error.
- Existing intended scaffold fields are either removed from passing fixtures or explicitly marked non-enforced.
- Runtime-evidence check output lists policy families and enforcement status.

### GAP-003: Subagent Artifact Closure Is Count-Based Instead of Artifact-Based

**Category:** runtime / traceability

**Current State:** The subagent-artifact-contract scorer counts ArtifactExpected and ArtifactWritten events by subagent_id. Event schema does not require artifact_type or artifact_path on artifact events.

**Expected State:** A subagent artifact contract should prove that the expected artifact identity was written, not only that an event count exists.

**Evidence Basis:** Review-swarm and multi-agent contracts require artifact-first outputs and exact artifact evidence.

**Code Evidence:** src/lib/runtime-evidence-contract.js:192-239; schemas/runtime-evidence-case.schema.json event object requirements around observed_events; agent-native reviewer finding.

**Risk:** A malformed or spoofed ArtifactWritten event can satisfy closeout without pointing to a verifiable report.

**Severity:** Critical

**Fix Grade:** P0

**Recommended Fix:** Require artifact_type and artifact_path for ArtifactExpected and ArtifactWritten, then match pairs by subagent_id plus artifact_type plus artifact_path.

**Suggested Software / Method:** JSON Schema required-if validation can stay in code because the local subset does not support conditional JSON Schema. Add explicit code checks and fixture tests.

**Files Likely To Change:** src/lib/runtime-evidence-contract.js; schemas/runtime-evidence-case.schema.json documentation/comments if any; test/cli.test.js; fixtures/runtime-evidence/subagent-artifact-contract.case.json.

**Validation Command:** pnpm test && pnpm evals check --json

**Acceptance Criteria:**

- ArtifactWritten without artifact_path fails.
- ArtifactWritten for the wrong artifact_path fails.
- A correct expected/written pair passes.

### GAP-004: Tool Spec Completeness Gate Is Missing

**Category:** validation / governance / architecture

**Current State:** No schema or validator requires eval adapters, runner capabilities, or external tool surfaces to declare name, input schema, output schema, permission envelope, artifact expectations, and failure classes.

**Expected State:** Tool and runner capabilities should fail closed before a case runs if the declared spec is incomplete.

**Evidence Basis:** The evidence brief directly prioritizes mandatory tool spec completeness as a foundation for future adapters and project suites.

**Code Evidence:** package.json has no tool-spec command or dependency; schemas directory has no tool-spec schema; src/lib/runtime-evidence-contract.js has no tool spec validator; fixtures do not reference tool specs.

**Risk:** Future adapters can become authority through implicit behavior rather than declared and testable contracts.

**Severity:** High

**Fix Grade:** P1

**Recommended Fix:** Add schemas/tool-spec.schema.json and a small validator that can be called from pnpm evals check --json for a checked-in fixtures/tool-specs/*.json or .harness/evals/tool-specs/*.json set. Keep it offline and generic.

**Suggested Software / Method:** Existing custom JSON Schema subset; Node test; no external adapter runtime.

**Files Likely To Change:** schemas/tool-spec.schema.json; src/lib/tool-spec-contract.js; src/commands/validation.js; test/cli.test.js; fixtures/tool-specs/*.json.

**Validation Command:** pnpm test && pnpm evals check --json

**Acceptance Criteria:**

- Missing input_schema fails.
- Missing permission envelope fails.
- Missing failure classes fails.
- A minimal complete spec passes.

### GAP-005: Real Session Case Mining Has No Safe Manual Promotion Path

**Category:** traceability / context / governance

**Current State:** Source-mining automation is phase-one blocked, and no manual case-promotion ledger/schema exists for turning real session patterns into sanitized fixtures.

**Expected State:** Before automation, the repo should have a manual, privacy-safe promotion contract: source reference, sanitized fields, privacy review, expected classification, artifact expectations, and reviewer approval.

**Evidence Basis:** The evidence brief says real session case mining is the golden nugget, but repo instructions prohibit source-mining automation in phase one.

**Code Evidence:** README.md:72-83 blocks source-mining automation; .harness/linear plan lines 211-232 lists future offline fixture backlog; no fixture promotion schema or command exists.

**Risk:** The repo either stays synthetic-only too long or jumps straight to unsafe mining without privacy/governance gates.

**Severity:** Medium

**Fix Grade:** P1

**Recommended Fix:** Add a manual case-promotion-candidate.schema.json and one sanitized example candidate that records provenance without importing raw transcripts. Do not add mining automation yet.

**Suggested Software / Method:** JSON Schema; jq-friendly JSON; manual review checklist; existing pnpm evals check --json.

**Files Likely To Change:** schemas/case-promotion-candidate.schema.json; .harness/research/case-promotion/*.json; src/commands/validation.js; test/cli.test.js.

**Validation Command:** pnpm test && pnpm evals check --json

**Acceptance Criteria:**

- Candidate without privacy status fails.
- Candidate without expected classification fails.
- Candidate with raw secret-like text fails or is rejected by scan policy.

### GAP-006: Runtime State Packet Lacks Environment Provenance

**Category:** runtime / governance

**Current State:** Runtime state reports latest pointer status, artifact presence, schema validation, and recommended commands. It does not include git branch/dirty state, tracker override status, permission profile, MCP environment, runtime version, executable path, or stale-age threshold.

**Expected State:** Current-state packets should tell an agent whether the local proof surface is safe to trust under the current environment.

**Evidence Basis:** The evidence brief centers runtime truth: what was attempted, under what environment, with which permissions/tools/agents, and what artifacts prove it.

**Code Evidence:** src/lib/runtime-state.js:20-109; schemas/runtime-state.schema.json; README.md:115-118.

**Risk:** A ready artifact bundle can be confused with a ready workspace. Wrong branch, stale tracker, changed permission profile, or MCP startup drift will not appear.

**Severity:** Medium

**Fix Grade:** P1

**Recommended Fix:** Extend runtime state in small steps: add generated_at, latest_age_seconds, git status summary if available, tracker_state from the known override artifact, and runtime_evidence_validation status. Leave MCP provenance to dedicated offline fixtures first.

**Suggested Software / Method:** Node child_process for read-only git commands only if accepted by repo policy; existing schema validation; fixture tests with injectable clock/state reader.

**Files Likely To Change:** src/lib/runtime-state.js; schemas/runtime-state.schema.json; test/cli.test.js.

**Validation Command:** pnpm test && pnpm evals state --json

**Acceptance Criteria:**

- State reports latest artifact age.
- State reports tracker override status without claiming live Linear issue.
- State reports non-ready when runtime-evidence validation fails.

### GAP-007: MCP Environment Provenance Is Missing

**Category:** runtime / recovery / governance

**Current State:** runtime-evidence fixtures have an environment_profile string and runtime capabilities, but no explicit MCP server resolution, config source, command, cwd, env, startup failure class, or Local Memory availability.

**Expected State:** Offline cases should classify MCP/Local Memory availability and startup failure causes without making MCP itself runtime authority.

**Evidence Basis:** Evidence priority 5 asks for explicit MCP environment provenance. The repo's user workflows depend on MCP, Local Memory, Linear, GitHub, and connector availability.

**Code Evidence:** schemas/runtime-evidence-case.schema.json resolved_runtime fields; no mcp_environment field or scorer in src/lib/runtime-evidence-contract.js.

**Risk:** Hidden MCP drift can be mistaken for an eval failure or a task failure.

**Severity:** Medium

**Fix Grade:** P2

**Recommended Fix:** Add an offline mcp_environment object with config_source, server_id, launch_command_ref, cwd, env_keys, startup_status, and failure_class. Add one negative fixture for Local Memory unavailable classified as environment blocker.

**Suggested Software / Method:** JSON Schema; deterministic scorer; no live MCP dependency.

**Files Likely To Change:** schemas/runtime-evidence-case.schema.json; src/lib/runtime-evidence-contract.js; fixtures/runtime-evidence/mcp-startup-unavailable.case.json; test/cli.test.js.

**Validation Command:** pnpm test && pnpm evals check --json

**Acceptance Criteria:**

- Fixture with MCP startup failure and expected environment blocker passes.
- Fixture that omits startup failure class when status is failed fails.
- Runtime evidence output distinguishes environment blocker from adapter failure.

### GAP-008: Goal, Budget, and Continuation Scoring Is Schema-Shaped Only

**Category:** runtime / traceability

**Current State:** goal_policy and goal_state fields exist, but no scorer validates completion truth, blocked classification, continuation budget, or goal replacement behavior.

**Expected State:** Goal lifecycle cases should score final claims against evidence and remaining work.

**Evidence Basis:** The evidence brief highlights goal/budget/continuation scoring as central to Jamie's delivery truth.

**Code Evidence:** schemas/runtime-evidence-case.schema.json goal fields; no scorer in src/lib/runtime-evidence-contract.js.

**Risk:** Future fixtures can claim goal state expectations without enforcement; false completion remains possible outside the smoke bundle.

**Severity:** Medium

**Fix Grade:** P2

**Recommended Fix:** Add a goal-accounting scorer with minimal classifications: ok, completed_too_early, blocked_without_threshold, budget_continuation_required, goal_replacement_invalid.

**Suggested Software / Method:** Deterministic JSON fixture scorer; Node tests; no LLM judge.

**Files Likely To Change:** schemas/runtime-evidence-case.schema.json; src/lib/runtime-evidence-contract.js; fixtures/runtime-evidence/goal-completed-too-early.case.json; test/cli.test.js.

**Validation Command:** pnpm test && pnpm evals check --json

**Acceptance Criteria:**

- False completion fixture fails with expected classification.
- Proper blocked threshold fixture passes.
- No scorer relies on prose-only final answer content unless represented as structured evidence.

### GAP-009: Compaction and Remote Parity Fixtures Are Not Implemented

**Category:** context / traceability

**Current State:** thread_policy and thread_settings fields are present, but no fixture or scorer runs raw, compacted, and remote-style variants with identical expected outcome.

**Expected State:** The same scenario should preserve artifact refs, blockers, and completion claims across transcript variants.

**Evidence Basis:** The evidence brief says long real workflows compact, and pristine short transcripts miss sustained delivery failures.

**Code Evidence:** schemas/runtime-evidence-case.schema.json thread fields; no compaction fixture family; no thread parity scorer.

**Risk:** Evaluation passes on short synthetic traces while compacted/resumed flows lose evidence or weaken blockers.

**Severity:** Medium

**Fix Grade:** P2

**Recommended Fix:** Add a thread-parity offline scorer that compares normalized expected evidence across variants. Keep it data-only; do not launch remote runtime.

**Suggested Software / Method:** JSON fixture variants; canonical normalization; JSONL trace refs.

**Files Likely To Change:** schemas/runtime-evidence-case.schema.json; src/lib/runtime-evidence-contract.js; fixtures/runtime-evidence/thread-parity-*.case.json; test/cli.test.js.

**Validation Command:** pnpm test && pnpm evals check --json

**Acceptance Criteria:**

- Raw, compacted, and remote-style fixture variants produce the same classification.
- Missing artifact ref after compaction fails.
- Weakened blocker text represented in structured classification fails.

### GAP-010: Recovery and Reconnect Scenarios Are Missing

**Category:** recovery / runtime

**Current State:** The runner emits structured errors for local fixture/latest/artifact/schema failures. There are no offline cases for auth recovery, disconnected websocket clients, stale exec sessions, restarted runtimes, or resumed runs.

**Expected State:** Recovery scenarios should classify retry, preservation of evidence, and infrastructure-vs-task failure boundaries.

**Evidence Basis:** The evidence brief identifies recovery quality as evaluator gold for brownfield environments.

**Code Evidence:** src/lib/failures.js exists; src/lib/trace-events.js event enum is limited to eval lifecycle; runtime-evidence schema event enum lacks recovery/reconnect events.

**Risk:** Infrastructure failures can be scored as task completion or generic failure.

**Severity:** Medium

**Fix Grade:** P2

**Recommended Fix:** Add recovery event types and one negative fixture at a time. Start with stale exec session or resumed run because it does not require auth secrets.

**Suggested Software / Method:** JSONL traces; deterministic event-order checks; failure_class taxonomy.

**Files Likely To Change:** schemas/runtime-evidence-case.schema.json; src/lib/runtime-evidence-contract.js; fixtures/runtime-evidence/recovery-stale-exec.case.json; test/cli.test.js.

**Validation Command:** pnpm test && pnpm evals check --json

**Acceptance Criteria:**

- Recovery event without preserved evidence ref fails.
- Infrastructure blocker is distinct from task failure.
- Blind retry without changed condition fails.

### GAP-011: Credential Scan Scope Is Too Narrow for the Claimed Gate

**Category:** governance / safety

**Current State:** scripts/verify.js scans only fixtures and .harness/evals for credential-like strings.

**Expected State:** The CI gate should scan all likely committed surfaces or make its narrow scope explicit and tested.

**Evidence Basis:** Governance and safety require no-secret-in-prompt and no-secret-in-artifact enforcement. This audit output itself lives in .harness/research, outside the scan roots.

**Code Evidence:** scripts/verify.js:53-55; README.md:142-144 mentions tests and validation; .github/workflows/ci.yml runs pnpm verify.

**Risk:** Secret-like content can land in src, tests, research audits, plans, or docs while pnpm verify passes.

**Severity:** Medium

**Fix Grade:** P1

**Recommended Fix:** Expand the scan to repo-wide allowlisted roots with explicit excludes for lockfiles/vendor if needed. Add tests or a fixture that proves .harness/research is covered.

**Suggested Software / Method:** Existing rg-based scanner plus Node fallback; explicit path include list.

**Files Likely To Change:** scripts/verify.js; tests/docs-pr-changes.test.js or test/cli.test.js; README.md/SECURITY.md if scope changes.

**Validation Command:** pnpm test && pnpm verify

**Acceptance Criteria:**

- .harness/research is scanned.
- src and test are scanned or explicitly justified as excluded.
- Scanner still avoids generated dependency directories.

### GAP-012: Runtime-Evidence Fixtures Lack Tamper-Resistance

**Category:** governance / validation

**Current State:** Scorers trust declared policy and observed events from the same fixture file.

**Expected State:** Policy changes that widen permissions or weaken expectations should require explicit approval metadata or a pinned policy reference.

**Evidence Basis:** Permission and governance checks should detect unsafe drift, not make drift disappear through fixture edits.

**Code Evidence:** src/lib/runtime-evidence-contract.js:146-190 builds allowlists from declared_contract in the fixture; fixtures/runtime-evidence/*.case.json combine policy and evidence.

**Risk:** A fixture can be edited to permit the action it was supposed to catch, and the checker will pass.

**Severity:** Medium

**Fix Grade:** P2

**Recommended Fix:** Add optional but enforced policy_revision metadata and require approval_ref when declared policy widens relative to a previous snapshot. Keep this as manual governance, not external service integration.

**Suggested Software / Method:** Snapshot JSON hash; schema field; deterministic validator.

**Files Likely To Change:** schemas/runtime-evidence-case.schema.json; src/lib/runtime-evidence-contract.js; fixtures/runtime-evidence/*.case.json; test/cli.test.js.

**Validation Command:** pnpm test && pnpm evals check --json

**Acceptance Criteria:**

- Policy widening without approval_ref fails.
- Policy narrowing can pass without approval_ref.
- Existing fixtures declare stable policy revision.

### GAP-013: CLI JSON Output Has No Dedicated Public Contract Test

**Category:** API / validation

**Current State:** run --json emits a structured response from src/commands/run.js, and tests assert selected fields. There is no dedicated schema or snapshot-like compatibility test for the full response shape.

**Expected State:** If agents or external wrappers consume CLI JSON, output shape should be guarded.

**Evidence Basis:** Mandatory tool spec and API contract completeness require stable request/response boundaries.

**Code Evidence:** src/commands/run.js:313-327; test/cli.test.js validates selected fields; api-contract reviewer residual risk.

**Risk:** Key additions/removals can drift without a clear compatibility signal.

**Severity:** Low

**Fix Grade:** P3

**Recommended Fix:** Add schemas/cli-run-output.schema.json or a test helper that asserts exact required top-level keys while allowing additive details only if intentional.

**Suggested Software / Method:** Existing JSON Schema subset; Node test.

**Files Likely To Change:** schemas/cli-run-output.schema.json; test/cli.test.js; src/commands/run.js if output is normalized.

**Validation Command:** pnpm test

**Acceptance Criteria:**

- Removing a public key fails tests.
- Adding an undocumented public key requires schema/test update.
- Human output remains unaffected.

### GAP-014: JSON Schema Draft Claim Can Mislead External Consumers

**Category:** API / architecture

**Current State:** Schemas advertise JSON Schema draft 2020-12, while src/lib/schema.js implements a deliberate local subset and rejects unsupported keywords.

**Expected State:** The repo should make clear that schemas are validated by the local subset contract, not arbitrary draft-2020-12 validators.

**Evidence Basis:** API contract reviewer flagged this as a residual compatibility risk.

**Code Evidence:** schemas/*.schema.json $schema; src/lib/schema.js:45-63.

**Risk:** External consumers can believe full draft-2020-12 semantics apply and get mismatched validation behavior.

**Severity:** Low

**Fix Grade:** P3

**Recommended Fix:** Add a top-level README note and schema description field that says validated by evals local subset. Optionally add x-evals-schema-subset.

**Suggested Software / Method:** Documentation plus existing schema contract tests.

**Files Likely To Change:** README.md; schemas/*.schema.json; test/schema.test.js if present.

**Validation Command:** pnpm test

**Acceptance Criteria:**

- Docs name the subset contract.
- Unsupported keyword tests remain authoritative.
- No external dependency is introduced.

### GAP-015: Packaged Runtime Launcher Adapter Is Missing and Should Stay Deferred

**Category:** runtime / architecture

**Current State:** No packaged Codex runtime launcher adapter exists.

**Expected State:** Eventually, evals should record runtime version/channel, executable path, launch config, env profile, and artifact directory for reproducible Codex runs.

**Evidence Basis:** The evidence brief recommends packaged runtime mode as a reproducible baseline, but repo phase-one hard blocks reject adapters before local proof is stable.

**Code Evidence:** README.md:72-83; package.json has no runtime adapter dependency; src/commands only expose local run, check, and state.

**Risk:** Adding this now would violate phase-one boundaries and blur shared runtime mechanics with Codex runtime authority.

**Severity:** Medium

**Fix Grade:** P3

**Recommended Fix:** Do not build the launcher yet. First finish runtime-evidence offline contracts, tool spec gate, environment provenance schema, and recovery fixtures.

**Suggested Software / Method:** Future adapter behind explicit ADR/spec update; no current code change.

**Files Likely To Change:** Later ADR/spec; future src/lib/runtime-launcher-contract.js; future schemas/runtime-launch.schema.json.

**Validation Command:** Not applicable now. Future command should be pnpm test && pnpm evals check --json && pnpm verify.

**Acceptance Criteria:**

- A later ADR opens the phase.
- Offline contract suite passes before adapter work begins.
- Launcher records provenance without becoming scorer authority.

## 5. Contradictions

### CONTRADICTION-001: State Readiness Does Not Include Runtime-Evidence Suite Health

- Claim: README.md describes pnpm evals state --json as classifying the local proof surface as ready, stale, missing, or invalid.
- Actual implementation: src/lib/runtime-state.js validates latest artifacts through validateLatestRun, while pnpm evals check --json also validates runtime-evidence cases.
- Evidence: src/lib/runtime-state.js:20-109; src/commands/validation.js:80-96.
- Severity: High.
- Operational impact: An agent can treat the repo as ready when the stronger local gate would fail.
- Recommended fix: Add runtime-evidence validation status to state and downgrade readiness when it fails.

### CONTRADICTION-002: Runtime-Evidence Schema Implies More Enforcement Than Scorers Provide

- Claim: runtime-evidence schema models goal, thread, network, and package provenance policies.
- Actual implementation: scorer registry only enforces permission drift, subagent artifact contract, and plugin attribution.
- Evidence: schemas/runtime-evidence-case.schema.json; src/lib/runtime-evidence-contract.js:9.
- Severity: High.
- Operational impact: Fixtures can carry authoritative-looking fields that do not affect verdict.
- Recommended fix: Add policy coverage registry or explicit scaffolded status for non-enforced policy families.

### CONTRADICTION-003: Subagent Artifact Contract Names Artifacts but Scorer Counts Events

- Claim: artifact-first reviewer/subagent behavior should prove expected reports exist.
- Actual implementation: current scorer counts ArtifactExpected and ArtifactWritten by subagent ID without requiring artifact identity.
- Evidence: src/lib/runtime-evidence-contract.js:192-239; agent-native reviewer report.
- Severity: Critical.
- Operational impact: Missing review artifacts can be masked by a bare written event.
- Recommended fix: Require and match artifact path/type pairs.

### CONTRADICTION-004: Phase-One Privacy Aid Is Easy to Overread as Repo-Wide Secret Coverage

- Claim: pnpm verify is the CI gate and includes credential scanning.
- Actual implementation: credential scan roots are only fixtures and .harness/evals.
- Evidence: scripts/verify.js:53-55; .github/workflows/ci.yml:42-43.
- Severity: Medium.
- Operational impact: Secret-like text in research, source, or tests can bypass CI.
- Recommended fix: Expand scan roots or document and test the narrow scope.

### CONTRADICTION-005: Draft 2020-12 Schema Header vs Local Subset Validator

- Claim: schema files advertise draft 2020-12.
- Actual implementation: src/lib/schema.js supports a local subset and rejects unsupported keywords.
- Evidence: schemas/*.schema.json; src/lib/schema.js:45-63.
- Severity: Low.
- Operational impact: External schema consumers may assume semantics the repo intentionally does not support.
- Recommended fix: Add explicit local-subset metadata and docs.

## 6. Missing Features

### Runtime State

- Runtime-evidence suite status in state.
- Git branch/dirty status.
- Latest artifact age and stale threshold.
- Tracker override status in machine-readable state.
- Runtime version/channel/executable provenance.

### Command Selection

- Safe-to-run checks that account for environment and permission profile.
- Command recommendation gates that distinguish run smoke from repair evidence contract.
- JSON output schema for CLI response compatibility.

### Verification

- Runtime-evidence scorer coverage gate.
- Tool spec completeness gate.
- Manual case-promotion validation.
- State/check semantic alignment tests.

### Validation

- Subagent artifact path/type pair matching.
- Policy widening approval metadata.
- Repo-wide or intentionally scoped credential scan coverage.
- MCP startup provenance validation.

### Architecture Enforcement

- Tool spec schema.
- Optional structural import tests if src/lib grows beyond the current small module set.
- Deep module fix packet enforcement for public interface changes.

### Traces

- Tool-call event types.
- Hook payload event types.
- MCP startup events.
- SubagentStop events.
- Compaction/resume events.
- Recovery/reconnect events.
- Warmup vs logical request split.

### Context

- Hot/cold context freshness checks.
- Compaction parity fixtures.
- Source evidence vs hot-path rule enforcement.
- Retrieval boundary fixtures.

### Skills

- No repo-local skill for runtime-evidence case promotion.
- No executable checklist for audit-to-fix packet generation.
- No skill validation fixture for future workflow density.

### Recovery

- Stale exec session fixture.
- Auth/session recovery fixture.
- Restarted runtime fixture.
- Blind retry prevention fixture.
- Infrastructure blocker vs task failure classification.

### Governance

- Policy revision metadata.
- Human approval refs for runtime-evidence policy widening.
- Broader secret scanning.
- Revocation path for tracker override once Linear parent is created.

### CI/CD

- CI validates pnpm verify, which is good.
- Missing CI proof that required check name stays aligned beyond current tests if workflow matrix expands.
- Missing CI artifact to publish contract coverage summary.

### Observability

- Local trace exists.
- No query surface for runtime-evidence contract coverage.
- No distinction between telemetry context and artifact authority for future MCP/hook traces beyond doctrine.

## 7. Fix Roadmap

### Phase 1 - Critical Trust Boundary Fixes

Objective: Reduce false-success, false-readiness, missing-evidence, and unsafe-command risk without expanding beyond phase-one scope.

Fixes included:

- GAP-001: Align state with check on runtime-evidence health.
- GAP-002: Add runtime-evidence policy coverage gate.
- GAP-003: Require subagent artifact identity matching.
- GAP-011: Expand or explicitly scope credential scanning.

Files likely affected:

- src/lib/runtime-state.js
- schemas/runtime-state.schema.json
- src/lib/runtime-evidence-contract.js
- schemas/runtime-evidence-case.schema.json
- fixtures/runtime-evidence/*.case.json
- scripts/verify.js
- test/cli.test.js
- tests/docs-pr-changes.test.js

Validation gates:

- pnpm test
- pnpm evals check --json
- pnpm evals state --json
- pnpm verify

Expected risk reduction:

- Prevents ready-state false positives.
- Prevents artifact closure spoofing.
- Prevents unscored policy fields from looking authoritative.
- Reduces secret leakage risk in audit and implementation files.

### Phase 2 - Mechanical Enforcement

Objective: Make future runtime/tool contracts explicit before adapters or launchers exist.

Fixes included:

- GAP-004: Tool spec completeness gate.
- GAP-005: Manual case-promotion candidate schema.
- GAP-012: Policy revision and approval metadata.
- GAP-013: CLI JSON output contract test.
- GAP-014: Schema subset declaration.

Files likely affected:

- schemas/tool-spec.schema.json
- schemas/case-promotion-candidate.schema.json
- schemas/cli-run-output.schema.json
- src/lib/tool-spec-contract.js
- src/commands/validation.js
- README.md
- test/cli.test.js

Validation gates:

- pnpm test
- pnpm evals check --json
- pnpm verify

Expected risk reduction:

- Prevents implicit tool authority.
- Makes fixture promotion privacy-safe before mining automation.
- Keeps public CLI contracts stable.

### Phase 3 - Runtime Harness Maturity

Objective: Extend local runtime evidence without making telemetry authoritative or importing sibling runtimes.

Fixes included:

- GAP-006: Environment-aware runtime state.
- GAP-007: MCP environment provenance fixture/scorer.
- GAP-008: Goal/budget/continuation scoring.
- GAP-010: Recovery and reconnect scenarios.

Files likely affected:

- schemas/runtime-evidence-case.schema.json
- src/lib/runtime-evidence-contract.js
- src/lib/runtime-state.js
- fixtures/runtime-evidence/*.case.json
- test/cli.test.js

Validation gates:

- pnpm test
- pnpm evals check --json
- pnpm evals state --json

Expected risk reduction:

- Separates environment blockers from implementation failures.
- Catches false completion and blind retries.
- Builds portable offline proof for Codex-shaped runtime behavior.

### Phase 4 - Context and Skill Compression

Objective: Make long-running and compacted workflow behavior testable without creating a prompt-prose dependency.

Fixes included:

- GAP-009: Compaction and remote parity fixtures.
- Manual case promotion checklist or small repo-local workflow if repeated.
- Hot/cold context stale evidence checks only after runtime state has freshness fields.

Files likely affected:

- schemas/runtime-evidence-case.schema.json
- fixtures/runtime-evidence/thread-parity-*.case.json
- .harness/research/case-promotion/*.json
- README.md or CONTRIBUTING.md

Validation gates:

- pnpm test
- pnpm evals check --json

Expected risk reduction:

- Prevents compacted transcripts from weakening blockers or losing artifact refs.
- Keeps real-session learning privacy-safe and deterministic.

### Phase 5 - Governance and Scaling

Objective: Open broader runtime adapters only after offline contracts prove the boundary.

Fixes included:

- GAP-015: Packaged runtime launcher adapter, only after ADR/spec update.
- Future project adapters for coding-harness and agent-skills.
- Future dashboards, summaries, trend views, or LLM-assisted triage only after deterministic contracts are stable.

Files likely affected:

- Future ADR/spec files.
- Future schemas/runtime-launch.schema.json.
- Future src/lib/runtime-launcher-contract.js.
- Future project-owned suites outside this repo.

Validation gates:

- pnpm test
- pnpm evals check --json
- pnpm verify
- Future adapter-specific smoke command after ADR.

Expected risk reduction:

- Avoids turning evals into a product-opinion monolith.
- Keeps shared runtime mechanics separate from repo-owned behavioral judgment.

## 8. Highest-Leverage Fixes

| Rank | Fix | Impact | Difficulty | Risk Reduced | Why First |
|---:|---|---|---|---|---|
| 1 | Align state with runtime-evidence check | High | Medium | False readiness | state is the agent-facing decision packet, so it must not be weaker than the gate |
| 2 | Require artifact identity in subagent closure | High | Low | Missing artifact false pass | Small scorer/test patch closes a concrete spoof path |
| 3 | Add policy coverage gate for runtime-evidence fields | High | Medium | Schema-shaped non-enforcement | Prevents unscored declarations from becoming fake authority |
| 4 | Expand credential scan scope | Medium | Low | Secret leakage | The output path for this audit is outside current scan roots |
| 5 | Add tool spec completeness schema | High | Medium | Implicit adapter authority | Needed before future runtime launchers or project adapters |
| 6 | Add manual case-promotion schema | Medium | Medium | Unsafe source mining | Lets real cases enter safely without automation |
| 7 | Add MCP environment provenance fixture | Medium | Medium | Hidden environment drift | Captures a recurring real blocker as deterministic evidence |
| 8 | Add goal lifecycle scorer | Medium | Medium | False completion | Directly targets Jamie's delivery-truth risk |
| 9 | Add CLI JSON output schema/test | Medium | Low | API drift | Cheap compatibility guard for agent consumers |
| 10 | Add compaction parity fixture family | Medium | Medium | Lost evidence after compaction | Important for long workflows, but should follow coverage/state fixes |

## 9. Implementation Advice

What to build first:

- Build the smallest P0 trust-boundary patch: state/check alignment, subagent artifact identity matching, and scorer coverage reporting.

What not to build yet:

- Do not build dashboards, source-mining automation, cloud runners, external adapters, packaged runtime launchers, plugin systems, or required LLM judge gates yet. The repo explicitly blocks that phase.

What to remove:

- Remove or mark unscored optional policy blocks from passing runtime-evidence fixtures unless they are covered by a scorer or explicit scaffold metadata.

What to simplify:

- Keep runtime-evidence scoring table-driven. Do not introduce a general policy engine until multiple policy families prove stable variation.

What should become a validator:

- Runtime-evidence policy coverage.
- Tool spec completeness.
- Manual case-promotion candidate privacy/provenance.
- Runtime state/check alignment.
- Credential scan root expectations.

What should become a schema:

- Tool spec contract.
- Case promotion candidate.
- CLI JSON output response if treated as public.
- Runtime evidence policy revision metadata.

What should become a skill:

- Only after repeated use: a repo-local workflow for turning an approved audit gap into a deep module fix packet. Start as docs/schema first.

What should become documentation:

- JSON Schema local subset semantics.
- Explicit credential scan scope.
- Deferred adapter/launcher boundary and the ADR condition required to open it.

What should become CI:

- Existing pnpm verify should remain the CI gate.
- Add checks to pnpm verify only after the local command is deterministic and covered by tests.

What should remain manual:

- Real session case promotion privacy approval.
- Phase-opening decisions for packaged runtime launcher, project adapters, dashboards, source mining, and LLM triage.

## 10. Final Recommendation

Immediate next action:

Patch GAP-001 through GAP-003 as one tightly scoped trust-boundary slice: make state include runtime-evidence validation health, require artifact path/type for subagent artifact closure, and fail or explicitly mark runtime-evidence policy blocks that have no scorer.

Safest first patch:

Start with GAP-003. It is the smallest code path, has clear negative tests, and directly protects artifact-first multi-agent scoring.

Highest-risk missing system:

The missing runtime-evidence coverage gate. Without it, schemas and fixtures can continue to accumulate authoritative-looking fields that do not affect verdicts.

Best validation command to add first:

Keep pnpm evals check --json as the contract gate, but make it emit or validate runtime-evidence policy coverage. Then make pnpm evals state --json reflect that same health.

Ready for broader Codex autonomy:

Not yet. The repo is ready for narrow, offline, deterministic runtime-evidence hardening. It is not ready for broader Codex autonomy, source mining, packaged runtime launching, project adapters, or dashboard work until runtime-evidence coverage, state/check alignment, tool specs, and privacy-safe case promotion are enforced.
