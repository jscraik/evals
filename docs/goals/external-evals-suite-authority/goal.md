# External Evals Suite Authority Goal

Source plan: /Users/jamiecraik/dev/evals/.harness/plan/2026-06-04-external-evals-suite-authority-plan.md

Native objective: implement the external evals suite authority plan as a governed program, executing PU-001 through PU-005 without opening forbidden black-box execution, judge authority, hosted telemetry, dashboards, source mining, plugin systems, or sibling runtime dependency scope.

## Completion Contract

completion_contract:

outcome:
Implement the first executable authority-boundary increment from the source plan: external project manifest contract, authority classifier owner, artifact-only external inspection output, privacy approval evidence shape, and closeout vocabulary/architecture evidence where accepted. Completion requires the board to show all PU tasks and review tasks done, with a final Judge or PM receipt declaring complete.

verification_surface:
Use repo-native deterministic evidence. Required closeout commands are `pnpm test`, `pnpm evals run fixtures/smoke/pr-closeout.case.json --json`, `pnpm evals check --json`, `pnpm evals check --smoke --json`, `pnpm evals state --json`, and `pnpm verify`. Focused proof must cover manifest schema positive/negative fixtures, path traversal and absolute-path rejection, missing-manifest blocked behavior, artifact-only `--repo-root` read-side sentinel behavior, `authority_mode: artifact_only`, non-proof claims, runtime evidence `not_configured` or blocked behavior, next-action partitions, privacy approval evidence states, and manifest decision artifact existence.

constraints:
After each implementation slice, run or perform review using $simplify, $improve-codebase-architecture, $testing, and $ubiquitous-language before the next Worker slice starts. Each review must leave a receipt or durable artifact that classifies findings, fixes, skipped items, and validation. Use exact command outcomes and keep local validation, generated artifacts, remote PR checks, review threads, tracker state, and merge readiness separate.

boundaries:
Allowed scope is PU-001 through PU-005 from the plan. Forbidden scope includes black-box target command execution, networked execution, hosted telemetry authority, dashboards, cloud runners, plugin systems, source-mining automation, external adapter roots, required LLM judge gates, runtime dependencies on sibling repositories, baseline promotion automation, public command additions or renames without a compatibility decision, package installs without separate approval, merge/admin actions, and branch deletion. Tracker mutation requires a separate explicit decision.

iteration_policy:
Execute in ordered slices: Scout refresh, PU-001, review, PU-002, review, PU-003, review, PU-004, review, PU-005, review, PR/git triage using $pr-green-sweep, final Judge or PM audit. Stop after any failed required gate, phase-one hard-block violation, missing implementation notes artifact, unresolved active review finding, or unsafe owner decision.

blocked_stop_condition:
Stop and ask Jamie when implementation needs a public contract decision not covered by the manifest-path decision artifact, when privacy enum or manifest path choices cannot be made from plan evidence, when validation fails from introduced behavior and the smallest repair is unclear, when a required reviewer skill cannot run or leave evidence, when tracker mutation is required but not approved, or when any work would cross into blocked black-box execution or judge authority.

## Work Program

1. T001 Scout refreshes current repo state, instructions, plan, architecture, glossary, tests, and validation commands before implementation.
2. T002 implements PU-001: external project manifest contract and manifest-path decision.
3. T003 reviews PU-001 with $simplify, $improve-codebase-architecture, $testing, and $ubiquitous-language.
4. T004 implements PU-002: authority classifier owner and machine-readable action partitions.
5. T005 reviews PU-002 with $simplify, $improve-codebase-architecture, $testing, and $ubiquitous-language.
6. T006 implements PU-003: artifact-only external inspection output.
7. T007 reviews PU-003 with $simplify, $improve-codebase-architecture, $testing, and $ubiquitous-language.
8. T008 implements PU-004: privacy approval evidence shape.
9. T009 reviews PU-004 with $simplify, $improve-codebase-architecture, $testing, and $ubiquitous-language.
10. T010 implements PU-005: validation, vocabulary, architecture, and closeout evidence.
11. T011 reviews PU-005 with $simplify, $improve-codebase-architecture, $testing, and $ubiquitous-language.
12. T012 performs git and PR triage using $pr-green-sweep.
13. T013 performs final Judge or PM completion audit.

## Start Command

```text
/goal Follow docs/goals/external-evals-suite-authority/goal.md
```

/goal Follow docs/goals/external-evals-suite-authority/goal.md is a prompt convention; Codex must still read this file, state.yaml, and receipts.jsonl before acting.
