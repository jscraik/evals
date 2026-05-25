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

## Follow-up Stack Repair

Checked at: 2026-05-25 00:12 Europe/London

- Repair action: non-destructively merged `origin/codex-jsc-371-repo-local-suite-contract` into `codex-jsc-372-claim-evidence-runtime-packet`.
- Conflict resolution:
  - `.harness/evals/runs/latest.json`: preserved the JSC-372 proof bundle, then reran validation to publish fresh latest proof.
  - `.harness/implementation-notes/2026-05-24-jsc-370-implementation-notes.html`: preserved JSC-372 active-slice state and added Jamie&apos;s deep-module architecture answer.
- Local validation:
  - `pnpm test` -> pass (123 tests)
  - `pnpm verify` -> pass
  - `git diff --check` -> pass
- Pushed merge commit: `f721fc1c45d62bef2ea4cd9b0af9c2eb67c9a588`
- Live PR #17 after push:
  - Status: OPEN, DRAFT
  - Mergeability: MERGEABLE
  - Merge state: UNSTABLE
  - Head: `f721fc1c45d62bef2ea4cd9b0af9c2eb67c9a588`
  - Pending/queued checks: deterministic-gates queued; semgrep-cloud-platform/scan queued; Socket Security: Project Report in progress; CodeRabbit pending; security/snyk pending; license/snyk pending.
- Current blocker:
  - STATUS: blocked_validation
  - blocker_class: external_checks_pending
  - exact_failure_text: `deterministic-gates queued; semgrep-cloud-platform/scan queued; Socket Security: Project Report in progress; CodeRabbit pending; security/snyk pending; license/snyk pending`
- Next coordinator action: re-poll hosted checks on head `f721fc1`; repair only if a check returns a concrete failure.

## Follow-up Artifact Push Recheck

Checked at: 2026-05-25 00:15 Europe/London

- Pushed triage artifact commit: `b53f2e49f5857ebd772f08b2b0ba25cde12bb149`
- Live PR #17 after artifact push:
  - Status: OPEN, DRAFT
  - Mergeability: MERGEABLE
  - Merge state: UNSTABLE
  - Pending/queued checks: semgrep-cloud-platform/scan queued; security/snyk pending; license/snyk pending.
- Current blocker:
  - STATUS: blocked_validation
  - blocker_class: external_checks_pending
  - exact_failure_text: `semgrep-cloud-platform/scan queued; security/snyk pending; license/snyk pending`
- Next coordinator action: re-poll hosted checks on head `b53f2e4`; repair only if a check returns a concrete failure.

WROTE: artifacts/pr-green-sweep/jsc-372-pr-triage.md

## 2026-05-25 Local Validation Completion

After the manifest-path repair and JSC-371 propagation, the broader local gates passed:

- `pnpm test` -> pass (127 tests)
- `pnpm verify` -> pass; latest proof bundle `.harness/evals/runs/20260525T090946Z-pr-closeout-4df36134-01/`
- `git diff --check` -> pass

Current blocker:

- STATUS: blocked_validation
- blocker_class: remote_checks_pending_after_push
- exact_failure_text: local gates pass, but PR #17 has not yet been pushed/re-polled after this repair.

Next coordinator action: commit and push the repair, fetch remote-tracking refs if sandboxed push cannot update them, then recheck PR #17 checks and review threads.

WROTE: artifacts/pr-green-sweep/jsc-372-pr-triage.md

## 2026-05-25 Review Thread Repair Addendum

Source of truth: PR #17 live review-thread finding against `src/lib/claim-evidence-contract.js`.

- Finding repaired: `manifestEvidenceByPath` trusted `latest.manifest_path` before reading the manifest, so a malformed latest pointer could cause the runtime evidence packet to inspect a path outside the repository even though runtime state later classified the artifact path as invalid.
- Owner-module fix: `src/lib/claim-evidence-contract.js` now validates `latest.manifest_path` with `repoRelativePath` before opening the manifest. Invalid, absolute, or traversal paths return an empty manifest evidence map and cannot upgrade artifact evidence to `verified`.
- Seam test: `test/cli.test.js` now includes `state does not read manifest evidence from traversal latest path`, which writes an outside manifest matching the poisoned latest pointer and proves the state remains invalid, the missing-evidence scorer fails, and no evidence item records the traversal manifest path.
- Propagated base repair: this branch also carries JSC-371's suite-dispatch and artifact-root normalization repair from `cfb62cd40bba5f25ca6e6dabae95a9b9aca8bc6f`.

Validation after local repair:

- `node --test --test-name-pattern "traversal latest path|state reports ready runtime packet"` -> pass

Remaining required validation before push:

- `pnpm test`
- `pnpm verify`
- `git diff --check`

Current blocker:

- STATUS: blocked_validation
- blocker_class: local_validation_pending
- exact_failure_text: broader slice gates have not been rerun after the manifest-path repair.

Next coordinator action: run the full JSC-372 local gates, commit/push the repair, then re-poll PR #17 checks and review threads.

WROTE: artifacts/pr-green-sweep/jsc-372-pr-triage.md
