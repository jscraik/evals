# Evals Ubiquitous Language

This glossary keeps the executable-spine vocabulary stable for humans and
agents. It is intentionally small and phase-one scoped.

## Canonical Terms

| Term | Definition | Aliases / User Phrases | Source Notes |
| --- | --- | --- | --- |
| Executable spine | The smallest local eval loop that can run one synthetic fixture and produce replayable evidence. | local runner, eval spine, first command | Spec goals and README doctrine. |
| Eval case | A JSON fixture describing one replayable evaluation input, expected deterministic evidence, selected scorers, privacy metadata, and baseline reference. | fixture, smoke case | Spec domain model and schemas/eval-case.schema.json. |
| Artifact bundle | The local proof package for a run: result, report, command log, manifest, scorer results, baseline result, and latest pointer. | run artifacts, proof package | Spec artifact output and README local artifacts. |
| Repo-relative artifact pointer | A path recorded in latest.json or a manifest that must stay relative to this repository and must not use absolute paths or '..' traversal segments. | artifact pointer, local artifact path, latest pointer field | src/cli.js latest-run validation and test/cli.test.js path-boundary cases. |
| Deterministic verdict | The required pass/fail outcome computed from deterministic scorer results, not judge text or hosted telemetry. | required verdict, pass/fail | Spec invariants and schemas/eval-result.schema.json. |
| Scorer result | One deterministic check result with inspected inputs, status, evidence, and failure reason when applicable. | scorer evidence, check result | schemas/scorer-result.schema.json. |
| Baseline result | The explicit baseline state for a run, keeping presence, comparison, and promotion separate. | baseline state, baseline comparator output | schemas/baseline-result.schema.json. |
| Local prior-art reuse | Borrowing field patterns and vocabulary from sibling repos as design evidence without importing their runtime or domain authority. | reuse map, reference-only reuse | .harness/references/local-reuse-map.md. |
| Tracker blocked | The delivery state where Linear issue creation is unavailable and no Jamie-approved override exists. | linear_blocked, tracker blocked | Spec tracker override contract and Linear retry evidence. |
| Tracker override approved | The exceptional delivery state where Jamie approves closure without a live Linear issue after recovery paths fail, while preserving the condition to create or link the issue later. | override_approved, approved override | .harness/linear/2026-05-18-evals-tracker-override-approved.md. |
| Closure eval | The .harness/evals artifact that cites command output, artifact paths, validation, scorer verdicts, baseline fields, drift, rollback, and tracker state. | closure evidence, eval closeout | Plan EP-006 and AGENTS.md closure evidence. |

## Prompt Translations

| If Jamie says... | Agents should treat it as... |
| --- | --- |
| "implement the plan" | Execute EP-001 through EP-006 in order, preserving linear_blocked until Linear recovers or Jamie approves an override; after approval, record override_approved without claiming a live Linear issue exists. |
| "local reuse lane" | Use coding-harness and agent-skills as reference evidence only; do not add runtime imports or move domain truth into evals. |
| "artifact proof" | Produce or inspect the local artifact bundle and latest.json pointer, not dashboard, telemetry, PR comment, or judge output. |
| "path-boundary hardening" | Validate repo-relative artifact pointers before reading, hashing, or trusting generated run evidence. |
| "baseline" | Preserve presence_status, comparison_status, and promotion_status as separate machine-readable fields. |
| "ready for commit and PR" | First prove this path is inside a git repository; if not, classify git add, commit, push, PR, and git-project-triage as blocked. |

## Flagged Ambiguities

| Phrase | Risk | Current Resolution |
| --- | --- | --- |
| completion | Could mean local implementation pass, normal tracker/PR closeout, or approved tracker override closeout. | Say local implementation complete only when artifacts pass; say tracker complete only when a live Linear issue exists or the approved override artifact is present. |
| review passed | Could imply subagent approval. | Only claim subagent review when requested artifact files exist. Coordinator fallback reviews must be named as fallback evidence. |
| privacy check | Could imply full scanner coverage. | Phase one uses synthetic fixtures plus lightweight credential-pattern inspection; full privacy scanner is future hardening. |
