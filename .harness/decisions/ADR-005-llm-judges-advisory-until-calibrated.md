# ADR-005

## Title

LLM Judges Are Advisory Until Calibrated

## Status

accepted

## Decision

LLM judges may provide advisory scoring, qualitative review, summary-quality
assessment, or rubric feedback. They must not decide required gates until
calibration artifacts prove reliability.

Every judge output must record judge mode, model, prompt or prompt hash, rubric
version, evaluator version, calibration status, run ID, and artifact references.

## Context

LLM judges are useful for fuzzy workflow artifacts, but they drift. The source
list includes Awesome LLM Judges and several eval frameworks that encourage
judge-based scoring. The repo does not yet have deterministic scorer coverage.

## Why This Decision Exists

This decision prevents false pass/fail confidence. Future agents may promote
judge scores because they are convenient for ambiguous outputs such as release
notes, PR summaries, or workflow closeout quality.

The decision compounds positively because judge evidence can be collected early
without becoming unearned release authority.

## Alternatives Considered

- Make LLM judges required from the start. Rejected because deterministic
  scorers and calibration artifacts do not exist.
- Ban LLM judges entirely. Rejected because qualitative artifacts may benefit
  from advisory review.
- Trust framework default judge settings. Rejected because local rubrics and
  drift behavior need explicit metadata.

## Accepted Tradeoffs

- Some fuzzy quality checks remain advisory longer.
- Required gates may start narrower.
- Calibration work must be explicit.
- Reports must distinguish deterministic results from judge opinions.

## Anti-Drift Constraints

Must not reappear:

- judge-as-gate without calibration;
- judge output without rubric version;
- judge output without artifact reference;
- subjective score suppressing raw evidence;
- release-blocking LLM judge with no disagreement policy.

Regression indicator: a required verdict changes solely because an LLM judge
changed its score.

Hard block: LLM judge output cannot block, pass, fail, promote, or close work
until deterministic evidence exists and a calibration artifact proves the judge
improves reliability. A prettier rubric is not calibration.

## Safe Revisit Conditions

Revisit if:

- deterministic scorers already cover the required proof path;
- a calibration set exists;
- judge disagreement handling exists;
- rubric and evaluator versions are stable;
- a closure eval proves the judge improves reliability without hiding evidence.

## Related Systems

- Future scorer policy.
- Future judge metadata schema.
- agent-skills historical judge metadata precedent.
- .harness/refactors/quarantine-framework-judge-telemetry-sprawl.md

## Evidence

Facts:

- The intent says LLM judges advise until calibrated.
- The review identifies required LLM judge gates without calibration as a drift
  risk.
- The triage says deterministic scorers should precede LLM judges.
- The strategy says required gates are deterministic until judge calibration is
  proven.

Interpretation:

- Judge discipline protects trust more than judge sophistication does.

Assumptions:

- Advisory judge data can be collected without becoming a required gate.
