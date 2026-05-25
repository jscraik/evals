# JSC-371 PR #16 Green Sweep Triage

## Scope
- Repository: `jscraik/evals`
- PR: [#16](https://github.com/jscraik/evals/pull/16)
- Original triage head: `cbd403395483f304470186a450a28c89c0954a87`
- Coordinator repair: pending push from local worktree after this artifact update.

## Current PR and Check State
- PR state: OPEN, non-draft, merge state `UNSTABLE`.
- Check summary:
  - `CodeRabbit`: **fail** — `Insufficient review credits`
  - `deterministic-gates`: pass
  - `semgrep-cloud-platform/scan`: pass
  - `Socket Security` checks: pass
  - `Snyk` checks: pass

## Severity-Ranked Findings

### 1. Minor: Overly permissive suite detection in `isSuitePath` — remediated locally
- Severity: Minor
- Evidence:
  - File: `src/lib/suite-contract.js:129-137`
  - Current logic returns true for any JSON file matching shape keys (`cases`, `owner_repo`, `artifact_policy`) even when not named `suite.json` and not guaranteed repo-local.
  - CodeRabbit inline discussion reference: `https://github.com/jscraik/evals/pull/16#discussion_r3297366282`
- Risk:
  - Can misclassify non-`suite.json` file paths as suites and route run behavior away from the intended `<case-file|suite.json>` contract.
- Remediation:
  - Coordinator restricted `isSuitePath` to:
    - require `basename(resolve(path)) === "suite.json"`
    - require `nearestEvalRoot(dirname(absolutePath))`
    - avoid content-shape parsing for suite detection.
  - Added regression coverage proving a suite-shaped `.evals/not-suite.json` is not routed as a suite and does not publish artifacts.
  - Updated the misplaced-suite regression to assert the direct `loadSuite` guard and the new CLI case-path rejection route.

### 2. External blocker: CodeRabbit check failure is credit exhaustion, not code/runtime gate failure
- Severity: Informational/External
- Evidence:
  - `gh pr checks 16` shows CodeRabbit failed with `Insufficient review credits`.
  - PR comments include CodeRabbit “Review limit reached” and org usage exhaustion notice.
- Risk:
  - Prevents CodeRabbit green status despite local code quality and deterministic checks passing.
- Recommended remediation:
  - Re-trigger CodeRabbit after credits refill or purchase additional credits.
  - Keep this classified as an external service quota blocker unless new actionable findings appear.

## Coordinator Repair Evidence

STATUS: repaired_local_pending_push

- Files changed:
  - `src/lib/suite-contract.js`
  - `test/cli.test.js`
  - `artifacts/pr-green-sweep/jsc-371-pr-triage.md`
- Validation:
  - `node --test --test-name-pattern "suite detection requires suite.json inside .evals" test/cli.test.js` -> pass
  - `node --test --test-name-pattern "repo-local suite|suite contract|suite detection" test/cli.test.js` -> pass
  - `git diff --check` -> pass
  - `pnpm test` -> pass, 125 tests
  - `pnpm evals run fixtures/smoke/pr-closeout.case.json --json` -> pass
  - `pnpm evals check --json` -> pass
  - `pnpm evals state --json` -> pass
  - `pnpm verify` -> pass
- Remaining blocker:
  - CodeRabbit hosted check remains an external service quota blocker until PR #16 receives a new live check after push and/or review credits are available.

WROTE: artifacts/pr-green-sweep/jsc-371-pr-triage.md
