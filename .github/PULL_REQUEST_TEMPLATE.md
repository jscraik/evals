# Pull request checklist

Write for human maintainers first. Use `n.a.` with a concrete reason when a
field does not apply. Do not paste secrets, raw transcripts, bulky telemetry,
or local absolute paths.

## Summary

- Problem:
- Why now:
- Intended outcome:
- Out of scope:
- Reviewer focus:
- Risk and rollback:

## Scope

- Command surface changed:
- Generated artifacts added or updated:
- Schema, fixture, runner, scorer, baseline, trace, state, or governance surface changed:
- Linear tracker override or live tracker impact:
- Phase-one hard-block pressure:

## Behavior Proof

Complete this section when the PR changes runtime behavior, CLI behavior,
generated artifacts, validation behavior, agent workflow behavior, user-facing
docs, or any observable operator experience. Use `n.a.` with a concrete reason
for docs-only, metadata-only, or evidence-only changes where no behavior path
exists.

- Behavior or issue addressed: describe the observable behavior, issue, or n.a. reason
- Real environment tested: list the real environment, production path, or n.a. reason
- Exact steps or command run after this patch: list exact steps, command, or n.a. reason
- Evidence after fix: link artifact, copied output, screenshot, redacted log, runtime-card ref, or n.a. reason
- Observed result after fix: state the observed result, or n.a. reason
- What was not tested: list untested paths, or `none` with reason
- Proof limitations or environment constraints: state limitations, blockers, or `none`
- Before evidence, if available: link before evidence, summarize baseline, or `n.a.` with reason

Behavior proof guidance: Behavior proof is separate from unit tests and CI. Use
it to show the actual production path or nearest meaningful operator path after
the patch. If the exact path could not run, state the blocker and the nearest
fallback. Do not paste secrets, raw transcripts, bulky telemetry, or local
absolute paths.

## Work Performed

- Plan IDs: list Linear keys, spec paths, plan paths, or `n.a.` with reason
- Linear reference: list `Refs JSC-N`, `Fixes JSC-N`, `Closes JSC-N`, or `n.a.` with reason
- Linked issue relationship: classify the linked issue relationship as implementation closure, preparatory/enabling work, standalone/untracked work, or `n.a.` with reason; for parent-goal references, state completed acceptance IDs or `none`
- Phase / slice: list completed phase, implementation slice, or `n.a.` with reason
- Session IDs: list Codex thread/session IDs, session-collector artifact IDs or paths, harness run IDs, or `n.a.` with reason. For AI-assisted work, include at least one session reference or explain why no session artifact was captured.
- Trace IDs: list CI workflow/job URLs, harness/eval/runtime trace IDs, runtime-card/evidence bundle artifact paths, review trace IDs, or `n.a.` with reason. For traced or evaluated work, include the trace or artifact reference used to verify the claim.
- AI session / traceability: map the AI session or trace reference to the work it supports; do not paste raw transcripts, prompts, secrets, or bulky telemetry into the PR body.
- Completed work: list implementation units, docs/config changes, or evidence-only work completed in this PR
- Affected surfaces: list code, tests, docs, PR template, CLI reference, workflow config, generated artifacts, examples, or `n.a.` with reason
- Documentation impact: classify required docs as updated or `n.a.` with reason, including README.md, SECURITY.md, CONTRIBUTING.md, AGENTS.md, ARCHITECTURE.md, governance docs, and existing deep-module README files
- Expected outcome alignment: state how this change preserves evals as a shared executable-spine and artifact-proof contract, or mark `n.a.` with reason
- Pattern scope inventory: for any steering feedback, review comment, or line-level correction that implies a broader design/API principle, name the principle, list sibling implementations or similar misbehavior classes searched, and state which siblings were changed, intentionally left unchanged, or deferred with tracker/evidence
- Meta-behavior proof: for repeated steering or high-signal corrections, name the durable repo/system change plus concrete repo path, command, or issue ID that prevents recurrence, or `n.a.` with tracked exception reason
- Repeated-error research: when the same error occurs twice, use `Source: ...; Candidate 1: ...; Candidate 2: ...; Candidate 3: ...; Chosen: ...; Implemented: ...`; otherwise `n.a.` with reason
- Acceptance trace: map completed acceptance items to evidence refs, or `n.a.` with reason
- Validation evidence: list command outcomes, CI jobs, repo-relative artifact paths, or `n.a.` with reason; do not paste local absolute paths
- Artifact evidence: list latest pointer, result artifact, manifest artifact, scorer results, baseline result, trace timeline, or `n.a.` with reason
- Review artifacts: list CodeRabbit, Codex, reviewer, or harness review artifacts, or `n.a.` with reason
- Durable evidence map: classify every local-only artifact reference as tracked receipt, PR comment, CI artifact URL, runtime-card/evidence-bundle ref, or `n.a.` with reason; use repo-relative paths only
- Runtime impact: state direct, transitive, dev-only, CI-only, runtime-facing, or `n.a.` with reason
- Closeout state: classify PR state, merge or auto-merge state, branch/worktree state, Linear state, next-lane routing, and any remaining blocker or waiting owner
- Learning / reinforcement: list promoted learnings, memory updates, or `none` with reason
- Deferred work: list follow-up work intentionally left out, or `none`

## Validation

Record exact commands actually run and their outcomes.

- verification_commands: list exact commands run here
- verification_outcomes: record pass/fail/blocked for each command here
- blocked_steps_reason: none if all planned steps ran
- Command: `pnpm verify` -> pass/fail/blocked/not run
- Command: `pnpm test` -> pass/fail/blocked/not run
- Command: `pnpm evals run fixtures/smoke/pr-closeout.case.json --json` -> pass/fail/blocked/not run
- Command: `pnpm evals check --json` -> pass/fail/blocked/not run
- Command: `pnpm evals check --smoke --json` -> pass/fail/blocked/not run
- Command: `pnpm evals state --json` -> pass/fail/blocked/not run
- Any other command(s):

## Review Artifacts

- Review status:
  - CodeRabbit review:
  - Independent reviewer:
  - Codex review:
- CodeRabbit: <link / artifact path / comment ID / n.a. with reason>
- Independent reviewer evidence: <reviewer + link / n.a. with reason>
- Codex: <link / artifact path / comment ID / n.a. with reason>
- CodeRabbit Semgrep: fixed / waived with rationale / n.a. with reason
- Additional evidence (if any):

## Risk And Rollback

- Risk:
- Rollback:

## Checklist

- [ ] I read `AGENTS.md`, `.harness/core/2026-05-18-evals-core.md`, and `UBIQUITOUS_LANGUAGE.md`.
- [ ] I kept phase-one hard blocks intact.
- [ ] I did not introduce runtime dependencies on sibling repositories.
- [ ] I recorded validation outcomes truthfully.
- [ ] I updated documentation when public commands, schemas, artifacts, or workflow expectations changed.
- [ ] I did not push directly to `main`; this PR is from a dedicated branch.
- [ ] Branch name follows policy (`codex/*` for agent-created branches).
- [ ] Merge is blocked until all required checks pass.

## Notes

Add one-paragraph merge rationale here.
