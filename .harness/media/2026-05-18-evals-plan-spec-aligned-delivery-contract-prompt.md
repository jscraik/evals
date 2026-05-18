# Image Prompt Metadata

$imagegen

Use case: plan-review technical infographic
Asset type: review artifact / X technical explainer
Recommended size: 2048x1152
Aspect ratio: 16:9

Title:
"From Tracker-Blocked Plan Drift -> Spec-Aligned Delivery Contract"

Subtitle:
"A bespoke transformation map for Evals Executable Spine Plan and .harness/specs/2026-05-18-evals-executable-spine-spec.md"

Context:
Reviewed and patched the evals executable-spine HE plan and associated spec. The patch tightened closure-unit traceability, replaced placeholder artifact checks with deterministic latest-run path resolution, upgraded SA-033 privacy evidence from regex-only heuristic to a minimum evidence set, and aligned first-slice wording with tracker-blocked local preparation.

Before state:

- EP-006 traceability wording duplicated scorer/baseline work and hid closure/drift proof.
- Artifact validation used placeholder <run-id> paths without deterministic resolution.
- Secret/privacy validation risked being interpreted as regex-only evidence.
- First-slice wording could confuse tracker gate versus documentation slice.

After state:

- EP-006 explicitly closes with replayable closure eval and drift proof.
- latest.json resolves concrete result, report, manifest, and command log paths.
- SA-033 requires regex inspection, provenance/privacy/redaction review, and manifest privacy fields.
- Tracker gate and local-prep language are aligned across plan and spec.

Spec update shown:

- updated
- Phase-two and phase-three validation now match the revised plan.
- Remaining spec risk: runtime behavior, Linear recovery, schemas, fixture, runner, and traceability lint are blocked until implementation exists.

Evidence shown:

- Plan/spec file checks: pass.
- Review artifact: pass.
- README.md, AGENTS.md, package.json, schemas, fixture, trace lint: blocked_missing.
- Image generation: blocked because no callable image generation tool is exposed.

Loop outcome:

- optimal within available evidence

Composition:
Show a left-to-right transformation from a strong but slightly drifting plan/spec pair to a validated, spec-aligned implementation plan. Include confidence movement 84% -> 88%, validation gates, latest-run artifact pointer, SA-033 privacy evidence, Linear blocker, rollback path, and remaining blockers. Leave clean space for deterministic overlay text.

Style:
Professional engineering poster, dense but readable, restrained colour palette, crisp diagrammatic layout, no fake dashboards, no invented metrics, no fake logos.

Deterministic overlay text to add separately:

- Evals Executable Spine Plan
- .harness/specs/2026-05-18-evals-executable-spine-spec.md
- From Tracker-Blocked Plan Drift -> Spec-Aligned Delivery Contract
- Main improvement: concrete artifact resolution plus aligned closure traceability
- Evidence: plan/spec pass; implementation/runtime blocked
- Loop outcome: optimal within available evidence
