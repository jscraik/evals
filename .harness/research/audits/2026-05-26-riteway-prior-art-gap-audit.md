# Riteway Prior-Art Gap Audit

Date: 2026-05-26
Target repo: /Users/jamiecraik/dev/evals
External reference: https://github.com/paralleldrive/riteway
Audit status: research_complete

## Executive Summary

Riteway is useful to evals as prior art for assertion shape, failure
diagnostics, and prompt-eval report ergonomics. It is not a good fit as a
direct dependency or runtime authority for the current phase-one executable
spine.

Fit grade as prior art: B.

Fit grade as a direct runtime dependency: D.

The best adoption path is translation, not integration: lift the useful
discipline behind Riteway's given, should, actual, expected assertion shape
into evals-native scorer, contract, and report artifacts while preserving the
repo boundary that artifacts decide, telemetry explains, and LLM judges advise
only until calibrated.

Recommended use:

- Add first-class deterministic assertion results to evals artifacts.
- Render assertion diagnostics in the human run report.
- Make contract assertions more legible without making Riteway vocabulary
  canonical.
- Treat Riteway TAP or AI output as a future external producer input only
  after a separate ADR opens that boundary.

Not recommended:

- Do not add riteway to package.json.
- Do not execute riteway ai from evals validation.
- Do not make .sudo files canonical eval inputs.
- Do not introduce an LLM judge gate as required proof.
- Do not let TAP output become proof without an evals-native conversion and
  provenance boundary.

## Local Boundary Checked

- AGENTS.md defines evals as the owner of shared runner mechanics, canonical
  schemas, artifact bundles, deterministic scorer contracts, baseline result
  shape, and closure evidence. Consuming repositories own suite intent, real
  fixtures, rubrics, thresholds, privacy approval, and baseline promotion.
- AGENTS.md phase-one hard blocks reject dashboards, external adapters, cloud
  runners, telemetry exporters as authority, plugin systems, source-mining
  automation, required LLM judge gates, and runtime dependencies on sibling
  repositories.
- README.md frames the repo as a local-first shared runner and shared contract
  verifier, not a behavior oracle. External repo-root checks inspect written
  artifacts only and explicitly do not prove domain correctness, CI readiness,
  PR readiness, or baseline promotion.
- ARCHITECTURE.md says package.json intentionally has no dependencies or
  devDependencies, so any dependency addition is a design change.
- The suite contract surface treats suite files as data contracts, rejects
  network-enabled suites, and rejects executable scorer hooks in phase one.

Conclusion: direct Riteway integration would cross the current boundary.
Riteway can still help by sharpening the data shape of local evidence.

## Riteway Evidence Mined

- Core assertion grammar: assert receives given, should, actual, and expected.
  Its report label reads like an executable behavior sentence: Given X should
  Y.
- Vitest support keeps the same assertion grammar and maps actual/expected to
  strict equality.
- The AI runner separates authoring from execution: .sudo files hold prompts,
  imports, and assertions, then the runner extracts structured tests, generates
  answers, judges assertions, aggregates pass rates, and writes TAP markdown.
- Aggregation normalizes judge output into passed, actual, expected, score,
  passCount, totalRuns, and averageScore.
- Test output keeps human-readable TAP plus optional raw response files for
  inspection.
- Path containment and agent-auth validation are explicit operational guards.
- Riteway's own fixture notes warn that deterministic failure tests are not
  reliable when capable LLMs act as both result and judge agents; failure
  detection is proven at the unit level with mocks.

The highest-value pattern is not the runner. It is the small assertion record:
given context, expected behavior, observed result, expected result, and a
stable diagnostic label.

## Current Evals Evidence

- schemas/scorer-result.schema.json requires scorer_id, scorer_version,
  status, inputs_inspected, evidence, and failure_reason, but evidence is a
  free-form string.
- src/lib/scoring.js already emits actual/expected-style evidence strings for
  exit-code, required-output, artifact-completeness, and baseline-presence
  scoring.
- src/lib/report.js renders metadata, stdout, artifact paths, and judge policy
  but does not render scorer failures as structured assertion diagnostics.
- schemas/contract.schema.json already has contract assertions, but their shape
  is behavior-enum oriented rather than a reusable diagnostic grammar.
- src/lib/contract-catalog.js produces assertion_results for contract fixture
  checks, but the result shape is separate from scorer result diagnostics.
- src/lib/proof-boundary.js already names proves, does_not_prove, shared
  contract status, local project truth status, and adopted contracts. This is
  the right authority boundary for any external producer import.

The repo already contains the pieces needed to translate Riteway's strongest
idea into evals-native form. The gap is coherence: assertions exist as strings,
contract checks, and report prose, but not as one shared evidence record.

## Gap Register

### GAP-RW-001: No First-Class Assertion Result Shape

- Severity: High
- Current status: partial
- Owner module: scorer result and runtime evidence schema surfaces
- Evidence: scorer-result evidence is free-form while scoring code embeds
  actual/expected details inside strings.
- Why Riteway matters: Riteway's given, should, actual, expected shape is a
  compact diagnostic contract that makes failures explain themselves.
- Recommended fix: add an evals-native assertion result shape, either as
  schemas/assertion-result.schema.json or as an optional assertions array on
  scorer results. Keep existing evidence and failure_reason for compatibility.
- Suggested fields: assertion_id, given, should, actual, expected, status,
  evidence_refs, reproduce_command, and diagnostic.
- Validation gate: pnpm test, then pnpm evals run fixtures/smoke/pr-closeout.case.json --json.
- Boundary note: this is deterministic artifact structure, not a Riteway
  dependency.

### GAP-RW-002: Human Reports Do Not Surface Assertion Diagnostics

- Severity: High
- Current status: partial
- Owner module: src/lib/report.js
- Evidence: report output includes stdout and artifact paths, but not a
  normalized failure table for deterministic scorer assertions.
- Why Riteway matters: Riteway's TAP output makes each assertion inspectable by
  behavior sentence, actual, and expected result.
- Recommended fix: render a deterministic assertions section in the run report
  whenever scorer results include assertion records. Include assertion label,
  status, actual, expected, and evidence reference.
- Validation gate: pnpm test plus a smoke run that writes the report.
- Boundary note: keep report rows as derived display of evals-owned artifacts.

### GAP-RW-003: Contract Assertions Are Not Yet a Shared Diagnostic Grammar

- Severity: Medium
- Current status: partial
- Owner module: schemas/contract.schema.json and src/lib/contract-catalog.js
- Evidence: contract assertions use assertion type enums and descriptions, and
  contract fixture validation emits assertion_results, but this does not align
  with scorer result diagnostics.
- Why Riteway matters: a small shared grammar lets a failed readiness boundary
  check and a failed runtime scorer check read the same way.
- Recommended fix: add optional given and should fields to contract assertions,
  and map contract assertion_results into the same assertion result shape used
  by scorer results.
- Validation gate: node scripts/validate-contracts.js and pnpm test.
- Boundary note: keep assertion type enums as machine policy. The given/should
  fields are human diagnostics, not new authority.

### GAP-RW-004: Prompt-Eval Authoring Is Not Separated From Canonical Contracts

- Severity: Medium
- Current status: missing
- Owner module: future authoring tools, not current runtime
- Evidence: Riteway separates .sudo authoring from extracted structured tests.
  evals currently expects canonical JSON fixtures and schemas directly.
- Why Riteway matters: a friendlier authoring layer could help downstream repos
  draft eval cases without making prose prompts the canonical artifact.
- Recommended fix: defer. If needed later, build a compiler from a human
  authoring format into canonical eval-case JSON, with the generated JSON as
  the only executable input.
- Validation gate: future ADR and schema fixture tests.
- Boundary note: do not add .sudo as a canonical input in phase one.

### GAP-RW-005: External Producer Outputs Have No Normalized Import Contract

- Severity: Medium
- Current status: missing
- Owner module: future external producer import boundary
- Evidence: Riteway can write TAP markdown and response artifacts; evals can
  inspect external repo artifacts with repo-root checks, but no normalized
  external producer contract exists.
- Why Riteway matters: Riteway could be a consumer-side producer of evidence
  that evals reads later, provided evals remains the verifier.
- Recommended fix: defer behind ADR. Define a read-only external producer
  evidence schema with producer name, command, artifact path, assertion rows,
  provenance, and proof-boundary disclaimers.
- Validation gate: future schema validation and proof-boundary checks.
- Boundary note: evals may inspect already-written Riteway artifacts; it must
  not run Riteway as shared authority in the current phase.

### GAP-RW-006: Failure Artifacts Are Command-Oriented, Not Assertion-Oriented

- Severity: Medium
- Current status: partial
- Owner module: run artifacts and validation result surfaces
- Evidence: current artifacts strongly record command, schema, manifest,
  baseline, and proof-boundary status. They do not yet provide a compact list
  of failed deterministic assertions across scorer and contract checks.
- Why Riteway matters: a failed assertion list makes review and downstream
  adoption faster because the reader can see exactly what behavior failed.
- Recommended fix: add optional failed_assertions to validation or run summary
  artifacts after GAP-RW-001 defines the assertion record.
- Validation gate: pnpm evals check --json and pnpm evals check --smoke --json.
- Boundary note: failed assertions summarize existing deterministic checks;
  they do not create a new judge layer.

### GAP-RW-007: LLM Judge Aggregation Is Explicitly Out Of Phase

- Severity: High if implemented now
- Current status: intentionally blocked
- Owner module: none in phase one
- Evidence: local doctrine says LLM judges advise until calibrated, AGENTS.md
  blocks required LLM judge gates, and Riteway's own fixture notes caution
  against relying on capable LLMs for deterministic failure tests.
- Why Riteway matters: the multi-run judge pipeline is interesting later, but
  it conflicts with the current executable-spine proof model if treated as
  authority.
- Recommended fix: do not implement now. Keep any LLM-derived signal advisory,
  optional, and clearly outside deterministic closure evidence.
- Validation gate: none. This is a boundary decision.
- Boundary note: this gap is a guardrail, not a work item.

## Recommended Implementation Sequence

- First, add an evals-native assertion result contract that can be emitted by
  existing deterministic scorers without changing CLI behavior.
- Second, render assertion diagnostics in the human report so smoke failures
  become easier to inspect.
- Third, align contract assertion diagnostics with the same shape while
  preserving current machine policy enums.
- Fourth, defer any Riteway TAP import, .sudo authoring, or judge aggregation
  until a separate ADR opens an external producer or authoring boundary.

## Decision Point

The next useful implementation issue is not "integrate Riteway". It is:

- Add evals-native deterministic assertion result records and render them in
  run reports.

That change would make the current executable spine easier for downstream
projects to adopt while preserving the repo's canonical-only, local-first
authority model.

## Bottom Line

Riteway helps this project most by sharpening how failures are named and read.
The repo should translate the assertion discipline into artifact-first evals
contracts: given context, expected behavior, observed result, expected result,
and reproduce evidence. The repo should not import Riteway, run Riteway, or let
Riteway outputs become proof authority in the current phase.

## Implementation Closeout

- GAP-RW-001: fixed by `schemas/assertion-result.schema.json` and the
  evals-owned assertion-result helper.
- GAP-RW-002: fixed by the `## Deterministic Assertions` section in generated
  run reports.
- GAP-RW-003: fixed by normalizing shared contract assertion results with
  `given`, `should`, `actual`, `expected`, `evidence_refs`,
  `reproduce_command`, and `diagnostic`.
- GAP-RW-004: closed as a phase-one guardrail. Prompt-eval authoring remains a
  later ADR item and `.sudo` is not a canonical input.
- GAP-RW-005: closed as a phase-one guardrail. External producer import remains
  read-only provenance and artifact inspection until a later ADR defines a
  producer schema.
- GAP-RW-006: fixed by `result.json` `failed_assertions` and scorer-level
  assertion records.
- GAP-RW-007: closed as a phase-one guardrail. Architecture validation rejects
  Riteway and required LLM judge runtime dependencies.

Deep module packet:
`.harness/refactors/2026-05-26-riteway-assertion-result-fix.md`.
