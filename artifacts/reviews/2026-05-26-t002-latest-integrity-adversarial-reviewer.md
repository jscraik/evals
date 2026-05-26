# Adversarial Review: T002 Pre-Mutation Latest Integrity

Scope reviewed:
- scripts/verify.js
- test/verify.test.js
- .harness/refactors/2026-05-26-latest-integrity-pre-mutation.md
- .harness/implementation-notes/2026-05-26-evals-evidence-led-gap-audit-notes.mdx
- docs/goals/2026-05-26-evals-evidence-led-gap-audit/receipts.jsonl

Depth calibration:
- Size estimate: Standard (>=50 changed lines across implementation, tests, and governance artifacts).
- Risk signals: data-mutation trust boundary (`latest.json`) and gate-ordering behavior.
- Techniques applied: assumption violation, composition failures, abuse cases.

## Findings

None.

No mechanically reproducible assumption-break, composition failure, or abuse chain was found in the reviewed slice. The added pre-mutation check in `scripts/verify.js:99` executes before smoke mutation commands in `scripts/verify.js:72`, and the ordering is seam-tested in `test/verify.test.js:47`. Existing corrupt latest evidence fails before overwrite in `test/verify.test.js:56`, while missing latest is explicitly classified as setup-pass in `scripts/verify.js:102` and `test/verify.test.js:68`.

## Residual Risks

1. Classification blind spot for absent latest in long-lived repos
- Scenario: In a non-clean repository, `.harness/evals/runs/latest.json` is deleted out-of-band; pre-mutation check classifies absence as pass and the subsequent smoke run recreates latest, masking provenance loss.
- Evidence: `scripts/verify.js:102`, `scripts/verify.js:103`, `scripts/verify.js:72`.
- Suggested mitigation: add an optional strict mode (or env flag) that fails on missing preexisting latest outside explicit bootstrap contexts.

2. Time-of-check to time-of-use race on latest pointer
- Scenario: Another process mutates `latest.json` between existence check and validation call; verify can fail non-deterministically with parse/path errors before smoke.
- Evidence: `scripts/verify.js:102`, `scripts/verify.js:106`.
- Suggested mitigation: low priority; if flakes appear, read once and validate from buffered content or treat transient read errors with one bounded retry.

## Testing Gaps

1. Missing abuse-case coverage for deleted-latest in non-bootstrap contexts
- Current tests cover missing latest as pass, but not policy differentiation by context.
- Evidence: `test/verify.test.js:68`.

2. Missing concurrency/race characterization
- No test simulates mutation of latest during pre-check execution.
- Evidence: `test/verify.test.js:47`.

WROTE: artifacts/reviews/2026-05-26-t002-latest-integrity-adversarial-reviewer.md
