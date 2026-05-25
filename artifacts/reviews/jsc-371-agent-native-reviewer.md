## Agent-Native Architecture Review

### Summary
This slice adds repo-local suite execution to a CLI-driven evals spine (`run <suite.json>`), with strong path and policy hardening plus clear artifact-root ownership. However, the codebase still has no explicit agent integration surface (no tool registry, no dynamic system prompt, no LLM runtime/tool wiring), so user-facing capabilities are exposed only through CLI paths and remain undiscoverable to non-shell-integrated agents.

### Capability Map

| UI Action | Location | Agent Tool | In Prompt? | Priority | Status |
|-----------|----------|------------|------------|----------|--------|
| Run single eval case | src/cli.js:15, src/commands/run.js:423 | None (CLI-only command path) | No | Must have | Gap |
| Run repo-local suite | src/cli.js:15, src/commands/run.js:378 | None (CLI-only command path) | No | Must have | Gap |
| Validate case/latest | src/cli.js:16, src/commands/validation.js | None (CLI-only command path) | No | Should have | Gap |
| Check latest artifact bundle | src/cli.js:17, src/commands/validation.js | None (CLI-only command path) | No | Should have | Gap |
| Inspect runtime state | src/cli.js:18, src/commands/state.js | None (CLI-only command path) | No | Should have | Gap |

### Findings

#### Critical (Must Fix)
1. **No explicit agent integration surface for core eval actions** -- `src/cli.js:15`, `src/commands/run.js:378`, `src/commands/run.js:423` -- The new suite action is user-accessible via CLI, but the repository still exposes no registered agent tools or runtime capability contract. Per agent-native parity, core domain actions (run case or suite, validate/check/state) should be explicitly addressable by agent interfaces rather than only by implicit shell execution assumptions. Fix: add a first-class agent action surface (tool definitions or MCP-compatible command contract) for run/validate/check/state, and bind it to the same deep modules already used by CLI handlers.

#### Warnings (Should Fix)
1. **Capability discoverability and context injection are absent** -- `src/cli.js:12-19`, `src/lib/suite-contract.js:49-52` -- Capabilities exist, but only through CLI usage text. There is no machine-readable capability map or runtime-injected context describing available eval resources and suites to an agent runtime. Recommendation: publish a lightweight capability descriptor (command + args + artifacts + failure classes) and include it in any agent prompt/runtime surface.

### Observations
1. **Deep-module ownership boundaries are preserved well in this slice** -- `src/lib/suite-contract.js:17-39`, `src/lib/run-bundle.js:16-50`, `src/lib/latest-run.js:39-143` keep suite loading, artifact allocation, and latest validation separated and composable.
2. **Shared workspace behavior is strong** -- `src/commands/run.js:390-407` and tests at `test/cli.test.js:235-251` verify suite execution writes artifacts into the evaluated repo, avoiding agent/user workspace divergence.

### What's Working Well
- Suite policy guardrails are fail-closed for phase-one network and executable scorer hooks (`src/lib/suite-contract.js:41-46`, `src/lib/suite-contract.js:76-90`).
- Path containment primitives are reused instead of reimplemented (`src/lib/paths.js:52-99`, `src/lib/case-contract.js:77`, `src/lib/latest-run.js:43-44`).
- New tests cover evaluated-repo artifact rooting and traversal rejection (`test/cli.test.js:235-260`).

### Score
- **0/5 high-priority capabilities are explicitly agent-accessible (via declared agent tool surface)**
- **Verdict:** NEEDS WORK

WROTE: artifacts/reviews/jsc-371-agent-native-reviewer.md
