# Architecture Final Review — Evals Router External Code Tree Mining
Date: 2026-05-25
Target: .harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md

## Findings
No material fixable findings remain.

## Architecture Overview
The audit keeps evals scoped to a dependency-free executable spine where artifact bundles and deterministic scorer outputs remain authority. External repositories are treated as pattern mines, not runtime authorities, and opportunities are routed through deep-module fix packets before implementation.

## Change Assessment
The new macro section (OPP-009) fits the established architecture:
- It is explicitly local/offline and artifact-derived only.
- It preserves deterministic-first grouping and keeps optional model/embedding labels advisory.
- It prohibits dashboards, notebooks, external APIs, telemetry authority, and external framework runtime dependency.
- It defines owner-module boundaries (`src/lib/macro-evidence.js`) to avoid caller-level pattern inference sprawl.

## Compliance Check
- Phase-one hard blocks: upheld.
- Ownership boundaries: upheld (owner modules are specified per opportunity, including OPP-009).
- Proof authority model: upheld (`artifacts decide, telemetry explains` remains intact).
- Consumer/domain boundary: upheld (consumer repos own domain truth; evals owns proof contracts/artifacts).
- Risky pattern rejection: upheld (`no assertions = pass` semantics explicitly rejected).

## Risk Analysis
Residual implementation risk is low and is already bounded by the document’s packet/evidence contracts:
- Any future OPP implementation could drift if owner-module boundaries are not enforced in code review.
- Macro-ledger future enrichment (topic labels/embeddings) could become authority if advisory tags are not kept non-gating.

These are future execution risks, not current audit-document defects.

## Recommendations
- Keep OPP-009 acceptance language unchanged when implementation starts, especially the explicit non-authority constraints and dependency bans.
- During implementation PR review, require tests asserting advisory labels cannot override deterministic scorer verdicts or readiness caps.

WROTE: artifacts/reviews/2026-05-25-evals-router-mining-architecture-final.md
