# Review: adversarial-evals-gap-review
## Findings
- High, src/lib/proof-boundary.js:4-8 and src/lib/proof-boundary.js:33-36 and src/lib/contract-catalog.js:60-65, contract adoption is declared but assertion semantics are never enforced. Impact: a contract can claim a safety rule (for example, CI-claim boundaries in contracts/evidence/no-fake-ci-pass.v1.json:24-28) while runtime/check outputs still report adopted contracts as if enforced, creating false confidence in governance coverage. Recommendation: wire contract assertion types into executable validators (or explicitly classify them as documentation-only and remove them from adopted enforcement claims).
- High, src/lib/latest-run.js:67-69 and src/lib/latest-run.js:353-379 and src/commands/validation.js:173-180 and src/lib/runtime-state.js:159-166, external repo-root validation can be satisfied by a self-consistent forged bundle. Impact: a consumer can fabricate case/suite artifacts, hashes, and producer metadata that satisfy structural checks and obtain passed check/state evidence without proving provenance from a real run lifecycle. Recommendation: add a non-forgeable provenance anchor for external roots (for example signed run attestations, immutable run nonce chain, or mandatory command-log/trace lineage checks tied to a trusted producer key).
- Medium, scripts/verify.js:80-94 and src/commands/validation.js:185-195, CI gate coverage only exercises smoke-context check and never executes observed-latest mode. Impact: regressions in default `pnpm evals check --json` semantics (the mode used by readiness evidence and `validationCommandForArtifactRoot`) can ship undetected because verify always rewrites latest through smoke then checks only smoke-context. Recommendation: add an explicit `pnpm evals check --json` gate in `scripts/verify.js` before or after smoke-context validation.

## Coverage Notes
- Reviewed changed runtime boundary surfaces: contract catalog validation, proof boundary claims, latest-run consistency, external `--repo-root` flow, and verify gate composition.
- Focused on forgery paths, false-ready claims, stale/latest trust boundaries, and contract-metadata-to-enforcement gaps.

## Residual Risk
- The new contract catalog currently improves discoverability but still behaves as schema-and-path linting; policy-level drift between declared assertions and executable guarantees remains likely unless assertion enforcement is codified.
- External repository evidence remains structurally verifiable but provenance-weak, so confidence should remain advisory until attestation-grade linkage is introduced.
WROTE: artifacts/reviews/adversarial-evals-gap-review.md

