# PU-004 Architecture Review

## Scope Reviewed
- `scripts/verify.js` credential scan contract and fallback behavior
- `test/verify.test.js`
- `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`
- `tests/docs-pr-changes.test.js`

## Findings (Severity-Ordered)

### low - Partial rg vs Node fallback parity for multiple matches on one line
- Evidence: `scripts/verify.js` (`scanCredentialPatterns`) records only the first regex hit per line via `line.match(credentialPattern)`, while rg with `-o` can emit multiple matches from a single line.
- Architectural impact: This does not violate fail/pass boundary behavior (both paths still fail on detection), but it slightly weakens strict output-shape parity between scanner implementations.
- Recommendation: For tighter scanner parity, iterate over all matches in Node fallback (e.g., `matchAll`) while preserving redaction-only output.

### informational - Verifier boundary strengthened and centralized
- Evidence: `scripts/verify.js` introduces a single `credentialPatternSource`, canonical scan roots (`credentialScanRootCandidates`), and explicit exclusion ownership for traversal-sensitive directories.
- Architectural impact: Improves deep-owner coherence by keeping scan semantics, root ownership, and fallback behavior in one module.

## Explicit Compliance Statement
No blocker/high/medium architectural findings were identified.

## Architecture/Bounary Assessment

### Owner module and abstraction
- `scripts/verify.js` remains the deep owner for verify-lane execution and now explicitly owns credential scanning semantics.
- Exported seams (`credentialScanPaths`, `credentialScanWithRg`, `scanCredentialPatterns`) are test-oriented and improve seam-testability without moving ownership to callers.

### Public interface stability
- User-facing command surface remains stable (`pnpm verify`, `node scripts/verify.js`).
- Added `main()` + ESM entry guard hardens importability for tests without CLI behavior drift.

### Shared scanner contract (rg + Node fallback)
- Shared pattern source removes prior drift risk between docs/tests/runtime.
- Both paths produce redacted outputs and do not expose credential values.
- Forced fallback control (`EVALS_VERIFY_FORCE_NODE_CREDENTIAL_SCAN=1`) provides deterministic rollback/testing path.

### Boundary and coupling
- Scan roots expanded from narrow fixture-only scope to broader repo-owned proof roots; this aligns with policy docs and keeps authority local to repo artifacts.
- Exclusion set reduces incidental coupling to generated/vendor directories (`node_modules`, `dist`, `coverage`, etc.).

### Rollback posture
- Rollback is straightforward: revert `scripts/verify.js` and doc/test updates together; no schema/CLI contract migration required.

## Recommendations
1. Optional hardening: make Node fallback emit all same-line matches to fully mirror rg `-o` behavior.
2. Keep the documented regex fragments and scan roots as a single contract surface, enforced by `tests/docs-pr-changes.test.js` and `test/verify.test.js`.

WROTE: artifacts/reviews/pu004-architecture.md
