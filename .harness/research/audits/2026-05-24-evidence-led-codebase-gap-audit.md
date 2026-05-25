# Evidence-Led Codebase Gap Audit

Date: 2026-05-24

Target codebase: `/Users/jamiecraik/dev/evals`

Evidence documents:

- `/Users/jamiecraik/dev/codex/.harness/research/deep/2026-05-24-codex-agent-hook-operational-review.md`
- `/Users/jamiecraik/dev/codex/.harness/research/deep/2026-05-24-codex-evals-native-integration-review.md`

Reviewer artifacts:

- `.harness/research/audits/reviewers/2026-05-24-agent-native-reviewer.md`
- `.harness/research/audits/reviewers/2026-05-24-api-contract-reviewer.md`
- `.harness/research/audits/reviewers/2026-05-24-adversarial-reviewer.md`

Artifact verification:

- Requested reviewers: agent-native-reviewer, api-contract-reviewer, adversarial-reviewer.
- Completed reviewers: 3.
- Initial artifact verification: agent-native artifact present; api-contract and adversarial artifacts missing.
- Retry: one artifact-only retry requested for api-contract and adversarial.
- Final artifact verification: all 3 reviewer artifacts present and non-empty.
- Agents closed after consumption: yes.

## 1. Executive Summary

Overall maturity grade: C+.

The repository has a real phase-one executable proof spine: a deterministic CLI, JSON schemas, local artifact bundles, latest-pointer verification, trace timeline validation, runtime-state output, credential scanning, and a CI gate through `pnpm verify`. That foundation is stronger than a documentation-only evals repo.

The gap is that the current implementation is still a local synthetic runner and artifact validator, not yet the domain-neutral shared proof spine described in the evidence and target architecture. It cannot run repo-local suites outside this repo, cannot ingest native Codex thread/turn/tool/hook/goal evidence, cannot verify final claims against evidence packets, and cannot issue a fresh runtime card that includes git, PR, goal, permission, MCP, and external-state freshness. Several future-facing concepts exist in docs or schemas, but are scaffolded rather than enforced.

Top 5 gaps:

1. Cross-repo suite execution is missing. `src/cli.js` only exposes `run <case-file>`, `src/lib/case-contract.js` rejects paths outside this repo through `insideRepo`, and `src/commands/run.js` always writes artifacts under this repo's `.harness/evals/runs`.
2. Codex-native runtime evidence ingestion is missing. Runtime evidence exists as synthetic fixture validation in `src/lib/runtime-evidence-contract.js`, not as a Codex thread/turn/trace/tool/hook/goal evidence packet consumer.
3. Claim-vs-evidence verification is not first-class. The repo validates artifacts well, but it does not parse or grade completion/readiness claims against command output, CI, PR/review state, goal state, runtime cards, or external freshness.
4. Runtime state is local-artifact state, not a full runtime card. `src/lib/runtime-state.js` reports readiness around latest artifacts and runtime-evidence fixture health, but not branch/head/dirty state, session/turn/trace IDs, permission state, MCP health, PR/review/CI freshness, or expiration.
5. `pnpm evals check --json` can validate the smoke fixture and a non-smoke latest bundle independently. The adversarial review found `src/commands/validation.js` does not bind `latest.json` to the canonical smoke case before returning pass.

Top 5 risks:

1. False success: a user or agent can treat local artifact validation as proof of broader Codex runtime truth.
2. Stale state: `latest.json` can be valid but not the evidence for the intended case or external state.
3. Consumer drift: adding cross-repo suite support without a versioned suite/runtime-packet contract could create implicit breaking changes.
4. Concurrency corruption: two runs started in the same second for identical case content can compute the same `run_id` and interleave artifact writes.
5. Governance drift: parent/child loop rules, closure evidence, and future domain boundaries are documented, but not fully machine-gated.

Strongest existing foundations:

- Artifact bundle integrity: `src/lib/latest-run.js` validates required bundle files, schema conformance, metadata consistency, manifest hashes, and trace linkage.
- Deterministic state packet: `src/lib/runtime-state.js` gives agents a structured status, reason codes, and recommended next commands.
- Fail-closed schema subset: `src/lib/schema.js` rejects unsupported schema keywords and malformed JSON instead of silently accepting them.
- Trace timeline validation: `src/lib/trace-events.js` enforces event ordering, status vocabulary, artifact path safety, and validation-result presence.
- CI gate: `.github/workflows/ci.yml` runs `pnpm verify`, and `.harness/ci-required-checks.json` maps the required check to that command.

Highest-leverage next fixes:

1. Fix the local trust holes first: unique run IDs with exclusive artifact writes, and bind `check` to the smoke-produced latest run.
2. Add a minimal `suite.schema.json` and run path for repo-local suites without adding a plugin registry.
3. Add a versioned runtime evidence packet schema and a narrow importer/validator for Codex-produced evidence files.
4. Add a claim/evidence schema and one deterministic false-success scorer.
5. Extend runtime state into a runtime card with freshness and authority fields, starting with local git/artifact freshness before external APIs.

## 2. Overall Gradecard

| Area | Grade | Confidence | Current Status | Main Gap | Recommended Fix |
|---|---:|---:|---|---|---|
| Repository as Control Plane | B- | High | Rich docs, plans, glossary, CI gate, artifact contracts, closure rules | Some control-plane rules are prose-only or not checked by `pnpm verify` | Add machine checks for closure evidence and suite/runtime packet compatibility |
| Runtime Truth and Decision Packets | C | High | `state --json` reports local latest-artifact readiness and runtime-evidence fixture health | No full runtime card with git, session, trace, goal, permission, MCP, PR/CI freshness | Introduce `runtime-card.schema.json` and freshness fields, local-first |
| Claim-vs-Evidence Verification | C- | High | Artifact and trace claims are strongly validated inside the bundle | No final/delivery claim parser or scorer; no external state reconciliation | Add `claim-evidence.schema.json` plus deterministic false-success fixtures |
| Mechanical Architecture Enforcement | C | Medium | Schema validation, credential scan, path safety, artifact hash validation, CI wrapper | No import graph/layer validation, suite adapter boundary tests, or architecture-drift scorer | Add a small native architecture contract test before external tools |
| Harness Runtime Loop | D+ | High | Synthetic runner creates deterministic command result and bundle | No real task loop, retry budget, recovery handler, stop reason, attempt tracking | Keep no real harness dependency; add runtime evidence packet and recovery-event schema first |
| Trace and Session Evidence | C+ | High | Eval-run trace timeline is enforced and schema-backed | No Codex session/tool/hook/subagent/goal replay ingestion | Add Codex trace packet schema and replay validator as a consumer input |
| Context Engineering | D | Medium | Docs define hot/cold boundaries and instruction surfaces | No context budget, retrieval boundary, stale context, or compression policy in runtime | Keep manual for now; later score context packets emitted by consumer repos |
| Skills and Workflow Density | D+ | Medium | Repo uses external skills for operating workflow; docs define workflow density principles | No local skill validator or skill-routing eval suite yet | Make skills a consumer repo suite, not core evals logic |
| Recovery and Failure Handling | C- | Medium | Validation failures classify missing/invalid/stale local artifacts and credential scan fallback | No auth, CI, branch, dependency, retry, or blind-retry classifier | Add recovery evidence schema only after runtime packet exists |
| Governance and Safety | B-/C+ | High | Phase-one hard blocks, credential scan, path safety, tracker override, CI gate | Approval gates, permission tiers, revocation, no-secret-in-prompt, closure truth are partial | Add governance fields to suite/runtime packet and enforce low-risk checks in CI |

## 3. Evidence-to-Code Mapping

| Evidence Pattern | Source File | Code Location | Runtime Status | Grade | Confidence |
|---|---|---|---|---:|---:|
| Proof chain: thread -> turn -> trace -> tool/hook/agent -> artifact -> validation -> external state -> claim | codex-agent-hook operational review lines 16-24 | `src/lib/trace-events.js`, `src/lib/latest-run.js` | partial | C | High |
| Runtime card with repo, cwd, branch, head_sha, dirty_state, session_id, turn_id, trace_id, goal_state, permissions | codex-agent-hook operational review lines 125-132 | `src/lib/runtime-state.js`, `schemas/runtime-state.schema.json` | partial | C | High |
| Stop-time claim-vs-evidence verifier | codex-agent-hook operational review lines 247-255 and 429-438 | No claim schema or stop verifier | missing | F | High |
| External freshness snapshot for PR/check/review/issue state | codex-agent-hook operational review lines 456-463 | No external-state packet; `state` is local-only | missing | F | High |
| Subagent artifact-first review outputs | codex-agent-hook operational review lines 152-158 | `schemas/runtime-evidence-case.schema.json`, `src/lib/runtime-evidence-contract.js` | partial | C | Medium |
| Runtime evidence packet with thread, turn, repo, branch, tool calls, hooks, permissions, goal, claims | codex-evals-native integration review lines 33-47 | `schemas/runtime-evidence-case.schema.json` is fixture-centric | scaffolded | D | High |
| Trace replay from rollout history | codex-evals-native integration review lines 49-63 | `src/lib/trace-events.js` validates local eval traces only | partial | C | High |
| Claim-vs-evidence verifier | codex-evals-native integration review lines 65-79 | No first-class verifier | missing | F | High |
| Tool-spec/schema fidelity gate | codex-evals-native integration review lines 97-111 | No tool-spec schema or tests | missing | F | Medium |
| Permission/sandbox provenance | codex-evals-native integration review lines 113-127 | Runtime evidence fixture scorer `permission-drift` exists | implemented_not_enforced | C | High |
| MCP env/read-only parallel provenance | codex-evals-native integration review lines 129-143 | Scaffold-only policy families for network/package provenance | scaffolded | D | Medium |
| Goal lifecycle evals | codex-evals-native integration review lines 145-159 | Goal provenance policy family exists as scaffold-only | scaffolded | D | Medium |
| Hook/subagent review-loop verification | codex-evals-native integration review lines 161-175 | `subagent-artifact-contract` scorer validates synthetic artifacts | partial | C | High |
| Project adapter contract | codex-evals-native integration review lines 689-701 | No adapter/suite schema yet | missing | F | High |
| Governance boundary registry | codex-evals-native integration review lines 721-733 | `.harness/references/local-reuse-map.md` documents boundaries | documented_only | D | Medium |
| Phase-one executable spine | `AGENTS.md`, `README.md`, executable spine spec | `src/cli.js`, `src/commands/run.js`, `src/lib/latest-run.js`, `scripts/verify.js` | implemented_enforced | B+ | High |
| Repo-local suites own domain truth | `.harness/core/2026-05-18-evals-core.md`, `.harness/specs/2026-05-18-evals-executable-spine-spec.md` | No `suite.schema.json`; path handling requires evals repo | contradicted | D | High |
| External frameworks are adapters, not roots | `.harness/core/2026-05-18-evals-core.md` | No external adapter framework present | implemented_enforced | A- | High |
| Latest artifact validation | `README.md` lines 124-140 | `src/lib/latest-run.js`, `test/cli.test.js` | implemented_enforced | A- | High |
| Runtime state packet | `UBIQUITOUS_LANGUAGE.md`, `schemas/runtime-state.schema.json` | `src/lib/runtime-state.js`, `src/commands/state.js` | implemented_enforced for local artifacts | B | High |
| `real` execution mode | `schemas/latest-run.schema.json`, tests allow `real` | `src/commands/run.js` only calls `syntheticExecution` | tested_but_unreachable | D | Medium |
| Parent/child loop guardrail | `AGENTS.md`, `.harness/refactors/2026-05-20-parent-child-loop-guardrail.md` | `test/workflow-guardrails.test.js` checks doc discoverability | documented_only | D+ | High |

## 4. Gap Register

### GAP-001: Cross-Repo Suite Contract Is Missing

**Category:** validation / architecture / governance

**Current State:** `pnpm evals run` accepts a single case path. `src/cli.js` documents `run <case-file>`; `src/lib/case-contract.js` parses only case files and rejects paths outside the evals repo through `insideRepo`; `src/commands/run.js` writes bundles to this repo's `.harness/evals/runs/<run-id>`.

**Expected State:** A neutral repo-local suite contract such as `repo/.evals/suite.json`, where evals owns runner/schema/artifact/scorer/baseline mechanics and the consumer repo owns domain fixtures, scorers, thresholds, privacy approval, and baseline promotion.

**Evidence Basis:** The core doctrine says repo-local suites own domain truth and external frameworks are adapters. The executable-spine spec separates evals-owned runner/schema/artifacts from consumer-owned suite intent and real fixtures. The user-supplied target architecture requires `evals owns the proof contract; consumer repos own the domain truth`.

**Code Evidence:**

- `src/cli.js`: usage exposes `run <case-file>`, not suite paths.
- `src/lib/case-contract.js`: `parseCase` uses `insideRepo`, blocking external repo-local suites.
- `src/commands/run.js`: `runDir` and `latest.json` are fixed under evals repo root.
- `src/lib/schema.js`: `schemaTargets` does not include `schemas/suite.schema.json`.

**Risk:** The repository cannot become the shared proof spine for `coding-harness`, `agent-skills`, or `diagram-cli/archscope` without either copying fixtures into evals or making evals absorb domain truth.

**Severity:** Critical

**Fix Grade:** P0

**Recommended Fix:** Add `schemas/suite.schema.json` and a minimal suite resolver. The first implementation should allow `pnpm evals run path/to/.evals/suite.json --json` where case/scorer/baseline paths are suite-relative and artifacts are written to the evaluated repo's `.harness/evals/runs`. Do not add a registry, plugin system, dashboard, or external adapter.

**Suggested Software / Method:** JSON Schema, Node path resolution, Vitest or `node --test`, repo-relative path normalization, temporary fixture repos in tests.

**Files Likely To Change:**

- `schemas/suite.schema.json`
- `src/cli.js`
- `src/commands/run.js`
- `src/lib/case-contract.js`
- `src/lib/paths.js`
- `src/lib/schema.js`
- `test/cli.test.js`

**Validation Command:** `pnpm test && pnpm evals run fixtures/smoke/pr-closeout.case.json --json && pnpm verify`

**Acceptance Criteria:**

- A suite file outside this repo can be run.
- The resulting `latest.json` is written under the evaluated repo, not evals.
- Existing smoke case execution remains backward-compatible.
- Suite paths cannot escape the owning suite root.
- `pnpm verify` still passes.

### GAP-002: Native Codex Runtime Evidence Packet Is Missing

**Category:** runtime / traceability / validation

**Current State:** Runtime evidence is represented by local synthetic fixture files under `fixtures/runtime-evidence` and validated by `src/lib/runtime-evidence-contract.js`. The implemented scorer families cover permission drift, subagent artifact contract, and plugin attribution. Goal/thread/network/package provenance are scaffold-only.

**Expected State:** A versioned Codex runtime evidence packet that can represent thread, turn, repo, branch, head, dirty state, command/tool calls, hooks, subagents, artifacts, validation outcomes, permissions, MCP state, goal state, claims, and final status.

**Evidence Basis:** The Codex evals-native review says the first primitive should be a runtime evidence packet and lists the fields needed for Codex-native operation. The agent-hook operational review requires the proof chain from thread to claim.

**Code Evidence:**

- `schemas/runtime-evidence-case.schema.json`: fixture-centric runtime evidence case, not a Codex runtime packet.
- `src/lib/runtime-evidence-contract.js`: validates cases from `fixtures/runtime-evidence`, not live runtime exports.
- `src/lib/trace-events.js`: eval-run trace events, not Codex turn/tool/hook/session events.

**Risk:** Cross-repo operational claims still require manual translation into fixture-shaped evidence. Evals can validate a modeled runtime scenario, but not the actual Codex runtime truth that produced a claim.

**Severity:** Critical

**Fix Grade:** P0

**Recommended Fix:** Add `schemas/codex-runtime-evidence.schema.json` and a small validator/importer path. Keep it local-file based: Codex or consuming repos can export a packet, and evals validates/scores it deterministically. Do not introduce telemetry exporters as authority.

**Suggested Software / Method:** JSON Schema, JSONL for event lists, deterministic reducers, schema snapshot tests.

**Files Likely To Change:**

- `schemas/codex-runtime-evidence.schema.json`
- `schemas/codex-trace-event.schema.json`
- `src/lib/runtime-evidence-contract.js`
- `src/lib/schema.js`
- `fixtures/runtime-evidence/*.case.json`
- `test/cli.test.js`

**Validation Command:** `pnpm test && pnpm evals check --json && pnpm verify`

**Acceptance Criteria:**

- A fixture packet with thread/turn/tool/artifact/validation fields validates.
- Missing required artifact or validation evidence fails deterministically.
- Existing runtime-evidence fixtures still pass/fail as expected.
- The packet has an explicit `schema_version` and compatibility policy.

### GAP-003: Claim-vs-Evidence Verification Is Not First-Class

**Category:** verification / governance / traceability

**Current State:** The repo verifies artifact bundles, manifest hashes, trace event timelines, and latest pointers. It does not verify that a final claim such as `validation passed`, `ready to merge`, `goal complete`, or `artifact written` is backed by required evidence.

**Expected State:** Claims should be parsed into structured records and checked against evidence packets, artifacts, command outputs, validation results, runtime-card freshness, and external state snapshots. Missing evidence should fail as false-success risk.

**Evidence Basis:** Both evidence docs identify claim-vs-evidence as a top missing system. The Codex-native review recommends a claim/evidence verifier; the hook operational review says Stop should verify claims rather than just wording.

**Code Evidence:**

- `src/lib/latest-run.js`: verifies artifact consistency but not user/agent completion claims.
- `src/commands/state.js`: emits local status but no claim/evidence status fields.
- `src/lib/scoring.js`: scorers cover exit code, output, artifact completeness, and baseline presence only.

**Risk:** Agents can produce correct-looking final prose based on stale or absent evidence. The repo's strongest validation applies to generated artifacts, not to the claims humans and agents use for delivery decisions.

**Severity:** Critical

**Fix Grade:** P0

**Recommended Fix:** Add `schemas/claim-evidence.schema.json` and one built-in scorer: `false-success`. Start with claims about command validation and artifact existence. Expand later to PR/CI/Linear/goal claims after runtime-card freshness exists.

**Suggested Software / Method:** JSON Schema, deterministic scorer fixtures, jq-compatible JSON output.

**Files Likely To Change:**

- `schemas/claim-evidence.schema.json`
- `src/lib/scoring.js`
- `src/lib/runtime-evidence-contract.js`
- `fixtures/runtime-evidence/false-success-*.case.json`
- `test/cli.test.js`

**Validation Command:** `pnpm test && pnpm evals check --json`

**Acceptance Criteria:**

- A claim that validation passed without a validation artifact fails.
- A claim that an artifact exists without a manifest/hash ref fails.
- A supported claim with matching command/artifact evidence passes.
- JSON output includes explicit claim status and reason.

### GAP-004: Runtime State Packet Is Not a Full Runtime Card

**Category:** runtime / context / governance

**Current State:** `src/lib/runtime-state.js` reports whether latest local artifacts are ready, stale, missing, or invalid, and includes runtime-evidence fixture health. `schemas/runtime-state.schema.json` does not model branch/head/dirty state, session/turn/trace IDs, permission/MCP state, PR/CI/review freshness, or expiration.

**Expected State:** A runtime card should include local repository identity, git state, session and turn identifiers, trace ID, goal state, permission profile, MCP health, artifact refs, validation status, external state freshness, expiry, and safe next commands.

**Evidence Basis:** The agent-hook operational review describes runtime-state-first agents and lists runtime card fields. The Codex-native review recommends runtime cards as the side-panel/eval surface and operational state path.

**Code Evidence:**

- `src/lib/runtime-state.js`: local latest artifact and runtime-evidence status only.
- `schemas/runtime-state.schema.json`: status and recommendation fields, but no runtime identity/freshness model.

**Risk:** Agents can get a green local artifact state while branch, PR, review, permission, MCP, or goal state has changed.

**Severity:** High

**Fix Grade:** P1

**Recommended Fix:** Add `schemas/runtime-card.schema.json` or evolve runtime state v3 with optional runtime-card fields. Start local-only: cwd, repo root, branch, head_sha, dirty_state, latest_run_id, generated_at, expires_at, artifact freshness, and authority. Add external refs later as optional evidence packets.

**Suggested Software / Method:** JSON Schema, git CLI, deterministic freshness thresholds, node tests.

**Files Likely To Change:**

- `schemas/runtime-card.schema.json`
- `schemas/runtime-state.schema.json`
- `src/lib/runtime-state.js`
- `src/commands/state.js`
- `test/cli.test.js`

**Validation Command:** `pnpm test && pnpm evals state --json && pnpm verify`

**Acceptance Criteria:**

- `state --json` includes runtime-card identity and freshness fields.
- Dirty or changed head state is visible in machine-readable output.
- Existing status/recommendation fields remain backward-compatible.
- Stale cards have explicit reason codes.

### GAP-005: Smoke Check Is Not Bound to Smoke Latest Evidence

**Category:** validation / stale-state detection

**Current State:** `src/commands/validation.js` validates the smoke fixture file and then validates whatever `.harness/evals/runs/latest.json` points to. The adversarial reviewer found no assertion that the latest run came from the smoke fixture.

**Expected State:** `pnpm evals check --json` should prove the canonical smoke fixture is valid and that the latest validated artifact bundle was produced by that smoke lane, unless the command is explicitly checking another suite.

**Evidence Basis:** The evidence docs prioritize stale-state detection and false-success prevention. The repo's own canonical command makes smoke run output the acceptance surface.

**Code Evidence:**

- `src/commands/validation.js`: `checkCommand` validates `fixtures/smoke/pr-closeout.case.json` and local latest independently.
- `test/cli.test.js`: many latest-run corruption tests exist, but no test for non-smoke latest passing check.

**Risk:** A stale or unrelated latest bundle can make `check` report success even though the canonical smoke run is not the latest proof.

**Severity:** High

**Fix Grade:** P0

**Recommended Fix:** Assert `latest.case_id === "pr-closeout"` for the current canonical smoke check, or better, assert latest metadata matches the validated fixture's case ID and suite ID. When suite support lands, `check <suite>` should bind latest to that suite.

**Suggested Software / Method:** Node tests with temporary latest pointers, schema validation, deterministic check output.

**Files Likely To Change:**

- `src/commands/validation.js`
- `test/cli.test.js`

**Validation Command:** `pnpm test && pnpm evals check --json && pnpm verify`

**Acceptance Criteria:**

- `check` fails when latest points at a different case.
- `check` passes after running the canonical smoke command.
- Failure output includes a stale/latest-mismatch reason.

### GAP-006: Run ID and Artifact Writes Are Not Concurrency-Safe

**Category:** runtime / traceability / validation

**Current State:** `src/commands/run.js` builds `runId` from second-resolution UTC time, case ID, and an 8-character input hash. Artifact files are written through plain `writeFileSync` calls. Two identical runs starting within the same second can target the same directory.

**Expected State:** Run IDs should be unique under concurrent execution, and artifact publication should avoid partial/interleaved bundle states.

**Evidence Basis:** The evidence docs emphasize artifact-first proof and stale/false-success avoidance. The adversarial review constructed a concrete collision scenario.

**Code Evidence:**

- `src/commands/run.js`: `runId` is created near run start from timestamp/case/hash.
- `src/lib/paths.js`: `utcBasic` strips to second-level resolution.
- `src/lib/json.js`: writes JSON directly.

**Risk:** Concurrent local/CI runs can corrupt artifact bundles or publish `latest.json` to a mixed run.

**Severity:** High

**Fix Grade:** P0

**Recommended Fix:** Add a collision-resistant suffix and create run directories with exclusive semantics. Write files through temp names and atomic rename where possible. Only publish `latest.json` after bundle validation succeeds.

**Suggested Software / Method:** Node `fs.mkdtempSync`, `fs.renameSync`, `fs.openSync` exclusive flags, concurrency tests.

**Files Likely To Change:**

- `src/commands/run.js`
- `src/lib/json.js`
- `src/lib/paths.js`
- `test/cli.test.js`

**Validation Command:** `pnpm test && pnpm verify`

**Acceptance Criteria:**

- Two simultaneous identical runs produce different run IDs.
- Both artifact bundles validate independently.
- `latest.json` never points at an incomplete bundle.

### GAP-007: Runtime Evidence Families Are Scaffolded But Not Enforced

**Category:** runtime / governance / traceability

**Current State:** `src/lib/runtime-evidence-contract.js` marks goal, thread, network, and package provenance as `scaffolded_not_enforced`. This is honest, but it means important Codex-native dimensions are not scored.

**Expected State:** The highest-risk provenance fields should graduate one at a time from scaffolded to enforced once evidence packets can carry them.

**Evidence Basis:** The Codex-native review identifies permission/sandbox, MCP/read-only, goal lifecycle, and orchestration as recommended primitives. The agent-hook review highlights goal state, permission state, and tool/hook evidence.

**Code Evidence:**

- `src/lib/runtime-evidence-contract.js`: `policyFamilies` has enforced and scaffolded families.
- `fixtures/runtime-evidence/approval-disabled-readonly-fallback.case.json`: explicitly demonstrates scaffolded families.

**Risk:** Important runtime failures are named but not rejected. Operators may overread scaffold labels as enforcement.

**Severity:** Medium

**Fix Grade:** P1

**Recommended Fix:** After GAP-002, enforce one family first. Best first candidate: goal/thread provenance, because it supports claim-vs-evidence and parent/child loop truth without external network APIs.

**Suggested Software / Method:** JSON Schema, deterministic reducer, fixture pairs for passing/failing provenance.

**Files Likely To Change:**

- `src/lib/runtime-evidence-contract.js`
- `schemas/runtime-evidence-case.schema.json`
- `fixtures/runtime-evidence/*.case.json`
- `test/cli.test.js`

**Validation Command:** `pnpm test && pnpm evals check --json`

**Acceptance Criteria:**

- Goal/thread provenance can fail when required but absent.
- Scaffolded families remain explicitly labeled until enforced.
- Runtime evidence output distinguishes scaffolded from enforced checks.

### GAP-008: Shared Scorer Interface Is Hard-Coded

**Category:** validation / architecture

**Current State:** `src/lib/scoring.js` hard-codes smoke scorers; `src/lib/runtime-evidence-contract.js` hard-codes runtime evidence scorers. `schemas/eval-case.schema.json` enumerates only four smoke scorer IDs.

**Expected State:** Evals should expose a small shared scorer interface and built-in scorer registry while allowing consumer repos to define domain-specific scorer descriptors later. This should not become a plugin system in phase one.

**Evidence Basis:** The target architecture requires shared scorers across repos while keeping domain-specific scorers local. Phase-one hard blocks prohibit plugin systems and runtime dependencies on consumer repos.

**Code Evidence:**

- `src/lib/scoring.js`: scorer functions are direct code paths.
- `schemas/eval-case.schema.json`: scorer ID enum is fixed to smoke scorers.
- No `schemas/scorer.schema.json` exists.

**Risk:** Cross-repo suite work will either fork scorer logic or force domain-specific scorer names into core schemas.

**Severity:** High

**Fix Grade:** P1

**Recommended Fix:** Add `schemas/scorer.schema.json` and a built-in scorer registry with stable metadata. Keep execution limited to built-in scorer functions until repeated consumer use proves a local scorer loading need.

**Suggested Software / Method:** JSON Schema, builtin registry map, snapshot tests for scorer IDs and verdict shapes.

**Files Likely To Change:**

- `schemas/scorer.schema.json`
- `schemas/eval-case.schema.json`
- `src/lib/scoring.js`
- `src/lib/runtime-evidence-contract.js`
- `test/schema.test.js`

**Validation Command:** `pnpm test && pnpm verify`

**Acceptance Criteria:**

- Built-in scorer descriptors validate against schema.
- Unknown scorer IDs fail closed with clear output.
- Existing smoke scorer behavior does not change.

### GAP-009: Closure Evidence Is Required By Policy But Not Fully Machine-Gated

**Category:** governance / validation

**Current State:** `AGENTS.md` requires `.harness/evals/evals-evals-executable-spine-eval.md` to exist and cite command output, artifacts, schemas, scorers, baseline status, drift, rollback, tracker state, and multiple classifications before completion can be claimed. `scripts/verify.js` does not check that file or its required fields.

**Expected State:** If closure evidence is a required operating surface, `pnpm verify` should enforce its existence and minimal required sections, or the requirement should be scoped to release/closeout claims only.

**Evidence Basis:** The repo's own closure evidence contract is stronger than the executable gate. The evidence docs emphasize claim-vs-evidence and closure truth.

**Code Evidence:**

- `AGENTS.md`: closure evidence requirement.
- `scripts/verify.js`: checks files, schemas, smoke runs, state, check, and credential scan, but not the closure evidence file.

**Risk:** A future agent can pass `pnpm verify` and claim closeout while missing the documented closure evidence packet.

**Severity:** Medium

**Fix Grade:** P1

**Recommended Fix:** Add a lightweight closure-evidence validator, or introduce a schema-backed `closure-evidence.json` emitted beside the markdown. Gate only the machine-readable minimum.

**Suggested Software / Method:** JSON Schema, markdown heading scanner, small Node validator.

**Files Likely To Change:**

- `scripts/verify.js`
- `schemas/closure-evidence.schema.json`
- `test/verify.test.js`

**Validation Command:** `pnpm verify`

**Acceptance Criteria:**

- Missing closure evidence is classified explicitly when closeout mode is required.
- Required closure fields are machine-checkable.
- Routine local smoke development is not blocked unnecessarily.

### GAP-010: Architecture Enforcement Is Mostly Schema and Path Safety

**Category:** architecture / validation

**Current State:** The repo enforces JSON schema compatibility, path safety, bundle consistency, and credential scanning. It does not enforce import-layer boundaries, module ownership, runner/schema/artifact separation, or architecture drift.

**Expected State:** The codebase should have mechanical checks for deep-module boundaries before cross-repo suite support expands the surface.

**Evidence Basis:** The deep module fix mechanics require owner module, public interface, hidden implementation rule, caller contract, seam test, tracer proof, rollback path, and validation gate before runtime/schema/artifact changes.

**Code Evidence:**

- `.harness/refactors/2026-05-20-deep-module-fix-mechanics.md`: required checklist.
- No dependency-cruiser, madge, ESLint architecture rule, or native import-boundary test exists.

**Risk:** Suite, artifact, scorer, and runtime evidence logic can spread across commands/tests/docs, making future fixes prompt-governed rather than mechanically enforced.

**Severity:** Medium

**Fix Grade:** P2

**Recommended Fix:** Add a small native architecture-boundary test first. For example: commands may call public lib modules, schemas are data-only, runtime evidence reducers live under `src/lib`, and tests cannot be production dependencies. Do not add heavy external tooling until native checks prove insufficient.

**Suggested Software / Method:** Node `fs` scanner, ts-morph later if needed, dependency-cruiser later if repo grows.

**Files Likely To Change:**

- `test/architecture.test.js`
- `.harness/refactors/2026-05-20-deep-module-fix-mechanics.md` if the rule needs documentation

**Validation Command:** `pnpm test && pnpm verify`

**Acceptance Criteria:**

- Import boundary drift fails tests.
- The rule names the owning module and remediation.
- No new runtime dependency is introduced.

### GAP-011: `real` Execution Mode Is Allowed But Unreachable

**Category:** runtime / validation

**Current State:** Schemas and tests accept `execution_mode: "real"`, but `src/commands/run.js` always uses `syntheticExecution`.

**Expected State:** Either `real` should remain explicitly future-scaffolded, or a real execution path should exist behind a deliberate interface. Given phase-one hard blocks, this should not turn into a general command runner yet.

**Evidence Basis:** The repo doctrine says build the executable spine first and avoid source-mining automation, cloud runners, plugin systems, and external dependencies. The target architecture wants consumer-owned fixtures rather than evals-owned domain execution.

**Code Evidence:**

- `src/commands/run.js`: calls `syntheticExecution`.
- `test/cli.test.js`: accepts `real` execution mode in latest schema.

**Risk:** A schema consumer may believe real command execution is supported when it is not.

**Severity:** Low

**Fix Grade:** P2

**Recommended Fix:** Document `real` as reserved/scaffolded in schema descriptions, or add output fields that classify `execution_mode` support level. Defer real execution until suite contracts prove a bounded command interface.

**Suggested Software / Method:** Schema descriptions, contract tests, explicit support-status enum.

**Files Likely To Change:**

- `schemas/latest-run.schema.json`
- `src/commands/run.js`
- `test/cli.test.js`

**Validation Command:** `pnpm test`

**Acceptance Criteria:**

- Consumers can distinguish implemented modes from reserved modes.
- No generic unsafe command execution is introduced.

### GAP-012: Smoke Fixture Artifact Expectations Omit Trace Events

**Category:** traceability / validation

**Current State:** The runner writes and validates `trace-events.jsonl`, and latest-run validation enforces trace consistency. The smoke fixture's declared `expected.required_artifacts` does not list trace events.

**Expected State:** The canonical smoke fixture should declare every closure-critical artifact it expects, including trace events.

**Evidence Basis:** The evidence docs prioritize replayable traces and artifact-first proof. The repo's closure model treats trace events as a required artifact.

**Code Evidence:**

- `fixtures/smoke/pr-closeout.case.json`: required artifacts list omits `trace-events.jsonl`.
- `src/lib/artifact-bundle.js`: bundle contract includes trace events.
- `src/lib/latest-run.js`: validates trace event references and hashes.

**Risk:** The fixture-level scorer understates the required bundle contract, even though later validation catches trace problems.

**Severity:** Low

**Fix Grade:** P2

**Recommended Fix:** Add trace events to the smoke fixture's required artifacts and assert scorer output includes it.

**Suggested Software / Method:** JSON fixture update, node test assertion.

**Files Likely To Change:**

- `fixtures/smoke/pr-closeout.case.json`
- `test/cli.test.js`

**Validation Command:** `pnpm test && pnpm evals run fixtures/smoke/pr-closeout.case.json --json`

**Acceptance Criteria:**

- Trace events are fixture-declared, written, hashed, and validated.
- Smoke scorer output still passes.

### GAP-013: Context Engineering Is Documented But Not Runtime-Enforced

**Category:** context / skills / governance

**Current State:** The repo has strong operating docs and a ubiquitous language file. It does not enforce hot/cold context separation, prompt/context budgets, stale context detection, or retrieval boundaries in runtime evidence.

**Expected State:** Context engineering should be evaluated as consumer-owned evidence packets rather than embedded prompt policy in evals.

**Evidence Basis:** The evidence docs emphasize runtime truth over prose and recommend runtime cards, task envelopes, and evidence packets. The target architecture says evals owns proof contracts while consumer repos own domain truth.

**Code Evidence:**

- No context packet schema exists.
- No context scorer exists.
- `test/workflow-guardrails.test.js` checks doc discoverability rather than runtime context behavior.

**Risk:** Agents may depend on stale or overlarge prompt context with no deterministic failure signal.

**Severity:** Medium

**Fix Grade:** P3

**Recommended Fix:** Do not build this before runtime evidence and suite contracts. Later, add optional context evidence fields to the Codex runtime packet and score stale_context / missing_source_refs.

**Suggested Software / Method:** Runtime evidence packet fields, JSONL source reference lists, deterministic stale-source checks.

**Files Likely To Change:**

- `schemas/codex-runtime-evidence.schema.json`
- `src/lib/runtime-evidence-contract.js`
- `fixtures/runtime-evidence/context-*.case.json`

**Validation Command:** `pnpm test && pnpm evals check --json`

**Acceptance Criteria:**

- Context checks run only when context evidence is present or required.
- Missing source refs can fail deterministically.
- Prompt prose is not the enforcement mechanism.

### GAP-014: Recovery Handling Is Mostly Absent

**Category:** recovery / runtime

**Current State:** The repo classifies validation failures, missing/invalid/stale local artifacts, credential scan fallback, and runtime-evidence fixture failures. It does not model recovery handlers, retry budgets, auth/session recovery, CI failure handling, branch recovery, or blind-retry prevention.

**Expected State:** Runtime evidence should include recovery events, attempt counts, stop reasons, and retry classifications so evals can distinguish valid recovery from blind retry loops.

**Evidence Basis:** The evidence docs list recovery handling and blocker classes as missing systems. The target audit categories require retry budgets, recovery handlers, verifier ownership, and stop reasons.

**Code Evidence:**

- `src/commands/run.js`: synthetic one-shot execution only.
- `schemas/runtime-evidence-case.schema.json`: observed events do not include recovery-specific event types.
- No retry budget or stop-reason schema exists.

**Risk:** Future consumer repos can claim recovery behavior without deterministic proof.

**Severity:** Medium

**Fix Grade:** P2

**Recommended Fix:** Add recovery event fields to the runtime evidence packet after GAP-002. Start with attempt count, stop reason, blocker class, and verifier owner. Do not build a recovery engine in evals.

**Suggested Software / Method:** JSON Schema, deterministic replay reducer, fixture pairs.

**Files Likely To Change:**

- `schemas/codex-runtime-evidence.schema.json`
- `src/lib/runtime-evidence-contract.js`
- `fixtures/runtime-evidence/recovery-*.case.json`

**Validation Command:** `pnpm test && pnpm evals check --json`

**Acceptance Criteria:**

- Missing stop reason fails when recovery attempts are present.
- Attempt count over budget fails.
- Recovery classifier output is machine-readable.

### GAP-015: Governance Boundary Registry Is Documented Only

**Category:** governance / architecture

**Current State:** `.harness/references/local-reuse-map.md` documents that evals may reuse concepts from `coding-harness` and `agent-skills` but must not take runtime dependencies or own domain truth. No suite or adapter schema enforces that boundary.

**Expected State:** Cross-repo suites should make ownership explicit: owner repo, domain, privacy policy, allowed network, baseline ownership, scorer ownership, and artifact destination.

**Evidence Basis:** The Codex-native review recommends governance boundary registry and project adapter contract. The target architecture says consumer repos own domain truth.

**Code Evidence:**

- `.harness/references/local-reuse-map.md`: docs-only reuse boundaries.
- No `suite.schema.json`, `adapter.schema.json`, or ownership validation exists.

**Risk:** Cross-repo expansion can turn evals into a dependency magnet or hidden lifecycle authority.

**Severity:** High

**Fix Grade:** P1

**Recommended Fix:** Put ownership fields into `suite.schema.json` before adding separate registry concepts. Required fields should include `suite_id`, `owner_repo`, `domain`, `purpose`, `cases`, `scorers`, `baseline`, and `artifact_policy`.

**Suggested Software / Method:** JSON Schema, suite fixture, validation tests.

**Files Likely To Change:**

- `schemas/suite.schema.json`
- `test/schema.test.js`
- `fixtures/suites/*.suite.json` if local examples are added

**Validation Command:** `pnpm test && pnpm verify`

**Acceptance Criteria:**

- Suite validation fails without owner/domain/artifact policy.
- Artifact policy cannot silently enable network.
- Consumer-owned fields are present but not interpreted as evals-owned truth.

## 5. Contradictions

### CONTRADICTION-001: Repo-Local Suites Are Doctrine, But Paths Are Evals-Repo-Only

- Claim: Repo-local suites own domain truth, and evals should provide shared runner/schema/artifact mechanics.
- Actual implementation: `parseCase` and validation path handling require files inside `/Users/jamiecraik/dev/evals`; runner artifacts are written into evals.
- Evidence: `.harness/core/2026-05-18-evals-core.md`, `.harness/specs/2026-05-18-evals-executable-spine-spec.md`, `src/lib/case-contract.js`, `src/commands/run.js`.
- Severity: Critical.
- Operational impact: Consumer repos cannot keep local suites without bespoke copying or evals absorbing domain truth.
- Recommended fix: Implement `suite.schema.json` and suite-root path resolution.

### CONTRADICTION-002: `check` Is The CI Gate, But It Does Not Prove Latest Is Smoke

- Claim: `pnpm evals check --json` validates the smoke fixture and latest artifact state.
- Actual implementation: The smoke fixture file and latest pointer are validated independently.
- Evidence: `src/commands/validation.js`; adversarial reviewer artifact.
- Severity: High.
- Operational impact: A non-smoke latest bundle can satisfy the latest validation half of the check.
- Recommended fix: Bind latest provenance to canonical smoke case or checked suite.

### CONTRADICTION-003: Closure Evidence Is Mandatory, But `pnpm verify` Does Not Gate It

- Claim: Completion cannot be claimed unless `.harness/evals/evals-evals-executable-spine-eval.md` exists and cites required evidence.
- Actual implementation: `scripts/verify.js` does not validate that closure file or required fields.
- Evidence: `AGENTS.md`, `scripts/verify.js`.
- Severity: Medium.
- Operational impact: Local and CI gates can pass while closure evidence is missing or stale.
- Recommended fix: Add a closeout-mode closure evidence validator or schema-backed closure summary.

### CONTRADICTION-004: Runtime Evidence Is Codex-Native In Intent, But Synthetic In Execution

- Claim: Evals should become the Codex-native runtime evidence layer.
- Actual implementation: Runtime evidence is represented by synthetic fixture cases.
- Evidence: Codex evals-native integration review; `src/lib/runtime-evidence-contract.js`; `fixtures/runtime-evidence`.
- Severity: Critical.
- Operational impact: Actual thread/turn/tool/hook/goal truth is not ingested.
- Recommended fix: Add versioned Codex runtime evidence packet schema and importer.

### CONTRADICTION-005: `real` Execution Mode Is Schema-Accepted, But The Runner Is Synthetic

- Claim: Result schema can represent `execution_mode: "real"`.
- Actual implementation: The runner always calls `syntheticExecution`.
- Evidence: `src/commands/run.js`; latest-run schema tests.
- Severity: Low.
- Operational impact: Consumers may infer capability that is not implemented.
- Recommended fix: Mark `real` as reserved or add a bounded real execution interface after a design decision.

## 6. Missing Features

Runtime state:

- Full runtime card with git/session/turn/trace/goal/permission/MCP/external refs.
- Runtime card expiration and freshness tiers.
- Local git head and dirty-state evidence in `state --json`.

Command selection:

- Safe-next-command gate tied to runtime card status.
- Command recommendation that accounts for stale latest vs stale git state.
- Suite-specific `check <suite>` once suite support exists.

Verification:

- Claim-vs-evidence schema.
- False-success scorer.
- Latest-to-checked-case binding.
- Closure evidence machine check.

Validation:

- `suite.schema.json`.
- `scorer.schema.json`.
- `codex-runtime-evidence.schema.json`.
- `runtime-card.schema.json`.
- Schema evolution compatibility tests.

Architecture enforcement:

- Import/layer boundary test.
- Deep-module ownership tests for runner, artifact bundle, runtime evidence, and validation.
- Suite boundary ownership checks.

Traces:

- Codex session/turn/tool/hook trace event schema.
- Replayable command output records from external runtime packets.
- Recovery event and stop-reason events.

Context:

- Context source-reference packet.
- Hot/cold context separation evidence.
- Stale context scorer.

Skills:

- Skill suite as consumer-owned `agent-skills/.evals`, not core evals logic.
- Skill routing/failure/handoff scorers as domain-local descriptors.

Recovery:

- Retry budget evidence.
- Stop reason classification.
- Recovery handler outcome schema.
- Blind retry prevention scorer.

Governance:

- Suite ownership and artifact policy fields.
- Permission profile and approval provenance in runtime packets.
- Revocation/manual override fields.
- No-secret-in-prompt evidence scorer.

CI/CD:

- Check/latest provenance test.
- Concurrent run ID test.
- Closure evidence validator if closeout mode is active.
- Schema compatibility guard.

Observability:

- JSONL evidence packet acceptance.
- Trace replay reducer.
- Telemetry remains explanatory, not authoritative.

## 7. Fix Roadmap

### Phase 1 - Critical Trust Boundary Fixes

Objective: Reduce false-success, stale-state, unsafe-command, and missing-evidence risk before expanding the repo across consumers.

Fixes included:

- GAP-005: Bind `check` to smoke-produced latest evidence.
- GAP-006: Make run IDs concurrency-safe and artifact publication atomic enough for local/CI use.
- GAP-003: Add first claim/evidence schema and false-success scorer.
- GAP-009: Decide and gate the minimum closure evidence contract.

Files likely affected:

- `src/commands/validation.js`
- `src/commands/run.js`
- `src/lib/json.js`
- `src/lib/paths.js`
- `src/lib/scoring.js`
- `schemas/claim-evidence.schema.json`
- `test/cli.test.js`
- `test/verify.test.js`

Validation gates:

- `pnpm test`
- `pnpm evals run fixtures/smoke/pr-closeout.case.json --json`
- `pnpm evals check --json`
- `pnpm verify`

Expected risk reduction:

- Prevents obvious stale latest false greens.
- Prevents same-second artifact collision.
- Creates the first deterministic bridge from claim to proof.

### Phase 2 - Mechanical Enforcement

Objective: Add schemas and native checks that make the cross-repo contract explicit without adding plugins or external orchestration.

Fixes included:

- GAP-001: Minimal suite contract.
- GAP-008: Built-in scorer interface/registry.
- GAP-010: Native architecture-boundary test.
- GAP-015: Suite ownership/governance fields.

Files likely affected:

- `schemas/suite.schema.json`
- `schemas/scorer.schema.json`
- `src/cli.js`
- `src/commands/run.js`
- `src/lib/case-contract.js`
- `src/lib/schema.js`
- `test/schema.test.js`
- `test/architecture.test.js`

Validation gates:

- `pnpm test`
- `pnpm verify`
- Temporary consumer repo fixture proving suite-relative execution and artifact output.

Expected risk reduction:

- Keeps evals domain-neutral.
- Prevents consumer domain truth from entering core evals.
- Makes cross-repo usage runnable without a registry.

### Phase 3 - Runtime Harness Maturity

Objective: Accept and score real runtime evidence packets while keeping evals as proof contract, not runtime authority.

Fixes included:

- GAP-002: Codex runtime evidence packet schema/importer.
- GAP-004: Runtime card fields and freshness.
- GAP-007: Enforce goal/thread provenance.
- GAP-014: Recovery event and retry/stop classification.

Files likely affected:

- `schemas/codex-runtime-evidence.schema.json`
- `schemas/codex-trace-event.schema.json`
- `schemas/runtime-card.schema.json`
- `src/lib/runtime-state.js`
- `src/lib/runtime-evidence-contract.js`
- `fixtures/runtime-evidence/*.case.json`

Validation gates:

- `pnpm test`
- `pnpm evals state --json`
- `pnpm evals check --json`
- `pnpm verify`

Expected risk reduction:

- Turns Codex-native operation from prose aspiration into a local deterministic packet.
- Gives agents stale-state and recovery proof surfaces.

### Phase 4 - Context and Skill Compression

Objective: Score context and skill workflow evidence without making evals a skill repository.

Fixes included:

- GAP-013: Context evidence fields and stale context scorer.
- Consumer-owned `agent-skills/.evals` suite contract.
- Skill routing/failure/handoff scorer descriptors as suite-local evidence.

Files likely affected:

- `schemas/codex-runtime-evidence.schema.json`
- `schemas/suite.schema.json`
- Consumer repo `.evals` fixtures and scorer descriptors.

Validation gates:

- `pnpm test`
- `pnpm evals run path/to/agent-skills/.evals/suite.json --json`

Expected risk reduction:

- Weak skill outputs fail deterministically.
- Hot-path prompt rules stop carrying enforcement burden.

### Phase 5 - Governance and Scaling

Objective: Add permission, approval, audit, and maintenance proof surfaces only after runtime and suite contracts are stable.

Fixes included:

- Permission/approval provenance enforcement.
- No-secret-in-prompt evidence scorer.
- Governance boundary registry only if suite ownership fields prove insufficient.
- Retention/pruning policy for run artifacts.

Files likely affected:

- `schemas/codex-runtime-evidence.schema.json`
- `schemas/suite.schema.json`
- `src/lib/runtime-evidence-contract.js`
- `scripts/verify.js`

Validation gates:

- `pnpm test`
- `pnpm verify`
- Credential scan with redacted failure output.

Expected risk reduction:

- Reduces permission and privacy failures.
- Prevents artifact sprawl from undermining verification.

## 8. Highest-Leverage Fixes

| Rank | Fix | Impact | Difficulty | Risk Reduced | Why First |
|---:|---|---:|---:|---|---|
| 1 | Bind `check` latest to smoke case | High | Low | False green / stale latest | Small patch, direct CI trust improvement |
| 2 | Make run IDs concurrency-safe | High | Medium | Artifact corruption | Protects the proof spine itself |
| 3 | Add `suite.schema.json` | High | Medium | Domain-boundary drift | Unlocks cross-repo suites without registry complexity |
| 4 | Add suite-relative artifact destination | High | Medium | Evals absorbing domain truth | Makes consumer-local artifacts real |
| 5 | Add `claim-evidence.schema.json` and false-success scorer | High | Medium | Completion overclaim | Directly addresses top evidence gap |
| 6 | Add runtime evidence packet schema | High | Medium | Manual translation / non-native proof | Foundation for Codex-native operation |
| 7 | Extend `state --json` into runtime card v1 | High | Medium | Stale branch/head/artifact decisions | Gives agents a real decision packet |
| 8 | Add scorer descriptor schema and built-in registry | Medium | Medium | Scorer sprawl / domain leakage | Keeps shared vs local scorer boundary clean |
| 9 | Add native architecture-boundary test | Medium | Low | Deep-module drift | Cheap mechanical enforcement before growth |
| 10 | Add closure evidence machine gate | Medium | Low/Medium | Prose-only closeout | Aligns documented completion contract with CI |

## 9. Implementation Advice

What to build first:

- Patch `check` provenance and run ID uniqueness before expanding architecture. These are trust-boundary bugs in the current proof spine.
- Add `suite.schema.json` with ownership/artifact policy fields next. Keep it minimal.
- Add `claim-evidence.schema.json` and one false-success scorer after suite pathing is settled.

What not to build yet:

- No dashboards.
- No plugin system.
- No external adapters as roots.
- No telemetry exporter as authority.
- No required LLM judge gates.
- No generic real command runner until suite contracts specify safe command ownership.

What to remove or simplify:

- Do not remove current smoke or runtime evidence fixtures; they are useful.
- Avoid adding separate adapter registry until suite ownership fields are insufficient.
- Avoid duplicating domain scorer logic in evals for `coding-harness`, `agent-skills`, or `diagram-cli`.

What should become a validator:

- Latest-to-checked-case provenance.
- Closure evidence minimum fields.
- Suite ownership/artifact policy.
- Schema evolution compatibility.
- Runtime card freshness.
- Claim/evidence false-success.

What should become a schema:

- `suite.schema.json`
- `scorer.schema.json`
- `claim-evidence.schema.json`
- `codex-runtime-evidence.schema.json`
- `codex-trace-event.schema.json`
- `runtime-card.schema.json`
- `closure-evidence.schema.json`

What should become a skill:

- The audit workflow itself can remain an external skill; do not move it into evals core.
- Consumer-specific suite authoring guidance may become repo-local skills in consumer repos.

What should become documentation:

- Compatibility policy for schemas and JSON output packets.
- Cross-repo suite ownership rules.
- Reserved vs implemented execution modes.
- Retention policy for run artifacts.

What should become CI:

- `pnpm verify` should keep running canonical deterministic gates.
- Add tests for check provenance, concurrent run IDs, suite schema, and schema compatibility.
- Consider closeout-mode closure evidence validation if completion claims depend on it.

What should remain manual:

- Baseline promotion decisions.
- Privacy approval for real consumer fixtures.
- Whether to add a new consumer suite family.
- Decisions that change public CLI/schema contracts.

## 10. Final Recommendation

Immediate next action:

- Make the current proof spine trustworthy before expanding it: patch `pnpm evals check --json` so latest evidence must match the canonical smoke case, and patch run IDs/artifact writes so concurrent runs cannot collide.

Safest first patch:

- Update `src/commands/validation.js` and `test/cli.test.js` so `check` fails when `latest.json` points to a non-smoke case. This is narrow, deterministic, and directly reduces false-success risk.

Highest-risk missing system:

- Claim-vs-evidence verification. Without it, evals can validate artifact bundles while agents still make delivery claims that are stale, unproven, or externally false.

Best validation command to add first:

- A regression test inside `pnpm test` for stale/latest mismatch, followed by the existing `pnpm verify` gate.

Broader Codex autonomy readiness:

- Not yet. The project is ready for local deterministic proof workflows, but not for broader Codex autonomy across `coding-harness`, `agent-skills`, and `diagram-cli/archscope` until suite contracts, runtime evidence packets, runtime cards, and claim-vs-evidence verification are implemented and enforced.

