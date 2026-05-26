---
name: Bug report
about: Report a reproducible eval runner, schema, artifact, or validation defect
title: "[bug]: "
labels: bug
assignees: ""
---

## Summary


## Reproduction

~~~bash
pnpm test
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
pnpm evals check --json
~~~

Replace the commands above with the smallest command set that reproduces the
defect.

## Expected Behavior


## Actual Behavior


## Artifact Evidence

- latest pointer:
- run directory:
- result:
- manifest:
- command log:

## Scope Check

- [ ] This is within the local runner, schema, fixture, artifact, validation, or documentation surface.
- [ ] This does not require dashboards, external adapters, cloud runners, plugin systems, source-mining automation, required LLM judge gates, or runtime dependencies on sibling repositories.
