# JSC-371 PR #16 Green Sweep Triage

## Scope
- Repo: `jscraik/evals`
- PR: [#16](https://github.com/jscraik/evals/pull/16)
- Branch: `codex-jsc-371-repo-local-suite-contract`
- Evaluated SHA: `388db321e04ebe4ba7673442e5c01b91e9f0cfa0`

## Live PR/Check State
- PR state: `open`
- Review decision: `COMMENTED`
- Combined status: `failure`
- Failing status context: `CodeRabbit` with description `Insufficient review credits`
- Other checks/status contexts: `deterministic-gates` success, `security/snyk` success, `license/snyk` success, `semgrep-cloud-platform/scan` in progress at inspection time

## Severity-Ranked Findings

### High
1. CodeRabbit status failure blocks a fully-green checks surface.
- Evidence: status context `CodeRabbit` = failure with message `Insufficient review credits`.
- Ownership classification: `environment or tooling failure` (external review-credit exhaustion, not repository logic).
- Remediation advice: replenish CodeRabbit credits or rerun CodeRabbit after quota reset; no code patch in this repo can resolve the status.

### Medium
1. None currently.

### Low
1. CWD-dependent case-path in `test/cli.test.js` made one unit test environment-sensitive.
- Evidence: previous line `validateCaseFile("fixtures/smoke/pr-closeout.case.json")` in `test("case validation returns the validated case document for proof context")`.
- Ownership classification: `introduced by current patch`.
- Remediation performed: switched to `validateCaseFile(smokeFixture(sourceRoot))` to use deterministic absolute fixture resolution.

## Review Thread/Fault Classification Summary
- Introduced by current patch: 1 (test path determinism; fixed in this sweep).
- Pre-existing: 0 identified.
- Unrelated dirty worktree: 0 identified (clean branch before patch).
- Environment/tooling failure: 1 (CodeRabbit credit exhaustion status).

## Validation Run
- Command: `pnpm test`
- Result: pass (`124` tests, `0` failures).

## Git Actions Performed
- Applied minimal fix to `test/cli.test.js` for deterministic path resolution.
- Ready to commit and push this repair on the PR branch.

WROTE: artifacts/pr-green-sweep/jsc-371-pr-triage.md

