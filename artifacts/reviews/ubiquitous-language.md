# Ubiquitous Language Review

schema_version: 1
execution_mode: read_only_vocabulary_review
date: 2026-05-18

## Highest-Value Terms Checked

| Term | Status | Evidence |
| --- | --- | --- |
| Executable spine | consistent | README.md, AGENTS.md, and UBIQUITOUS_LANGUAGE.md all use it for the small local eval loop. |
| Artifact bundle | consistent | README.md local artifacts and UBIQUITOUS_LANGUAGE.md define the same result/report/command-log/manifest/scorer/baseline/latest set. |
| Deterministic verdict | consistent | src/cli.js emits deterministic_verdict and the glossary distinguishes it from judge output. |
| Baseline result | consistent | schemas/baseline-result.schema.json and UBIQUITOUS_LANGUAGE.md both preserve presence/comparison/promotion split. |
| Tracker blocked / tracker override approved | consistent | README.md and AGENTS.md correctly preserve the distinction. implementation-notes.html and closure evidence now distinguish historical implementation commits from live git verification. |

## Finding

### Low: Delivery evidence language was drifting from live git state

Evidence:
- .harness/evals/evals-evals-executable-spine-eval.md:24 names 8029517 as the implementation commit pushed to origin/main.
- .harness/evals/evals-evals-executable-spine-eval.md:160 and :174 still summarize history around 8029517 and the delivery-state refresh, omitting the current hardening commit.
- implementation-notes.html:241-244 says current head is 0fb13b2 even though live HEAD/origin/main is 8e9f6fb.

Triage:
Resolved in this pass by changing the durable docs to distinguish initial
implementation commit 8029517 from follow-up hardening commit 8e9f6fb and by
telling future agents to verify live git state before delivery decisions.

Prompt translation:
When Jamie asks "where are we at?", agents should answer from live git state first, then cite older implementation commits as historical milestones.

Applied wording:
"Initial implementation commit: 8029517. Latest pushed hardening commit at review time: 8e9f6fb. Verify current state with git status --short --branch and git log --oneline --decorate -1."

## Skipped Evidence

Session logs were not used because the current repo files and live git state were enough.

## Validation

- pass: UBIQUITOUS_LANGUAGE.md exists.
- pass: canonical terms have one-sentence definitions.
- pass: AGENTS.md read order references UBIQUITOUS_LANGUAGE.md.
- pass: prompt translations include Jamie-style phrases.
