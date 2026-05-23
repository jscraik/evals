# PU-004 Simplify/Unslopify Review

## Scope reviewed
- scripts/verify.js
- test/verify.test.js
- AGENTS.md
- CONTRIBUTING.md
- SECURITY.md
- tests/docs-pr-changes.test.js

## Severity-ranked findings

### Informational

1. `scripts/verify.js:213-227` - `results` accumulation is more state than needed for current behavior.
- Why: The loop exits on first failure, and the final decision is just whether any failure occurred.
- Simplification: Replace `results` with a single `failed` boolean (or immediate `process.exit(1)` branch after logging). This removes one array allocation and one post-loop scan while keeping behavior identical.

2. `scripts/verify.js:86-99` and `scripts/verify.js:111-135` - command/reporting and execution each branch on fallback mode, which duplicates mode logic in two places.
- Why: `credentialScanCommand()` and `credentialScan()` both need to stay in sync on mode selection (`EVALS_VERIFY_FORCE_NODE_CREDENTIAL_SCAN`), so future edits risk drift.
- Simplification: Centralize mode resolution once (for example `const useNodeFallback = ...`) and use it in both places.

3. `test/verify.test.js:59-98` - repeated setup/assert shape across the two redaction tests.
- Why: Both tests create temp roots, inject credential-shaped values, run scanners, then assert redaction and no leakage.
- Simplification: Extract a tiny local helper in the test file for "write sample + assert redaction" to reduce duplication and make test intent easier to scan.

## Explicit severity statement
No blocker, high, or medium findings were identified in this review.

## Net simplification estimate
- Estimated removable/simplifiable LOC: ~12-25 lines
- Risk: low (behavior-preserving cleanups only)

WROTE: artifacts/reviews/pu004-simplify-unslopify.md
