# JSC-370 PR Green Sweep Triage

## Scope

- Repo: `jscraik/evals`
- PR: [#15](https://github.com/jscraik/evals/pull/15)
- Branch: `codex-jsc-370-latest-proof-context`
- Latest repaired head SHA: `f84cf7cfbf59c49770493c0a7f4876bc33383a58`

## Severity-Ranked Findings

### High

1. CodeRabbit cannot currently complete the live PR review because the external
   service reports insufficient review credits.
   - Evidence: PR #15 status recheck reported CodeRabbit failure with
     `Insufficient review credits`.
   - Ownership classification: `environment or tooling failure`.
   - Remediation advice: restore/replenish CodeRabbit credits, rerun the
     CodeRabbit check, then recheck PR #15 review comments and checks.

### Medium

1. None currently.

### Low

1. The earlier `src/lib/paths.js` symlink-containment review finding has been
   repaired locally and pushed.
   - Evidence: focused review-comment check after push found no active comments
     targeting `src/lib/paths.js`.
   - Ownership classification: `introduced by current patch`; fixed.

## Fixes Made

- `src/lib/paths.js`: changed repository containment to compare real filesystem
  paths so an in-repo symlink ancestor cannot redirect a case or artifact path
  outside the trusted root.
- `test/cli.test.js`: added a negative symlink-escape regression for case
  validation.
- `.harness/refactors/2026-05-24-jsc-370-latest-proof-context.md`: updated the
  deep-module packet to make `src/lib/paths.js` the containment owner.
- `.harness/implementation-notes/2026-05-24-jsc-370-implementation-notes.html`:
  updated the deep-module visual to show where JSC-370 through JSC-369 work is
  placed.

## Validation Evidence

- `node --test --test-name-pattern "symlink" test/cli.test.js` -> pass.
- `git diff --check` -> pass.
- `pnpm test` -> pass. 115 tests passed on the JSC-370 branch after the repair.
- `pnpm evals run fixtures/smoke/pr-closeout.case.json --json` -> pass.
- `pnpm evals check --json` -> pass.
- `pnpm verify` -> pass.

## Current Blockers

- `external_tooling`: CodeRabbit review-credit exhaustion prevents an all-green
  hosted check surface.
- `lifecycle_blocker`: PR #15 remains open until the configured merge or
  owner-approved deferral decision is recorded.

WROTE: artifacts/pr-green-sweep/jsc-370-pr-triage.md
