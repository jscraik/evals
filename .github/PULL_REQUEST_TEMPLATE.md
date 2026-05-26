# Summary

- 

## Scope

- Command surface changed:
- Generated artifacts added or updated:
- Linear tracker override or live tracker impact:
- Phase-one hard-block pressure:

## Validation

Record exact commands actually run and their outcomes.

- Command: `pnpm verify` -> pass/fail/blocked/not run
- Command: `pnpm test` -> pass/fail/blocked/not run
- Command: `pnpm evals run fixtures/smoke/pr-closeout.case.json --json` -> pass/fail/blocked/not run
- Command: `pnpm evals check --json` -> pass/fail/blocked/not run

## Artifact Evidence

- Latest pointer:
- Result artifact:
- Manifest artifact:
- Scorer results:
- Baseline result:

## Risk And Rollback

- Risk:
- Rollback:

## Checklist

- [ ] I read `AGENTS.md`, `.harness/core/2026-05-18-evals-core.md`, and `UBIQUITOUS_LANGUAGE.md`.
- [ ] I kept phase-one hard blocks intact.
- [ ] I did not introduce runtime dependencies on sibling repositories.
- [ ] I recorded validation outcomes truthfully.
- [ ] I updated documentation when public commands, schemas, artifacts, or workflow expectations changed.
