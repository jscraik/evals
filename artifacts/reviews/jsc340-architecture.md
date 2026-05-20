# Architecture Review - JSC-340 Deterministic CI

## Findings

### Medium - Duplicate package-manager version authority can drift
- Status: resolved.
- Owner: evals executable spine.
- Resolution reference: PR #6 / JSC-340 resolves this by deriving the workflow pnpm version from package.json#packageManager instead of hard-coding it in .github/workflows/ci.yml.
- Evidence:
  - Historical review evidence: .github/workflows/ci.yml originally pinned pnpm/action-setup to 11.2.0.
  - `package.json:6` pins `"packageManager": "pnpm@11.2.0"`.
- Why this matters:
  - The change intentionally makes `pnpm verify` the single validation owner, which is good.
  - A package-manager version in both workflow YAML and `package.json` would create two independent authorities and allow local and CI bootstrap versions to drift.
- Suggested remediation:
  - Keep `package.json#packageManager` as the canonical package-manager version source and let `pnpm/action-setup` read it.

## Positive alignment notes
- `scripts/verify.js` remains the deep owner module; CI is a thin invocation surface via `pnpm verify` (`.github/workflows/ci.yml:38`).
- Workflow scope stays phase-one compliant (no new adapter/plugin/dashboard/judge authority).
- The added test creates a useful seam contract for trigger/job/command stability (`tests/docs-pr-changes.test.js` around lines 134-148).

WROTE: artifacts/reviews/jsc340-architecture.md
