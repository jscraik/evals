## Agent-Native Architecture Review

### Summary
This repository is a CLI-first evals runtime (no GUI), and JSC-370 strengthens the shared proof surface by validating latest-run context before trusting artifacts. Agents and users both operate through the same repository artifacts and CLI commands, so action/context parity is mostly preserved for the scope reviewed. One resilience gap remains: context-mismatch recovery guidance is hard-coded to a single smoke command path.

### Capability Map

| UI Action | Location | Agent Tool | In Prompt? | Priority | Status |
|-----------|----------|------------|------------|----------|--------|
| Run smoke case and publish latest bundle | src/commands/run.js | Shell command: `pnpm evals run fixtures/smoke/pr-closeout.case.json --json` | N/A (CLI contract in repo docs) | Must-have | Accessible |
| Validate latest pointer and artifact integrity | src/commands/validation.js:81 | Shell command: `pnpm evals check --json` | N/A (CLI contract in repo docs) | Must-have | Accessible |
| Compare expected smoke proof context vs latest context | src/commands/validation.js:86-99 + src/lib/latest-run.js:58-75 | Shell command: `pnpm evals check --json` | N/A (JSON output fields) | Must-have | Accessible |
| Discover machine-usable latest artifact paths | schemas/latest-run.schema.json + src/lib/latest-run.js:77-92 | Shell command: `pnpm evals state --json` / `check --json` | N/A (schema + JSON outputs) | Must-have | Accessible |

### Findings

#### Critical (Must Fix)
1. None.

#### Warnings (Should Fix)
1. **Hard-coded recovery command can drift from real suite entrypoint** -- `src/lib/latest-run.js:11`, `src/lib/latest-run.js:177` -- On proof-context mismatch, `recovery_command` always returns `pnpm evals run fixtures/smoke/pr-closeout.case.json --json`. If fixture location or canonical smoke case changes, agents receive stale remediation guidance even when mismatch detection is correct. Recommendation: derive recovery command from the expected-context caller input in `checkCommand` (or pass the smoke path explicitly), while preserving deterministic phase-one defaults.
Validation ownership: introduced by current patch.

#### Observations
1. **Parity through shared CLI surface is strong for this slice** -- `src/commands/validation.js:81-107`, `src/lib/latest-run.js:126-133`, `test/cli.test.js:180-201` -- The same command humans run (`check --json`) now emits expected/observed context, mismatch reason, and recovery command; this is machine-usable and closes stale-latest false-success risk for agents.
2. **Publication ordering preserves shared trust boundary** -- `src/commands/run.js:269-319` -- Latest pointer is written only after candidate validation and final bundle validation, reducing silent divergence between what users inspect and what agents consume.
3. **No phase-one authority boundary violations observed** -- reviewed files and JSC-370 packet preserve deterministic local artifacts and avoid telemetry/prose authority.

### What's Working Well
- JSC-370 centers the trust boundary in one owner module (`latest-run`) instead of scattering caller logic.
- The context mismatch test is explicit and verifies fail-fast behavior before artifact trust (`test/cli.test.js:180-201`).
- Run-bundle allocation introduces deterministic collision handling with an atomic mkdir seam (`src/lib/run-bundle.js:14-41`, `test/cli.test.js:69-92`).

### Score
- **4/4 high-priority capabilities are agent-accessible**
- **Verdict:** PASS

WROTE: artifacts/reviews/jsc-370-agent-native-reviewer.md
