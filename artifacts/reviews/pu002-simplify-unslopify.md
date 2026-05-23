# PU-002 Simplify And Unslopify Review

STATUS: completed

Scope: PU-002 simplification, dead-code, duplication, naming, and stale-scaffold review.

## Findings

### blocker

None.

### high

None.

### medium

None.

### low

- schemas/runtime-evidence-case.schema.json:121 through schemas/runtime-evidence-case.schema.json:156 repeats the same scaffold object schema four times. This repetition is intentional because the local schema validator rejects unsupported schema composition keywords. Do not introduce $defs or $ref unless the validator contract changes.

### informational

- src/lib/runtime-evidence-contract.js:208 through src/lib/runtime-evidence-contract.js:220 keeps coverage object construction and merging small and local.
- src/lib/runtime-evidence-contract.js:223 through src/lib/runtime-evidence-contract.js:263 has one policy-coverage pass with no caller-side choreography.
- test/cli.test.js:481 and related scorer assertions now locate scorer results by scorer_id, avoiding stale positional coupling after fixtures gained the permission scorer.

## Recommendation

No simplification or stale-code issue requires a PU-002 fix. Keep schema repetition until the repo-owned validator supports shared definitions.

WROTE: artifacts/reviews/pu002-simplify-unslopify.md
