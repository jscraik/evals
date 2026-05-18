# ADR-004

## Title

Repo-Local Suites Own Domain Truth

## Status

accepted

## Decision

The shared evals repo owns runner mechanics, canonical schemas, artifact
contracts, scorer interfaces, baseline semantics, and suite manifest structure.

Consuming repos own their suite intent, fixtures, domain rubrics, acceptance
thresholds, and baseline promotion decisions.

## Context

The first target consumers are coding-harness and agent-skills. Both have local
workflow vocabulary and validation surfaces. Centralizing their suite truth in
the shared evals repo would make the shared repo look more complete while
weakening local meaning.

## Why This Decision Exists

This decision prevents the shared evals repo from becoming a domain sink. Future
agents may copy fixtures, rubrics, or thresholds into the shared runtime because
it seems efficient.

The decision compounds positively because each repo can evolve its workflows
locally while still using shared eval mechanics and comparable result artifacts.

## Alternatives Considered

- Centralize all suites and fixtures in evals. Rejected because local domain
  meaning and ownership would drift.
- Let each repo invent its own full eval runtime. Rejected because schemas,
  artifact layout, and baseline semantics would diverge.
- Put only docs in evals and no shared runtime. Rejected because this would not
  reduce repeated harness work.

## Accepted Tradeoffs

- Cross-repo adoption requires explicit ownership metadata.
- Some suite code may live outside evals.
- Shared runtime cannot impose one universal threshold.
- Baseline promotion needs owner approval.

## Anti-Drift Constraints

Must not reappear:

- central dataset registry before real cases;
- repo-specific domain assertions hidden in shared runtime;
- copied private fixtures without owner/provenance;
- generic suite names that erase domain meaning;
- shared thresholds imposed on local workflows.

Regression indicator: future agents cannot tell whether a failure belongs to
the eval runtime, adapter boundary, or owning repo.

Hard block: the shared evals repo must not become the owner of coding-harness or
agent-skills acceptance truth. If a suite name, fixture, threshold, or rubric
cannot name its owning repo, it is not promotable.

## Safe Revisit Conditions

Revisit if:

- multiple repos independently promote the same suite concept;
- ownership metadata and provenance remain intact;
- centralization demonstrably reduces duplication without weakening local
  domain truth;
- a migration eval proves boundaries remain readable.

## Related Systems

- coding-harness
- agent-skills
- Future suite manifests.
- .harness/refactors/preserve-repo-local-suite-boundaries.md
- ADR-002 Canonical Result Schema And Adapter Boundary.

## Evidence

Facts:

- The intent says coding-harness and agent-skills must own their behavior.
- The review calls shared runtime plus local suites a deep boundary.
- The strategy names repo-local suite ownership as a non-negotiable.
- The refactor program defines separate shared-runtime and consuming-repo
  responsibilities.

Interpretation:

- Suite ownership is a moat boundary because local failures are the valuable
  data.

Assumptions:

- Consuming repos can host or generate their own real fixtures.
