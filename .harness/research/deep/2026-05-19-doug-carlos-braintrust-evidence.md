# Deep Evidence Extraction: Braintrust Evals Workshop

Source artifact: .harness/research/2026-05-19-mastering-ai-evaluation-playground-production-evidence.md
Video: [Evals Workshop] Mastering AI Evaluation: From Playground to Production
Speakers in transcript: Doug and Carlos, Braintrust solutions engineers
Extraction date: 2026-05-19

## Executive Summary

This workshop presents an eval system as a closed engineering control loop, not as a one-off benchmark. The repeated operating model is: define a task with an input and output, seed a small dataset, score it with deterministic and LLM-as-judge checks, compare experiments over time, instrument production, sample live traffic, route low-confidence or low-score cases into human review, and promote selected production traces back into the offline dataset.

The most reusable engineering idea is the separation between offline evals and online scoring. Offline evals act like pre-merge and development-time regression tests; online scoring acts like production quality monitoring. The implied architecture is a two-plane system: a source-controlled evaluation plane for prompts, datasets, scores, and experiments, and an observability plane for traces, spans, feedback, sampling, and views.

The strongest harness signal is the insistence that evaluation quality itself must be evaluated. LLM judges are treated as useful but untrusted scorers that need human calibration, deterministic cross-checks, rationale inspection, trial averaging, and historical baselines. This maps cleanly to harness engineering: fuzzy judges can advise, but deterministic gates and artifact evidence should remain the release authority until judge calibration is proven.

The main weakness is governance maturity. The workshop repeatedly recommends human review, domain expert annotation, online scoring, and production-log promotion, but it leaves unresolved ownership, privacy review, approval policy, dataset contamination rules, and drift between evolving application logic and eval task definitions. Those gaps matter because they are exactly where eval systems quietly become misleading.

## Core Engineering Patterns

## Pattern: Three-Ingredient Eval Contract

### Description

An eval is reduced to three required concepts: task, dataset, and score. The task is the executable unit under evaluation; the dataset provides inputs, expected outputs, and metadata; the score converts outputs into comparable quality signals.

Confidence: High confidence.

### Evidence

- [00:07:34] defines the three ingredients: task, dataset, and score.
- [00:07:34] says the task can be a prompt or full agentic workflow, with the one requirement that it has an input and output.
- [00:13:41] defines dataset fields: input required, expected optional, metadata optional.
- [00:08:35] says scores can be LLM-as-judge or code functions that output 0 to 1.

### Why It Matters

This is a compact executable contract. It prevents eval design from turning into vague quality discussion because each run must identify what is executed, what evidence it runs against, and how the output is judged.

### Implementation Opportunities

- Define repo-local eval fixture schemas around task_ref, input, expected, metadata, scorers, and baseline_ref.
- Require every new eval case to name whether each scorer is deterministic, judge-based, or human-labeled.
- Store the input/output boundary explicitly for multi-step agent workflows so orchestration complexity does not erase testability.
- Add CI validation that rejects eval cases without a task boundary and at least one deterministic or calibrated scorer.

### Risks / Tradeoffs

- The input/output simplification can hide important internal path quality for agents and tool workflows.
- Optional expected outputs are convenient early but can let datasets remain too weak for regression detection.
- A 0-to-1 score is easy to aggregate but can flatten qualitative failure modes unless the scorer also emits rationale and evidence.

## Pattern: Offline/Online Eval Split

### Description

Offline evals are development-time tests over controlled datasets. Online evals are production scoring and monitoring over live traces. The workflow becomes bidirectional: offline evals prepare the release; online scoring finds real edge cases; selected traces flow back into offline datasets.

Confidence: High confidence.

### Evidence

- [00:08:35] to [00:09:36] distinguishes offline evals in development from online evals in production.
- [00:55:48] says production traces can be turned into datasets and brought back into the playground.
- [01:04:03] to [01:05:04] demonstrates adding a production span to a dataset.
- [01:06:04] says teams can select good responses or bad responses from logs and use them differently.

### Why It Matters

This avoids the common failure where offline evals only test synthetic scenarios and production monitoring only explains incidents after the fact. The loop lets real user behavior harden future pre-release checks.

### Implementation Opportunities

- Model offline artifacts and online logs as separate evidence classes with explicit promotion rules.
- Add a source_kind field to dataset rows: synthetic, staging_log, production_log, human_labeled, regression.
- Require promoted online traces to record selection reason: low_score, high_value_success, user_negative_feedback, domain_edge_case, incident.
- Build a local promotion command that converts a trace export into a repo fixture only after privacy review and schema validation.

### Risks / Tradeoffs

- Production logs may contain sensitive or private material.
- Promoting only bad logs can overfit the eval suite to failures; promoting only good logs can create a success-biased few-shot set.
- Online score sampling can miss rare but severe failures.
- If promoted examples do not preserve provenance, future agents cannot distinguish real user behavior from generated fixtures.

## Pattern: Small Seed, Iterative Hardening

### Description

Start with a small synthetic or internal dataset and a few scores, then iterate using logs, human review, and score tuning. Do not wait for a perfect golden dataset.

Confidence: High confidence.

### Evidence

- [00:08:35] says synthetic test cases are a good way to get started, then mature toward logs.
- [00:13:41] says start small and iterate rather than needing the largest dataset.
- [00:40:16] to [00:41:18] says do not stop because the dataset is small.
- [01:16:22] says one or two scores and ten rows can be tremendously helpful.

### Why It Matters

This is an execution-first strategy. It pushes teams into a measurable loop early, which is often more valuable than debating eval ontology before there is any artifact evidence.

### Implementation Opportunities

- Create phase-one smoke evals with 5-10 rows and one deterministic scorer before designing broader suites.
- Label early fixtures as bootstrap so they are not mistaken for mature coverage.
- Add a maturation checklist: add real logs, add human labels, add negative cases, add holdouts, add baseline comparisons.
- Keep small evals fast enough for PR checks and move broader suites to scheduled or release gates.

### Risks / Tradeoffs

- Bootstrap datasets can become permanent without explicit retirement or promotion criteria.
- Synthetic rows may not cover real user language or operational edge cases.
- Teams may over-read early percentages when the dataset has too few examples.

## Pattern: Dual Scoring Strategy

### Description

Use both deterministic code-based scores and LLM-as-judge scores. Deterministic scores handle exact, objective, binary, or structural checks; LLM judges handle contextual and subjective judgments.

Confidence: High confidence.

### Evidence

- [00:14:42] to [00:15:43] contrasts LLM-as-judge scoring with code-based deterministic scores.
- [00:27:59] describes accuracy and completeness as LLM-as-judge scores and formatting as code-based.
- [00:49:42] recommends deterministic scores as a cross-check for LLM judge confidence.
- [00:50:43] says some companies go fully deterministic while others go LLM-as-judge, and both can work depending on use case.

### Why It Matters

This creates a useful boundary between hard release constraints and advisory quality signals. It also gives teams a way to detect judge drift by comparing fuzzy and deterministic evidence.

### Implementation Opportunities

- Classify each scorer as deterministic_required, judge_advisory, judge_required_after_calibration, or human_label.
- Use deterministic format, schema, path, and safety checks as mandatory gates.
- Use LLM judges for tone, completeness, usefulness, and domain fit, but require rationale capture.
- Add disagreement detection when deterministic and judge scores diverge sharply.

### Risks / Tradeoffs

- LLM judges can appear precise while remaining stochastic.
- Deterministic checks can create false confidence if they only verify formatting.
- Combining scores into a single aggregate can hide a hard failure behind a high average.

## Pattern: Eval the Eval

### Description

Scorers, especially LLM-as-judge prompts, are themselves artifacts requiring evaluation. Human review, rationale inspection, deterministic approximations, and repeated trials are used to calibrate the evaluator.

Confidence: High confidence.

### Evidence

- [00:15:43] says if writing an LLM-as-judge, eval the judge and ensure the prompt matches human judgment.
- [00:43:24] says inspect judge rationale in logs to tune the judge.
- [00:48:41] asks how to build confidence in LLM-as-judge results; the answer recommends human review and deterministic scores.
- [01:14:21] says human review is helpful for evaling LLM-as-judge by comparing judge prompts with human criteria.

### Why It Matters

An eval system is only as good as its evaluator. Treating judges as untrusted components is the difference between a quality system and a dashboard that produces decorative numbers.

### Implementation Opportunities

- Maintain a judge calibration suite with human-labeled examples.
- Store judge rationale as an artifact and sample it during review.
- Run repeated trials for non-deterministic judges and track mean, variance, and disagreement.
- Add a judge_calibration_status field before allowing a judge score to block releases.

### Risks / Tradeoffs

- Human labels can be expensive and inconsistent.
- Repeated judge trials increase cost and runtime.
- Rationale evaluation can become meta-eval sprawl without clear acceptance criteria.

## Pattern: Historical Baseline Comparison Over Absolute Threshold Worship

### Description

Scores are interpreted relative to prior runs and baselines, not only as absolute percentages. A low score can be acceptable if it improves on a baseline; a high score can be suspect if it masks judge weakness.

Confidence: High confidence.

### Evidence

- [00:16:44] says experiments track scores over weeks and months.
- [00:31:03] distinguishes baseline task from comparison task.
- [00:32:04] says experiments show impacts in CI when prompts or models change.
- [00:43:24] to [00:44:25] says what matters is how performance compares to yesterday and previous baselines, not simply hitting 80%.

### Why It Matters

This aligns evals with regression engineering. The important question becomes whether a change improves, regresses, or changes the risk profile relative to known behavior.

### Implementation Opportunities

- Store baseline_result, comparison_result, and delta separately.
- Require baseline provenance before interpreting score movements.
- Use PR checks that fail on regression deltas rather than arbitrary global thresholds.
- Report score confidence intervals when using stochastic judges.

### Risks / Tradeoffs

- Historical baselines can normalize poor quality if the starting point is weak.
- Baseline comparison requires stable datasets and scorer versions.
- Model/provider changes can invalidate comparisons unless run metadata is preserved.

## Pattern: Source-Controlled Evaluation Assets

### Description

Prompts, scores, datasets, and eval definitions can be defined in code, versioned in the repo, and pushed to the platform. The UI remains useful for iteration, but durable assets live alongside application code.

Confidence: High confidence.

### Evidence

- [00:24:55] describes braintrust push creating project resources from repo code.
- [00:37:13] to [00:38:14] says assets are defined in code and pushed into Braintrust, enabling version control.
- [00:38:14] to [00:39:15] describes defining evals in code and running braintrust eval.
- [00:39:15] says source-controlled prompt versioning and consistent usage across environments are reasons to use the SDK path.

### Why It Matters

Without source control, eval changes become invisible product configuration drift. Versioned eval assets let reviewers inspect changes to prompts, scoring logic, and datasets in the same PR as application changes.

### Implementation Opportunities

- Keep prompts, scores, datasets, and evals under repo ownership.
- Require PR review for changes to judge prompts and thresholds.
- Add a generated manifest that records pushed resource IDs and local file hashes.
- Add a drift check comparing platform resources to repo resource definitions.

### Risks / Tradeoffs

- UI edits can diverge from repo definitions unless drift detection exists.
- Resource push scripts can mutate external state during install if not clearly gated.
- Secrets for provider/API access must not leak through source-controlled config.

## Pattern: Playground-to-Experiment Promotion

### Description

The playground is an ephemeral iteration surface; experiments are durable historical records. Promising playground runs can be saved into experiments for longitudinal analysis.

Confidence: High confidence.

### Evidence

- [00:16:44] says playgrounds are for quick iteration and experiments are for comparison over time.
- [00:31:03] describes saving a playground run as an experiment.
- [00:52:45] to [00:53:46] says playgrounds are ephemeral and experiments are long-lived historical analysis.

### Why It Matters

This creates an explicit promotion boundary. Teams can explore without polluting durable evidence, then preserve meaningful runs when they are ready.

### Implementation Opportunities

- Mirror this locally as scratch runs versus durable harness runs.
- Require promoted experiments to include prompt version, model, dataset version, scorer versions, and operator.
- Add a command that converts a successful exploratory run into a committed fixture or baseline update.

### Risks / Tradeoffs

- If promotion criteria are informal, teams may save cherry-picked runs.
- Ephemeral playground work can become hidden authority if not linked back to code.

## Pattern: Trace/Span-Centered Observability

### Description

Production logging is modeled as traces with spans. Wrappers and decorators capture LLM calls, tool calls, prompt loading, token metrics, latency, cost, errors, metadata, inputs, and outputs.

Confidence: High confidence.

### Evidence

- [00:55:48] says production logging helps debug, measure live quality, and close feedback loops.
- [00:56:51] mentions logger initialization, wrapping OpenAI clients, Vercel AI SDK support, OTEL integration, trace decorators, and span.log.
- [01:02:01] describes a top-level generate changelog request trace with child tool-call spans.
- [01:03:02] says wrappers expose token counts, estimated cost, and metrics.

### Why It Matters

Span-level observability gives eval systems enough structure to target the exact unit under review. It is also the bridge between production behavior and offline dataset growth.

### Implementation Opportunities

- Represent agent runs as trace trees: root task, model spans, tool spans, retrieval spans, validation spans, and human-review spans.
- Include span IDs in eval artifacts so reviewers can trace a failure from summary to raw execution.
- Add metadata conventions for model, prompt version, skill/router, dataset source, and user feedback.
- Use OTEL-compatible traces where possible so eval evidence can interoperate with existing observability stacks.

### Risks / Tradeoffs

- Logging inputs and outputs can capture sensitive user data.
- Wrapper-based observability can miss application-specific state unless metadata is logged intentionally.
- Excessive span detail can create review noise and storage cost.

## Pattern: Sampling-Based Online Scoring

### Description

Online scoring rules evaluate a configurable percentage of production logs. Teams can score all traffic during tests or sample lower percentages in production. Rules can target root spans or specific child spans.

Confidence: High confidence.

### Evidence

- [00:57:53] says online scoring can evaluate 100% or 1% of incoming logs.
- [00:58:54] says sampling rate is crucial and can increase after trust improves.
- [00:58:54] says online scoring can target a root span or nested child span.
- [01:09:15] says span targeting can apply scoring only when a certain span appears.

### Why It Matters

Sampling makes production evals economically and operationally feasible. Span targeting prevents broad scoring rules from judging the wrong part of a workflow.

### Implementation Opportunities

- Define online scoring policy as code: scorer, span selector, sample rate, alert threshold, and data retention.
- Start with low sample rates for expensive judges and higher rates for cheap deterministic checks.
- Add critical-path spans that are always scored when high-risk conditions are present.
- Track sample coverage so teams know which workflows have weak monitoring.

### Risks / Tradeoffs

- Low sampling can miss rare harms or regressions.
- Root-span scoring may judge composite workflows too coarsely.
- Sampling policies can silently drift if managed only in UI.

## Pattern: Low-Score View as Human Review Queue

### Description

Filtered log views act as operational queues for human reviewers. For example, logs with accuracy below 50% or thumbs-down user feedback become review targets.

Confidence: High confidence.

### Evidence

- [00:59:58] describes custom views with filters, sorts, and columns.
- [01:04:03] describes creating a view for completeness below 50%.
- [01:07:12] describes saved views for human reviewers to inspect logs where accuracy is below 50%.
- [01:12:18] describes filtering user feedback score of zero and adding bad cases to datasets.

### Why It Matters

This turns observability into workflow. Instead of passively collecting logs, the system routes specific cases to the people who can label, debug, or promote them.

### Implementation Opportunities

- Create review queues by failure class: low score, judge/deterministic disagreement, thumbs down, high latency, high cost, tool error.
- Require each reviewed item to end in a disposition: promote_to_dataset, ignore, bug, judge_fix, prompt_fix, product_gap.
- Export reviewed decisions as repo artifacts for auditability.

### Risks / Tradeoffs

- UI views can become invisible work queues without SLA or ownership.
- Human reviewers may bias datasets toward easy-to-review cases.
- Without privacy filtering, views may expose raw user content to too many roles.

## Pattern: Human Labeling as Ground Truth and Judge Calibration

### Description

Domain experts and users provide labels, scores, comments, and audits that establish ground truth for datasets and calibrate LLM judges.

Confidence: High confidence.

### Evidence

- [00:14:42] recommends human review to establish ground truth and improve expected outputs.
- [01:10:16] says subject matter experts, product managers, and doctors may evaluate outputs.
- [01:11:17] distinguishes human review from real-time user feedback.
- [01:14:21] says teams can compare human criteria with LLM-as-judge prompts.

### Why It Matters

Human review is the correction mechanism for fuzzy evals. It anchors subjective quality to domain expectations instead of letting model-generated scores define quality alone.

### Implementation Opportunities

- Add a human label schema with reviewer role, expertise, rubric version, score, rationale, and confidence.
- Maintain domain-specific review views with only relevant fields.
- Use human labels to create holdout sets for judge calibration.
- Track inter-reviewer agreement before treating labels as ground truth.

### Risks / Tradeoffs

- Human review does not scale automatically.
- External annotation services add privacy, consistency, and contractual risk.
- Reviewers can become bottlenecks without queue routing and sampling policy.

## Pattern: Dynamic Task Binding for Evolving Applications

### Description

Eval definitions should call the current application task dynamically rather than reimplementing stale workflow steps inside the eval file. This keeps evals aligned with application logic as the app changes.

Confidence: Medium confidence.

### Evidence

- [01:16:22] to [01:20:29] includes a participant concern that app logic changes from two turns to five turns and eval task steps become stale.
- [01:20:29] says evals can dynamically call the task so PR evals run against new application changes.
- [01:18:25] compares this to traditional software testing and recommends robust long-lived tests.

### Why It Matters

Eval suites rot when they duplicate old application logic. Dynamic binding keeps the test harness pointed at the real system under change.

### Implementation Opportunities

- In eval code, import the same task entrypoint used by production instead of copying the workflow.
- Separate scenario inputs and expected qualities from implementation steps.
- Add tests that fail if eval task wrappers diverge from production route or agent definitions.
- Use stable input/output contracts and allow internal workflow depth to change.

### Risks / Tradeoffs

- Dynamic binding can make evals less isolated and more sensitive to environment setup.
- If only final outputs are scored, internal workflow regressions may remain invisible.
- Some workflows need step-level assertions, not just final input/output quality.

## Pattern: Agentic Optimization Loop

### Description

Braintrust describes an upcoming optimization feature, Loop, that uses prior experiment results and tools to iteratively improve prompts, datasets, and scores with a human in the loop.

Confidence: Medium confidence.

### Evidence

- [00:45:28] says Loop is intended to optimize prompts, datasets, and scores.
- [00:45:28] says Loop has access to previous results and can determine whether a change improved performance.
- [00:45:28] frames it as an agentic workflow with tools and human prompting.

### Why It Matters

This is a model-orchestrated harness loop: propose a change, run experiments, compare against history, and iterate. It points toward AI systems that improve prompts and evals using their own evaluation infrastructure.

### Implementation Opportunities

- Build a local optimizer that can propose prompt diffs but must attach eval evidence before acceptance.
- Require human approval for dataset or scorer modifications.
- Limit optimizer scope to one prompt, scorer, or dataset slice per run.
- Store rejected optimizer attempts as learning artifacts.

### Risks / Tradeoffs

- Optimizers can overfit prompts to the visible eval set.
- Letting a system modify its own scoring criteria creates governance risk.
- Without holdout protection, score improvements may be meaningless.

## Tooling & Ecosystem

## Evaluation Platforms

### Braintrust

Purpose: Platform for prompts, playgrounds, experiments, datasets, scores, logs, online scoring, human review, and SDK-driven evals.

Workflow role: Central eval and observability workbench. It supports both UI-driven exploration and source-controlled SDK workflows.

Integration opportunities:

- Use for experiment tracking, trace capture, online scoring, and human review queues.
- Export or mirror critical artifacts into repo-local evidence for durable audit.
- Treat platform results as explanatory unless the repo records deterministic closure evidence.

Implied best practices:

- Keep durable resources in code where possible.
- Use playground for exploration and experiments for history.
- Use online scoring to detect production regressions.
- Use human review to calibrate LLM judges.

Strengths:

- Unifies prompt iteration, evals, observability, and review workflows.
- Supports UI and SDK paths.
- Makes trace-to-dataset promotion easy.

Limitations:

- UI-managed resources can drift from repo definitions.
- Native live-traffic few-shot retrieval is not supported in the described workflow.
- Human review ownership and privacy controls are not deeply specified in the transcript.

### Braintrust Playground

Purpose: Fast prompt/model/dataset/scorer iteration.

Workflow role: Ephemeral comparison surface for prompt A/B testing, model swaps, and score inspection.

Integration opportunities:

- Use as scratchpad before promoting a run to a durable experiment or repo fixture.
- Mirror selected playground configurations into source-controlled eval files.

Strengths: Fast iteration, parallel dataset execution, direct score comparison.

Limitations: Can create hidden decision history if not promoted or exported.

### Braintrust Experiments

Purpose: Durable historical comparison of eval runs.

Workflow role: Baseline and trend analysis over weeks or months.

Integration opportunities:

- Link PR checks to experiments.
- Store experiment IDs in repo artifacts.

Strengths: Supports longitudinal score comparison.

Limitations: Needs stable datasets, scorer versions, and model metadata for valid comparison.

## SDKs, CLIs, and Code Surfaces

### Braintrust SDK

Purpose: Define prompts, datasets, scores, evals, logging, tracing, and resource pushes in code.

Workflow role: Source-controlled automation surface for eval assets and production instrumentation.

Integration opportunities:

- Define evals in eval.ts or equivalent repo-local files.
- Push resource definitions from CI or explicit setup scripts.
- Add logger wrappers and trace decorators in application code.

Strengths:

- Enables version control and consistent environments.
- Supports complex workflows beyond UI constraints.

Limitations:

- Requires API keys and environment setup.
- External resource mutation must be governed.

### braintrust push

Purpose: Push source-defined prompts, datasets, scores, and resources to Braintrust.

Workflow role: Projection command from repo definitions to platform state.

Integration opportunities:

- Run only through explicit setup or deployment commands, not hidden install side effects.
- Record pushed resource IDs and hashes.

Strengths: Keeps platform resources aligned with code.

Limitations: Can create stateful external drift if run implicitly.

### braintrust eval

Purpose: Execute source-defined evals and publish/track results.

Workflow role: SDK-side equivalent of playground/experiment runs.

Integration opportunities:

- Use in CI for model/prompt regression checks.
- Store run artifacts locally before or after platform upload.

Strengths: Supports repeatable eval execution from code.

Limitations: Non-deterministic judge scores require calibration and repeated trials.

### resources.ts and eval.ts

Purpose: Source files described as defining prompts, datasets, scores, and eval definitions.

Workflow role: Repo-owned control-plane declarations.

Integration opportunities:

- Treat these as auditable sources of truth.
- Generate manifests from them.
- Keep task imports aligned with production entrypoints.

Strengths: Simple conventions for versionable eval resources.

Limitations: Can hide stale logic if eval files duplicate application workflows.

## Application and Runtime Tooling

### Node.js and pnpm

Purpose: Local runtime and package manager used for install, development server, and scripts.

Workflow role: Runs pnpm install, pnpm dev, and likely resource push hooks.

Integration opportunities:

- Prefer explicit scripts for setup, eval, and validation.
- Add pnpm doctor or setup preflight checks.

Strengths: Common scriptable development path.

Limitations: Version, network, and key setup can create workshop or onboarding friction.

### Git and GitHub

Purpose: Demo app ingests a GitHub URL and summarizes commits since the latest release; Git is also used for repo cloning and version control.

Workflow role: Source material for generated changelog task and versioned eval assets.

Integration opportunities:

- Build eval cases around real repo change summaries.
- Use PR-time evals to detect prompt/model regressions.

Strengths: Realistic developer workflow fixture.

Limitations: GitHub rate limits require optional token handling.

### Next.js / Route Handlers

Purpose: Implied by app generate route.ts and localhost dev flow.

Workflow role: Application route that wraps model calls, loads prompts, logs spans, and generates changelogs.

Integration opportunities:

- Instrument route handlers as trace roots.
- Attach metadata such as route, model, prompt version, repository URL, and release range.

Strengths: Clear production span boundary.

Limitations: Route-level tracing can miss downstream tool details unless spans are explicit.

## Model and Provider Tooling

### OpenAI API and GPT-4.1

Purpose: OpenAI is the workshop provider; GPT-4.1 is mentioned as a judge model.

Workflow role: Runs task prompts and higher-quality LLM-as-judge scoring.

Integration opportunities:

- Use cheaper models as tasks and stronger models as judges.
- Record model names in eval artifacts.

Strengths: Easy provider setup through Braintrust.

Limitations: Requires API keys, cost governance, and judge calibration.

### Bedrock, Custom Providers, and Local Models

Purpose: Alternative model/provider integrations, with local models discussed through remote evals.

Workflow role: Provider abstraction and model comparison.

Integration opportunities:

- Run cross-provider eval comparisons.
- Evaluate self-hosted models against hosted baselines.

Strengths: Avoids single-provider lock-in.

Limitations: Baselines must include provider metadata; local setup adds reproducibility risk.

## Observability and Instrumentation

### OpenAI Client Wrapper, Vercel AI SDK Wrapper, OTEL, Trace Decorators, and span.log

Purpose: Capture prompt/response, metrics, latency, cost, errors, arbitrary function traces, and additional metadata.

Workflow role: Production evidence capture and online scoring input.

Integration opportunities:

- Wrap model clients at system boundaries.
- Trace retrieval, tool calls, validation, routing, and post-processing.
- Feed AI eval traces into existing observability pipelines through OTEL.

Strengths:

- Low-friction adoption through wrappers.
- Fine-grained diagnosis through manual spans.

Limitations:

- Wrapper convenience can hide missing business context.
- Rich traces create privacy and retention obligations.

## Collaboration and Configuration Tooling

### Slack, API Keys, and .env.local

Purpose: Slack coordinates workshop materials; .env.local carries Braintrust, OpenAI, and optional GitHub keys.

Workflow role: Human coordination and local authentication.

Integration opportunities:

- Use dedicated channels for eval rollout support.
- Provide .env.local.example and setup validation.
- Add secret scanning before fixture or trace promotion.

Strengths: Familiar onboarding pattern.

Limitations: Setup is fragile when network, keys, and external project creation are all required.

## Harness Engineering Insights

## Orchestration

- The transcript implies a multi-stage harness: setup resources, run offline evals, save experiments, run app, capture traces, configure online scoring, filter logs, review cases, and promote traces to datasets.
- Agentic optimization appears as a higher-order orchestrator that can inspect prior runs, propose prompt changes, execute experiments, and compare deltas.
- The task abstraction supports single prompts, multi-turn chats, tool calls, RAG, and chained prompts, which maps to harness runners that must handle both simple and agentic workflows.

Implementation pattern:

- Define a run_evaluation_loop orchestrator with stages: prepare_resources, run_offline_eval, compare_baseline, instrument_runtime, sample_online, route_review, promote_examples, calibrate_judge.
- Require every stage to emit artifacts, not just UI state.

## Validation

- Deterministic scores should be first-class validation gates.
- LLM-as-judge scores should start advisory and graduate only after calibration.
- Baseline comparison is more meaningful than static thresholds.
- Trial evals, repeated runs, rationale inspection, and human labels are needed for stochastic scoring.

Implementation pattern:

- Separate required_deterministic_verdict, advisory_judge_verdict, human_review_status, and baseline_delta.
- Fail CI on deterministic schema/safety/regression checks; warn or require review on fuzzy quality drops until judge calibration is proven.

## Context

- Dataset rows carry input, expected output, and metadata.
- Metadata can contain few-shot examples, source labels, release ranges, or scenario context.
- Prompt templating with Mustache injects dataset fields into tasks.
- Multi-turn and tool-call contexts can be represented as extra messages.

Implementation pattern:

- Treat context as structured data with schema, provenance, and privacy classification.
- Avoid packing all context into a prompt string; preserve fields so scorers and reviewers can inspect them.

## Routing

- Online scoring routes low-score spans into custom views.
- Span selectors route scores to root spans or child spans.
- Human review mode hides irrelevant fields for reviewer personas.
- Dataset promotion routes selected logs back into offline evals.

Implementation pattern:

- Build routing rules around score_threshold, span_type, feedback_score, model_version, route_name, and risk_class.
- Give each routed case a required disposition and owner.

## Memory

- Experiments act as longitudinal memory of score changes.
- Logs act as production memory.
- Datasets act as curated memory of scenarios.
- Human labels act as ground-truth memory.
- Few-shot examples in metadata act as prompt memory.

Implementation pattern:

- Keep raw traces, curated datasets, baselines, and few-shot memories in separate stores with explicit promotion rules.
- Record why an example entered a dataset and when it should be revisited.

## Evals

- Eval design is framed as empirical testing rather than vibe checking.
- The same eval can be run in UI playgrounds, source-controlled SDK files, and CI.
- Scores must produce numeric outputs for comparison but should retain explanations.

Implementation pattern:

- Every eval run should produce inputs, outputs, scores, rationales, model/provider, prompt_version, dataset_version, scorer_version, baseline, and comparison.

## Governance

- The transcript implies, but does not fully define, governance around who can change prompts, scores, datasets, and online scoring rules.
- Human review and subject matter expert roles are acknowledged but left organization-specific.
- API keys, production logs, user feedback, and trace promotion require privacy and access controls.

Implementation pattern:

- Add governance policy for eval asset mutation, online scoring activation, human label acceptance, and production trace promotion.
- Require code review or explicit approval for changing scorer criteria and thresholds.

## Scaling

- Sampling controls cost for online scoring.
- Custom views scale human review by focusing attention.
- Source-controlled eval assets scale collaboration across environments.
- Non-technical users can participate through UI review and prompt/model choices.

Implementation pattern:

- Use tiered evaluation: cheap deterministic checks on most traffic, sampled judge checks on selected spans, human review on routed cases, broader suites before release.

## Recovery

- Low-score logs become debugging inputs.
- Production traces reveal missing dataset edge cases.
- Judge/human disagreement triggers eval repair rather than app repair.
- Bad output with low score triggers app improvement.

Implementation pattern:

- Encode a failure decision matrix:
- good output plus high score: accept
- good output plus low score: fix scorer
- bad output plus high score: fix scorer
- bad output plus low score: fix app

## Implied Best Practices

- Start with executable evals before building dashboards or heavy process.
- Keep eval assets close to the application code when they affect release decisions.
- Use UI tools for exploration, but promote durable decisions into versioned artifacts.
- Treat model changes, prompt changes, and scorer changes as separate experimental variables.
- Preserve model/provider/prompt/dataset/scorer versions for every run.
- Use strong models as judges for cheaper production models, but do not assume judge determinism.
- Evaluate judges against human labels and deterministic approximations.
- Use production logs to discover missing cases, not merely to debug incidents.
- Create human review queues from filtered evidence, not broad unstructured log browsing.
- Make online scoring sampling explicit and adjustable.
- Target child spans when root-span scores are too coarse.
- Prefer small, fast evals in the PR loop and deeper suites in release or scheduled lanes.
- Store rationale and inspected inputs for judge scores.
- Use metadata columns for context, few-shot examples, scenario tags, and provenance.
- Keep user feedback separate from expert human review because they answer different questions.
- Treat trace-to-dataset promotion as a governed data pipeline.
- Do not overfit to a golden dataset before real production traces exist.
- Do not let raw percentages replace baseline comparison and failure classification.
- Design evals around stable qualities, but bind tasks to current application code so tests do not become stale.
- Treat non-technical review participation as a product feature, not an afterthought.
- Keep provider abstraction in the evaluation layer so model swaps can be measured empirically.

## Failure Modes & Mitigations

## Failure: LLM Judge False Authority

Description: LLM-as-judge scores can look authoritative while being stochastic, biased, overconfident, or misaligned with human expectations.

Evidence:

- [00:42:21] raises concern that two judge runs can produce different scores.
- [00:48:41] raises concern about trusting LLM-as-judge results.
- [00:15:43] explicitly recommends evaling the judge.

Probable root cause: Teams want a numeric quality signal for subjective tasks and may promote the judge before calibration.

Severity: High.

Mitigation strategy:

- Keep judge scores advisory until calibrated.
- Run repeated trials and track variance.
- Compare judge outputs with human labels.
- Capture judge rationale and audit samples.

Recommended guardrails:

- judge_calibration_status required before judge blocks release.
- Required human-labeled holdout set for each blocking judge.
- Alert on judge/deterministic disagreement.

## Failure: Dataset Contamination From Production Logs

Description: Adding production spans to datasets can import private data, biased cases, bad examples, or low-quality outputs into future evals and prompts.

Evidence:

- [01:04:03] demonstrates adding a span to a dataset.
- [01:06:04] says good or bad responses can be selected for datasets.
- [01:23:33] discusses using data-set examples for few-shot prompting.

Probable root cause: Trace-to-dataset promotion is easy, while privacy review and curation policy are not specified.

Severity: High.

Mitigation strategy:

- Require provenance, privacy classification, redaction, and selection reason before promotion.
- Keep bad-case regression fixtures separate from few-shot positive examples.
- Add secret and PII scanning before committing promoted examples.

Recommended guardrails:

- production_trace_promote command must require reviewer, source span, redaction status, and intended use.
- Disallow direct use of raw production logs as prompt examples without approval.

## Failure: Stale Eval Task Logic

Description: Eval task definitions can duplicate old application workflows, so they stop mimicking the current system as the application evolves.

Evidence:

- [01:16:22] to [01:20:29] contains an extended participant concern about application logic changing from two turns to five turns.
- [01:20:29] recommends dynamically calling the current task.

Probable root cause: Eval code often reimplements task steps instead of importing production entrypoints.

Severity: High.

Mitigation strategy:

- Bind eval tasks to production functions/routes where possible.
- Add contract tests that verify eval entrypoints use current application code.
- Preserve stable input/output scenarios while allowing internal implementation changes.

Recommended guardrails:

- CI check for duplicated prompt/workflow code in eval files.
- Required task owner review when workflow topology changes.

## Failure: Absolute Score Misinterpretation

Description: Teams may treat 80% or 90% as inherently good without considering baseline, dataset quality, scorer version, or variance.

Evidence:

- [00:43:24] says what matters is the baseline compared to yesterday, not a fixed 80%.
- [00:31:03] shows baseline and comparison tasks.

Probable root cause: Percent scores are easy to read and easy to over-trust.

Severity: Medium.

Mitigation strategy:

- Report deltas, confidence, and baseline metadata alongside scores.
- Separate pass/fail verdicts from raw score display.

Recommended guardrails:

- PR reports must include baseline run ID and scorer version.
- Block merge only on defined regression criteria, not bare score thresholds.

## Failure: UI/Repo Drift

Description: Platform UI edits to prompts, scores, datasets, or online scoring rules can diverge from source-controlled definitions.

Evidence:

- [00:37:13] says source-controlled assets are a benefit.
- [00:16:44] and [00:31:03] show UI-driven playground and experiment creation.

Probable root cause: UI is convenient for iteration, but durability requires repo synchronization.

Severity: Medium.

Mitigation strategy:

- Establish promotion workflow from UI exploration to repo assets.
- Run drift checks between platform resources and code.
- Treat UI-only config as non-authoritative for release gates.

Recommended guardrails:

- External resource manifest with hashes.
- CI warning when platform resource versions differ from repo definitions.

## Failure: Hidden External Mutation During Install

Description: Running package install can push resources into Braintrust, mutating external platform state as a side effect.

Evidence:

- [00:23:51] and [00:24:55] describe pnpm install running braintrust push in the background.
- [00:36:12] to [00:37:13] repeats that install triggers resource push.

Probable root cause: Workshop convenience optimizes setup speed over operational clarity.

Severity: Medium.

Mitigation strategy:

- Move external mutations to explicit commands such as pnpm braintrust:push.
- Print the target project and resources before mutation.
- Require dry-run mode in CI.

Recommended guardrails:

- No postinstall external mutations in production repos.
- Resource push requires explicit environment variable or CLI flag.

## Failure: Human Review Bottleneck and Ownership Ambiguity

Description: Human review is critical but the transcript leaves ownership, reviewer roles, staffing, and scaling mechanisms vague.

Evidence:

- [01:10:16] mentions product managers and doctors as possible reviewers.
- [01:21:31] says the role is organization-specific and Braintrust itself is not currently using such reviewers for its own product.
- [01:22:31] says some customers hire external annotation services.

Probable root cause: Human evaluation depends on domain and organization design rather than platform features alone.

Severity: High for regulated or high-stakes domains; Medium otherwise.

Mitigation strategy:

- Define reviewer personas, permissions, queues, SLAs, and acceptance criteria.
- Track inter-reviewer agreement.
- Separate user feedback from expert review.

Recommended guardrails:

- No ground-truth label accepted without reviewer role and rubric version.
- Require second review for high-risk labels.

## Failure: Sampling Blind Spots

Description: Online scoring samples may miss rare regressions or high-severity failures.

Evidence:

- [00:57:53] says scoring can run on 1% or 100% of traffic.
- [00:58:54] recommends increasing sampling after trusting metrics.

Probable root cause: Cost and latency constraints push teams toward partial coverage.

Severity: Medium to High depending on domain risk.

Mitigation strategy:

- Use risk-based sampling, not only uniform sampling.
- Always score known high-risk spans and recent rollout cohorts.
- Combine online scoring with deterministic always-on guards.

Recommended guardrails:

- Coverage reports for score sampling.
- Escalate sampling during releases, model changes, and incidents.

## Failure: Few-Shot Feedback Loop Contamination

Description: Using high-scoring dataset examples as few-shot prompt examples can reinforce judge bias or cause training-on-the-test behavior.

Evidence:

- [01:23:33] says metadata can provide few-shot examples for eval or playground rows.
- [01:23:33] also says native live-traffic-to-few-shot use is not facilitated by the platform.

Probable root cause: Teams naturally want to reuse good outputs, but eval examples and prompt examples need separation.

Severity: Medium.

Mitigation strategy:

- Keep eval test rows, few-shot exemplars, and holdout rows separate.
- Do not select few-shot examples using the same judge being optimized unless reviewed.

Recommended guardrails:

- Dataset row field allowed_uses: eval_only, few_shot, training, regression, holdout.
- CI check preventing holdout examples from appearing in prompt metadata.

## Failure: Observability Without Privacy Boundary

Description: Rich tracing captures prompts, responses, metadata, costs, tool calls, and feedback; without redaction it can over-collect sensitive data.

Evidence:

- [00:56:51] says wrappers log prompt/response, metrics, latency, errors, and metadata.
- [01:02:01] to [01:04:03] describes detailed traces and spans.

Probable root cause: Low-friction instrumentation makes data capture easier than data governance.

Severity: High.

Mitigation strategy:

- Redact or hash sensitive fields before logging.
- Classify spans by privacy level.
- Restrict human review views to necessary fields.

Recommended guardrails:

- Trace schema with privacy_class.
- Required redaction processor before production logging.
- Periodic audit of logged fields.

## Failure: Workshop Setup Fragility

Description: Participants struggled with Wi-Fi, API keys, repo setup, env files, and resource projection.

Evidence:

- [00:24:55] says Wi-Fi was not working for a participant.
- [00:28:59] to [00:36:12] includes confusion about OpenAI keys, Braintrust keys, .env.local, and project connection.
- [00:35:11] says the internet connection was probably the biggest thing they were fighting.

Probable root cause: Multi-service setup with network, keys, package install, external project creation, and local repo configuration.

Severity: Medium.

Mitigation strategy:

- Provide preflight setup checks.
- Separate offline walkthrough from live mutation.
- Include mocked/local fallback fixtures.

Recommended guardrails:

- pnpm doctor verifies Node, pnpm, env keys, Braintrust auth, provider auth, and network.
- Demo mode that runs without external API keys.

## Reusable Techniques

- Three-field dataset contract: input, expected, metadata.
- Score contract: output numeric score from 0 to 1 plus rationale and inspected evidence.
- Decision matrix for app-vs-eval repair: compare human judgment to score result.
- Trial evals for stochastic judges: run multiple times, average, and inspect variance.
- Judge calibration suite: human-labeled holdout examples for each LLM-as-judge prompt.
- Dataset source tagging: synthetic, staging, production, human-labeled, regression, holdout.
- Trace promotion workflow: span -> privacy review -> curation -> dataset row -> baseline update.
- Custom review views: low score, thumbs down, judge disagreement, high cost, tool error.
- Span-targeted scoring: root spans for whole task, child spans for specific components.
- Risk-based sampling: higher sampling during releases or on high-risk spans.
- Source-controlled resource projection: code definitions pushed to external platform with drift manifest.
- Playground promotion: scratch comparison becomes durable experiment only after metadata and rationale are preserved.
- Dynamic task binding: eval code imports live task entrypoints rather than reimplementing workflow steps.
- Baseline-first reporting: every score shown with prior run, delta, scorer version, and dataset version.
- Prompt/model A/B experiments: one variable per run when possible.
- Few-shot governance: metadata examples allowed only when approved for that use.
- Human review schema: reviewer role, rubric, label, rationale, confidence, timestamp.
- External mutation guard: no hidden postinstall pushes in serious repos.
- Eval artifact bundle: result, command log, scorer results, rationale, manifest, baseline result, and latest pointer.

## Strategic Insights

- Evals are becoming the release infrastructure for AI systems, not a separate analytics add-on.
- The winning pattern is not choosing between deterministic tests and LLM judges; it is layering deterministic gates, fuzzy advisory signals, production traces, and human review.
- Observability and evals are converging. Production traces are no longer just debugging evidence; they are future test cases, review queues, and prompt-improvement material.
- Source-controlled eval assets are the key governance move. Without them, prompt, score, and dataset changes become platform configuration drift.
- Human review remains the hardest scaling problem. Platforms can provide review views, but organizations still need reviewer roles, rubrics, privacy policy, and agreement measurement.
- The next frontier is agentic eval optimization, where systems propose changes to prompts, datasets, and scores. This is powerful but dangerous unless holdouts, approval flows, and scorer governance are strict.
- For harness engineering, the transcript reinforces a local-first doctrine: external platforms can supply observability and iteration surfaces, but release authority should remain with deterministic, reproducible artifacts until fuzzy judges are calibrated.

## Key Quotes & Evidence

- [00:07:34] "The first is a task... Then we have our data set... And then the score..."
- [00:08:35] Synthetic data is acceptable at first, but mature datasets should be grounded in logs.
- [00:09:36] Online eval captures real traffic, diagnoses problems, monitors performance, and captures user feedback.
- [00:10:38] Good output/low score or bad output/high score means improve evals; bad output/low score means improve the app.
- [00:15:43] "If you're writing LLM as a judge, maybe you should eval the judge..."
- [00:31:03] Playground comparisons distinguish baseline task from comparison task.
- [00:37:13] SDK-defined assets allow version control alongside the application.
- [00:42:21] Participants identify LLM judge non-determinism; response recommends trial evals and averaging.
- [00:43:24] Judge rationales in logs should be read and used to tune the judge.
- [00:44:25] Absolute score targets matter less than comparison to previous baselines.
- [00:56:51] Wrappers and OTEL support capture prompt/response, metrics, latency, errors, traces, and metadata.
- [00:58:54] Online scoring rules include sampling rates and span targeting.
- [01:04:03] Production spans can be added back to datasets.
- [01:10:16] Subject matter experts can review outputs to establish ground truth.
- [01:16:22] One or two scores and ten rows can be useful; do not wait for a golden dataset.
- [01:20:29] Evals should dynamically call the changing application task during PRs.
- [01:23:33] Few-shot examples can live in dataset metadata, but native live-traffic-to-few-shot use is not provided.

## Final Assessment

Strongest ideas:

- The offline/online feedback loop is the core reusable architecture.
- The task/dataset/score abstraction is simple enough to become a repo schema.
- Eval-the-eval is the right posture for LLM judges.
- Source-controlled eval resources prevent platform configuration drift.
- Trace-to-dataset promotion turns production behavior into regression coverage.

Weakest areas:

- Human review governance is under-specified.
- Privacy and dataset contamination risks are acknowledged only indirectly.
- Hidden external mutation through install scripts is operationally risky.
- Dynamic task binding answers part of eval drift, but not step-level workflow regression.
- Online sampling strategy needs risk-based policy, not just configurable percentages.

Most reusable concepts:

- App-vs-eval repair matrix.
- Deterministic plus judge scoring.
- Playground-to-experiment promotion.
- Low-score views as review queues.
- Baseline-first score interpretation.
- Human labels as judge calibration data.

Highest leverage opportunities:

- Add a local eval artifact schema that mirrors task, dataset, score, baseline, and trace provenance.
- Build a promotion pipeline for production traces with privacy review and allowed-use flags.
- Add judge calibration status and variance reporting before any fuzzy score becomes blocking.
- Create CI checks that detect eval task drift from production entrypoints.
- Store platform resource manifests to detect UI/repo drift.

Most important risks:

- LLM judges becoming release authority before calibration.
- Production logs leaking into datasets or prompts without redaction.
- Eval suites testing stale task logic.
- Human review bottlenecks becoming invisible process debt.
- Teams overfitting prompts to visible eval examples.

Immediate implementation candidates:

- Implement source_kind, allowed_uses, and privacy_status fields for eval cases.
- Add a deterministic/judge/human scorer taxonomy.
- Require baseline run IDs and scorer versions in every result artifact.
- Create a local promote-trace-to-fixture checklist before any production trace becomes an eval case.
- Keep platform-derived results explanatory unless mirrored into local artifacts with command evidence.
