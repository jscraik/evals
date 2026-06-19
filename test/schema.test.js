import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateCasePromotions } from "../src/lib/case-promotion.js";
import { validateEvalImprovements } from "../src/lib/eval-improvement.js";
import { validateProofContractObject } from "../src/lib/proof-contract-validation.js";
import { schemaCheckFromObject, schemaTargets, supportedSchemaKeywords, validateWithSchema } from "../src/lib/schema.js";

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)));

test("schema validator exposes the supported local keyword contract", () => {
  for (const keyword of ["$schema", "$id", "type", "properties", "required", "additionalProperties", "format", "minimum"]) {
    assert.equal(supportedSchemaKeywords.has(keyword), true, keyword + " should be declared as supported");
  }
});

test("schema validator rejects unsupported keywords before validating data", () => {
  const errors = validateWithSchema(5, {
    type: "number",
    maximum: 10
  });

  assert.match(errors.join("\n"), /\$schema\.maximum: unsupported JSON Schema keyword/);
});

test("schema validator rejects unsupported nested keywords", () => {
  const errors = validateWithSchema(
    { count: 3 },
    {
      type: "object",
      properties: {
        count: {
          type: "integer",
          maximum: 5
        }
      }
    }
  );

  assert.match(errors.join("\n"), /\$schema\.properties\.count\.maximum: unsupported JSON Schema keyword/);
});

test("schema validator enforces numeric minimum bounds", () => {
  assert.match(validateWithSchema(-1, { type: "integer", minimum: 0 }).join("\n"), /must be >= 0/);
  assert.deepEqual(validateWithSchema(0, { type: "integer", minimum: 0 }), []);
  assert.deepEqual(validateWithSchema(null, { type: ["integer", "null"], minimum: 0 }), []);
});

test("schema validator rejects unsupported formats", () => {
  const errors = validateWithSchema("jamie@example.com", {
    type: "string",
    format: "email"
  });

  assert.match(errors.join("\n"), /\$schema\.format: unsupported format "email"/);
});

test("schema validator rejects unsupported type tokens", () => {
  const errors = validateWithSchema("2026-05-20", {
    type: "date"
  });

  assert.match(errors.join("\n"), /\$schema\.type: unsupported type "date"/);
});

test("schema validator rejects unsupported type tokens inside unions", () => {
  const errors = validateWithSchema(null, {
    type: ["null", "date"]
  });

  assert.match(errors.join("\n"), /\$schema\.type: unsupported type "date"/);
});

test("schema validator rejects malformed schema objects", () => {
  assert.match(validateWithSchema("anything", null).join("\n"), /\$schema: schema must be a JSON object/);
  assert.match(
    validateWithSchema(
      { name: "Jamie" },
      {
        type: "object",
        properties: {
          name: "string"
        }
      }
    ).join("\n"),
    /\$schema\.properties\.name: property schema must be a JSON object/
  );
  assert.match(validateWithSchema(["one"], { type: "array", items: "string" }).join("\n"), /\$schema\.items: items schema must be a JSON object/);
});

test("object constraints apply when object is one member of a type union", () => {
  const errors = validateWithSchema(
    { extra: true },
    {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["name"],
      properties: {
        name: { type: "string" }
      }
    }
  );

  assert.match(errors.join("\n"), /\$\.name: missing required property/);
  assert.match(errors.join("\n"), /\$\.extra: additional property is not allowed/);
  assert.deepEqual(validateWithSchema(null, { type: ["object", "null"], required: ["name"] }), []);
});

test("date-time validation requires an explicit timestamp", () => {
  assert.match(validateWithSchema("2026-05-20", { type: "string", format: "date-time" }).join("\n"), /must be a date-time string/);
  assert.deepEqual(validateWithSchema("2026-05-20T19:24:00Z", { type: "string", format: "date-time" }), []);
  assert.deepEqual(validateWithSchema("2026-05-20t19:24:00z", { type: "string", format: "date-time" }), []);
});

test("runtime-state embedded evidence packet schema mirrors the standalone packet schema", () => {
  const stateSchema = JSON.parse(readFileSync(join(sourceRoot, "schemas", "runtime-state.schema.json"), "utf8"));
  const packetSchema = JSON.parse(readFileSync(join(sourceRoot, "schemas", "runtime-evidence-packet.schema.json"), "utf8"));
  assert.deepEqual(stateSchema.properties.evidence_packet.required, packetSchema.required);
  assert.deepEqual(stateSchema.properties.evidence_packet.properties, packetSchema.properties);
});

test("validation-result schema validates representative validate and check JSON output", () => {
  const validationResultSchema = JSON.parse(readFileSync(join(sourceRoot, "schemas", "validation-result.schema.json"), "utf8"));

  const validateOutput = {
    status: "passed",
    checks: [
      {
        label: "eval case",
        schema_path: "schemas/eval-case.schema.json",
        data_path: "fixtures/smoke/pr-closeout.case.json",
        status: "pass",
        errors: []
      }
    ],
    errors: []
  };

  const checkOutput = {
    status: "passed",
    check_mode: "smoke-context",
    latest_path: ".harness/evals/runs/latest.json",
    run_id: "20260526T000000Z-pr-closeout-abc12345",
    expected_context: {
      case_id: "pr-closeout",
      suite_id: "smoke",
      execution_mode: "synthetic"
    },
    observed_latest_context: {
      case_id: "pr-closeout",
      suite_id: "smoke",
      execution_mode: "synthetic"
    },
    context_match: true,
    context_mismatch_reason: null,
    recovery_command: null,
    strict_smoke_command: null,
    runtime_evidence: {
      policy_coverage: {
        status: "pass",
        families: [
          {
            case_id: "subagent-artifact-contract",
            family: "subagent_artifacts",
            declaration_path: "declared_contract.artifact_contract",
            enforcement_status: "implemented_enforced",
            scorer_id: "subagent-artifact-contract"
          }
        ],
        errors: []
      }
    },
    checks: [
      {
        label: "latest run",
        schema_path: "schemas/latest-run.schema.json",
        data_path: ".harness/evals/runs/latest.json",
        status: "pass",
        errors: []
      },
      {
        label: "runtime evidence policy coverage",
        status: "pass",
        errors: [],
        policy_coverage: {
          status: "pass",
          families: [
            {
              case_id: "subagent-artifact-contract",
              family: "subagent_artifacts",
              declaration_path: "declared_contract.artifact_contract",
              enforcement_status: "implemented_enforced",
              scorer_id: "subagent-artifact-contract"
            }
          ],
          errors: []
        }
      }
    ],
    errors: []
  };

  assert.equal(schemaTargets.validationResult.label, "validation result");
  assert.deepEqual(validateWithSchema(validateOutput, validationResultSchema), []);
  assert.deepEqual(validateWithSchema(checkOutput, validationResultSchema), []);
  assert.deepEqual(schemaCheckFromObject("validationResult", checkOutput, "pnpm evals check --smoke --json").errors, []);
});

test("validation-result schema enforces the public output envelope", () => {
  const validationResultSchema = JSON.parse(readFileSync(join(sourceRoot, "schemas", "validation-result.schema.json"), "utf8"));
  const validOutput = {
    status: "passed",
    checks: [{ label: "eval case", status: "pass", errors: [] }],
    errors: []
  };

  assert.match(validateWithSchema({ ...validOutput, status: "ok" }, validationResultSchema).join("\n"), /expected one of passed, failed/);
  assert.match(validateWithSchema({ status: "passed", errors: [] }, validationResultSchema).join("\n"), /\$\.checks: missing required property/);
  assert.deepEqual(validateWithSchema({ ...validOutput, future_additive_field: "kept-compatible" }, validationResultSchema), []);
  assert.match(
    validateWithSchema({ ...validOutput, checks: [{ label: "eval case", status: "maybe", errors: [] }] }, validationResultSchema).join("\n"),
    /expected one of pass, fail/
  );
  assert.match(
    validateWithSchema({ ...validOutput, runtime_evidence: { policy_coverage: { families: [], errors: [] } } }, validationResultSchema).join("\n"),
    /\.runtime_evidence\.policy_coverage\.status: missing required property/
  );
  assert.match(
    validateWithSchema({ ...validOutput, checks: [{ label: "runtime evidence policy coverage", status: "pass", errors: [], policy_coverage: { status: "pass", errors: [] } }] }, validationResultSchema).join("\n"),
    /\.checks\[0\]\.policy_coverage\.families: missing required property/
  );
  assert.match(
    validateWithSchema(
      {
        ...validOutput,
        runtime_evidence: {
          policy_coverage: {
            status: "pass",
            families: [{ case_id: "case-1", declaration_path: "declared_contract.permission_profile", enforcement_status: "implemented_enforced" }],
            errors: []
          }
        }
      },
      validationResultSchema
    ).join("\n"),
    /\.runtime_evidence\.policy_coverage\.families\[0\]\.family: missing required property/
  );
});

test("eval case metadata classifies scenario buckets without making old cases invalid", () => {
  const caseSchema = JSON.parse(readFileSync(join(sourceRoot, "schemas", "eval-case.schema.json"), "utf8"));
  const baseCase = JSON.parse(readFileSync(join(sourceRoot, "fixtures", "smoke", "pr-closeout.case.json"), "utf8"));

  assert.deepEqual(validateWithSchema(baseCase, caseSchema), []);
  assert.equal(baseCase.scenario_contract.primary_actor, "future implementation agent");
  assert.equal(baseCase.scenario_contract.acceptance_paths[0].scorers.includes("required-output"), true);
  assert.deepEqual(
    validateWithSchema(
      (() => {
        const { scenario_contract: _scenarioContract, ...caseWithoutScenarioContract } = baseCase;
        return {
          ...caseWithoutScenarioContract,
          metadata: {
            scenario_bucket: "adversarial",
            claim_ids: ["claim:missing-evidence"]
          }
        };
      })(),
      caseSchema
    ),
    []
  );
  assert.match(
    validateWithSchema(
      {
        ...baseCase,
        metadata: {
          scenario_bucket: "marketing"
        }
      },
      caseSchema
    ).join("\n"),
    /expected one of/
  );
  assert.match(
    validateWithSchema(
      {
        ...baseCase,
        scenario_contract: {
          ...baseCase.scenario_contract,
          primary_actor: ""
        }
      },
      caseSchema
    ).join("\n"),
    /\.scenario_contract\.primary_actor: must have length >= 1/
  );
  assert.match(
    validateWithSchema(
      {
        ...baseCase,
        scenario_contract: {
          ...baseCase.scenario_contract,
          acceptance_paths: [
            {
              ...baseCase.scenario_contract.acceptance_paths[0],
              scorers: ["llm-judge"]
            }
          ]
        }
      },
      caseSchema
    ).join("\n"),
    /expected one of exit-code/
  );
});

test("case promotion records keep real-case adoption manual and deterministic", () => {
  const promotionSchema = JSON.parse(readFileSync(join(sourceRoot, "schemas", "case-promotion.schema.json"), "utf8"));
  const promotionDir = join(sourceRoot, ".harness", "case-promotions");
  const promotions = readdirSync(promotionDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(readFileSync(join(promotionDir, file), "utf8")));

  assert.equal(schemaTargets.casePromotion.label, "case promotion");
  assert.ok(promotions.length > 0);
  for (const promotion of promotions) {
    assert.deepEqual(validateWithSchema(promotion, promotionSchema), []);
    assert.equal(promotion.safety_boundary.imports_sibling_runtime_dependency, false);
    assert.equal(promotion.safety_boundary.requires_source_mining, false);
    assert.equal(promotion.safety_boundary.requires_black_box_execution, false);
    assert.equal(promotion.safety_boundary.requires_llm_judge_gate, false);
    assert.deepEqual(promotion.safety_boundary.external_authority_claims, ["none"]);
    assert.ok(promotion.quality_evidence.labeled_examples.positive_count >= 1);
    assert.ok(promotion.quality_evidence.labeled_examples.negative_count >= 1);
    assert.ok(promotion.quality_evidence.coverage_dimensions.includes("legitimate-positive"));
    assert.ok(promotion.quality_evidence.coverage_dimensions.includes("adversarial-negative"));
    assert.equal(promotion.quality_evidence.metric_policy.judge_gate_status, "not_used");
    assert.equal(promotion.quality_evidence.synthetic_data_policy.privacy_status, "synthetic_only");
    assert.ok(promotion.quality_evidence.improvement_loop.trace_evidence_refs.length >= 1);
    assert.ok(promotion.quality_evidence.improvement_loop.evidence_origins.includes("user-agents-traces"));
    assert.ok(promotion.quality_evidence.improvement_loop.evidence_origins.includes("user-agents-sessions"));
    assert.equal(promotion.quality_evidence.improvement_loop.handoff_status, "recorded");
    assert.equal(promotion.deterministic_case.evaluator_authority_status, "deterministic");
    assert.doesNotThrow(() => readFileSync(join(sourceRoot, promotion.source_failure.source_artifact_ref), "utf8"));
    assert.doesNotThrow(() => readFileSync(join(sourceRoot, promotion.deterministic_case.target_fixture_path), "utf8"));
    for (const sourceRef of promotion.quality_evidence.labeled_examples.source_refs) {
      assert.doesNotThrow(() => readFileSync(join(sourceRoot, sourceRef), "utf8"));
    }
    for (const traceRef of promotion.quality_evidence.improvement_loop.trace_evidence_refs) {
      assert.doesNotThrow(() => readFileSync(join(sourceRoot, traceRef), "utf8"));
    }
  }

  const [promotion] = promotions;
  assert.match(
    validateWithSchema(
      {
        ...promotion,
        source_failure: {
          ...promotion.source_failure,
          contains_private_content: true
        }
      },
      promotionSchema
    ).join("\n"),
    /contains_private_content: expected const false/
  );
  assert.match(
    validateWithSchema(
      {
        ...promotion,
        safety_boundary: {
          ...promotion.safety_boundary,
          requires_black_box_execution: true
        }
      },
      promotionSchema
    ).join("\n"),
    /requires_black_box_execution: expected const false/
  );
  assert.match(
    validateWithSchema(
      {
        ...promotion,
        safety_boundary: {
          ...promotion.safety_boundary,
          external_authority_claims: ["ci-passed"]
        }
      },
      promotionSchema
    ).join("\n"),
    /expected one of none/
  );
  assert.match(
    validateWithSchema(
      {
        ...promotion,
        quality_evidence: {
          ...promotion.quality_evidence,
          labeled_examples: {
            ...promotion.quality_evidence.labeled_examples,
            negative_count: 0
          }
        }
      },
      promotionSchema
    ).join("\n"),
    /negative_count: must be >= 1/
  );
  assert.match(
    validateWithSchema(
      {
        ...promotion,
        quality_evidence: {
          ...promotion.quality_evidence,
          coverage_dimensions: ["boundary-claim"]
        }
      },
      promotionSchema
    ).join("\n"),
    /coverage_dimensions: must contain at least 2 items/
  );
  assert.match(
    validateWithSchema(
      {
        ...promotion,
        quality_evidence: {
          ...promotion.quality_evidence,
          metric_policy: {
            ...promotion.quality_evidence.metric_policy,
            judge_gate_status: "release_gate"
          }
        }
      },
      promotionSchema
    ).join("\n"),
    /expected one of not_used, advisory_until_calibrated/
  );
  assert.match(
    validateWithSchema(
      {
        ...promotion,
        quality_evidence: {
          ...promotion.quality_evidence,
          improvement_loop: {
            ...promotion.quality_evidence.improvement_loop,
            trace_evidence_refs: []
          }
        }
      },
      promotionSchema
    ).join("\n"),
    /trace_evidence_refs: must contain at least 1 items/
  );
  assert.match(
    validateWithSchema(
      {
        ...promotion,
        deterministic_case: {
          ...promotion.deterministic_case,
          evaluator_authority_status: "llm_calibrated"
        }
      },
      promotionSchema
    ).join("\n"),
    /expected const "deterministic"/
  );
});

test("case promotion validation links candidates to deterministic shared-contract failures", () => {
  const promotionDir = join(sourceRoot, ".harness", "case-promotions");
  const expectedPromotionCount = readdirSync(promotionDir).filter((file) => file.endsWith(".json")).length;
  const validation = validateCasePromotions(sourceRoot);

  assert.equal(validation.status, "passed");
  assert.equal(validation.promotions_checked, expectedPromotionCount);
  assert.equal(validation.checks[0].checks[0].label, "case promotion");
  assert.equal(validation.checks[0].checks[1].label, "case promotion semantics");
});

test("eval improvement packets bridge traces and feedback without runtime authority", () => {
  const improvementSchema = JSON.parse(readFileSync(join(sourceRoot, "schemas", "eval-improvement-packet.schema.json"), "utf8"));
  const improvementDir = join(sourceRoot, ".harness", "eval-improvements");
  const improvements = readdirSync(improvementDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(readFileSync(join(improvementDir, file), "utf8")));

  assert.equal(schemaTargets.evalImprovement.label, "eval improvement packet");
  assert.ok(improvements.length > 0);
  for (const improvement of improvements) {
    assert.deepEqual(validateWithSchema(improvement, improvementSchema), []);
    assert.equal(improvement.authority_boundary.imports_external_runtime_dependency, false);
    assert.equal(improvement.authority_boundary.reads_user_agents_runtime_store, false);
    assert.equal(improvement.authority_boundary.requires_llm_judge_gate, false);
    assert.equal(improvement.source_evidence.origin_path_policy, "external_origin_named_only");
    assert.equal(improvement.candidate_eval.evaluator_authority_status, "deterministic");
    assert.notEqual(improvement.candidate_eval.oracle_type, "llm_advisory");
    for (const evidenceRef of improvement.source_evidence.repo_evidence_refs) {
      assert.doesNotThrow(() => readFileSync(join(sourceRoot, evidenceRef), "utf8"));
    }
    for (const feedbackRef of improvement.feedback.feedback_refs) {
      assert.doesNotThrow(() => readFileSync(join(sourceRoot, feedbackRef), "utf8"));
    }
  }

  const [improvement] = improvements;
  assert.match(
    validateWithSchema(
      {
        ...improvement,
        authority_boundary: {
          ...improvement.authority_boundary,
          reads_user_agents_runtime_store: true
        }
      },
      improvementSchema
    ).join("\n"),
    /reads_user_agents_runtime_store: expected const false/
  );
  assert.match(
    validateWithSchema(
      {
        ...improvement,
        source_evidence: {
          ...improvement.source_evidence,
          repo_evidence_refs: []
        }
      },
      improvementSchema
    ).join("\n"),
    /repo_evidence_refs: must contain at least 1 items/
  );
  assert.match(
    validateWithSchema(
      {
        ...improvement,
        candidate_eval: {
          ...improvement.candidate_eval,
          evaluator_authority_status: "llm_calibrated"
        }
      },
      improvementSchema
    ).join("\n"),
    /expected one of deterministic, human_labeled, llm_advisory, blocked/
  );
});

test("eval improvement validation links promoted packets to deterministic case promotions", () => {
  const improvementDir = join(sourceRoot, ".harness", "eval-improvements");
  const expectedImprovementCount = readdirSync(improvementDir).filter((file) => file.endsWith(".json")).length;
  const validation = validateEvalImprovements(sourceRoot);

  assert.equal(validation.status, "passed");
  assert.equal(validation.improvements_checked, expectedImprovementCount);
  assert.equal(validation.checks[0].checks[0].label, "eval improvement packet");
  assert.equal(validation.checks[0].checks[1].label, "eval improvement semantics");
});

test("eval improvement validation rejects promoted packets linked to non-promotion files", () => {
  const root = mkdtempSync(join(tmpdir(), "eval-improvement-invalid-promotion-"));
  try {
    mkdirSync(join(root, ".harness", "eval-improvements"), { recursive: true });
    mkdirSync(join(root, ".harness", "reframes"), { recursive: true });
    mkdirSync(join(root, "fixtures", "contracts", "bad"), { recursive: true });
    mkdirSync(join(root, "fixtures", "contracts", "good"), { recursive: true });

    writeFileSync(join(root, "README.md"), "# Not a case promotion\n");
    writeFileSync(join(root, ".harness", "reframes", "source.md"), "# Source\n");
    writeFileSync(join(root, "fixtures", "contracts", "bad", "local-pass-pr-done.md"), "# Bad\n");
    writeFileSync(join(root, "fixtures", "contracts", "good", "local-pass-ci-unknown.md"), "# Good\n");
    writeFileSync(
      join(root, ".harness", "eval-improvements", "bad-link.json"),
      JSON.stringify(
        {
          schema_version: 1,
          improvement_id: "eval-improvement:test:bad-link",
          source_evidence: {
            origin: "mixed",
            origin_path_policy: "external_origin_named_only",
            repo_evidence_refs: [".harness/reframes/source.md"],
            contains_private_content: false,
            contains_credentials: false,
            redaction_status: "synthetic_no_redaction_needed"
          },
          feedback: {
            reviewer_role: "human",
            feedback_type: "wrong-authority-claim",
            expected_behavior: "Keep local validation separate from merge readiness.",
            failure_mode: "Local validation was treated as merge readiness.",
            feedback_refs: [
              ".harness/reframes/source.md",
              "fixtures/contracts/bad/local-pass-pr-done.md",
              "fixtures/contracts/good/local-pass-ci-unknown.md"
            ]
          },
          candidate_eval: {
            candidate_type: "case-promotion",
            assertion_shape: "trace-feedback-handoff",
            oracle_type: "policy",
            evaluator_authority_status: "deterministic",
            coverage_dimensions: ["boundary-claim"]
          },
          promotion_decision: {
            status: "promoted",
            case_promotion_ref: "README.md",
            target_fixture_path: "fixtures/contracts/bad/local-pass-pr-done.md",
            decision_reason: "This intentionally links to a non-promotion file."
          },
          authority_boundary: {
            imports_external_runtime_dependency: false,
            reads_user_agents_runtime_store: false,
            requires_llm_judge_gate: false,
            proves: ["schema accepts the packet shape"],
            does_not_prove: ["README is a case promotion"]
          },
          validation: {
            status: "validated",
            commands: ["node scripts/validate-eval-improvements.js"]
          }
        },
        null,
        2
      )
    );

    const validation = validateEvalImprovements(root);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /linked case promotion is unreadable/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("claim registry schema represents unevaluable claims explicitly", () => {
  const registrySchema = JSON.parse(readFileSync(join(sourceRoot, "schemas", "claim-registry.schema.json"), "utf8"));
  const registry = {
    schema_version: 1,
    registry_id: "agent-skills:release-readiness",
    source_package: {
      type: "skill_package",
      path: "skills/example/SKILL.md",
      version: "0.1.0",
      commit: null
    },
    claims: [
      {
        claim_id: "claim:portable-routing",
        source: {
          artifact_path: "skills/example/SKILL.md",
          span: {
            start_line: 12,
            end_line: 18
          }
        },
        claim_type: "capability",
        scenario_family: "boundary",
        claim_text: "The skill routes tasks consistently across supported agents.",
        expected_inputs: ["Task prompt naming the skill"],
        expected_outputs: ["Bounded routing decision"],
        required_tools: [],
        limitations: ["Portability must be proven per host runtime"],
        evidence_required: ["paired baseline run"],
        grader_type: "not_evaluable",
        criticality: "high",
        status: "not_evaluable"
      }
    ]
  };

  assert.deepEqual(validateWithSchema(registry, registrySchema), []);
  assert.match(validateWithSchema({ ...registry, claims: [] }, registrySchema).join("\n"), /must contain at least 1 item/);
  assert.deepEqual(validateProofContractObject("claim-registry", registry, join(sourceRoot, "fixtures", "claim-registry.json")).errors, []);
  assert.match(
    validateProofContractObject(
      "claim-registry",
      {
        ...registry,
        claims: [
          registry.claims[0],
          {
            ...registry.claims[0],
            source: {
              artifact_path: "skills/example/SKILL.md",
              span: {
                start_line: 30,
                end_line: 28
              }
            }
          }
        ]
      },
      join(sourceRoot, "fixtures", "claim-registry.json")
    ).errors.join("\n"),
    /duplicate claim_id.*end_line: must be >=/s
  );
});

test("score vector schema carries gated readiness instead of a single scalar", () => {
  const scoreVectorSchema = JSON.parse(readFileSync(join(sourceRoot, "schemas", "score-vector.schema.json"), "utf8"));
  const scoreVector = {
    schema_version: 1,
    score_vector_id: "score:agent-skills-readiness",
    suite_id: "agent-skills:skill-output",
    coverage: {
      tested_claims: 3,
      total_claims: 5,
      coverage_status: "partial"
    },
    dimensions: [
      {
        dimension_id: "instruction-adherence",
        score: 0.8,
        weight: 0.4,
        gate: true,
        evidence_refs: ["artifacts/scorer-results.json"]
      }
    ],
    gates: [
      {
        gate_id: "missing-critical-evidence",
        status: "fail",
        severity: "critical",
        evidence_refs: ["artifacts/claim-registry.json"]
      }
    ],
    readiness: {
      status: "not_ready",
      raw_score: 0.82,
      capped_by_gate: true,
      cap_reason: "critical evidence gate failed",
      blocking_gates: ["missing-critical-evidence"]
    }
  };

  assert.deepEqual(validateWithSchema(scoreVector, scoreVectorSchema), []);
  assert.match(validateWithSchema({ ...scoreVector, readiness: { ...scoreVector.readiness, cap_reason: "" } }, scoreVectorSchema).join("\n"), /must have length >= 1/);
  assert.deepEqual(validateProofContractObject("score-vector", scoreVector, join(sourceRoot, "fixtures", "score-vector.json")).errors, []);
  assert.match(
    validateProofContractObject(
      "score-vector",
      {
        ...scoreVector,
        coverage: {
          tested_claims: 6,
          total_claims: 5,
          coverage_status: "complete"
        },
        readiness: {
          status: "excellent",
          raw_score: 0.99,
          capped_by_gate: false,
          cap_reason: null,
          blocking_gates: []
        }
      },
      join(sourceRoot, "fixtures", "score-vector.json")
    ).errors.join("\n"),
    /tested_claims: must be <=.*capped_by_gate: must be true.*status: must not be excellent.*blocking_gates: missing critical/s
  );
});

test("result and manifest schemas allow optional proof-spine artifact references", () => {
  const resultSchema = JSON.parse(readFileSync(join(sourceRoot, "schemas", "eval-result.schema.json"), "utf8"));
  const manifestSchema = JSON.parse(readFileSync(join(sourceRoot, "schemas", "artifact-manifest.schema.json"), "utf8"));
  const sha256 = "a".repeat(64);
  const runId = "20260525T000000Z-case-abc12345-01";

  const result = {
    schema_version: 1,
    run_id: runId,
    case_id: "example.case",
    suite_id: "example.suite",
    execution_mode: "synthetic",
    status: "passed",
    deterministic_verdict: "pass",
    scorer_results_path: ".harness/evals/runs/" + runId + "/scorer-results.json",
    baseline_result_path: ".harness/evals/runs/" + runId + "/baseline-result.json",
    trace_events_path: ".harness/evals/runs/" + runId + "/trace-events.jsonl",
    artifact_refs: [
      {
        type: "claim-registry",
        path: ".harness/evals/runs/" + runId + "/claim-registry.json",
        sha256
      },
      {
        type: "score-vector",
        path: ".harness/evals/runs/" + runId + "/score-vector.json",
        sha256
      },
      {
        type: "benchmark-summary",
        path: ".harness/evals/runs/" + runId + "/benchmark-summary.json",
        sha256
      }
    ],
    errors: []
  };

  const manifest = {
    schema_version: 1,
    run_id: result.run_id,
    case_id: result.case_id,
    created_at: "2026-05-25T00:00:00Z",
    retention: {
      status: "retained_local",
      policy: "optional proof artifacts retained with the run bundle"
    },
    privacy: {
      class: "synthetic",
      redaction_status: "not_required",
      contains_private_content: false,
      contains_credentials: false
    },
    artifacts: result.artifact_refs.map((artifact) => ({ ...artifact, required: false }))
  };

  assert.deepEqual(validateWithSchema(result, resultSchema), []);
  assert.deepEqual(validateWithSchema(manifest, manifestSchema), []);
});
