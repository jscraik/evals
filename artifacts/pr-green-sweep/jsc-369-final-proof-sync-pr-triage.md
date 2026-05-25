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

## Coordinator Follow-Up After CodeRabbit Retrigger

- Command: `gh pr checks 23 --repo jscraik/evals` -> pass at head `23367faba7acf59d8c2e66871b8c339fc2fb011b`.
- Result: CodeRabbit, deterministic-gates, Semgrep, Socket, Snyk security, and Snyk license all passed.
- Command: `gh api graphql ... pullRequest(number:23).reviewThreads(first:100)` -> pass.
- Result: unresolved review threads `[]`.
- CodeRabbit emitted one actionable governance finding in `artifacts/pr-green-sweep/jsc-369-final-proof-sync-pr23-subagent-triage.md`: redact a host-specific Local Memory PID path.
- Remediation: the companion PR23 subagent triage artifact now uses `<USER_HOME>/.local-memory/local-memory.pid`.
- Merge-readiness note: hosted checks must be rechecked again after this remediation commit is pushed.

## Finding Classification

### P1 - Historical CodeRabbit status was externally blocked, then retriggered

- Evidence: CodeRabbit status context reports `Insufficient review credits`.
- Evidence: GitHub review-thread query returns unresolved `[]`.
- Impact: the PR cannot be described as fully green while CodeRabbit is a required status and remains failed.
- Ownership: external service/account capacity; not introduced by repository code in this documentation-only cleanup.
- Coordinator next step: rerun/recheck CodeRabbit after credits are available, then fix any concrete review thread if CodeRabbit emits one.
- Follow-up result: CodeRabbit was rerun, passed as a status context, and emitted one actionable governance finding that is fixed by the redaction commit.

### P2 - Hosted checks require final recheck before merge readiness

- Evidence: `gh pr checks 23 --repo jscraik/evals` reported pending checks during triage, and this artifact commit restarts the hosted-check set.
- Impact: PR #23 cannot be merged until deterministic-gates, Semgrep, Socket, and Snyk are success or the exact external blocker is recorded.
- Coordinator next step: poll checks again before merge or closeout.

## Validation Evidence For This Cleanup Branch

- `git diff --check` -> pass.
- `pnpm test -- tests/docs-pr-changes.test.js` -> pass.
- `pnpm verify` -> pass.

## Current Verdict

PR #23 no longer has a CodeRabbit credit blocker at the inspected head. CodeRabbit passed after retriggering and emitted one actionable governance finding; the companion PR23 subagent triage artifact now redacts the host-specific PID path. Hosted checks must be rechecked after this remediation commit before merge readiness is claimed.

WROTE: artifacts/pr-green-sweep/jsc-369-final-proof-sync-pr-triage.md
