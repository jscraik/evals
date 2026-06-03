# Architecture

This document is a map of the evals codebase. It is meant to answer two
questions quickly:

- Where should a change go?
- Which architectural boundaries must the change preserve?

It follows the spirit of Matklad's ARCHITECTURE.md guidance: keep the map short,
name important modules, describe stable boundaries, and call out invariants,
especially the things that are intentionally absent.

For operating rules and validation commands, read AGENTS.md. For project
vocabulary, read UBIQUITOUS_LANGUAGE.md. For the compressed doctrine, read
.harness/core/2026-05-18-evals-core.md.

## Bird's Eye View

Evals is a local-first executable proof spine. It is also a shared contract
verifier, not a behavior oracle.

Its job is to take repo-local evaluation data, run a deterministic local command,
write an artifact bundle, and make that bundle checkable by humans and agents.
It does not try to be a hosted evaluation platform, a dashboard, a provider
adapter system, or a domain-truth owner for consumer repositories.
Project-local suites and tests prove project-specific behavior. Evals verifies
the reusable artifact, schema, scorer, and evidence contracts those projects
choose to emit.

The core flow is:

```text
eval case or suite
    |
    v
CLI command
    |
    v
case / suite contract validation
    |
    v
synthetic local run
    |
    v
artifact bundle
    |
    v
deterministic scorers and baseline state
    |
    v
trace event timeline and latest pointer
    |
    v
check / state / closure evidence
```

The most important architectural rule is:

```text
Artifacts decide. Telemetry explains.
```

A run is trustworthy only when local artifacts and deterministic validators prove
it. Reports, session summaries, PR comments, Linear comments, model confidence,
and telemetry can explain what happened, but they do not become authority.

## Inputs And Outputs

The primary inputs are data files:

- eval case JSON fixtures;
- repo-local suite JSON files;
- proof contract JSON such as claim registries and score vectors;
- runtime-evidence fixtures used to classify Codex-shaped behavior offline.

The primary outputs are local artifact bundles under .harness/evals/runs. A
normal run writes result, report, command log, manifest, scorer results,
baseline result, trace events, and the latest pointer.

The primary validation surfaces are:

- pnpm evals run fixtures/smoke/pr-closeout.case.json --json;
- pnpm evals check --json;
- pnpm evals check --repo-root /path/to/consumer-repo --json;
- pnpm evals state --json;
- pnpm evals state --repo-root /path/to/consumer-repo --json;
- pnpm evals validate-schema claim-registry path/to/file.json --json;
- pnpm evals validate-schema score-vector path/to/file.json --json;
- pnpm test;
- pnpm verify.

## Code Map

This section names the important files and modules. Use symbol search for the
function names; avoid treating this document as an inline API reference.

### package.json

package.json defines the public local script surface. The repository currently
has no runtime dependencies and no dev dependencies. That is architectural, not
accidental: phase one keeps the proof spine runnable with local Node and repo
files.

Architecture Invariant: adding a dependency is a design change, not routine
cleanup. The default answer is to keep proof contracts and runner mechanics
local unless a deep module packet proves that a dependency lowers risk.

### src/cli.js

src/cli.js is the executable entrypoint for pnpm evals. It parses the small CLI
surface and dispatches to command modules.

Architecture Invariant: src/cli.js is not a domain owner. It should route to
commands, print usage, and stay boring. Proof behavior belongs in src/lib
owners.

### src/lib/repo-root-option.js

repo-root-option owns the optional artifact repository root accepted by
inspection commands. It resolves a user-supplied directory and keeps the
contract explicit: external roots are artifact roots for check/state, not
execution roots for consumer behavior.

Architecture Invariant: --repo-root is read-side artifact authority only. It
must not become an adapter system, plugin hook, source-mining root, or hidden
permission to run consumer commands.

### src/commands

The command modules turn CLI requests into calls to deep modules.

- src/commands/run.js owns the command wiring for single-case and suite runs.
- src/commands/validation.js owns validate, validate-schema, and check command
  wiring.
- src/commands/state.js owns the state command wiring.

Architecture Invariant: command modules may format output and choose exit codes,
but they should not duplicate schema rules, path containment, artifact rules,
scoring rules, or trace rules. If command code starts knowing too much, move the
behavior behind a src/lib owner.

### src/lib/case-contract.js

case-contract is the owner for eval case validation and parsing. It enforces the
case schema, required identifiers, local artifact path rules, and phase-one
policy constraints such as rejecting network-enabled fixtures.

Architecture Invariant: an eval case is a data contract. It is not executable
plugin configuration and it is not allowed to smuggle domain authority into this
repo.

### src/lib/suite-contract.js

suite-contract is the owner for repo-local suite loading. A suite points at local
cases, local artifact roots, and data-only scorer references.

Architecture Invariant: suites are local data contracts owned by consumer repos.
They are not plugin roots, network runners, or a way for evals to absorb a
consumer repo's domain truth.

### src/lib/run-bundle.js and src/lib/artifact-bundle.js

run-bundle creates the per-run artifact directory and run ID. artifact-bundle
defines the artifact contract used by latest.json, manifests, and result
artifact references.

Architecture Invariant: artifact bundle shape is core architecture. Callers
should not independently construct latest paths, required artifact keys, or
manifest reference rules.

### src/lib/latest-run.js

latest-run validates .harness/evals/runs/latest.json and the artifacts it points
to. It checks proof context, required artifacts, manifest references, scorer
results, baseline result, trace timeline, and recovery guidance.

Architecture Invariant: latest.json is a proof pointer, not a convenience cache.
It must not allow agents to infer readiness from "newest-looking" directories or
from result.json alone.

### src/lib/trace-events.js

trace-events owns the local trace event timeline. It builds and validates
ordered lifecycle events for a run.

Architecture Invariant: trace events are local replay evidence. They are not
external telemetry and they do not replace artifact validation.

### src/lib/scoring.js

scoring owns the built-in deterministic scorer behavior. It simulates the smoke
run output, evaluates runtime status, artifact completeness, baseline presence,
and combines scorer results into a deterministic verdict. Every scorer result
also emits assertion-result diagnostics so humans and agents can see the given
context, expected behavior, actual value, expected value, evidence references,
and reproduce command behind the verdict.

Architecture Invariant: absent deterministic scorer evidence is not success.
The repository should fail closed when it lacks the scorer facts required for a
verdict.

### src/lib/assertion-results.js

assertion-results owns the evals-native assertion diagnostic shape used by
deterministic scorers and shared contract checks. It borrows the readable
Given/should grammar from prior art, but keeps the runtime shape local and
schema-backed.

Architecture Invariant: assertion diagnostics explain deterministic evals-owned
checks. They are not a framework adapter, executable prompt suite, source-mining
contract, or required LLM judge aggregation surface.

### src/lib/schema.js

schema is the local JSON Schema engine. It maps schema keys to schema files,
supports the subset of JSON Schema used by this repository, validates documents,
and reports data-path errors.

Architecture Invariant: schemas under schemas are canonical. External framework
schemas can inspire adapters later, but they do not become the root contract.

### src/lib/proof-contract-validation.js

proof-contract-validation owns semantic checks for proof contracts that JSON
Schema cannot express by itself. It currently validates contracts such as claim
registries and score vectors.

Architecture Invariant: readiness semantics belong in proof contract validation,
not in README prose, PR templates, or caller-side checks.

### src/lib/runtime-evidence-contract.js

runtime-evidence-contract owns the offline fixture and scorer contract for
Codex-shaped runtime behavior: permission fallback, subagent artifact evidence,
plugin attribution, and similar local observations.

Architecture Invariant: runtime evidence fixtures classify behavior without
making evals a runtime authority for Codex, coding-harness, agent-skills, or any
other consumer repo.

### src/lib/runtime-state.js

runtime-state builds the JSON state packet emitted by pnpm evals state --json.
It aggregates latest validation, runtime evidence health, schema inventory, git
state, recommended commands, and blocker information.
It can also inspect a consumer repo's already-written latest artifact bundle
when routed through --repo-root, while marking evals-local runtime evidence
contract fixtures as not_configured for that external root.

Architecture Invariant: state output is an inspection surface. It helps agents
and humans decide what to run next, but check remains the deterministic gate.

### src/lib/claim-evidence-contract.js

claim-evidence-contract builds runtime evidence packets and scores missing
claim/evidence coverage.

Architecture Invariant: claim and evidence sufficiency should be machine
classifiable. Avoid converting it into narrative-only closeout text.

### src/lib/failures.js

failures owns structured failure emission and failure artifact writing. Commands
use it to produce consistent blocked or failed output.

Architecture Invariant: failure output is part of the user and agent contract.
Do not invent one-off failure shapes in command code.

### src/lib/paths.js and src/lib/hash.js

paths owns repo-relative and root-relative path containment. hash owns SHA-256
helpers for files and text.

Architecture Invariant: path containment and artifact hashing are security and
proof boundaries. Callers should not normalize paths or compute artifact digests
ad hoc.

### src/lib/json.js

json owns JSON read/write helpers and atomic writes.

Architecture Invariant: future parse diagnostics, duplicate-key handling, or
source-location reporting should start here so all validators receive the same
normalized failure shape.

### src/lib/report.js

report builds the human-readable run report.

Architecture Invariant: reports explain a run. They do not decide readiness and
they do not define artifact truth.

### schemas

schemas contains the canonical JSON contracts for eval cases, suites, results,
artifacts, latest pointers, scorer results, baseline results, trace events,
runtime state, runtime evidence, claims, evidence, and score vectors.

Architecture Invariant: a public JSON field is a compatibility surface. Additive
fields are preferred. Breaking changes require an explicit compatibility and
migration decision.

### fixtures

fixtures contains local replay data. The smoke fixture is the canonical
phase-one proof case. runtime-evidence fixtures prove runtime evidence
classification behavior without depending on live external systems.

Architecture Invariant: fixtures need provenance and privacy discipline. A
fixture is not trusted merely because it is convenient.

### test and tests

test contains Node unit and integration tests for the CLI, schemas, verification
gate, and workflow guardrails. tests contains documentation and PR-change
checks.

Architecture Invariant: tests prove seams and regressions. They do not replace
runtime artifacts, latest validation, or closure evidence.

### scripts/verify.js

verify is the local CI-equivalent wrapper. It checks required files, schemas,
the smoke command, latest validation, state output, and lightweight credential
patterns.

Architecture Invariant: pnpm verify is the broad local gate. When it fails,
classify whether the failure was introduced, pre-existing, environment-related,
or unrelated dirty worktree before claiming readiness.

### .harness

.harness contains specs, plans, ADRs, refactors, research, Linear artifacts,
implementation notes, media, and closure evidence. These files explain and
govern the executable spine.

Architecture Invariant: .harness documents can guide implementation, but docs
alone do not fix runtime, validation, artifact, schema, traceability, or safety
gaps.

## Layering

The preferred dependency direction is:

```text
src/cli.js
    -> src/commands/*
        -> src/lib/*
            -> schemas/*
            -> fixtures/*
            -> .harness/evals/runs/*
```

Important exceptions:

- scripts/verify.js calls public commands and direct filesystem checks because
  it is the validation wrapper.
- tests may reach into src/lib modules to prove seams directly.
- .harness files describe decisions and evidence but should not be imported by
  runtime code unless a specific contract says so.

Architecture Invariant: dependency direction should make proof behavior easier
to locate. If behavior is spread across command formatting, docs, generated
artifacts, and tests, the module is too shallow.

## Deep Module Rule

Evidence-led fixes should preserve the deep module format used by this repo:

- one owner module;
- one public interface;
- hidden implementation details behind that interface;
- caller contract;
- seam test;
- tracer proof;
- rollback path;
- validation gate.

This is the normal route for changes to runner, schema, validation, artifact,
baseline, trace, state, or governance mechanics.

## What Is Deliberately Absent

The following are intentionally absent during phase one:

- dashboards;
- hosted run viewers;
- external adapter roots;
- cloud runners;
- telemetry exporters as authority;
- plugin systems;
- source-mining automation as runtime behavior;
- required LLM judge gates;
- runtime dependencies on coding-harness, agent-skills, diagram-cli, session
  collectors, or OpenTelemetry collectors.

Architecture Invariant: external projects are prior art and future consumers.
They do not own evals runtime truth.

## Cross-Cutting Concerns

### Compatibility

Public JSON output should be additive unless a spec or ADR records a migration
decision. latest.json, result artifacts, manifests, scorer results, baseline
results, trace events, runtime state, and proof contracts are compatibility
surfaces.

### Security And Privacy

The repository is local-first, but it still treats path traversal, absolute
artifact pointers, credential-shaped text, network-enabled fixtures, and
unapproved provenance as proof risks. Path containment belongs in paths and
contract owners. Credential scanning belongs in verify.

### Observability

Local observability means command logs, reports, manifests, scorer results,
baseline results, trace events, latest validation, runtime state, and closure
evidence. External telemetry can explain behavior later, but the authoritative
phase-one evidence is local.

### Agent Usability

Agents should be able to answer:

- what command was run;
- which artifact bundle was produced;
- whether latest.json points at the expected proof context;
- which deterministic scorers passed or failed;
- what baseline state was observed;
- which command to run next.

This is why state, latest validation, trace events, and closure evidence are
first-class architecture.

### Consumer Repo Boundary

Consumer repositories own suite intent, real fixtures, rubrics, thresholds,
privacy approval, baseline promotion, and domain-specific scorer semantics.
Evals owns the proof contract, runner mechanics, schemas, artifact bundles,
deterministic result shape, and closure evidence model.

## Where To Put Common Changes

- A new CLI verb starts in src/cli.js and src/commands, but its behavior should
  move into src/lib.
- A new artifact belongs in run-bundle, artifact-bundle, latest-run, and schemas
  before callers rely on it.
- A new schema belongs in schemas and, when JSON Schema is insufficient, in the
  matching semantic validator.
- A new suite rule belongs in suite-contract.
- A new case rule belongs in case-contract.
- A new trace rule belongs in trace-events.
- A new scorer rule belongs in scoring or proof-contract-validation, depending
  on whether it scores a run or validates a proof contract.
- A new current-state field belongs in runtime-state and its schema.
- A new runtime evidence rule belongs in runtime-evidence-contract or
  claim-evidence-contract.
- A new broad gate belongs in scripts/verify.js only after the narrow proof
  exists.
- A new architecture or governance decision belongs in .harness, but it still
  needs runtime proof if it claims to fix runtime behavior.

## Reading Path For New Contributors

1. Read README.md for commands and doctrine.
2. Read this file for the code map.
3. Read UBIQUITOUS_LANGUAGE.md for stable terms.
4. Open src/cli.js to see the command surface.
5. Follow the command you care about into src/commands.
6. Jump from there to the owner module under src/lib.
7. Read the matching schema under schemas.
8. Read the matching tests under test or tests.
9. Run the narrow command first, then pnpm verify when behavior changed.

## Maintenance

Keep this file short enough to reread. Update it when:

- a new deep owner module is added;
- a public command is added or removed;
- artifact bundle shape changes;
- schema ownership changes;
- phase-one hard blocks change by ADR or spec;
- validation ownership moves.

Do not update it for every helper function, every test case, or every wording
change. The file is a map, not an atlas.
