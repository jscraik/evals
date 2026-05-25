# PR #20 Outstanding Review Threads Triage

Date: 2026-05-25
Repo: jscraik/evals
PR: https://github.com/jscraik/evals/pull/20
Head SHA: 7e04fbecc4d76f73120f0277ba152af3f3736392

## Scope
- Requested triage artifact for outstanding review threads and PR green state.
- Evidence sources: live GitHub API (gh pr view, gh pr checks, GraphQL review thread query, status rollup query) and PR body validation section.

## Live PR State
- Number/title: #20 fix(schema): accept lowercase RFC3339 separators
- State: OPEN
- Draft: false
- Mergeability: MERGEABLE (mergeable_state=unstable due to one failing check context)
- Review decision: empty (no formal review submitted)
- Changed files: 4
- PR review comments (inline): 0
- PR reviews: 0

## Live Review Thread State
- GraphQL reviewThreads(first:100).totalCount: 0
- Unresolved threads on PR #20: 0
- Outdated unresolved threads on PR #20: 0

## Checks And Gate Status
- deterministic-gates: SUCCESS
- Socket Security: Project Report: SUCCESS
- Socket Security: Pull Request Alerts: SUCCESS
- license/snyk (jscraik): SUCCESS
- security/snyk (jscraik): SUCCESS
- semgrep-cloud-platform/scan: SUCCESS
- CodeRabbit: FAILURE

## CodeRabbit Status (Blocker Classification)
- Failure text from gh pr checks:
  - CodeRabbit fail Insufficient review credits
- Matching PR comment from coderabbitai:
  - "Review limit reached" and organization usage credits exhausted.
- Classification: environment/tooling failure (external credit/rate-limit), not a code regression introduced by this patch.
- Ownership: billing/quota replenishment or delayed retry, not implementation change.
- Safe next step: rerun/retrigger CodeRabbit after credits refill (or push a no-op commit only if policy allows) and recheck status.

## Validation Evidence From PR Body
PR body includes the following validated commands and outcomes:
- pnpm test test/schema.test.js -> pass
- git diff --check -> pass
- pnpm test -> pass
- pnpm verify -> pass

These align with the repository deterministic validation contract and indicate local validation proof is present for the patch itself.

## Outstanding Thread/Review Risk Summary
- No unresolved review threads exist on PR #20.
- No inline review comments remain on PR #20.
- Merge readiness is currently blocked only by external CodeRabbit credit exhaustion.
- Historical-thread claim in PR body (PR #5 thread PRRT_kwDOShQiR86DnKM9) is documented as being fixed by this PR; closure of that historical thread is expected after merge.

## Final Classification
- Patch-introduced blockers: none observed.
- Pre-existing/unrelated blockers: none observed on this PR surface.
- Environment/tooling blocker: yes (CodeRabbit credits/rate limit).

WROTE: /private/tmp/evals-fix-outstanding-review-threads/artifacts/pr-green-sweep/outstanding-review-threads-pr20-triage.md
