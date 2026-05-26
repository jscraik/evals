## Agent-Native Architecture Review

### Summary
This revised audit is largely aligned with evals phase-one doctrine: it keeps artifacts as authority, treats telemetry/modeling as advisory, preserves consumer-repo domain-truth ownership, and explicitly fences off dashboard/notebook/embedding dependencies. OPP-009 is directionally strong, but one material agent-native closure gap remains: the ledger proposal lacks an explicit command and output contract that guarantees agents can discover and run the workflow the same way users can.

### Capability Map

| UI Action | Location | Agent Tool | In Prompt? | Priority | Status |
|-----------|----------|------------|------------|----------|--------|
| Review external pattern-mining opportunities | .harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md | Local CLI (`pnpm evals ...`) | Partial | must-have | warning |
| Produce macro population insight from local artifacts | OPP-009 section | Proposed owner module (`src/lib/macro-evidence.js`) | No explicit invocation contract | must-have | warning |
| Keep readiness authority deterministic and artifact-backed | OPP-009 acceptance + Do Not Mine Yet | Existing deterministic scorer/check pipeline | Yes (doc-level) | must-have | pass |

### Findings

#### Warnings (Should Fix)
1. **Missing agent-operable invocation contract for OPP-009** -- `.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:755`, `:767-769`, `:789-796`, `:798-809` -- OPP-009 defines an owner module and acceptance criteria, but it does not define a canonical command surface (for example, a concrete `pnpm evals <subcommand>` route, output path contract, and machine-readable status codes) for generating/validating the ledger. Without this, users may run ad hoc analysis differently than agents, creating parity drift and making handoff/replay non-deterministic. Recommendation: add one explicit command contract and output schema contract for OPP-009 (including fail-closed statuses like missing artifacts/trace/scorer inputs), then reference it in acceptance criteria and `next_check`.

### Observations
1. **Doctrine fidelity is strong** -- OPP-009 correctly constrains macro analysis to local artifacts and marks optional enrichment as advisory only, with explicit bans on dashboards/notebooks/LLM/embedding authority.
2. **Ownership boundaries are mostly clean** -- The audit consistently assigns single owner modules, which reduces caller-side logic spread and supports future deterministic validation.

### What's Working Well
- The audit preserves phase-one hard blocks while still extracting practical hardening opportunities.
- The implementation packet/evidence-note contract is concrete and fail-state aware.
- OPP-009 explicitly keeps macro analysis non-authoritative and artifact-referenced, which matches evals doctrine.

### Score
- **2/3 high-priority capabilities are explicitly agent-accessible**
- **Verdict:** NEEDS WORK

WROTE: artifacts/reviews/2026-05-25-evals-router-mining-agent-native-final.md
