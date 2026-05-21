# Evals Ubiquitous Language

This glossary keeps the executable-spine vocabulary stable for humans and
agents. It is intentionally small and phase-one scoped.

## Canonical Terms

| Term | Definition | Aliases / User Phrases | Source Notes |
| --- | --- | --- | --- |
| Executable spine | The smallest local eval loop that can run one synthetic fixture and produce replayable evidence. | local runner, eval spine, first command | Spec goals and README doctrine. |
| Eval case | A JSON fixture describing one replayable evaluation input, expected deterministic evidence, selected scorers, privacy metadata, and baseline reference. | fixture, smoke case | Spec domain model and schemas/eval-case.schema.json. |
| Artifact bundle | The local proof package for a run: result, report, command log, manifest, scorer results, baseline result, trace event timeline, and latest pointer. | run artifacts, proof package | Spec artifact output, README local artifacts, and GAP-008 trace enforcement. |
| Runtime state packet | The schema-backed current-state view emitted by `pnpm evals state --json`, classifying local proof as ready, stale, missing, or invalid and naming recommended validation commands. | state command, current-state packet, runtime card | GAP-004 and schemas/runtime-state.schema.json. |
| Local observability loop | The repo-local feedback loop where command logs, scorer results, baseline results, manifests, reports, and trace event timelines explain a failure so Codex can patch, rerun, and verify. | observability stack, feedback loop, query/correlate/reason | .harness/refactors/2026-05-20-local-observability-feedback-loop.md. |
| Trace event timeline | The ordered JSONL lifecycle record for one eval run, emitted inside the artifact bundle and validated by \`pnpm evals check --json\`. It records run start, command result, scoring, baseline observation, manifest production, latest validation, and run finish without becoming external telemetry authority. | trace-events.jsonl, replayable trace, local timeline | GAP-008 and schemas/trace-event.schema.json. |
| Repo-relative artifact pointer | A path recorded in latest.json or a manifest that must stay relative to this repository and must not use absolute paths or '..' traversal segments. | artifact pointer, local artifact path, latest pointer field | src/cli.js latest-run validation and test/cli.test.js path-boundary cases. |
| Deterministic verdict | The required pass/fail outcome computed from deterministic scorer results, not judge text or hosted telemetry. | required verdict, pass/fail | Spec invariants and schemas/eval-result.schema.json. |
| Scorer result | One deterministic check result with inspected inputs, status, evidence, and failure reason when applicable. | scorer evidence, check result | schemas/scorer-result.schema.json. |
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
