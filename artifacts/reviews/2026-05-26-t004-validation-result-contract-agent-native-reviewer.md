## Agent-Native Architecture Review

### Summary
This slice has agent integration and parity for the validate/check JSON contract: `pnpm evals check --json` and `pnpm evals check --smoke --json` now emit envelopes that are backed by a registered schema target (`validationResult`), and tests validate representative command output against that schema. For T004, high-priority agent-facing capabilities are accessible and machine-consumable without prose-only interpretation.

### Capability Map

| UI Action | Location | Agent Tool | In Prompt? | Priority | Status |
|-----------|----------|------------|------------|----------|--------|
| Run permissive latest validation | `src/commands/validation.js` | `pnpm evals check --json` | Yes (README/AGENTS command contract) | must-have | accessible |
| Run strict smoke-context validation | `src/commands/validation.js` | `pnpm evals check --smoke --json` | Yes (README/AGENTS command contract) | must-have | accessible |
| Validate output envelope deterministically | `schemas/validation-result.schema.json` | `schemaCheckFromObject("validationResult", ...)` | Yes (schema target + tests) | must-have | accessible |
| Discover validation schema target | `src/lib/schema.js` | `schemaTargets.validationResult` | Implicit via schema tooling/tests | should-have | accessible |

### Findings

#### Critical (Must Fix)
None.

#### Warnings (Should Fix)
None.

#### Observations
1. The policy-coverage family shape is now explicit in both top-level runtime evidence and per-check coverage entries, including required keys and bounded `enforcement_status` enums, which closes the previous agent-consumption ambiguity.
   - `schemas/validation-result.schema.json:45`
   - `schemas/validation-result.schema.json:97`
2. Additive top-level compatibility remains preserved (future-compatible root envelope), while still enforcing required core fields and key enum constraints.
   - `schemas/validation-result.schema.json:6`
   - `test/schema.test.js:210`

### What's Working Well
- The `validationResult` schema target is centrally registered, so agents can discover it from one canonical map.
- Runtime output is contract-tested in both schema and CLI tests, reducing drift between emitted JSON and declared contract.
- Check-mode context fields (`check_mode`, expected/observed context, recovery hints) are included in the machine-readable envelope for downstream automation.

### Score
- **4/4 high-priority capabilities are agent-accessible**
- **Verdict:** PASS

WROTE: artifacts/reviews/2026-05-26-t004-validation-result-contract-agent-native-reviewer.md
