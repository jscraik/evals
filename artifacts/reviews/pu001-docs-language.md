# PU-001 Docs + Ubiquitous Language Review

## Findings

### medium
- Missing implementation-note and closure-evidence updates for the new artifact identity contract and scorer revision.
  - Evidence:
    - src/lib/runtime-evidence-contract.js:271 bumps `subagent-artifact-contract` to scorer_version `1.1.0`.
    - src/lib/runtime-evidence-contract.js:275-276 changes canonical phrasing to `artifact identity evidence` and `artifact identity closeout`.
    - test/cli.test.js:528-664 adds four new failure-shape tests for artifact identity mismatch, missing identity fields, traversal, and duplicate writes.
    - implementation-notes.html has no matching PU-001 update entry for this contract-tightening slice (latest visible notes are still phase-one closeout context around implementation-notes.html:186+).
    - .harness/evals/evals-evals-executable-spine-eval.md still documents historical smoke closeout evidence only and does not mention the runtime-evidence artifact-identity hardening lane.
  - Risk: reviewers and future agents can read stale governance/docs surfaces and miss that runtime truth now requires identity-level ArtifactExpected/ArtifactWritten matching and path-safety checks.
  - Remediation: add a short PU-001 note in implementation-notes plus a closure-evidence addendum/reference that records scorer_version 1.1.0 and the four new artifact-identity drift scenarios.

## Alignment Notes
- No vocabulary conflict found with core doctrine: current code language remains aligned with "artifacts decide; telemetry explains" and uses the repo’s canonical "runtime evidence contract" and "artifact identity" terms.
- Resolution evidence: the implementation notes now include a PU-001 artifact-identity decision entry with scorer version 1.1.0 and the expanded drift scenarios; the executable-spine closure artifact includes the JSC-346 addendum for the runtime-evidence trust-boundary lane.

WROTE: artifacts/reviews/pu001-docs-language.md
