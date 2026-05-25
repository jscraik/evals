# JSC-370 PR Green Sweep Triage

PR URL: https://github.com/jscraik/evals/pull/15
Checked at: 2026-05-25 Europe/London
Branch: codex-jsc-370-latest-proof-context
Base: main
PR state: open
Head SHA: e9cbf6e062c745d027bdda1a61d5d6de69defe46

## Severity-Ranked Findings

1. HIGH - External blocker: CodeRabbit required check is failing due to credit exhaustion.
   - Evidence: GitHub combined status for head `e9cbf6e062c745d027bdda1a61d5d6de69defe46` reports context `CodeRabbit` with state `failure` and description `Insufficient review credits`.
   - Validation ownership: environment or tooling failure.
   - Impact: PR cannot go fully green until CodeRabbit credits are restored and the check reruns.

2. INFO - No new actionable reviewer fault surfaced at current head.
   - Evidence: live PR review/comment state shows prior CodeRabbit comments with in-thread `Addressed in commit ...` markers; no new unresolved fault was surfaced by the latest check event tied to this head.
   - Validation ownership: pre-existing commentary already remediated in prior commits.

## Live Check State (Head e9cbf6e062c745d027bdda1a61d5d6de69defe46)

- security/snyk (jscraik): success
- license/snyk (jscraik): success
- CodeRabbit: failure (`Insufficient review credits`)
- Combined state: failure

## Review Surface Snapshot

- PR reviews include CodeRabbit COMMENT reviews with previously posted findings.
- Current failure signal is check-level credit exhaustion, not a new inline review request.

## Remediation Advice

1. Restore/allocate CodeRabbit review credits for the repository/account.
2. Re-run/retrigger CodeRabbit on PR #15.
3. If the rerun posts new actionable comments, open a focused child fix loop; otherwise continue standard merge-readiness checks.

## Status

STATUS: blocked_runtime

Blocker class: external check-credit exhaustion in CodeRabbit.
Coordinator next step: recover CodeRabbit credits and rerun the check before merge-readiness decisions.

WROTE: artifacts/pr-green-sweep/jsc-370-pr-triage.md
