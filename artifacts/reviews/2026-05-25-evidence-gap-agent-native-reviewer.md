## Agent-Native Architecture Review

### Summary
This repository is a deterministic local eval CLI with strong artifact contracts and comprehensive validation coverage, and it is largely agent-operable through explicit commands (`run`, `check`, `state`, `validate`, `verify`). The highest-risk remaining gaps are in runtime-evidence enforcement breadth and readiness signaling: several declared policy families are intentionally scaffolded but still permit a global `ready` state, and dirty git state is surfaced but not included in readiness verdict gating. Overall parity is good for core phase-one flows, but closure confidence can be overstated for agent handoff scenarios.

### Capability Map

| UI Action | Location | Agent Tool | In Prompt? | Priority | Status |
|-----------|----------|------------|------------|----------|--------|
| Run smoke fixture and produce artifact bundle | src/commands/run.js | `pnpm evals run ...` CLI command | Yes (README/AGENTS command contracts) | Must | implemented_enforced |
| Validate latest run, schemas, hashes, trace timeline | src/commands/validation.js, src/lib/latest-run.js | `pnpm evals check --json` / `validate` | Yes | Must | implemented_enforced |
| Query current runtime state packet | src/commands/state.js, src/lib/runtime-state.js | `pnpm evals state --json` | Yes | Must | implemented_enforced |
| Verify CI-equivalent deterministic gate | scripts/verify.js | `pnpm verify` | Yes | Must | implemented_enforced |
| Enforce all declared runtime policy families as gating | src/lib/runtime-evidence-contract.js | Runtime-evidence scorers | Partially | Should | partial |
| Include git cleanliness in readiness verdict | src/lib/claim-evidence-contract.js | Runtime evidence packet/readiness verdict | No hard gate | Should | implemented_not_enforced |

### Findings

#### Critical (Must Fix)
1. **None discovered in current phase-one scope** -- core run/check/state/verify command paths are implemented and validated by passing tests and live command execution.

#### Warnings (Should Fix)
1. **Readiness can report `ready` while declared policy families remain scaffolded (not enforced)** -- `src/lib/runtime-evidence-contract.js:34-60`, `src/lib/runtime-evidence-contract.js:248-256`, `fixtures/runtime-evidence/approval-disabled-readonly-fallback.case.json:45-61`, `src/lib/runtime-state.js:108-136`.
   Runtime status classification: `partial`.
   Description: Goal/thread/network/package provenance policy families are accepted as `scaffolded_not_enforced` and do not produce policy coverage errors, allowing runtime evidence health to stay `ready`, which then allows top-level runtime state `ready`.
   Recommendation: Add an explicit enforcement floor for agent-ready closure contexts, e.g. either:
   - degrade runtime state to `stale` when any declared family is scaffolded; or
   - add a separate `agent_native_readiness` field that fails when scaffolded families are present.
   Validation method:
   - Add a fixture declaring scaffolded families and assert new degraded/readiness-fail behavior in `pnpm evals state --json`.
   - Run `pnpm test` and verify a dedicated assertion for this gate.

2. **Readiness verdict ignores dirty git state for handoff quality** -- `src/lib/claim-evidence-contract.js:234-253`, `src/lib/claim-evidence-contract.js:178-205`.
   Runtime status classification: `implemented_not_enforced`.
   Description: `git_state.dirty` is collected and emitted but not considered in `readiness_verdict`; a workspace can be reported pass-ready despite uncommitted drift, which weakens agent handoff trust when artifact evidence is expected to map cleanly to repo state.
   Recommendation: Introduce an optional strict mode (or default gate for closure contexts) that marks readiness `fail` when `git_state.status=available` and `dirty=true`.
   Validation method:
   - Add test coverage for both clean and dirty scenarios.
   - Verify `pnpm evals state --json` includes blocking field when strict mode is enabled.

#### Observations
1. **No embedded LLM/tool-calling stack exists in this repo, but CLI surfaces provide practical action parity for agents** -- `src/cli.js`, `README.md` command contract sections.
   Runtime status classification: `implemented_enforced`.
   Suggestion: If this repo is expected to integrate into broader agent orchestration, publish a small machine-readable command capability manifest to reduce discovery ambiguity for external coordinators.

2. **Local Memory mandatory bootstrap/search workflow is blocked in this sandbox** -- local command output showed PID write failure at `~/.local-memory/local-memory.pid`.
   Runtime status classification: `blocked_runtime`.
   Suggestion: treat this as environment/tooling failure, not repo runtime drift; unblock by granting write access to the Local Memory home path or adjusting its PID location.

### What's Working Well
- Strong deterministic gate discipline: `pnpm test` passed (137/137), and run/check/state paths produce schema-backed evidence consistently.
- Path-boundary and artifact-hash hardening are robust and well-tested (`latest` pointer containment, manifest hash verification, trace timeline invariants).
- Runtime evidence policy coverage already distinguishes `implemented_enforced` vs `scaffolded_not_enforced`, which is a good foundation for the next enforcement step.

### Score
- **4/6 high-priority capabilities are fully agent-accessible/enforced**
- **Verdict:** NEEDS WORK

WROTE: artifacts/reviews/2026-05-25-evidence-gap-agent-native-reviewer.md
