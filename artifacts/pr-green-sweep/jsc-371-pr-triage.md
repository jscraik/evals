# JSC-371 PR #16 Postfix Triage

## Scope

- Repo: `jscraik/evals`
- PR: #16
- URL: https://github.com/jscraik/evals/pull/16
- Slice branch: `codex-jsc-371-repo-local-suite-contract`
- Local worktree used for triage: `/private/tmp/evals-jsc371`
- Code head reviewed by triage subagent: `7d6d6671e9908a9b5deef1ac310906c8c6440da1`
- Artifact-only follow-up commit pushed by coordinator: `41be55b2ed9128010934176a6d1a4a3e65e04297`
- Parent-stack propagation commit source: `origin/codex-jsc-372-claim-evidence-runtime-packet`

## Severity-Ranked Findings

### P1 - External blocker: CodeRabbit required status is not a repository-code failure

- Evidence: the PR triage subagent observed `CodeRabbit  fail  Insufficient review credits` on PR #16 before the artifact-only follow-up commit.
- Evidence source in PR comments: CodeRabbit status text described review capacity or usage credits as exhausted, not a code-level defect.
- Impact: a fully green hosted-check surface cannot be claimed while the required CodeRabbit status is failed, pending, or unavailable.
- Ownership classification: environment or tooling failure; not introduced by the JSC-371 implementation patch.
- Remediation advice: restore CodeRabbit credits or record an owner-approved required-check exception if governance allows it.

### P2 - Prior `isSuitePath` and artifact-root findings are remediated in the child implementation

- Prior actionable findings from review comments:
  - artifact root normalization mismatch risk
  - suite dispatch fallback risk in `isSuitePath`
- Current implementation evidence in `src/lib/suite-contract.js`:
  - `validateArtifactRoot` normalizes and canonicalizes via `normalizeSuiteRef(...)`, `rootRelativePath(...)`, and `relFrom(...)`.
  - `isSuitePath` dispatches by `suite.json` basename plus `.evals` ancestry, not by loose suite-shaped JSON content.
- Regression evidence in `test/cli.test.js`:
  - misplaced suites are rejected through `loadSuite(...)`;
  - suite-shaped `.evals/not-suite.json` files are not routed as suites and do not publish run artifacts.
- Conclusion: no additional runtime/schema patch is required for the suite-detection lane.

### P3 - Hosted check state requires a final live recheck after artifact-only commits

- Evidence: the coordinator pushed artifact-only commit `41be55b` after the triage subagent captured the code-head snapshot.
- Impact: GitHub checks restart on the new PR head, so the parent cannot claim final PR readiness from the older snapshot alone.
- Remediation advice: re-run `gh pr view 16 --json statusCheckRollup,headRefOid,mergeStateStatus,isDraft,state,reviewDecision,url` before merge or parent closeout.

## PR / Review State Snapshot

- PR state at the subagent snapshot: OPEN, not draft.
- Merge state at the subagent snapshot: UNSTABLE.
- Passing checks at the subagent snapshot: deterministic-gates, Socket Security checks, Snyk license/security.
- Failing checks at the subagent snapshot: CodeRabbit credit exhaustion.
- Pending checks at the subagent snapshot: semgrep-cloud-platform/scan.
- Current parent classification: evidence is useful but not final; the artifact-only follow-up commit requires a fresh hosted-check rollup before any merge/readiness claim.

## Local Changes and Validation in This Slice

- Code edits by triage subagent: none.
- Coordinator follow-up: committed and pushed this triage artifact so it is no longer a mailbox-only completion claim.
- Validation commands recorded by the triage subagent:
  - `git rev-parse HEAD`
  - `git status --short --branch`
  - `gh pr view 16 --json ...`
  - `gh pr checks 16`
  - GitHub review-comment inspection for actionable findings
- Coordinator validation before artifact commit:
  - `node --test --test-name-pattern "suite detection requires suite.json inside .evals" test/cli.test.js` -> pass
  - `node --test --test-name-pattern "repo-local suite|suite contract|suite detection" test/cli.test.js` -> pass
  - `git diff --check` -> pass
  - `pnpm test` -> pass
  - `pnpm evals run fixtures/smoke/pr-closeout.case.json --json` -> pass
  - `pnpm evals check --json` -> pass
  - `pnpm evals state --json` -> pass
  - `pnpm verify` -> pass

## Coordinator Next Step

1. Recheck PR #16 live after the artifact-only head settles.
2. If deterministic-gates, Semgrep, Socket, and Snyk pass while CodeRabbit remains credit-blocked, route a governance decision for credits or required-check exception.
3. Do not claim JSC-371 merged/complete until PR state and child tracker state are reconciled.

WROTE: artifacts/pr-green-sweep/jsc-371-pr-triage.md

