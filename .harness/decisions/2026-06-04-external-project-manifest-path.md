# External Project Manifest Path Decision

Decision date: 2026-06-04

Plan path: .harness/plan/2026-06-04-external-evals-suite-authority-plan.md

## Decision

Use `.evals/project.json` as the external project manifest path for the first external evals suite authority slice.

## Rationale

The selected path keeps the manifest beside existing repo-local eval suite data under `.evals/` and uses the shortest project-level name that does not imply executable suite behavior. It makes the manifest a target-owned data contract, not an evals-owned runner adapter.

## Rejected Alternative

Rejected `.evals/evals.project.json`.

That alternative is more explicit, but it repeats the directory context and makes the file name harder for humans and agents to remember. The shorter path is acceptable because schema validation owns the contract shape and the manifest path decision is recorded here.

## Compatibility And Migration Risk

This is a first public contract for external project authority metadata. To keep migration risk low, the implementation must fail closed when the manifest is absent or invalid, and it must not infer target behavior proof from artifact-only inspection.

Future migration must either preserve `.evals/project.json` or add an explicit compatibility decision and reader fallback. No behavioral target execution is authorized by this path.

## Reviewer Acceptance Condition

Reviewers should accept this decision only if implementation keeps `.evals/project.json` as a data-only manifest, rejects absolute paths and parent traversal in manifest-owned path fields, and records blocked or human-approval-required actions instead of executing black-box target behavior.
