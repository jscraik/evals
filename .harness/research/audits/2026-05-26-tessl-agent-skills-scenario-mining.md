# Tessl Agent-Skills Scenario Mining

Date: 2026-05-26

## Purpose

Use Tessl's tessl-labs/tessl-skill-eval-scenarios skill as a quarantined scenario-mining source for evals. Tessl can help generate scenario families, but it must not become evals runtime authority, CI authority, scorer execution, or baseline-promotion authority.

## Boundary Decision

Tessl is useful as upstream scenario-generation input. Evals remains responsible for suite contract validation, local artifact bundle shape, schema-backed scorer verdicts, baseline result shape, runtime evidence packet shape, privacy and provenance checks, and deterministic check/state/verify behavior.

Consumer repositories remain responsible for suite intent, real fixture truth, domain-specific rubrics, threshold decisions, privacy approval, baseline promotion, and skill-specific or project-specific behavior.

## Local Experiment

The experiment ran in an isolated sibling worktree, not in the dirty agent-skills checkout.

| Field | Value |
| --- | --- |
| Source repo | /Users/jamiecraik/dev/agent-skills |
| Isolated worktree | /Users/jamiecraik/dev/agent-skills-tessl-scenario-mining |
| Branch | codex/tessl-scenario-mining |
| Tessl tile installed | tessl-labs/tessl-skill-eval-scenarios version 0.1.0 |
| Target skill | Skills/agent-ops/testing/SKILL.md |
| Generated tile | tiles/testing-validation-proof/tile.json |
| Generated scenarios | tiles/testing-validation-proof/evals/scenario-0 through scenario-4 |

Tessl initialization created project-local Tessl, MCP, and agent integration files in the isolated worktree. Those files are not automatically canonical for agent-skills or evals.

## Validation Evidence

| Check | Result | Evidence | Notes |
| --- | --- | --- | --- |
| Tessl install | pass | tessl install tessl-labs/tessl-skill-eval-scenarios | Installed tessl-labs/tessl-skill-eval-scenarios version 0.1.0 after Tessl initialized local project files. |
| Tessl tile lint | pass | tessl tile lint tiles/testing-validation-proof | Output: Tile local/testing-validation-proof at 0.0.1 is valid. |
| Scenario JSON parse | pass | jq empty across tile, instructions, summaries, and criteria files | All JSON parsed. |
| Rubric score totals | pass | jq score-total check for each scenario criteria file | All five scenario rubrics summed to 100. |
| Tessl platform eval run | blocked | Not invoked | External model/platform run would create remote eval state and is not needed for this local scenario-mining proof. |

## Generated Scenario Pack

| Scenario | Capability | Main Behavior Tested | Useful Evals Pattern |
| --- | --- | --- | --- |
| scenario-0 | Smallest adequate proof | Select exact changed-path proof before broad gates and avoid guessed defaults. | Exact behavior proof before broad confidence claims. |
| scenario-1 | Blocked validation classification | Mark permission-blocked proof as blocked, name nearest proof and unblock condition. | Blocked-vs-failed-vs-passed runtime evidence classification. |
| scenario-2 | Failure ownership and rerun discipline | Stop at failed required schema gate, classify current-patch ownership, rerun same gate. | Required gate failure handling and anti-blind-retry behavior. |
| scenario-3 | Reviewer advice versus deterministic gates | Keep reviewer approval advisory and reject stale generated artifacts as proof. | Artifact freshness and reviewer-evidence boundary. |
| scenario-4 | Secret-safe validation reporting | Redact credential-shaped log content and avoid public leakage. | Privacy and provenance hardening for real fixtures and validation logs. |

## What Is Useful To Evals

### 1. Repo-Local Suite Seed Pattern

The tile pack confirms that agent-skills can produce realistic scenario families around validation discipline without requiring evals to understand skill internals. The next deterministic evals step should be a repo-local .evals/suite.json in a clean agent-skills branch or worktree, using these scenario families as source material.

### 2. Runtime Evidence Enforcement Candidates

The generated scenarios map cleanly to currently scaffolded or partially enforced evidence concerns:

- blocked validation classification;
- stale artifact rejection;
- reviewer evidence boundary;
- command proof versus broad proof;
- secret-safe reporting.

These should be converted into evals runtime-evidence fixtures one at a time, with deterministic scorer checks added before broadening the suite.

### 3. Macro-Level Fixture Families

The scenarios are more useful as behavior families than as one-off examples. Good macro-level fixture families include:

- broad gate passed but changed path unproven;
- validation blocked by environment but reported as complete;
- required schema gate failed but workflow widened anyway;
- reviewer approved but artifact evidence is stale;
- logs contain credential-shaped content and must be redacted.

### 4. Privacy and Provenance Pressure

scenario-4 is directly relevant before real fixtures become broader or more sensitive. It demonstrates that privacy/provenance checks need to cover logs, fixtures, prompts, PR text, generated reports, and credential-shaped values, not only source files.

## What Should Stay Out Of Evals

Do not add Tessl to:

- pnpm verify;
- pnpm evals check --json;
- pnpm evals state --json;
- src/lib/suite-contract.js runtime behavior;
- src/lib/runtime-evidence-contract.js runtime behavior;
- CI-required gates;
- required scorer execution;
- baseline promotion authority.

Tessl may remain a research/scenario-mining input. Deterministic fixtures must be normalized into repo-owned schemas before they become evals proof.

## Consumer Suite Seed Completed

The first normalized consumer suite was created in the isolated agent-skills
worktree, not in the dirty canonical checkout:

~~~text
/Users/jamiecraik/dev/agent-skills-tessl-scenario-mining/.evals/
  suite.json
  cases/
    testing-smallest-proof.case.json
    testing-blocked-validation.case.json
  scorers/
    testing-validation-contract.scorer.json
~~~

The fixtures are intentionally synthetic consumer-contract fixtures. The
current phase-one case contract rejects non-synthetic fixtures and requires
`input.command` to be `simulate-pr-closeout`, so the suite captures
agent-skills testing behavior as payload evidence rather than executable
agent-skills commands. That preserves the current evals boundary: evals owns
artifact and scoring mechanics; agent-skills still owns the real skill behavior.

| Check | Result | Evidence | Notes |
| --- | --- | --- | --- |
| JSON shape | pass | `jq empty .evals/suite.json .evals/cases/*.json .evals/scorers/*.json` | Valid JSON for suite, cases, and data-only scorer reference. |
| Suite run | pass | `pnpm evals run /Users/jamiecraik/dev/agent-skills-tessl-scenario-mining/.evals/suite.json --json` | Produced two passing synthetic run bundles in the consumer worktree. |
| Consumer latest validation | pass | `validateLatestRun(".harness/evals/runs/latest.json", { artifactRepoRoot: "/Users/jamiecraik/dev/agent-skills-tessl-scenario-mining" })` | Latest context: `testing-blocked-validation`, suite `agent-skills-testing-proof`, synthetic execution. |
| Evals repo check | pass | `pnpm evals check --json` | Confirms the evals repo latest packet remained valid after the external suite run. |
| Evals repo state | pass | `pnpm evals state --json` | Confirms the evals repo runtime state remained ready. |

Generated consumer run IDs:

- `20260526T140129Z-testing-smallest-proof-4ea90922`
- `20260526T140129Z-testing-blocked-validation-70f1782f`

Public CLI follow-up: evals now exposes first-class artifact inspection for an
existing consumer repo root:

~~~bash
pnpm evals check --repo-root /path/to/consumer-repo --json
pnpm evals state --repo-root /path/to/consumer-repo --json
~~~

This resolves the public-check seam without making Tessl, agent-skills, or the
consumer worktree runtime authorities for evals. The commands inspect an
already-written latest packet and artifact bundle under the supplied repo root.
They do not execute agent-skills behavior, certify the skill, prove CI/PR
readiness, or promote a baseline. The isolated worktree named above was a
bounded experiment target; if it has been deleted during repo hygiene, rerun or
promote the consumer suite in a fresh worktree before using it as a
`--repo-root` target.

## Recommended Follow-Up Slices

### Slice 1: Promote Agent-Skills Suite Seed

Review the isolated worktree suite and decide whether to move it into the
canonical agent-skills repository. If promoted, keep it as a synthetic
consumer-contract suite until a later spec opens real fixture execution.

Expected proof: evals can load the consumer suite, resolve local cases and
data-only scorer references, write a local artifact bundle in the consumer repo,
and validate latest artifact consistency without executing agent-skills
behavior.

### Slice 2: Enforce One Runtime Evidence Policy

Convert the blocked-validation family into a deterministic runtime-evidence fixture and scorer check.

Candidate owner module:

- src/lib/runtime-evidence-contract.js

Candidate fixtures:

- blocked command with nearest proof present;
- blocked command with missing unblock condition;
- command reported pass despite blocked proof.

### Slice 3: Macro Fixture Family

Add a small macro fixture group that proves repeated false-success behavior patterns rather than a single smoke path:

- broad-only validation false success;
- stale generated artifact false success;
- reviewer-only false success;
- blocked validation reported as complete.

### Slice 4: Privacy/Provenance Hardening

Expand privacy/provenance checks before broad real fixtures:

- credential-shaped log redaction;
- fixture provenance required for real cases;
- public report redaction expectations;
- baseline promotion requires privacy approval status.

## Open Questions

1. Should the first canonical consumer suite be promoted from the isolated Tessl worktree into the main agent-skills repository?
2. Should evals add a first-class macro fixture directory, or model macro families through existing runtime-evidence fixtures first?
3. Should baseline promotion policy require a separate owner approval artifact before any real consumer baseline can move from candidate to promoted?
4. Should Tessl-generated scenarios be retained in agent-skills, or should only normalized .evals fixtures be retained after mining?

## Recommendation

Use Tessl to generate and review scenario families, then promote only the deterministic, schema-normalized parts into evals.

The highest-leverage next patch is not to run a remote Tessl eval. It is to create the first clean agent-skills/.evals consumer suite from the mined testing-skill scenarios and run it through the local evals contract.
