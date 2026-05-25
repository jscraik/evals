## Agent-Native Architecture Review

### Summary
This slice adds agent-operable proof primitives rather than workflow prose: claim/evidence schemas, a deterministic missing-evidence scorer, and additive runtime evidence packet exposure via `state --json`. The implementation is mostly aligned with agent-native parity because the same machine-verifiable evidence used by users is exposed to agents in shared runtime state, with scaffolded policy families explicitly classified instead of silently treated as enforced.

### Capability Map

| UI Action | Location | Agent Tool | In Prompt? | Priority | Status |
|-----------|----------|------------|------------|----------|--------|
| Run eval + produce artifact bundle | src/cli.js (covered by tests at test/cli.test.js:163) | CLI command `pnpm evals run ... --json` | N/A (CLI surface) | Must-have | Accessible |
| Validate latest bundle deterministically | test/cli.test.js:215 | CLI command `pnpm evals check --json` | N/A (CLI surface) | Must-have | Accessible |
| Inspect runtime readiness and blockers | src/lib/runtime-state.js:22 | CLI command `pnpm evals state --json` | N/A (CLI surface) | Must-have | Accessible |
| Verify claim/evidence sufficiency | src/lib/claim-evidence-contract.js:15 | `scoreMissingEvidence(...)` in runtime packet | N/A (data contract) | Must-have | Accessible |
| See scaffolded vs enforced runtime-evidence policies | src/lib/runtime-state.js:139, schemas/runtime-state.schema.json:88 | state/check JSON output with policy coverage family statuses | N/A (data contract) | Should-have | Accessible |

### Findings

#### Critical (Must Fix)
No blocking findings.

#### Warnings (Should Fix)
1. **Error evidence can be under-specified for agents when latest pointer is absent** -- `src/lib/runtime-state.js:61`, `src/lib/claim-evidence-contract.js:145` -- In the no-latest path, validation is set to `not_run` with empty errors, while packet blockers only include a generic reason fallback (`runtime state is not ready`) if no validation error exists. This is valid but can reduce deterministic diagnosability for autonomous retries. Recommendation: include a canonical blocker detail for `latest_missing` (for example explicit missing path + next command) even when validation has no error entries.

#### Observations
1. **Strong agent-native shared workspace behavior is present** -- Runtime packet paths are repository-relative and tie evidence to local artifacts and manifest hashes (`src/lib/claim-evidence-contract.js:121-133`, `test/cli.test.js:64-70`), which keeps agent/user observability in the same data space.
2. **Scaffolded-family honesty is preserved** -- Policy coverage explicitly permits `scaffolded_not_enforced` while still failing closed on missing coverage declarations (`schemas/runtime-evidence-packet.schema.json:105`, `test/cli.test.js:1280`), reducing hidden manual-only assumptions.

### What's Working Well
- Deterministic primitive design: `scoreMissingEvidence` fails claims based on explicit required evidence presence and usable status (`src/lib/claim-evidence-contract.js:15-46`).
- Additive public interface: runtime evidence packet is embedded without replacing existing state contract (`src/lib/runtime-state.js:216-230`).
- Schema discoverability: new claim/evidence/runtime packet schemas are registered in shared schema targets (`src/lib/schema.js:35-49`), improving machine validation parity for future agents.

### Score
- **5/5 high-priority capabilities are agent-accessible**
- **Verdict:** PASS

### Eval-Report Closure Fields
- **eval_report_status:** pass_with_minor_warning
- **agent_native_readiness:** ready
- **capability_map_delta:** Added claim/evidence packet primitives and missing-evidence scorer visibility to runtime state output.
- **runtime_visibility_evidence:** `state --json` packet includes `claims`, `evidence`, `missing_evidence_scorer`, and `runtime_evidence_contract_health` (`src/lib/claim-evidence-contract.js:149-173`, `src/lib/runtime-state.js:216-230`), validated in tests (`test/cli.test.js:405-429`).
- **blocking_agent_gaps:** none
- **recommended_completion_state:** ready_to_close_after_optional_blocker-message-tightening
- **confidence:** 89
- **residual_risk:** Low risk of nondeterministic diagnosis wording when latest pointer is missing; functional parity remains intact.

WROTE: artifacts/reviews/jsc-372-agent-native-reviewer.md
