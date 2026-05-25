# JSC-371 PR #16 Postfix Triage

## Scope
- Repo: `jscraik/evals`
- PR: #16
- URL: https://github.com/jscraik/evals/pull/16
- Local worktree: `/private/tmp/evals-jsc371`
- Expected head: `7d6d6671e9908a9b5deef1ac310906c8c6440da1`
- Observed head: `7d6d6671e9908a9b5deef1ac310906c8c6440da1` (match)

## Severity-Ranked Findings

### P1 - External blocker: CodeRabbit required status is failing due to credit exhaustion
- Evidence: `gh pr checks 16` reports `CodeRabbit  fail  Insufficient review credits`.
- Evidence source in PR comments: CodeRabbit status comment says review capacity/usage credits exhausted, not code-level defects.
- Impact: Prevents fully green required-check surface despite deterministic gates passing.
- Ownership classification: environment or tooling failure (external service quota), not introduced by current patch.
- Remediation advice: restore CodeRabbit credits or temporarily adjust required-check policy if governance allows.

### P2 - Prior `isSuitePath` and artifact-root findings appear resolved at current head
- Prior actionable findings from review comments:
  - artifact root normalization mismatch risk
  - suite dispatch fallback risk in `isSuitePath`
- Current head evidence in `src/lib/suite-contract.js`:
  - `validateArtifactRoot` now normalizes and canonicalizes via `normalizeSuiteRef(...)`, `rootRelativePath(...)`, and `relFrom(...)`.
  - `isSuitePath` now dispatches by `suite.json` basename plus `.evals` ancestry, not by requiring `artifact_policy`/schema keys in-file.
- Conclusion: coordinator repair for the `isSuitePath` lane is present on current head; no additional local patch required from this triage slice.

### P3 - Non-blocking pending status still present
- Evidence: `semgrep-cloud-platform/scan` remains `pending` at recheck time.
- Impact: final readiness still depends on completion outcome.
- Remediation advice: wait for Semgrep to finish and recheck status rollup.

## PR / Review State Snapshot
- PR state: OPEN, not draft.
- Merge state status: UNSTABLE.
- Passing checks: deterministic-gates, Socket Security checks, Snyk license/security.
- Failing checks: CodeRabbit (credit exhaustion).
- Pending checks: semgrep-cloud-platform/scan.
- Review comments: no newly surfaced actionable code defects after coordinator repair; triage-only/doc-lint noise remains non-blocking for runtime behavior.

## Local Changes and Validation in This Slice
- Code edits: none.
- Validation commands run:
  - `git rev-parse HEAD`
  - `git status --short --branch`
  - `gh pr view 16 --json ...`
  - `gh pr checks 16` (rechecked)
  - `gh`/GitHub API review-comment inspection for actionable findings

## Coordinator Next Step
1. Treat current blocker as external CodeRabbit credit exhaustion.
2. Wait for Semgrep completion, then re-run `gh pr checks 16`.
3. If Semgrep passes and CodeRabbit remains quota-failed, route policy decision (credits replenish vs. required-check exception).

WROTE: artifacts/pr-green-sweep/jsc-371-pr-triage.md

