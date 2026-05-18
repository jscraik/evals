# Evals Architectural Decisions

Date: 2026-05-18
Repository: /Users/jamiecraik/dev/evals
Status: ADR index and decision compression

## Inputs Read

- .harness/features/2026-05-18-evals-intent.md
- .harness/review/2026-05-18-evals-architecture-review.md
- .harness/triage/2026-05-18-evals-triage.md
- .harness/strategy/2026-05-18-evals-strategy.md
- .harness/refactors/stabilize-evals-executable-spine.md
- .harness/refactors/preserve-repo-local-suite-boundaries.md
- .harness/refactors/quarantine-framework-judge-telemetry-sprawl.md

No .harness/core/*.md files existed at generation time.

## Decision Set

Generate six ADRs:

1. ADR-001-executable-spine-before-expansion.md
   The repo must build a local executable spine before adapters, dashboards,
   telemetry exporters, cloud workflows, or judge gates.

2. ADR-002-canonical-result-schema-and-adapter-boundary.md
   The canonical eval schema belongs to this repo. External frameworks are
   adapters and cannot define core result shape.

3. ADR-003-local-artifacts-authoritative-telemetry-explanatory.md
   Local artifact bundles decide. Telemetry explains and must remain optional
   for proof.

4. ADR-004-repo-local-suites-own-domain-truth.md
   The shared evals repo owns mechanics. Consuming repos own suite truth.

5. ADR-005-llm-judges-advisory-until-calibrated.md
   LLM judges may advise, but cannot become required gates until calibrated.

6. ADR-006-fixture-provenance-privacy-and-holdout-policy.md
   Real fixtures need provenance, privacy, redaction, and promotion metadata
   before they can become trusted eval inputs.

## Non-Decisions

- Runtime language is not decided here.
- Package manager details are not decided here.
- Dashboard design is not decided here.
- Specific external framework adapters are not decided here.
- Linear objects are not created here.

## Operating Rule

Future agents should load this decision index before adding new eval
infrastructure. If a change reverses one of these ADRs, it needs explicit human
review and a superseding ADR.

## Ruthless Enforcement Notes

These ADRs are intended to block attractive wrong work, not merely document
preference.

Blocked until executable proof exists:

- dashboard or web UI;
- Braintrust, OpenAI Evals, DeepEval, AutoEvals, FastEval, OpenEvals, or
  OpenEvals-derived canonical schemas;
- required LLM judge gates;
- plugin architecture;
- cloud-only runner;
- broad source-mining automation;
- universal agent score;
- generic dataset registry.

Allowed early only when directly strengthening the executable spine:

- schemas;
- local runner;
- artifact writer;
- deterministic scorers;
- baseline comparator;
- smoke fixture;
- minimal README and AGENTS operating surface.
