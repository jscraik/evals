# Adversarial Evidence-Led Gap Review

Date: 2026-05-25
Reviewer: adversarial
Scope: /Users/jamiecraik/dev/evals

## Finding 1 (High)
Title: False-success chain: `pnpm verify` self-heals `latest.json` before validating it
Runtime status: implemented_not_enforced

Evidence:
- Trigger: a stale/broken `latest.json` exists from a previous run.
- `pnpm verify` executes two smoke runs before any check validation.
  - `scripts/verify.js:66-72`
- Each run rewrites `.harness/evals/runs/latest.json`.
  - `src/commands/run.js:278-344`
- Only after overwrite does `verify` run `pnpm evals check --json`.
  - `scripts/verify.js:78-80`
- Result: preexisting pointer corruption can be hidden by a fresh synthetic smoke rewrite, and verify can pass while prior evidence integrity was broken.

Remediation:
- Split verify into pre-mutation and post-mutation phases.
- Validate existing `latest.json`/artifact integrity before any smoke run.
- Emit two explicit statuses: `preexisting_latest_health` and `smoke_health`.

Validation method:
1. Corrupt manifest hash or break `latest.json`.
2. Run `pnpm verify`.
3. Confirm current behavior can pass after smoke rewrite.
4. After fix, confirm verify fails preexisting integrity even when smoke run passes.

## Finding 2 (Medium)
Title: Scope collapse: `check` hard-binds proof context to smoke and incentivizes overwrite-to-pass
Runtime status: partial

Evidence:
- `check` always builds expected context from smoke fixture.
  - `src/commands/validation.js:104-111`
- `validateLatestRun` then enforces context equality to that expected context.
  - `src/lib/latest-run.js:65-93`
  - `src/lib/latest-run.js:169-215`
- For legitimate non-smoke latest runs (for example repo-local suite output), check fails by design, nudging operators to rerun smoke and overwrite latest.

Remediation:
- Make `check` context-selectable:
  - default: validate observed latest context and artifact integrity
  - strict option: `--expected-case smoke` or explicit expected context
- Keep smoke validation as an explicit route, not mandatory global expectation.

Validation method:
1. Produce latest from a non-smoke suite.
2. Run `pnpm evals check --json`.
3. Confirm current mismatch behavior.
4. After fix, default check should pass context-coherent latest validation without forcing smoke overwrite.

## Finding 3 (Medium)
Title: Split-brain success semantics: direct `run` can pass while contract health is failing
Runtime status: implemented_not_enforced

Evidence:
- `run` exit code is derived from deterministic scorer verdict only.
  - `src/commands/run.js:185-190`
  - `src/commands/run.js:345-381`
- Runtime-evidence contract health is validated in `check` and `state`, not in `run`.
  - `src/commands/validation.js:112-129`
  - `src/lib/runtime-state.js:139-167`
- Result: operator can repeatedly see successful `run` output while governance/runtime-evidence health is red unless they independently run check/state.

Remediation:
- Add contract-health gating or explicit run output signal:
  - `contract_health_status`
  - optional fail-closed mode: `--require-contract-health`

Validation method:
1. Intentionally break runtime-evidence contract fixture/declaration.
2. Run `pnpm evals run fixtures/smoke/pr-closeout.case.json --json`.
3. Run `pnpm evals check --json`.
4. Confirm current divergence (`run` pass vs `check` fail), then verify convergence after fix.

## Residual Risks
- Mutation and validation are still co-located in wrapper flow, so accidental evidence replacement can be mistaken for health.
- Wrapper sequencing drift can reintroduce false-success unless ordering invariants are test-enforced.

## Testing Gaps
- Missing regression that asserts verify validates preexisting latest integrity before mutation.
- Missing first-class tests for non-smoke latest context acceptance path.
- Missing cross-command invariant tests for `run` vs `check` vs `state` contract-health semantics.

WROTE: artifacts/reviews/2026-05-25-evidence-gap-adversarial-reviewer.md
