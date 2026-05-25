# JSC-371 PR Green Sweep Triage

- PR URL: https://github.com/jscraik/evals/pull/16
- Checked at: 2026-05-24 Europe/London; refreshed 2026-05-25 Europe/London
- Branch: `codex-jsc-371-repo-local-suite-contract`
- Base: `main`

## PR State
- Open: yes
- Draft: yes
- Mergeable: `MERGEABLE`
- Review decision: none set (`""`)

## CI / Required Checks State
Observed via `gh pr view 16 --repo jscraik/evals --json statusCheckRollup` and `gh pr checks 16 --repo jscraik/evals`.

- `deterministic-gates` (Deterministic Evals CI): `SUCCESS`
- `CodeRabbit` status context: `FAILURE` with exact check summary `Insufficient review credits`
- `Socket Security: Project Report`: `SUCCESS`
- `Socket Security: Pull Request Alerts`: `SUCCESS`
- `license/snyk (jscraik)`: `SUCCESS`
- `security/snyk (jscraik)`: `SUCCESS`
- `semgrep-cloud-platform/scan`: `SUCCESS`

## Review Thread / Comment State
Observed via:
- `mcp__github__get_pull_request_reviews` -> `[]`
- `mcp__github__get_pull_request_comments` -> `[]`
- `gh pr view` issue comments include linkback + bot informational comments only.

Result:
- No unresolved inline review threads found.
- No review requests or blocking review states found.
- CodeRabbit issue comment reports review limit / organization usage-credit exhaustion. This is an external review-capacity failure, not an introduced source defect.

## Faults Found and Fixes Made
- Faults requiring code/config changes: none found.
- Local fixes implemented: none.
- Commits pushed by this sweep: none.
- Follow-up propagation: JSC-370 CodeRabbit repair commit was cherry-picked into this stacked branch after the initial sweep so PR #16 inherits the latest proof-context failure-path fix.

## Validation Commands Run In This Sweep
- `git status --short --branch`
- `gh pr view 16 --repo jscraik/evals --json url,state,isDraft,headRefName,baseRefName,mergeable,reviewDecision,statusCheckRollup,commits,comments,reviews`
- `mcp__github__get_pull_request_reviews`
- `mcp__github__get_pull_request_comments`

## Remaining Blockers
- PR is still in draft state. This is a delivery-state blocker for merge despite green checks.
- CodeRabbit is failing because review credits are exhausted. Class: `external_tooling`.
- PR is still in draft state. Class: `lifecycle_blocker`.

## Final Status
- `blocked_external_tooling_and_draft`
- Recovery condition: wait for CodeRabbit review capacity or add credits, then trigger `@coderabbitai review` or push a no-op follow-up only if maintainers explicitly want a retrigger. Mark PR ready for review only when maintainers decide the draft gate can be lifted.
WROTE: artifacts/pr-green-sweep/jsc-371-pr-triage.md
