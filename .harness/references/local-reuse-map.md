---
schema_version: 1
title: Local Prior-Art Reuse Map
date: 2026-05-18
status: active
scope: evals-executable-spine
source_spec: .harness/specs/2026-05-18-evals-executable-spine-spec.md
source_plan: .harness/plans/2026-05-18-evals-executable-spine-plan.md
---

# Local Prior-Art Reuse Map

Purpose: use already-implemented local systems to reduce reinvention while
keeping `evals` as the shared executable spine, not a dumping ground for
repo-specific domain truth.

This file is evidence for SA-014A.

## Reuse Policy

- `evals` may reuse concepts, field patterns, fixture examples, and validation
  posture from sibling Jamie repos.
- `evals` must not import sibling repo internals as phase-one runtime
  dependencies.
- `evals` owns runner mechanics, canonical schemas, artifact bundles,
  deterministic scorers, baseline result shape, and closure evidence.
- Consuming repos own suite intent, real fixtures, rubrics, thresholds, privacy
  approval, and baseline promotion.
- Borrowed concepts must be traceable to observed files or command output.
  Inferred usefulness is allowed only when marked as interpretation.

## Evidence Classification

Fact:

- The files listed below existed locally on 2026-05-18 and were inspected with
  `rg`/file reads.
- The reuse map is a design input for schema finalization, not a validation
  result for the future runner.

Interpretation:

- The eval runner should borrow artifact, baseline, and case-shape concepts
  where they reduce reinvention.
- The eval runner should not inherit sibling repo lifecycle authority.

Assumption:

- TypeScript/Node remains the lowest-friction phase-one runner language because
  the required command is `pnpm`-based and the closest artifact-command
  precedent is TypeScript.

## coding-harness

### Reuse Concept

- `/Users/jamiecraik/dev/coding-harness/contracts/agent-run-manifest.schema.json`
  provides proven run-manifest ingredients: run ID, command, timestamps, repo
  evidence, outcome, exit classification, artifact references, checksums,
  preconditions, and provenance.
- `/Users/jamiecraik/dev/coding-harness/contracts/consistency-baseline-pointer.json`
  provides a small baseline pointer pattern: artifact name, artifact path,
  history path, source branch, owner, and timestamp.
- `/Users/jamiecraik/dev/coding-harness/contracts/agent-metric-registry.json`
  provides a later-stage metric registry pattern: metric name, numerator,
  denominator, source artifacts, window rule, blocking policy, owner, and
  threshold.
- `/Users/jamiecraik/dev/coding-harness/UBIQUITOUS_LANGUAGE.md` provides
  useful vocabulary: Decision Source, Run Record, Runtime Evidence, Capture-The-
  Flag Eval, Win Condition, Active Artifact Index, and route-driving artifacts.

Observed evidence:

- `agent-run-manifest.schema.json` requires `runId` and `artifactRefs`; each
  artifact reference requires `type`, `path`, and `checksum`.
- `consistency-baseline-pointer.json` records `artifactName`, `artifactPath`,
  and `historyPath`.
- `agent-metric-registry.json` records metric sources, owners, thresholds, and
  manifest/event-stream inputs.
- `UBIQUITOUS_LANGUAGE.md` defines Run Record, Runtime Evidence, Win Condition,
  Review Swarm, Active Artifact Index, and Route-Driving Artifact.

### Downstream Consumer

- `/Users/jamiecraik/dev/coding-harness/src/lib/pilot-evaluation/` is a strong
  candidate downstream suite. It should consume the shared eval spine later; it
  should not define the shared phase-one schema.

### Reject As Dependency

- Do not copy the coding-harness agent-run manifest as the eval result schema
  unchanged. It contains lifecycle and policy context that belongs to
  coding-harness.
- Do not make pilot-evaluation the runtime dependency for the phase-one smoke
  command.
- Do not make coding-harness metric thresholds authoritative for other repos.

## agent-skills

### Reuse Concept

- `/Users/jamiecraik/dev/agent-skills/Infrastructure/EVALUATION/eval-harness.md`
  provides a simple run-record precedent for lightweight eval checks.
- `/Users/jamiecraik/dev/agent-skills/Infrastructure/references/evals.yaml`
  provides a compact case example: name, prompt, acceptance expectations, and
  trigger expectation.
- `/Users/jamiecraik/dev/agent-skills/bin/plugin-eval` and
  `/Users/jamiecraik/dev/agent-skills/Infrastructure/bin/plugin-eval` provide
  existing skill/plugin eval wrapper precedent.
- `/Users/jamiecraik/dev/agent-skills/Plugins/harness-engineering/references/coding-harness-command-bridge.md`
  provides useful blocker classification and HE lifecycle mapping for future
  handoffs.

Observed evidence:

- `eval-harness.md` records baseline prompt/gate runs with pass/fail results.
- `evals.yaml` contains compact prompt cases with acceptance expectations.
- `bin/plugin-eval` delegates to `Infrastructure/bin/plugin-eval`.
- `Infrastructure/bin/plugin-eval` discovers a plugin-eval JavaScript CLI under
  the plugin cache and fails clearly when it is missing.

### Downstream Consumer

- Skill and plugin evals should become repo-local suites that call the shared
  eval spine after phase one.

### Reject As Dependency

- Do not make plugin-eval artifacts the canonical shared eval result schema.
- Do not rely on free-text acceptance bullets as deterministic pass/fail
  evidence without explicit scorers.
- Do not move skill/plugin routing authority into the evals repo.

## Phase-One Runner Language

Recommendation: implement the phase-one core runner in TypeScript/Node.

Evidence:

- The target command is `pnpm evals run fixtures/smoke/pr-closeout.case.json --json`.
- `coding-harness` implements command, artifact, JSON output, and eval-adjacent
  tests in TypeScript.
- JSON schema contracts and artifact manifests map naturally to a small Node CLI.

Constraint:

- Python can remain valid for optional validators or repo-local adapters, but it
  should not become the core runtime for the phase-one executable spine unless a
  later implementation decision records stronger evidence.

Decision boundary:

- This language recommendation is advisory until implementation begins. It is
  not permission to add package dependencies, generated build surfaces, or
  plugin-eval runtime coupling without a separate implementation decision.

## Borrowed Fields To Consider

- run ID;
- command string;
- started and finished timestamps;
- duration;
- outcome/status;
- exit code and exit classification;
- artifact references with SHA-256 checksums;
- baseline artifact path and history path;
- owner;
- provenance hashes or explicit provenance references;
- blocking/non-blocking metric status for later phases.

## Preserved Boundaries

- Local artifacts remain authoritative.
- Telemetry and metrics remain explanatory until artifact proof exists.
- LLM judges remain advisory.
- External framework adapters remain deferred.
- Real/private fixtures require provenance and privacy review before promotion.
- Sibling repo implementations inform schema design but do not own shared eval
  contracts.
- No sibling repo threshold, plugin score, pilot score, or lifecycle state may
  be promoted into a shared eval verdict without an explicit consuming-repo
  fixture and scorer contract.

## Required Follow-Through Before EP-003 Closure

- Schema rationale must state which borrowed fields were adopted and which were
  rejected.
- The smoke fixture must remain synthetic unless provenance/privacy approval is
  documented.
- The phase-one smoke command must still run without reading
  `/Users/jamiecraik/dev/coding-harness` or
  `/Users/jamiecraik/dev/agent-skills` at runtime.
