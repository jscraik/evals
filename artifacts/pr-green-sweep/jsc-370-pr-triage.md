# JSC-370 PR Green Sweep Triage

PR URL: https://github.com/jscraik/evals/pull/15
Checked at: 2026-05-25 Europe/London
Branch: codex-jsc-370-latest-proof-context
Base: main
PR state: OPEN
Head SHA: 88765a08976557b72ced0f0640d34d91cca3a5df (matches expected head)

## Severity-Ranked Findings

1. HIGH - External blocker: required `CodeRabbit` check is failing.
   - Evidence: `gh pr checks 15 --repo jscraik/evals` reports `CodeRabbit\tfail\tFAILURE` at current head `88765a08976557b72ced0f0640d34d91cca3a5df`; all other required checks shown are passing.
   - Validation ownership: environment or tooling failure (external service credit/runtime gate), not a deterministic local code/test gate.
   - Impact: PR cannot be fully green while CodeRabbit remains red.

2. MEDIUM - Prior triage artifact was stale against live head and check state.
   - Evidence: this file previously cited head `e9cbf6e062c745d027bdda1a61d5d6de69defe46`, but live PR head is `88765a08976557b72ced0f0640d34d91cca3a5df`.
   - Validation ownership: introduced by current patch history in artifact tracking (documentation/evidence drift).
   - Impact: stale triage evidence can misroute remediation and create false closure claims.

3. INFO - No additional actionable functional faults reproduced locally.
   - Evidence:
     - `pnpm test`: pass, 115 passed / 0 failed.
     - `pnpm verify`: pass, deterministic gate command succeeded end-to-end.
     - PR review surface currently shows CodeRabbit COMMENT reviews only (`reviewDecision` unset), with no new non-CodeRabbit required-check failures.
   - Validation ownership: N/A (current local validation healthy).

## Live Check State (Head 88765a08976557b72ced0f0640d34d91cca3a5df)

- deterministic-gates: success
- Socket Security: Pull Request Alerts: success
- Socket Security: Project Report: success
- semgrep-cloud-platform/scan: success
- license/snyk (jscraik): success
- security/snyk (jscraik): success
- CodeRabbit: failure

## Review Surface Snapshot

- `gh pr view 15 --json comments,reviews`: reviews=2, comments=3.
- Reviews present: `coderabbitai: COMMENTED` (no human `CHANGES_REQUESTED` reviewer gate currently shown in this snapshot).

## Remediation Advice

1. Restore/allocate CodeRabbit review credits (or equivalent service capacity) for this repo.
2. Retrigger CodeRabbit on PR #15 at current head `88765a08976557b72ced0f0640d34d91cca3a5df`.
3. If rerun posts new actionable findings, run a focused fix sweep; if rerun passes, proceed with normal merge-readiness checks.

## Validation Run During Triage

- `pnpm test` -> pass (115 passed, 0 failed).
- `pnpm verify` -> pass.

## Status

STATUS: blocked_runtime

Blocker class: external required-check failure (`CodeRabbit`) with local deterministic validation green.
Coordinator next step: recover/retry CodeRabbit and re-evaluate PR green status.

WROTE: artifacts/pr-green-sweep/jsc-370-pr-triage.md
