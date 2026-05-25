# JSC-370 PR Green Sweep Triage

PR URL: https://github.com/jscraik/evals/pull/15
Checked at: 2026-05-25T14:32:00+01:00 Europe/London
Branch: codex-jsc-370-latest-proof-context
Base: main
PR state: OPEN
Head SHA: 7f256646bfa88503fbca3fdc15556f8ce053d9f1 (matches expected head)

## Severity-Ranked Findings

1. HIGH - External blocker: required `CodeRabbit` check is failing.
   - Evidence: CodeRabbit is currently pending ("Review in progress") per the GitHub API, and bot review comments exist on the PR.
   - Impact: PR cannot be fully green while CodeRabbit remains red.

2. MEDIUM - Prior triage artifact was stale against live head and check state.
   - Evidence: this file previously cited head `e9cbf6e062c745d027bdda1a61d5d6de69defe46`, but live PR head is `7f256646bfa88503fbca3fdc15556f8ce053d9f1`.
   - Validation ownership: introduced by current patch history in artifact tracking (documentation/evidence drift).
   - Impact: stale triage evidence can misroute remediation and create false closure claims.

3. INFO - No additional actionable functional faults reproduced locally.
   - Evidence:
     - `pnpm test`: pass, 115 passed / 0 failed.
     - `pnpm verify`: pass, deterministic gate command succeeded end-to-end.
     - PR review surface currently shows CodeRabbit COMMENT reviews only (`reviewDecision` unset), with no new non-CodeRabbit required-check failures.
   - Validation ownership: N/A (current local validation healthy).

## Live Check State (Head 7f256646bfa88503fbca3fdc15556f8ce053d9f1)

- deterministic-gates: success
- Socket Security: Pull Request Alerts: success
- Socket Security: Project Report: success
- semgrep-cloud-platform/scan: success
- licence/snyk (jscraik): success
- security/snyk (jscraik): success
- CodeRabbit: failure

## Review Surface Snapshot

- `gh pr view 15 --json comments,reviews`: reviews=2, comments=3.
- Reviews present: `coderabbitai: COMMENTED` (no human `CHANGES_REQUESTED` reviewer gate currently shown in this snapshot).

## Remediation Advice

1. Restore/allocate CodeRabbit review credits (or equivalent service capacity) for this repo.
2. Retrigger CodeRabbit on PR #15 at current head `7f256646bfa88503fbca3fdc15556f8ce053d9f1`.
3. If rerun posts new actionable findings, run a focused fix sweep; if rerun passes, proceed with normal merge-readiness checks.

## Validation Run During Triage

- `pnpm test` -> pass (115 passed, 0 failed); exit code 0.
- `pnpm verify` -> pass; exit code 0.
- Full validation output captured in `.harness/evals/runs/2026-05-25T143200/validation-result.json`.

## Status

STATUS: blocked_runtime

Blocker class: external required-check failure (`CodeRabbit`) with local deterministic validation green.
Coordinator next step: recover/retry CodeRabbit and re-evaluate PR green status.

WROTE: artifacts/pr-green-sweep/jsc-370-pr-triage.md
