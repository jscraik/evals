# Evals Executable Spine

This repository owns the shared local eval runner and artifact contract. The
first useful behavior is intentionally small: one offline command runs one
synthetic smoke fixture, writes one replayable artifact bundle, computes
deterministic scorer verdicts, records baseline state, and leaves closure
evidence under '.harness/evals/'.

Evals is a shared contract verifier, not a behavior oracle. It proves reusable
promises such as artifact integrity, schema validity, evidence-backed claims,
and deterministic scorer verdict shape. Project-local tests and evals still own
project-specific behavior, product truth, thresholds, real fixtures, CI status,
and baseline promotion.

Canonical command:

```bash
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
```

Repo-local suite command:

```bash
pnpm evals run path/to/.evals/suite.json --json
```

Suite files are data contracts, not plugins. A suite owns local case, scorer,
and baseline references under its own `.evals/` directory, while this runner
owns schema validation, path containment, artifact bundle writing, and
deterministic verdict shape. Phase one rejects network-enabled suites and
executable scorer hooks.

Canonical validation command:

```bash
pnpm evals check --json
```

Canonical smoke proof-context validation command:

```bash
pnpm evals check --smoke --json
```

Current-state command:

```bash
pnpm evals state --json
```

External artifact inspection commands:

```bash
pnpm evals check --repo-root /path/to/consumer-repo --json
pnpm evals state --repo-root /path/to/consumer-repo --json
```

These commands inspect the consumer repo's already-written
`.harness/evals/runs/latest.json` and repo-relative artifact bundle paths. They
do not execute consumer behavior, prove domain correctness, prove CI or PR
readiness, promote baselines, or make evals the source of truth for that
project. The smoke proof-context check is evals-owned and cannot be combined
with `--repo-root`.

Proof contract schema command:

```bash
pnpm evals validate-schema claim-registry path/to/claim-registry.json --json
pnpm evals validate-schema score-vector path/to/score-vector.json --json
```

This command validates the shared claim registry and score-vector data contracts
and their local semantic invariants. It is intentionally data-only: it does not
load consumer plugins, execute scorers, call external services, or promote a
baseline.

Regression test command:

```bash
pnpm test
```

## Documentation

- 'AGENTS.md': agent operating rules and scoped discovery.
- 'CONTRIBUTING.md': contribution workflow, validation, artifact policy, and PR
  expectations.
- 'LICENSE.md': Apache License 2.0 terms.
- 'SECURITY.md': phase-one security and privacy handling.
- 'SUPPORT.md': reproduction and troubleshooting path.
- 'UBIQUITOUS_LANGUAGE.md': project terms and wording boundaries.

## Doctrine

- Artifacts decide.
- Telemetry explains.
- LLM judges advise until calibrated.
- Repo-local suites own domain truth.
- Shared evals verify reusable contracts; project-local tests and evals prove
  project truth.
- External frameworks are adapters, not roots.

## License

This repository is licensed under the Apache License, Version 2.0. See
'LICENSE.md' for the full license text.

The compressed context entrypoint is
'.harness/core/2026-05-18-evals-core.md'. Read that before deeper strategy,
review, or triage files.

## Discovery

Always read:

1. '.harness/core/2026-05-18-evals-core.md'
2. 'UBIQUITOUS_LANGUAGE.md'
3. The focused schema, fixture, runner, or artifact file being changed.

Load deeper planning surfaces only when the task touches their scope:

- '.harness/specs/2026-05-18-evals-executable-spine-spec.md' for acceptance
  IDs, scope changes, closure criteria, or implementation-status changes.
- '.harness/plans/2026-05-18-evals-executable-spine-plan.md' for phase
  sequencing, validation expansion, or delivery-state edits.
- '.harness/references/local-reuse-map.md' when borrowing concepts from
  'coding-harness' or 'agent-skills'.

## Phase-One Hard Blocks

Until a later ADR or spec explicitly opens the next phase, do not add:

- dashboard or hosted run viewer;
- external adapter or framework-native schema root;
- cloud runner or hosted service dependency;
- telemetry exporter as authority;
- plugin system;
- source-mining automation;
- required LLM judge gate;
- runtime dependency on prior-art assertion frameworks;
- runtime dependency on 'coding-harness' or 'agent-skills'.

Sibling repos are prior-art references and future consumers. They do not own
this repo's phase-one runtime behavior.

## Tracker State

Linear issue creation remains unavailable because
`mcp__codex_apps__linear_save_issue` fails with 'unsupported call'. Jamie
approved the exceptional tracker override recorded in
'.harness/linear/2026-05-18-evals-tracker-override-approved.md'. This does not
create a Linear issue; it satisfies the spec's override path for the phase-one
local executable spine and preserves the recovery condition to create or link
the Linear parent issue when issue creation becomes available.

## Local Artifacts

A passing smoke run writes:

- '.harness/evals/runs/<run-id>/result.json'
- '.harness/evals/runs/<run-id>/report.md'
- '.harness/evals/runs/<run-id>/command-log.json'
- '.harness/evals/runs/<run-id>/manifest.json'
- '.harness/evals/runs/<run-id>/scorer-results.json'
- '.harness/evals/runs/<run-id>/baseline-result.json'
- '.harness/evals/runs/latest.json'

'scorer-results.json' contains deterministic scorer results plus assertion
diagnostics in the evals-owned Given/should shape: given context, expected
behavior, actual value, expected value, evidence references, reproduce command,
and pass/fail status. 'result.json' repeats failed assertions so failure
triage can start from the artifact bundle without scraping report prose.

'latest.json' names the latest run ID, case ID, manifest path, result path,
report path, command log path, baseline result path, and scorer results path
so agents do not have to guess the newest artifact directory or detour through
result.json for first-order evidence.

`pnpm evals state --json` reads that latest pointer and emits a schema-backed
runtime state packet. It classifies the local proof surface as `ready`, `stale`,
`missing`, or `invalid`, lists artifact presence, and names the next validation
command without running hidden work.

The state packet also includes a runtime evidence packet with local git state,
recommended commands, blocker state, validation evidence, runtime-evidence
contract health, and claim/evidence sufficiency. Telemetry and model confidence
remain advisory; local artifacts and deterministic validators decide readiness.

Current public packet versions are:

- validation result: `schema_version: 2`
- runtime state: `schema_version: 3`
- runtime evidence packet: `schema_version: 2`
- embedded claim and evidence records: `schema_version: 1`

The runtime state and runtime evidence packet versions were bumped when shared
contract metadata, runtime-evidence health, and advisory external-root
`authority_classification.adoption_readiness` became part of the public shape.
Claim and evidence records stayed at version 1 because their individual record
contract did not change.

When `--repo-root` points at another repository, `pnpm evals check --repo-root
<path> --json` validates artifact consistency only. Until that repository has
an explicit runtime-evidence policy, the command fails the runtime-evidence
coverage check and the state packet's runtime readiness verdict remains
fail/advisory. `authority_classification.adoption_readiness` separately reports
whether the target supplied manifest, privacy, execution-policy,
artifact-policy, and suite-quality inputs for artifact-only inspection. Neither
field certifies target behavior, CI, review, tracker, or merge readiness.

Phase-one run artifacts are retained locally. Automatic retention duration is
not defined yet; keep committed artifact bundles only when they are part of
cited proof or closure evidence.

## Closure Evidence

Completion requires '.harness/evals/evals-evals-executable-spine-eval.md'
with command output, artifact paths, schema validation, scorer verdicts,
baseline field values, drift status, rollback status, tracker state, and a
pass/fail/blocked/not-applicable classification for docs, schema, smoke,
security, accessibility, traceability, and implementation checks.

Schema validation is proven by `pnpm evals check --json`, which validates the
observed latest result, latest manifest, latest scorer results, latest baseline
result, trace event timeline, and manifest artifact hashes. Use
`pnpm evals check --smoke --json` when a gate must additionally prove that the
latest packet matches the canonical smoke fixture context.

Runtime readiness is queried with `pnpm evals state --json`; the state packet is
advisory evidence for humans and agents, while `pnpm evals check --json` remains
the observed-latest validation gate and `pnpm evals check --smoke --json` remains
the deterministic smoke-context gate.

Optional claim registries and score vectors can be checked directly with
`pnpm evals validate-schema <claim-registry|score-vector> <json-file> --json`.
The validator rejects contradictory proof contracts such as duplicate claim IDs,
inverted claim source spans, tested claim counts greater than total claim counts,
or score vectors that report strong readiness while a critical gate is failed or
blocked.

Passing the command alone is not completion.

`pnpm test` covers the CLI success path, structured fixture failures, path
traversal rejection, invalid fixture policy/schema fields, manifest hash
mismatches, and malformed generated artifact JSON.
