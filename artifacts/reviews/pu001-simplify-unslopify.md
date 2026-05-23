## Simplification Analysis

### Core Purpose
The changed code needs to verify subagent artifact identity deterministically (including unsafe paths and ambiguous duplicate writes) and prove that behavior through focused CLI tests.

### Unnecessary Complexity Found
- low - src/lib/runtime-evidence-contract.js:205-208,231,249-251
- Why unnecessary: `writtenBySubagent` duplicates information already derivable from `writtenByIdentity` and `starts`. Maintaining both increases cognitive load and creates a second state surface that can drift.
- Suggested simplification: remove `writtenBySubagent` and compute per-subagent write counts from `writtenByIdentity` once, then reuse that derived structure for the start-count checks.

- low - src/lib/runtime-evidence-contract.js:210-214
- Why unnecessary: the generic `push(map, key, value)` helper is used only twice and hides straightforward collection logic in a short function.
- Suggested simplification: inline the two push sites (or replace with a tiny domain-specific helper like `appendIdentity`) to make event handling easier to scan.

- low - test/cli.test.js:591-664
- Why unnecessary: the two new negative tests repeat almost identical fixture mutation and check plumbing (load fixture, mutate, set expected drift, run check, locate runtime check).
- Suggested simplification: add one small local helper for runtime-evidence negative-case setup/assertion, then keep only per-test mutations inline.

### Code to Remove
- src/lib/runtime-evidence-contract.js:207,231,249-251 - redundant state map (`writtenBySubagent`) can be removed after deriving counts from identity map.
- src/lib/runtime-evidence-contract.js:211-214 - removable generic helper if inlined.
- test/cli.test.js:591-664 - repetitive setup lines can be reduced via a shared helper.
- Estimated LOC reduction: 15-30 lines.

### Simplification Recommendations
1. Collapse artifact-written bookkeeping to one source of truth
- Current: both identity-indexed and subagent-count maps are maintained during scan.
- Proposed: keep identity-indexed map only; derive counts in one post-pass.
- Impact: fewer mutable structures, lower drift risk, ~8-12 LOC removed.

2. Reduce repeated runtime-evidence test harness code
- Current: each new case reimplements the same fixture lifecycle and check extraction.
- Proposed: introduce a local helper for “mutate fixture -> run check -> fetch runtime evidence check”.
- Impact: clearer intent per test, ~10-18 LOC removed.

### YAGNI Violations
- test/cli.test.js:636-647
- Feature/abstraction: full inline `written` event object duplicated in test body.
- Why it violates YAGNI: this shape is now repeated test plumbing rather than unique behavior under test.
- What to do instead: use a tiny factory/helper for the standard ArtifactWritten event and override only fields needed by the case.

### Final Assessment
Total potential LOC reduction: ~2-4% of touched lines
Complexity score: Medium
Recommended action: Minor tweaks only

WROTE: artifacts/reviews/pu001-simplify-unslopify.md

