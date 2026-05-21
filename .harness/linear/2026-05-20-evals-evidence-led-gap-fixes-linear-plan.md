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

BLUF: This Linear plan converted the evidence-led audit for the evals repository into the smallest useful execution slice: fix the false-success trust boundary first, then add mechanical enforcement, runtime state, and future governance only after deterministic proof is stable. The plan matters because evals is supposed to prove the proof system, not become another project's full eval runner, so the active work preserves Jamie's operating mantra: Thin surface. Strong guardrails. Durable memory. Professional output. Jamie approved live Linear creation for the Now slice, and the JSC team issues were created with the verified Repo › evals label while project assignment was left empty because no exact evals project was confirmed. The main risk remains issue explosion from the audit's thirteen gaps, so this plan intentionally created only the Now parent and four child issues rather than one issue per observation.

Decision Recorded: Jamie approved live Linear creation for the Now parent and first four sub-issues.
Top Risks:
- False success stays possible if run artifacts can still pass without real or explicitly synthetic execution evidence.
- Linear noise increases if every audit observation becomes its own issue instead of a bounded execution slice.
- Phase-one boundaries drift if future trace, judge, dashboard, adapter, or plugin-system ideas are pulled into the first implementation batch.
Next Action: Execute JSC-332 through JSC-336 in dependency order, then decide whether the Next/Later parent groups should be promoted.

## Executive Linear Routing Summary

| Field | Status |
|---|---|
| Recommended action | Created the confirmed Now issue set only. |
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
| Runtime Evidence Contract | Add portable offline cases for Codex runtime-governed agent operations without importing Codex, agent-skills, coding-harness, or .agents at runtime. | permission profile resolution, goal accounting, subagent stop, extension turn binding, plugin attribution, network policy, package provenance, websocket trace split. | Later / after trust boundary and enforcement |
| Governance Expansion | Prepare promotion, scorer taxonomy, and human label gates without judge authority drift. | GAP-009, GAP-010, GAP-011. | Later |

## 2026-05-21 Codex Runtime Evidence Addendum

source_status: integrated_as_eval_specific_planning
source_repo: /Users/jamiecraik/dev/codex
source_range_checked: 59507b849..20fedafff
codex_repo_mcp_status: unavailable_in_this_session

Jamie supplied a new Codex upstream digest after origin/main moved to
20fedafff. Live inspection of the local Codex checkout confirmed the relevant
runtime direction through commits and changed surfaces around permission profile
inheritance, runtime permission refresh, approval-disabled fallback rejection,
goal accounting, SubagentStop hooks, extension turn metadata, MCP plugin
attribution, MITM network enforcement, package/runtime provenance, thread
settings updates, and websocket warmup tracing.

This does not change the evals phase-one hard blocks. Evals must not import or
depend on Codex, agent-skills, coding-harness, or .agents. The integration point
is portable offline proof: representative fixtures, schemas, and deterministic
scorers that prove missing runtime evidence is caught.

### Codex Runtime Deltas That Matter To Evals

| Runtime delta | Codex evidence examples | Evals implication |
|---|---|---|
| Permission profiles are runtime policy, not just declarations. | fe7c069fe, 40ad7be2b, 713a5b1b0, a27d3847b, 63a72e6b7. | Add offline cases that distinguish declared, inherited, managed, effective, refreshed, and fallback permission states. |
| Approval-disabled read-only fallback is unsafe when writes are required. | a27d3847b. | Add a negative case that expects blocked: approvals_disabled_no_safe_fallback. |
| Goals are default-on runtime state with accounting semantics. | d4f842f3b, d84b824d5, 0e9d22217. | Add cases for goal_accounting_flush_failed and preserve/report behavior. |
| Subagent lifecycle has an explicit stop boundary. | eee3e60db. | Add a missing SubagentStop negative case before treating delegation artifacts as closed. |
| Extension tool calls carry turn_id and truncation_policy. | c5bd13156. | Add cases that fail when extension evidence has no turn binding or cannot prove output completeness. |
| MCP tool evidence carries plugin attribution. | 0a4179bb1 plus plugin discovery/listing commits. | Add cases for missing plugin_id, marketplace, or source when a plugin-backed tool call is part of evidence. |
| Network policy has MITM hook configuration and enforcement. | 3d94e24a3, f6970214d, 3cae84009, ed6d73b3b. | Add cases that distinguish network disabled, websearch used, MITM configured, MITM enforced, and redaction evidence. |
| Packaged runtimes have checksum, platform, DotSlash, and SDK launch provenance. | e9f59e30d, 110b30d54, e389e01f8, cb05de672, 0b4f86095. | Add package provenance cases for checksum and launch-source gaps. |
| App-server thread settings and service tier defaults are mutable/resolved runtime state. | 771a4e74a, edc48e461, 370b13afc. | Add thread_settings_revision drift cases before harness enforcement relies on runtime settings. |
| Websocket observability separates warmup from logical request tracing. | 20fedafff. | Add a case that prevents warmup traces from being counted as user-request proof. |

### Runtime Evidence Contract v1 Candidate

Do not create this as a Now issue. Treat it as the future parent that can follow
the trust-boundary and mechanical-enforcement parents when the executable spine
is ready to carry cross-repo runtime evidence examples.

Objective:
Define the portable payload shape that lets evals prove runtime evidence gaps
without owning the runtime, harness, skill, plugin, or collector systems.

Candidate minimal fields:

~~~yaml
runtime_evidence:
  codex_origin_main: 20fedafff
  thread_settings_revision: optional
  effective_permission_profile: required
  permission_profile_source: required
  approvals_enabled: required
  fallback_policy: required
  goal_accounting_status: optional
  extension_turn_id: optional
  truncation_policy: optional
  plugin_id: optional
  plugin_marketplace: optional
  subagent_start_seen: optional
  subagent_stop_seen: optional
  mitm_policy: optional
  package_checksum_ref: optional
  sdk_launch_source: optional
  raw_output_refs: required
~~~

Generic fixture payload shape:

~~~json
{
  "runtime_capabilities": {},
  "declared_contract": {},
  "resolved_runtime": {},
  "observed_events": [],
  "artifact_refs": [],
  "permission_profile": {},
  "goal_state": {},
  "thread_settings": {},
  "plugin_attribution": {},
  "network_policy": {},
  "package_provenance": {},
  "expected": {}
}
~~~

### Future Offline Fixture Backlog

These cases should be planned under Runtime Evidence Contract v1 or Parent 3/4
follow-up work, not under the active Now trust-boundary slice.

~~~text
permission-profile-inheritance.case.json
managed-permission-profile-requirements.case.json
runtime-permission-refresh.case.json
approval-disabled-readonly-fallback.case.json
goal-accounting-flush-failure.case.json
subagent-stop-missing.case.json
thread-settings-drift.case.json
extension-tool-call-turn-id-missing.case.json
extension-tool-call-truncation-policy-missing.case.json
plugin-id-attribution-missing.case.json
plugin-marketplace-source-missing.case.json
mitm-network-policy-missing.case.json
package-checksum-missing.case.json
sdk-launch-provenance-missing.case.json
logical-websocket-warmup-noise.case.json
~~~

### Example Future Cases

~~~json
{
  "schema_version": 1,
  "case_id": "approval-disabled-readonly-fallback",
  "intent": "Reject silent read-only fallback when approvals are disabled and the requested task requires writes.",
  "input": {
    "declared_contract": {
      "permission_profile": {
        "declared": "repo-write",
        "fallback_policy": "fail_closed"
      }
    },
    "resolved_runtime": {
      "effective_profile": "read-only",
      "approvals_enabled": false
    },
    "observed_events": [
      {
        "type": "task_requirement",
        "effect": "filesystem_write",
        "path_scope": "repo"
      }
    ]
  },
  "expected": {
    "verdict": "blocked",
    "classification": "approvals_disabled_no_safe_fallback"
  }
}
~~~

~~~json
{
  "schema_version": 1,
  "case_id": "subagent-stop-missing",
  "intent": "Fail closeout when a subagent starts but no terminal stop event or equivalent completion evidence exists.",
  "input": {
    "observed_events": [
      {
        "type": "SubagentStart",
        "agent_id": "reviewer-1",
        "expected_artifact": "review_report"
      },
      {
        "type": "ArtifactWritten",
        "agent_id": "reviewer-1",
        "artifact": "review_report"
      }
    ]
  },
  "expected": {
    "verdict": "fail",
    "classification": "missing_subagent_stop"
  }
}
~~~

~~~json
{
  "schema_version": 1,
  "case_id": "plugin-id-attribution-missing",
  "intent": "Detect MCP tool evidence that cannot be attributed to a plugin provider.",
  "input": {
    "observed_events": [
      {
        "type": "mcp_tool_call",
        "tool_name": "web_search",
        "plugin_id": null,
        "marketplace": null
      }
    ]
  },
  "expected": {
    "verdict": "fail",
    "classification": "missing_plugin_attribution"
  }
}
~~~

### Integration Routing

| Destination | Addendum action |
|---|---|
| Parent 1 / Now | No scope change. Keep the trust-boundary fixes first. |
| Parent 2 / Mechanical Enforcement | Consider latest/schema and CI proof strong enough before adding runtime-evidence schemas. |
| Parent 3 / Runtime Memory Loop | Add the Runtime Evidence Contract v1 parent here when current-state and trace-event ownership exists. |
| Parent 4 / Governance Expansion | Use runtime-evidence cases to prevent plugin, network, package, and goal evidence from becoming hidden authority. |
| .agents | Treat as observed-state prior art and future consumer evidence. Do not add runtime dependency from evals. |
| agent-skills / coding-harness | Treat as declared-contract and enforcement consumers. Do not move their domain truth into evals. |

### Updated Negative Risks

| Risk | Evals mitigation |
|---|---|
| Permission inheritance drift | Keep declared, inherited, managed, effective, and refreshed profiles distinct in fixture payloads. |
| Runtime refresh invalidates start assumptions | Add runtime-permission-refresh negative and positive cases before enforcement. |
| Approval-disabled unsafe fallback | Require blocked: approvals_disabled_no_safe_fallback in the representative case. |
| Goal accounting silent loss | Add goal_accounting_flush_failed classification. |
| Subagent non-closure | Require SubagentStop or equivalent terminal evidence in lifecycle closeout cases. |
| Plugin attribution gap | Require plugin_id and marketplace/source fields for plugin-backed MCP evidence cases. |
| Network policy laundering | Distinguish MITM configured, MITM enforced, websearch used, and redaction evidence. |
| Package provenance gap | Require checksum and SDK launch-source references for packaged-runtime evidence cases. |
| Warmup trace confusion | Keep warmup traces separate from logical websocket request proof. |

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
| Now | Parent 1 and NOW-1 through NOW-4. | Created after Jamie's confirmation. |
| Next | Parent 2 mechanical enforcement. | Not created; promote only if Jamie wants a separate tracking parent after the Now slice lands. |
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
