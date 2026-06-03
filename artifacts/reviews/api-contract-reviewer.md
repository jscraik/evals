# Review: api-contract-reviewer
## Findings
- High - schemas/runtime-evidence-packet.schema.json:7-15,28-31 and schemas/runtime-state.schema.json:7-15,26-29: New required contract fields (shared_contract_status, local_project_truth_status, adopted_contracts, proves, does_not_prove) were added while keeping schema_version constants unchanged (1 for runtime-evidence packet, 2 for runtime-state). This is a breaking wire-contract change for strict consumers that validate by existing versioned schema. Recommendation: bump schema versions and dual-read old/new during migration, or make fields optional until a versioned cutover.
- High - schemas/runtime-state.schema.json:108-115 plus schemas/runtime-evidence-packet.schema.json:7-15: runtime-state embeds evidence_packet with the same newly required fields and unchanged packet schema version. Existing consumers parsing nested evidence packets by schema_version: 1 can fail even if top-level parsing survives. Recommendation: version nested packet schema independently and publish compatibility matrix for runtime-state -> evidence-packet pairings.
- Medium - schemas/validation-result.schema.json:62,114: runtime_evidence.policy_coverage.status and checks[].policy_coverage.status widened from pass|fail to pass|fail|unavailable|not_configured without a contract version signal. Clients with exhaustive enum handling can regress at runtime. Recommendation: gate widened enums behind a schema/version bump or add explicit backward-compat note and fallback mapping contract.
- Low - src/lib/contract-catalog.js:10-14,28: validateContractCatalog(root) accepts a caller-provided root but reports contract_root from module-global repoRoot (rel(contractsDir)). Output metadata can point at the wrong contract root for non-default callers, weakening trust in emitted validation payloads. Recommendation: derive contract_root from root argument (relFrom(root, join(root, "contracts")) or equivalent stable representation).

## Coverage Notes
- Reviewed changed API-contract surfaces in CLI/schema/validation flow: schemas/latest-run.schema.json, schemas/runtime-evidence-packet.schema.json, schemas/runtime-state.schema.json, schemas/validation-result.schema.json, src/commands/validation.js, src/commands/state.js, src/lib/latest-run.js, src/lib/runtime-state.js, src/lib/contract-catalog.js, and src/cli.js.
- Focused on backward compatibility and consumer-visible type/shape changes rather than implementation style.

## Residual Risk
- No explicit deprecation or migration artifacts were found in this diff for downstream consumers that pin current schema versions.
- If external repos are already ingesting --repo-root outputs, compatibility risk is immediate because new fields are now emitted in state/check packets.
WROTE: artifacts/reviews/api-contract-reviewer.md
