# Ubiquitous Language Review

Reviewer: coordinator-run ubiquitous-language lens after subagent artifact failure
Date: 2026-05-18

## Findings

No blocking findings after glossary follow-through.

## Actions

- Added 'UBIQUITOUS_LANGUAGE.md' with canonical terms, aliases / user phrases,
  prompt translations, flagged ambiguities, and source notes.
- Added 'UBIQUITOUS_LANGUAGE.md' to the README and AGENTS read order.

## Vocabulary Check

| Term | Status | Evidence |
| --- | --- | --- |
| executable spine | consistent | UBIQUITOUS_LANGUAGE.md defines it; README.md and AGENTS.md use it as the phase-one route. |
| artifact bundle | consistent | UBIQUITOUS_LANGUAGE.md defines it; README.md, src/cli.js, and report output use artifact bundle language. |
| deterministic verdict | consistent | UBIQUITOUS_LANGUAGE.md defines it; schemas/eval-result.schema.json and src/cli.js use deterministic verdict as the required outcome. |
| scorer result | consistent | UBIQUITOUS_LANGUAGE.md defines it; schemas/scorer-result.schema.json and run artifacts use scorer-results.json. |
| baseline result | consistent | UBIQUITOUS_LANGUAGE.md defines it; schemas/baseline-result.schema.json and runner output preserve presence_status, comparison_status, and promotion_status. |
| tracker state | consistent | UBIQUITOUS_LANGUAGE.md defines both tracker blocked and tracker override approved; README.md, AGENTS.md, Linear retry evidence, override evidence, and closure eval preserve the distinction between a live Linear issue and the approved override path. |

## Residual Risk

The docs use human-readable "secrets" language while generated fixture and
manifest fields use 'contains_credentials' so the lightweight regex gate does
not self-match. That distinction is intentional but should be kept stable in
future schemas.

WROTE: artifacts/reviews/ubiquitous-language.md
