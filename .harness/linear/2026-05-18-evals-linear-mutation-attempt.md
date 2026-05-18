# Evals Linear Mutation Attempt

Date: 2026-05-18

## Outcome

Partial live Linear mutation completed.

Created:

- Linear label: `Repo › evals`
- Label ID: `103e1d5a-920c-4290-b2e5-dd5bcddad351`
- Description: `Work owned by /Users/jamiecraik/dev/evals`

Not created:

- Parent issue: `Build local eval runner and artifact contract`
- Four planned child issues under `Evals Executable Spine`

## Blocker

The Linear connector exposed `mcp__codex_apps__linear_save_issue`, but the tool rejected issue creation from this session with:

```text
unsupported call: mcp__codex_apps__linear_save_issue
```

Read operations worked:

- JSC team lookup succeeded.
- Active project listing succeeded.
- Label listing succeeded.
- Search for existing `Evals Executable Spine` / `Build local eval runner and artifact contract` returned no results.

One mutation worked:

- `mcp__codex_apps__linear_create_issue_label` created `Repo › evals`.

## Planned Linear Shape

Source plan:

- `.harness/linear/2026-05-18-evals-executable-spine-linear-plan.md`

Recommended live shape remains:

- Milestone: `Evals Executable Spine`
- Parent issue: `Build local eval runner and artifact contract`
- Child issue: `Compress documentation authority into README and AGENTS`
- Child issue: `Define canonical eval schemas and smoke fixture contract`
- Child issue: `Implement local runner and artifact bundle writer`
- Child issue: `Add deterministic scorers, baseline comparator, and closure eval`

## Next Step

Retry issue creation when the Linear `save_issue` connector supports mutation in this session, or create the issues manually from the ready-to-create payloads in the Linear plan.
