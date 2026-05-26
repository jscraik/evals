# Adversarial Review: Evals Router External Code Tree Mining
Date: 2026-05-25
Reviewer: adversarial
Target: .harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md

## Findings (Severity Ranked)

### 1) High: Unpinned external snapshot can silently rewrite implementation priorities
- Evidence:
  - `.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:57-73` lists external files but no commit SHAs or immutable refs.
  - `.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:76-77` says evidence came from partial local clones in `/private/tmp/evals-mining`.
  - `.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:594-601` defines a recommended implementation sequence based on that evidence.
- Failure scenario:
  1. A future implementation pass treats this audit as authoritative prioritization.
  2. External repositories update semantics (for example, assertion behavior, metadata fields, or deprecation rules) after this audit.
  3. The local `/private/tmp/evals-mining` checkout is refreshed (or recreated) without reproducing the original snapshot.
  4. Team cannot prove which upstream version justified OPP ordering, and priorities drift while still appearing "evidence-based."
- Outcome:
  - The queue becomes non-reproducible and governance claims ("source pattern from X") cannot be validated under audit.
- Remediation:
  - Add immutable provenance for each mined source: repo URL + commit SHA + path + retrieval date.
  - Treat missing immutable refs as a validation blocker for any "recommended sequence" section.
- Fixable in this audit doc now:
  - Yes. The doc can be amended immediately with a provenance table and a "snapshot incomplete" warning for unresolved entries.

### 2) Medium: Health-check proposal can cap intentionally minimal suites without an explicit severity/override model
- Evidence:
  - `.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:202-205` proposes health checks including `no_negative_cases`, `no_deterministic_scorers`, and `all_checks_advisory`.
  - `.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:266-276` recommends deterministic classifications.
  - `.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:295-297` requires critical health failures to cap readiness.
- Failure scenario:
  1. A repo-local suite is intentionally minimal (for example, bootstrapping fixture coverage during phase-one hardening).
  2. Health checks classify it as weak by design-time criteria.
  3. "Critical health failures cap readiness" blocks the suite from producing usable local proof signals, even for bounded smoke intent.
  4. Operators either bypass checks manually (policy drift) or pad suites with low-value artifacts just to clear gates (signal corruption).
- Outcome:
  - Composition failure between "minimal executable spine" and "critical caps" causes false-blocking or cargo-cult compliance.
- Remediation:
  - Define a severity model per health check (`advisory`, `warning`, `blocking`) and a documented, machine-readable override path scoped by suite intent.
  - Add explicit criteria for when minimal suites are allowed to be "informationally ready" vs "release ready."
- Fixable in this audit doc now:
  - Yes. The OPP-001 acceptance criteria can be tightened to require severity taxonomy + override contract.

### 3) Medium: Duplicate-key diagnostics risk command-parity drift without one canonical parser contract
- Evidence:
  - `.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:173-177` calls for source-location diagnostics and duplicate-key detection before schema validation.
  - `.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:312-317` says to introduce one owner module and preserve existing public JSON output additively.
  - `.harness/research/audits/2026-05-25-evals-router-external-code-tree-mining.md:325-330` validates via `pnpm test` and `pnpm evals check --json` only.
- Failure scenario:
  1. Duplicate-key detection is added to one path (for example, `check`) via a new diagnostics module.
  2. Another path (`run` or a future helper) still parses with plain `JSON.parse` or a separate parser path.
  3. The same fixture is rejected in one command and accepted (with overwritten keys) in another.
  4. Operators receive contradictory truth depending on command entrypoint.
- Outcome:
  - Cross-command contract mismatch undermines deterministic proof posture and raises triage cost.
- Remediation:
  - Require every contract-file ingestion path to use the same diagnostics owner module.
  - Add explicit parity tests: same malformed fixture must fail identically across `run`, `check`, and any suite-validation path.
- Fixable in this audit doc now:
  - Yes. Expand OPP-002 validation/acceptance to include command-parity requirements.

## Residual Risks
- The audit currently positions implementation order as stable guidance without immutable external provenance, so future readers may over-trust priority recommendations.
- "Additive output" constraints are stated, but backward-compatibility guards for machine consumers are not explicitly codified per command.

## Testing Gaps
- No proposed validation explicitly checks cross-command consistency for diagnostics behavior.
- No proposed negative fixture matrix verifies health-check severities under intentionally minimal suite profiles.
- No audit-level check verifies that every external mining claim has a pinned immutable reference.

WROTE: artifacts/reviews/2026-05-25-evals-router-mining-adversarial-reviewer.md
