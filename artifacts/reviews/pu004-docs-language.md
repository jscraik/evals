# PU-004 Docs And Ubiquitous Language Review

## Scope Reviewed

- `AGENTS.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `tests/docs-pr-changes.test.js`
- `scripts/verify.js` command surface as the runtime truth for docs

## Findings

### informational - Documentation now matches the verifier contract

- Evidence: `AGENTS.md:132`, `CONTRIBUTING.md:82`, and `SECURITY.md:29` describe the lightweight credential scan as a phase-one privacy aid, not a full secret scanner.
- Evidence: `AGENTS.md:135`, `CONTRIBUTING.md:86`, and `SECURITY.md:32` use the same credential-shaped pattern class and proof-root list.
- Evidence: `tests/docs-pr-changes.test.js:176` asserts the documented command fragments, redaction wording, and proof-root list remain consistent across the public docs.
- Language impact: The docs consistently use `credential-shaped`, `proof roots`, `Node fallback`, and `phase-one privacy aid`, which avoids overstating the scanner as comprehensive secret-scanning coverage.

### informational - Redaction language is explicit

- Evidence: `AGENTS.md:144`, `CONTRIBUTING.md:90`, and `SECURITY.md:36` all say matches are redacted and standalone prose words are not enough to trigger the scanner.
- Language impact: Future operators should not confuse ordinary docs language about secrets or tokens with credential evidence.

## Explicit Severity Statement

No blocker, high, medium, or low docs/language findings were identified.

## Reviewer Note

The first docs-language subagent returned only an instruction acknowledgement and did not write an artifact. This coordinator-written artifact is the recovery artifact for the docs-expert and ubiquitous-language review lane.

WROTE: artifacts/reviews/pu004-docs-language.md
