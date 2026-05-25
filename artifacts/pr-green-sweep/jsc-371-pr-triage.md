# JSC-371 PR Green Sweep Triage

- PR URL: https://github.com/jscraik/evals/pull/16
- Checked at: 2026-05-24 Europe/London
- Branch: `codex-jsc-371-repo-local-suite-contract`
- Base: `main`

## PR State
- Open: yes
- Draft: yes
- Mergeable: `MERGEABLE`
- Review decision: none set (`""`)

## CI / Required Checks State
Observed via `gh pr view 16 --repo jscraik/evals --json statusCheckRollup`.

- `deterministic-gates` (Deterministic Evals CI): `SUCCESS`
- `CodeRabbit` status context: `SUCCESS` (note: comment indicates rate-limit event, but status is successful)
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
- Live PR checks must be rechecked after the JSC-370 repair propagation push.

## Final Status
- `blocked_draft_only`
- Recovery condition: mark PR ready for review (`Ready for review`) when maintainers decide the draft gate can be lifted.
WROTE: artifacts/pr-green-sweep/jsc-371-pr-triage.md

## 2026-05-25 Review Thread Repair Addendum

Source of truth:
- PR #16 live review-thread recheck reported unresolved CodeRabbit findings against suite dispatch, artifact-root normalization, malformed/incomplete suite handling, proof-context tri-state output, latest parse-failure shape, backslash scorer references, and explicit product validation evidence in this artifact.

Code fixes applied in this branch:
- `src/lib/suite-contract.js` now normalizes `artifact_policy.artifact_root` to a repo-relative prefix before run-bundle allocation. This prevents `./.harness/evals/runs` and backslash variants from leaking into latest/run paths.
- `src/lib/suite-contract.js` now treats `.evals/suite.json` as the suite authority even when the JSON is malformed or schema-incomplete. Malformed and incomplete suites fail `suite validation` before any case execution or artifact publication.
- `src/lib/suite-contract.js` normalizes backslash suite references before scorer/path validation, so Windows-shaped data references are validated as data paths instead of executable or missing-file surprises.
- `src/commands/run.js` now uses branch-exclusive `runTarget` dispatch: suite targets run through `runSuite` and return before `runCase` can execute.
- `src/commands/validation.js` preserves proof-context tri-state output with `context_match: null` when latest validation did not evaluate a context.
- `src/lib/latest-run.js` includes `latest_path` in read/parse failure payloads.

Product validation outcomes:
- `pnpm test` -> pass. 123 tests passed, including new regressions for artifact-root/backslash normalization, malformed suite validation, incomplete suite validation, branch-exclusive suite dispatch, and latest parse-failure `latest_path` output.
- `pnpm verify` -> pass. The gate reran `pnpm test`, smoke run in text and JSON mode, `pnpm evals state --json`, `pnpm evals check --json`, and the credential-pattern scan. The latest proof bundle from this gate is `.harness/evals/runs/20260525T085721Z-pr-closeout-4df36134/`.

Remaining blocker classification:
- PR #16 is still open. Merge readiness must be rechecked after this branch is committed, pushed, and hosted checks settle.
- This addendum does not claim review-thread resolution; it records the local repair and validation evidence for the PR sweep lane.

WROTE: artifacts/pr-green-sweep/jsc-371-pr-triage.md
