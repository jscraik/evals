# Evals Evidence-Led Gap Fixes Linear Plan

schema_version: 1
selected_stage: he-linear-plan
source_artifact: .harness/research/audits/2026-05-20-evidence-led-codebase-gap-audit.md
created_date: 2026-05-20
repo: evals
linear_mutation_status: created
required_confirmation: "Satisfied by Jamie's request to use Linear to create the issues."
live_linear_blocker: "None for issue creation. The Codex app wrapper returned unsupported call, but the direct Linear plugin namespace created the issues. No exact evals repo project was found, so project assignment was intentionally left empty."
decision_artifact_status: present
core_artifact_status: present
source_prompt_family_status: not_applicable
subagent_policy: conditional
roles_used: []
roles_recommended:
  - repo-research-analyst
  - learnings-researcher
  - scope-guardian-reviewer
  - project-standards-reviewer
roles_missing: []
git_staging_status: unstaged
staged_paths: []

## Command Summary

BLUF: This Linear plan converts the evidence-led audit for the evals repository into the smallest useful execution slice: fix the false-success trust boundary first, then add mechanical enforcement, runtime state, and future governance only after deterministic proof is stable. The plan matters because evals is supposed to prove the proof system, not become another project's full eval runner, so the active work must preserve Jamie's operating mantra: Thin surface. Strong guardrails. Durable memory. Professional output. The recommendation is to create a small set of Feature and Governance / Policy issues under the JSC team with the verified Repo › evals label, but leave project assignment empty until Jamie confirms whether evals should get its own repo control project or route through an existing portfolio project. The main risk is issue explosion from the audit's thirteen gaps, so this plan collapses them into one Now parent, one Next parent, and later governance work instead of one issue per observation. The next action is to approve or revise the Now parent issue and first two sub-issues before any live Linear mutation.

Decision Needed: approve, revise, or keep local only.
Top Risks:
- False success stays possible if run artifacts can still pass without real or explicitly synthetic execution evidence.
- Linear noise increases if every audit observation becomes its own issue instead of a bounded execution slice.
- Phase-one boundaries drift if future trace, judge, dashboard, adapter, or plugin-system ideas are pulled into the first implementation batch.
Next Action: Review the Now parent and sub-issues; approve live Linear creation only for the selected slice.

## Executive Linear Routing Summary

| Field | Status |
|---|---|
| Recommended action | Create a small Linear issue set only after confirmation. |
| Active slice | Phase 1 critical trust-boundary fixes from the audit. |
| Linear destination | JSC team with Repo › evals label. |
| Project assignment | Empty / blocked pending Jamie confirmation. |
| Cycle | Current cycle 4 may be used only if Jamie treats this as current execution. |
| Issue templates | Feature for runtime/schema/CLI work; Governance / Policy for artifact tracking and phase-boundary policy. |
| Mutation | Created in Linear. |

## Created Linear Issues

| Identifier | Title | Status | Priority | Labels | Project | Cycle |
|---|---|---|---|---|---|---|
| JSC-332 | [evals] Close false-success trust boundary | Todo | High | Repo › evals; Feature; Roadmap: Now; Eval; Reliability | empty | Cycle 4 auto-assigned by Linear |
| JSC-333 | [evals] Make validate enforce run policy contract | Todo | High | Repo › evals; Feature; Roadmap: Now; Eval; Reliability | empty | Cycle 4 auto-assigned by Linear |
| JSC-334 | [evals] Mark run artifacts with explicit execution mode | Todo | High | Repo › evals; Feature; Roadmap: Now; Eval; Reliability | empty | Cycle 4 auto-assigned by Linear |
| JSC-335 | [evals] Derive baseline presence from observed artifact state | Todo | High | Repo › evals; Feature; Roadmap: Now; Eval; Reliability | empty | Cycle 4 auto-assigned by Linear |
| JSC-336 | [evals] Add first pnpm verify wrapper | Todo | Medium | Repo › evals; Feature; Roadmap: Now; Eval; Reliability | empty | Cycle 4 auto-assigned by Linear |

## Target Linear Destination

| Surface | Evidence | Status |
|---|---|---|
| User | Linear user jscraik resolved by read-only tool. | verified |
| Team | JSC / Jscraik, team id 52ae4e68-6b65-418d-a8d6-c27b61b6ec92. | verified |
| Initiative | Dev Portfolio exists and is active. | verified |
| Repo label | Repo › evals exists with description Work owned by the evals repository. | verified |
| Current cycle | Cycle 4 is current, ending 2026-05-24T23:00:00Z. | verified |
| Repo project | Exact project lookup for evals returned Project not found. | blocked |
| Portfolio Ops project | Exact project lookup for Portfolio Ops returned Project not found through this tool surface. | blocked |

live_linear_setup_status: partial
label_status: partial
template_status: unavailable
existing_project_match: "No exact evals repo project found. Search surfaced Repo surface contract and golden paths, but it is not an exact repo control project and must not be selected without confirmation."
project_assignment_reason: "empty because no exact evals repo project was verified"
cycle_assignment_reason: "Linear auto-assigned created issues to current Cycle 4"
github_tracking_rule: "If created, implementation branches and PRs should include the primary Linear issue identifier."
delivery_evidence_rule: "Do not mark shipped from PR merge alone; use closure eval, passing validation, and any release/tag/changelog evidence that applies."

## Existing Project Match

| Candidate | Live Evidence | Fit | Mutation Safety |
|---|---|---|---|
| Exact evals repo project | get_project evals returned Project not found. | none | blocked |
| Repo surface contract and golden paths | Search returned project a6179515-8cd8-4cff-944a-289a56174b6b. | possible portfolio-adjacent fit, not exact | confirmation_required |
| No project, labels only | Repo › evals label verified. | safest default for repo-specific issue intake | safe after confirmation |

Recommendation:
Use labels-only filing first unless Jamie confirms that evals should attach to Repo surface contract and golden paths or that a dedicated repo control project should be created separately.

## ADR / Decision Artifact Readiness

decision_artifact_status: present

The audit uses existing core doctrine and the newly inserted north star rather than requiring a fresh ADR before execution. No live issue should redefine the repository mission. If an implementation change alters public CLI contracts, durable terminology, validation strategy, phase-one hard blocks, or future agent workflow, route that change through the repo's deep module fix mechanics before coding.

Decision evidence:
- .harness/core/2026-05-18-evals-core.md
- UBIQUITOUS_LANGUAGE.md
- .harness/refactors/2026-05-20-deep-module-fix-mechanics.md
- .harness/research/audits/2026-05-20-evidence-led-codebase-gap-audit.md

## Core / Invariant Artifact Readiness

core_artifact_status: present

Relevant invariants:
- Artifacts decide.
- Telemetry explains.
- LLM judges advise until calibrated.
- Repo-local suites own domain truth.
- External frameworks are adapters.
- Thin surface. Strong guardrails. Durable memory. Professional output.

## Proposed Milestones

| Milestone | Purpose | Included Work | Status |
|---|---|---|---|
| Trust Boundary Closeout | Remove false-ready and false-success paths from the phase-one executable spine. | GAP-001, GAP-002, GAP-003, GAP-005, selected GAP-013. | Now |
| Mechanical Enforcement | Make contracts machine-checkable locally and in CI. | GAP-006, GAP-007, GAP-012, closure/latest consistency. | Next |
| Runtime Memory Loop | Add current-state and replayable trace memory without external telemetry authority. | GAP-004, GAP-008, attempt/retry metadata. | Later |
| Governance Expansion | Prepare promotion, scorer taxonomy, and human label gates without judge authority drift. | GAP-009, GAP-010, GAP-011. | Later |

## Proposed Parent Issues

### Parent Issue 1: Close the evals false-success trust boundary

template: Feature
issue_type: feature
priority: High
repo_location_label: Repo › evals
project: empty
cycle: empty unless confirmed current
recommended_status: Triage or Todo
source_artifacts:
- .harness/research/audits/2026-05-20-evidence-led-codebase-gap-audit.md
- .harness/core/2026-05-18-evals-core.md
- UBIQUITOUS_LANGUAGE.md

Objective:
Make the phase-one executable spine unable to claim readiness from simulated or schema-only evidence unless that mode is explicit and intentionally synthetic.

Why This Matters:
The audit's highest-risk finding is false success. If evals can produce pass-looking artifacts without real or explicitly synthetic execution evidence, downstream agents will overtrust the proof spine.

Scope:
- Align validate and run policy checks.
- Add explicit execution_mode to run artifacts.
- Derive baseline presence from observed artifact existence/hash evidence.
- Add or prepare pnpm verify as the single minimum validation lane.

Out of Scope:
- Trace ingestion.
- Cloud runners.
- Plugin systems.
- Required LLM judge gates.
- Moving another repo's full eval suite into this repo.

Validation Gates:
- pnpm test
- pnpm evals run fixtures/smoke/pr-closeout.case.json --json
- pnpm evals check --json
- AGENTS privacy regex

Rollback Conditions:
- Revert if the smoke fixture can no longer produce a local artifact bundle or if synthetic fixture behavior becomes ambiguous.

### Parent Issue 2: Add machine-checkable evals enforcement surfaces

template: Feature
issue_type: feature
priority: Medium
repo_location_label: Repo › evals
project: empty
cycle: empty
recommended_status: Backlog or Todo

Objective:
Turn the audit's mechanical enforcement gaps into schemas, tests, and CI-ready gates after the trust boundary is closed.

Scope:
- Add latest-run.schema.json.
- Decide whether to adopt a full JSON Schema validator or document the local subset.
- Add CI workflow for deterministic checks.
- Add closure/latest consistency tests.

Validation Gates:
- pnpm test
- pnpm evals check --json
- GitHub Actions passing after workflow creation

### Parent Issue 3: Define the evals runtime memory loop

template: Feature
issue_type: feature
priority: Medium
repo_location_label: Repo › evals
project: empty
cycle: empty
recommended_status: Later

Objective:
Add a local current-state packet and replayable trace memory so future Codex runs can reason from durable facts without adding external telemetry authority.

Scope:
- pnpm evals state --json
- current-state.schema.json
- trace-event.schema.json
- optional trace-events.jsonl
- attempt, retry, stop reason, and verifier ownership fields

Validation Gates:
- pnpm evals state --json
- pnpm test

### Parent Issue 4: Govern fixture promotion and future scorer authority

template: Governance / Policy
issue_type: governance_policy
priority: Medium
repo_location_label: Repo › evals
project: empty
cycle: empty
recommended_status: Later

Objective:
Prevent production traces, human labels, judge outputs, and cross-project contract observations from becoming hidden authority.

Scope:
- promotion-candidate.schema.json
- contract-observation.schema.json
- human-label.schema.json
- scorer taxonomy for deterministic, human, and advisory judge evidence
- trace-to-fixture dry-run policy

Validation Gates:
- pnpm test
- pnpm evals check --json
- promotion dry-run tests once added

## Proposed Sub-Issues

### NOW-1: Make validate case enforce the same policy contract as run

template: Feature
parent: Close the evals false-success trust boundary
source_gap: GAP-002
priority: High
repo_location_label: Repo › evals

Objective:
Remove the direct false-readiness path where validation can pass a case that run would reject.

Acceptance Criteria:
- validate case runs schema validation and the same policy validation used by run.
- Negative tests prove policy-invalid fixtures fail validation.
- JSON output distinguishes schema errors from policy errors.

Validation Gates:
- pnpm test
- pnpm evals check --json

### NOW-2: Add explicit execution_mode and preserve synthetic smoke safely

template: Feature
parent: Close the evals false-success trust boundary
source_gap: GAP-001
priority: High
repo_location_label: Repo › evals

Objective:
Make every run artifact say whether it came from real bounded command execution or intentional synthetic/bootstrap execution.

Acceptance Criteria:
- Run artifacts include execution_mode.
- Synthetic mode is allowed only for explicitly synthetic fixtures.
- Non-synthetic fixtures cannot silently use canned command output.
- The smoke fixture remains usable while clearly marked synthetic if real execution is deferred from the same patch.

Validation Gates:
- pnpm test
- pnpm evals run fixtures/smoke/pr-closeout.case.json --json
- pnpm evals check --json

### NOW-3: Derive baseline presence from observed artifact state

template: Feature
parent: Close the evals false-success trust boundary
source_gap: GAP-003
priority: High
repo_location_label: Repo › evals

Objective:
Stop copying baseline presence from fixture expectation and instead compute it from artifact existence/hash evidence.

Acceptance Criteria:
- Baseline result records observed presence status.
- Missing baseline artifact produces the expected blocked/missing state.
- Tests cover existing, missing, and path-invalid baseline references.

Validation Gates:
- pnpm test
- pnpm evals check --json

### NOW-4: Add the first pnpm verify wrapper

template: Feature
parent: Close the evals false-success trust boundary
source_gap: GAP-005
priority: Medium
repo_location_label: Repo › evals

Objective:
Turn the AGENTS minimum validation lane into one repeatable repo command.

Acceptance Criteria:
- pnpm verify runs the documented minimum validation lane or calls scripts/verify-work.sh.
- Output is suitable for closeout evidence.
- The command records blocked steps clearly when an expected gate cannot run.

Validation Gates:
- pnpm verify
- pnpm test
- pnpm evals check --json

## Now / Next / Later / Do Not Create

| Bucket | Work | Linear Action |
|---|---|---|
| Now | Parent 1 and NOW-1 through NOW-4. | Create after confirmation. |
| Next | Parent 2 mechanical enforcement. | Create only if Jamie wants a separate tracking parent now. |
| Later | Parent 3 runtime memory loop. | Keep local until trust boundary and mechanical enforcement land. |
| Later | Parent 4 governance expansion. | Keep local unless scorer/promotion work starts. |
| Do Not Create | One issue for every audit gap. | Collapse into parents/sub-issues. |
| Do Not Create | Dashboard, cloud runner, plugin system, external adapter authority, required LLM judge gate. | Blocked by phase-one hard blocks. |
| Do Not Create | Full agent-skills local eval suite inside evals. | Use reduced portable contract cases only. |

## Dependency Map

~~~mermaid
flowchart TD
  A["NOW-1 validate/run parity"] --> B["NOW-2 explicit execution_mode"]
  B --> C["NOW-3 observed baseline presence"]
  A --> D["NOW-4 pnpm verify wrapper"]
  C --> D
  D --> E["Parent 2 mechanical enforcement"]
  E --> F["Parent 3 runtime memory loop"]
  F --> G["Parent 4 governance expansion"]
~~~

## Eval Gate Map

| Gate | Proves | Applies To |
|---|---|---|
| pnpm test | Unit and CLI regression behavior. | All implementation issues. |
| pnpm evals run fixtures/smoke/pr-closeout.case.json --json | Smoke fixture still emits local artifact bundle. | NOW-2, NOW-3, NOW-4. |
| pnpm evals check --json | Latest artifact schemas, manifest hashes, scorer results, and baseline result validate. | All phases. |
| AGENTS privacy regex | No obvious sensitive credential material in fixtures/eval artifacts. | Artifact policy and closeout. |
| pnpm verify | Single closeout lane exists and is runnable. | NOW-4 and later CI. |

## Human vs Agent Execution Map

| Work | Best Executor | Human Decision Needed |
|---|---|---|
| NOW-1 validate/run parity | Codex | none after issue approval |
| NOW-2 execution_mode | Codex with reviewer | decide whether real execution lands now or synthetic mode is made explicit first |
| NOW-3 observed baseline | Codex | none after issue approval |
| NOW-4 verify wrapper | Codex | confirm command name if not pnpm verify |
| Project assignment | Jamie | choose no project, existing portfolio project, or new repo control project |
| Baseline promotion / trace promotion / judge gates | Jamie | explicit approval required |

## Story / Value Basis

The value is not "more evals." The value is a proof spine that future repositories can trust. The audit and north star define the operating model:

- Thin surface: small CLI, schemas, fixtures, and artifacts.
- Strong guardrails: deterministic checks before fuzzy judgement.
- Durable memory: artifact bundles and manifests outlive chat summaries.
- Professional output: stable JSON and readable closeout evidence.

## Recommended Labels

| Label | Live Status | Use |
|---|---|---|
| Repo › evals | verified | required on all issues |
| Feature | verified under Type (workspace) | runtime, schema, CLI, CI work |
| Bug | verified under Type (workspace) | only if a specific reproducible defect issue is created |
| Improvement | verified under Type (workspace) | fallback if Feature is too broad |
| Governance / Policy | not verified as label | template concept only unless live label exists |
| Roadmap labels | not fully verified in current label list | confirmation_required before mutation |

## Repo / Location Label

repo_location_label: Repo › evals

Do not create issues without this label or an explicitly confirmed replacement.

## Priority Mapping

| Priority | Meaning | Proposed Items |
|---|---|---|
| High | Reduces false-success or false-readiness risk. | NOW-1, NOW-2, NOW-3 |
| Medium | Improves repeatability and closeout discipline. | NOW-4, Parent 2 |
| Low / Later | Useful after proof spine is trustworthy. | Parent 3, Parent 4 |

## Project / Cycle Justification

project_assignment_reason: empty because no exact evals repo project was verified

There is no verified exact evals repo project. The safest plan is labels-only issue filing until Jamie confirms one of these choices:

1. Leave project empty and use Repo › evals plus type/roadmap labels.
2. Attach to Repo surface contract and golden paths if this work is intentionally portfolio-surface work.
3. Create a dedicated repo control project for evals in a separate approved mutation.

cycle_assignment_reason: Linear auto-assigned created issues to current Cycle 4

Use current cycle 4 only if Jamie confirms this is current execution rather than backlog shaping.

## Project Reactivation Recommendation

Do not create or reactivate a project from this plan. If evals becomes recurring active execution, create a separate Linear plan for whether it needs a repo control project under Dev Portfolio.

## Portfolio Ops Items

No Portfolio Ops issue should be created from this artifact. The only portfolio-level question is whether evals deserves a repo control project or remains labels-only for now.

## Dev Portfolio Impact

This work strengthens the shared proof spine that other repos can reuse, but it is still repo-specific implementation in evals. It should not become a Dev Portfolio initiative item unless Jamie turns evals into a formal portfolio control surface.

## GitHub PR Tracking

When issues are created, the implementation PR should reference the primary Now parent issue. Branches should include the Linear identifier after creation, for example:

~~~text
jsc-###-evals-trust-boundary
~~~

Do not treat a merged PR as shipped evidence. Closure should cite the repo validation gates and .harness/evals artifact state.

## Delivery Evidence

Required closeout evidence for the Now slice:
- Source issue identifier if Linear issues are created.
- Changed files.
- Exact validation commands and pass/fail/blocked outcomes.
- pnpm evals check --json result.
- Artifact paths for the latest run.
- Note whether execution evidence is real or explicitly synthetic.
- Residual risk and next recommended issue.

## Evidence & Traceability Matrix

| Plan Item | Audit Evidence | Repo Doctrine | Validation |
|---|---|---|---|
| NOW-1 validate/run parity | GAP-002, CONTRADICTION-002 | Artifacts decide; strong guardrails | pnpm test, pnpm evals check --json |
| NOW-2 execution_mode | GAP-001, CONTRADICTION-001 | Thin surface; professional output | smoke run + check |
| NOW-3 observed baseline | GAP-003, CONTRADICTION-003 | Durable memory | pnpm test, baseline result inspection |
| NOW-4 verify wrapper | GAP-005, CONTRADICTION-004 | Strong guardrails | pnpm verify |
| Parent 2 enforcement | GAP-006, GAP-007, GAP-012 | deterministic gates | CI + check |
| Parent 3 memory loop | GAP-004, GAP-008 | durable memory | state command + trace schema |
| Parent 4 governance | GAP-009, GAP-010, GAP-011 | no hidden authority | promotion/scorer tests |

## Visual References / Diagrams

~~~mermaid
flowchart LR
  A["Audit gaps"] --> B["Now: trust boundary"]
  B --> C["Next: mechanical enforcement"]
  C --> D["Later: runtime memory loop"]
  D --> E["Later: governance expansion"]

  B --> B1["validate/run parity"]
  B --> B2["execution_mode"]
  B --> B3["observed baseline"]
  B --> B4["pnpm verify"]

  E -. blocked .-> F["No dashboards, cloud runners, plugin systems, or judge gates in phase one"]
~~~

## Ready-To-Create Payloads

These payloads were applied through the direct Linear plugin namespace after the
Codex app wrapper returned unsupported call. Keep them as trace evidence for the
created issue shape.

### Payload: Parent 1

~~~yaml
title: "[evals] Close false-success trust boundary"
template: Feature
team: JSC
project: null
cycle: null
labels:
  - "Repo › evals"
  - "Feature"
priority: High
description: |
  ## Objective
  Make the phase-one executable spine unable to claim readiness from simulated or schema-only evidence unless that mode is explicit and intentionally synthetic.

  ## Source Artifacts
  - .harness/research/audits/2026-05-20-evidence-led-codebase-gap-audit.md
  - .harness/core/2026-05-18-evals-core.md
  - UBIQUITOUS_LANGUAGE.md

  ## Why This Matters
  The highest-risk audit finding is false success. Evals should prove the proof system, so pass-looking artifacts must be backed by real or explicitly synthetic evidence.

  ## Scope
  - Align validate and run policy checks.
  - Add explicit execution_mode.
  - Derive baseline presence from observed artifact evidence.
  - Add the first pnpm verify wrapper.

  ## Out of Scope
  - Dashboards, external adapters, cloud runners, plugin systems, required LLM judge gates.
  - Importing another repo's complete eval suite.

  ## Execution Notes
  Preserve phase-one hard blocks and use deep module fix mechanics for public CLI/schema changes.

  ## Validation Gates
  - pnpm test
  - pnpm evals run fixtures/smoke/pr-closeout.case.json --json
  - pnpm evals check --json

  ## Rollback Conditions
  Revert if smoke artifacts become unreplayable or synthetic/real execution evidence becomes ambiguous.

  ## Linear Routing
  Team JSC. Label Repo › evals. Project empty until confirmed.
~~~

### Payload: NOW-1

~~~yaml
title: "[evals] Make validate enforce run policy contract"
template: Feature
team: JSC
project: null
cycle: null
labels:
  - "Repo › evals"
  - "Feature"
priority: High
parent: "[evals] Close false-success trust boundary"
description: |
  ## Objective
  Make validate case apply the same policy validation as run.

  ## Source Artifacts
  - GAP-002 in .harness/research/audits/2026-05-20-evidence-led-codebase-gap-audit.md

  ## Why This Matters
  validate can currently produce false readiness.

  ## Scope
  - Reuse or share the policy validation path between run and validate.
  - Add negative fixture tests.
  - Preserve JSON output clarity.

  ## Out of Scope
  - Real command execution.

  ## Validation Gates
  - pnpm test
  - pnpm evals check --json

  ## Rollback Conditions
  Revert if valid smoke fixtures fail without a clear policy error.
~~~

### Payload: NOW-2

~~~yaml
title: "[evals] Mark run artifacts with explicit execution mode"
template: Feature
team: JSC
project: null
cycle: null
labels:
  - "Repo › evals"
  - "Feature"
priority: High
parent: "[evals] Close false-success trust boundary"
description: |
  ## Objective
  Record whether a run used real bounded execution or intentional synthetic execution.

  ## Source Artifacts
  - GAP-001 in .harness/research/audits/2026-05-20-evidence-led-codebase-gap-audit.md

  ## Why This Matters
  Agents must not mistake bootstrap simulation for real execution proof.

  ## Scope
  - Add execution_mode to artifacts and schemas.
  - Restrict synthetic mode to explicitly synthetic fixtures.
  - Keep the smoke fixture usable.

  ## Out of Scope
  - External runners, cloud execution, telemetry exporters.

  ## Validation Gates
  - pnpm test
  - pnpm evals run fixtures/smoke/pr-closeout.case.json --json
  - pnpm evals check --json
~~~

## Validation

| Command | Status | Evidence |
|---|---|---|
| Read he-linear-plan source contract | pass | Loaded source skill and output contract. |
| Read repo required context | pass | Loaded .harness/core/2026-05-18-evals-core.md, UBIQUITOUS_LANGUAGE.md, and source audit. |
| Linear read-only destination check | pass_with_blockers | JSC team, Dev Portfolio, current cycle, and Repo › evals label verified; exact evals repo project not found. |
| Live Linear mutation | pass | Created JSC-332 parent plus JSC-333, JSC-334, JSC-335, and JSC-336 children through mcp__linear__save_issue. |
| Codex app Linear wrapper | blocked | mcp__codex_apps__linear_save_issue returned unsupported call; direct Linear plugin namespace was used instead. |
| BLUF structure check | pass | HE BLUF checker returned status pass for this artifact. |
