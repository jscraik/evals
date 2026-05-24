# Evals Proof-Spine AGENTS.md Review

STATUS: pass_with_follow_up

## Scope

Reviewed AGENTS.md as the active instruction surface for the evals repository and checked whether it still matches the governed proof-spine implementation model.

## Findings

### No blocking AGENTS.md contradiction found

- Evidence:
  - AGENTS.md mission says evals owns shared runner mechanics, schemas, artifact bundles, deterministic scorer contracts, baseline result shape, and closure evidence while consuming repositories own suite intent and domain truth.
  - AGENTS.md preserves phase-one hard blocks against dashboards, external adapters, cloud runners, plugin systems, source mining, required LLM judge gates, and runtime dependencies on sibling repos.
  - AGENTS.md requires deep module fix mechanics before changing runner, schema, validation, artifact, baseline, trace, state, or governance mechanics.
  - AGENTS.md requires parent/child loop reconciliation before program closeout.
- Impact:
  - The JSC-370 through JSC-372 implementation model is consistent with AGENTS.md.

### Follow-up: AGENTS.md does not name the new May 24 schemas explicitly

- Evidence:
  - AGENTS.md names the general ownership contract and validation commands, but not `suite.schema.json`, `claim.schema.json`, `evidence.schema.json`, or `runtime-evidence-packet.schema.json`.
- Impact:
  - This is not a contradiction because AGENTS.md is intentionally a durable instruction surface, not a schema inventory. A future docs pass may mention the new schema families if they become part of the default contributor workflow.
- Remediation:
  - No immediate AGENTS.md patch required before parent reconciliation. Revisit after stacked PRs merge.

## Validation Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Instruction discovery | pass | `find . -name AGENTS.md -print` returned only `./AGENTS.md` in the JSC-369 worktree. |
| Command contract | pass | AGENTS.md lines found for `pnpm evals run ... --json`, `pnpm evals state --json`, `pnpm evals check --json`, and `pnpm verify`. |
| Parent/child guardrail | pass | AGENTS.md contains the parent queue reconciliation rule and child-loop non-closure rule. |
| Hard-block alignment | pass | AGENTS.md contains phase-one hard blocks matching the current implementation constraints. |

## Recommendation

AGENTS.md remains accurate enough for JSC-369. Do not expand it during this parent closeout unless a reviewer finds a concrete instruction contradiction; otherwise keep the instruction surface stable and update README first after merge.

WROTE: artifacts/reviews/evals-proof-spine-agents-md.md
