# PR Green Sweep Triage: External Evals Suite Authority

Date: 2026-06-04

Skill: pr-green-sweep

PR: https://github.com/jscraik/evals/pull/31

## Summary

schema_version: 1

heartbeat_status: not_applicable

This was a bounded git and PR triage lane after implementation review, not a
monitor/watch/until-green automation request. No detached heartbeat was created.

## Dirty Worktree Ledger

Included and committed:

- external project manifest decision, schema, fixtures, owner, and tests;
- authority classification schema, owner, external check/state output, and
  tests;
- privacy approval evidence fixtures and classifier coverage;
- accepted vocabulary and architecture entries;
- implementation notes, closeout evidence, review artifacts, and goal board.

Excluded:

- generated .harness/evals/runs/20*/ smoke run directories, ignored by repo
  policy;
- transient .harness/evals/runs/latest.json mutations caused by smoke/verify
  validation, restored before commit because fresh run directories are ignored.

## Validation Surface Decisions

- Changed surface: schema, src/lib owners, external check/state JSON output,
  fixtures, tests, glossary, architecture, and governance artifacts.
- Selected verifier: focused manifest/classifier/CLI tests, full pnpm test,
  smoke run, check, smoke check, state, pnpm verify, and goal-board validator.
- Outcome: local validation pass.

## Fix Ledger

- CodeRabbit: live PR check failed due insufficient review credits; not fixable
  from code.
- Snyk: live PR check failed due private-test limit; not fixable from code.
- Socket Security: pending at triage time.
- deterministic-gates: pending at triage time.
- semgrep-cloud-platform/scan: pending at triage time.
- Architecture/simplify/testing/ubiquitous-language: completed through
  per-slice review artifacts and final PU-005 review.

## Merge Ledger

- PR number: 31.
- Branch: codex/external-evals-suite-authority.
- Base: main.
- Initial PR head SHA: 8d994d4c6f227ac11a32b76d860550afa7de70e3.
- Mergeability: MERGEABLE at live PR check.
- Review decision: empty at live PR check.
- Merge readiness: not claimed. External checks are failed/pending.

## Action Queue

- blocked_external_ci: CodeRabbit insufficient review credits.
- blocked_external_ci: Snyk private-test limit used.
- blocked_external_ci: Socket Security pending.
- blocked_external_ci: deterministic-gates pending.
- blocked_external_ci: semgrep-cloud-platform/scan pending.
- cleanup_only: none. No merge proof, so no branch or worktree cleanup.

## Commands

- Command: git status --short --branch -> pass.
- Command: gh pr status --repo jscraik/evals -> pass, no existing PR before creation.
- Command: git switch -c codex/external-evals-suite-authority -> pass after .git write permission.
- Command: git add --all -> pass.
- Command: git commit -> pass, 8d994d4.
- Command: git push -u origin codex/external-evals-suite-authority -> pass.
- Command: gh pr create --repo jscraik/evals --title "Add external evals authority boundary" --body-file /private/tmp/evals-external-authority-pr-body.md -> pass, PR #31.
- Command: gh pr view 31 --repo jscraik/evals --json number,url,title,state,headRefName,baseRefName,mergeable,reviewDecision,headRefOid -> pass.
- Command: gh pr checks 31 --repo jscraik/evals --watch=false -> fail due failed/pending external checks listed above.
