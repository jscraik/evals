# ADR-001

## Title

Executable Spine Before Expansion

## Status

accepted

## Decision

The evals repo must build a local executable spine before adding external
framework adapters, dashboards, cloud runners, telemetry exporters, plugin
systems, or required judge gates.

Invariant: phase-one work must make the local smoke command and artifact bundle
more trustworthy. Work that does not improve local executable proof waits.

## Context

The repo currently has strong harness documents but no package manifest, runner,
schemas, tests, fixture, artifact bundle, or baseline comparator. The source
list is broad enough to pull the repo toward framework collection before it can
prove one local regression case.

## Why This Decision Exists

This decision prevents documentation-only architecture and platform theater. It
forces the repo to earn authority through a local command, deterministic checks,
and durable artifacts before it grows outward.

Future agents are likely to add integrations because they look useful. This ADR
keeps them from mistaking ecosystem breadth for proof.

It compounds positively because every later suite, adapter, telemetry exporter,
and judge policy can reuse the same local proof spine.

## Alternatives Considered

- Start with Braintrust, OpenAI Evals, DeepEval, AutoEvals, FastEval, or
  OpenEvals as the base. Rejected because external abstractions would shape the
  repo before local proof exists.
- Start with dashboard or report aggregation. Rejected because visibility
  without artifact truth creates false confidence.
- Start with judge scoring. Rejected because deterministic gates do not exist
  yet.

## Accepted Tradeoffs

- Slower path to visible integrations.
- Less impressive phase-one surface area.
- More upfront discipline around schemas, artifacts, and command behavior.
- Reduced freedom for agents to chase interesting eval frameworks early.

## Anti-Drift Constraints

Must not reappear:

- adapter sprint before smoke runner;
- dashboard-first roadmap;
- cloud-only proof;
- required LLM judge before deterministic scorers;
- plugin system before repeated adapter duplication;
- strategy docs used as substitute for executable proof.

Regression indicator: a new phase-one task cannot name the local artifact,
schema, scorer, runner, or baseline behavior it improves.

Hard block: no phase-one work may introduce dashboard, cloud runner, adapter
implementation, plugin system, or required judge gate. Renaming these as
observability, developer experience, extensibility, or quality scoring does not
change the block.

## Safe Revisit Conditions

Revisit only after:

- one local smoke case writes a valid artifact bundle;
- the first two repo-owned suites run;
- at least one integration need is proven by a real suite;
- a closure eval shows that expansion will not weaken artifact authority.

## Related Systems

- Evals Executable Spine Linear initiative.
- .harness/refactors/stabilize-evals-executable-spine.md
- Future CLI runner, schemas, artifacts, scorers, baseline comparator.

## Evidence

Facts:

- The review found no executable feedback loop in the seed repo.
- The triage named Evals Executable Spine as the only immediate initiative.
- The strategy says not to add dashboards, judge gates, or telemetry before
  local artifact proof.

Interpretation:

- The main risk is not bad code. It is premature expansion before code exists.

Assumptions:

- A small local runner is feasible and enough to validate the architecture.
