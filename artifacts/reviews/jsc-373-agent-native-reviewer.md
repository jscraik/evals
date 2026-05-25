## Agent-Native Architecture Review

### Summary
This repo is a CLI-first eval contract system, and this patch closes the earlier parity gap by adding a first-class agent-invokable schema validation command for proof contracts. The new claim-registry and score-vector contracts are now discoverable in help/docs, executable via CLI, and validated with both schema and semantic checks. Agent-native parity for this slice is now in good shape.

### Capability Map

| UI Action | Location | Agent Tool | In Prompt? | Priority | Status |
|-----------|----------|------------|------------|----------|--------|
| Discover proof-contract validation command | src/cli.js:13-19 | `pnpm evals --help` | N/A (CLI) | should-have | pass |
| Validate claim registry contract file | src/cli.js:33, src/commands/validation.js:76-95 | `pnpm evals validate-schema claim-registry <json-file> --json` | N/A (CLI) | must-have | pass |
| Validate score vector contract file | src/cli.js:33, src/commands/validation.js:76-95 | `pnpm evals validate-schema score-vector <json-file> --json` | N/A (CLI) | must-have | pass |
| Enforce semantic invariants beyond shape-only schema checks | src/lib/proof-contract-validation.js:42-119 | `validateProofContractFile` via CLI command | N/A (CLI) | should-have | pass |
| Provide machine-checkable regression proof for command behavior | test/cli.test.js:1695-1754, test/schema.test.js:193-277 | `pnpm test` | N/A (CLI) | must-have | pass |
| Document canonical usage for agents and users | README.md:39-49, README.md:170 | README command contract | N/A (CLI) | should-have | pass |

### Findings

#### Critical (Must Fix)
None.

#### Warnings (Should Fix)
None.

#### Observations
1. **Semantic invariants are intentionally local and bounded** -- src/lib/proof-contract-validation.js:42-119. This is a good fit for phase-one, but future cross-file or run-bundle consistency checks may still need explicit expansion if proof contracts become closure gates.
2. **Alias support includes both hyphenated and camelCase keys internally** -- src/lib/proof-contract-validation.js:5-30. Public docs correctly keep the canonical hyphenated keys; retaining that boundary helps avoid capability drift.

### What's Working Well
- The new command is first-class in usage output and dispatch (`validate-schema`), which restores action parity for these contracts.
- Proof contracts are validated as file-backed artifacts with structured JSON output, preserving shared workspace inspectability.
- Tests prove failure semantics for contract and gate logic, not just parse success.
- README now makes the command discoverable as part of the canonical operator flow.

### Score
- **6/6 high-priority capabilities are agent-accessible**
- **Verdict:** PASS

WROTE: artifacts/reviews/jsc-373-agent-native-reviewer.md
