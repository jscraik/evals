# Evidence-Led Codebase Gap Audit

Date: 2026-05-20
Target codebase: /Users/jamiecraik/dev/evals
Evidence document: .harness/research/deep/2026-05-19-doug-carlos-braintrust-evidence.md
Primary skill: improve-codebase-architecture
Reviewer coverage: agent-native-reviewer, api-contract-reviewer, adversarial-reviewer, coordinator runtime inspection

## 1. Executive Summary

Overall maturity grade: C-

The project has a good phase-one executable spine: a small local CLI writes an artifact bundle, validates JSON schemas, rejects path traversal, checks manifest hashes, records deterministic scorer results, and preserves explicit baseline fields. That is the strongest foundation and it matches the repo doctrine that artifacts decide and LLM judges advise until calibrated.

The gap is that the current implementation is still mostly an offline smoke harness, not yet the fuller evidence loop described in the research artifact. It simulates the task rather than executing the fixture command, has no runtime card or current-state packet, has no CI workflow, has no trace/session schema, has no trace-to-fixture promotion gate, and has no enforcement wrapper for the full validation lane documented in AGENTS.md.

Top 5 gaps:

1. The smoke run can false-pass because src/cli.js records a simulated command and hard-coded exit_code 0 instead of executing testCase.input.command.
2. The validate command and run command enforce different fixture contracts: run applies policy validation, validate only applies schema validation.
3. Baseline presence is copied from fixture expectation instead of being derived from observed artifact existence and hash evidence.
4. The repo lacks a runtime-card/current-state packet for stale-state, tracker, dirty worktree, latest-run, and recommended-command decisions.
5. CI/CD and full validation enforcement are documented but not wired: no .github/workflows files and no single repo wrapper runs the minimum validation lane.

Top 5 risks:

1. False success: artifacts can report pass without proving real task execution.
2. Stale or misleading readiness: latest.json validates artifact integrity, but not current repo state, tracker state, or full closeout readiness.
3. Non-enforced safety policy: privacy regex, hard blocks, and tracker truth are mostly prose/tests, not a single gate.
4. Dataset/promotion contamination: research recommends governed trace promotion, but no schema or command exists for allowed uses, reviewer, redaction, or source trace.
5. Future judge authority drift: the repo correctly blocks LLM judges in phase one, but has no taxonomy for advisory judge/human/deterministic scorers when the phase opens.

Strongest existing foundations:

- Local artifact bundle exists and is documented in README.md:94-107.
- CLI validates latest run artifacts and manifest hashes in src/cli.js:558-617.
- Path boundary checks exist in src/cli.js:92-119 and are covered in test/cli.test.js:95-199.
- Deterministic scorer results include inspected inputs, evidence, and failure_reason in src/cli.js:257-296 and schemas/scorer-result.schema.json:15-23.
- Phase-one doctrine is consistent: README.md:37-43, AGENTS.md:11-14, and .harness/core/2026-05-18-evals-core.md:7-18.

Highest-leverage next fixes:

1. Add real bounded command execution behind input.command, preserving current simulation as an explicit fixture mode only.
2. Unify validate and run fixture policy validation.
3. Derive baseline presence from baseline.artifact_path existence/hash checks.
4. Add a repo-native verify wrapper that runs the documented minimum lane.
5. Add .harness/state/current.schema.json plus pnpm evals state --json.

## 2. Overall Gradecard

| Area | Grade | Confidence | Current Status | Main Gap | Recommended Fix |
|---|---|---|---|---|---|
| Repository as Control Plane | B- | High | Rich .harness docs, ADRs, glossary, instructions, and local artifacts exist. Runtime source of truth is small and discoverable. | Several control-plane claims are not executable gates. | Add state packet and verify wrapper; keep docs as explanatory, not authority. |
| Runtime Truth and Decision Packets | D | High | latest.json gives artifact paths; command-log records a run. | No runtime card/current-state packet, safe-to-run check, stale-state classifier, or command recommendation gate. | Add pnpm evals state --json backed by a JSON schema. |
| Claim-vs-Evidence Verification | C | High | pnpm evals check validates schemas and manifest hashes. Tests cover path/hash failures. | The primary run is simulated; no CI/PR/issue/live state verification. | Execute fixture commands; add CI; add closure/current-state validation. |
| Mechanical Architecture Enforcement | C | Medium | JSON schema and custom validation enforce artifact shapes and path safety. | No import graph/layer checks; custom JSON Schema validator is partial; no latest.json schema. | Add latest schema, full fixture-policy parity, and small structural tests before broader tools. |
| Harness Runtime Loop | D | High | Run writes artifacts and failure artifacts after post-start failures. | No attempt tracking, retry budgets, recovery handlers, verifier ownership, or stop-reason taxonomy beyond simple failures. | Add run attempts and failure_class/status schema in command-log/result. |
| Trace and Session Evidence | D | High | command-log.json records command, timestamps, stdout, stderr, and failure_class. | No trace event schema, JSONL events, tool-call records, recovery events, or replay trace. | Add trace-events.jsonl schema after real execution lands. |
| Context Engineering | C- | Medium | AGENTS.md and UBIQUITOUS_LANGUAGE.md provide hot-path instructions and terms. | No machine-readable context budget, stale-context detection, skill routing, or source promotion policy. | Add context/state packet and keep research/deep artifacts cold-path. |
| Skills and Workflow Density | D | High | No repo-local skills; workflows are docs plus CLI. This is acceptable for phase one but weak for repeated audit/promotion workflows. | Research extraction, audit, promotion, and closeout remain prompt-driven. | Add deterministic scripts before any skill/plugin system. |
| Recovery and Failure Handling | D+ | High | Structured failures and recovery strings exist in src/cli.js:319-370 and 508-515. | No deterministic stale branch, auth, dependency, missing baseline, or retry classification. | Add failure classes and state command; do not add broad automation yet. |
| Governance and Safety | C- | High | Phase-one hard blocks, tracker override, privacy regex, and no-judge policy exist in docs and report output. | Privacy check is not part of a wrapper/CI; promotion and approval gates are missing. | Add verify wrapper, promotion schema, and guard tests. |

## 3. Evidence-to-Code Mapping

| Evidence Pattern | Source File | Code Location | Runtime Status | Grade | Confidence |
|---|---|---|---|---|---|
| Three-ingredient eval contract | evidence.md:20-50 | schemas/eval-case.schema.json:7-83; fixtures/smoke/pr-closeout.case.json:23-40 | partial | C | High |
| Offline/online eval split | evidence.md:52-83 | Offline: src/cli.js:375-544. Online: none. | partial | C- | High |
| Small seed, iterative hardening | evidence.md:85-115 | One smoke fixture in fixtures/smoke/pr-closeout.case.json:1-40 | implemented_enforced for phase one | B | High |
| Dual deterministic/judge scoring | evidence.md:117-147 | Deterministic only in src/cli.js:257-296; no judge/human taxonomy | partial | C | High |
| Eval the eval | evidence.md:149-179 | No judge calibration artifacts or scorer calibration schema | missing | F | High |
| Baseline comparison over absolute score | evidence.md:183-211 | baseline-result.schema.json:7-24; src/cli.js:416-428 | partial | C- | High |
| Source-controlled evaluation assets | evidence.md:213-243 | Schemas/fixtures/CLI are source-controlled; no prompt/resource manifest needed in phase one | partial | C+ | Medium |
| Playground-to-experiment promotion | evidence.md:245-272 | No scratch-to-durable promotion command | missing | F | Medium |
| Trace/span-centered observability | evidence.md:274-304 | command-log only in src/cli.js:401-410; no trace/span model | scaffolded | D | High |
| Sampling-based online scoring | evidence.md:306-336 | No online scoring policy or sampling model | missing | F | High |
| Human review queue | evidence.md:338+ and 838-845 | artifacts/reviews exist historically, but no runtime queue | documented_only | D | High |
| Human labels as judge calibration | evidence.md:854-879 | No human label schema or calibration suite | missing | F | High |
| Dynamic task binding | evidence.md:906-928 | Contradicted by simulated command in src/cli.js:401-410 | contradicted | F | High |
| Trace promotion governance | evidence.md:881-904 and 1129-1131 | No promote-trace command/schema | missing | F | High |
| External mutation guard | evidence.md:977-1010 and 1142 | package.json has no postinstall/external mutation | implemented_enforced | A | High |

## 4. Gap Register

### GAP-001: Simulated Runs Can Produce False Success

Category: runtime / validation / traceability

Current State:
src/cli.js builds execution with command, simulated_command, exit_code 0, canned stdout, empty stderr, and failure_class null. It never executes testCase.input.command. The scorers then compare expected exit/output against this synthetic object.

Expected State:
The evidence-led loop requires real task evidence or explicitly marked synthetic/bootstrap scope. Dynamic task binding should point to the real task under evaluation, and artifacts should prove actual execution.

Evidence Basis:
Dynamic task binding and stale eval risk are called out in evidence.md:906-928. Reusable techniques include dynamic task binding and artifact bundle proof in evidence.md:1137-1143.

Code Evidence:
- src/cli.js:401-410 creates the simulated execution.
- src/cli.js:249-255 returns canned output.
- src/cli.js:257-281 scores against the synthetic execution.
- .harness/evals/runs/20260518T212318Z-pr-closeout-f8d3bda9/command-log.json:2-10 records simulated_command and exit_code 0.

Risk:
Broken commands can pass. The repository can generate trustworthy-looking artifacts that do not prove task correctness.

Severity: High

Fix Grade: P0

Recommended Fix:
Add bounded subprocess execution for testCase.input.command. Keep simulation only if fixture_source.type is synthetic and input.command has an explicit mode such as simulate-pr-closeout. Record execution_mode as real or synthetic and fail if a non-synthetic fixture uses synthetic mode.

Suggested Software / Method:
Node child_process.spawnSync or spawn with timeout; JSON Schema enum for execution_mode; node:test negative tests.

Files Likely To Change:
- src/cli.js
- schemas/eval-result.schema.json
- fixtures/smoke/pr-closeout.case.json
- test/cli.test.js

Validation Command:
pnpm test

Acceptance Criteria:
- A fixture with command false or a failing local script produces status failed.
- command-log.json records actual command, exit_code, stdout, stderr, duration_ms, and execution_mode.
- Synthetic smoke fixture remains explicit and cannot be mistaken for a real task.

### GAP-002: validate and run Enforce Different Fixture Contracts

Category: validation / API contract

Current State:
run parses the case, validates schema, then applies validateCase policy checks. validate case only calls schemaCheck and skips validateCase policy rules.

Expected State:
validate should be a faithful preflight for run, or the CLI should split schema validation from runtime-contract validation with distinct names and output labels.

Evidence Basis:
The research emphasizes deterministic checks and validation chains, not prompt-level reassurance. evidence.md:138-141 recommends mandatory deterministic format/schema/safety checks.

Code Evidence:
- src/cli.js:361-364 applies schema and validateCase during run.
- src/cli.js:620-623 validateCaseFile only calls schemaCheck.
- src/cli.js:654-659 validateCommand reports case validation from schema-only checks.

Risk:
Agents can report pnpm evals validate passed for a fixture that run rejects. That creates false readiness and broken automation handoffs.

Severity: High

Fix Grade: P0

Recommended Fix:
Refactor validateCaseFile to read the JSON and run the same validateCase policy logic as parseCase. Return separate checks for schema and phase-one policy if you want richer output.

Suggested Software / Method:
Shared validateCaseDocument helper; node:test parity test.

Files Likely To Change:
- src/cli.js
- test/cli.test.js

Validation Command:
pnpm test

Acceptance Criteria:
- Any policy-invalid fixture fails both validate and run.
- JSON output identifies both schema errors and phase-one policy errors.
- Existing valid smoke fixture passes both commands.

### GAP-003: Baseline Presence Is Fixture-Declared, Not Observed

Category: runtime / verification

Current State:
baseline.presence_status is assigned from testCase.baseline.expected_presence, while comparison_status remains not_compared. The code does not check baseline.artifact_path existence or hash.

Expected State:
Baseline presence must be observed from filesystem state and artifact content. Expected presence can be an assertion, but not the source of truth.

Evidence Basis:
Baseline-first reporting and historical comparison are central evidence patterns in evidence.md:183-211 and final recommendations in evidence.md:1204-1208.

Code Evidence:
- src/cli.js:416-428 builds baseline result.
- schemas/baseline-result.schema.json:7-24 defines presence_status/comparison_status/promotion_status.
- fixtures/smoke/pr-closeout.case.json:35-38 declares expected baseline state.

Risk:
Regression comparison can become fake. A fixture can claim a baseline is present when no artifact exists.

Severity: High

Fix Grade: P0

Recommended Fix:
Derive presence_status from baseline.artifact_path. If expected_presence is present but artifact_path is null or missing, fail with failure_class baseline_mismatch. Include observed_baseline_ref and expected_baseline_ref fields if needed.

Suggested Software / Method:
JSON Schema plus manifest hash check; node:test negative fixture.

Files Likely To Change:
- src/cli.js
- schemas/baseline-result.schema.json
- schemas/eval-case.schema.json
- test/cli.test.js

Validation Command:
pnpm test

Acceptance Criteria:
- Missing baseline with expected_presence present fails.
- Present baseline path is repo-relative, exists, and has a recorded hash.
- comparison_status cannot be matched without actual comparison evidence.

### GAP-004: No Runtime Card or Current-State Packet

Category: runtime / context / recovery

Current State:
latest.json points to the latest artifact bundle. It does not classify git state, tracker override status, dirty/untracked files, phase-one hard-block state, safe-to-run status, or recommended next command.

Expected State:
Agents need a machine-readable current-state packet that joins runtime artifacts with repo state and operational blockers.

Evidence Basis:
The audit objective asks for runtime cards, current state packets, safe-to-run checks, stale-state detection, and command recommendation gates. The evidence doc recommends baseline-first reporting and local artifacts as release authority in evidence.md:1138-1143 and 1153.

Code Evidence:
- .harness/evals/runs/latest.json:1-10 only contains artifact pointers.
- src/cli.js:665-679 checkCommand validates fixture and latest artifacts only.
- AGENTS.md:59-66 documents tracker override but no command exports it.

Risk:
Agents can validate an old bundle while the worktree has untracked research, stale branch state, missing tracker recovery, or required validation still unrun.

Severity: High

Fix Grade: P1

Recommended Fix:
Add pnpm evals state --json and .harness/state/current.schema.json. Include git repository detection, branch, dirty/untracked classification, latest run validation status, latest run id, tracker state, phase-one hard blocks, recommended commands, and blockers.

Suggested Software / Method:
Node CLI command; JSON Schema; git status --short --branch; jq-friendly output.

Files Likely To Change:
- src/cli.js
- package.json
- schemas/current-state.schema.json or .harness/state/current.schema.json
- test/cli.test.js

Validation Command:
pnpm evals state --json

Acceptance Criteria:
- Emits valid JSON with status safe, caution, or blocked.
- Detects dirty/untracked research and classifies it.
- Includes latest run validation status and exact recommended next validation command.

### GAP-005: No Single Enforced Validation Wrapper

Category: validation / governance / CI

Current State:
AGENTS.md lists minimum commands including file checks, pnpm test, run variants, pnpm evals check, and privacy regex. package.json exposes evals, check, and test only. There is no verify script and no CI workflow.

Expected State:
The minimum validation lane should be executable as one repo-native command and, when CI opens, as a GitHub Actions job.

Evidence Basis:
Evidence.md:841 recommends small fast evals in the PR loop. Evidence.md:1208 recommends CI checks. AGENTS.md:70-82 already defines the validation lane.

Code Evidence:
- AGENTS.md:70-82 lists the minimum validation commands.
- package.json:6-11 exposes only evals, check, and test.
- find .github produced no workflow files.

Risk:
Agents and humans can run different subsets of validation and still claim success.

Severity: High

Fix Grade: P1

Recommended Fix:
Add scripts/verify-work.sh or package script pnpm verify that runs the documented minimum lane in deterministic order. Add a minimal .github/workflows/ci.yml later once branch policy allows it.

Suggested Software / Method:
Bash wrapper, pnpm scripts, GitHub Actions.

Files Likely To Change:
- package.json
- scripts/verify-work.sh
- tests/docs-pr-changes.test.js
- .github/workflows/ci.yml

Validation Command:
pnpm verify

Acceptance Criteria:
- One command runs file existence checks, pnpm test, run smoke, check latest, and privacy regex.
- Command prints pass/fail outcomes with exact command text.
- Docs reference the wrapper as closeout gate.

### GAP-006: No latest.json Schema

Category: API contract / schema validation

Current State:
latest.json is hand-validated by requiredLatestKeys in src/cli.js. There is no schema file for latest pointer shape.

Expected State:
Every machine-readable artifact that agents consume should have a schema, especially the first-order pointer.

Evidence Basis:
The evidence doc emphasizes schema-backed artifact contracts and local artifact authority in evidence.md:1125-1143.

Code Evidence:
- src/cli.js:568-579 hand-validates latest path fields.
- .harness/evals/runs/latest.json:1-10 has no matching schema in schemas/.

Risk:
Pointer shape can drift without schema parity. External consumers cannot validate latest.json independently.

Severity: Medium

Fix Grade: P1

Recommended Fix:
Add schemas/latest-run.schema.json and validate latest.json with the same schema engine before path/hash checks.

Suggested Software / Method:
JSON Schema; node:test.

Files Likely To Change:
- schemas/latest-run.schema.json
- src/cli.js
- test/cli.test.js

Validation Command:
pnpm test

Acceptance Criteria:
- latest.json validates against schema.
- Missing or extra latest keys fail in tests.
- check --json includes latest schema check.

### GAP-007: Custom JSON Schema Validator Is Partial

Category: validation

Current State:
validateWithSchema implements a narrow subset of JSON Schema. It handles type, const, enum, minLength, pattern, date-time via Date.parse, object properties, arrays, minItems, and uniqueItems. It does not implement all draft 2020-12 semantics.

Expected State:
Either use a real validator or explicitly declare the supported subset and avoid claiming full draft semantics.

Evidence Basis:
Mechanical enforcement should be deterministic. Evidence.md:138-141 and 1204 recommend schema-backed local artifacts.

Code Evidence:
- src/cli.js:140-195 implements custom validation.
- schemas/*.schema.json:2 declare draft 2020-12.

Risk:
The same artifact may pass local validation and fail in a standards-compliant validator.

Severity: Medium

Fix Grade: P2

Recommended Fix:
For phase one, either add AJV as a dev/runtime dependency or remove draft claims and document the local subset. Prefer AJV once dependency policy allows.

Suggested Software / Method:
AJV for JSON Schema 2020-12, or strict local subset tests.

Files Likely To Change:
- package.json
- pnpm-lock.yaml
- src/cli.js
- test/cli.test.js

Validation Command:
pnpm test

Acceptance Criteria:
- Invalid date-time and unsupported schema semantics are tested.
- The validator behavior matches schema claims.

### GAP-008: No Trace Event Schema or Replayable Runtime Timeline

Category: traceability / runtime

Current State:
command-log.json records one command object. It does not record a sequence of events, tool calls, recovery events, verifier ownership, retries, or final status transitions.

Expected State:
The evidence loop recommends trace/span-centered observability and replayable evidence. A local runner should eventually emit JSONL events for start, command, scorer, validation, recovery, and final status.

Evidence Basis:
Trace/span evidence is described in evidence.md:274-304. Reusable techniques include eval artifact bundle and trace promotion in evidence.md:1129-1143.

Code Evidence:
- src/cli.js:401-410 creates one execution object.
- .harness/evals/runs/.../command-log.json:1-10 has no event list.

Risk:
Failures are hard to replay or classify. Attempt/retry behavior cannot be audited.

Severity: Medium

Fix Grade: P2

Recommended Fix:
After real execution lands, add trace-events.jsonl with schema: event_id, run_id, timestamp, event_type, actor, command, status, evidence_ref, failure_class.

Suggested Software / Method:
JSONL trace schema; node:test; jq validation.

Files Likely To Change:
- src/cli.js
- schemas/trace-event.schema.json
- test/cli.test.js

Validation Command:
pnpm test

Acceptance Criteria:
- Each run emits trace-events.jsonl.
- Manifest includes trace-events artifact and hash.
- At least start, command_finished, scorers_finished, artifacts_validated, final_status events exist.

### GAP-009: No Governed Trace-to-Fixture Promotion

Category: governance / validation / context

Current State:
The repo supports synthetic fixture only. There is no command, schema, or policy artifact for promoting real traces/logs into fixture cases.

Expected State:
Promotion should require source_kind, allowed_uses, privacy_status, redaction status, reviewer, source trace ref, and selection reason.

Evidence Basis:
Evidence.md:73-76 recommends source_kind and promotion commands. Evidence.md:881-904 calls out dataset contamination and guardrails. Evidence.md:1220-1223 lists immediate implementation candidates.

Code Evidence:
- schemas/eval-case.schema.json:21-49 has fixture_source and promotion but not allowed_uses, reviewer, source trace ref, or selection reason.
- src/cli.js:682-690 exposes only run, validate, check.

Risk:
When real fixtures open, private logs or bad examples can enter the eval suite without machine-readable governance.

Severity: High

Fix Grade: P1

Recommended Fix:
Do not implement production ingestion yet. First add schema fields and a dry-run promote command that refuses to write unless privacy/redaction/allowed-use fields are present.

Suggested Software / Method:
JSON Schema; dry-run CLI; secret regex; future PII scanner.

Files Likely To Change:
- schemas/eval-case.schema.json
- src/cli.js
- test/cli.test.js
- SECURITY.md

Validation Command:
pnpm test

Acceptance Criteria:
- Real fixture candidates without privacy approval fail validation.
- Promoted fixtures record allowed_uses and source_kind.
- Holdout/few-shot/regression use is explicitly separated.

### GAP-010: No Scorer Taxonomy for Deterministic/Judge/Human Boundaries

Category: validation / governance

Current State:
scorers is an array of string IDs. scorer-result schema accepts only exit-code, artifact-completeness, and required-output.

Expected State:
Scorers should be classifiable as deterministic_required, judge_advisory, judge_required_after_calibration, or human_label before future phases add fuzzy scoring.

Evidence Basis:
Evidence.md:138-141 recommends scorer classes. Evidence.md:854-879 warns against LLM judge false authority.

Code Evidence:
- schemas/eval-case.schema.json:78-83 defines scorer strings.
- schemas/scorer-result.schema.json:15-23 defines scorer result fields without kind/calibration.
- src/cli.js:241-244 hard-codes allowed deterministic scorers.

Risk:
Future judge support could be bolted on as another string and accidentally become release authority.

Severity: Medium

Fix Grade: P2

Recommended Fix:
Add scorer definitions as objects with id, kind, required, calibration_status, and owner. Keep phase-one fixtures deterministic_required only.

Suggested Software / Method:
JSON Schema migration; backward-compat test if needed.

Files Likely To Change:
- schemas/eval-case.schema.json
- schemas/scorer-result.schema.json
- fixtures/smoke/pr-closeout.case.json
- src/cli.js
- test/cli.test.js

Validation Command:
pnpm test

Acceptance Criteria:
- Deterministic scorers can be required.
- Judge scorers cannot be required unless calibration_status is calibrated.
- Phase-one smoke remains deterministic.

### GAP-011: No Human Review Queue or Label Schema

Category: governance / traceability

Current State:
artifacts/reviews contains historical reviewer reports, but the runtime does not generate review queues, label artifacts, or reviewer dispositions.

Expected State:
Low-score, disagreement, or promotion candidates should be routed to a review queue with disposition and reviewer metadata.

Evidence Basis:
Evidence.md:338-345, 838-845, and 1141 recommend review queues and human review schema.

Code Evidence:
- No review queue schema in schemas/.
- src/cli.js exposes no review command.

Risk:
Human review remains ad hoc and cannot calibrate judges or govern promotion.

Severity: Medium

Fix Grade: P3

Recommended Fix:
After trace events and scorer taxonomy exist, add review-queue.jsonl and human-label.schema.json.

Suggested Software / Method:
JSONL queue, JSON Schema, node:test.

Files Likely To Change:
- schemas/human-label.schema.json
- schemas/review-queue-item.schema.json
- src/cli.js

Validation Command:
pnpm test

Acceptance Criteria:
- A failed or disputed scorer can emit a queue item.
- Queue items require owner, reason, source artifact, and disposition status.

### GAP-012: No CI Workflow

Category: CI/CD / governance

Current State:
No .github/workflows files exist. Tests and validation are local-only.

Expected State:
At least the fast deterministic lane should run in CI once the repo is ready for branch enforcement.

Evidence Basis:
Evidence.md:841 recommends small fast evals in the PR loop. Evidence.md:1208 recommends CI checks.

Code Evidence:
- find .github -maxdepth 3 returned no files.
- package.json:6-11 has scripts that CI could run.

Risk:
Architecture and artifact validation can regress without remote rejection.

Severity: Medium

Fix Grade: P2

Recommended Fix:
Add .github/workflows/ci.yml running pnpm install --frozen-lockfile, pnpm test, pnpm evals check --json, and later pnpm verify.

Suggested Software / Method:
GitHub Actions.

Files Likely To Change:
- .github/workflows/ci.yml
- package.json if adding verify

Validation Command:
pnpm test && pnpm evals check --json

Acceptance Criteria:
- CI runs on pull_request and push.
- CI check names are stable and documented if branch protection uses them.

### GAP-013: Research/Audit Artifact Tracking Policy Is Ambiguous

Category: governance / repo management

Current State:
.harness/research is untracked and not ignored by .gitignore. The new evidence documents are local artifacts, but the repo has no explicit tracking/retention policy for research/audits.

Expected State:
Research inputs and generated audits should be either intentionally tracked as durable evidence or intentionally ignored as local research, with docs and .gitignore aligned.

Evidence Basis:
Evidence.md:1135-1143 emphasizes durable artifact promotion and external mutation guards. Repo docs say artifacts should be committed only when cited proof or closure evidence in README.md:109-111.

Code Evidence:
- .gitignore:1-2 only ignores node_modules and .pnpm-store.
- git status shows ?? .harness/research/.

Risk:
Important research may be lost, or private transcript material may be committed accidentally.

Severity: Medium

Fix Grade: P1

Recommended Fix:
Decide policy. For this audit lane, likely track .harness/research/deep and .harness/research/audits as evidence artifacts, but add privacy checks and docs. If local-only, add ignore rules and a retained summary pointer.

Suggested Software / Method:
.gitignore, SECURITY.md privacy section, pnpm verify privacy regex.

Files Likely To Change:
- .gitignore
- SECURITY.md
- CONTRIBUTING.md

Validation Command:
git status --short --branch; privacy regex from AGENTS.md

Acceptance Criteria:
- Research/audit artifact policy is explicit.
- Privacy scan covers chosen artifact paths before commit.

## 5. Contradictions

### CONTRADICTION-001: Acceptance command implies execution, implementation simulates

Claim:
README.md:3-7 says one offline command runs one synthetic smoke fixture and writes a replayable artifact bundle. AGENTS.md:33-40 calls pnpm evals run fixtures/smoke/pr-closeout.case.json --json the acceptance command.

Actual Implementation:
src/cli.js:401-410 creates a simulated execution object; src/cli.js:249-255 returns canned stdout.

Evidence:
The command log records simulated_command in .harness/evals/runs/20260518T212318Z-pr-closeout-f8d3bda9/command-log.json:2-4.

Severity: High

Operational Impact:
Agents can treat a pass as executable proof when it is currently a controlled simulation.

Recommended Fix:
Add execution_mode to artifacts immediately, then implement bounded real execution for non-synthetic fixtures.

### CONTRADICTION-002: validate is documented as validation but is not run-equivalent

Claim:
README.md:121-123 and CONTRIBUTING.md:58-73 frame evals validation as proving fixture/latest shape and artifacts.

Actual Implementation:
run applies validateCase policy. validate case only applies schemaCheck.

Evidence:
src/cli.js:361-364 versus src/cli.js:620-623.

Severity: High

Operational Impact:
validate can produce false readiness.

Recommended Fix:
Make validate case run full policy checks.

### CONTRADICTION-003: Baseline state is supposed to be evidence, but presence is expected-state

Claim:
README.md:115-123 says closure evidence includes baseline field values and schema validation.

Actual Implementation:
src/cli.js:418 copies expected_presence from fixture into baseline result.

Evidence:
fixtures/smoke/pr-closeout.case.json:35-38; src/cli.js:416-428.

Severity: High

Operational Impact:
Baseline presence can be asserted without proof.

Recommended Fix:
Derive observed baseline state from artifact existence and hash.

### CONTRADICTION-004: Full validation lane is binding in AGENTS but not executable as one gate

Claim:
AGENTS.md:70-82 says use the plan validation commands at minimum.

Actual Implementation:
package.json:6-11 lacks a verify command; no CI workflow exists.

Severity: Medium

Operational Impact:
Closeout evidence varies by operator.

Recommended Fix:
Add pnpm verify and later CI.

## 6. Missing Features

Runtime state:
- Runtime card/current-state packet.
- Safe-to-run status.
- Stale-state detection.
- Tracker override recovery check in machine-readable output.

Command selection:
- Recommended next command gate.
- One-command verify wrapper.
- Mode distinction between synthetic simulation and real execution.

Verification:
- Real command execution.
- validate/run policy parity.
- Observed baseline presence.
- Closure evidence consistency against latest run id.

Validation:
- latest.json schema.
- Full JSON Schema validator or documented local subset.
- Date-time strictness tests.
- Promotion candidate validation.

Architecture enforcement:
- Import/layer checks not needed yet because code is one file, but a future split should add module-boundary tests.
- No CI rejection of schema/contract drift.

Traces:
- trace-events.jsonl.
- Tool-call records.
- Recovery event records.
- Attempt and retry metadata.

Context:
- Hot/cold context policy is in docs but not machine-checked.
- No context budget or stale-context detection.
- No source promotion policy for research/deep to implementation tickets.

Skills:
- No repo-local skills, appropriate for phase one.
- Repeated workflows should become scripts before skills.

Recovery:
- Missing dependency recovery.
- Auth/session recovery.
- Stale branch recovery.
- Blind retry prevention.

Governance:
- No trace promotion approval gate.
- No allowed_uses separation for eval-only/few-shot/holdout/regression.
- No review owner/rubric schema.
- Privacy regex not wrapped or CI-enforced.

CI/CD:
- No GitHub Actions workflow.
- No required check naming surface.

Observability:
- No OTEL/trace abstraction, intentionally blocked for phase one as authority.
- Local trace artifact can be added without telemetry exporter.

## 7. Fix Roadmap

### Phase 1 — Critical Trust Boundary Fixes

Objective:
Reduce false-success, stale-state, unsafe-command, and missing-evidence risk.

Fixes included:
- GAP-001 real bounded command execution or explicit execution_mode.
- GAP-002 validate/run policy parity.
- GAP-003 observed baseline presence.
- GAP-005 verify wrapper.
- GAP-013 research/audit artifact policy.

Files likely affected:
- src/cli.js
- test/cli.test.js
- package.json
- scripts/verify-work.sh
- schemas/baseline-result.schema.json
- .gitignore / SECURITY.md / CONTRIBUTING.md depending on research policy

Validation gates:
- pnpm test
- pnpm evals run fixtures/smoke/pr-closeout.case.json --json
- pnpm evals check --json
- privacy regex from AGENTS.md

Expected risk reduction:
High. This phase directly attacks false pass and inconsistent validation.

### Phase 2 — Mechanical Enforcement

Objective:
Make machine-readable contracts complete and externally checkable.

Fixes included:
- GAP-006 latest.json schema.
- GAP-007 real JSON Schema validator or explicit subset.
- GAP-012 CI workflow.
- Closure/latest consistency tests.

Files likely affected:
- schemas/latest-run.schema.json
- src/cli.js
- package.json
- pnpm-lock.yaml if adding AJV
- .github/workflows/ci.yml
- tests/docs-pr-changes.test.js

Validation gates:
- pnpm test
- pnpm evals check --json
- GitHub Actions run once added

Expected risk reduction:
Medium-high. This reduces contract drift and makes validation repeatable outside local sessions.

### Phase 3 — Runtime Harness Maturity

Objective:
Turn the smoke runner into a replayable, classifiable harness.

Fixes included:
- GAP-004 runtime state command.
- GAP-008 trace-events.jsonl.
- Attempt tracking, retry budget fields, stop reasons, verifier ownership.

Files likely affected:
- src/cli.js
- schemas/current-state.schema.json
- schemas/trace-event.schema.json
- schemas/eval-result.schema.json
- test/cli.test.js

Validation gates:
- pnpm evals state --json
- pnpm test

Expected risk reduction:
Medium. This improves agent autonomy and recovery without adding external services.

### Phase 4 — Context and Skill Compression

Objective:
Convert repeated prompt-driven operations into bounded repo-native workflows.

Fixes included:
- Research/audit promotion policy.
- Context source classification.
- Optional command recipes for audit generation and fixture promotion dry runs.

Files likely affected:
- CONTRIBUTING.md
- SECURITY.md
- scripts/
- .harness/research/README.md

Validation gates:
- pnpm test
- privacy regex

Expected risk reduction:
Medium. This reduces repeated-agent drift and accidental private artifact handling.

### Phase 5 — Governance and Scaling

Objective:
Prepare for real fixtures, human labels, judge calibration, and broader Codex autonomy without losing deterministic release authority.

Fixes included:
- GAP-009 trace-to-fixture promotion dry-run command.
- GAP-010 scorer taxonomy.
- GAP-011 human review queue and label schema.
- Judge calibration status.

Files likely affected:
- schemas/eval-case.schema.json
- schemas/scorer-result.schema.json
- schemas/human-label.schema.json
- schemas/review-queue-item.schema.json
- src/cli.js
- SECURITY.md

Validation gates:
- pnpm test
- pnpm evals check --json
- promotion dry-run tests

Expected risk reduction:
Medium-high for future phases. This prevents fuzzy judges and real logs from becoming hidden authority.

## 8. Highest-Leverage Fixes

| Rank | Fix | Impact | Difficulty | Risk Reduced | Why First |
|---|---|---|---|---|---|
| 1 | Execute fixture command or mark synthetic execution_mode | Very high | Medium | False pass | Current pass can be simulated only. |
| 2 | Unify validate and run policy validation | High | Low | False readiness | Small patch, direct API contract repair. |
| 3 | Derive baseline presence from observed artifact | High | Medium | Fake baseline | Baseline trust is core to regression evidence. |
| 4 | Add pnpm verify wrapper | High | Low | Incomplete validation | Turns AGENTS policy into a gate. |
| 5 | Add current-state packet | High | Medium | Stale state | Gives agents a safe-to-run truth surface. |
| 6 | Add latest-run schema | Medium | Low | Contract drift | Cheap machine-readable pointer enforcement. |
| 7 | Add CI workflow | Medium | Low | Local-only validation | Makes deterministic lane reject regressions remotely. |
| 8 | Add research artifact tracking/privacy policy | Medium | Low | Accidental data leak/loss | Current research dir is untracked and policy-ambiguous. |
| 9 | Add trace-events.jsonl | Medium | Medium | Poor replayability | Needed before retry/recovery maturity. |
| 10 | Add scorer taxonomy | Medium | Medium | Judge authority drift | Needed before any fuzzy/human scoring phase opens. |

## 9. Implementation Advice

What to build first:
Build the smallest trust-boundary patch: validate/run parity, observed baseline, and explicit execution_mode. Then add pnpm verify.

What not to build yet:
Do not add dashboards, external adapters, cloud runners, telemetry exporters, plugin systems, source-mining automation, or required LLM judge gates. Those remain phase-one hard blocks.

What to remove:
Do not remove simulation yet; reclassify it. Simulation is useful for smoke, but it must be impossible to confuse with real command execution.

What to simplify:
Keep the CLI small. Avoid splitting src/cli.js into architecture layers until real complexity appears. Add helper functions and tests first.

What should become a validator:
- validate/run parity.
- latest.json schema.
- baseline observed-state check.
- privacy/research artifact policy.
- future scorer taxonomy and judge calibration status.

What should become a schema:
- latest-run.schema.json.
- current-state.schema.json.
- trace-event.schema.json.
- promotion-candidate.schema.json.
- human-label.schema.json later.

What should become a skill:
Nothing yet. The repo should first add deterministic scripts. If audit/promotion workflows repeat after two or three runs, then consider a repo-local skill that calls those scripts rather than restating prose.

What should become documentation:
- Research/audit artifact tracking policy.
- Execution mode semantics.
- Phase boundary for synthetic versus real fixtures.
- CI check names once added.

What should become CI:
- pnpm test.
- pnpm evals check --json.
- pnpm verify once added.

What should remain manual:
- Approving real production trace promotion.
- Promoting baselines.
- Allowing judge scores to become blocking.
- Creating/linking the Linear parent issue until connector recovery is real.

## 10. Final Recommendation

Immediate next action:
Patch src/cli.js so validate case uses the same policy validation as run, then add a regression test. This is the safest first patch because it is small, deterministic, and removes a direct false-readiness path.

Safest first patch:
GAP-002 validate/run parity.

Highest-risk missing system:
Real execution evidence. Until GAP-001 is fixed or execution_mode is explicit, generated artifacts can be mistaken for stronger proof than they are.

Best validation command to add first:
pnpm verify, backed by scripts/verify-work.sh, running the AGENTS.md minimum validation lane.

Ready for broader Codex autonomy:
Not yet. The repo is ready for bounded Codex work on schemas, tests, and the CLI. It is not ready for broader autonomous promotion, baseline management, trace ingestion, or judge-backed decisions until current-state, real execution, promotion governance, and CI gates exist.
