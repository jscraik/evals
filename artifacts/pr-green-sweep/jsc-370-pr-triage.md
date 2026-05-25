# JSC-370 PR Green Sweep Triage

PR URL: https://github.com/jscraik/evals/pull/15
Checked at: 2026-05-24 Europe/London
Branch: codex-jsc-370-latest-proof-context
Base: main
PR state: OPEN (draft)
Merge state: fixed locally, pending push/recheck
Review decision: CodeRabbit posted actionable inline findings after the earlier sweep snapshot.

## Live Check Status

- deterministic-gates: pass
- semgrep-cloud-platform/scan: pass
- Socket Security: Project Report: pass
- Socket Security: Pull Request Alerts: pass
- license/snyk (jscraik): pass
- security/snyk (jscraik): pass
- CodeRabbit: actionable comments found and fixed locally; requires push and live recheck.

Source evidence:
- `gh pr view ... --json statusCheckRollup`
- `gh pr checks 15` and watch snapshot

## Review Thread Status

- GitHub inline review comments were rechecked with `gh api repos/jscraik/evals/pulls/15/reviews/comments`.
- CodeRabbit findings were actionable in `src/lib/latest-run.js`, the committed HTML report, and review artifacts.

## Fixes Made

- `src/lib/latest-run.js`: preserved `expected_context`, `actual_context`, `context_match`, `context_mismatch_reason`, and `recovery_command` on malformed latest JSON and latest schema-failure paths.
- `test/cli.test.js`: added regression coverage for schema-failed latest records and malformed latest JSON.
- `.harness/implementation-notes/2026-05-24-jsc-370-implementation-notes.html`: removed committed auto-refresh behavior and changed the page to a historical snapshot.
- `artifacts/reviews/jsc-370-adversarial-reviewer.md`: added a resolution section for the review concern.
- `artifacts/reviews/jsc-370-he-code-review.md`: clarified the residual artifact risk so committed review artifacts are not misclassified as generated proof bundles.

## Remaining Blockers

1. Live PR recheck is still required after the local fix commit is pushed.
   - Class: post-fix external validation.
   - Recovery condition: push the fix commit, recheck checks and review comments, and update this artifact if new faults appear.

## Final Status

STATUS: fixed_pending_live_recheck

Local fixes are applied and validated. The PR is not green-claimed until the fix commit is pushed and live GitHub checks/review comments are rechecked.

## Local Validation

- `pnpm test -- --runInBand` -> fail. Node test runner does not support the Jest-style `--runInBand` flag in this repo; command selection error, not a product failure.
- `pnpm test` -> fail before assertion repair. The new malformed-JSON assertion was too specific for Node's parser wording.
- `pnpm test` -> pass after assertion repair. 114 tests passed.
- `pnpm verify` -> pass. Fresh proof bundle written under `.harness/evals/runs/20260524T235025Z-pr-closeout-4df36134-01/`.


WROTE: artifacts/pr-green-sweep/jsc-370-pr-triage.md

## 2026-05-25 Symlink Containment Repair

Live PR recheck found one additional CodeRabbit finding on PR #15:
\`src/lib/paths.js\` used \`path.resolve()\` plus a string-prefix comparison for
root containment. That normalizes traversal but does not dereference symlinks,
so a path that is syntactically inside the repository could still resolve
outside the repository through an intermediate symlink.

### Fixes Made

- \`src/lib/paths.js\`: changed \`insideRepo()\` to compare the repository root and
  candidate path after filesystem realpath resolution. Missing candidate paths
  resolve through the nearest existing ancestor, so an in-repo symlink ancestor
  still cannot redirect a future proof path outside the repository.
- \`test/cli.test.js\`: added a negative CLI regression that creates an in-repo
  symlink under \`fixtures/smoke/\` pointing at an outside temporary directory and
  proves \`pnpm evals run ... --json\` rejects the escaped case path before
  reading it.
- \`.harness/refactors/2026-05-24-jsc-370-latest-proof-context.md\`: updated the
  deep-module packet to make \`src/lib/paths.js\` the containment owner for this
  trust-boundary repair.

### Local Validation

- \`node --test --test-name-pattern "symlink" test/cli.test.js\` -> pass.
- \`git diff --check\` -> pass.
- \`pnpm test\` -> pass. 115 tests passed, including the symlink escape
  regression.
- \`pnpm evals run fixtures/smoke/pr-closeout.case.json --json\` -> pass.
  Wrote run bundle
  \`.harness/evals/runs/20260525T092732Z-pr-closeout-4df36134/\`.
- \`pnpm evals check --json\` -> pass. Latest proof context matched the smoke
  case and suite.
- \`pnpm verify\` -> pass. Fresh proof bundles were written under
  \`.harness/evals/runs/20260525T092748Z-pr-closeout-4df36134/\` and
  \`.harness/evals/runs/20260525T092748Z-pr-closeout-4df36134-01/\`.

### Remaining Blockers

1. The symlink-containment repair still requires push and live PR recheck.
   - Class: post-fix external validation.
   - Recovery condition: push the repair commit, recheck PR #15 checks and
     review comments, and update this artifact if new faults appear.

WROTE: artifacts/pr-green-sweep/jsc-370-pr-triage.md
