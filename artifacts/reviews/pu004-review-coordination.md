# PU-004 Review Coordination

## Scope

PU-004 hardened credential scan proof-surface coverage in `scripts/verify.js`, `test/verify.test.js`, `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `tests/docs-pr-changes.test.js`.

## Review Artifacts

| Review | Artifact | Status |
| --- | --- | --- |
| Architecture | `artifacts/reviews/pu004-architecture.md` | complete |
| Simplify / Unslopify | `artifacts/reviews/pu004-simplify-unslopify.md` | complete |
| Testing | `artifacts/reviews/pu004-testing.md` | complete |
| Docs / Ubiquitous Language | `artifacts/reviews/pu004-docs-language.md` | coordinator recovery complete |

## Findings And Disposition

| Severity | Source | Finding | Disposition | Evidence |
| --- | --- | --- | --- | --- |
| medium | testing | `rg`-unavailable fallback branch was not directly exercised when `rg` exists in CI. | fixed immediately | `credentialScanWithRg` now accepts an injectable spawn function; `test/verify.test.js` simulates `ENOENT` and proves redacted fallback behavior. |
| low | architecture | Node fallback recorded only the first credential-shaped match on each line while `rg -o` can emit all matches. | fixed immediately | `scanCredentialPatterns` now uses `matchAll` with a global credential pattern; `test/verify.test.js` proves two same-line matches are reported without value leakage. |
| informational | simplify / unslopify | Minor cleanup options remain around `main()` result accumulation and mode branching. | deferred safely | These do not affect scanner correctness, validation, or runtime truth; further edits would be cosmetic during this slice. |
| informational | docs / language | Docs consistently use credential-shaped, proof roots, redaction, Node fallback, and phase-one privacy-aid language. | accepted | `tests/docs-pr-changes.test.js` locks the public docs fragments. |

## Agent Artifact Notes

The first docs-language subagent returned only an instruction acknowledgement and did not write an artifact. The coordinator produced `artifacts/reviews/pu004-docs-language.md` as the recovery artifact. All other expected PU-004 review artifacts exist and are non-empty.

## Validation After Fixes

| Command | Result |
| --- | --- |
| `pnpm test` | pass, 106 tests |
| `pnpm verify` | pass |
| `EVALS_VERIFY_FORCE_NODE_CREDENTIAL_SCAN=1 node scripts/verify.js` | pass |

## Coordinator Decision

No unresolved blocker, high, medium, or low findings remain for PU-004. Informational simplification notes are safe to leave because they do not weaken runtime truth, redaction, root coverage, fallback parity, or docs alignment.

WROTE: artifacts/reviews/pu004-review-coordination.md
