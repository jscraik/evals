# Docs Expert Review

## Scope

Requested skill: docs-expert.

Target reader jobs:

- run and validate the local eval spine;
- contribute without expanding phase-one scope;
- understand security, privacy, support, tracker, and license boundaries;
- find the right evidence file without loading every historical planning doc.

## Evidence Map

| Claim | Evidence |
| --- | --- |
| Regression test command exists | package.json script 'test' runs 'node --test'. |
| Canonical smoke command exists | package.json script 'evals' runs 'node src/cli.js'; CLI help lists 'pnpm evals run <case-file> [--json]'. |
| Canonical validation command exists | package.json script 'check' runs 'node src/cli.js check'; CLI help lists 'pnpm evals check [--json]'. |
| Latest artifact validation exists | CLI help lists 'pnpm evals validate <case-file|latest.json> [--json]'. |
| Phase-one hard blocks are active | AGENTS.md and README.md block dashboards, adapters, cloud runners, telemetry authority, plugin systems, source mining, judge gates, and sibling runtime dependencies until a later ADR/spec opens scope. |
| Tracker is override-approved, not live Linear | '.harness/linear/2026-05-18-evals-tracker-override-approved.md' records 'linear_status: override_approved' and the unsupported Linear create failure. |
| Repo has no GitHub license metadata | 'gh repo view jscraik/evals --json licenseInfo' returned null. |

## Docs Created

- 'CONTRIBUTING.md'
- 'SECURITY.md'
- 'SUPPORT.md'
- 'LICENSE.md'

## Docs Updated

- 'README.md'

## Unknowns

- Whether the owner wants a standard open-source license later.
- Whether GitHub private vulnerability reporting is enabled for the public repo.
- Whether future milestone support should move from local docs to live Linear
  once issue creation works.

## Validation

Run after edits:

- 'git diff --check'
- pointer checks for README-linked docs
- 'pnpm test'
- 'pnpm evals --help'
- 'pnpm evals check --json'
- lightweight privacy regex over fixtures and eval artifacts
