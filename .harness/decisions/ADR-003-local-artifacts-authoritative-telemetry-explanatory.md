# ADR-003

## Title

Local Artifacts Are Authoritative; Telemetry Is Explanatory

## Status

accepted

## Decision

Local artifact bundles are the authority for eval proof. A valid run must write
machine-readable and human-readable local evidence, including result, report,
command log, and manifest.

Telemetry, OTEL, Braintrust export, hosted dashboards, and traces may explain
runs, but they must not replace local artifacts or become the only proof path.

## Context

The project considered Braintrust recipes and OTEL logging. Observability is
useful, but the repo's core promise is replayable local evidence for agent-work
quality. Hosted traces alone are not durable proof.

## Why This Decision Exists

This decision prevents cloud-first proof, dashboard theater, and telemetry
privacy drift. Future agents may otherwise treat a trace, hosted run, or summary
as equivalent to an artifact bundle.

It compounds positively because local artifacts can be inspected, replayed,
baselined, cited in Linear closure, and used by future agents without depending
on hosted state.

## Alternatives Considered

- Use Braintrust or hosted telemetry as the system of record. Rejected because
  local/offline proof and replayability would be weaker.
- Write Markdown reports only. Rejected because reports without machine-readable
  result data are too easy to overclaim.
- Add telemetry before artifact writer. Rejected because telemetry needs stable
  run semantics to describe.

## Accepted Tradeoffs

- More local storage and artifact hygiene.
- Need to separate durable harness docs from runtime artifact output.
- Telemetry integrations arrive later.
- Reports must cite raw evidence instead of relying on dashboards.

## Anti-Drift Constraints

Must not reappear:

- cloud trace as only evidence;
- dashboard as proof;
- report without result JSON;
- missing command log;
- telemetry fields containing raw prompts, secrets, or private logs;
- artifact path not checked for existence.

Regression indicator: a run can pass without a complete local artifact bundle.

Hard block: no hosted trace, dashboard run, CI summary, mailbox text, PR comment,
or LLM-generated report may satisfy eval proof without the local artifact bundle.
Telemetry that cannot point back to local artifacts is non-authoritative noise.

## Safe Revisit Conditions

Revisit only if:

- local artifacts are still written and validated;
- hosted telemetry is a secondary mirror;
- privacy and redaction rules are enforced;
- a closure eval proves local proof did not degrade.

## Related Systems

- Future artifact writer.
- Future telemetry exporter.
- Future baseline comparator.
- .harness/refactors/stabilize-evals-executable-spine.md
- .harness/refactors/quarantine-framework-judge-telemetry-sprawl.md

## Evidence

Facts:

- The intent doctrine says artifacts decide and telemetry explains.
- The triage says artifact proof omitted is a critical risk.
- The strategy says local artifact bundles are authoritative and telemetry is
  explanatory.
- The refactor layer requires closure evals with artifact paths and command
  evidence.

Interpretation:

- Artifact authority is the trust surface of the repo.

Assumptions:

- Local artifact bundles can be small enough to keep repo operations practical.
