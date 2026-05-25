# JSC-372 Deep Module Fix Packet: Claim/Evidence Runtime Packet

## Source

- Slice: JSC-372
- Evidence requirements: SA-009, SA-010, SA-011, SA-012, SA-020 from the proof-spine suite contract plan/spec.
- Governing doctrine: evals owns proof contracts, schemas, deterministic scoring, runtime evidence packet shape, and closure evidence. Consumer repos own domain truth.

## Owner Modules

- `src/lib/claim-evidence-contract.js` owns claim/evidence validation semantics, runtime evidence packet assembly, and the deterministic `missing-evidence` scorer.
- `src/lib/runtime-state.js` remains the public runtime state packet publisher for `pnpm evals state --json` and may embed the claim/evidence packet produced by the owner module.
- `src/lib/runtime-evidence-contract.js` remains the owner for runtime-evidence family enforcement and `scaffolded_not_enforced` classification.
- `src/lib/schema.js` remains the schema target registry and validation entrypoint.

## Public Interface

- `buildRuntimeEvidencePacket(context)` returns a schema-backed, domain-neutral packet with repo state, git state, blockers, recommended commands, validation evidence, runtime-evidence contract health, claims, evidence, and a missing-evidence scorer result.
- `scoreMissingEvidence(claims, evidence)` returns a deterministic scorer result that fails success claims whose required evidence is absent or unusable.
- `pnpm evals state --json` exposes the packet additively under `evidence_packet`.

## Hidden Implementation Rule

Callers must not decide whether a claim is proven by inspecting paths, prose, telemetry, model confidence, PR comments, Linear comments, or session summaries. They pass facts into `claim-evidence-contract`; the module decides whether required evidence exists. Advisory confidence can be recorded but cannot affect the verdict.

Artifact-existence claims require integrity evidence from a manifest/hash when artifact integrity is asserted. Runtime-evidence policy families that are scaffolded remain `scaffolded_not_enforced` unless `runtime-evidence-contract` adds an enforcing scorer and regression fixture.

## Caller Contract

- Runtime callers provide local facts only: latest pointer status, artifact states, validation status/errors, runtime-evidence health, and recommended commands.
- CLI commands do not reimplement claim/evidence matching.
- Public JSON changes are additive for phase one.

## Seam Tests

- A `validation-passed` claim without matching validation evidence fails `missing-evidence`.
- An `artifact-exists` claim without manifest/hash evidence fails `missing-evidence`.
- `pnpm evals state --json` emits a schema-valid packet with claim/evidence fields.
- Runtime-evidence scaffolded families remain classified as `scaffolded_not_enforced` in state/check output.

## Tracer Proof

- `state --json` includes `evidence_packet.missing_evidence_scorer` and `evidence_packet.runtime_evidence_contract_health`.
- `check --json` continues to expose `runtime_evidence.policy_coverage`, preserving scaffolded/enforced family truth.

## Rollback Path

Revert the JSC-372 commit. The pre-existing runtime state packet, runtime-evidence fixtures, latest validation, and suite contract remain usable because the packet is additive and no phase-one hard block is introduced.

## Validation Gate

- Narrow: `pnpm test -- --test-name-pattern "missing-evidence|runtime evidence packet|scaffolded_not_enforced"`
- Required slice gate: `pnpm test`
- Runtime packet gate: `pnpm evals state --json`
- Latest/check gate: `pnpm evals check --json`
- Aggregate gate: `pnpm verify`
