# Moat Invariants

## Proven Invariants

- The runner is not the moat.
- Generic frameworks are not the moat.
- Dashboard polish is not the moat.
- Uncalibrated judge scores are not the moat.
- The moat is real-regression fixtures plus provenance, replay, baselines,
  blocker taxonomy, and operating discipline.
- Moat strength increases when repeated failures become replayable cases.
- Moat strength decreases when complexity is generic or easy to copy.

## Strategic Assumptions

- coding-harness and agent-skills provide the first high-value failure corpus.
- Trust compounds through artifact quality and fixture provenance.

## Must Protect

- real-regression fixture corpus;
- provenance and privacy metadata;
- canonical result schema;
- artifact bundle contract;
- baseline history;
- deterministic scorer behavior;
- repo-local suite ownership;
- judge calibration history.

## Must Not Erode

- local artifact authority;
- owner-controlled suite truth;
- deterministic required gates;
- adapter boundary;
- privacy/redaction discipline.

## Operating Rule

Complexity is defensible only when it captures real failure structure. Complexity
that adds framework breadth, UI polish, or process ceremony weakens the moat.

## Hard Block

Do not call technical sophistication a moat. If competitors can copy it without
Jamie-specific fixtures, provenance, baselines, or workflow memory, it is not
defensible.
