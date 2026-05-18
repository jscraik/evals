# ADR-006

## Title

Fixture Provenance, Privacy, And Holdout Policy

## Status

accepted

## Decision

Every real eval fixture must record provenance, owner, source repo, privacy
class, redaction status, retention status, promotion status, and whether it is
public, internal, or holdout material.

No real fixture may become a trusted baseline or release-gating case without
provenance and privacy metadata.

## Context

The repo's moat depends on real-regression fixtures from agent work. Those
fixtures may come from session logs, PRs, Linear issues, review artifacts,
skills, prompts, telemetry, or private operational evidence. That makes them
high value and high risk.

## Why This Decision Exists

This decision prevents fixture trust collapse and privacy leakage. Future agents
may capture real failures quickly without recording where they came from or
whether they are safe to store.

It compounds positively because provenance lets future agents understand why a
case exists, what it proves, who owns it, and whether it can be reused,
published, or promoted to a baseline.

## Alternatives Considered

- Capture fixtures first and add metadata later. Rejected because unlabelled
  fixtures become unsafe and hard to trust.
- Use only public synthetic fixtures. Rejected because the moat comes from real
  operational regressions.
- Store raw logs directly. Rejected because prompts, credentials, private
  workflow details, and user data may leak.

## Accepted Tradeoffs

- Fixture creation is slower.
- Some useful cases may stay quarantined.
- Redaction and retention rules add schema complexity.
- Baseline promotion needs ownership review.

## Anti-Drift Constraints

Must not reappear:

- private logs copied without redaction status;
- fixture without owner;
- baseline without source path;
- holdout cases exposed as normal fixtures;
- telemetry export containing raw sensitive fixture content;
- fixture promotion without review.

Regression indicator: a future agent cannot answer where a fixture came from,
what it contains, who owns it, and whether it is safe to reuse.

Hard block: no fixture copied from logs, sessions, PRs, Linear issues, prompts,
telemetry, or private workflow artifacts may be promoted without provenance,
redaction status, privacy class, and owner. Useful but unsafe fixtures stay
quarantined.

## Safe Revisit Conditions

Revisit if:

- fixtures are generated synthetically and carry no private source evidence;
- a stronger privacy classifier exists;
- owning repos adopt a stricter provenance model;
- migration preserves existing fixture trust metadata.

## Related Systems

- Future fixture provenance schema.
- Future suite manifest schema.
- coding-harness first suite.
- agent-skills first suite.
- .harness/refactors/preserve-repo-local-suite-boundaries.md

## Evidence

Facts:

- The intent requires fixture provenance and privacy classification.
- The triage classifies privacy leakage through fixtures or telemetry as
  critical.
- The strategy names fixture provenance and privacy as moat-critical.
- The repo-local suite boundary refactor blocks promotion without provenance.

Interpretation:

- Fixture trust is part of the moat, not a compliance afterthought.

Assumptions:

- Real operational fixtures will eventually include sensitive or semi-sensitive
  material.
