# Evals Proof-Spine Docs Expert Review

STATUS: partial_pass

## Scope

Reviewed README.md, AGENTS.md, UBIQUITOUS_LANGUAGE.md, the May 24 plan/spec artifacts, and live command/package references for the JSC-369 parent closeout lane.

## Findings

### Medium: README does not yet explain the new suite and claim/evidence surfaces

- Evidence:
  - README.md documents the canonical smoke, check, and state commands.
  - README.md documents phase-one hard blocks and the existing artifact bundle.
  - New JSC-371/JSC-372 surfaces add `schemas/suite.schema.json`, `schemas/claim.schema.json`, `schemas/evidence.schema.json`, and `schemas/runtime-evidence-packet.schema.json`, but README.md does not yet explain those contracts.
- Impact:
  - Contributor-facing docs remain accurate for phase-one doctrine and command usage, but incomplete for the newly added proof-spine surfaces.
- Remediation:
  - After PR #15, #16, and #17 are merged in order, patch README.md with a small section covering repo-local suites and claim/evidence packets using only merged behavior.

### Low: May 24 plan/spec artifacts were absent from the parent branch before reconciliation

- Evidence:
  - JSC-369 worktree initially lacked `.harness/plan/2026-05-24-evals-proof-spine-suite-contract-plan.md`.
  - JSC-369 worktree initially lacked `.harness/specs/2026-05-24-evals-proof-spine-suite-contract-spec.md`.
- Impact:
  - Parent closeout could cite source artifacts that were not present in the branch under review.
- Remediation:
  - Added the May 24 plan/spec, Linear plan, and audit artifacts to the JSC-369 branch for source-truth reconciliation.

## Validation Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| README command references | pass | `rg -n "run|check|state|suite|claim|evidence|latest|verify" package.json README.md AGENTS.md` found the canonical commands and package scripts. |
| AGENTS hard-block references | pass | `rg -n "dashboard|plugin|runtime evidence|pnpm evals|phase-one" AGENTS.md README.md UBIQUITOUS_LANGUAGE.md` found hard blocks and command contract text. |
| New-feature docs coverage | partial | README does not yet explain JSC-371/JSC-372 schemas because those PRs are still draft/unmerged. |

## Recommendation

Do not claim documentation cleanup complete yet. Record docs as accurate for the existing phase-one command contract and partial for the new suite/claim/evidence surfaces until the stacked PRs are merged and README can be patched against merged behavior.

WROTE: artifacts/reviews/evals-proof-spine-docs-expert.md
