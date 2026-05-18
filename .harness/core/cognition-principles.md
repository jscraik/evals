# Cognition Principles

## Proven Invariants

- Future agents need cheap cognition: command, schema, artifact, failure reason.
- Local reasoning is the primary design constraint.
- Abstractions must reduce reasoning cost.
- Reports must point to raw evidence.
- Ownership must be visible at the point of failure.
- Context should compress as work moves from review to strategy to ADR to core.

## Strategic Assumptions

- The main agent failure mode is over-reading documents and under-executing.
- Token-expensive workflows will drift toward summaries instead of proof.

## Forbidden Cognition Patterns

- hidden orchestration;
- vague rubrics without evidence links;
- prompt growth without eval improvement;
- dashboards hiding ownership;
- multiple competing entrypoints;
- framework terminology leaking into core concepts;
- long context paths for simple execution.

## Operating Rule

Prefer the shortest truthful path from question to evidence. If future agents
cannot explain the run path quickly, the architecture is too indirect.

## Hard Block

Do not make future agents read strategy documents to discover how to run the
repo. If the operating path is not visible from the core layer and README, fix
the operating path.
