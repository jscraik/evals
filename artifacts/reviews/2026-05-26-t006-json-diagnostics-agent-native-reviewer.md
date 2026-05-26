## Agent-Native Architecture Review

### Summary
This repository exposes eval runtime actions primarily through CLI commands rather than an interactive product UI, and the T006 slice tightens shared JSON parsing so agents and humans receive the same deterministic diagnostics when artifact JSON is malformed or ambiguous. The final patch keeps action/context parity intact for this slice: duplicate-key failures surface through the same JSON output envelopes consumed by automation, and the added parser seam tests close the main regression risk around escape-decoded collisions and nested object scope.

### Capability Map

| UI Action | Location | Agent Tool | In Prompt? | Priority | Status |
|-----------|----------|------------|------------|----------|--------|
| Run canonical smoke eval (`pnpm evals run ... --json`) | `src/cli.js` command surface + `test/cli.test.js` integration coverage | Shell command execution via agent runtime | Yes (documented in AGENTS/README command contract) | Must have | Covered |
| Validate latest packet and artifacts (`pnpm evals check --json`) | `src/cli.js`, `src/lib/latest-run.js`, `src/lib/json.js` | Shell command execution via agent runtime | Yes (validation contract docs) | Must have | Covered |
| Read and classify runtime state (`pnpm evals state --json`) | `src/cli.js`, `src/lib/runtime-state.js`, `src/lib/json.js` | Shell command execution via agent runtime | Yes (validation + closure docs) | Should have | Covered |
| Diagnose malformed JSON inputs with exact failure class/path | `src/lib/json.js:35-43`, `src/lib/json.js:60-64`, callsites in `case-contract` + `trace-events` | Shared parser primitive used by all command paths | Yes (deep-module packet + test evidence) | Must have | Covered |
| Regression-proof duplicate-key detection across escaped keys and nested ownership | `test/json.test.js:6-22` | Deterministic test gate (`pnpm test`) | Yes (CI/verify contracts) | Must have | Covered |

### Findings

#### Critical (Must Fix)
1. None.

#### Warnings (Should Fix)
1. None.

#### Observations
1. **Residual parser-boundary risk** -- `src/lib/json.js:66-143`
The scanner is intentionally a lightweight JSON-token pass, not a full grammar validator; safety is currently preserved because `JSON.parse` still owns syntax validity and tests now cover escaped-key and nested-scope behavior. Recommendation: keep adding narrow seam tests whenever new failure classes are discovered in real artifacts (especially around string escape edge cases) so the scanner contract stays explicit and auditable.

### What's Working Well
- Shared parser ownership is centralized and reused at trust boundaries (`readJson`/`parseJson`), preventing drift between case, trace, and latest validation paths.
- Error text remains path-qualified and action-oriented, which preserves agent diagnosability in JSON-mode command outputs.
- New tests in `test/json.test.js` directly exercise the highest-risk duplicate-key correctness cases and are now part of the default deterministic gate.

### Score
- **5/5 high-priority capabilities are agent-accessible**
- **Verdict:** PASS

WROTE: artifacts/reviews/2026-05-26-t006-json-diagnostics-agent-native-reviewer.md
