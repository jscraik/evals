# Evals Router External Code Tree Mining

Date: 2026-05-25
Repository: /Users/jamiecraik/dev/evals
schema_version: evals-router.v1
route: eval-audit
status: research_complete

## Objective

Walk the current evals code tree against selected external evaluation,
validation, observability, and property-testing projects to identify useful
improvements or mining opportunities without widening evals phase-one
authority.

Compared projects:

- open-eval/OpenEval
- open-telemetry/opentelemetry-collector
- semgrep/semgrep
- HypothesisWorks/hypothesis
- promptfoo/promptfoo

## Current Evals Boundary

The current evals repository is a dependency-free executable spine:

- `package.json` defines only local Node scripts: `evals`, `check`,
  `test`, and `verify`.
- `dependencies` and `devDependencies` are empty.
- Schemas live under `schemas/*.schema.json`.
- Runner, scoring, suite, artifact, latest, runtime-state, trace, and
  proof-contract logic lives under `src/**`.
- The core doctrine in `.harness/core/2026-05-18-evals-core.md` says:
  artifacts decide, telemetry explains, LLM judges advise until calibrated,
  repo-local suites own domain truth, and external frameworks are adapters.

This audit treats external repositories as pattern mines only. It does not
recommend importing them, adopting their canonical terminology wholesale, or
making them runtime authorities.

## Evidence Gathered

Current repo evidence:

- `package.json`: no runtime dependencies; canonical local scripts.
- `src/lib/scoring.js`: deterministic scorer results and fail-closed
  `verdictFor()` when scorer results are absent.
- `src/lib/suite-contract.js`: repo-local suite resolver, phase-one network
  fail-closed policy, and executable scorer hook rejection.
- `src/lib/proof-contract-validation.js`: semantic proof-contract checks for
  claim registry and score vector readiness caps.
- `schemas/*.schema.json`: local JSON Schema proof contracts.
- `.harness/core/2026-05-18-evals-core.md`: phase-one hard blocks.
- `UBIQUITOUS_LANGUAGE.md`: stable executable-spine vocabulary.

External evidence:

- OpenEval `README.md`, `item_schema.json`, `validator.py`, and
  `item_examples.json`.
- OpenTelemetry Collector `cmd/mdatagen/internal/status.go`,
  `cmd/mdatagen/internal/status_test.go`, and metadata test fixtures.
- Semgrep `cli/src/semgrep/rule.py`,
  `cli/src/semgrep/rule_lang.py`, `cli/src/semgrep/output.py`, and
  `cli/src/semgrep/formatter/json.py`.
- Hypothesis `hypothesis/src/hypothesis/_settings.py`,
  `hypothesis/src/hypothesis/database.py`,
  `hypothesis/src/hypothesis/internal/observability.py`,
  `hypothesis/tests/cover/test_observability.py`, and
  `hypothesis/tests/cover/test_reproduce_failure.py`.
- Promptfoo `src/assertions/index.ts`,
  `src/assertions/assertionsResult.ts`, and `src/types/index.ts`.

External snapshot provenance:

| Project | Repository | Inspected Commit | Retrieval Date | Evidence Status |
| --- | --- | --- | --- | --- |
| OpenEval | https://github.com/open-eval/OpenEval.git | `dec5f61b2acbdd55f893ec66eaee7598df7a48be` | 2026-05-25 | pinned |
| OpenTelemetry Collector | https://github.com/open-telemetry/opentelemetry-collector.git | `55df4ad3b25d429163072251a963ee61078c6f9f` | 2026-05-25 | pinned |
| Semgrep | https://github.com/semgrep/semgrep.git | `5b8d78a08fcf378aa5ca209fd887878445238557` | 2026-05-25 | pinned |
| Hypothesis | https://github.com/HypothesisWorks/hypothesis.git | `3af3f1fdaa490f4d1bc85d46aaec2b8f532c7f69` | 2026-05-25 | pinned |
| Promptfoo | https://github.com/promptfoo/promptfoo.git | `a9f5bcfb95b729f5735b2beb2dadb9dae3b5f360` | 2026-05-25 | pinned |

Reproducible fetch pattern:

```bash
git clone --filter=blob:none --no-checkout <repo-url> /private/tmp/evals-mining/<name>
git -C /private/tmp/evals-mining/<name> fetch --depth=1 origin <commit-sha>
git -C /private/tmp/evals-mining/<name> checkout --detach <commit-sha>
```

Validation evidence:

- External repositories were inspected from partial local clones in
  `/private/tmp/evals-mining`.
- No evals code was changed by this audit.
- No runtime validation was required for feature behavior because this is a
  research artifact.

## Implementation Packet Contract

Every opportunity below must be converted into a deep module fix packet before
runtime, schema, fixture, or CLI edits. Use this destination pattern:

```text
.harness/refactors/2026-05-25-opp-<id>-<slug>-deep-module-fix.md
```

Each packet must define:

- `owner_module`: the only module allowed to own the new behavior.
- `public_interface`: the function, command output, schema, or artifact field
  exposed to callers.
- `hidden_implementation_rule`: behavior callers must not duplicate.
- `caller_contract`: which existing modules may call the owner and what they
  may assume.
- `seam_test`: the smallest negative and positive fixture proving the seam.
- `tracer_proof`: the production-like command route that proves the wiring.
- `rollback_path`: exact file or schema reversal route.
- `validation_gate`: exact commands and expected result labels.

Each implementation slice must write a slice evidence note under:

```text
artifacts/evals/opp-<id>-<slug>.md
```

The note must end with:

```text
WROTE: artifacts/evals/opp-<id>-<slug>.md
```

Evidence notes must capture:

- exact command text and `pass`, `fail`, `blocked`, or `not applicable`;
- generated artifact paths;
- output snippets or JSON pointers used as proof;
- failure ownership as `introduced`, `pre-existing`, `environment`, or
  `unrelated_dirty_tree`;
- any compatibility, rollback, or phase-one hard-block check.

Blocked slices must use:

```text
STATUS: blocked_validation
STATUS: blocked_runtime
STATUS: blocked_missing_artifact
STATUS: blocked_external_evidence
```

with exact failure text and next recovery action.

## Deep Module Map And Slice Placement

schema_version: improve-codebase-architecture.v1

Architecture lenses used:

- Deep Module Examiner: keep each mined behavior behind one owner module with a
  stable public interface.
- Architectural Pattern Cartographer: map current proof-spine modules before
  selecting new slice destinations.
- Pattern Catalog Skeptic: mine external repositories only for local patterns,
  not runtime dependencies, adapter roots, dashboards, or provider systems.
- Pragmatic Delivery Partner: place each opportunity where the smallest seam
  test and tracer proof can prove it.

Design decision:

- Preserve the current evals shape: thin CLI commands call deep owner modules in
  src/lib/**; schemas under schemas/** define contracts; fixtures under
  fixtures/** prove behavior; test/** and tests/** own deterministic regression
  coverage.
- Add new owner modules only when no existing deep module can own the behavior
  without hiding unrelated responsibility.
- Do not place mined behavior in agent prompts, generated artifacts, review
  notes, reports, or callers. Those surfaces may explain results, but they must
  not become lifecycle authority.
- Treat this section as a placement map and implementation constraint, not as
  approval to implement every opportunity.

### Current Deep Modules

| Deep Module | Owner Surface | Public Interface | Hidden Implementation Rule | Proof / Seam |
| --- | --- | --- | --- | --- |
| Command surface | src/cli.js, src/commands/run.js, src/commands/state.js, src/commands/validation.js | pnpm evals run, validate, validate-schema, check, state | Argument routing, JSON/text output, process exits, and structured failure emission stay in commands; domain validation stays in src/lib/**. | test/cli.test.js; tracer commands pnpm evals run ... --json, pnpm evals check --json, pnpm evals state --json. |
| Case contract | src/lib/case-contract.js, schemas/eval-case.schema.json, fixtures/smoke/pr-closeout.case.json | parseCase(), validateCase(), validateCaseFileContract() | Case parsing, schema validation, suite/case identifiers, artifact-path containment, and phase-one network policy are centralized here. | test/schema.test.js, test/cli.test.js, smoke fixture validation. |
| Suite contract | src/lib/suite-contract.js, schemas/suite.schema.json | loadSuite(), isSuitePath() | Repo-local suite discovery, artifact-root normalization, network fail-closed behavior, and data-only scorer references stay behind the suite loader. | Suite contract tests in test/cli.test.js; tracer route pnpm evals run suite.json --json. |
| Run bundle and artifact contract | src/lib/run-bundle.js, src/lib/artifact-bundle.js | createRunBundleDirectory(), createRunBundle(), artifact contract helpers, expectedLatestPath() | Run ID allocation, bundle paths, latest pointer placement, required latest keys, manifest contracts, and artifact-reference rules stay here. | Bundle allocation and latest/artifact assertions in test/cli.test.js; tracer route pnpm evals run fixtures/smoke/pr-closeout.case.json --json. |
| Latest proof context | src/lib/latest-run.js, schemas/latest-run.schema.json | validateLatestRun(), expectedProofContextFromCase(), validateCaseFile() | Latest-run proof context, manifest/result/baseline/trace checks, artifact hashes, and recovery command guidance are one validation boundary. | Latest/check regression tests in test/cli.test.js; tracer route pnpm evals check --json. |
| Trace event timeline | src/lib/trace-events.js, schemas/trace-event.schema.json | buildTraceEvents(), writeTraceEvents(), validateTraceEventsFile() | Lifecycle event order, required event types, artifact-bearing event paths, and trace validation stay in the trace owner. | Trace tests in test/cli.test.js; trace checks through validateLatestRun() and pnpm evals check --json. |
| Deterministic scoring and baseline verdicts | src/lib/scoring.js, schemas/scorer-result.schema.json, schemas/baseline-result.schema.json | scoreRuntime(), scoreArtifactCompleteness(), scoreBaselinePresence(), verdictFor() | Built-in scorer verdicts and fail-closed behavior for absent deterministic scorer evidence stay here. | Scorer assertions in test/cli.test.js; smoke run scorer artifacts. |
| Schema engine | src/lib/schema.js, schemas/*.schema.json | validateWithSchema(), validateDocument(), schemaCheck(), schemaCheckFromObject() | Supported JSON Schema keyword behavior, validation traversal, and data-path errors are centralized; callers must not reimplement schema checks. | test/schema.test.js; pnpm evals validate-schema schema-key json-file --json. |
| JSON IO and diagnostics | src/lib/json.js | readJson(), writeJson(), writeJsonAtomic() | JSON parse, read/write, and atomic-write behavior stay here; future source-location diagnostics belong here before schema callers see them. | Existing CLI/schema parse tests; future malformed JSON and duplicate-key seam tests. |
| Proof contract validation | src/lib/proof-contract-validation.js, claim/evidence/score-vector schemas | resolveProofContractTarget(), proofContractSchemaKeys(), validateProofContractObject(), validateProofContractFile() | Semantic proof-contract checks, readiness caps, and cross-field validation stay here instead of spreading through command callers. | test/schema.test.js; pnpm evals validate-schema claim-registry file --json; pnpm evals validate-schema score-vector file --json. |
| Runtime evidence contract | src/lib/runtime-evidence-contract.js, schemas/runtime-evidence-case.schema.json, fixtures/runtime-evidence/** | validateRuntimeEvidenceSuite(), validateRuntimeEvidenceCase(), scoreRuntimeEvidenceCase() | Runtime evidence fixture loading, policy checks, and deterministic runtime-evidence scoring stay here. | Runtime evidence tests in test/cli.test.js; pnpm evals check --json. |
| Runtime state packet | src/lib/runtime-state.js, src/commands/state.js, schemas/runtime-state.schema.json | buildRuntimeState(), pnpm evals state --json | Latest validation, runtime evidence status, git state, schema inventory, and validation summary are aggregated here for state reporting. | State tests in test/cli.test.js; tracer route pnpm evals state --json. |
| Claim/evidence packet | src/lib/claim-evidence-contract.js, schemas/runtime-evidence-packet.schema.json, claim/evidence schemas | buildRuntimeEvidencePacket(), scoreMissingEvidence() | Missing-evidence scoring and runtime evidence packet assembly stay here; callers consume verdicts, not raw heuristic fragments. | Claim/evidence and runtime packet tests in test/cli.test.js, test/schema.test.js. |
| Failure artifact owner | src/lib/failures.js | setActiveRunContext(), clearActiveRunContext(), writeFailureArtifact(), emitFailure() | Structured failure artifacts and active run context handling stay here so commands do not invent incompatible failure output. | CLI failure-path tests and generated failure artifacts under run bundles. |
| Report renderer | src/lib/report.js | buildReport() | Human-readable report text is explanatory only; it must not become proof authority. | Smoke run report artifact; assertions through latest artifact contract. |
| Path and hash guardrails | src/lib/paths.js, src/lib/hash.js | repoRelativePath(), rootRelativePath(), insideRepo(), insideRoot(), sha256File(), sha256Text() | Path containment, repo-relative normalization, root-relative normalization, and digest mechanics stay out of callers. | Path-traversal and artifact hash tests in test/cli.test.js, test/schema.test.js. |
| Verification gate | scripts/verify.js, test/verify.test.js, .harness/ci-required-checks.json | pnpm verify | CI-equivalent deterministic checks, wrapper command list, and lightweight credential scan stay in the verify owner. | test/verify.test.js; tracer route pnpm verify. |

### Slice Placement Matrix

| Slice | Where It Lives | Supporting Surfaces | First Seam Test | Tracer Proof |
| --- | --- | --- | --- | --- |
| OPP-001 Eval Health Checks | New owner src/lib/suite-health.js if implemented; it should read through src/lib/suite-contract.js and proof-contract validators, not replace them. | schemas/runtime-state.schema.json, src/lib/runtime-state.js, weak-suite fixtures under fixtures/**, test/cli.test.js. | A minimal suite with no meaningful scorer/evidence coverage reports blocked_weak_suite; a suite with required scorer/evidence coverage reports pass. | pnpm evals check --json; pnpm verify after command integration. |
| OPP-002 Source-Location Diagnostics | src/lib/json.js owns parse/source diagnostics; src/lib/schema.js and src/lib/proof-contract-validation.js only consume normalized diagnostics. | Case, suite, claim, evidence, and score-vector validators; src/commands/validation.js; malformed JSON fixtures. | Duplicate-key or malformed JSON produces the same source-location shape through run, validate, validate-schema, and check. | pnpm evals validate fixture --json; pnpm evals check --json. |
| OPP-003 Contract Lifecycle Metadata | src/lib/proof-contract-validation.js owns semantic lifecycle checks; schema shape belongs in a new local schema such as schemas/contract-status.schema.json only after a packet approves it. | .harness/contracts/** if introduced; test/schema.test.js; documentation references. | Deprecated contract without migration evidence fails; stable contract with owner and lifecycle metadata passes. | pnpm evals validate-schema contract-status file --json; pnpm verify after wrapper integration. |
| OPP-004 Case Adaptation Metadata | Existing contract owners: schemas/eval-case.schema.json, src/lib/case-contract.js, schemas/runtime-evidence-case.schema.json, src/lib/runtime-evidence-contract.js. No adapter root. | schemas/runtime-evidence-packet.schema.json, runtime evidence fixtures, smoke fixture. | Privacy classification or adaptation metadata is validated as data; executable adapters or network references fail phase-one policy. | pnpm evals run fixtures/smoke/pr-closeout.case.json --json; pnpm evals check --json. |
| OPP-005 Failure Replay Capsules | src/lib/run-bundle.js owns capsule creation only for failed runs; src/lib/artifact-bundle.js owns artifact contract exposure. | New schema only if needed, for example schemas/failure-replay-capsule.schema.json; src/commands/run.js; failure-path fixtures. | A failed synthetic case writes a replay capsule with input, command, artifact refs, and recovery command; a passing run does not require one. | Failure fixture via pnpm evals run failure-case --json; pnpm evals check --json if latest points at failure evidence. |
| OPP-006 Component Score Aggregation With Gate Caps | src/lib/proof-contract-validation.js and schemas/score-vector.schema.json own score-vector gate-cap semantics. src/lib/scoring.js changes only if built-in scorer output shape changes. | test/schema.test.js, score-vector fixtures. | A high aggregate score with a failing critical component is capped or blocked by schema/semantic validation. | pnpm evals validate-schema score-vector fixture --json; pnpm verify after command integration. |
| OPP-007 Trace Stability Checks | src/lib/trace-events.js owns trace stability and lifecycle validation; src/lib/latest-run.js consumes the result when validating latest. | schemas/trace-event.schema.json, schemas/runtime-evidence-packet.schema.json, test/cli.test.js. | Missing required trace events or unstable event ordering fails with a deterministic status; valid trace timeline passes. | pnpm evals check --json; pnpm evals state --json if state reports stability. |
| OPP-008 Output Normalization Owner Module | New owner only after repeated pressure justifies it, likely src/lib/output-normalization.js; commands stay thin. | src/commands/run.js, src/commands/state.js, src/commands/validation.js, test/cli.test.js. | JSON and text modes share normalized status/error vocabulary without duplicating formatter decisions in command bodies. | Command pair checks for run, check, and state in JSON and text modes. |
| OPP-009 Local Macro Pattern Ledger | New local owner src/lib/macro-evidence.js plus optional command src/commands/macro.js; no notebooks, embeddings, dashboards, or external graders as authority. | New schema only after packet approval, for example schemas/macro-pattern-ledger.schema.json; .harness/evals/runs/**; src/lib/trace-events.js; src/lib/scoring.js; src/lib/latest-run.js. | A local run-bundle population with missing scorers or unstable traces returns blocked statuses; a complete local population emits deterministic pattern rows with source run IDs. | Provisional route: pnpm evals macro --from .harness/evals/runs --json; then pnpm verify once integrated. |

### Placement Rules For Future Packets

- If a slice affects a public command, the command file may route and format,
  but the proof rule must live in an owner under src/lib/**.
- If a slice affects a JSON contract, the schema file owns shape and the
  matching validator owner owns semantic checks that JSON Schema cannot express.
- If a slice affects generated run artifacts, src/lib/run-bundle.js,
  src/lib/artifact-bundle.js, or src/lib/latest-run.js must be the owner;
  tests or reports must not silently define artifact truth.
- If a slice affects traceability, the first owner to check is
  src/lib/trace-events.js; telemetry or session summaries remain explanatory.
- If a slice needs cross-run aggregation, create a local data-only owner such
  as src/lib/macro-evidence.js; do not introduce dashboards, embeddings,
  networked mining, or external evaluator roots in phase one.
- If no existing owner is a clean fit, write the deep module packet before
  creating a new module. The packet must explain why the behavior cannot live
  in an existing owner without reducing module depth.

## Executive Summary

The strongest mining opportunities are not new adapters or UI features. They
are small proof-spine hardeners:

1. Add Hypothesis-style eval health checks that classify weak suites before a
   run can be treated as meaningful.
2. Add Semgrep-style source-location diagnostics for suite, case, claim, and
   scorer-contract validation errors.
3. Add OpenTelemetry-style lifecycle/status metadata for local scorer and
   schema contracts, including deprecation evidence.
4. Add OpenEval-style case adaptation metadata, but scoped to repo-local eval
   cases and runtime evidence packets instead of benchmark ingestion.
5. Add Hypothesis-style reproducible failure capsules for failed eval cases,
   keeping explicit fixtures authoritative and replay caches advisory.
6. Add a local macro-pattern ledger after trace and scorer evidence are stable:
   aggregate many run bundles into repeat behavior patterns without making
   notebooks, dashboards, embeddings, or external graders authoritative.

The main anti-pattern is promptfoo-style breadth. Promptfoo is rich and useful,
but evals should not copy provider systems, dashboards, plugin loading, remote
assertion breadth, or `no assertions = pass` semantics. Evals is currently
right to fail when deterministic scorer evidence is absent.

## Project Mining Notes

### OpenEval

Useful pattern:

- OpenEval is item-centered. Each item captures content, model adaptation,
  item adaptation, response content, and scores in one self-contained record.
- The README distinguishes requirement levels such as `auto`, `required`,
  `non-empty`, and `optional`.
- Responses capture generation parameters, system instructions, tools,
  demonstrations, external resources, and score artifacts.

What evals should mine:

- A case-level adaptation record for runtime evidence packets:
  `input_source`, `adapted_input`, `environment_constraints`,
  `tool_profile`, `privacy_classification`, and `evidence_required`.
- Requirement-level vocabulary for schema diagnostics, if mapped into real JSON
  Schema and semantic validators.

What evals should not copy:

- OpenEval's `item_schema.json` is a descriptor/template, not standard JSON
  Schema. Evals already owns JSON Schema files and should keep them canonical.
- Hugging Face storage splitting is not phase-one relevant.

### OpenTelemetry Collector

Useful pattern:

- Collector metadata has explicit status records: class, stability,
  distributions, codeowners, unsupported platforms, deprecation, and warnings.
- Status validation is centralized and aggregates errors.
- Deprecation requires a migration guide and date.
- Test fixtures include valid and invalid metadata cases.
- Feature gates include `id`, `description`, `stage`, `from_version`,
  optional `to_version`, and `reference_url`.

What evals should mine:

- A small `contract-status` metadata shape for schemas and built-in scorers:
  `contract_id`, `owner`, `class`, `stability`, `introduced_in`,
  `deprecation`, and `migration_reference`.
- A central validator for lifecycle metadata when evals begins versioning
  proof contracts.
- Negative fixtures for lifecycle errors, especially deprecated-without-
  migration-reference and unknown-stability cases.

What evals should not copy:

- The Collector's code-generation system, distribution matrix, and component
  ecosystem. Those are too large and would violate the executable-spine
  compression goal.

### Semgrep

Useful pattern:

- Semgrep preserves source spans in parsed YAML and reports contextual
  validation errors.
- Duplicate keys are detected early and become schema errors with source
  context.
- Rule hashing deliberately excludes metadata because metadata may contain
  user-specific information.
- Output formatting is centralized through normalized output settings and
  formatters.

What evals should mine:

- Source-location-aware diagnostics for JSON/YAML contract files. Evals should
  report file, line, column, JSON pointer, and contract label where possible.
- Duplicate-key detection for JSON files before schema validation. Standard
  `JSON.parse` overwrites duplicate keys, which can hide configuration drift.
- Stable hash semantics for proof contracts that exclude mutable/private
  metadata where appropriate.
- A future output-normalization owner module if evals adds additional output
  formats. Do not add formats until repeated usage proves need.

What evals should not copy:

- Semgrep's rule-language engine, product matrix, or formatter breadth.

### Hypothesis

Useful pattern:

- Hypothesis separates phases such as explicit, reuse, generate, target,
  shrink, and explain.
- Health checks classify tests that are slow, over-filtered, fixture-sensitive,
  or otherwise likely to produce weak evidence.
- The example database replays previous failures but is explicitly cache-like;
  correctness must come from explicit examples, not the cache.
- Observability emits analysis-ready rows, one per test case.
- Reproduction blobs allow a failure to be replayed and fail with
  `DidNotReproduce` if the encoded failure no longer triggers the issue.

What evals should mine:

- `evals check` health checks for weak suites:
  no negative cases, no deterministic scorers, no required artifacts, no
  evidence-bearing claims, no baseline stance, privacy missing, or all checks
  advisory.
- A local failure replay capsule for failed eval cases:
  `case_id`, `suite_id`, `input_hash`, `expected_contract_hash`,
  `failure_class`, `minimal_repro_command`, and `artifact_bundle_path`.
- Per-case analysis rows inside the artifact bundle, separate from the
  authoritative result.

What evals should not copy:

- Property generation, shrinking engine internals, or probabilistic testing as
  proof authority. Those are valuable later, but phase one needs deterministic
  local proof first.

### Promptfoo

Useful pattern:

- Promptfoo has a broad assertion handler registry and typed configuration
  schemas.
- It supports weighted component results, named scores, token usage aggregation,
  and optional scoring functions.
- It has trace-aware assertions that wait for trace data to become stable.
- Assertion results preserve component-level evidence and aggregate scores.

Risky pattern:

- `AssertionsResult.noAssertsResult()` returns pass=true, score=1, reason
  `No assertions`. That is incompatible with evals' proof-spine doctrine.
  Evals should keep absent deterministic scorer evidence as fail or
  `not_evaluable`, not success.

What evals should mine:

- Component score vectors and named score aggregation, with critical-gate caps
  preserved.
- Trace-aware checks as optional local evidence packet validators, fail-closed
  when the trace artifact is missing or unstable.
- Typed CLI/config normalization patterns, but only if local JSON Schema and
  existing dependency-free validation become insufficient.

What evals should not copy:

- Provider framework breadth, dashboard/UI surfaces, plugin systems, remote
  graders, or model-judge gates.

### Macro Evals Cookbook Excerpt

Useful pattern:

- The user-provided macro-evals cookbook excerpt separates lower-level evals
  from macro evals. Lower-level evals grade an individual run, agent, handoff,
  tool, or completed workflow. Macro evals look across many run traces to find
  repeated behavior patterns.
- The reader-facing label chain is useful and domain-neutral:
  `case_type -> run_outcome -> eval_finding -> behavior_pattern`.
- The workflow turns each trace into a compact analysis document, groups
  recurring patterns across a population, ranks patterns by prevalence and
  severity, then drills into representative traces to identify where a human
  should inspect first.

What evals should mine:

- A local, offline macro-pattern ledger over evals-owned artifacts:
  run bundles, trace events, scorer results, runtime evidence packets, and
  suite/case metadata.
- Deterministic grouping first: case family, verdict, failing scorer,
  blocker class, owner module, required artifact class, and trace-stability
  class. Optional topic labels can be added later only as advisory metadata.
- A compact per-run document shape that summarizes the setup, verdict, scorer
  findings, artifact paths, trace-window facts, and owner module evidence.
- Pattern-level triage fields such as `trace_count`, `prevalence`,
  `severity_weighted_prevalence`, representative run ids, and first inspection
  target.

What evals should not copy:

- Notebook execution as product surface.
- Plotly dashboards or visual UI as readiness evidence.
- Promptfoo, BERTopic, pandas, SQLite, or OpenAI API usage as runtime
  dependencies.
- Required embeddings, LLM clustering, or model-judge gates.
- External telemetry, trace collectors, or business-domain taxonomies as proof
  authority.

## Opportunity Register

### OPP-001: Eval Health Checks

Priority: P0
Source pattern: Hypothesis health checks
Current evals fit: `pnpm evals check --json`, `schemas/runtime-state.schema.json`,
`src/lib/proof-contract-validation.js`
Owner module: create `src/lib/suite-health.js` as the single classifier owner;
`suite-contract.js`, `proof-contract-validation.js`, and runtime-state
reporting may consume its normalized output but must not independently decide
health severity.

Problem:

Evals can prove that a run bundle is structurally valid, but it does not yet
grade whether a suite is evidentially weak before a run is used as proof.

Recommended fix:

Add deterministic health classifications to `check --json` and suite
validation:

- `no_negative_cases`
- `no_required_artifacts`
- `no_deterministic_scorers`
- `no_evidence_claims`
- `baseline_stance_missing`
- `privacy_metadata_missing`
- `all_checks_advisory`

Each health classification must include a severity:

- `advisory`: useful signal, never caps readiness by itself.
- `warning`: caps only release-readiness, not narrow smoke usefulness.
- `blocking`: caps readiness because the suite cannot produce meaningful proof
  for its declared intent.

Intentionally minimal suites must have a machine-readable suite intent and
override reason before a warning can be accepted. Overrides must be explicit in
the suite or runtime state output, not hidden in prose.

Suggested files:

- `src/lib/suite-contract.js`
- `src/lib/proof-contract-validation.js`
- `schemas/runtime-state.schema.json`
- `test/cli.test.js`
- `fixtures/**` negative cases

Validation command:

```bash
pnpm test
pnpm evals check --json
pnpm verify
```

Acceptance:

- Weak suites are classified in machine-readable output.
- Blocking health failures cap readiness; warning/advisory classifications are
  visible but do not falsely block intentionally minimal smoke suites.
- Minimal-suite override behavior is covered by negative and positive fixtures.
- Existing smoke fixture remains valid.

### OPP-002: Source-Location Diagnostics

Priority: P1
Source pattern: Semgrep source spans and duplicate-key errors
Current evals fit: `src/lib/json.js`, `src/lib/schema.js`
Owner module: `src/lib/json.js` owns parse, duplicate-key detection, and
source-location diagnostics. `schema.js`, `proof-contract-validation.js`,
commands, and future helpers consume normalized diagnostics only.

Problem:

JSON parse and schema errors are valid but not yet optimized for fast repair.
Duplicate JSON keys can be silently overwritten before validation.

Recommended fix:

Introduce one owner module for contract-file diagnostics:

- parse JSON with duplicate-key detection;
- return file, line, column, JSON pointer, schema label, and message;
- preserve existing public JSON output additively.
- prohibit direct `JSON.parse` for contract files outside the owner module.

Suggested files:

- `src/lib/json.js`
- `src/lib/schema.js`
- `src/lib/proof-contract-validation.js`
- `test/schema.test.js`

Validation command:

```bash
pnpm test
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
pnpm evals check --json
```

Acceptance:

- Duplicate keys fail before schema validation.
- Diagnostics include line/column where possible.
- The same malformed fixture fails consistently across `run`, `check`, and
  suite-validation paths.
- Diagnostics formatting is not duplicated outside `src/lib/json.js`.
- Existing command contracts remain additive.

### OPP-003: Contract Lifecycle Metadata

Priority: P1
Source pattern: OpenTelemetry Collector status metadata
Current evals fit: `schemas/*.schema.json`, `src/lib/scoring.js`
Owner module: `src/lib/proof-contract-validation.js` validates lifecycle
metadata. Contract status records live in `.harness/contracts/` as
check-time/governance evidence, not runtime authority.

Problem:

Evals has schemas and scorer versions, but no shared lifecycle/status metadata
for contracts as they evolve.

Recommended fix:

Add data-only contract status records for built-in proof surfaces:

- `contract_id`
- `contract_class`
- `owner`
- `stability`
- `introduced_in`
- `deprecation`
- `migration_reference`
- `warnings`

Keep this as local metadata and validation only; do not add code generation.

Suggested files:

- `schemas/contract-status.schema.json`
- `src/lib/proof-contract-validation.js`
- `.harness/contracts/**`
- `test/schema.test.js`

Validation command:

```bash
pnpm test
pnpm verify
```

Acceptance:

- Deprecated contracts require a migration reference and date.
- Unknown stability or class values fail deterministic validation.
- No runtime dependency or generated code is introduced.
- No mirrored contract-status directory is allowed unless a later ADR defines
  synchronization authority.

### OPP-004: Case Adaptation Metadata

Priority: P1
Source pattern: OpenEval item adaptation and model adaptation
Current evals fit: `schemas/eval-case.schema.json`,
`schemas/runtime-evidence-case.schema.json`,
`schemas/runtime-evidence-packet.schema.json`
Owner module: schema ownership remains in `schemas/*`; runtime normalization
belongs to the existing case/runtime evidence contract modules. Do not add a
new adapter root.

Problem:

Evals can run deterministic cases, but case provenance and adaptation details
can be too thin for future cross-repo suites.

Recommended fix:

Add optional, schema-backed adaptation metadata:

- `source_context`
- `adapted_input`
- `tool_profile`
- `environment_constraints`
- `privacy_classification`
- `domain_truth_owner`
- `evidence_required`

Suggested files:

- `schemas/eval-case.schema.json`
- `schemas/runtime-evidence-case.schema.json`
- `schemas/runtime-evidence-packet.schema.json`
- `fixtures/smoke/pr-closeout.case.json`
- `test/schema.test.js`

Validation command:

```bash
pnpm test
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
pnpm verify
```

Acceptance:

- Metadata is optional and additive.
- Missing provenance remains visible for cross-repo suite cases.
- Consumer repos still own domain truth.
- Adaptation metadata does not become a source-mining or domain-truth import
  mechanism.

### OPP-005: Failure Replay Capsules

Priority: P2
Source pattern: Hypothesis example database and reproduce_failure blobs
Current evals fit: artifact bundle, latest pointer, `trace-events.jsonl`
Owner module: `src/lib/run-bundle.js` owns replay capsule creation as a
per-run artifact. Readiness gates and latest publication must not read replay
capsules as current proof authority.

Problem:

Failed run bundles are inspectable, but there is not yet a compact replay
capsule that can be promoted into a regression fixture.

Recommended fix:

When a case fails, write a small replay capsule:

- `case_id`
- `suite_id`
- `input_hash`
- `contract_hash`
- `failure_class`
- `minimal_repro_command`
- `artifact_bundle_path`
- `promotion_status`

Keep replay capsules advisory. Explicit fixtures remain authoritative.

Storage rule:

- Capsules live only inside the failed run's artifact bundle.
- They are not copied into `latest.json`.
- They are never read by readiness gates.
- Promotion from capsule to fixture requires a separate human-visible fixture
  edit and validation run.

Suggested files:

- `src/lib/run-bundle.js`
- `src/lib/artifact-bundle.js`
- `schemas/failure-replay-capsule.schema.json`
- `test/cli.test.js`

Validation command:

```bash
pnpm test
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
pnpm verify
```

Acceptance:

- Failed runs produce a replay capsule.
- Passing runs do not pretend a replay capsule is required.
- Replay capsules never replace explicit fixtures.
- Readiness checks ignore replay capsules.

### OPP-006: Component Score Aggregation With Gate Caps

Priority: P2
Source pattern: Promptfoo component results and named scores
Current evals fit: `schemas/score-vector.schema.json`,
`src/lib/proof-contract-validation.js`
Owner module: `src/lib/proof-contract-validation.js` owns score-vector
semantic validation and critical-gate caps.

Problem:

Score vector semantics exist, but future richer scoring needs an explicit
composition rule so aggregate scores cannot hide critical failures.

Recommended fix:

Extend score-vector examples and validation around:

- component results;
- named score weights;
- threshold evidence;
- critical gate caps that override optimistic aggregate status.

Suggested files:

- `schemas/score-vector.schema.json`
- `src/lib/proof-contract-validation.js`
- `test/schema.test.js`

Validation command:

```bash
pnpm test
pnpm verify
```

Acceptance:

- Aggregate score cannot produce strong readiness while critical gates fail.
- Component evidence remains visible.
- Threshold and weighting changes include backward-compatibility checks for
  existing score-vector consumers.

### OPP-007: Trace Stability Checks

Priority: P2
Source pattern: Promptfoo trace-aware assertions and Hypothesis observability rows
Current evals fit: `schemas/trace-event.schema.json`,
`schemas/runtime-evidence-packet.schema.json`
Owner module: `src/lib/trace-events.js` owns trace stability classification;
`latest-run.js` may consume stability verdicts but must not recalculate them.

Problem:

Trace event timelines are local artifacts, but evals does not yet classify
whether a trace is stable enough to support a runtime evidence claim.

Recommended fix:

Add deterministic local checks:

- event count stable across manifest validation;
- required lifecycle events present;
- timestamps monotonic where expected;
- final status event agrees with result verdict;
- trace missing means blocked, not pass.

Suggested files:

- `src/lib/trace-events.js`
- `src/lib/latest-run.js`
- `schemas/runtime-evidence-packet.schema.json`
- `test/cli.test.js`

Validation command:

```bash
pnpm test
pnpm evals check --json
pnpm verify
```

Acceptance:

- Missing or unstable traces are machine-classified.
- Telemetry remains explanatory; artifact bundle remains authoritative.
- Trace stability can cap trace-backed claims, but trace telemetry never
  replaces local artifact proof.

### OPP-008: Output Normalization Owner Module

Priority: P3
Source pattern: Semgrep normalized output settings
Current evals fit: `src/cli.js`, `src/commands/*.js`

Problem:

Current output formats are intentionally small. If additional output modes are
added later, format handling can sprawl across commands.

Recommended fix:

Do not build this now. If repeated usage proves additional formats are needed,
create a single output-normalization module before adding new formats.

Acceptance:

- No phase-one change.
- Future output additions have one owner module.

### OPP-009: Local Macro Pattern Ledger

Priority: P2
Source pattern: user-provided macro-evals cookbook excerpt
Current evals fit: artifact bundles, scorer results, trace events, runtime
evidence packets, suite/case metadata
Owner module: future `src/lib/macro-evidence.js` owns local aggregation and
pattern-ledger generation. Commands may render the ledger, but must not infer
behavior patterns independently.

Problem:

Single-run proof shows whether one case produced valid evidence. It does not
show whether the same failure class, missing artifact, trace instability, or
handoff/review pattern is recurring across many runs.

Recommended fix:

Add an offline macro-pattern ledger that reads only local evals artifacts and
writes an advisory evidence report:

- normalize run bundles into compact per-run documents;
- join `case_type`, `run_outcome`, `eval_finding`, and deterministic
  `behavior_pattern` labels;
- group repeated failures by scorer id, blocker class, trace-stability class,
  owner module, required artifact type, and case metadata;
- rank patterns by prevalence and severity;
- list representative run ids, artifact paths, and first inspection targets.

The first implementation should be deterministic and data-only. Optional topic
modeling, embeddings, or human-friendly pattern labels can be future advisory
enrichment, never readiness authority.

Command and output contract:

```bash
pnpm evals macro --from .harness/evals/runs --json
```

The command name is provisional until a deep module packet confirms CLI fit,
but the implementation must expose one documented agent-operable route rather
than relying on notebooks or ad hoc scripts. JSON output should include:

- `status`: `pass`, `blocked_missing_artifacts`, `blocked_missing_scorers`,
  `blocked_unstable_traces`, or `blocked_schema_validation`;
- `ledger_path`: repository-local path to the written pattern ledger;
- `patterns`: deterministic pattern summaries;
- `source_run_count` and `source_artifact_paths`; and
- `advisory_enrichment`: explicit boolean, default `false`.

The default write location should be `.harness/evals/macro/<timestamp>/` with
a schema-validated `pattern-ledger.json` and human-readable `report.md`.

Suggested files:

- `src/lib/macro-evidence.js`
- `schemas/macro-pattern-ledger.schema.json`
- `test/cli.test.js`
- `.harness/evals/macro/**` generated evidence artifacts

Validation command:

```bash
pnpm test
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
pnpm evals check --json
pnpm verify
```

Acceptance:

- Macro-pattern output is derived from local artifact bundles only.
- Users and agents can invoke the same documented command route.
- JSON output exposes fail-closed status when source artifacts, scorer results,
  trace events, or schema validation are missing.
- The generated ledger has a stable repository-local path and schema.
- Each pattern cites source run ids and artifact paths.
- Missing scorer results, trace events, or evidence packets remain visible as
  findings instead of disappearing from the population view.
- Optional labels are marked advisory and cannot override deterministic scorer
  verdicts, baseline comparison, readiness caps, or trace stability.
- The feature introduces no dashboard, notebook dependency, external API key,
  Promptfoo dependency, BERTopic dependency, SQLite requirement, cloud runner,
  source-mining automation, or telemetry authority.

## Do Not Mine Yet

These are attractive but wrong for evals phase one:

- Promptfoo dashboards, UI, provider registries, remote graders, and plugin
  systems.
- OpenTelemetry Collector code generation and distribution metadata breadth.
- Semgrep rule-language breadth and product matrix.
- Hypothesis generation and shrinking internals as proof authority.
- OpenEval hosted dataset/storage conventions.
- Macro-eval notebook dependencies, dashboards, required embeddings, required
  LLM topic labels, or external trace stores as proof authority.
- Any external framework as a canonical root.

## Recommended Sequence

1. OPP-001 Eval Health Checks.
2. OPP-002 Source-Location Diagnostics.
3. OPP-007 Trace Stability Checks.
4. OPP-003 Contract Lifecycle Metadata.
5. OPP-004 Case Adaptation Metadata.
6. OPP-005 Failure Replay Capsules.
7. OPP-006 Component Score Aggregation With Gate Caps.
8. OPP-009 Local Macro Pattern Ledger.
9. OPP-008 Output Normalization only if output-format pressure appears.

Dependency note:

- OPP-004 through OPP-006 must not require trace-backed readiness until
  OPP-007 exists. If implementation pressure pulls OPP-004, OPP-005, or OPP-006
  forward, trace evidence may be recorded only as explanatory context, not as a
  readiness authority.
- Any opportunity that increases schema or governance complexity must include
  a rollback trigger in its deep module fix packet. If the slice cannot preserve
  additive public output and the phase-one hard blocks, stop and re-specify
  before implementation.

## Linear Candidate Titles

- Evals: add suite health checks for weak proof detection
- Evals: add source-location diagnostics and duplicate-key detection
- Evals: add contract lifecycle metadata validation
- Evals: add case adaptation metadata to eval and runtime evidence schemas
- Evals: add advisory failure replay capsules
- Evals: harden score-vector component aggregation semantics
- Evals: classify trace timeline stability in check output
- Evals: add local macro-pattern ledger over run bundles

## next_check

Before implementing any opportunity:

1. Write a deep module fix packet for that opportunity.
2. Add negative fixtures before or with implementation.
3. Keep public JSON output additive.
4. Define the user-and-agent command route and machine-readable output contract
   before adding runtime behavior.
5. Run the narrow test first, then `pnpm test`, then `pnpm verify`.
6. Reconfirm that the change does not introduce dashboards, plugin systems,
   cloud runners, external adapters, source-mining automation, or required LLM
   judge gates.
7. Persist the slice evidence note under `artifacts/evals/` with exact command
   outcomes, generated artifact paths, failure ownership classification, and the
   required `WROTE:` line.

## Review Loop Notes

This audit was reviewed by three subagents:

- `artifacts/reviews/2026-05-25-evals-router-mining-agent-native-reviewer.md`
- `artifacts/reviews/2026-05-25-evals-router-mining-architecture-strategist.md`
- `artifacts/reviews/2026-05-25-evals-router-mining-adversarial-reviewer.md`

Fixes applied from review:

- Added immutable external snapshot provenance and a reproducible fetch pattern.
- Added a shared implementation packet and evidence-note contract for every
  opportunity.
- Added owner-module boundaries for OPP-001 through OPP-007.
- Added health-check severity tiers and a minimal-suite override contract.
- Added parser ownership and cross-command parity requirements for duplicate-key
  diagnostics.
- Chose `.harness/contracts/**` as the lifecycle metadata home.
- Added replay capsule authority and storage limits.
- Moved trace stability earlier in the recommended sequence and added
  dependency notes for trace-backed readiness.
- Added the Macro Evals Cookbook excerpt as OPP-009, constrained to local
  deterministic artifacts and explicitly excluding dashboards, notebooks,
  required embeddings, LLM clustering, external trace stores, and telemetry
  authority.
- Added an agent-operable provisional command and JSON output contract for
  OPP-009 after final agent-native review flagged the missing parity surface.

Final re-review status:

- `artifacts/reviews/2026-05-25-evals-router-mining-agent-native-final.md`
  reported one warning: OPP-009 needed an explicit user-and-agent command and
  output contract. That warning was fixed in this audit.
- `artifacts/reviews/2026-05-25-evals-router-mining-architecture-final.md`
  reported no material fixable architectural findings after OPP-009.
- A final adversarial retry returned mailbox text but did not write the
  required artifact, so it is recorded as a reviewer-artifact coverage gap,
  not approval. The earlier adversarial artifact remains the durable
  adversarial review evidence for this audit.

Final re-review pass:

- `artifacts/reviews/2026-05-25-evals-router-mining-agent-native-final.md`
- `artifacts/reviews/2026-05-25-evals-router-mining-architecture-final.md`

Coverage gap note:

- A final adversarial retry artifact at
  `artifacts/reviews/2026-05-25-evals-router-mining-adversarial-final.md`
  was requested once but not materialized. The earlier adversarial review
  artifact remains the recorded adversarial evidence for this audit cycle.
