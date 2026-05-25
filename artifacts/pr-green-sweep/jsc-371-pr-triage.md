# JSC-371 PR #16 Green Sweep Triage

## Scope

- Repo: `jscraik/evals`
- PR: [#16](https://github.com/jscraik/evals/pull/16)
- Branch: `codex-jsc-371-repo-local-suite-contract`
- Latest triage head SHA: `ca9e45f`

## Live PR/Check State

- PR state: open.
- Review decision: commented.
- Combined status at triage time: failure due CodeRabbit review-credit
  exhaustion.
- Passing contexts observed during triage: deterministic-gates, Snyk security,
  Snyk license; Semgrep was settling during one inspection and later deterministic
  local validation remained green.

## Severity-Ranked Findings

### High

1. CodeRabbit status failure blocks a fully green hosted checks surface.
   - Evidence: status context `CodeRabbit` reported `Insufficient review credits`.
   - Ownership classification: `environment or tooling failure`.
   - Remediation advice: replenish CodeRabbit credits or rerun CodeRabbit after
     quota reset; no repository patch can resolve the credit failure.

### Medium

1. None currently.

### Low

1. A cwd-dependent fixture path in `test/cli.test.js` made one proof-context
   case validation test environment-sensitive.
   - Evidence: the previous assertion called
     `validateCaseFile("fixtures/smoke/pr-closeout.case.json")`.
   - Ownership classification: `introduced by current patch`.
   - Remediation performed: switched to `validateCaseFile(smokeFixture(sourceRoot))`
     so the test uses deterministic absolute fixture resolution.

## Fault Classification Summary

- Introduced by current patch: 1, fixed.
- Pre-existing: 0 confirmed.
- Unrelated dirty worktree: 0.
- Environment/tooling failure: 1, CodeRabbit credit exhaustion.

## Validation Evidence

- `pnpm test` -> pass. 124 tests passed on the JSC-371 branch after the
  deterministic fixture-path repair.
- JSC-372 propagation re-ran
  `node --test --test-name-pattern "case validation" test/cli.test.js` -> pass.
- JSC-372 propagation re-ran `pnpm test` -> pass. 128 tests passed.

## Git Actions Performed

- The PR triage subagent committed and pushed the deterministic test-path repair
  to the JSC-371 branch.
- The coordinator propagated that repair into JSC-372 and then into this parent
  branch.

## Current Blockers

- `external_tooling`: CodeRabbit review-credit exhaustion prevents an all-green
  hosted check surface.
- `lifecycle_blocker`: PR #16 remains open until the configured merge or
  owner-approved deferral decision is recorded.

WROTE: artifacts/pr-green-sweep/jsc-371-pr-triage.md
