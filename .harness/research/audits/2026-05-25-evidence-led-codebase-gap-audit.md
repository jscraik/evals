# Evidence-Led Codebase Gap Audit

Date: 2026-05-25
Target codebase: /Users/jamiecraik/dev/evals
Evidence input: .harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md
Output: .harness/research/audits/2026-05-25-evidence-led-codebase-gap-audit.md
Review model: coordinator audit plus agent-native, API-contract, and adversarial subagent artifacts
Status: audit complete, fixes not yet implemented

## 1. Executive Summary

Overall maturity grade: B-

Confidence: 82%

The project has a much stronger phase-one executable spine than a typical early eval harness. The core local proof loop is real: there is a thin CLI, deterministic run/check/state/verify commands, JSON schemas for primary artifacts, artifact manifests with hashes, trace-event validation, latest pointer validation, repo-local suite loading, runtime state packets, runtime evidence packets, and a CI workflow that runs pnpm verify.

The audit does not support a higher grade because several critical trust surfaces are still either partially enforced, enforced only after mutation, or documented without a mechanical guard. The strongest concern is the adversarial false-success path: scripts/verify.js runs smoke commands that rewrite .harness/evals/runs/latest.json before it runs pnpm evals check --json. That means a previously corrupt latest pointer can be overwritten by fresh smoke evidence before the aggregate gate validates it.

Top 5 gaps:

1. GAP-001: pnpm verify validates latest after smoke mutation, so preexisting latest corruption can be hidden.
2. GAP-002: pnpm evals check is hard-bound to the smoke fixture as expected context, which weakens non-smoke suite validation.
3. GAP-003: machine JSON outputs for validate/check have no published schema contract.
4. GAP-004: architecture boundaries are documented but not mechanically enforced by tests or CI.
5. GAP-005: source-location and duplicate-key diagnostics are missing from the JSON reader, so malformed or ambiguous inputs are hard to triage.

Top 5 risks:

1. False-success closeout: CI or local verify can pass after replacing evidence that should have failed first.
2. Spec/implementation drift: architecture invariants and future slice placement rules can drift because there is no import/layer validator.
3. Contract drift: downstream consumers of --json output have no schema-backed compatibility target.
4. Overstated readiness: runtime evidence packets expose dirty git state and scaffolded policy families but do not always gate readiness on them.
5. Weak failure replay: failures are structured, but not yet packaged as replay capsules with input, command, artifact, and recovery evidence.

Strongest existing foundations:

1. src/cli.js is thin and delegates to command modules.
2. src/commands/run.js creates artifact bundles, manifests, scorer results, trace events, reports, baselines, and latest pointers.
3. src/lib/latest-run.js validates latest proof context, artifact existence, schema checks, manifest consistency, hashes, baseline consistency, and trace timeline.
4. src/lib/trace-events.js enforces event order, vocabulary, identity, repo-relative artifact paths, and validation result semantics.
5. scripts/verify.js is the repo-native aggregate gate and is wired into .github/workflows/ci.yml through pnpm verify.
6. src/lib/suite-contract.js enforces repo-local suite roots, artifact root containment, fail-closed network policy, and data-only scorer references.
7. src/lib/runtime-state.js and src/lib/claim-evidence-contract.js provide current state and claim/evidence packet surfaces.

Highest-leverage next fixes:

1. Add a pre-mutation latest integrity gate to scripts/verify.js and test it.
2. Split check semantics into observed-latest validation and explicit smoke-context validation.
3. Add schemas and schema tests for validate/check JSON output.
4. Add a dependency-free architecture boundary validator or node:test structural test.
5. Add path-aware JSON diagnostics and duplicate-key rejection to src/lib/json.js.

## 2. Overall Gradecard

| Area | Grade | Confidence | Current Status | Main Gap | Recommended Fix |
|---|---:|---:|---|---|---|
| Repository as Control Plane | B | 86% | ADRs, specs, core doctrine, AGENTS, schemas, CI config, state/eval artifacts, and research audits exist. ARCHITECTURE.md exists in the working tree but is currently untracked. | Architecture/source-of-truth currentness is not mechanically verified. | Commit ARCHITECTURE.md when approved and add a source-of-truth/currentness check to pnpm verify. |
| Runtime Truth and Decision Packets | B | 84% | runtime-state and runtime-evidence packets exist and are reachable through pnpm evals state --json. | Readiness can overstate closure safety when git is dirty or policy families are scaffolded. | Add strict readiness gating for closure contexts and tests for dirty/scaffolded states. |
| Claim-vs-Evidence Verification | C+ | 82% | Local artifact, manifest, hash, trace, schema, and baseline evidence are strongly checked. | External PR/Linear truth is not verified by runtime and latest can be overwritten before aggregate validation. | Keep external truth manual in phase one, but fix verify ordering and include explicit blocker classifications. |
| Mechanical Architecture Enforcement | C | 80% | Schemas and artifact contracts are enforced; architecture guidance is documented. | Import/layer/deep-module boundaries are not rejected by CI. | Add architecture-boundary tests or a validator script with no new dependency. |
| Harness Runtime Loop | C+ | 78% | Run/check/state/validate/verify form a deterministic local loop. | Attempt tracking, retry budgets, and recovery handlers are not first-class runtime mechanics. | Add failure replay capsules and retry classification after latest/check trust boundary is fixed. |
| Trace and Session Evidence | B | 84% | Trace event JSONL is schema-backed and latest validation enforces timeline invariants. | Trace evidence is per run, not a broader replay/session evidence model. | Add failure replay capsule before broader session evidence. |
| Context Engineering | D+ | 70% | Context rules exist in AGENTS, core doctrine, and refactors. | Hot/cold context, stale context, and skill routing are mostly prose. | Add a small docs/currentness validator only after runtime trust gaps are fixed. |
| Skills and Workflow Density | C- | 68% | External skills guide operator workflow; repo has dense instructions. | Skills are not repo-native executable surfaces and are not validated as part of evals runtime. | Keep skills outside phase-one runtime authority; document only the command capability manifest if needed. |
| Recovery and Failure Handling | C | 77% | Structured failure emitter and recovery prose exist. | No deterministic failure replay capsule or blind retry prevention. | Add a failure capsule emitted on validation/run failure with command, input, artifact refs, and recovery action. |
| Governance and Safety | B- | 82% | Hard blocks, credential scan, repo-local suite policy, network fail-closed suite contract, and CI gate exist. | Approval tiers and destructive-action boundaries are mostly operator governance, not runtime-enforced. | Keep phase-one scope local; add enforcement only where runtime commands can create unsafe evidence. |

## 3. Evidence-to-Code Mapping

| Evidence Pattern | Source File | Code Location | Runtime Status | Grade | Confidence |
|---|---|---|---|---:|---:|
| Artifacts decide; telemetry explains only | .harness/core/2026-05-18-evals-core.md | src/commands/run.js, src/lib/latest-run.js, src/lib/trace-events.js | implemented_enforced | A- | 88% |
| Thin CLI and command ownership | ARCHITECTURE.md, AGENTS.md | src/cli.js, src/commands/run.js, src/commands/validation.js, src/commands/state.js | implemented_enforced | A- | 86% |
| Repo-local suite contract and fail-closed network policy | external mining audit OPP-004, suite slice | src/lib/suite-contract.js, schemas/suite.schema.json | implemented_enforced | A- | 84% |
| Latest proof context trust boundary | spec/plan and reviewer evidence | src/lib/latest-run.js, src/commands/run.js, src/commands/validation.js | partial | B- | 86% |
| Pre-mutation latest validation | adversarial reviewer | scripts/verify.js | missing | F | 95% |
| Check should validate actual latest evidence without forcing smoke overwrite | adversarial reviewer | src/commands/validation.js | partial | C | 88% |
| Machine output contracts should be schema-backed | API-contract reviewer | src/commands/validation.js, schemas | implemented_not_enforced | C | 75% |
| Source-location diagnostics similar to Semgrep-style feedback | external mining audit OPP-002 | src/lib/json.js, src/lib/schema.js | missing | D | 86% |
| Hypothesis-style suite health checks | external mining audit OPP-001 | src/lib/suite-contract.js, test/cli.test.js | partial | C | 82% |
| Architecture boundary enforcement | improve-codebase-architecture lens | ARCHITECTURE.md, src/**, scripts/verify.js | documented_only | D | 84% |
| Runtime state packet | UBIQUITOUS_LANGUAGE.md, AGENTS.md | src/lib/runtime-state.js, schemas/runtime-state.schema.json | implemented_enforced | B+ | 84% |
| Claim/evidence packet and missing-evidence scorer | JSC-372 slice evidence | src/lib/claim-evidence-contract.js, schemas/runtime-evidence-packet.schema.json | implemented_enforced | B+ | 83% |
| Dirty git state as closure blocker | agent-native reviewer | src/lib/claim-evidence-contract.js | implemented_not_enforced | C | 80% |
| Scaffolded policy families as readiness risk | agent-native reviewer | src/lib/runtime-evidence-contract.js, fixtures/runtime-evidence/*.json | partial | C | 78% |
| Failure replay capsules | external mining audit OPP-005 | src/lib/failures.js, artifacts | scaffolded | D+ | 75% |
| Macro-pattern ledger | external mining audit OPP-009 | no runtime owner | missing | F | 72% |
| External PR/Linear live truth | user operating model and AGENTS tracker rule | .harness/linear, local git state only | documented_only | D | 78% |
| Credential-shaped scan | AGENTS.md validation section | scripts/verify.js | implemented_enforced | B+ | 82% |

## 4. Gap Register

### GAP-001: Aggregate verify can self-heal latest before validating it

**Category:** validation / runtime / traceability

**Current State:** scripts/verify.js runs pnpm evals run fixtures/smoke/pr-closeout.case.json and pnpm evals run fixtures/smoke/pr-closeout.case.json --json before pnpm evals check --json. The run command rewrites .harness/evals/runs/latest.json.

**Expected State:** The aggregate gate should validate the preexisting latest pointer and artifact bundle before any command mutates latest. Smoke proof should be a second, separate post-mutation status.

**Evidence Basis:** Adversarial reviewer finding 1; artifact authority doctrine; latest proof context trust boundary.

**Code Evidence:** scripts/verify.js:66-80; src/commands/run.js:278-344; src/lib/latest-run.js:39-152.

**Risk:** Preexisting latest corruption, artifact hash drift, or stale false-success evidence can be overwritten by smoke output before validation sees it.

**Severity:** Critical

**Fix Grade:** P0

**Recommended Fix:** Add a pre-mutation latest health check to scripts/verify.js. If .harness/evals/runs/latest.json exists, run validateLatestRun directly before smoke commands and record preexisting_latest_health. Then run smoke and post-smoke check. Preserve missing latest as a classified state if a clean checkout has no latest pointer.

**Suggested Software / Method:** Existing Node script; existing validateLatestRun; node:test regression fixture; no dependency.

**Files Likely To Change:** scripts/verify.js; test/verify.test.js; possibly src/lib/latest-run.js if a cleaner API is needed.

**Validation Command:** pnpm test; pnpm verify.

**Acceptance Criteria:**
- Corrupting an existing latest pointer causes pnpm verify to fail before smoke rewrites it.
- Missing latest is classified explicitly and does not produce an unclear stack trace.
- Fresh smoke proof still runs after preexisting state is recorded.
- CI still runs pnpm verify.

### GAP-002: check hard-binds proof context to smoke

**Category:** validation / runtime

**Current State:** checkCommand always derives expected context from fixtures/smoke/pr-closeout.case.json and passes that expected context into validateLatestRun.

**Expected State:** Default check should validate the observed latest bundle for internal consistency. Strict smoke-context validation should be explicit.

**Evidence Basis:** Adversarial reviewer finding 2; repo-local suite ownership model; suite contract slice.

**Code Evidence:** src/commands/validation.js:102-129; src/lib/latest-run.js:65-93 and 169-215.

**Risk:** Legitimate non-smoke latest outputs can fail global check, pushing operators to overwrite latest with smoke instead of validating the actual evidence they care about.

**Severity:** High

**Fix Grade:** P0

**Recommended Fix:** Split check modes:
- default: validate latest schema, artifacts, manifest, hashes, trace timeline, and context self-consistency without comparing to smoke;
- explicit smoke mode: compare observed latest against the smoke expected context and offer smoke recovery command.

**Suggested Software / Method:** CLI option parsing inside src/cli.js and src/commands/validation.js, node:test coverage for smoke and non-smoke latest.

**Files Likely To Change:** src/cli.js; src/commands/validation.js; src/lib/latest-run.js; test/cli.test.js; README.md/AGENTS.md if command semantics change.

**Validation Command:** pnpm test; pnpm evals check --json; pnpm evals run fixtures/smoke/pr-closeout.case.json --json.

**Acceptance Criteria:**
- check validates non-smoke latest evidence without a smoke context mismatch.
- smoke-context validation remains available and documented.
- recovery_command matches the selected mode.
- Existing smoke acceptance command remains preserved unless explicitly amended.

### GAP-003: validate/check JSON output lacks a published schema

**Category:** API contract / validation

**Current State:** printValidation emits arbitrary validation objects as JSON, but schemaTargets has no validation-result schema.

**Expected State:** Machine-readable CLI outputs should have a schema-backed compatibility target.

**Evidence Basis:** API-contract reviewer finding 1; repo owns schemas and deterministic result shapes.

**Code Evidence:** src/commands/validation.js:28-39 and 102-129; src/lib/schema.js:6-67; schemas directory.

**Risk:** Downstream parsers can break silently when fields are renamed, removed, or nested differently.

**Severity:** High

**Fix Grade:** P1

**Recommended Fix:** Add schemas/validation-result.schema.json, register it in schemaTargets, and add tests that parse validate/check JSON output and assert schema conformance.

**Suggested Software / Method:** Existing JSON Schema subset validator in src/lib/schema.js; node:test; fixture-backed CLI command capture.

**Files Likely To Change:** schemas/validation-result.schema.json; src/lib/schema.js; test/cli.test.js or test/schema.test.js.

**Validation Command:** pnpm test; pnpm evals validate fixtures/smoke/pr-closeout.case.json --json; pnpm evals check --json.

**Acceptance Criteria:**
- validate --json output validates against the new schema.
- check --json output validates against the new schema.
- Schema allows additive optional diagnostic fields but protects required status/check/error shape.
- Tests fail if required machine fields are removed.

### GAP-004: Architecture boundaries are documented but not enforced

**Category:** architecture / validation

**Current State:** ARCHITECTURE.md maps deep modules and invariants, and command/lib boundaries are visually clear in code, but no CI check rejects import/layer drift.

**Expected State:** Mechanical boundary tests should reject command/lib back edges, accidental runtime dependency on hard-blocked sibling repos, and deep-module ownership drift.

**Evidence Basis:** improve-codebase-architecture skill; external mining audit deep module map; phase-one hard blocks.

**Code Evidence:** ARCHITECTURE.md:102-250; src/cli.js; src/commands/*.js; src/lib/*.js; scripts/verify.js has no architecture boundary check.

**Risk:** Future slices can scatter behavior across callers, tests, docs, or generated artifacts without failing CI.

**Severity:** High

**Fix Grade:** P1

**Recommended Fix:** Add a dependency-free architecture-boundaries test or script that scans ESM imports:
- src/cli.js may import commands only;
- src/commands/** may import src/lib/** and Node builtins;
- src/lib/** may not import src/commands/**;
- src/** and scripts/** may not import coding-harness, agent-skills, OTEL collectors, network runners, or external adapter roots.

**Suggested Software / Method:** Node fs/path parser with conservative import regex; node:test; optional future dependency-cruiser only if the repo chooses to add dev dependencies.

**Files Likely To Change:** test/architecture-boundaries.test.js or scripts/validate-architecture.js; scripts/verify.js; ARCHITECTURE.md if invariants are canonicalized.

**Validation Command:** pnpm test; pnpm verify.

**Acceptance Criteria:**
- A deliberate lib-to-command import fails the architecture test.
- A hard-blocked sibling repo import fails the architecture test.
- pnpm verify runs the architecture check.
- The validator does not require network or package install.

### GAP-005: JSON diagnostics are not path-aware enough and do not reject duplicate keys

**Category:** validation / usability / traceability

**Current State:** readJson is JSON.parse(readFileSync(path, utf8)). JSON parse errors bubble up with native messages. Duplicate keys are silently accepted by JSON.parse.

**Expected State:** Invalid JSON and duplicate keys should produce actionable, source-located diagnostics that point to the exact file and approximate location.

**Evidence Basis:** External mining audit OPP-002; Semgrep-style source-location diagnostics; testing skill emphasis on debuggable failure evidence.

**Code Evidence:** src/lib/json.js:29-36; src/lib/schema.js:267-283; src/lib/latest-run.js parse paths; test/cli.test.js has malformed JSON tests but not duplicate-key enforcement.

**Risk:** A malformed or ambiguous case/schema/latest document can be hard to debug, and duplicate keys can hide operator intent or produce surprising validation results.

**Severity:** High

**Fix Grade:** P1

**Recommended Fix:** Replace readJson with a diagnostic reader that:
- wraps parse errors with repo-relative path and line/column when available;
- rejects duplicate object keys with the key name and JSON pointer or path;
- remains dependency-free unless a small parser dependency is explicitly approved.

**Suggested Software / Method:** Small streaming/token scanner for duplicate keys, or approved JSON parser with location support; node:test fixtures.

**Files Likely To Change:** src/lib/json.js; src/lib/schema.js if reader API changes; test/cli.test.js; test/schema.test.js.

**Validation Command:** pnpm test; pnpm evals validate fixtures/smoke/pr-closeout.case.json --json.

**Acceptance Criteria:**
- Duplicate key fixture fails validation before semantic checks.
- Parse failure includes file path and useful location.
- Existing valid fixtures still pass.
- Error messages do not expose secrets from file contents.

### GAP-006: Suite health checks are partial

**Category:** validation / runtime

**Current State:** suite-contract validates suite root, artifact root, network fail-closed policy, case paths, scorer refs, and baseline path. It does not yet grade suite meaningfulness or health beyond structural validity.

**Expected State:** Repo-local suites should expose a health summary: case count, scorer coverage, critical scorer presence, threshold presence, fixture accessibility, baseline coverage, and whether the suite is too thin to support a claim.

**Evidence Basis:** External mining audit OPP-001; Hypothesis-style health checks; repo-local suite contract.

**Code Evidence:** src/lib/suite-contract.js:40-116; schemas/suite.schema.json; test/cli.test.js suite tests.

**Risk:** A syntactically valid but weak suite can appear legitimate while providing little evaluation value.

**Severity:** Medium

**Fix Grade:** P1

**Recommended Fix:** Add src/lib/suite-health.js or a suiteContract.health field that emits data-only warnings and errors. Start with warnings; gate only conditions that would create false success, such as zero executable cases after resolution.

**Suggested Software / Method:** Existing suite loader; node:test; JSON output field in suite run summary.

**Files Likely To Change:** src/lib/suite-contract.js or src/lib/suite-health.js; src/commands/run.js; schemas/suite.schema.json if health policy is declared; test/cli.test.js.

**Validation Command:** pnpm test; pnpm evals run path/to/suite.json --json with a weak-suite fixture.

**Acceptance Criteria:**
- Empty or unreachable case sets fail.
- Missing optional health dimensions produce warnings, not false hard failures.
- Run JSON includes suite_health for suite runs.
- Health checks remain repo-local and do not mine source automatically.

### GAP-007: Runtime readiness does not gate on dirty git state

**Category:** governance / traceability

**Current State:** collectGitState emits dirty: true/false, but readinessVerdict does not use git_state.dirty.

**Expected State:** Closure or handoff readiness should be able to fail when git state is dirty, at least in strict mode.

**Evidence Basis:** Agent-native reviewer finding 2; parent/child loop closeout truth.

**Code Evidence:** src/lib/claim-evidence-contract.js:178-205 and 234-253.

**Risk:** An agent can hand off evidence that does not correspond to a clean repository state.

**Severity:** Medium

**Fix Grade:** P1

**Recommended Fix:** Add an explicit strict readiness mode for closure contexts, or a separate closure_readiness verdict that fails when git_state.status is available and dirty is true.

**Suggested Software / Method:** Existing runtime evidence packet; node:test with mocked collectGitState or injectable git state.

**Files Likely To Change:** src/lib/claim-evidence-contract.js; schemas/runtime-evidence-packet.schema.json; test/cli.test.js.

**Validation Command:** pnpm test; pnpm evals state --json.

**Acceptance Criteria:**
- Dirty git state is visible in packet.
- Strict closure readiness fails on dirty state.
- Normal local exploratory state can remain non-blocking if explicitly documented.

### GAP-008: Scaffolded policy families can still allow ready status

**Category:** governance / runtime

**Current State:** Runtime evidence policy coverage distinguishes scaffolded_not_enforced, but runtime state can still be ready when scaffolded families are intentionally present.

**Expected State:** Agent-closeout contexts should distinguish core runtime readiness from policy enforcement completeness.

**Evidence Basis:** Agent-native reviewer finding 1.

**Code Evidence:** src/lib/runtime-evidence-contract.js; fixtures/runtime-evidence/approval-disabled-readonly-fallback.case.json; src/lib/runtime-state.js:139-167.

**Risk:** Operators can mistake a scaffolded policy family for enforced safety.

**Severity:** Medium

**Fix Grade:** P1

**Recommended Fix:** Add policy_enforcement_floor or agent_native_readiness to runtime state. Degrade only the readiness plane that claims closure safety, not necessarily the whole local dev state.

**Suggested Software / Method:** Runtime state schema extension; fixture; node:test.

**Files Likely To Change:** src/lib/runtime-state.js; schemas/runtime-state.schema.json; src/lib/runtime-evidence-contract.js; test/cli.test.js.

**Validation Command:** pnpm test; pnpm evals state --json.

**Acceptance Criteria:**
- Scaffolded families are visible and classified.
- Agent/closure readiness cannot say pass when required families are scaffolded.
- Local exploratory commands remain usable.

### GAP-009: Direct run success and contract health can diverge

**Category:** runtime / validation

**Current State:** run status is based on deterministic scorer verdict. Runtime-evidence contract health is checked in check and state, not in run.

**Expected State:** run output should either include contract health explicitly or offer an explicit fail-closed mode.

**Evidence Basis:** Adversarial reviewer finding 3.

**Code Evidence:** src/commands/run.js:185-190 and 345-381; src/commands/validation.js:112-129; src/lib/runtime-state.js:139-167.

**Risk:** A direct run can look green while governance/runtime evidence health is failing.

**Severity:** Medium

**Fix Grade:** P2

**Recommended Fix:** Add contract_health_status to run JSON. Consider --require-contract-health after the output contract is schema-backed.

**Suggested Software / Method:** Existing validateRuntimeEvidenceSuite; additive JSON output; node:test.

**Files Likely To Change:** src/commands/run.js; schemas/eval-result.schema.json or run output schema if introduced; test/cli.test.js.

**Validation Command:** pnpm test; pnpm evals run fixtures/smoke/pr-closeout.case.json --json; pnpm evals check --json.

**Acceptance Criteria:**
- run JSON includes contract health classification.
- check/state/run use the same status vocabulary.
- Fail-closed mode is explicit if added.

### GAP-010: Failure replay capsules are missing

**Category:** recovery / traceability

**Current State:** emitFailure emits structured failures, and artifacts capture command logs for successful runs. Failures do not consistently create replay capsules.

**Expected State:** Important failures should produce a replayable evidence capsule with command, cwd, input path, normalized error, relevant artifact refs, recovery command, and blocker class.

**Evidence Basis:** External mining audit OPP-005; recovery and failure handling category.

**Code Evidence:** src/lib/failures.js; src/commands/run.js; src/commands/validation.js.

**Risk:** Reproducing a failure depends on terminal scrollback or chat memory instead of artifact evidence.

**Severity:** Medium

**Fix Grade:** P2

**Recommended Fix:** Add artifacts/failures or .harness/evals/failures output for failing command paths. Keep it local, JSON, and schema-backed.

**Suggested Software / Method:** JSONL or per-failure JSON; schema; node:test.

**Files Likely To Change:** src/lib/failures.js; src/commands/*.js; schemas/failure-capsule.schema.json; test/cli.test.js.

**Validation Command:** pnpm test; run a deliberately invalid fixture and assert failure capsule creation.

**Acceptance Criteria:**
- Invalid case validation emits a capsule.
- Capsule references command and input without leaking secrets.
- Capsule has a recovery command and blocker class.
- Tests verify schema conformance.

### GAP-011: External PR and Linear truth are documented/manual, not runtime-verified

**Category:** governance / claim-vs-evidence

**Current State:** The repo has tracker override files and AGENTS warns not to fake Linear state. Runtime evidence only collects local git state.

**Expected State:** Phase one may keep external truth manual, but closeout claims must not present local state as live PR/Linear state.

**Evidence Basis:** AGENTS tracker rule; user operating model; phase-one hard blocks.

**Code Evidence:** .harness/linear/*.md; src/lib/claim-evidence-contract.js:234-253.

**Risk:** Parent closeout can overclaim delivery readiness if live GitHub/Linear truth is not checked by the operator.

**Severity:** Medium

**Fix Grade:** P2

**Recommended Fix:** Do not add external runtime dependency yet. Add explicit local fields for external_truth_status: manual_required or not_checked, plus closeout docs that require live check before claims.

**Suggested Software / Method:** Runtime evidence packet additive fields; documentation; optional manual checklist.

**Files Likely To Change:** src/lib/claim-evidence-contract.js; schemas/runtime-evidence-packet.schema.json; README.md; AGENTS.md only if command contract changes.

**Validation Command:** pnpm test; pnpm evals state --json.

**Acceptance Criteria:**
- Runtime packet never implies PR/Linear verified unless explicitly supplied.
- Manual-required status is machine-readable.
- Phase-one hard blocks remain intact.

### GAP-012: Macro-pattern ledger is missing

**Category:** traceability / observability

**Current State:** External mining audit identifies macro-pattern evidence as useful, but no runtime owner exists.

**Expected State:** After failure replay and suite health mature, the repo can keep a local, opt-in macro evidence ledger summarizing recurring failure classes.

**Evidence Basis:** Macro evals pattern discovery; external mining audit OPP-009.

**Code Evidence:** No src/lib/macro-evidence.js; no schema; no command.

**Risk:** Repeated failures remain individual artifacts and are harder to promote into deterministic regressions.

**Severity:** Low

**Fix Grade:** P3

**Recommended Fix:** Defer. When ready, build a local data-only ledger from existing artifacts; do not add dashboards, source-mining automation, or LLM judge gates.

**Suggested Software / Method:** JSONL ledger, jq-friendly schema, optional report generator.

**Files Likely To Change:** src/lib/macro-evidence.js; schemas/macro-evidence.schema.json; scripts or command subroute.

**Validation Command:** pnpm test; schema validation of ledger fixtures.

**Acceptance Criteria:**
- Ledger is local and artifact-derived.
- No network, dashboard, or model dependency.
- Every pattern links to concrete artifacts.

## 5. Contradictions

| Claim | Actual Implementation | Evidence | Severity | Operational Impact | Recommended Fix |
|---|---|---|---|---|---|
| pnpm verify is the aggregate deterministic truth gate. | It runs smoke mutations before check validation of latest. | scripts/verify.js:66-80; src/commands/run.js:278-344 | Critical | A broken latest can be hidden by fresh smoke evidence. | Add pre-mutation latest validation before smoke. |
| check validates latest run health. | check validates latest against smoke expected context, not simply observed latest integrity. | src/commands/validation.js:102-129 | High | Non-smoke suite latest can be treated as invalid even when internally consistent. | Split observed-latest and strict smoke modes. |
| Machine JSON output is suitable for agents/automation. | validate/check JSON output has no schema target. | src/commands/validation.js:28-39; src/lib/schema.js:6-67 | High | Consumers have no compatibility contract. | Add validation-result schema and tests. |
| Deep modules and architecture boundaries are mapped. | No CI or test enforces the import/layer boundaries. | ARCHITECTURE.md; scripts/verify.js:40-85 | High | Future work can spread behavior across wrong owners. | Add architecture boundary validator to test/verify. |
| Runtime evidence packet supports handoff truth. | git_state.dirty is emitted but readiness_verdict ignores it. | src/lib/claim-evidence-contract.js:178-205 and 234-253 | Medium | Handoff can look pass-ready with uncommitted drift. | Add strict closure readiness. |
| Policy families are represented in runtime evidence. | Scaffolded families can remain compatible with ready status. | agent-native artifact; runtime evidence fixtures | Medium | Scaffolded controls can be mistaken for enforced controls. | Add enforcement floor for closure readiness. |

## 6. Missing Features

### Runtime State

- Pre-mutation latest health status: missing.
- Closure readiness distinct from local command readiness: partial.
- Dirty-state gate for closure: implemented_not_enforced.
- External PR/Linear truth status: documented_only.

### Command Selection

- Safe-to-run recommendation gate that accounts for dirty state and stale latest: partial.
- Context-selectable check mode: missing.
- Command capability manifest for external agents: missing, low priority.

### Verification

- Validation-result output schema: missing.
- Architecture boundary validator: missing.
- Preexisting-latest regression test: missing.
- Non-smoke latest check test: missing.

### Validation

- Duplicate-key JSON rejection: missing.
- Source-location parse diagnostics: missing.
- Suite health/meaningfulness checks: partial.
- Cross-command semantic consistency tests for run/check/state: partial.

### Architecture Enforcement

- Import graph validation: missing.
- Hard-blocked runtime dependency scanner: missing.
- Deep-module owner map validator: missing.

### Traces

- Run trace event timeline: implemented_enforced.
- Failure replay capsule: scaffolded/missing.
- Macro-pattern ledger: missing.

### Context

- Hot/cold context budget enforcement: documented_only.
- Stale context detector: missing.
- Skill routing validator: documented_only.

### Skills

- Repo-native executable skill pack: not applicable for phase one.
- External skill guidance validation: documented_only.
- Command capability manifest: missing.

### Recovery

- Retry classification: missing.
- Blind retry prevention: missing.
- CI failure handling artifact: documented/operator-managed.
- Missing dependency recovery: mostly not applicable because package has no dependencies.

### Governance

- Phase-one hard-block doctrine: documented and partly enforced by dependency absence/suite policy.
- Approval gates: documented/operator-managed.
- Secret handling: implemented via lightweight credential scan.
- Revocation paths: documented_only.

### CI/CD

- pnpm verify in GitHub Actions: implemented_enforced.
- Pre-mutation latest validation in CI: missing.
- Architecture drift rejection in CI: missing.

### Observability

- Local artifact/event evidence: implemented.
- Telemetry exporter authority: intentionally blocked.
- Runtime macro observability: deferred.

## 7. Fix Roadmap

### Phase 1 — Critical Trust Boundary Fixes

Objective: Reduce false-success, stale-state, unsafe-command, and missing-evidence risk.

Fixes included:
- GAP-001: pre-mutation latest validation in pnpm verify.
- GAP-002: split observed-latest check from strict smoke-context check.
- GAP-003: validation-result schema for validate/check JSON.
- GAP-007: strict closure readiness for dirty git state.

Files likely affected:
- scripts/verify.js
- src/commands/validation.js
- src/cli.js
- src/lib/latest-run.js
- src/lib/schema.js
- src/lib/claim-evidence-contract.js
- schemas/validation-result.schema.json
- schemas/runtime-evidence-packet.schema.json
- test/cli.test.js
- test/verify.test.js
- test/schema.test.js

Validation gates:
- pnpm test
- pnpm evals check --json
- pnpm evals state --json
- pnpm verify
- targeted corrupted-latest regression

Expected risk reduction:
- Prevents overwrite-to-pass latest trust failures.
- Makes machine outputs safer for agents.
- Improves closeout truth when repository state is dirty.

### Phase 2 — Mechanical Enforcement

Objective: Make architecture and contract drift fail deterministically.

Fixes included:
- GAP-004: architecture boundary validator.
- GAP-005: diagnostic JSON reader and duplicate-key rejection.
- GAP-006: suite health checks.
- GAP-009: run/check/state contract-health consistency.

Files likely affected:
- src/lib/json.js
- src/lib/suite-contract.js or src/lib/suite-health.js
- src/commands/run.js
- scripts/verify.js
- test/architecture-boundaries.test.js
- test/cli.test.js
- schemas as needed

Validation gates:
- pnpm test
- pnpm verify
- targeted invalid JSON fixture
- targeted architecture boundary negative fixture
- weak suite fixture

Expected risk reduction:
- Prevents silent contract ambiguity.
- Makes deep-module placement enforceable.
- Makes valid-but-weak suites visible.

### Phase 3 — Runtime Harness Maturity

Objective: Add replayable failure evidence and retry/recovery semantics without widening phase-one authority.

Fixes included:
- GAP-010: failure replay capsules.
- Add retry classification only for local deterministic command retries.
- Add blocker class vocabulary to failures.

Files likely affected:
- src/lib/failures.js
- src/commands/*.js
- schemas/failure-capsule.schema.json
- test/cli.test.js

Validation gates:
- pnpm test
- invalid fixture failure-capsule test
- pnpm verify

Expected risk reduction:
- Converts terminal failures into durable evidence.
- Reduces repeated blind reruns.

### Phase 4 — Context and Skill Compression

Objective: Keep operator guidance accurate without making prose a runtime authority.

Fixes included:
- Add docs/currentness checks for ARCHITECTURE.md, AGENTS.md, README command examples.
- Add optional command capability manifest for agents.
- Keep external skills out of runtime authority.

Files likely affected:
- ARCHITECTURE.md
- README.md
- AGENTS.md
- scripts/verify.js or docs validator
- optional .harness/command-capabilities.json

Validation gates:
- pnpm test
- pnpm verify
- command example smoke check

Expected risk reduction:
- Reduces stale instruction risk.
- Improves agent usability without expanding runtime dependencies.

### Phase 5 — Governance and Scaling

Objective: Scale proof evidence while preserving phase-one hard blocks.

Fixes included:
- GAP-011: explicit external_truth_status fields.
- GAP-012: local macro-pattern ledger after replay capsules exist.
- Optional manual closeout checklist schema.

Files likely affected:
- src/lib/claim-evidence-contract.js
- schemas/runtime-evidence-packet.schema.json
- optional schemas/macro-evidence.schema.json
- .harness/evals closeout docs

Validation gates:
- pnpm test
- pnpm evals state --json
- schema validation for ledger/checklist fixtures

Expected risk reduction:
- Prevents external-state overclaiming.
- Turns repeated local failures into fix queues.

## 8. Highest-Leverage Fixes

| Rank | Fix | Impact | Difficulty | Risk Reduced | Why First |
|---:|---|---|---|---|---|
| 1 | Pre-mutation latest validation in pnpm verify | Very high | Medium | False-success and stale evidence overwrite | It protects the main CI/local aggregate gate. |
| 2 | Split check observed-latest vs smoke-context modes | Very high | Medium | Smoke overwrite pressure and suite validation mismatch | It restores latest as a general proof pointer. |
| 3 | Add validation-result schema | High | Low/Medium | Contract drift for agents and downstream parsers | It is small and aligns with existing schema machinery. |
| 4 | Add architecture boundary validator | High | Medium | Deep-module drift and hard-blocked dependency creep | It converts architecture from prose into CI evidence. |
| 5 | Add diagnostic JSON reader and duplicate-key rejection | High | Medium | Ambiguous inputs and poor operator diagnostics | It improves every schema/fixture/artifact validation path. |
| 6 | Add strict dirty-git closure readiness | Medium/High | Medium | Handoff truth drift | It prevents pass-ready evidence from hiding uncommitted changes. |
| 7 | Add suite health checks | Medium/High | Medium | Weak suite false confidence | It operationalizes external mining findings without source mining. |
| 8 | Add contract_health_status to run output | Medium | Low/Medium | Split-brain run/check/state semantics | It makes direct run output more honest. |
| 9 | Add failure replay capsules | Medium | Medium | Non-replayable failures and blind retries | It turns failures into actionable artifacts. |
| 10 | Add external_truth_status as manual-required | Medium | Low | PR/Linear overclaiming | It preserves phase-one boundaries while clarifying closeout truth. |

## 9. Implementation Advice

What to build first:
- Build the pre-mutation latest validation gate in scripts/verify.js.
- Then split check semantics so latest validation is not globally smoke-bound.
- Add validation-result schema while those command contracts are in motion.

What not to build yet:
- Do not build dashboards.
- Do not add cloud runners.
- Do not add source-mining automation.
- Do not add networked suite execution.
- Do not add required LLM judge gates.
- Do not add runtime dependencies on coding-harness, agent-skills, OTEL collectors, or external PR/Linear APIs.

What to remove:
- Do not remove current schemas, artifact bundles, trace events, or smoke command contract.
- Remove or revise any future docs that imply pnpm verify proves preexisting latest integrity until GAP-001 is fixed.

What to simplify:
- Keep architecture enforcement dependency-free first.
- Keep suite health data-only and local.
- Keep failure replay capsules JSON-first, not a report generator.

What should become a validator:
- Pre-mutation latest integrity.
- Architecture import/layer boundaries.
- JSON duplicate key rejection.
- Validate/check JSON schema conformance.
- Suite health minimums.

What should become a schema:
- validation-result.schema.json.
- failure-capsule.schema.json, when replay capsules are implemented.
- macro-evidence.schema.json later, only after replay evidence exists.

What should become a skill:
- Nothing in phase one. Skills may guide operators, but runtime authority must stay in repo-native commands and artifacts.

What should become documentation:
- Explicit check mode semantics.
- External truth manual-required boundary.
- Suite health warning/error policy.
- Architecture boundary rules once validator exists.

What should become CI:
- Pre-mutation latest validation.
- Architecture boundary validator.
- Schema conformance for validate/check output.
- Diagnostic JSON/duplicate-key tests.

What should remain manual:
- Live GitHub PR state checks.
- Linear tracker truth while mutation remains blocked or out of scope.
- Spec-owner decisions for changing public CLI semantics.
- Baseline promotion approval.

## 10. Final Recommendation

Immediate next action: implement GAP-001 as the safest first patch.

Safest first patch: modify scripts/verify.js so it validates any existing .harness/evals/runs/latest.json before running smoke commands, then add a regression test that corrupts latest and proves pnpm verify fails before mutation.

Highest-risk missing system: pre-mutation proof validation for the latest pointer.

Best validation command to add first: a targeted node:test case in test/verify.test.js that asserts verify does not overwrite a corrupt latest pointer into a pass.

Broader Codex autonomy readiness: not yet. The repo is ready for bounded local automation against run/check/state/verify, but not for broader autonomous closeout until:
- verify cannot overwrite stale evidence before validating it;
- check supports observed latest without forced smoke context;
- machine JSON outputs have schemas;
- architecture boundaries are mechanically enforced;
- closure readiness can fail on dirty/scaffolded states where required.

Final confidence: 82%. The audit is evidence-backed by local source inspection, reviewer artifacts, and existing command structure. Confidence is capped because the audit itself did not implement the fixes, and some recommended tests are described but not yet present.
