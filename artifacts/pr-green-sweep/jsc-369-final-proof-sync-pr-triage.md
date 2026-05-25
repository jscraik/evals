# JSC-369 Final Proof Sync PR Triage

## Scope

- Repo: `jscraik/evals`
- PR: #23
- URL: https://github.com/jscraik/evals/pull/23
- Branch: `codex/jsc-369-final-proof-sync`
- Initial evidence-correction head: `df8ad299c38c878fd2c8b5306fc80ec92691fa87`
- Purpose: distinguish actionable CodeRabbit review threads from historical or external CodeRabbit status failures after final closeout evidence cleanup.

## Live Review-Thread Evidence

- Command: `gh api graphql ... pullRequest(number:23).reviewThreads(first:100)` -> pass.
- Result: unresolved review threads `[]`.
- Classification: no outstanding GitHub/CodeRabbit review thread exists on PR #23 at the time of this triage.

## Hosted Check Evidence

- Command: `gh pr checks 23 --repo jscraik/evals` -> partial.
- Initial evidence-correction head: deterministic-gates, Socket Security project report, Socket pull request alerts, Snyk licence, and Snyk security passed; `semgrep-cloud-platform/scan` was pending.
- After this triage artifact is committed, hosted checks restart and must be rechecked from the new PR head before merge readiness is claimed.
- CodeRabbit: `fail`, message `Insufficient review credits`.

## Finding Classification

### P1 - CodeRabbit status is externally blocked, not an actionable thread

- Evidence: CodeRabbit status context reports `Insufficient review credits`.
- Evidence: GitHub review-thread query returns unresolved `[]`.
- Impact: the PR cannot be described as fully green while CodeRabbit is a required status and remains failed.
- Ownership: external service/account capacity; not introduced by repository code in this documentation-only cleanup.
- Coordinator next step: rerun/recheck CodeRabbit after credits are available, then fix any concrete review thread if CodeRabbit emits one.

### P2 - Hosted checks require final recheck before merge readiness

- Evidence: `gh pr checks 23 --repo jscraik/evals` reported pending checks during triage, and this artifact commit restarts the hosted-check set.
- Impact: PR #23 cannot be merged until deterministic-gates, Semgrep, Socket, and Snyk are success or the exact external blocker is recorded.
- Coordinator next step: poll checks again before merge or closeout.

## Validation Evidence For This Cleanup Branch

- `git diff --check` -> pass.
- `pnpm test -- tests/docs-pr-changes.test.js` -> pass.
- `pnpm verify` -> pass.

## Current Verdict

PR #23 has no outstanding CodeRabbit review threads. The remaining CodeRabbit issue is a failed status caused by review-credit exhaustion. Hosted checks must be rechecked after the final triage-artifact commit before merge readiness is claimed.

WROTE: artifacts/pr-green-sweep/jsc-369-final-proof-sync-pr-triage.md
