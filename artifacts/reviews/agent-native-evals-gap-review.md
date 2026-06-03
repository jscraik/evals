# Review: agent-native-evals-gap-review
## Findings
- **Warning** `src/lib/proof-boundary.js:4-8`, `src/lib/proof-boundary.js:35-43`, `src/lib/contract-catalog.js:10-31`: Adopted contracts and proof boundary statements are hard-coded, not derived from validated catalog files. **Impact:** Agents can report stale or incorrect capability/proof surfaces after catalog edits, creating discoverability drift between runtime truth and declared truth. **Recommendation:** Build `adopted_contracts`, `proves`, and `does_not_prove` from validated `contracts/**` at runtime (or from a generated immutable artifact produced by `validate-contracts`), and fail closed when sync is broken.
- **Warning** `src/lib/claim-evidence-contract.js:181-207`, `test/cli.test.js:358-365`: External repo-root state can return `readiness_verdict.status = "pass"` even when runtime evidence contract health is `not_configured`. **Impact:** An agent may interpret “pass” as handoff-ready despite missing runtime-evidence enforcement in consumer repos. **Recommendation:** In external `--repo-root` mode, downgrade readiness to blocked/advisory unless runtime-evidence coverage is explicitly present, or add a distinct verdict state (for example `advisory_pass`) that cannot be conflated with closure readiness.
- **Observation** `src/commands/validation.js:179-215`: `check --repo-root` skips runtime evidence checks by returning an empty check set rather than an explicit “skipped/not configured” check record. **Impact:** Agents relying on check rows for diagnostics can miss that a whole capability family was not evaluated. **Recommendation:** Emit an explicit check entry (status `skip`/`not_configured`) so parity gaps are machine-visible without schema spelunking.

## Coverage Notes
- Reviewed current uncommitted changes with focus on agent-operable verifier paths: `check`, `state`, `validate-contracts`, proof-boundary emission, contract catalog validation, external `--repo-root` behavior, and associated schema/test surfaces.
- Verified there is no user-only UI gate in this slice; core parity risk is semantic signaling drift (what agents can safely infer) rather than missing command access.

## Residual Risk
- Contract fixtures under `fixtures/contracts/**` are currently validated for existence/schema only; assertion semantics are not exercised by runner-level deterministic checks yet. This remains a medium-term risk for “contract present but unenforced” drift.
WROTE: artifacts/reviews/agent-native-evals-gap-review.md
