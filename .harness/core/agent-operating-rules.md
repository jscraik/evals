# Future Agent Operating Rules

## Start Here

1. Ask what local artifact proof the change improves.
2. If none, stop or defer.
3. Preserve the ADRs unless writing a superseding ADR with evidence.
4. Keep work inside the smallest active initiative.

## Optimize For

- local proof;
- deterministic execution;
- artifact integrity;
- baseline comparison;
- repo-local ownership;
- low context load;
- reversible migration;
- eval-backed closure.

## Avoid

- framework shopping;
- dashboard-first work;
- cloud-only proof;
- plugin architecture before need;
- judge gates before calibration;
- prompt-library accumulation;
- generic scoring;
- broad Linear issue sets.

## Safe To Change

- implementation internals;
- report wording;
- adapter internals after the spine works;
- telemetry exporter details after local trace exists;
- docs layout when command and contracts stay clear.

## Human Review Required

- schema authority changes;
- artifact authority changes;
- baseline promotion semantics;
- fixture privacy/provenance changes;
- required-gate policy changes;
- judge promotion;
- moving suite truth between repos.

## Closure Rule

No work is done because it sounds strategically aligned. It is done when local
artifacts prove it and the relevant invariant still holds.

## Hard Block

Do not expand scope to look productive. If the executable spine is not producing
trusted artifacts yet, almost every integration idea is premature.
