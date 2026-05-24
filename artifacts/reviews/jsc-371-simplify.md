# JSC-371 Simplify Ledger

schema_version: 1
execution_mode: scoped_cleanup
diff_source: git diff HEAD -- src/commands/run.js src/lib/suite-contract.js src/lib/latest-run.js src/lib/run-bundle.js src/lib/case-contract.js src/lib/paths.js src/lib/schema.js schemas/suite.schema.json test/cli.test.js

## Files Reviewed

- src/commands/run.js
- src/lib/suite-contract.js
- src/lib/latest-run.js
- src/lib/run-bundle.js
- src/lib/case-contract.js
- src/lib/paths.js
- src/lib/schema.js
- schemas/suite.schema.json
- test/cli.test.js

## Actions

- Kept suite execution as an orchestration wrapper over the existing case execution path instead of duplicating artifact writing.
- Removed the unused suiteRelativePath export from src/lib/suite-contract.js.
- Preserved default case-runner error wording by passing a custom case root only for suite execution.
- Kept suite policy rejection in src/lib/suite-contract.js rather than spreading network/scorer/path checks into CLI callers.
- Kept adversarial remediation inside src/lib/suite-contract.js: .evals boundary discovery and artifact-policy fail-closed behavior remain hidden suite-contract rules, not caller choreography.

## Skipped

- Did not split src/commands/run.js further in this slice. It is now larger, but the behavior remains behind current owner modules and refactoring the command surface would widen this slice beyond JSC-371.
- Did not generalize scorer semantics. Phase one accepts data-only references and rejects executable hooks; domain scorer semantics remain consumer-owned.

## Validation

- Command: git diff --check -> pass
- Command: pnpm test -> pass (119 tests)
- Command: pnpm evals run fixtures/smoke/pr-closeout.case.json --json -> pass
- Command: pnpm evals check --json -> pass
- Command: pnpm evals state --json -> pass
- Command: pnpm verify -> pass

## Risk Note

The main residual maintainability risk is src/commands/run.js size. The risk is accepted for this slice because extracting more command helpers now would mix suite-contract behavior with a broader runner refactor.
