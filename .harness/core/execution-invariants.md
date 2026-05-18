# Execution Invariants

## Proven Invariants

- Execution must produce local evidence.
- A valid run needs machine-readable and human-readable artifacts.
- Required gates must be deterministic by default.
- Baseline comparison is core regression evidence.
- Missing artifact paths are failures, not warnings.
- Judge output cannot satisfy proof without deterministic evidence.
- Hosted telemetry cannot satisfy proof without local artifacts.

## Strategic Assumptions

- The first useful command is a smoke case that writes result, report, command
  log, and manifest.
- Reversible migration matters more than early integration breadth.

## Forbidden Execution

- pass/fail by prose summary alone;
- required judge verdict before calibration;
- fixture promotion without provenance;
- baseline mutation without owner approval;
- command path that cannot be replayed locally;
- closure without a matching eval artifact.

## Operating Rule

No Linear parent or milestone closes without an eval artifact that names command
evidence, artifact paths, validation outcome, drift status, and rollback status.

## Hard Block

Do not mark work complete from narrative confidence. If the command, artifact,
or validation evidence is missing, the work is blocked or needs rework.
