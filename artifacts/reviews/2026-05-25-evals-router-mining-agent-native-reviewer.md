# Agent-Native Review: 2026-05-25 Evals Router External Code Tree Mining

## Scope
Reviewed file: `/Users/jamiecraik/dev/evals/.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md`

## Findings

### Warning 1: Opportunity slices are implementation-oriented but not agent-routable as executable units
- Evidence: `.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:252`, `:299`, `:338`, `:384`, `:431`, `:478`, `:517`, `:559`
- Why this matters: Each OPP block includes problem/fix/files/validation, but does not define a minimal execution packet that a subagent can run deterministically (for example: explicit artifact output path, expected status payload, and completion marker per opportunity). This increases coordinator ambiguity and weakens agent-native handoff reliability.
- Remediation: Add an `Execution Packet` subsection to each OPP including:
  - `owner_module`
  - `artifact_path` (for example `artifacts/evals/opp-001-health-checks.md`)
  - `required_status_line` (for example `WROTE: <path>`)
  - `minimum_validation_set` and expected pass/fail classification rules
  - `blocked_status_contract` for deterministic blocker reporting
- Fixable now in audit doc: Yes.

### Warning 2: Validation guidance is command-only and lacks required evidence capture contract
- Evidence: `.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:285-291`, `:325-330`, `:371-376`, `:417-423`, `:464-470`, `:505-510`, `:546-552`
- Why this matters: Commands are listed, but there is no explicit rule for what evidence must be persisted (for example exact output snippets, generated artifact paths, and failure ownership classification). In multi-agent or resumed runs, this creates non-repeatable closeout decisions.
- Remediation: For each OPP, append an `Evidence Contract` with:
  - required command outputs to capture
  - required artifact file paths to list
  - failure-ownership classification labels (`introduced`, `pre-existing`, `environment`, `unrelated_dirty_tree`)
  - pass criteria that map directly to the acceptance bullets
- Fixable now in audit doc: Yes.

### Observation 1: Next-step guardrails are strong but not location-specific for deep-module packet artifacts
- Evidence: `.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:613-623`
- Why this matters: The `next_check` sequence gives good behavioral constraints, but does not specify where deep-module fix packets should be written, making discovery non-deterministic for agents entering later.
- Remediation: Add a canonical destination pattern (for example `.harness/refactors/<date>-opp-<id>-deep-module-fix.md`) and require each implementation PR/slice to reference it.
- Fixable now in audit doc: Yes.

## What Works Well
- The audit is phase-one-safe and explicitly rejects non-compliant expansion patterns (`:580-591`).
- Opportunity sequencing is clear and bounded (`:592-601`).
- Each opportunity already includes candidate touchpoints and acceptance intent, which is a strong base for agent execution once evidence/output contracts are added.

WROTE: artifacts/reviews/2026-05-25-evals-router-mining-agent-native-reviewer.md
