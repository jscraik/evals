# Architecture Boundary Validation

## Source Gap

The evidence-led audit records GAP-004: architecture boundaries are documented in
ARCHITECTURE.md and AGENTS.md, but no deterministic gate rejects import-layer
drift, phase-one hard-block dependencies, or runtime imports from governance
artifacts.

## Owner Module

scripts/validate-architecture.js owns mechanical architecture-boundary checks.

## Public Interface

- node scripts/validate-architecture.js
- validateArchitectureBoundaries({ root })

The command exits 0 when the repository satisfies the checked boundaries and 1
with path-specific messages when it finds drift.

## Hidden Implementation Rule

The validator is dependency-free and conservative. It scans local JavaScript
imports, dynamic imports, export-from declarations, and package dependency
sections. It does not become a general import graph framework and it does not
introduce runtime dependencies.

## Caller Contract

Callers may rely on the validator to enforce these phase-one boundaries:

- src/cli.js imports command modules only;
- src/commands/** imports src/lib/** or Node builtins only;
- src/lib/** does not import src/commands/**, src/cli.js, scripts/**, or
  governance artifacts;
- scripts/** may import src/lib/** and Node builtins for validation wrapper
  work, but not src/commands/** or src/cli.js;
- src/** and scripts/** do not import phase-one hard-blocked sibling projects,
  collector packages, cloud runner surfaces, plugin runtimes, dashboards, or
  external adapter roots;
- package dependency sections do not introduce those hard-blocked dependencies.

## Seam Test

test/architecture-boundaries.test.js validates the current repository and proves
negative cases for:

- lib-to-command imports;
- cli-to-lib imports;
- command-to-command imports;
- hard-blocked sibling repo imports;
- package dependency drift.

## Tracer Proof

Required validation evidence:

- pnpm test test/architecture-boundaries.test.js
- pnpm test
- pnpm verify

Reviewer artifacts required before marking T005 done:

- artifacts/reviews/2026-05-26-t005-architecture-boundary-adversarial-reviewer.md
- artifacts/reviews/2026-05-26-t005-architecture-boundary-agent-native-reviewer.md

## Rollback Path

Remove scripts/validate-architecture.js, remove the T005 test file, and remove
the architecture validator check from scripts/verify.js. This returns the
repository to documentation-only architecture governance without changing CLI
runtime behavior.

## Validation Gate

T005 is not complete until the validator is wired into pnpm verify and reviewer
artifacts exist and end with the required WROTE lines, or any missing artifact is
classified as a coverage gap after one focused retry.

## Phase-One Check

This fix does not add dashboards, external adapters, cloud runners, telemetry
exporters as authority, plugin systems, source-mining automation, required LLM
judge gates, or runtime dependencies on sibling repositories or collectors.
