# Simplify + Unslopify Review: JSC-340 Deterministic CI

## Findings (severity-ranked)

### Medium - Duplicated package-manager authority creates avoidable drift
- Evidence: `.github/workflows/ci.yml:25` hard-codes `11.2.0`; `package.json:6` also hard-codes `pnpm@11.2.0`; `tests/docs-pr-changes.test.js:147` asserts the same literal again.
- Why this is unnecessary complexity: one fact (pnpm version) now has three manual authorities. This adds maintenance churn for every future pnpm bump and increases mismatch risk.
- Suggested simplification: keep one canonical authority (prefer `package.json#packageManager`) and derive workflow setup from it, or at minimum drop the test assertion for the exact version and assert only that CI uses pnpm + frozen lockfile.

### Medium - CI contract test is brittle to harmless YAML formatting changes
- Evidence: `tests/docs-pr-changes.test.js:140` requires exact multiline spacing via `/branches:\n\s+- main/`; assertions on raw text shape at lines `137-144`.
- Why this is unnecessary complexity: the test can fail on non-behavioral edits (ordering/spacing/comments), creating performative breakage without real contract regression.
- Suggested simplification: parse YAML and assert structural fields (`on.pull_request`, `on.push.branches`, job name, and command steps) or reduce text checks to minimal behavior-critical markers only.

## No additional high-severity findings
- The CI lane itself is intentionally minimal: one job, frozen install, one verify command.

WROTE: artifacts/reviews/jsc340-simplify-unslopify.md

