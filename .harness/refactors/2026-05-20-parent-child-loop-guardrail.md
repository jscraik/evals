# Parent/Child Implementation Loop Guardrail

Date: 2026-05-20
Status: binding workflow guardrail for evidence-led gap implementation
Source feedback: Jamie correction after JSC-338 PR review closeout

## Feedback Signal

Jamie asked why the implementation was not looping through each phase as
requested after the JSC-338 PR-review heartbeat was closed. The immediate PR
review work was completed, but the parent evidence-led implementation program
was not resumed.

## Root Operational Failure

The workflow allowed a child loop to consume the parent loop:

- parent loop: audit phase queue, Linear issue queue, implementation,
  validation, review, PR, PR triage, Linear closeout, next issue;
- child loop: one PR review heartbeat or one Linear issue closeout.

Closing the child loop was treated like completion of the larger program. That
is an orchestration failure, not a communication issue.

## Failure Classification

| Category | Classification |
| --- | --- |
| Poor workflow design | The parent loop was not represented as a durable control surface. |
| Runtime ambiguity | Heartbeat scope was narrower than the requested program scope. |
| Missing guardrails | No repo rule required returning from a child heartbeat to the parent queue. |
| Weak observability | The implementation notes did not clearly distinguish parent-loop and child-loop status. |
| Missing decomposition | Linear issue and PR closeout were treated as enough progress evidence without parent queue reconciliation. |

## Binding Rule

A child loop cannot close the parent loop.

After any PR heartbeat, CodeRabbit sweep, GitHub review sweep, or single Linear
issue closeout, the agent must reconcile the parent implementation loop before
claiming the phase program is done.

The reconciliation must answer:

1. Which parent audit phase is active?
2. Which Linear parent issue or phase queue owns the next task?
3. Which child issue or PR just closed?
4. Which validation evidence proves that child closure?
5. What is the next phase-ordered issue, or why is the parent queue complete?
6. Is the parent heartbeat still active, updated, or intentionally retired?

## Parent Loop Contract

The evidence-led gap implementation loop is:

1. Read the audit and phase plan.
2. Refresh or inspect tracker state.
3. Select the next issue in phase order.
4. Define the deep module fix packet.
5. Implement the smallest enforceable fix.
6. Validate with the relevant seam test and tracer proof.
7. Run post-phase review checks.
8. Commit, push, open or update the PR.
9. Triage CodeRabbit/GitHub comments.
10. Close the child Linear issue only after validation and PR state agree.
11. Record closeout in implementation notes.
12. Return to step 2 until the parent queue is complete.

## Child Loop Contract

A child loop may close only one bounded unit:

- one PR review/autofix sweep;
- one CodeRabbit thread cluster;
- one Linear child issue;
- one validation failure cluster;
- one heartbeat resume slice.

When the child loop finishes, control returns to the parent loop. The child loop
must not delete or retire the parent heartbeat unless the parent queue has been
explicitly reconciled as complete.

## Durable System Improvement

This artifact makes the parent/child boundary a repo-owned operating rule. The
test suite checks that this guardrail remains discoverable from the root agent
instructions and shared vocabulary.

## Validation

The guardrail is validated by:

~~~bash
pnpm test
~~~

The test named `parent-child implementation loop guardrail is documented and
discoverable` fails if the guardrail artifact, AGENTS routing, or vocabulary
surface no longer names the parent loop, child loop, and no-child-closes-parent
rule.

## Recurrence Check

If Jamie repeats a correction about lost workflow state, missed phase order,
or treating a PR closeout as program completion, update this artifact and add a
stronger deterministic check before continuing implementation.
