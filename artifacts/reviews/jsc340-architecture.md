# Architecture Review - JSC-340 Deterministic CI

## Findings

### Medium - Duplicate package-manager version authority can drift
- Evidence:
  - `.github/workflows/ci.yml:24` pins `pnpm/action-setup` to `11.2.0`.
  - `package.json:6` pins `"packageManager": "pnpm@11.2.0"`.
- Why this matters:
  - The change intentionally makes `pnpm verify` the single validation owner, which is good.
  - But package-manager version now has two independent authorities (workflow YAML and `package.json`), and only one is asserted by test (`tests/docs-pr-changes.test.js` checks `packageManager` but not the workflow pnpm version). A future edit can silently desynchronize local and CI bootstrap versions.
- Suggested remediation:
  - Add a test assertion for `version: 11.2.0` in `.github/workflows/ci.yml`, or derive workflow pnpm version from one canonical source during generation to enforce a single authority.

## Positive alignment notes
- `scripts/verify.js` remains the deep owner module; CI is a thin invocation surface via `pnpm verify` (`.github/workflows/ci.yml:38`).
- Workflow scope stays phase-one compliant (no new adapter/plugin/dashboard/judge authority).
- The added test creates a useful seam contract for trigger/job/command stability (`tests/docs-pr-changes.test.js` around lines 134-148).

WROTE: artifacts/reviews/jsc340-architecture.md
