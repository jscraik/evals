# JSC-372 Unslopify Ledger

Status: complete

## Removed Or Avoided Surfaces

- No prose-only success path was added. Claims are schema-backed and scored by `missing-evidence`.
- No new dashboard, plugin system, cloud runner, external adapter root, LLM judge gate, or runtime dependency on consumer repositories was introduced.
- No runtime evidence family was silently upgraded from scaffolded to enforced. Existing scaffolded families remain visible through `policy_coverage`.

## Kept Surfaces

- Kept `schemas/claim.schema.json`, `schemas/evidence.schema.json`, and `schemas/runtime-evidence-packet.schema.json` because they are executable contracts, not explanatory docs.
- Kept `missing-evidence` as a deterministic scorer id in `schemas/scorer-result.schema.json` so false-success checks can be represented in scorer artifacts.
- Kept the deep module packet because AGENTS.md requires a deep-module fix packet before runtime/schema/artifact edits.

## Evidence

- `src/lib/claim-evidence-contract.js:31` rejects artifact-exists claims that lack manifest/hash evidence.
- `test/cli.test.js:436` proves validation success without evidence fails.
- `test/cli.test.js:452` proves artifact existence without manifest/hash evidence fails.
- `test/cli.test.js:411` verifies scaffolded runtime evidence families stay visible as `scaffolded_not_enforced`.

WROTE: artifacts/reviews/jsc-372-unslopify.md
