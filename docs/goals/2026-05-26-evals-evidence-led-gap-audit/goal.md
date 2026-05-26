# Goal: Evals Evidence-Led Gap Audit Implementation

## Objective

Execute the actionable recommendations from
\`.harness/research/audits/2026-05-25-evidence-led-codebase-gap-audit.md\`
as a governed implementation program for the evals repository.

The program must improve runtime truth, claim-vs-evidence verification,
mechanical architecture enforcement, traceability, recovery, context routing,
and governance without widening phase-one authority.

## Operating Boundary

This goal is bounded to the evals repository. It must preserve the current
phase-one doctrine:

- evals owns shared runner mechanics, canonical schemas, artifact bundles,
  deterministic scorer contracts, baseline result shape, and closure evidence.
- consumer repositories own suite intent, real fixtures, rubrics, thresholds,
  privacy approval, and baseline promotion.
- artifacts decide; telemetry, model confidence, PR comments, Linear comments,
  and session summaries explain only.
- the implementation must not introduce dashboards, plugin systems, cloud
  runners, external adapter roots, networked suite execution, source-mining
  automation, required LLM judge gates, or runtime dependencies on
  \`coding-harness\`, \`agent-skills\`, diagram tooling, session collectors, or
  telemetry collectors.

## Source Evidence

Read before changing implementation:

- \`AGENTS.md\`
- \`.harness/core/2026-05-18-evals-core.md\`
- \`UBIQUITOUS_LANGUAGE.md\`
- \`.harness/research/audits/2026-05-25-evidence-led-codebase-gap-audit.md\`
- \`.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md\`
- \`ARCHITECTURE.md\`
- \`.harness/refactors/2026-05-20-deep-module-fix-mechanics.md\`
- \`.harness/refactors/2026-05-20-parent-child-loop-guardrail.md\`

## Goal Strategy

Start with the highest-risk false-success and stale-evidence boundaries before
broader maturity work:

1. Add a pre-mutation latest-artifact integrity gate so stale or malformed
   latest pointers cannot be replaced before validation.
2. Split \`check\` into explicit latest-artifact and live-state semantics so one
   command cannot accidentally imply the other.
3. Add explicit JSON output schemas for command result surfaces that are relied
   on by agents, docs, and future CI checks.
4. Add mechanical architecture-boundary validation for phase-one hard blocks and
   deep module ownership.
5. Improve JSON diagnostics and duplicate-key rejection where input artifacts
   are parsed as authority.
6. Reconcile documentation, AGENTS guidance, validation commands, and closure
   evidence after implementation slices are proven.

## Required Deep Module Rule

Every implementation slice must define the deep owner module, public interface,
hidden implementation rule, caller contract, seam test, tracer proof, rollback
path, and validation gate before changing runtime code.

Implementation notes must be maintained at:

\`.harness/implementation-notes/2026-05-26-evals-evidence-led-gap-audit-notes.mdx\`

## Parent Loop

The parent loop owns:

- task queue state;
- blocker classification;
- validation evidence;
- review requirements;
- documentation accuracy;
- GitHub and tracker truth when used;
- closeout evidence.

A child slice may close only its own implementation unit. It cannot close this
parent goal.

## Completion Criteria

This goal is complete only when:

- all P0/P1 gap-audit implementation slices are implemented, explicitly
  deferred with owner-approved rationale, or superseded by stronger evidence;
- each completed worker slice has narrow proof, required broader validation, and
  recorded rollback guidance;
- architecture and phase-one hard-block checks are enforced mechanically where
  feasible;
- documentation and AGENTS guidance match live repository behavior;
- implementation notes contain current deep-module placement and validation
  coverage;
- no known false-success, stale-evidence, reviewer, PR, CI, tracker, or docs
  blocker is hidden behind optimistic prose.

## Start Command

Use this board as the governed parent execution surface:

\`\`\`text
/goal Follow docs/goals/2026-05-26-evals-evidence-led-gap-audit/goal.md
\`\`\`
