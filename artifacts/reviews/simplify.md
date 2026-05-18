# Simplify Review

schema_version: 1
execution_mode: read_only_review
diff_source: clean main branch at origin/main
date: 2026-05-18

## Files Reviewed

- src/cli.js
- schemas/*.schema.json
- README.md
- AGENTS.md
- UBIQUITOUS_LANGUAGE.md
- .harness/evals/runs/latest.json
- .harness/evals/evals-evals-executable-spine-eval.md
- .harness/evals/evals-executable-spine-completion-audit.md
- implementation-notes.html

## Findings

### Low: Case validation duplicates schema checks

Evidence:
- src/cli.js:328 validates the fixture against schemas/eval-case.schema.json.
- src/cli.js:182-213 then repeats required-field, enum-ish, and shape checks already partly covered by the schema.

Impact:
This is still acceptable for phase one because validateCase carries phase-one policy invariants such as synthetic-only fixtures and no credentials. The simplification opportunity is to split schema validation from phase-one policy validation so future edits do not update the same contract in two places.

Action:
No code change applied in this read-only pass. Recommended next move: rename validateCase to validatePhaseOneCasePolicy or split the generic shape checks out once tests exist.

## Actions

No behavior-preserving simplification was applied. The current runner is small enough for phase one, and changing it now without test coverage would be churn.

## Skipped

- Did not extract the schema validator out of src/cli.js during this pass. That is more architecture/testability work than a safe simplify-only edit.
- Did not delete the older human-output proof run directory because closure evidence cites both human and JSON command proofs.

## Validation

- pass: node --check src/cli.js
- pass: pnpm evals check --json
- pass: pnpm evals validate fixtures/smoke/pr-closeout.case.json --json
- pass: pnpm evals validate .harness/evals/runs/latest.json --json

## Risk Note

The simplify reviewer fan-out was attempted, but all three spawned reviewers timed out without findings and were closed. Their mailbox silence is not approval evidence.

## Next Step

Add focused node:test coverage before extracting validation helpers.
