# JSC-371 Deep Module Fix Packet: Repo-Local Suite Contract

## Scope

Add the smallest neutral repo-local suite contract without plugin, network, or executable scorer complexity.

Source trace from parent plan/spec:

- FR-006: suite file defines suite identity, owner repo, domain, purpose, cases, scorers, baseline, and artifact policy.
- FR-007 / SA-007: suite paths resolve relative to the suite root and reject traversal.
- FR-014 / SA-017: artifact_policy.allow_network true fails closed in phase one.
- FR-015 / SA-018: executable repo-local scorer hooks fail validation in phase one.
- SA-008: repo-local suite artifacts write to the evaluated repo, not implicitly to evals.
- Reviewer remediation: suite files must live under a discovered `.evals` boundary so a misplaced suite cannot publish artifacts to an arbitrary parent directory.
- Reviewer remediation: phase one requires `artifact_policy.write_bundle: true` and `artifact_policy.retain_locally: true`; unsupported false values fail closed instead of becoming ignored policy.

## Owner Module

`src/lib/suite-contract.js` should own only the new suite-contract boundary: suite schema loading, suite-root path resolution, phase-one suite policy checks, and normalized suite execution requests.

The implementation must build into the current deep modules rather than creating a parallel runner architecture:

- `src/lib/run-bundle.js` remains the artifact-root allocation owner. JSC-371 may extend its public interface to accept an evaluated repository root and artifact-root prefix, but callers must not hand-roll artifact paths.
- `src/lib/latest-run.js` remains the latest-pointer and artifact-bundle validation owner. JSC-371 may extend its public interface to validate latest pointers under an evaluated repository root, but suite callers must not duplicate latest validation.
- `src/lib/case-contract.js` remains the case parsing and case schema validation owner. Suite execution should feed it resolved case paths rather than re-implementing case parsing.
- `src/lib/paths.js` remains the path containment primitive owner. Suite-specific containment rules should use root-scoped helpers from this module.
- `src/lib/schema.js` remains the JSON Schema validation owner. Suite schema support should be added as another named schema target.

## Public Interface

Proposed suite loader seam:

```js
loadSuite(suitePath)
```

Returns a normalized suite request:

```js
{
  suitePath,
  suiteRoot,
  evaluatedRepoRoot,
  suite,
  cases,
  scorerRefs,
  baselinePath,
  artifactPolicy,
  artifactRootPrefix
}
```

The returned object is data-only. It does not load plugins, execute scorer code, shell out to consumer repos, or access the network.

## Hidden Implementation Rule

- Resolve `cases`, scorer config paths, and `baseline` relative to the suite file directory.
- Require the suite file to be inside a `.evals` directory; derive the evaluated repository root from that boundary only.
- Reject absolute paths and parent traversal before reading target files.
- Treat `artifact_policy.allow_network: true` as a validation failure in phase one.
- Treat `artifact_policy.write_bundle !== true` and `artifact_policy.retain_locally !== true` as validation failures in phase one.
- Treat scorer references that look like executable hooks, command strings, JS files, shell scripts, or package imports as validation failures in phase one.
- Preserve the existing smoke case path and smoke runner compatibility.
- Do not introduce registry, plugin, adapter, dashboard, cloud, source-mining, or judge-gate behavior.

## Caller Contract

- CLI callers may pass a case path or a suite path, but suite dispatch must go through `suite-contract` before `run` writes artifacts.
- Run artifact allocation for suite execution must use the evaluated repository root, not the evals package root, when the suite is outside evals.
- Suite validation failures must return structured JSON errors in `--json` mode.
- `src/commands/run.js` may orchestrate case versus suite execution, but it must not own suite policy, artifact-root allocation, latest validation, schema validation, or path traversal rules.

## Seam Tests

- Valid suite outside the evals repo resolves case, scorer, and baseline paths relative to the suite root.
- Suite files outside a `.evals` boundary fail before artifact publication.
- Suite path traversal in cases, scorers, baseline, or artifact root fails before reads/writes.
- `artifact_policy.allow_network: true` fails validation.
- `artifact_policy.write_bundle: false` and `artifact_policy.retain_locally: false` fail validation.
- Executable scorer hook references fail validation.
- Suite execution writes artifacts under the evaluated repo `.harness/evals/runs`, not under the evals package checkout.

## Tracer Proof

Suite-triggered runs must still produce the existing manifest, result, command log, report, scorer results, baseline result, trace events, latest pointer, and check/state validation evidence.

## Rollback Path

Revert suite schema, suite-contract loader, suite fixtures, suite dispatch, and run-bundle root extensions together. Existing single-case smoke runner behavior must remain restorable by rerunning:

```bash
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
```

## Validation Gate

Minimum commands for this slice:

```bash
pnpm test
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
pnpm evals check --json
pnpm evals state --json
pnpm verify
```

Add the new suite fixture command after the suite CLI shape is implemented.
