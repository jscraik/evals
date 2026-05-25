# JSC-373 Adversarial Review (Deep)

## Findings

### 1) High — False-ready cascade: failed critical gates can still publish `excellent` readiness

- Evidence:
  - `schemas/score-vector.schema.json:53-63` defines `readiness` fields but no coupling between `status`, `capped_by_gate`, `blocking_gates`, and `gates[*].status/severity`.
  - `schemas/score-vector.schema.json:38-51` allows `gates` entries to fail critically, but schema does not constrain readiness outcome.
  - `test/schema.test.js:194-233` validates one happy shape and one `cap_reason` min-length failure, but no contradiction tests (e.g., failed critical gate + excellent readiness).
- Failure scenario:
  1. Producer emits a score vector with at least one gate set to `{ status: "fail", severity: "critical" }`.
  2. Same payload sets `readiness.status: "excellent"`, `capped_by_gate: false`, `blocking_gates: []`.
  3. Schema validation passes because cross-field consistency is not encoded.
  4. Downstream summary/automation reads `readiness.status` as the top-line signal and reports success while critical evidence gates failed.
- Remediation:
  - Add cross-field invariants via schema structure (or validator-side semantic checks) requiring:
    - any failed critical gate => `readiness.capped_by_gate === true`
    - failed/blocked gates => non-empty `blocking_gates`
    - capped readiness => `status` cannot be `excellent|strong`.

### 2) High — Coverage inflation path: impossible ratios and mismatched status are accepted

- Evidence:
  - `schemas/score-vector.schema.json:17-20` allows `tested_claims` and `total_claims` as independent non-negative integers with no relation.
  - `schemas/score-vector.schema.json:19` allows free `coverage_status` enum without tying it to counts.
  - `test/schema.test.js:194-233` does not check contradictions such as `tested_claims > total_claims` or `coverage_status: "complete"` when totals are partial.
- Failure scenario:
  1. Producer emits `tested_claims: 50`, `total_claims: 5`, `coverage_status: "complete"`.
  2. Schema accepts this impossible state.
  3. Aggregator computes readiness with inflated coverage confidence and suppresses follow-up claims work.
  4. Program ships with under-tested claim set while evidence layer advertises complete coverage.
- Remediation:
  - Add semantic validation: `tested_claims <= total_claims`; `coverage_status` derived from counts (`none|partial|complete`) rather than producer-declared free text.

### 3) Medium — Claim identity/provenance ambiguity: duplicate claim IDs and inverted spans validate

- Evidence:
  - `schemas/claim-registry.schema.json:22-76` does not enforce uniqueness of `claims[*].claim_id`.
  - `schemas/claim-registry.schema.json:56-57` requires positive `start_line/end_line` but does not require `end_line >= start_line`.
  - `schemas/eval-case.schema.json:87-90` allows `metadata.claim_ids` to reference claim IDs, creating a join surface without uniqueness guarantees in registry.
- Failure scenario:
  1. Registry contains two entries with same `claim_id` and conflicting `status/criticality`.
  2. Eval case references that `claim_id`.
  3. Consumer joins by ID and picks first/last match depending on implementation order, yielding nondeterministic readiness.
  4. If a claim span is inverted (end before start), provenance links become non-actionable while still validating.
- Remediation:
  - Enforce per-registry claim ID uniqueness (schema or semantic check).
  - Enforce span ordering constraint (`end_line >= start_line`).

## Residual Risks

- Optional artifact types (`claim-registry`, `score-vector`, `benchmark-summary`) are intentionally open in result/manifest schemas; without a companion semantic gate, consumers may over-trust presence/labels instead of validating internal consistency.
- Tests currently prove representability, not contradiction resistance. This leaves room for internally inconsistent but schema-valid payloads.

## Testing Gaps

- Missing negative tests for contradictory gate/readiness combinations.
- Missing negative tests for impossible coverage math and status mismatch.
- Missing negative tests for duplicate `claim_id` and inverted source spans.

WROTE: artifacts/reviews/jsc-373-adversarial-reviewer.md

