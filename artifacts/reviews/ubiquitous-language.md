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
- .harness/evals/evals-evals-executable-spine-eval.md:24 names 8029517 as the initial implementation commit pushed to origin/main.
- .harness/evals/evals-evals-executable-spine-eval.md:26-29 and :162 correctly include schema-validation hardening commit 8e9f6fb in the history summary.
- .harness/evals/evals-evals-executable-spine-eval.md:176 correctly mentions follow-up delivery/hardening commits were pushed.
- The evaluation artifact instructs readers to verify current git state live with 'git status --short --branch' and 'git log --oneline --decorate -1'.

Triage:
Resolved in this pass by ensuring the durable docs distinguish initial
implementation commit 8029517 from follow-up hardening commit 8e9f6fb and by
telling future agents to verify live git state before delivery decisions.

Prompt translation:
When Jamie asks "where are we at?", agents should answer from live git state first, then cite older implementation commits as historical milestones.

Applied wording:
"Initial implementation commit: 8029517. Follow-up hardening commits pushed include: 8e9f6fb (schema-validation hardening). Always verify current state with git status --short --branch and git log --oneline --decorate -1."

## Skipped Evidence

Session logs were not used because the current repo files and live git state were enough.

## Validation

- pass: UBIQUITOUS_LANGUAGE.md exists.
- pass: canonical terms have one-sentence definitions.
- pass: AGENTS.md read order references UBIQUITOUS_LANGUAGE.md.
- pass: prompt translations include Jamie-style phrases.

## 2026-05-19 Reviewer-Hardening Pass

schema_version: 1
selected_skill: ubiquitous-language

highest_value_terms:
Repo-relative artifact pointer was added to UBIQUITOUS_LANGUAGE.md after the
adversarial and best-practices reviewers found latest.json and manifest path
boundary gaps. The term keeps the contract concrete: stored artifact paths are
repository-relative, never absolute, and never traversal-based.

prompt_translations:
- "path-boundary hardening" now maps to validating repo-relative artifact
  pointers before reading, hashing, or trusting generated run evidence.

sources:
- src/cli.js repoRelativePath helper.
- test/cli.test.js traversal and absolute-path validation cases.
- AGENTS.md Discovery pointer to UBIQUITOUS_LANGUAGE.md.

skipped_evidence:
No session logs were used. The live diff, tests, and project glossary were
enough for the terminology update.

validation:
- pass: UBIQUITOUS_LANGUAGE.md exists.
- pass: repo-relative artifact pointer has a one-sentence definition.
- pass: prompt translations include Jamie-style wording.
- pass: AGENTS.md references UBIQUITOUS_LANGUAGE.md.
