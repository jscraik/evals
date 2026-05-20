# Improve Codebase Architecture Review

schema_version: 1
execution_mode: read_only_architecture_review
date: 2026-05-18

## Ranked Opportunities

### 1. Separate schema validation mechanics from runner orchestration before adding tests or suites

Complexity symptom:
src/cli.js now owns CLI parsing, schema subset validation, fixture policy, scoring, artifact writing, manifest hashing, latest validation, and reporting.

Evidence:
- src/cli.js:119-179 implements a reusable JSON Schema subset validator.
- src/cli.js:342-510 implements run orchestration and artifact writes.
- src/cli.js:525-620 implements latest-run validation and check output.

Smallest reversible move:
Extract the schema validator and schema target registry into a local module such as src/schema-validation.js only when adding tests. Keep public CLI behavior unchanged.

Deeper interface move:
Introduce explicit modules around contracts: case loading/policy validation, scorer execution, artifact bundle writing, and latest-run validation.

Tracer proof:
Run node:test against invalid fixture, latest pointer validation, and manifest hash mismatch, then run pnpm evals check --json.

### 2. Make artifact retention an explicit contract before more runs accumulate

Complexity symptom:
The repo currently keeps both a human-output proof run and a JSON-output proof run, while manifest retention says automatic duration is undefined.

Evidence:
- .harness/evals/evals-executable-spine-completion-audit.md:36 cites both proof runs.
- src/cli.js:448-450 writes "automatic retention duration is not defined yet."

Smallest reversible move:
Add a short retention note to README or the closure eval: phase one retains the latest JSON proof plus any separately cited human-output proof.

Deeper interface move:
Add a prune/list command only after repeated suites create real noise. Do not add it before tests.

### 3. Keep Linear status language as a state machine

Complexity symptom:
The docs correctly distinguish tracker_blocked from override_approved, but stale commit evidence shows how easily delivery-state wording can drift.

Evidence:
- UBIQUITOUS_LANGUAGE.md:17-18 defines both states.
- README.md:59-67 and AGENTS.md:52-58 preserve the live-issue versus override distinction.

Smallest reversible move:
Avoid "current head" claims in hand-authored docs. Prefer state names plus commands that prove current git state.

## Recommended First Move

Add tests first, then extract schema validation. That gives a thin proof path before any module split.

## Validation Paths

- node --check src/cli.js
- pnpm evals check --json
- pnpm evals validate fixtures/smoke/pr-closeout.case.json --json
- pnpm evals validate .harness/evals/runs/latest.json --json

## 2026-05-19 Reviewer-Hardening Pass

schema_version: 1
selected_skill: improve-codebase-architecture

complexity_symptoms:
Latest-run validation trusted artifact pointers before proving they were
repo-relative. That leaked storage-boundary knowledge into callers and made
manifest hashing depend on a fragile path convention.

fresh_evidence:
- src/cli.js now validates latest.json and manifest paths through a shared
  repoRelativePath helper before existence checks, schema validation, or hashing.
- test/cli.test.js covers traversal in validation targets, latest.json pointer
  traversal, absolute latest.json pointers, and manifest artifact traversal.
- pnpm test and pnpm evals check --json pass after the path-boundary change.

design_options:
- patch_design: keep src/cli.js monolithic for phase one and add a small
  boundary helper plus regression tests.
- interface_design: split latest-run validation, artifact-manifest hashing, and
  schema validation into modules.

recommended_first_move:
Keep the patch_design. The boundary is now explicit and tested; extracting
modules before a second runner surface exists would add ceremony without hiding
more complexity.

tracer_proof:
pnpm evals validate ../outside.json --json returns a structured validation
failure instead of an unhandled stack trace.

decision_surface:
UBIQUITOUS_LANGUAGE.md now names repo-relative artifact pointer as the canonical
term for latest.json and manifest path fields.

validation:
- pass: node --check src/cli.js
- pass: pnpm test
- pass: pnpm evals check --json
- pass: pnpm evals --help
- pass: pnpm evals validate ../outside.json --json returned the expected
  structured failure
- pass: git diff --check

confidence:
High for the scoped boundary hardening because the failure mode is covered by
unit tests and the public CLI gate. Medium for future module extraction timing
because it depends on the next consumer suite shape.

open_questions:
Whether to extract validation modules should wait until the first consumer suite
adds a second real caller.
