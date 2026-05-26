## Agent-Native Architecture Review

### Summary
This is a CLI-first evals runtime where both human and agent actions are command-surface actions (`pnpm evals ...`). For the T003 slice, agent-native parity is strong: the new check mode split (`observed-latest` vs `smoke-context`) is exposed on the same public CLI surface that a human uses, implemented in shared validation primitives, and documented for discoverability. I found no high-priority user-only action introduced by this change.

### Capability Map

| UI Action | Location | Agent Tool | In Prompt? | Priority | Status |
|-----------|----------|------------|------------|----------|--------|
| Run latest integrity check (`pnpm evals check --json`) | src/cli.js:36, src/commands/validation.js:107 | CLI command (`checkCommand`) | Yes (AGENTS/README command contract) | Must have | Covered |
| Run strict smoke-bound integrity check (`pnpm evals check --smoke --json`) | src/cli.js:29, src/cli.js:32, src/commands/validation.js:111 | CLI flag route to `checkCommand(..., { smokeContext: true })` | Yes (README + AGENTS validation contract) | Must have | Covered |
| Validate latest run internals and context match semantics | src/lib/latest-run.js:39, src/lib/latest-run.js:84 | Shared library primitive (`validateLatestRun`) | Indirectly via CLI + docs | Must have | Covered |
| Enforce CI gate smoke-context verification path | scripts/verify.js, AGENTS.md:147-152 | CI script primitive + CLI | Yes (AGENTS validation section) | Must have | Covered |

### Findings

#### Critical (Must Fix)
1. None.

#### Warnings (Should Fix)
1. None.

#### Observations
1. **Discoverability asymmetry remains docs-dependent** -- `pnpm evals check --json` now emits `strict_smoke_command`, which is good for machine discoverability, but the primary runtime switch remains a CLI flag users or agents must already know (`--smoke`). Consider preserving this by adding or keeping explicit examples in command help and docs whenever further check modes are added.

### What's Working Well
- The `--smoke` route is implemented as a narrow extension to the existing primitive (`checkCommand`) rather than a separate workflow tool, preserving composability.
- Context binding logic (`expected_context`, `observed_latest_context`, `context_match`, `context_mismatch_reason`) is returned in machine-readable JSON, enabling agent verification and recovery workflows without hidden manual interpretation.
- The validation contract is synchronized across implementation and governance docs (`README.md`, `AGENTS.md`), reducing capability hiding risk.
- Tests cover both permissive observed-latest and strict smoke-context modes on the same command surface, which supports reliable agent execution parity.

### Score
- **4/4 high-priority capabilities are agent-accessible**
- **Verdict:** PASS

WROTE: artifacts/reviews/2026-05-26-t003-check-state-semantics-agent-native-reviewer.md
