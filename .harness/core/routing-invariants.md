# Routing Invariants

## Proven Invariants

- Phase-one routing goes to Evals Executable Spine.
- Work routes through the local runner before adapters, dashboards, telemetry,
  cloud execution, or judge gates.
- Suite failures must identify the responsible layer: runtime, adapter, or
  owning repo.
- External source mining routes to research notes until a real suite needs an
  adapter.
- Repo-specific suite adoption routes to the owning repo, linked back to evals.

## Strategic Assumptions

- Future agents will over-route to interesting frameworks unless routing is
  explicit.
- One obvious command reduces more drift than many clever entrypoints.

## Forbidden Routing

- hidden execution paths;
- adapter code imported by the core runner;
- dashboard or hosted service as primary entrypoint;
- ambiguous suite ownership;
- Linear issue explosion before smoke artifact proof.

## Operating Rule

Route by proof dependency:

schema -> local runner -> artifact bundle -> deterministic scorers -> baseline
comparison -> repo-owned suites -> optional adapters -> optional telemetry ->
optional dashboard.

## Hard Block

Do not route around the local runner. Any path that makes hosted tooling,
dashboard views, framework runners, or judge calls the first proof surface is
drift.
