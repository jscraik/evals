# Image Prompt Metadata

Use case: specification-review technical infographic
Asset type: review artifact / X technical explainer
Recommended size: 2048x1152
Aspect ratio: 16:9

Title:
"From Documentation-Only Eval Intent -> Evidence-Backed Executable Spine Spec"

Subtitle:
"A bespoke transformation map for .harness/specs/2026-05-18-evals-executable-spine-spec.md"

Context:
The reviewed spec turns an internal evals idea into a phase-one executable spine: local smoke command, canonical schemas, local artifact bundle, deterministic scorers, split baseline state, tracker override discipline, accessibility/security acceptance IDs, and closure eval evidence. The repo still lacks implementation files and validators, so confidence is bounded by blocked runtime validation.

Before state:

- Documentation-heavy eval intent with no implementation files in the repo.
- Linear tracker creation blocked by unsupported connector mutation.
- Missing explicit non-functional, accessibility, security/privacy, and retention acceptance gates.
- Risk that agents could claim readiness from prose without local artifact proof.

After state:

- Spec directly defines canonical command and local artifact authority.
- Acceptance matrix expanded to SA-001 through SA-036.
- Tracker override contract, split baseline fields, latest-run pointer, and deterministic scorer closure are explicit.
- Accessibility, privacy, retention, and validation-reporting proof points are closure criteria.

Evidence shown:

- Spec file present: pass.
- Review addendum present: pass.
- README.md, AGENTS.md, package.json, schemas, smoke fixture: blocked_missing.
- HE traceability lint script: blocked_missing.
- Runtime smoke command: blocked until package command exists.
- Image generation: fallback-only because no callable image generation tool is exposed in this environment.

Composition:
Show a left-to-right transformation from documentation-only architecture intent to an executable local evidence spine. Include four lanes: tracker discipline, artifact contract, deterministic validation, and accessibility/security proof. Show a confidence movement from 82% to 88% with explicit blockers remaining.

Style:
Professional engineering poster, dense but readable, restrained colour palette, crisp diagrammatic layout, no fake dashboards, no invented metrics, no fake logos, no unsupported claims, readable labels, clean zones for deterministic overlay text.

Deterministic overlay text to add separately:

- .harness/specs/2026-05-18-evals-executable-spine-spec.md
- From Documentation-Only Eval Intent -> Evidence-Backed Executable Spine Spec
- Acceptance coverage expanded to SA-001..SA-036
- Validation: spec/review pass; implementation/runtime blocked
- Loop outcome: optimal within available evidence
