# Governance Invariants

## Proven Invariants

- Governance exists to protect proof, not to create ceremony.
- Governance rules should become schemas, validators, tests, or short ADRs.
- ADRs protect only expensive-to-reverse decisions.
- Process complexity is architectural debt unless it improves execution.
- Strategy documents are not runtime authority.

## Strategic Assumptions

- This repo is at high risk of governance-heavy, implementation-light drift.
- Small enforceable rules beat broad policy surfaces.

## Forbidden Governance

- governance expansion that does not become a check;
- review layers without routing or execution impact;
- compatibility paths without sunset condition;
- ADR spam for tactical implementation details;
- process that outranks observed local execution.

## Operating Rule

Governance must reduce ambiguity. If it increases context load without adding a
validator, schema, eval, or protected decision, remove or defer it.

## Hard Block

Do not add governance to compensate for missing execution. Build the check,
schema, artifact, or eval instead.
