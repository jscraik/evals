# ADR-002

## Title

Canonical Result Schema And Adapter Boundary

## Status

accepted

## Decision

The evals repo owns the canonical eval case, result, artifact manifest, scorer
result, baseline result, and suite manifest schemas.

External frameworks may integrate only through adapters that translate into the
canonical schema. Framework-native result shapes must not leak into core runner,
artifact, baseline, or suite contracts.

## Context

The user supplied many legitimate external eval sources. They are useful
reference material, but each brings its own data model. If one becomes
canonical, future results become framework-shaped rather than workflow-shaped.

## Why This Decision Exists

This decision prevents framework lock-in and schema drift. Future agents may
otherwise adopt an external framework because it is convenient, then make every
consumer inherit that framework's assumptions.

The decision compounds positively because one stable local schema lets multiple
repos, suites, adapters, reports, and baselines compare results without caring
which external tool was used.

## Alternatives Considered

- Use Braintrust, OpenAI Evals, DeepEval, AutoEvals, FastEval, or OpenEvals as
  the base schema. Rejected because the repo's moat is local workflow evidence,
  not public framework structure.
- Allow each adapter to write its own result format. Rejected because future
  agents could not compare runs reliably.
- Delay schemas until implementation. Rejected because adapters would fill the
  vacuum.

## Accepted Tradeoffs

- More upfront schema design.
- Adapter authors must translate data instead of passing framework objects
  through.
- Some external framework features may not map cleanly.
- Schema changes require explicit migration care.

## Anti-Drift Constraints

Forbidden patterns:

- more than one canonical result schema;
- adapter output bypassing canonical result validation;
- framework metadata promoted into core fields without ADR;
- core runner importing adapter dependencies;
- suite logic depending on framework-native classes.

Regression indicator: an adapter cannot be removed without breaking core result
interpretation.

Hard block: no external framework may define required fields, verdict taxonomy,
baseline semantics, artifact layout, or suite ownership. External terms can be
stored as adapter metadata only.

## Safe Revisit Conditions

Revisit if:

- two or more real suites require schema concepts the local model cannot
  represent;
- adapter translation causes repeated loss of critical evidence;
- a concrete migration plan preserves existing artifact bundles and baselines.

## Related Systems

- Future schemas directory.
- Future adapters directory.
- .harness/refactors/quarantine-framework-judge-telemetry-sprawl.md
- ADR-001 Executable Spine Before Expansion.

## Evidence

Facts:

- The intent says stable interfaces should be data contracts, not framework
  classes.
- The review flags framework-native schema takeover as a drift risk.
- The triage says canonical schema must precede adapters.
- The strategy says external frameworks are adapters, not base architecture.

Interpretation:

- Schema authority is moat protection, not implementation preference.

Assumptions:

- The local schema can represent the first two suites without adopting an
  external data model.
