# PU004 Testing Review

## Findings

### medium: Missing test for rg-unavailable fallback branch in credential scan parity - resolved
- Evidence: `scripts/verify.js` adds a dedicated ENOENT fallback path in `credentialScanWithRg` that switches from rg output handling to Node line scanning (`scripts/verify.js:131-135`).
- Resolution evidence: `test/verify.test.js` now includes `rg credential scan falls back to Node scanner when rg is unavailable`, which injects an ENOENT-like spawn result and asserts clean and credential-shaped paths through the Node fallback.
- Current risk: the original ENOENT fallback coverage gap is closed. Remaining residual risks below are narrower branch-coverage gaps, not PU-004 blockers.

No blocker/high findings identified.

## Residual Risks
- `credentialScan` top-level branches for `<no existing scan paths>` and forced-node mode command text are not covered in this test file; behavior likely depends on integration coverage elsewhere.
- `scanCredentialPatterns` unreadable-file error branch (`credential scan unreadable`) remains untested.

WROTE: artifacts/reviews/pu004-testing.md
