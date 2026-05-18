# Architecture Invariants

## Proven Invariants

- The repo is a local-first eval harness, not a generic eval platform.
- The first architecture is schema, runner, artifact bundle, deterministic
  scorers, baseline comparator, and repo-owned suites.
- Canonical schemas belong to this repo.
- External frameworks are adapter leaves, never architectural roots.
- Local artifact bundles are authoritative proof.
- Telemetry, hosted logs, and dashboards are explanatory surfaces only.
- Repo-local suites own domain truth.
- Required gates are deterministic until judge calibration is proven.
- Real fixtures require provenance and privacy metadata.

## Strategic Assumptions

- The moat is the real-regression fixture corpus plus operating discipline.
- The runner is necessary but not defensible by itself.
- First consumers are coding-harness and agent-skills.

## Forbidden Architecture

- framework-native canonical schema;
- dashboard-first roadmap;
- cloud-only runner;
- plugin system before repeated adapter duplication;
- judge-gated release path before calibration;
- centralized repo-domain truth in evals;
- report-only evals without artifact bundles.

## Operating Rule

If a proposed architecture does not make local artifact proof more trustworthy,
easier to produce, or easier to inspect, it is not core architecture.

## Hard Block

Do not accept architecture justified by future optionality alone. If it cannot
point to the executable spine, a repo-owned suite, or fixture trust, it is
architecture theater.
