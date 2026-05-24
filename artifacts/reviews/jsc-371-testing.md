# JSC-371 Testing Evidence

schema_version: 1
changed_surface: suite schema, suite loader, run command dispatch, artifact-root behavior, latest validation root handling, path containment

## Selected Route

Smallest exact proof: node test cases in test/cli.test.js that execute the real CLI against a temporary consumer repo with a .evals/suite.json.

Broader proof: repo-native pnpm verify, because this slice changes runtime, schema, artifact, latest, and validation behavior.

## Commands

- Command: git diff --check -> pass
- Command: pnpm test -> pass (119 tests)
- Command: pnpm evals run fixtures/smoke/pr-closeout.case.json --json -> pass
- Command: pnpm evals check --json -> pass
- Command: pnpm evals state --json -> pass
- Command: pnpm verify -> pass (includes pnpm test with 119 tests, smoke run, state, check, credential scan)

## New Regression Coverage

- Valid repo-local suite outside evals writes artifacts under the evaluated repo.
- Suite case traversal fails before execution.
- artifact_policy.allow_network true fails closed.
- Suite files outside a .evals boundary fail before artifact publication.
- artifact_policy.write_bundle false and artifact_policy.retain_locally false fail closed.
- Executable scorer hook references fail closed.
- Default case traversal compatibility remains intact.

## Failure Classification

- Initial pnpm test failure: introduced by current patch. Default case path traversal error changed from evals repository to case root. Fixed by only passing caseRoot to parseCase for suite execution.
- Initial pnpm verify failure: introduced by current patch/test fixture. Test fixture copied a suite_id with a dot into a case, but case suite IDs are kebab-only. Fixed test fixture to use consumer-smoke.
- Adversarial review finding: introduced by current patch. Suite root fallback could treat a misplaced suite outside .evals as authority for an unintended artifact parent. Fixed by requiring a discovered .evals boundary before execution and adding a negative regression.
- Adversarial review finding: introduced by current patch. write_bundle and retain_locally were accepted but ignored when false. Fixed by failing closed for unsupported false values in phase one and adding negative regression coverage.

## Coverage Gaps

- No live consumer repository suite was run in this turn. The temp consumer repo exercises the filesystem/root semantics deterministically.
- No external CI evidence yet for JSC-371.
