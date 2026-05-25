# JSC-369 Parent Closeout Deep Module Packet

## Owner Module / Surface

JSC-369 owns parent reconciliation evidence only. Its owner surface is the
closure evidence ledger at `.harness/evals/evals-evals-executable-spine-eval.md`
plus PR triage artifacts under `artifacts/pr-green-sweep/`.

It does not introduce a runtime owner module. Runtime proof remains owned by the
JSC-370, JSC-371, and JSC-372 implementation modules.

## Public Interface

The public closeout interface is:

- `.harness/evals/evals-evals-executable-spine-eval.md`
- `artifacts/pr-green-sweep/jsc-369-final-closeout-pr-triage.md`
- PR #21 final closeout evidence on GitHub
- Linear state for JSC-369, JSC-370, JSC-371, and JSC-372

Consumers may read those surfaces to determine parent closeout status. They
must not infer completion from subagent mailbox text, stale PR snapshots, or
advisory CodeRabbit capacity warnings alone.

## Hidden Implementation Rule

Parent closeout reconciles child proof; it does not create new authority.

The parent can cite:

- child deep-module packets;
- validation commands and run artifacts;
- GitHub PR state and review-thread state;
- Linear issue state;
- docs/AGENTS review artifacts;
- explicit blocker or deferral classifications.

The parent must not:

- override child validation results;
- treat telemetry, PR comments, Linear comments, or mailbox summaries as verdict
  authority;
- leave stale current blocker tables after a later final state supersedes them.

## Caller Contract

Callers of parent closeout evidence must check the latest dated addendum and any
supersession note before interpreting older snapshots. Historical refreshes are
allowed only when labelled as superseded and must not contradict the final
verdict.

## Seam Test

The seam is evidence consistency:

- stale PR-open or Linear-in-review snapshots must not appear as current truth
  after final closeout;
- raw author-local worktree paths must not be required to reproduce evidence;
- CodeRabbit review-credit failures must be separated from actionable unresolved
  review threads.

## Tracer Proof

Current tracer proof:

- PR #21 merge commit: `dd7ef7014b9acd9577ed69fcbfdb037b679e4ee1`
- latest validation bundle:
  `.harness/evals/runs/20260525T175526Z-pr-closeout-4df36134-01/`
- PR #21 triage artifact:
  `artifacts/pr-green-sweep/jsc-369-final-closeout-pr-triage.md`

## Rollback Path

If parent closeout is overstated, revert the closeout evidence commit or patch
the closure ledger to mark the affected child state as blocked with the live PR,
Linear, validation, or review-thread evidence that proves the blocker.

No runtime rollback is required because this packet and the JSC-369 slice are
evidence-only.

## Validation Gate

Minimum validation for this packet and the closure evidence cleanup:

- `git diff --check`
- `pnpm verify`
- GitHub GraphQL review-thread query for PRs #15 through #21
- `gh pr list --repo jscraik/evals --state open`

## Phase-One Boundary

This packet keeps phase one closed to dashboards, plugin systems, cloud runners,
external adapter roots, networked suite execution, required LLM judge gates, and
runtime dependencies on sibling repositories or telemetry collectors.
