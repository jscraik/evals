# Documentation Authority Compression

schema_version: 1

## Reframe Classification

- cognition compression
- anti-drift hardening
- governance reduction
- execution determinism
- Linear execution hygiene

## Problem Statement

The evals repo now has enough strategic documentation to route execution, but the operating path is still trapped inside a large `.harness` cognition stack. The docs consistently say the next move is `Evals Executable Spine`, yet a future agent still has to read across intent, review, triage, strategy, ADRs, core invariants, and legacy refactor files to know the one safe next action.

Architectural issue: documentation authority is broader than execution authority. The docs explain the desired architecture, but the repo does not yet have a small command surface or root operating contract that makes the direction obvious.

Operational issue: a contributor can spend more time interpreting the documentation stack than building the first local artifact proof path.

Cognition issue: the same hard blocks are repeated across many files. That repetition is useful as pressure, but harmful if it becomes the normal context loading path.

Future-agent issue: agents may create more strategy, ADR, or refactor prose because the repo feels document-led. That directly conflicts with the docs' own conclusion that more documentation is now lower leverage than executable proof.

Execution issue: the reframe/refactor layer exists in older paths (`.harness/refactors` and `.harness/reframe`). The active HE reframe contract prefers `.harness/reframes/**`, so future migration routing has a naming drift risk unless documentation authority is compressed.

## Root Cause Analysis

This structure emerged because the repo was born as a strategic decision: should evals be shared across `coding-harness` and `agent-skills`, and what should be mined from public eval frameworks? That required more cognition than code at first.

It survived because the early risk was genuine. Without the long-form intent, review, triage, strategy, ADR, and core layers, the repo would likely drift into framework shopping, dashboard-first work, uncalibrated judge gates, or generic prompt-library accumulation.

The pressure is now changing. The documentation has converged on one answer: build the smallest local executable spine. Keeping the full documentation stack as the normal operating entrypoint now creates diminishing returns.

This is not legacy code. It is useful seed cognition that has reached the point where it must be compressed into an execution-facing surface.

## Evidence

Fact:

- `.harness/triage/2026-05-18-evals-triage.md` names exactly one immediate initiative: `Evals Executable Spine`.
- `.harness/strategy/2026-05-18-evals-strategy.md` says phase one is the local proof system and explicitly defers dashboards, judge gates, telemetry exports, cloud execution, and framework adapters.
- `.harness/core/2026-05-18-evals-core.md` defines the core doctrine: artifacts decide, telemetry explains, LLM judges advise until calibrated, repo-local suites own truth, external frameworks are adapters.
- `.harness/core/agent-operating-rules.md` says future agents should first ask what local artifact proof the change improves and stop or defer if none.
- `.harness/review/2026-05-18-evals-architecture-review.md` records that the repo had no package manifest, runner, schemas, tests, fixture, artifact bundle, README, or AGENTS file at the time of review.
- `wc -l` across the listed `.harness` markdown files reports 5,072 lines.
- The current HE reframe contract prefers `.harness/reframes/**`; existing migration files live under `.harness/refactors/**` plus `.harness/reframe/2026-05-18-evals-reframe.md`.

Interpretation:

- The strategic decision is no longer ambiguous. The documentation now needs to become a compressed control surface for implementation rather than another destination for analysis.
- The current risk is documentation gravity: the architecture is clear enough to act, but not yet encoded where humans and agents naturally start.
- Legacy reframe/refactor paths are still useful source evidence, but new migration authority should use the current `.harness/reframes/**` lane.

Assumptions:

- No runtime source has been added since the reviewed docs were created. Verify this before closing the reframe.
- The repo still does not have root `README.md` and `AGENTS.md`. Verify this during Phase 1.

Confidence: high for documentation convergence; medium for current runtime absence because this pass inspected documentation and file lists, not a full runtime implementation.

Operational impact: without this compression, future agents can keep producing valid-looking architecture documents while the repo still cannot run the smoke eval command.

## Architectural Impact

Affected systems: `.harness/core/**`, `.harness/decisions/**`, `.harness/features/**`, `.harness/review/**`, `.harness/triage/**`, `.harness/strategy/**`, `.harness/refactors/**`, `.harness/reframe/**`, future `.harness/reframes/**`, future `README.md`, and future `AGENTS.md`.

Blast radius: low if handled as documentation compression; medium if agents delete source artifacts instead of preserving them as historical evidence.

Migration complexity: moderate. The work is about authority boundaries, not content rewriting.

Drift risk: high if no compression happens; low after the root operating surface exists.

Rollback difficulty: low. Revert the compressed entrypoint and restore direct links to the prior `.harness` stack.

Likely files touched: `README.md`, `AGENTS.md`, `.harness/core/2026-05-18-evals-core.md`, and this reframe program.

Systems that must not be touched: do not rewrite the intent, review, triage, strategy, ADR, or existing refactor files during this reframe unless correcting a specific factual error. Do not create dashboards, framework adapters, telemetry exporters, plugin systems, or judge gates as part of documentation compression.

## Desired End State

- Root `README.md` tells a human what the repo is, what the phase-one command will be, and what is intentionally deferred.
- Root `AGENTS.md` tells agents the hard routing rules, read order, and stop conditions.
- `.harness/core/2026-05-18-evals-core.md` remains the compressed cognition spine.
- `.harness/reframes/**` becomes the preferred location for future migration programs.
- `.harness/refactors/**` and `.harness/reframe/**` remain preserved legacy source evidence until explicitly migrated or superseded.
- Future agents can identify the next safe work slice without reading 5,000 lines of strategy context.

Improved read path:

1. `AGENTS.md`
2. `README.md`
3. `.harness/core/2026-05-18-evals-core.md`
4. ADR index for architectural decisions
5. Relevant `.harness/reframes/**` program for migration execution
6. Long-form intent/review/triage/strategy only as evidence

## Migration Strategy

Use staged compression, not document deletion.

1. Freeze authority: classify existing `.harness` files as source evidence, decision memory, core invariants, or migration programs.
2. Create root operating docs: minimal `README.md` and `AGENTS.md` that point to the core doctrine and the single immediate initiative.
3. Normalize future migration routing: use `.harness/reframes/**` for new reframe programs and treat `.harness/refactors/**` as legacy evidence.
4. Add closure proof: require an eval artifact proving future agents can find the correct execution path without reading every long-form document.
5. Defer cleanup: do not delete or collapse long-form docs until executable spine proof exists and the compressed entrypoint has been used successfully.

Coexistence rule: old docs remain valid as evidence; the compressed operating surface becomes the first read path.

Compatibility constraint: preserve local artifact authority, external framework adapter boundaries, advisory judges, repo-local suite ownership, and fixture provenance.

Rollback strategy: if compression hides important context or causes agents to miss safety rules, restore direct read requirements to the relevant source documents and revise the compressed entrypoint.

Linear milestone or parent issue shape: sub-issue under `Evals Executable Spine`, not a separate initiative.

## Smallest Reversible Step

Create a minimal root `AGENTS.md` containing the core doctrine, phase-one routing rule, hard blocks, source-of-truth read order, and the stop condition: if a change does not improve local artifact proof, defer it.

Do not edit the long-form `.harness` artifacts in the same step.

## Execution Phases

### Phase 1 - Authority Classification

Objective: classify the existing documentation stack by operational authority.

Affected systems: `.harness/core`, `.harness/decisions`, `.harness/features`, `.harness/review`, `.harness/triage`, `.harness/strategy`, `.harness/refactors`, `.harness/reframe`.

Expected risk: low.

Feedback expected from this phase: a future agent can tell which files are operating rules, decision memory, or historical evidence.

Stop or pivot condition: classification changes a strategic decision instead of clarifying document authority.

Can run in parallel: no.

Validation requirements: file inventory plus read-order check.

Rollback conditions: any authority label contradicts ADR-001 through ADR-006.

Linear mapping: sub-issue under `Build local eval runner and artifact contract`.

Agent-safe: yes.

Human review required: no.

### Phase 2 - Root Agent Operating Surface

Objective: create minimal `AGENTS.md` and `README.md` that route to the executable spine and compressed core doctrine.

Affected systems: root docs, `.harness/core/2026-05-18-evals-core.md`.

Expected risk: low.

Feedback expected from this phase: a human or agent can identify the next safe command target and hard blocks in under two minutes.

Stop or pivot condition: root docs restate long-form strategy instead of compressing operating rules.

Can run in parallel: yes, after Phase 1.

Validation requirements: docs mention local artifact authority, no phase-one dashboard/adapter/plugin/cloud/judge gate, and the expected smoke command.

Rollback conditions: root docs create new strategic commitments not present in the `.harness` stack.

Linear mapping: sub-issue under `Build local eval runner and artifact contract`.

Agent-safe: yes.

Human review required: no.

### Phase 3 - Reframe Path Normalization

Objective: make `.harness/reframes/**` the preferred path for new migration programs while preserving `.harness/refactors/**` as legacy source evidence.

Affected systems: `.harness/reframes`, `.harness/refactors`, `.harness/reframe`.

Expected risk: medium if agents attempt deletion; low if treated as routing.

Feedback expected from this phase: future migration work lands in one current location without erasing prior evidence.

Stop or pivot condition: normalization becomes a broad rewrite of existing programs.

Can run in parallel: yes, after Phase 1.

Validation requirements: root docs or core docs state preferred path and legacy evidence status.

Rollback conditions: future agents cannot find the existing executable-spine program because path semantics became unclear.

Linear mapping: sub-issue under `Build local eval runner and artifact contract`.

Agent-safe: assisted.

Human review required: no unless deletion is proposed.

### Phase 4 - Documentation Compression Eval

Objective: prove the documentation stack now routes execution instead of requiring another strategy pass.

Affected systems: `.harness/evals`, root docs, core docs.

Expected risk: low.

Feedback expected from this phase: an eval artifact records that a future-agent read path reaches `Evals Executable Spine` and blocks deferred work.

Stop or pivot condition: eval cannot identify a single next action.

Can run in parallel: no.

Validation requirements: produce eval artifact with file paths, expected next work slice, blocked false-sophistication examples, and unresolved ambiguity.

Rollback conditions: eval shows agents still need long-form strategy docs for routine routing.

Linear mapping: closure proof for documentation compression sub-issue.

Agent-safe: yes.

Human review required: no.

## Linear Mapping

Workspace/team: Jscraik

Team key: JSC

Top-level initiative: Dev Portfolio

Cross-repo project: Portfolio Ops

Repo-specific work: evals

Target Linear project: evals repo project when available; otherwise keep under `Portfolio Ops` until the evals project exists.

Recommended milestone name: Evals Executable Spine

Recommended parent issue title: Build local eval runner and artifact contract

Recommended sub-issue: Compress documentation authority into README and AGENTS

Suggested priority: high.

Suggested labels: evals, docs, agent-native, anti-drift, execution-spine

Dependencies: existing `.harness` stack; no runtime dependency.

Do not create Linear objects from this reframe.

## Anti-Regression Constraints

Must not regress:

- local artifact bundles are authoritative;
- telemetry remains explanatory;
- LLM judges remain advisory until calibrated;
- external frameworks remain adapters;
- repo-local suites own domain truth;
- fixture provenance and privacy are required;
- phase one remains `Evals Executable Spine`;
- root docs point to execution rather than strategy expansion.

Forbidden reintroductions:

- hidden documentation hierarchy;
- duplicated operating rules with contradictory authority;
- `.harness` prose as a substitute for runnable proof;
- new strategy artifacts before the smoke command exists;
- deletion of historical evidence before executable proof exists;
- migration programs in multiple active roots without clear preference.

## Eval Requirements

Expected eval artifact:

    .harness/evals/2026-05-18-evals-documentation-authority-compression-eval.md

The eval must record files inspected, root read path tested, whether `Evals Executable Spine` is discoverable without every long-form document, whether false-sophistication work is blocked, whether `.harness/reframes/**` is recognized as the preferred new migration path, whether legacy `.harness/refactors/**` remain discoverable as evidence, residual ambiguity, and rollback recommendation.

No related Linear sub-issue should close without this eval artifact or a documented exception.

## Success Criteria

- Future agents can identify `Evals Executable Spine` as the only immediate initiative from `AGENTS.md`, `README.md`, and the core spine.
- The normal read path is under 500 lines before optional evidence docs.
- The root docs block dashboards, adapters, plugins, cloud runners, telemetry exporters, and judge gates before local artifact proof.
- `.harness/reframes/**` is the preferred location for new migration programs.
- Existing `.harness/refactors/**` are preserved as legacy source evidence.
- No new strategic decision is introduced by root docs.
- No long-form `.harness` document is deleted before executable proof exists.
- Closure proof includes an eval artifact.

## Safe Rollback Conditions

Rollback if root docs contradict ADR-001 through ADR-006, agents skip fixture privacy/provenance rules, migration routing hides existing refactor programs, documentation compression creates a new strategic direction, eval output cannot trace from root docs to the executable spine, or users and agents still need long-form strategy docs for routine next-action routing.

Linear status recommendation if rollback triggers: mark the documentation compression sub-issue blocked, keep executable spine open, and restore direct links to the prior source artifacts.

## Future-Agent Guidance

Preserve the hard blocks, executable-spine priority, local artifact authority, advisory judge policy, external adapter boundary, repo-local suite ownership, and fixture provenance/privacy.

Simplify further by merging duplicated root-doc wording once the CLI and artifact bundle exist, replacing repeated prose with executable validation where possible, and adding short pointers from long-form docs to the compressed operating surface.

Intentional complexity: ADRs preserve expensive-to-reverse decisions; core files preserve durable invariants; long-form intent/review/triage/strategy files preserve evidence and reasoning.

Accidental complexity: repeated hard-block language across many docs; legacy `.harness/refactors` naming after the active reframe contract moved to `.harness/reframes`; needing to scan 5,000 lines to find one next action.

Safe to modify: root operating docs, reframe path references, documentation read order, and short index wording.

Human review required: deleting long-form `.harness` artifacts, changing ADR decisions, changing phase-one priority, promoting judges/adapters/telemetry/dashboard work into phase one.

Proof required before closure: documentation compression eval artifact plus root docs that route to local artifact proof.

## Related Systems

- `.harness/core/2026-05-18-evals-core.md`
- `.harness/core/agent-operating-rules.md`
- `.harness/core/routing-invariants.md`
- `.harness/core/execution-invariants.md`
- `.harness/decisions/2026-05-18-evals-decisions.md`
- `.harness/decisions/ADR-001-executable-spine-before-expansion.md`
- `.harness/decisions/ADR-002-canonical-result-schema-and-adapter-boundary.md`
- `.harness/decisions/ADR-003-local-artifacts-authoritative-telemetry-explanatory.md`
- `.harness/decisions/ADR-004-repo-local-suites-own-domain-truth.md`
- `.harness/decisions/ADR-005-llm-judges-advisory-until-calibrated.md`
- `.harness/decisions/ADR-006-fixture-provenance-privacy-and-holdout-policy.md`
- `.harness/features/2026-05-18-evals-intent.md`
- `.harness/review/2026-05-18-evals-architecture-review.md`
- `.harness/triage/2026-05-18-evals-triage.md`
- `.harness/strategy/2026-05-18-evals-strategy.md`
- `.harness/refactors/stabilize-evals-executable-spine.md`
- `.harness/refactors/preserve-repo-local-suite-boundaries.md`
- `.harness/refactors/quarantine-framework-judge-telemetry-sprawl.md`
- `.harness/reframe/2026-05-18-evals-reframe.md`

## Evidence & Traceability Matrix

| Conclusion | Evidence type | File paths | Components involved | Runtime behaviour observed | Confidence | Why it matters |
| --- | --- | --- | --- | --- | --- | --- |
| Documentation has converged on one immediate initiative | docs | `.harness/triage/2026-05-18-evals-triage.md`; `.harness/strategy/2026-05-18-evals-strategy.md` | Evals Executable Spine | No runtime observed in this pass | High | More strategy docs are lower leverage than execution routing |
| The normal context load is too large for routine routing | docs, command output | listed `.harness/**/*.md`; `wc -l` output | 5,072-line cognition stack | No runtime observed | High | Future agents should not need full strategy context to pick the next safe action |
| Root operating docs are missing from the documented target state | docs | `.harness/review/2026-05-18-evals-architecture-review.md`; `.harness/triage/2026-05-18-evals-triage.md`; `.harness/strategy/2026-05-18-evals-strategy.md` | README, AGENTS | Not re-verified beyond docs/file list | Medium-high | Agent-native operation needs a first-read surface |
| New migration programs should use `.harness/reframes/**` | skill contract | HE reframe contract; this file | reframe program routing | Not applicable | High | Prevents migration-path drift |
| Existing `.harness/refactors/**` should be preserved as evidence | docs, migration artifacts | `.harness/refactors/*.md`; `.harness/reframe/2026-05-18-evals-reframe.md` | legacy refactor programs | Not applicable | High | Avoids losing useful reasoning while normalizing future path |
| Documentation compression must not create new strategy | ADRs, core, strategy | ADR-001 through ADR-006; `.harness/core/2026-05-18-evals-core.md` | hard blocks | Not applicable | High | Keeps this reframe from becoming process theater |

## Direct Strategic Critique

The documentation is now strong enough to become dangerous if treated as the product. It has done its job: it selected the executable spine, rejected false sophistication, and compressed the moat. The next documentation work should not expand strategy. It should make the existing decision impossible to miss from the repo root, then get out of the way.

Hard recommendation: add root `AGENTS.md` and `README.md` as a compression surface for the executable spine before creating any more strategy, review, ADR, or source-mining artifacts.

