{
  "reviewer": "api-contract",
  "findings": [
    {
      "severity": "medium",
      "title": "JSON validation/check output has no published schema contract",
      "evidence": [
        "src/commands/validation.js:29",
        "src/commands/validation.js:102",
        "src/lib/schema.js:6"
      ],
      "impact": "The CLI emits machine-consumable JSON for 'validate' and 'check', but no schema target exists for those payloads. Consumers cannot validate shape stability, so additive/removal changes can silently break downstream parsers.",
      "runtime_status": "implemented_not_enforced",
      "remediation": "Add a dedicated schema for validation payloads (for example, schemas/validation-result.schema.json), register it in schemaTargets, and add fixture-backed tests that validate current validate/check JSON output against that schema.",
      "validation_method": "Run 'pnpm evals validate fixtures/smoke/pr-closeout.case.json --json' and 'pnpm evals check --json', then schema-check both outputs in tests against the new validation-result schema.",
      "confidence": 75
    },
    {
      "severity": "medium",
      "title": "validate command route selection narrows the documented latest.json contract",
      "evidence": [
        "src/cli.js:16",
        "src/commands/validation.js:44",
        "src/commands/validation.js:62"
      ],
      "impact": "CLI usage documents '<case-file|latest.json>', but implementation only treats one exact canonical path suffix as latest-run validation. A copied or relocated latest pointer JSON is routed through case validation semantics instead, changing behavior for clients expecting latest-run checks.",
      "runtime_status": "partial",
      "remediation": "Decouple route selection from path suffix. Detect latest-run documents by schema/keyed shape (or add explicit '--type latest') before choosing validateLatestRun vs validateCaseFile.",
      "validation_method": "Add tests that pass both canonical latest path and a relocated latest-like JSON file; assert both take the intended latest-run validation path.",
      "confidence": 75
    }
  ],
  "residual_risks": [
    "runtime-state schema is explicitly versioned (const 2), but no explicit compatibility policy is published for future additive vs breaking changes in nested evidence_packet fields."
  ],
  "testing_gaps": [
    "No contract test currently asserts that validate/check JSON responses conform to a published schema.",
    "No test currently verifies validate command behavior for non-canonical but latest-shaped JSON inputs."
  ]
}
WROTE: artifacts/reviews/2026-05-25-evidence-gap-api-contract-reviewer.md
