# JSC-372 PR Green Sweep Triage

PR: https://github.com/jscraik/evals/pull/17
Branch: `codex-jsc-372-claim-evidence-runtime-packet`
Base: `codex-jsc-371-repo-local-suite-contract`
Checked at: 2026-05-25 Europe/London

## Live PR State

- Status: OPEN, DRAFT
- Mergeability: MERGEABLE
- Merge state: UNSTABLE (due to pending required check)
- Review decision: none yet
- Local worktree status during sweep: clean before artifact handoff. Coordinator later added this triage artifact and implementation-notes update for commit.

## Checks Snapshot

From `gh pr checks 17 --repo jscraik/evals`:

- pass: deterministic-gates
- pending: semgrep-cloud-platform/scan
- pass: CodeRabbit (note: "Review skipped")
- pass: Socket Security: Project Report
- pass: Socket Security: Pull Request Alerts
- pass: security/snyk (jscraik)
- pass: license/snyk (jscraik)

## Review Threads / Comments

- GitHub review threads/comments API:
  - `get_pull_request_reviews`: []
  - `get_pull_request_comments`: []
- No unresolved inline review threads found.
- PR issue comments include:
  - Linear linkback comment
  - CodeRabbit status comment indicating auto-review skipped on non-default base branch (with optional checkbox-triggered retry)
  - Snyk summary comment (all clear)

## CodeRabbit / Semgrep / Snyk / Socket Classification

- CodeRabbit: PASS status context, but behavioral note is "Review skipped" (not a failing gate).
- Semgrep: PENDING at time of sweep; no failure payload visible yet.
- Snyk: PASS for security and license.
- Socket: PASS for project report and PR alerts.

## Fault Triage

- Fix-now items: none identified.
- Blockers:
  - STATUS: blocked_validation
  - blocker_class: external_check_pending
  - exact_failure_text: `semgrep-cloud-platform/scan pending`
- Risk note:
  - Merge state remains UNSTABLE until Semgrep completes.
  - No current evidence of code-level regressions or review-thread defects requiring patch edits.

## Fixes Attempted This Sweep

- Refreshed live PR metadata, check rollup, and check table.
- Queried GitHub review APIs for reviews and inline comments.
- Re-polled checks after initial pending state; deterministic-gates moved from pending -> pass.
- No local file/code changes performed because no actionable failures were surfaced.
- Follow-up propagation: JSC-370 CodeRabbit repair and JSC-371 propagated evidence commits were applied to this stacked branch after the initial sweep.
- Local validation after propagation:
  - pnpm test -> pass (123 tests)
  - pnpm verify -> pass

## Next Coordinator Action

1. Push the propagated repair/evidence commits and re-poll PR checks until `semgrep-cloud-platform/scan` resolves.
2. If Semgrep passes, proceed with normal draft->ready and merge-readiness flow.
3. If Semgrep fails, capture failing rule IDs/log excerpt and open a focused repair slice against this branch.
4. Optional hygiene: if CodeRabbit coverage is required on this non-default base branch, trigger a manual review via the CodeRabbit comment control.

WROTE: artifacts/pr-green-sweep/jsc-372-pr-triage.md
