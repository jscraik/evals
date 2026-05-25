# JSC-371 PR #16 Postfix Triage

## Scope

- Repo: `jscraik/evals`
- PR: #16
- URL: https://github.com/jscraik/evals/pull/16
- Slice branch: `codex-jsc-371-repo-local-suite-contract`
- Local worktree used for triage: `Author local worktree: <local-worktree-jsc371>`; the original absolute path was not portable and is intentionally omitted from committed evidence.
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
  - `isSuitePath` dispatches by `suite.json` basename plus `.evals` ancestry, rejects symlinked `suite.json` entries with `lstatSync(...)`, and does not route loose suite-shaped JSON content as a suite.
- Regression evidence in `test/cli.test.js`:
  - misplaced suites are rejected through `loadSuite(...)`;
  - suite-shaped `.evals/not-suite.json` files are not routed as suites and do not publish run artifacts.
  - symlinked `.evals/suite.json` files are not routed as suites and do not publish run artifacts.
- Conclusion: no additional runtime/schema patch is required for the suite-detection lane.

### P3 - Hosted check state requires a final live recheck after artifact-only commits

- Evidence: the coordinator pushed artifact-only commit `41be55b` after the triage subagent captured the code-head snapshot.
- Impact: GitHub checks restart on the new PR head, so the parent cannot claim final PR readiness from the older snapshot alone.
- Remediation advice: re-run `gh pr view 16 --json statusCheckRollup,headRefOid,mergeStateStatus,isDraft,state,reviewDecision,url` before merge or parent closeout.

## PR / Review State Snapshot

- PR state at the subagent snapshot: OPEN, not draft.
- Merge state at the subagent snapshot: UNSTABLE.
- Passing checks at the subagent snapshot: deterministic-gates, Socket Security checks, Snyk licence/security.
- Failing checks at the subagent snapshot: CodeRabbit credit exhaustion.
- Pending checks at the subagent snapshot: semgrep-cloud-platform/scan.
- Current parent classification: evidence is useful but not final; the artifact-only follow-up commit requires a fresh hosted-check rollup before any merge/readiness claim.

## 2026-05-25 Merge-Conflict Repair

- Live PR recheck: PR #16 is the only open PR and GitHub reported `mergeable: CONFLICTING` at head `0965fbbbf0fe899e9c422f48560ab03d545865bc`.
- Local repair worktree: `Author local worktree: <local-worktree-jsc371>` on `codex-jsc-371-repo-local-suite-contract`; the original absolute path was local to the author machine and is not portable evidence.
- Repair action: merged `origin/main` into the PR branch and resolved conflicts.
- Resolution rule:
  - kept the PR branch side for still-open executable suite-contract/runtime files: `src/commands/run.js`, `src/commands/validation.js`, `src/lib/latest-run.js`, `src/lib/paths.js`, `src/lib/run-bundle.js`, and `test/cli.test.js`;
  - kept `origin/main` for already-merged JSC-370 notes, review artifacts, and prior latest pointer evidence because PR #15 is now merged and `main` is the authoritative JSC-370 slice source.
- Generated proof artifacts: retained the validation run bundles produced during the repair because deletion of generated directories was blocked by the local safety policy and the artifacts are valid local proof evidence.
- Post-repair local status before push: conflicts fixed locally; merge commit pending, then branch push and live GitHub recheck required.

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
- Coordinator validation after merge-conflict repair:
  - `git diff --check` -> pass
  - `node --test --test-name-pattern "repo-local suite|suite contract|suite detection" test/cli.test.js` -> pass, 10 selected tests passed
  - `pnpm test` -> pass, 129 tests passed
  - `pnpm evals run fixtures/smoke/pr-closeout.case.json --json` -> pass, produced run `20260525T154018Z-pr-closeout-4df36134`
  - `pnpm evals check --json` -> pass, latest proof context matched `pr-closeout` / `smoke` / `synthetic`
  - `pnpm evals state --json` -> pass, runtime state reported `ready`
  - `pnpm verify` -> pass, aggregate deterministic gate passed and refreshed latest proof bundle `20260525T154059Z-pr-closeout-4df36134-01`
- Coordinator validation after CodeRabbit remediation patch:
  - `rg -n "/private/tmp|license/snyk" .harness/implementation-notes/2026-05-24-jsc-370-implementation-notes.html artifacts/pr-green-sweep/jsc-371-pr-triage.md artifacts/pr-green-sweep/jsc-370-pr-triage.md` -> pass, exit 1 with no matches.
  - `git diff --check` -> pass.
  - `node --test --test-name-pattern "symlinked suite.json|suite detection requires suite.json" test/cli.test.js` -> pass, 2 selected tests passed.
  - `pnpm test` -> pass, 130 tests passed.
  - `pnpm verify` -> pass, aggregate deterministic gate passed and refreshed latest proof bundle `20260525T155654Z-pr-closeout-4df36134-01`.
- Coordinator validation after CodeRabbit JSON-output remediation patch:
  - Live unresolved CodeRabbit threads: two non-outdated threads remained on `.harness/evals/runs/20260525T093519Z-pr-closeout-4df36134-01/command-log.json` and `scorer-results.json`, both concerning JSON-mode stdout proof.
  - Behavioral fix: `src/commands/run.js` now writes command-log `stdout` as parseable JSON when `--json` is used, and `src/lib/scoring.js` now fails the `required-output` scorer when `execution.output_format: json` stdout is not parseable.
  - `node --test --test-name-pattern "run writes a valid local artifact bundle|required-output scorer fails malformed JSON" test/cli.test.js` -> pass, 2 selected tests passed.
  - `pnpm test` -> pass, 131 tests passed.
  - `pnpm evals run fixtures/smoke/pr-closeout.case.json --json` -> pass, produced run `20260525T161109Z-pr-closeout-4df36134` with parseable JSON in `command-log.json.stdout`.
  - `pnpm evals check --json` -> pass, latest proof context matched `pr-closeout` / `smoke` / `synthetic`.
  - `pnpm verify` -> pass, aggregate deterministic gate passed and refreshed latest proof bundle `20260525T161137Z-pr-closeout-4df36134-01`.

## Coordinator Final Recheck After JSON-Output Patch

- Commit and push: `75f10c3 fix(jsc-371): validate json command-log output` pushed to `codex-jsc-371-repo-local-suite-contract`.
- Live PR state after push: PR #16 open, not draft, mergeable, head `75f10c373732e092dd73eca5fb65e413ce0b9342`.
- Hosted checks after push:
  - `deterministic-gates` -> pass.
  - `Socket Security: Project Report` -> pass.
  - `Socket Security: Pull Request Alerts` -> pass.
  - `license/snyk (jscraik)` -> pass.
  - `security/snyk (jscraik)` -> pass.
  - `semgrep-cloud-platform/scan` -> pass.
  - `CodeRabbit` -> fail, external blocker: `Insufficient review credits`.
- Thread-aware GraphQL review state:
  - `PRRT_kwDOShQiR86EgmVb` -> resolved, path `.harness/evals/runs/20260525T093519Z-pr-closeout-4df36134-01/command-log.json`, line 9.
  - `PRRT_kwDOShQiR86EgmVi` -> resolved, path `.harness/evals/runs/20260525T093519Z-pr-closeout-4df36134-01/scorer-results.json`, line 24.
- Current blocker classification: no unresolved actionable CodeRabbit review threads remain from this remediation pass; the remaining CodeRabbit status failure is external reviewer-credit exhaustion and cannot be fixed by repository code.
- Parent-loop note: JSC-371 PR triage is repaired and evidence-backed, but JSC-371 is not marked parent-complete until merge state, tracker state, and downstream parent reconciliation are handled.

WROTE: artifacts/pr-green-sweep/jsc-371-pr-triage.md
