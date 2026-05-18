# Evals Repository Intent

Date: 2026-05-18
Repository path: `/Users/jamiecraik/dev/evals`
Artifact path: `.harness/features/2026-05-18-evals-intent.md`
Artifact type: durable intent and strategic review
Confidence posture: seed artifact from strategy discussion plus adjacent repo evidence

## Evidence Status

Hard fact: `/Users/jamiecraik/dev/evals` did not exist when this artifact was
requested. This document is therefore not a post-hoc interpretation of an
implemented evals repository. It is the seed intent artifact for the repository
Jamie asked to create.

Hard fact: the artifact is grounded in:

- the user-provided eval/framework source list in the current strategy thread;
- live local evidence from `/Users/jamiecraik/dev/coding-harness`;
- live local evidence from `/Users/jamiecraik/dev/agent-skills`;
- prior local memory about evals, cloud behavior runners, deterministic local
  validation, OTEL collector work, and wrong-layer failure modes.

Interpretation: the repository should not be treated as a generic LLM eval
platform. Its intended role is a local-first, artifact-backed regression harness
for agent judgment, repo operations, evidence discipline, workflow artifact
quality, and security boundary behavior.

## Project Intent

`evals` should become a small shared eval runtime and strategy spine for
Jamie-owned agentic development systems. Its job is to give `coding-harness`,
`agent-skills`, and later agent-heavy repos a common way to turn real failures
into durable, repeatable, artifact-backed eval cases.

It should not become the owner of each repo's domain truth. `coding-harness`
must own `coding-harness` behavior. `agent-skills` must own skill behavior.
`evals` owns the boring shared machinery: schemas, runner contracts, result
taxonomy, artifact layout, baseline comparison, evaluator adapters, telemetry
semantics, judge policy, redaction rules, and report formats.

## Core Thesis

The strategic thesis is:

> Every painful agent failure should become a permanent regression case, and the
> case should live near the repo surface that owns the behavior while sharing a
> common runtime contract.

This differs from ordinary LLM eval platforms. The problem is not only whether
an answer matches an expected answer. The problem is whether an agent:

- gathered the right evidence before acting;
- respected repo-native authority boundaries;
- classified blockers honestly;
- produced required artifacts;
- resisted hostile or untrusted instructions;
- preserved uncertainty;
- generated truthful release notes, PR summaries, issues, and review syntheses;
- improved behavior without inflating prompt/context cost.

## Strategic Direction

Build the repository in this order:

1. Canonical local eval schemas.
2. Minimal local command-backed runner.
3. Durable artifact bundle format.
4. Deterministic scorers.
5. Baseline/current comparison.
6. Repo-local suite adapters for `coding-harness` and `agent-skills`.
7. Optional evaluator adapters for external libraries.
8. OTEL tracing and optional Braintrust export.
9. LLM judge policy, advisory by default.
10. Workflow-output suites for release notes, issue triage, PR summaries, and
    review syntheses.

The first useful version should be deliberately small. It should prove one
`coding-harness` case and one `agent-skills` case before any dashboard,
registry, platform abstraction, or cloud runner is built.

## Intended Users

- Jamie, as the operator deciding whether agent behavior has improved.
- Future coding agents that need to understand what a repo's evals are proving.
- Maintainers of `coding-harness` and `agent-skills`.
- Reviewers evaluating whether a PR, release, or workflow is safe to close.
- Future technical co-founders or staff engineers trying to understand why the
  system is not just another prompt library.

## Non-Goals

- Do not create a general-purpose hosted eval platform.
- Do not replace repo-local validation.
- Do not make Braintrust, LangChain, OpenAI Evals, DeepEval, FastEval, or any
  external project the canonical data model.
- Do not create a global "agent quality" score.
- Do not let LLM judges decide required gates before calibration.
- Do not centralize fixtures away from the repos that own the behavior.
- Do not make cloud evals the only proof path.
- Do not make a dashboard before command-backed local artifact proof exists.

## System Philosophy

The operating doctrine is:

> Artifacts decide. Telemetry explains. LLM judges advise until calibrated.
> Repo-local suites own domain truth. External frameworks provide adapters and
> patterns.

This doctrine should remain stable. If it drifts, the repo will become trusted
theater: visually convincing reports without durable proof.

## Architectural Patterns

### Shared Runtime, Local Suites

The shared runtime should own:

- `eval-case.schema.json`;
- `eval-result.schema.json`;
- `eval-run.schema.json`;
- `evaluator-result.schema.json`;
- `artifact-manifest.schema.json`;
- command runner;
- artifact writer;
- baseline comparator;
- deterministic scorer interface;
- evaluator adapter interface;
- OTEL semantic conventions;
- report writers.

Repo-local suites should own:

- fixtures;
- commands;
- owner surfaces;
- domain-specific rubrics;
- expected blocker classes;
- promotion to required gates;
- release or PR enforcement decisions.

### External Libraries As Mines, Not Roots

The user supplied these sources as candidates:

- `braintrustdata/autoevals`;
- `openai/evals`;
- `confident-ai/deepeval`;
- `intuit/fasteval`;
- `langchain-ai/openevals`;
- `haizelabs/Awesome-LLM-Judges`;
- `dair-ai/Prompt-Engineering-Guide`;
- `NirDiamant/Prompt_Engineering`;
- Braintrust OTEL logging recipe;
- Braintrust APIAgent-Py recipe;
- Braintrust PromptInjectionDetector recipe;
- Braintrust ReleaseNotes recipe;
- Braintrust Github-Issues recipe.

These should be mined with bounded roles:

| Source | Intended use | Must not own |
| --- | --- | --- |
| `langchain-ai/openevals` | evaluator function shape, rubric and criteria evaluators | canonical schema |
| `braintrustdata/autoevals` | scorer catalog, composable metric outputs | runtime ownership |
| `confident-ai/deepeval` | developer test ergonomics and CI-style assertions | repo truth |
| `openai/evals` | registry/case layout and model-graded eval ideas | operational workflow model |
| `intuit/fasteval` | small/fast runner discipline | artifact contract |
| `Awesome-LLM-Judges` | judge risk, bias, drift, calibration policy | code architecture |
| Prompt engineering guides | judge prompt design, adversarial fixtures, prompt-change regression ideas | behavior truth |
| Braintrust OTEL | observability/export pattern | pass/fail authority |
| Braintrust APIAgent-Py | agent trajectory and tool/API behavior eval patterns | local command runner |
| Braintrust PromptInjectionDetector | adversarial and untrusted-content suite design | security source of truth |
| Braintrust ReleaseNotes | release-note factuality suite template | release authority |
| Braintrust Github-Issues | evidence-to-issue/actionability suite template | tracker authority |

## Agent-Native Design Assumptions

The repository should assume agents are first-class users, not just incidental
contributors. A future agent should be able to land in a repo and answer:

- What suites exist?
- Which suites are required, advisory, holdout, or draft?
- What behavior does each suite protect?
- Which repo owns the behavior?
- Which command or artifact is canonical proof?
- Which failures are current regressions versus known failures?
- Which judge outputs are advisory?
- Which traces explain execution but do not decide it?

This implies machine-readable manifests and human-readable reports must be
co-designed. The system should not rely on prose alone.

## Harness/Governance Model

The governance model should mirror the useful parts already visible in
`coding-harness` and `agent-skills`.

Verified evidence:

- `coding-harness/package.json` defines `test:evals`,
  `observed:eval-usage`, `test:artifacts:evals`, `quality:self-affirming`,
  `docs:steering:guard`, and broad `pnpm check` gates.
- `coding-harness/.harness/README.md` treats `.harness/features/**.md` and
  `.harness/evals/**.md` as tracked secondary context, while policy and active
  execution inputs live in stricter locations.
- `coding-harness/.harness/plan/2026-05-18-agent-testing-gates-harness-assurance-plan.md`
  describes a seven-layer assurance matrix, artifact handling routine, refusal
  triggers, and explicit distinction between durable `.harness` artifacts and
  ignored runtime `artifacts/**` output.
- `agent-skills/UBIQUITOUS_LANGUAGE.md` defines release-readiness claims,
  strict skill audits, high-signal steering feedback, repeated-error research
  gates, durable surfaces, environment refinement, diagnostic debt
  classification, and CTF workflow evals.

Interpretation: `evals` should become the shared harness for proving these
concepts, not a separate governance universe.

## Critical Constraints

- Local execution must remain authoritative for PR gates.
- Cloud or Braintrust-backed execution must be optional until task capture,
  polling, timeout handling, artifact scoring, and result replay are dependable.
- Each result must preserve enough evidence for future agents to audit it
  without live network access.
- Full logs, private prompts, tokens, credentials, and private session text must
  not be stored in indexed span attributes.
- Every LLM judge must record model, prompt version, rubric version,
  temperature, input hash, output hash, calibration status, and raw judgment
  artifact path.
- Synthetic fixtures must be labeled. Real-regression fixtures should be
  preferred for required gates.
- No required gate may depend only on fluent prose.

## Stable Interfaces

The first stable interfaces should be data contracts, not framework classes:

- `eval-case.schema.json`;
- `eval-result.schema.json`;
- `eval-run.schema.json`;
- `artifact-manifest.schema.json`;
- `judge-result.schema.json`;
- `suite-manifest.yaml`;
- `adapter-manifest.yaml`;
- `report.md` template;
- `trace.ndjson` or OTEL export convention.

Recommended result taxonomy:

- `pass`;
- `fail`;
- `warning`;
- `blocked_runtime`;
- `blocked_missing_artifact`;
- `blocked_validation`;
- `blocked_security`;
- `blocked_untrusted_input`;
- `representativeness_gap`;
- `known_failure`.

## Sources of Complexity

Intentional complexity:

- preserving local artifacts and traceability;
- separating deterministic gates from advisory judges;
- supporting repo-local ownership;
- retaining enough telemetry to diagnose failures;
- maintaining fixture provenance and privacy classification;
- baseline/current comparison;
- prompt-injection and untrusted-content handling.

Accidental complexity to avoid:

- multiple overlapping schemas;
- imported framework data models leaking into canonical artifacts;
- prompt growth replacing harness improvements;
- dashboard work before local proof;
- one-off adapters per repo with no common contract;
- LLM judge outputs becoming hard to replay;
- cloud-only proof paths.

## Sources of Leverage

The strongest leverage comes from converting real failures into fixtures. A
single good fixture can protect many future runs if it captures:

- input evidence;
- expected operational behavior;
- required commands;
- expected artifact paths;
- expected blocker class;
- expected non-action;
- baseline/current comparison;
- owner surface.

The second leverage source is shared vocabulary. The same blocker and status
taxonomy should be usable by `coding-harness`, `agent-skills`, and future
agent repos.

The third leverage source is traceability. If a future agent can see exactly why
an eval failed, it can fix the behavior instead of adding more instructions.

## Probable Moat

The moat is not the runner. Runners are easy to copy.

The moat is the accumulated corpus of high-quality, real-regression,
agent-operation fixtures plus the governance habits that keep them useful:

- repo-native ownership;
- artifact-first proof;
- calibrated judge policy;
- prompt-injection cases from real surfaces;
- PR/Linear/review closeout cases;
- skill-readiness and steering-uptake cases;
- telemetry that explains behavior without replacing proof.

Commercially, this becomes valuable if it lets teams answer: "Can this agent
operate inside our repo without repeating known expensive mistakes?"

## Drift Risks

Highest-risk drift:

- shared runtime starts owning domain truth;
- `coding-harness` and `agent-skills` suites diverge into incompatible local
  formats;
- framework adapters become the canonical schema;
- LLM judge outputs become required before calibration;
- cloud traces replace local artifacts;
- evals become summaries of outputs instead of tests of actions and evidence;
- prompt-engineering references become a prompt cookbook instead of fixture and
  rubric input.

## Technical Debt Signals

Seed-state debt:

- `/Users/jamiecraik/dev/evals` had no repository content at creation time.
- No package manifest, CI, schema files, runner, or tests exist yet.
- The source list has not been live-cloned or audited in this artifact.
- External recipe URLs are user-supplied, not verified against current upstream
  code in this pass.

Adjacent-system debt:

- `coding-harness` worktree was dirty during inspection. Evidence from it is
  useful but should be treated as current local state, not merged release truth.
- `agent-skills` has existing eval artifacts and recursive skill-loop outputs,
  but the new shared eval contract must not blindly inherit their historical
  formats.

## UX Philosophy

The user experience should be quiet, operational, and artifact-first.

Good UX:

- a developer can run one command and get a clear report;
- a future agent can find the exact failing case and artifact bundle;
- a reviewer can tell whether a failure is product behavior, harness behavior,
  environment, missing artifact, validation, or security;
- optional cloud traces are discoverable but not required to understand the
  result.

Bad UX:

- a dashboard that hides result ownership;
- a single score with no evidence;
- reports that sound polished but omit blocker class and proof path;
- failures that require reading raw trace logs first.

## What Future Agents Should Preserve

- Preserve local-first proof.
- Preserve repo-local suite ownership.
- Preserve artifact bundles as canonical evidence.
- Preserve deterministic checks as required-gate defaults.
- Preserve LLM judges as advisory until calibrated.
- Preserve explicit fixture provenance.
- Preserve prompt-injection and untrusted-content cases.
- Preserve baseline/current comparison.
- Preserve status taxonomy beyond pass/fail.
- Preserve the distinction between `.harness/**` durable artifacts and
  `artifacts/**` runtime output.

## What Future Agents Should Challenge

- Any new abstraction that does not reduce repeated work across at least two
  repos.
- Any external library adapter that tries to own canonical schema.
- Any judge prompt that cannot be replayed or versioned.
- Any eval that only scores final prose.
- Any suite promoted to required without real-regression coverage or calibration.
- Any cloud-only eval path.
- Any fixture that embeds private context without redaction status.
- Any compatibility layer that lacks a removal condition.

## Open Questions

1. Should `evals` become its own package/repo with versioned releases, or begin
   as a subpackage inside `coding-harness` and split later?
2. Which language should own the first runner: TypeScript, because
   `coding-harness` is TypeScript, or Python, because many eval libraries and
   judge recipes are Python-first?
3. Should `agent-skills` consume the runtime via package dependency,
   vendored scripts, or generated harness templates?
4. What is the first private holdout fixture lane, and where should it live?
5. What redaction level is acceptable for real session-derived fixtures?
6. Should Braintrust export be local config only, or a first-class optional
   adapter in the repo?

## Non-Negotiable Strategic Decisions

These decisions should be treated as the starting contract for the repo:

1. `/Users/jamiecraik/dev/evals` is the standalone seed for the shared eval
   contract. Do not bury the canonical schema inside `coding-harness`.
2. The standalone repo owns only shared eval mechanics. It must not own
   `coding-harness` or `agent-skills` domain truth.
3. The first implementation must produce local artifacts before any optional
   Braintrust, LangSmith, hosted dashboard, or cloud runner integration.
4. Required gates must be deterministic by default. LLM judges are advisory
   until calibration evidence exists.
5. External frameworks are allowed only behind adapters. If an external format
   becomes the canonical result shape, the design has drifted.
6. The first two suites are fixed: `coding-harness.pr-closeout-trajectory` and
   `agent-skills.skills-doctor-contract`. Any other first suite is a distraction
   unless Jamie explicitly changes the priority.
7. Prompt-engineering research must become fixtures, rubrics, or judge policy.
   It must not become a growing prompt library with no measured reliability
   gain.

## Recommended Decisions

1. Start as a standalone `/Users/jamiecraik/dev/evals` repo and keep the
   contract thin. If implementation pressure starts requiring deep
   `coding-harness` knowledge, do not move the repo; instead move that domain
   logic back into a `coding-harness` suite and keep only the shared interface
   in `evals`.
2. Use TypeScript for the first command runner and schema validation because
   `coding-harness` is the most likely first consumer and already has artifact
   and eval scripts.
3. Allow Python adapters later for `deepeval`, `openevals`, Braintrust
   recipes, and judge experiments.
4. Make `coding-harness.pr-closeout-trajectory` and
   `agent-skills.skills-doctor-contract` the first two real suites.
5. Make OTEL local-file tracing available from the beginning, but make
   Braintrust export optional.
6. Require every LLM judge result to carry calibration status, defaulting to
   `advisory`.

## Strategic Contradictions

There is one core contradiction: the repo is meant to be shared, but the
valuable truth is local. The resolution is to share runtime mechanics and keep
behavior ownership local.

There is a second contradiction: the external ecosystem offers mature eval
libraries, but adopting one as the base could erase the repo's actual
differentiation. The resolution is adapter-first mining.

There is a third contradiction: LLM judges are useful for summary quality,
release notes, issue quality, and evidence-grounding review, but they are also
the most drift-prone component. The resolution is deterministic gates first,
judge policy second, calibrated promotion later.

## Suggested Simplifications

- Do not implement a dashboard in phase one.
- Do not implement cloud runners in phase one.
- Do not implement a plugin architecture before two adapters are needed.
- Do not create a generic dataset registry before repo-local suites exist.
- Do not support every external eval library at once.
- Do not create an all-purpose scoring system; start with blocker classes and
  artifact proof.

## Missing Capabilities

The seed repo still needs:

- package manifest;
- schema files;
- CLI entrypoint;
- local runner;
- report writer;
- artifact bundle writer;
- deterministic scorer set;
- baseline comparator;
- telemetry writer;
- redaction policy;
- judge policy;
- source-mining report for the listed external repos;
- first two repo-local suite integrations.

## Long-Term Scalability Concerns

- Fixture volume can grow faster than suite discipline.
- Private holdouts can become stale or invisible.
- Judge prompt versioning can become unmanageable without strict naming.
- Telemetry can become expensive or leak-prone if full prompts/logs are stored
  in indexed attributes.
- Repo-local adapters can duplicate orchestration logic if the shared contract
  is too weak.
- Validation runtime can exceed PR budgets if smoke, release, and holdout lanes
  are not separated.

# Modern Standards Assessment - May 2026

## Ahead Of Current Standards

The intended system is ahead if it enforces:

- agent-native artifact contracts rather than prose-only documentation;
- deterministic local gates with optional cloud observability;
- explicit blocker taxonomy;
- prompt-injection evals over real agent input surfaces;
- fixture provenance and representativeness labels;
- LLM judge calibration lifecycle;
- telemetry confidence rather than telemetry existence.

## Aligned With Current Standards

It aligns with current best practice by requiring:

- typed schemas;
- CI-friendly commands;
- local/offline replay;
- artifact bundles;
- baseline comparison;
- source-of-truth separation;
- redaction policy;
- dependency discipline through adapters instead of framework lock-in.

## Lagging Until Implemented

It is currently only an intent artifact. It lacks:

- executable runner;
- tests;
- CI;
- package manifest;
- schema validation;
- source-mining artifacts;
- real suite examples;
- observability implementation.

## Over-Engineered Risks

- Too many external-source adapters before a local runner exists.
- Judge governance heavier than the number of real judge cases.
- Multi-stage promotion workflow before any suite is used by a PR.
- Broad strategic taxonomy without a working command.

## Under-Engineered Risks

- No redaction pipeline.
- No baseline comparator.
- No fixture holdout lane.
- No command trace capture.
- No schema-first result contract.
- No explicit failure ownership.

## Agent-Native Architecture Assessment

The target architecture is agent-native if future agents can discover and run
evals without hidden human context. The adjacent repos show this is the right
direction: `agent-skills/UBIQUITOUS_LANGUAGE.md` defines terms like Durable
Surface, Environment Refinement, Repeated Error Research Gate, and CTF Workflow
Eval; `coding-harness/.harness/README.md` defines artifact authority levels and
admission rules.

The model becomes performative if agents can only read dashboards or summaries
without replayable artifacts.

## Deterministic Execution And Validation Loops

The first required gate should be deterministic. `coding-harness/package.json`
already shows a mature command surface with `pnpm check`, `test:artifacts`,
`test:evals`, `quality:self-affirming`, and steering guards. `evals` should
inherit this command-first posture.

## Observability

Braintrust OTEL should be used as an observability pattern, not a result store.
The preferred structure is:

```text
eval runtime -> local artifacts -> local trace -> optional OTEL export -> optional Braintrust UI
```

## Security Posture

Prompt-injection handling must be first-class because eval fixtures ingest
untrusted surfaces: PR comments, issue bodies, CI logs, external docs, skill
files, plugin manifests, tool output, and generated reports.

The first security suite should test whether agents treat hostile text as data
while still extracting legitimate evidence.

# Strategic Review

## Is The Project Coherent?

Yes, if it is scoped as a shared eval runtime plus repo-owned suites. No, if it
becomes a generic eval platform or a Braintrust/OpenAI/LangChain wrapper.

## Is The Architecture Pragmatic?

The pragmatic architecture is schema-first and local-first. Start with command
cases, artifacts, and deterministic scorers. Add external adapters only after
the first two suites prove the shape.

## Is The Complexity Justified?

The complexity is justified only for agent-operation regressions that have
already cost time: PR closeout false positives, missing reviewer artifacts,
skill-readiness ambiguity, repeated steering failures, untrusted input, and
truthfulness of generated workflow artifacts.

It is not justified for generic answer matching or prompt optimization alone.

## Is The Agent-Native Model Real Or Performative?

It can be real because the adjacent repos already expose agent-facing contracts:
`.harness` authority levels, active artifact routines, skill audit vocabulary,
steering uptake, and release-readiness language.

It becomes performative if evals are scored summaries without required artifacts
or if agents cannot replay failures locally.

## What Is Genuinely Differentiated?

The differentiated part is not eval execution. It is the combination of:

- repo-native ownership;
- operational behavior evals;
- durable artifacts;
- blocker taxonomy;
- calibrated judge policy;
- real-regression fixtures;
- prompt-injection and untrusted-surface coverage;
- workflow-output truthfulness for PRs, releases, issues, and reviews.

## What Feels Trend-Driven?

- A generic "LLM evals platform" framing.
- A dashboard-first roadmap.
- Over-indexing on LLM judges.
- Importing framework-native schemas before local contracts exist.
- Prompt-engineering source mining without turning lessons into fixtures.

## What Should Be Deleted Immediately?

In the seed repo, nothing exists to delete. In the strategy, delete the idea of
a universal agent quality score. Delete any plan that makes cloud traces or LLM
judges the source of truth for required gates.

Also delete or block these ideas if they appear in early implementation:

- dashboard-first roadmap;
- framework-native canonical schema;
- cloud-only proof path;
- release-blocking LLM judge with no calibration artifact;
- generic "prompt quality" score that is not tied to observed operational
  behavior;
- any suite whose expected behavior is only a polished final answer;
- any fixture copied from private logs without provenance and redaction status;
- any adapter added before the first two local suites run.

## What Should Become Core?

- Canonical schema.
- Artifact bundle.
- Local command runner.
- Baseline comparator.
- Deterministic scorer set.
- Status and blocker taxonomy.
- Judge policy.
- Prompt-injection suite.
- Repo-local ownership model.

## What Creates Leverage?

Real-regression fixtures create leverage. A single high-quality fixture can
prevent repeated failures across many future agent runs.

## What Creates Drag?

Framework churn, adapter proliferation, vague rubrics, cloud-only workflows,
dashboard work, and prompt growth without measured reliability gains.

## What Would Make This Hard To Copy?

The accumulated fixture corpus and operational taxonomy would be hard to copy:
PR closeout cases, Linear/GitHub/CI review-state cases, skill doctor cases,
steering uptake cases, prompt-injection cases, and release/issue artifact
quality cases.

## What Would Make This Commercially Valuable?

It becomes commercially valuable if it proves that agents can operate inside
real repos with fewer repeated mistakes, clearer blocker classification, and
auditable handoffs. The product promise should be operational reliability, not
benchmark performance.

## What Would Make Developers Adopt It?

Developers will adopt it if:

- the first command is easy;
- failures are understandable;
- artifacts are local;
- suites are cheap enough for PRs;
- expensive/judge/cloud lanes are optional;
- the system catches real regressions they recognize.

## Biggest Risks

1. Trusted theater: reports look polished but do not prove behavior.
2. Framework lock-in: external data shape becomes canonical.
3. Judge drift: LLM judge behavior changes and breaks trust.
4. Fixture contamination: agents overfit visible cases.
5. Ownership ambiguity: shared runtime blamed for suite failures and vice versa.
6. Privacy leaks: real logs/prompts become durable fixtures without redaction.
7. Latency: PR gates become too slow, so users stop running them.

## Assumptions Likely Wrong

- That one external eval framework will be a good base. It probably will not.
- That LLM judges can safely start as required gates. They should not.
- That a dashboard will create adoption. Local proof will.
- That repo-local suites can be centralized without losing domain meaning.

## Smallest Compelling Version

The smallest compelling version is:

- one CLI command;
- one schema;
- one artifact bundle;
- deterministic scorers;
- baseline comparison;
- one `coding-harness` PR closeout trajectory fixture;
- one `agent-skills` skill doctor contract fixture;
- markdown and JSON reports.

Everything else is phase two. In particular, Braintrust export, OpenEvals
adapters, DeepEval ergonomics, release-note judging, GitHub issue judging, and
private holdouts are useful only after this slice works.

## Merge-Blocking Rules For The Seed Repo

Once the first implementation exists, these should block merges:

- schema changes without fixture updates;
- runner changes without at least one command-backed eval case;
- scorer changes without deterministic tests;
- LLM judge promotion without calibration artifact;
- artifact layout changes without migration notes;
- telemetry export changes that can leak raw prompts, logs, tokens, credentials,
  or private session text;
- any required suite that cannot run locally;
- any external adapter that bypasses canonical `eval-result.schema.json`.

## Company-Moat Protection

If this becomes the company moat, protect:

- real-regression fixture corpus;
- taxonomy of operational blocker classes;
- local replayability;
- artifact traceability;
- prompt-injection cases;
- judge calibration examples;
- repo-native ownership conventions.

## Failure Scenario

If this fails, it will fail because it becomes a heavy eval framework before it
proves two real agent regressions. It will also fail if it optimizes for
judging final prose instead of proving operational behavior.

# Drift Detection Signals

| Drift signal | Why it matters | Likely root cause | Operational impact | Severity | Corrective action | Blocks merges/releases |
| --- | --- | --- | --- | --- | --- | --- |
| More than one canonical result schema exists | Future agents cannot trust results | Adapter schemas leaked inward | Incompatible reports and false comparisons | High | Freeze canonical schema and write adapters outward | Yes for runtime changes |
| LLM judge marked required without calibration artifact | Judge drift can block or pass wrong work | Convenience pressure | False pass/fail on release gates | High | Demote to advisory until calibrated | Yes |
| Eval result lacks artifact bundle | No replayable proof | Report-first implementation | Trusted theater | High | Require `result.json`, `report.md`, command log, and manifest | Yes |
| Cloud trace is the only evidence | Local/offline proof lost | Dashboard-first workflow | Cannot audit or rerun locally | High | Restore local artifacts as authority | Yes |
| Repo-local suite uses shared runtime to define domain truth | Ownership inversion | Centralization pressure | Wrong-layer fixes and brittle evals | High | Move fixtures/rubrics back to owner repo | Yes for required suites |
| PR eval runtime exceeds 2 minutes for smoke lane | Developers stop running it | Lane separation missing | Evals become ceremonial | Medium | Split smoke/nightly/release lanes | No unless required gate |
| Prompt/context size grows without eval improvement | Prompting replaces harness work | Weak failure analysis | Rising cost with no reliability gain | Medium | Require before/after eval delta for prompt expansion | No, unless repeated |
| More than 3 overlapping adapters solve same scorer need | Tool proliferation | Framework shopping | Maintenance drag | Medium | Consolidate behind one scorer interface | No |
| More than 5 synthetic fixtures promoted before real-regression fixtures exist | Suite tests fantasies | Easy fixture creation | False confidence | High | Require real-regression anchor before required promotion | Yes for required gate |
| Fixture lacks provenance or privacy label | Trust and safety gap | Fast capture from logs | Secret leakage or weak confidence | High | Add provenance/privacy schema and redaction gate | Yes |
| Prompt-injection fixtures absent from untrusted input suites | Security boundary untested | Security delayed | Agents may obey hostile text | High | Add shared prompt-injection boundary suite | Yes for external-input features |
| Required artifact path not checked for existence | Mailbox text substitutes for proof | Reviewer workflow shortcut | Missing evidence accepted | High | Add artifact-exists scorer | Yes |
| Baseline comparison missing from regression suite | Cannot tell better/worse | Pass/fail only mindset | Improvements not measurable | Medium | Add baseline/current comparator | No initially, yes for release |
| Compatibility layer has no sunset condition | Temporary code becomes permanent | Migration without owner | Config and adapter entropy | Medium | Add owner and removal trigger | No |
| Onboarding requires more than 15 minutes to run first local eval | DX failure | Too many prerequisites | Low adoption | Medium | Provide zero-setup smoke command | No |
| Required suite cannot run offline | Proof depends on network | Cloud/API coupling | Flaky PR gates | High | Mock or fixture external calls; move live checks to E2E | Yes |
| Telemetry attributes include raw prompts/logs/secrets | Privacy/security risk | Naive OTEL export | Data leakage | Critical | Redact and store hashes/artifact refs | Yes |
| Generated release notes pass without diff evidence | Workflow artifact drift | Prose judging only | Overclaiming shipped behavior | High | Require diff/validation evidence in suite | Yes for release flow |
| Issue generation eval lacks acceptance criteria check | Tickets become vague | Summary-first workflow | Tracker noise | Medium | Add actionability scorer | No |
| Holdout fixtures never run before release | Overfitting risk | PR-only eval culture | Agents learn visible tests | Medium | Add release holdout lane | Yes for release once available |

# Evidence & Traceability Matrix

| Conclusion | Evidence type | File paths | Symbols/interfaces/components involved | Runtime behaviour observed | Confidence | Why it matters |
| --- | --- | --- | --- | --- | --- | --- |
| `evals` is a seed repo, not an inspected implementation | filesystem | `/Users/jamiecraik/dev/evals` | missing directory at first inspection | `ls` returned no such file before directory creation | High | Prevents hallucinating existing source capabilities |
| `coding-harness` already treats evals/artifacts as native concerns | config | `/Users/jamiecraik/dev/coding-harness/package.json` | `test:evals`, `test:artifacts:evals`, `observed:eval-usage`, `quality:self-affirming` | package scripts expose eval and artifact gates | High | Shows first consumer already has command surfaces |
| `.harness/features` is secondary context, not execution authority | docs/config | `/Users/jamiecraik/dev/coding-harness/.harness/README.md` | authority levels, directory map, admission rule | tracked but not direct implementation authority | High | This file belongs as durable context, not an implementation plan |
| Runtime artifacts and durable harness artifacts must stay separate | docs | `/Users/jamiecraik/dev/coding-harness/.harness/plan/2026-05-18-agent-testing-gates-harness-assurance-plan.md` | artifact handling routine, runtime boundary | plan says ignored `artifacts/**` stay separate from durable `.harness` artifacts | High | Informs artifact layout and governance |
| `coding-harness` closeout evals must inspect live-state classes, not CI alone | docs/memory/source search | `coding-harness` plan and local memory | PR/branch/Linear/review/automation/next-lane state | closeout proof requires live-state classification or unobserved horizon | Medium-high | Protects against false green closeout |
| `agent-skills` already has eval-relevant ubiquitous language | docs | `/Users/jamiecraik/dev/agent-skills/UBIQUITOUS_LANGUAGE.md` | Release-Readiness Claim, Strict Skill Audit, Repeated Error Research Gate, Durable Surface, CTF Workflow Eval | terms define expected operating model | High | Shows eval runtime must align with existing vocabulary |
| Existing skill eval history includes judge metadata and artifacts | artifact | `/Users/jamiecraik/dev/agent-skills/Infrastructure/artifacts/skill-graphs/**` | `evaluator_version`, `rubric_version`, `judge_mode`, `prompt_hash`, `run_id` | run journals record accepted/rejected decisions | Medium | Useful precedent, but historical format should not blindly become canonical |
| Shared runtime should not own repo truth | architecture coupling | user strategy thread plus adjacent repo docs | repo-local suite ownership | no runtime observed yet | Medium-high interpretation | Avoids wrong-layer centralization |
| External frameworks should be mined as adapters | user-supplied sources | chat-provided URLs | openevals, autoevals, deepeval, openai/evals, fasteval, Braintrust recipes | not live-cloned in this pass | Medium interpretation | Prevents framework lock-in before schema exists |
| OTEL should explain, not decide | telemetry/memory | local memory about OTEL collector and telemetry confidence; Braintrust OTEL recipe URL from user | trace spans, telemetry confidence, artifact proof | no eval OTEL implementation yet | Medium interpretation | Keeps observability useful without replacing proof |
| Prompt-injection evals are mandatory for untrusted surfaces | security reasoning | user-supplied PromptInjectionDetector recipe and repo workflows ingest PR/docs/log text | untrusted docs, PR comments, CI logs, skill files | no seed repo implementation yet | Medium-high interpretation | Agent workflows consume hostile-capable text by design |
| LLM judges must start advisory | judge-risk reasoning | `Awesome-LLM-Judges` user source plus existing judge metadata in agent-skills artifacts | judge mode, rubric version, prompt hash | historical artifacts show judge-scored runs | Medium-high | Prevents drift-prone scoring from becoming unearned gate authority |
| The smallest useful product is two real suites | strategy | current chat, adjacent repo evidence | `coding-harness.pr-closeout-trajectory`, `agent-skills.skills-doctor-contract` | no suites implemented yet | Medium interpretation | Forces proof before platform growth |
