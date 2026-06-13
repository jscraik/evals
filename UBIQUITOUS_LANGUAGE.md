# Evals Ubiquitous Language

This glossary keeps the executable-spine vocabulary stable for humans and
agents. It is intentionally small and phase-one scoped.

## Canonical Terms

| Term | Definition | Aliases / User Phrases | Source Notes |
| --- | --- | --- | --- |
| Executable spine | The smallest local eval loop that can run one synthetic fixture and produce replayable evidence. | local runner, eval spine, first command | Spec goals and README doctrine. |
| Eval case | A JSON fixture describing one replayable evaluation input, expected deterministic evidence, selected scorers, privacy metadata, and baseline reference. | fixture, smoke case | Spec domain model and schemas/eval-case.schema.json. |
| Scenario contract | The actor-goal acceptance shape inside an eval case: primary actor, goal, stakeholder interests, preconditions, success end condition, failure modes, and acceptance paths tied to deterministic scorer evidence. | actor-goal contract, acceptance path, fixture intent | schemas/eval-case.schema.json and fixtures/smoke/pr-closeout.case.json. |
| Artifact bundle | The local proof package for a run: result, report, command log, manifest, scorer results, baseline result, trace event timeline, and latest pointer. | run artifacts, proof package | Spec artifact output, README local artifacts, and GAP-008 trace enforcement. |
| Runtime state packet | The schema-backed current-state view emitted by `pnpm evals state --json`, classifying local proof as ready, stale, missing, or invalid and naming recommended validation commands. | state command, current-state packet, runtime card | GAP-004 and schemas/runtime-state.schema.json. |
| Local observability loop | The repo-local feedback loop where command logs, scorer results, baseline results, manifests, reports, and trace event timelines explain a failure so Codex can patch, rerun, and verify. | observability stack, feedback loop, query/correlate/reason | .harness/refactors/2026-05-20-local-observability-feedback-loop.md. |
| Trace event timeline | The ordered JSONL lifecycle record for one eval run, emitted inside the artifact bundle and validated by \`pnpm evals check --json\`. It records run start, command result, scoring, baseline observation, manifest production, latest validation, and run finish without becoming external telemetry authority. | trace-events.jsonl, replayable trace, local timeline | GAP-008 and schemas/trace-event.schema.json. |
| Runtime evidence contract | A portable offline fixture/scorer contract for Codex-shaped runtime behavior such as permission profiles, subagent artifact obligations, plugin attribution, and other event evidence that evals can classify without becoming runtime authority for Codex or sibling repos. | runtime evidence case, contract observation, Codex-aligned offline case | JSC-345 and schemas/runtime-evidence-case.schema.json. |
| External project manifest | The target-owned .evals/project.json contract that declares suite ownership, fixture roots, runtime evidence policy, privacy approval evidence, and authority boundaries for external repo inspection. | project manifest, target manifest, external manifest | .harness/decisions/2026-06-04-external-project-manifest-path.md and schemas/external-project-manifest.schema.json. |
| Authority classifier | The evals-owned module that converts manifest state, latest artifact state, runtime evidence state, and privacy approval status into authority_mode, proof context, non-proof claims, recovery guidance, and machine-readable action partitions. | authority router, authority decision owner, action classifier | src/lib/authority-classifier.js and schemas/authority-classification.schema.json. |
| Authority mode | The machine-readable classification for what evals can currently prove for an external root, such as artifact_only, not_configured, or blocked. It does not certify target behavior, CI, PR state, tracker state, or merge readiness. | authority state, proof mode | schemas/authority-classification.schema.json. |
| Action partition | The schema-backed separation between agent_next_actions, human_approval_required_actions, and blocked_actions in an authority classification packet. | next-action partition, recovery partition | src/lib/authority-classifier.js. |
| Privacy approval evidence | Target-owned manifest fields that name privacy_class, approval_status, scope, data_classes, and optional approval, retention, redaction, or expiry references. evals validates evidence shape and readiness classification, but does not decide the target repo's privacy policy. | privacy manifest evidence, approval evidence, not_required evidence | schemas/external-project-manifest.schema.json. |
| oracle_type: artifact_contract | A suite-quality oracle that checks artifact shape, provenance, and contract evidence rather than target behavior. Use for phase-one proof packets. | artifact contract oracle | schemas/external-project-manifest.schema.json. |
| oracle_type: schema | A suite-quality oracle that validates data against schemas. Use when structural conformance is the intended evidence. | schema oracle | schemas/external-project-manifest.schema.json. |
| oracle_type: human_rubric | A suite-quality oracle that depends on a human-owned rubric or label. Use when judgment is required and reviewer authority must stay explicit. | rubric oracle | schemas/external-project-manifest.schema.json. |
| oracle_type: baseline | A suite-quality oracle that compares against a named baseline. Use when drift from a prior state is the intended evidence. | baseline oracle | schemas/external-project-manifest.schema.json. |
| oracle_type: policy | A suite-quality oracle that checks policy or governance rules. Use for privacy, execution, artifact, or authority-boundary constraints. | policy oracle | schemas/external-project-manifest.schema.json. |
| oracle_type: metamorphic | A suite-quality oracle that checks relation-preserving transformations. Use when exact expected output is less useful than invariant behavior. | metamorphic oracle | schemas/external-project-manifest.schema.json. |
| oracle_type: llm_advisory | A suite-quality oracle that uses an LLM as non-authoritative advice. Use only when deterministic or human evidence remains the authority. | advisory judge oracle | schemas/external-project-manifest.schema.json. |
| oracle_type: mixed | A suite-quality oracle that combines multiple oracle sources. Use when each source and its authority boundary are explicit. | mixed oracle | schemas/external-project-manifest.schema.json. |
| evaluator_authority_status: deterministic | The evaluator result comes from deterministic checks and can be replayed locally. Use for strongest phase-one authority. | deterministic evaluator | schemas/external-project-manifest.schema.json. |
| evaluator_authority_status: human_labeled | The evaluator result depends on target-owned human labels or review. Use when labels are evidence and reviewer ownership is explicit. | human label authority | schemas/external-project-manifest.schema.json. |
| evaluator_authority_status: llm_advisory | The evaluator result is LLM-assisted and advisory only. Use when it must not become merge, CI, or target-behavior authority. | advisory LLM status | schemas/external-project-manifest.schema.json. |
| evaluator_authority_status: llm_calibrated | The evaluator result uses a validated LLM judge with calibration evidence. Use only when judge validation is explicit and still separated from deterministic proof. | calibrated LLM status | schemas/external-project-manifest.schema.json. |
| evaluator_authority_status: statistically_corrected | The evaluator result has statistical correction for known measurement error. Use when correction assumptions and uncertainty remain visible. | corrected evaluator status | schemas/external-project-manifest.schema.json. |
| evaluator_authority_status: blocked | The evaluator cannot be treated as authority. Use when privacy, calibration, rubric, or evidence prerequisites are missing. | blocked evaluator status | schemas/external-project-manifest.schema.json. |
| Repo-relative artifact pointer | A path recorded in latest.json or a manifest that must stay relative to this repository and must not use absolute paths or '..' traversal segments. | artifact pointer, local artifact path, latest pointer field | src/cli.js latest-run validation and test/cli.test.js path-boundary cases. |
| Deterministic verdict | The required pass/fail outcome computed from deterministic scorer results, not judge text or hosted telemetry. | required verdict, pass/fail | Spec invariants and schemas/eval-result.schema.json. |
| Scorer result | One deterministic check result with inspected inputs, status, evidence, and failure reason when applicable. | scorer evidence, check result | schemas/scorer-result.schema.json. |
| Assertion result | A schema-backed diagnostic row emitted by deterministic scorers and shared contract checks, with given context, expected behavior, observed value, expected value, evidence references, reproduce command, and pass/fail status. | assertion row, deterministic assertion, Given/should diagnostic | schemas/assertion-result.schema.json and schemas/scorer-result.schema.json. |
| Baseline result | The explicit baseline state for a run, keeping presence, comparison, and promotion separate. | baseline state, baseline comparator output | schemas/baseline-result.schema.json. |
| Deep module fix packet | The required implementation packet for turning an audit gap into a change: owner module, public interface, hidden implementation rule, caller contract, seam test, tracer proof, rollback path, and validation gate. | deep module format, fix mechanics, module packet | .harness/refactors/2026-05-20-deep-module-fix-mechanics.md. |
| Parent implementation loop | The evidence-led program loop that owns the audit phase queue, Linear issue queue, implementation, validation, review, PR, PR triage, child issue closeout, implementation notes, and next issue selection. A child loop cannot close it. | parent loop, phase loop, overall loop, audit implementation loop | .harness/refactors/2026-05-20-parent-child-loop-guardrail.md. |
| Child implementation loop | A bounded loop for one PR review/autofix sweep, one CodeRabbit thread cluster, one Linear child issue, one validation failure cluster, or one heartbeat resume slice. It must return control to the parent implementation loop. | child loop, PR heartbeat, review sweep, issue closeout | .harness/refactors/2026-05-20-parent-child-loop-guardrail.md. |
| Tracer proof | The smallest production-like route through real wiring that proves a changed interface or runtime rule works. | thin proof, smoke proof, production-like path | Deep module fix mechanics and eval artifact proof rules. |
| Local prior-art reuse | Borrowing field patterns and vocabulary from sibling repos as design evidence without importing their runtime or domain authority. | reuse map, reference-only reuse | .harness/references/local-reuse-map.md. |
| Collector prior art | Reusing patterns from local ~/.agents/session-collector and ~/.agents/otel-collector for telemetry shape, freshness, provenance, and verification without adding runtime dependencies. | local collectors, collector reuse | .harness/refactors/2026-05-20-local-observability-feedback-loop.md. |
| Tracker blocked | The delivery state where Linear issue creation is unavailable and no Jamie-approved override exists. | linear_blocked, tracker blocked | Spec tracker override contract and Linear retry evidence. |
| Tracker override approved | The exceptional delivery state where Jamie approves closure without a live Linear issue after recovery paths fail, while preserving the condition to create or link the issue later. | override_approved, approved override | .harness/linear/2026-05-18-evals-tracker-override-approved.md. |
| Closure eval | The .harness/evals artifact that cites command output, artifact paths, validation, scorer verdicts, baseline fields, drift, rollback, and tracker state. | closure evidence, eval closeout | Plan EP-006 and AGENTS.md closure evidence. |

## Prompt Translations

| If Jamie says... | Agents should treat it as... |
| --- | --- |
| "implement the plan" | Execute EP-001 through EP-006 in order, preserving linear_blocked until Linear recovers or Jamie approves an override; after approval, record override_approved without claiming a live Linear issue exists. |
| "local reuse lane" | Use coding-harness and agent-skills as reference evidence only; do not add runtime imports or move domain truth into evals. |
| "use the collectors" | Adapt ~/.agents/session-collector and ~/.agents/otel-collector patterns as prior art; keep evals locally runnable without them. |
| "artifact proof" | Produce or inspect the local artifact bundle and latest.json pointer, not dashboard, telemetry, PR comment, or judge output. |
| "external suite authority" | Inspect declared manifest and local artifact evidence only; classify what evals can prove and what remains human, blocked, or non-proof. |
| "privacy approval" | Read target-owned manifest approval_status and evidence fields; do not scan private target data or make the approval decision inside evals. |
| "observability stack" | Build or inspect local evidence and query/correlation surfaces first; do not add external telemetry authority during phase one. |
| "path-boundary hardening" | Validate repo-relative artifact pointers before reading, hashing, or trusting generated run evidence. |
| "baseline" | Preserve presence_status, comparison_status, and promotion_status as separate machine-readable fields. |
| "deep module format" | Create or follow a deep module fix packet before implementation; do not spread behavior across caller choreography or prose-only rules. |
| "loop through each phase" | Run the parent implementation loop, not only the current PR or child heartbeat; after a child closes, reconcile the parent queue and select the next phase-ordered issue. |
| "continue the heartbeat" | Preserve the distinction between parent heartbeat and child PR/issue heartbeat; do not retire the parent heartbeat unless the parent queue is explicitly complete. |
| "ready for commit and PR" | First prove this path is inside a git repository; if not, classify git add, commit, push, PR, and git-project-triage as blocked. |

## Flagged Ambiguities

| Phrase | Risk | Current Resolution |
| --- | --- | --- |
| completion | Could mean local implementation pass, normal tracker/PR closeout, or approved tracker override closeout. | Say local implementation complete only when artifacts pass; say tracker complete only when a live Linear issue exists or the approved override artifact is present. |
| review passed | Could imply subagent approval. | Only claim subagent review when requested artifact files exist. Coordinator fallback reviews must be named as fallback evidence. |
| privacy check | Could imply full scanner coverage. | Phase one uses synthetic fixtures plus lightweight credential-pattern inspection; full privacy scanner is future hardening. |
| authority | Could imply target behavior certification. | Use authority mode to describe evals-local artifact and manifest proof only; target behavior, CI, PR, tracker, and merge readiness remain separate lanes. |
