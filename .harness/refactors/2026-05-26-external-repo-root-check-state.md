# External Repo Root Check/State Deep Module Packet

Date: 2026-05-26
Status: implemented for current slice

## Owner Module

- `src/lib/repo-root-option.js` resolves and classifies the artifact repository root.
- `src/commands/validation.js` owns `check --repo-root`.
- `src/lib/runtime-state.js` owns `state --repo-root`.
- `src/lib/claim-evidence-contract.js` owns evidence packets for the selected root.

## Public Interface

~~~bash
pnpm evals check --repo-root <path> --json
pnpm evals state --repo-root <path> --json
~~~

`--smoke` cannot be combined with an external `--repo-root` because the smoke
proof context is owned by the evals repository.

## Hidden Implementation Rule

External roots are artifact roots only. The commands read
`.harness/evals/runs/latest.json` and repo-relative artifact paths under the
target root. They do not run consumer commands, validate domain behavior, infer
CI/PR readiness, promote baselines, or treat evals-local runtime-evidence
fixtures as consumer policy coverage.

## Caller Contract

Callers must run a repo-local suite first so the consumer root has
`.harness/evals/runs/latest.json`. If they need domain truth, they run
project-local tests and evals in the owning repo.

## Seam Test

`test/cli.test.js` creates a synthetic consumer `.evals/suite.json`, runs it
through evals, then validates `check --repo-root` and `state --repo-root`
against the consumer root.

## Tracer Proof

The state evidence packet records the selected repo root, repo name, git state,
latest artifact status, and readiness verdict. For external roots, runtime
evidence contract health is reported as `not_configured`, because evals-local
offline fixture coverage does not prove consumer runtime policy coverage.

## Rollback Path

Remove `--repo-root` parsing and restore check/state to the default evals repo
root. Consumer artifact validation would remain possible only through internal
validator calls from tests or scripts.

## Validation Gate

- `node --test test/cli.test.js`
- `pnpm evals check --json`
- `pnpm evals state --json`
- `pnpm evals check --repo-root <existing-consumer-repo-with-latest> --json`
- `pnpm evals state --repo-root <existing-consumer-repo-with-latest> --json`
- `pnpm test`

The focused CLI seam test creates and verifies a temporary consumer root. The
explicit `--repo-root` commands above require an existing consumer checkout with
an already-written `.harness/evals/runs/latest.json`.
