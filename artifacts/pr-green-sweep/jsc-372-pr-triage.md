# JSC-372 PR Green Sweep Triage

## Scope
- Repo: `jscraik/evals`
- PR: [#17](https://github.com/jscraik/evals/pull/17)
- Branch: `codex-jsc-372-claim-evidence-runtime-packet`
- Sweep time (UTC): 2026-05-25

## Live PR State
- PR state: OPEN
- Merge state: CLEAN
- Head SHA: `645fc7144ef6050ec680c9c6a12866733b3aeb0b`
- Base: `codex-jsc-371-repo-local-suite-contract`
- Head: `codex-jsc-372-claim-evidence-runtime-packet`

## Checks
All observed required checks are passing:
- `deterministic-gates`: SUCCESS
- `CodeRabbit`: SUCCESS (`Review skipped`)
- `Socket Security: Project Report`: SUCCESS
- `Socket Security: Pull Request Alerts`: SUCCESS
- `license/snyk (jscraik)`: SUCCESS
- `security/snyk (jscraik)`: SUCCESS
- `semgrep-cloud-platform/scan`: SUCCESS

## Review Threads And Findings

### Severity: High (Remediated, No Open Action)
- Evidence: https://github.com/jscraik/evals/pull/17#discussion_r3296868502
- File: `src/lib/claim-evidence-contract.js`
- Finding summary: Codex flagged that `manifestEvidenceByPath` previously read `latest.manifest_path` without repo-relative path enforcement.
- Current state: Thread is `isResolved=true` and `isOutdated=true` in live PR review thread data.
- Code verification in worktree: `manifestEvidenceByPath` now calls `repoRelativePath(latest.manifest_path, "latest.manifest_path", errors)` before reading filesystem paths.
- Classification: introduced by current patch, then remediated in follow-up commits on the same PR branch.

## Fault Classification Ledger
- Introduced by current patch: 1
- Pre-existing: 0
- Unrelated dirty worktree: 0
- Environment/tooling failure: 0

## Actionability
- No unresolved review threads detected.
- No failing checks detected.
- No safe repair action remains for this sweep.

## Remediation Advice
- Keep the current path-boundary guard as the canonical read gate for any future additions that consume `latest.*_path` fields.
- If new artifact pointer fields are added, route them through `repoRelativePath` before any read/hash/parse step.

WROTE: artifacts/pr-green-sweep/jsc-372-pr-triage.md
