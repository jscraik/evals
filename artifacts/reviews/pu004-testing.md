# PU004 Testing Review

## Findings

### medium: Missing test for rg-unavailable fallback branch in credential scan parity
- Evidence: `scripts/verify.js` adds a dedicated ENOENT fallback path in `credentialScanWithRg` that switches from rg output handling to Node line scanning (`scripts/verify.js:131-135`).
- Evidence: `test/verify.test.js` only executes rg parity assertions when rg is present and explicitly skips otherwise (`test/verify.test.js:89-94`), so the ENOENT fallback branch is never exercised.
- Risk: A regression in fallback invocation or status mapping would not be caught in CI on environments where rg exists, even though the fallback is now documented and part of the contract.
- Suggested remediation: Add a unit test that stubs `spawnSync` to return an ENOENT-like error and asserts `credentialScanWithRg` delegates to Node scanning with equivalent redacted failure semantics.

No blocker/high findings identified.

## Residual Risks
- `credentialScan` top-level branches for `<no existing scan paths>` and forced-node mode command text are not covered in this test file; behavior likely depends on integration coverage elsewhere.
- `scanCredentialPatterns` unreadable-file error branch (`credential scan unreadable`) remains untested.

WROTE: artifacts/reviews/pu004-testing.md

