# JSC-371 Unslopify Ledger

schema_version: 1
execution_mode: scoped_cleanup

## Cleanup Scope

Targeted the JSC-371 suite-contract diff only.

## Evidence

- rg suiteRelativePath src test found a single unused export; removed it.
- rg rel\( src/commands/run.js confirmed the suite-root refactor no longer leaves stale repo-root artifact path calls in the runner.
- Suite policy checks remain executable only through src/lib/suite-contract.js.
- Added explicit negative proof for suite files outside .evals and unsupported local retention policy instead of relying on implied policy defaults.
- No generated projections, caches, vendor directories, or external adapter roots were edited.

## Kept Surfaces

- src/lib/suite-contract.js stays as a new owner module because suite loading, suite-root path resolution, and phase-one policy rejection are a real new boundary.
- src/lib/latest-run.js keeps latest validation authority; suite code does not revalidate latest pointers itself.
- src/lib/run-bundle.js keeps artifact allocation authority; suite code only passes artifact repo root and prefix.
- src/lib/case-contract.js keeps case parsing and validation authority; suite code only passes resolved case paths.

## Removed / Avoided

- Removed unused suiteRelativePath export.
- Avoided plugin registry, executable scorer hooks, network execution, dashboard surfaces, cloud runners, external adapter roots, and required LLM judge gates.

## Validation

- Command: git diff --check -> pass
- Command: pnpm test -> pass (119 tests)
- Command: pnpm verify -> pass

## Residual Risk

Suite command coverage currently uses temp consumer fixtures in tests rather than a committed external-repo fixture. This is acceptable for JSC-371 because the requirement is path/root behavior, and the test creates a real external filesystem root.
