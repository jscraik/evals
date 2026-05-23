# Evals Runtime Evidence Enforcement Linear Plan

schema_version: 1
selected_stage: he-linear-plan
source_artifact: .harness/research/audits/2026-05-22-evidence-led-codebase-gap-audit.md
created_date: 2026-05-22
repo: evals
linear_mutation_status: created
required_confirmation: "Satisfied by Jamie's 2026-05-22 approval: now update linear."
live_linear_blocker: "None for the approved parent/children. Exact evals repo project is still not present in Dev Portfolio, so issues were filed labels-only without project assignment. Template IDs remain unavailable from the active Linear tool surface, so each issue records its planned template shape in the description."
decision_artifact_status: present
core_artifact_status: present
source_prompt_family_status: not_applicable
subagent_policy: conditional
roles_used: []
roles_recommended:
  - project-standards-reviewer
  - scope-guardian-reviewer
  - api-contract-reviewer
roles_missing: []
live_linear_setup_status: partial
label_status: verified
template_status: unavailable
repo_location_label: "Repo > evals"
existing_project_match: "No exact evals repo project found by live Linear lookup. Dev Portfolio is active, but its listed projects do not include evals. Use labels-only filing unless Jamie confirms a repo project destination."
project_assignment_reason: "empty because no exact evals repo control project was verified"
cycle_assignment_reason: "Jamie approved live update; Linear assigned parent and children to current Cycle 4."
github_tracking_rule: "When implemented, include the primary Linear issue identifier in branch, commit, or PR context."
delivery_evidence_rule: "Do not mark shipped from PR merge alone; close from local validation, PR evidence when applicable, and updated eval/closure proof."
git_staging_status: unstaged
staged_paths: []

## Command Summary

BLUF: This Linear plan turned the 2026-05-22 evidence-led evals audit into a small execution slice for closing runtime-evidence trust gaps without reopening the whole backlog. Jamie approved live Linear mutation, and the approved follow-up parent plus four child issues now exist as JSC-346 through JSC-350. This matters because the repo already has a real executable spine, but the audit found several places where readiness or runtime-evidence claims can look stronger than the checks actually prove. The main constraint remains that live Linear already has JSC-345 marked Done for defining Runtime Evidence Contract v1, so this plan treats JSC-345 as prior context rather than reopening it. The next action is to implement the child issues in the recommended order and preserve exact validation evidence on each closeout.

Decision Needed: None. Live Linear update completed.

Top Risks:

- Reopening or duplicating JSC-345 would blur historical completion evidence and current follow-up scope.
- Creating one issue per audit gap would add noise and weaken the phase-one boundary.
- Pulling packaged runtimes, source mining, dashboards, or adapters into this slice would violate the repo's current hard blocks.

Next Action: Start JSC-348 or JSC-349 first, then reconcile parent progress before closing JSC-346.

## Target Linear Destination

| Surface | Live Evidence | Status | Mutation Safety |
|---|---|---|---|
| User | Linear user jscraik resolved with JSC team membership. | verified | safe |
| Team | JSC / Jscraik resolved, team id 52ae4e68-6b65-418d-a8d6-c27b61b6ec92. | verified | safe |
| Initiative | Dev Portfolio resolved and active. | verified | safe for portfolio context |
| Exact evals project | get_project evals returned Project not found. Dev Portfolio listed projects did not include evals. | missing | block project assignment |
| Repo label | Repo > evals issue label resolved as Repo › evals. | verified | use on every payload |
| Type labels | Feature, Policy, Docs resolved. | verified | use exact live labels |
| Operating labels | Eval, Reliability, Agent-Native, Governance resolved. | verified | use where relevant |
| Roadmap labels | Roadmap: Now and Roadmap: Next resolved. | verified | use exact live labels |
| Templates | Active tool surface does not expose template IDs. | unavailable | issues use template-shaped descriptions |
| Cycle | Current Cycle 4 exists and ends 2026-05-24T23:00:00Z. | verified | assigned by Linear after approval |

## Live Mutation Result

Jamie approved the proposed live update with: "now update linear." The approved parent and four children were created in Linear on 2026-05-22. All objects are assigned to the JSC team, status Todo, and current Cycle 4. No project was assigned because no exact evals repo project was verified.

| Linear Issue | Title | Priority | Labels | Parent | URL |
|---|---|---:|---|---|---|
| JSC-346 | [evals] Close 2026-05-22 runtime-evidence trust gaps | High | Repo › evals; Feature; Eval; Reliability; Roadmap: Now | empty | https://linear.app/jscraik/issue/JSC-346/evals-close-2026-05-22-runtime-evidence-trust-gaps |
| JSC-347 | [evals] Align runtime state with runtime-evidence check | High | Repo › evals; Feature; Eval; Reliability; Roadmap: Now | JSC-346 | https://linear.app/jscraik/issue/JSC-347/evals-align-runtime-state-with-runtime-evidence-check |
| JSC-348 | [evals] Require subagent artifact identity matching | High | Repo › evals; Feature; Eval; Reliability; Agent-Native; Roadmap: Now | JSC-346 | https://linear.app/jscraik/issue/JSC-348/evals-require-subagent-artifact-identity-matching |
| JSC-349 | [evals] Enforce runtime-evidence policy coverage | High | Repo › evals; Feature; Eval; Reliability; Agent-Native; Roadmap: Now | JSC-346 | https://linear.app/jscraik/issue/JSC-349/evals-enforce-runtime-evidence-policy-coverage |
| JSC-350 | [evals] Expand credential scan coverage for proof surfaces | Medium | Repo › evals; Policy; Governance; Reliability; Roadmap: Now | JSC-346 | https://linear.app/jscraik/issue/JSC-350/evals-expand-credential-scan-coverage-for-proof-surfaces |

Mutation caveats:

- Template IDs were unavailable from the active Linear tool surface, so each issue includes a Template Note and template-shaped sections in its description.
- Linear auto-assigned the approved objects to Cycle 4 after creation.
- JSC-345 and JSC-342 remain historical Done evidence and were not mutated.

## Existing Issue Match

| Candidate | Live State | Fit | Recommendation |
|---|---|---|---|
| JSC-345: [evals] Define Runtime Evidence Contract v1 | Done, attached to PR #12, parent JSC-342, blocked-by JSC-344 relation still present in Linear metadata. | High for prior runtime-evidence definition, but completed and narrower than this audit's trust-boundary follow-up. | Treat as prior evidence. Do not reopen unless Jamie explicitly chooses the reopen/update route. |
| JSC-342: [evals] Add runtime memory loop surfaces | Done, covered runtime state and replayable trace timeline parent. | Prior runtime-state evidence, not active follow-up. | Link as context, do not mutate by default. |
| New follow-up parent | Covers new audit slice across state/check alignment, runtime-evidence enforcement, subagent artifact identity, and credential scan scope. | Best fit for current execution. | Created as JSC-346 after approval. |

## Recommended Active Set

The active set should be a bounded follow-up parent plus four child issues. This is deliberately smaller than the audit register. It targets the trust-boundary fixes that reduce false-success, stale-state, unsafe-command, or missing-evidence risk.

### Now

| Proposed Object | Template | Priority | Labels | Project | Cycle | Why Now |
|---|---|---:|---|---|---|---|
| Parent: [evals] Close 2026-05-22 runtime-evidence trust gaps | Feature | High | Repo > evals; Feature; Eval; Reliability; Roadmap: Now | empty | Cycle 4 | Groups the new post-JSC-345 enforcement slice without mutating historical Done issues. |
| Child 1: [evals] Align runtime state with runtime-evidence check | Feature | High | Repo > evals; Feature; Eval; Reliability; Roadmap: Now | empty | Cycle 4 | Removes false-readiness risk where state can be weaker than check. |
| Child 2: [evals] Require subagent artifact identity matching | Feature | High | Repo > evals; Feature; Eval; Reliability; Agent-Native; Roadmap: Now | empty | Cycle 4 | Closes the smallest concrete artifact spoof path. |
| Child 3: [evals] Enforce runtime-evidence policy coverage | Feature | High | Repo > evals; Feature; Eval; Reliability; Agent-Native; Roadmap: Now | empty | Cycle 4 | Prevents schema-shaped policy fields from looking authoritative without scorers. |
| Child 4: [evals] Expand credential scan coverage for proof surfaces | Governance / Policy | Medium | Repo > evals; Policy; Governance; Reliability; Roadmap: Now | empty | Cycle 4 | Protects research, source, and test surfaces now used for proof artifacts. |

### Next

| Item | Source Audit Gap | Reason To Defer |
|---|---|---|
| Tool spec completeness gate | GAP-004 | Important, but safer after the P0 enforcement and state/check trust boundary is closed. |
| Manual case-promotion candidate schema | GAP-005 | Needed before real session mining, but not before existing offline checks are honest. |
| Environment-aware runtime state fields | GAP-006 | Should follow state/check alignment so the existing packet is trustworthy first. |
| Policy revision and approval metadata | GAP-012 | Useful governance hardening after scorer coverage exists. |
| CLI JSON output contract test | GAP-013 | Low-risk API guard, not the first false-success fix. |

### Later

| Item | Source Audit Gap | Reason To Defer |
|---|---|---|
| MCP environment provenance fixtures | GAP-007 | Needs the runtime-evidence coverage model first. |
| Goal/budget/continuation scorer | GAP-008 | Valuable runtime behavior, but not first until policy coverage is enforced. |
| Compaction and remote parity fixtures | GAP-009 | Better after manual case-promotion and thread-policy coverage exists. |
| Recovery and reconnect scenarios | GAP-010 | Should build on trace and runtime-event vocabulary after the Now lane. |

### Do Not Create

| Item | Reason |
|---|---|
| Packaged runtime launcher adapter now | Explicitly deferred by phase-one hard blocks and the audit recommendation. |
| Source-mining automation now | Explicitly blocked until a manual privacy-safe promotion path exists. |
| Dashboard, trend views, or LLM-assisted triage now | The repo still needs deterministic enforcement before presentation or advisory layers. |
| One issue per audit gap | Would create issue volume without improving execution focus. |

## Visual References / Diagrams

### Issue Tree

~~~mermaid
flowchart TD
  Parent["Parent: Close 2026-05-22 runtime-evidence trust gaps"]
  S1["Child 1: Align state with check"]
  S2["Child 2: Require subagent artifact identity"]
  S3["Child 3: Enforce policy coverage"]
  S4["Child 4: Expand credential scan coverage"]
  Prior345["Prior: JSC-345 Runtime Evidence Contract v1 (Done)"]
  Prior342["Prior: JSC-342 Runtime memory loop surfaces (Done)"]

  Prior342 --> Prior345
  Prior345 -. context .-> Parent
  Parent --> S1
  Parent --> S2
  Parent --> S3
  Parent --> S4
~~~

### Execution Order

~~~mermaid
flowchart LR
  A["Subagent artifact identity"] --> B["Policy coverage gate"]
  B --> C["State/check alignment"]
  C --> D["Credential scan scope"]
  D --> E["pnpm verify"]
~~~

## Created Payloads

These payloads were applied after Jamie's approval. The exact live issue IDs and URLs are recorded in Live Mutation Result above. Project remains empty because no exact repo project destination was verified; Linear assigned the approved issues to Cycle 4.

### Parent Payload

Title: [evals] Close 2026-05-22 runtime-evidence trust gaps

Template: Feature

Team: JSC

Priority: High

Labels: Repo › evals; Feature; Eval; Reliability; Roadmap: Now

Project: empty

Cycle: Cycle 4

Description:

#### Objective

Close the trust-boundary findings from .harness/research/audits/2026-05-22-evidence-led-codebase-gap-audit.md without expanding into dashboards, source mining, external adapters, packaged runtime launchers, plugin systems, or LLM judge gates.

#### Source Artifacts

- .harness/research/audits/2026-05-22-evidence-led-codebase-gap-audit.md
- .harness/linear/2026-05-22-evals-runtime-evidence-enforcement-linear-plan.md
- Prior context: JSC-342, JSC-345

#### Why This Matters

The repo has a working executable spine, but the audit found paths where readiness or runtime-evidence claims can look stronger than the deterministic checks prove. This parent owns the smallest follow-up slice that reduces false-readiness and missing-evidence risk.

#### Scope

- Align state readiness with runtime-evidence check health.
- Require subagent artifact identity matching.
- Enforce coverage for declared runtime-evidence policy blocks.
- Expand credential scan coverage for proof-bearing repo surfaces.

#### Out of Scope

- Source-mining automation.
- Packaged runtime launcher adapter.
- Dashboards or trend views.
- External project adapters.
- Required LLM judge gates.

#### Validation Gates

- pnpm test
- pnpm evals state --json
- pnpm evals check --json
- pnpm verify

#### Delivery Evidence

Closure requires passing validation, updated audit or eval evidence if behavior changes, and PR linkage to the primary Linear issue when implemented.

### Child Payload 1

Title: [evals] Align runtime state with runtime-evidence check

Template: Feature

Priority: High

Labels: Repo › evals; Feature; Eval; Reliability; Roadmap: Now

Parent: JSC-346

Description:

#### Objective

Make pnpm evals state --json reflect runtime-evidence suite health so it cannot report ready when pnpm evals check --json would fail.

#### Source Evidence

- Audit GAP-001 and CONTRADICTION-001.
- src/lib/runtime-state.js currently derives status from latest-run validation.
- src/commands/validation.js validates runtime-evidence cases in check.

#### Acceptance Criteria

- A broken runtime-evidence fixture makes check fail.
- The same broken fixture makes state report invalid or contract validation failed.
- A valid fixture suite still reports ready.

#### Validation Command

pnpm test && pnpm evals state --json && pnpm evals check --json

### Child Payload 2

Title: [evals] Require subagent artifact identity matching

Template: Feature

Priority: High

Labels: Repo › evals; Feature; Eval; Reliability; Agent-Native; Roadmap: Now

Parent: JSC-346

Description:

#### Objective

Require ArtifactExpected and ArtifactWritten events to include and match artifact identity, not only subagent event counts.

#### Source Evidence

- Audit GAP-003 and CONTRADICTION-003.
- Agent-native reviewer found the count-only closeout path.
- src/lib/runtime-evidence-contract.js currently scores the subagent artifact contract by subagent counts.

#### Acceptance Criteria

- ArtifactWritten without artifact_path fails.
- ArtifactWritten for the wrong artifact path fails.
- Matching subagent_id plus artifact_type plus artifact_path passes.

#### Validation Command

pnpm test && pnpm evals check --json

### Child Payload 3

Title: [evals] Enforce runtime-evidence policy coverage

Template: Feature

Priority: High

Labels: Repo › evals; Feature; Eval; Reliability; Agent-Native; Roadmap: Now

Parent: JSC-346

Description:

#### Objective

Fail closed or explicitly mark scaffolded policy blocks when runtime-evidence fixtures declare policy families without an enforcing scorer.

#### Source Evidence

- Audit GAP-002 and CONTRADICTION-002.
- schemas/runtime-evidence-case.schema.json includes goal, thread, network, and package provenance fields.
- src/lib/runtime-evidence-contract.js only scores permission drift, subagent artifact contract, and plugin attribution.

#### Acceptance Criteria

- A fixture with an unscored declared policy fails unless explicitly marked scaffolded_not_enforced.
- Runtime-evidence check output reports policy coverage status.
- Existing passing fixtures remain honest about enforced versus scaffolded fields.

#### Validation Command

pnpm test && pnpm evals check --json

### Child Payload 4

Title: [evals] Expand credential scan coverage for proof surfaces

Template: Governance / Policy

Priority: Medium

Labels: Repo › evals; Policy; Governance; Reliability; Roadmap: Now

Parent: JSC-346

Description:

#### Objective

Expand or explicitly codify credential scan coverage so proof-bearing repo surfaces such as .harness/research, src, and test do not sit outside the CI gate without an intentional exclusion.

#### Source Evidence

- Audit GAP-011 and CONTRADICTION-004.
- scripts/verify.js currently scans fixtures and .harness/evals.
- The new audit artifact is under .harness/research.

#### Acceptance Criteria

- .harness/research is scanned or explicitly documented as excluded with a tested reason.
- src and test are scanned or explicitly documented as excluded with a tested reason.
- pnpm verify remains deterministic and avoids generated dependency directories.

#### Validation Command

pnpm test && pnpm verify

## Dependencies

| Dependency | Direction | Reason |
|---|---|---|
| JSC-342 | prior context | Runtime state and trace timeline were completed before this follow-up audit. |
| JSC-345 | prior context | Runtime Evidence Contract v1 was defined and partially implemented; this plan closes enforcement gaps found after that issue was marked Done. |
| Child 2 before Child 3 | recommended | Artifact identity is the smallest concrete scorer hardening and gives the coverage gate a cleaner baseline. |
| Child 3 before Child 1 | recommended | State/check alignment should reflect the final contract health model, not a temporary partial model. |
| Child 4 can run in parallel | optional | Credential scan scope is independent after the parent is approved. |

## Project Reactivation Recommendation

No project creation or reactivation is recommended. The exact evals repo project is missing, and this work can be safely tracked with the verified Repo › evals label until Jamie confirms a repo control project.

## Portfolio Ops Items

None. This is repo-specific evals work, not cross-repo Portfolio Ops coordination.

## Dev Portfolio Impact

The plan affects Dev Portfolio only as labeled repo work. It should not create a new project, initiative, milestone, or portfolio-level object.

## GitHub PR Tracking

Use the primary Linear issue identifier in the branch, commit, or PR context. Since the parent is created, implementation branches should start from the parent or the active child identifier, for example jsc-346-runtime-evidence-trust-boundary or jsc-348-subagent-artifact-identity.

## Delivery Evidence

Each child requires exact command outcomes. The parent should not close until:

- pnpm test passes.
- pnpm evals state --json reflects contract health.
- pnpm evals check --json passes.
- pnpm verify passes when credential scanning changes.
- PR or local closure evidence cites changed files and command results.

## Evidence & Traceability Matrix

| Plan Item | Audit Evidence | Live Linear Evidence | Validation |
|---|---|---|---|
| Parent | Executive summary and Fix Roadmap Phase 1 | JSC-342 and JSC-345 are Done; no exact evals project | pnpm test; pnpm evals check --json; pnpm verify |
| Child 1 | GAP-001; CONTRADICTION-001 | JSC-343 is Done but does not cover new runtime-evidence health mismatch | pnpm test; pnpm evals state --json; pnpm evals check --json |
| Child 2 | GAP-003; CONTRADICTION-003 | JSC-345 is Done but artifact identity gap remains | pnpm test; pnpm evals check --json |
| Child 3 | GAP-002; CONTRADICTION-002 | JSC-345 is Done but policy coverage gap remains | pnpm test; pnpm evals check --json |
| Child 4 | GAP-011; CONTRADICTION-004 | No exact existing issue found in live search | pnpm test; pnpm verify |

## Validation

Completed validation for this artifact:

- Command: python3 /Users/jamiecraik/dev/agent-skills/Plugins/cache/agent-skills-local/harness-engineering/0.1.0/scripts/check_bluf_structure.py .harness/linear/2026-05-22-evals-runtime-evidence-enforcement-linear-plan.md --json -> pass
- Command: test -f .harness/linear/2026-05-22-evals-runtime-evidence-enforcement-linear-plan.md -> pass

Live Linear mutation validation completed by successful Linear issue creation for JSC-346 through JSC-350 and artifact update in this file.
