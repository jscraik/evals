import { existsSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

import { validateContractCatalog } from "./contract-catalog.js";
import { readJson } from "./json.js";
import { insideRoot, rel, repoRoot } from "./paths.js";
import { schemaCheckFromObject } from "./schema.js";

const promotionRoot = ".harness/case-promotions";

function promotionDir(root) {
  return join(root, promotionRoot);
}

function listPromotionFiles(root) {
  const dir = promotionDir(root);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => join(dir, file))
    .sort();
}

function assertionResultsForTargetFixture(catalogResult, targetFixturePath) {
  return catalogResult.checks
    .flatMap((check) => check.assertion_results || [])
    .filter((result) => result.fixture_path === targetFixturePath);
}

function validatePromotionSemantics(promotion, promotionPath, root, catalogResult) {
  const errors = [];
  const sourceRef = promotion.source_failure?.source_artifact_ref;
  const targetFixturePath = promotion.deterministic_case?.target_fixture_path;
  const qualityEvidence = promotion.quality_evidence;

  for (const [label, value] of [["source_failure.source_artifact_ref", sourceRef], ["deterministic_case.target_fixture_path", targetFixturePath]]) {
    try {
      const resolved = insideRoot(root, value, "evals repository");
      if (!existsSync(resolved)) errors.push(label + ": path does not exist: " + value);
    } catch (error) {
      errors.push(label + ": " + error.message);
    }
  }

  for (const [index, sourceRef] of (qualityEvidence?.labeled_examples?.source_refs || []).entries()) {
    try {
      const resolved = insideRoot(root, sourceRef, "evals repository");
      if (!existsSync(resolved)) errors.push("quality_evidence.labeled_examples.source_refs[" + index + "]: path does not exist: " + sourceRef);
    } catch (error) {
      errors.push("quality_evidence.labeled_examples.source_refs[" + index + "]: " + error.message);
    }
  }

  for (const [index, traceRef] of (qualityEvidence?.improvement_loop?.trace_evidence_refs || []).entries()) {
    try {
      const resolved = insideRoot(root, traceRef, "evals repository");
      if (!existsSync(resolved)) errors.push("quality_evidence.improvement_loop.trace_evidence_refs[" + index + "]: path does not exist: " + traceRef);
    } catch (error) {
      errors.push("quality_evidence.improvement_loop.trace_evidence_refs[" + index + "]: " + error.message);
    }
  }

  const precisionTarget = qualityEvidence?.metric_policy?.precision_target;
  const recallTarget = qualityEvidence?.metric_policy?.recall_target;
  if (typeof precisionTarget === "number" && precisionTarget > 1) {
    errors.push("quality_evidence.metric_policy.precision_target: must be <= 1");
  }
  if (typeof recallTarget === "number" && recallTarget > 1) {
    errors.push("quality_evidence.metric_policy.recall_target: must be <= 1");
  }

  if (promotion.safety_boundary?.requires_llm_judge_gate === false && qualityEvidence?.metric_policy?.judge_gate_status !== "not_used") {
    errors.push("quality_evidence.metric_policy.judge_gate_status: deterministic case promotions cannot require an LLM judge gate");
  }

  if (promotion.validation?.status === "validated") {
    const results = assertionResultsForTargetFixture(catalogResult, targetFixturePath);
    const matchingFailure = results.find((result) => (
      result.status === "pass" &&
      result.expected_status === "fail" &&
      result.actual_status === "fail"
    ));
    if (!matchingFailure) {
      errors.push(
        "deterministic_case.target_fixture_path: validated promotions must point to a shared-contract bad fixture that fails deterministically: " +
        targetFixturePath
      );
    }
    if (!promotion.validation.commands.includes("node scripts/validate-case-promotions.js")) {
      errors.push("validation.commands: validated promotions must include node scripts/validate-case-promotions.js");
    }
    if ((qualityEvidence?.labeled_examples?.positive_count || 0) < 1 || (qualityEvidence?.labeled_examples?.negative_count || 0) < 1) {
      errors.push("quality_evidence.labeled_examples: validated promotions must include positive and negative labeled examples");
    }
  }

  return {
    label: "case promotion semantics",
    schema_path: "semantic case-promotion contract",
    data_path: rel(promotionPath),
    status: errors.length === 0 ? "pass" : "fail",
    errors
  };
}

function validatePromotionFile(promotionPath, root, catalogResult) {
  let promotion;
  try {
    promotion = readJson(promotionPath);
  } catch (error) {
    return {
      label: "case promotion",
      schema_path: "schemas/case-promotion.schema.json",
      data_path: rel(promotionPath),
      status: "fail",
      errors: [rel(promotionPath) + ": JSON parse failed: " + error.message]
    };
  }

  const schemaCheck = schemaCheckFromObject("casePromotion", promotion, promotionPath);
  const semanticCheck = schemaCheck.status === "pass"
    ? validatePromotionSemantics(promotion, promotionPath, root, catalogResult)
    : {
      label: "case promotion semantics",
      schema_path: "semantic case-promotion contract",
      data_path: rel(promotionPath),
      status: "fail",
      errors: []
    };
  const errors = schemaCheck.errors.concat(semanticCheck.errors);

  return {
    label: "case promotion " + basename(promotionPath),
    schema_path: "schemas/case-promotion.schema.json",
    data_path: rel(promotionPath),
    status: errors.length === 0 ? "pass" : "fail",
    checks: [schemaCheck, semanticCheck],
    errors
  };
}

export function validateCasePromotions(root = repoRoot) {
  const catalogResult = validateContractCatalog(root);
  const promotionFiles = listPromotionFiles(root);
  const checks = promotionFiles.map((promotionPath) => validatePromotionFile(promotionPath, root, catalogResult));
  const errors = [];
  if (promotionFiles.length === 0) errors.push(promotionRoot + ": no case-promotion JSON files found");
  errors.push(...checks.flatMap((check) => check.errors));

  return {
    status: errors.length === 0 ? "passed" : "failed",
    promotion_root: promotionRoot,
    promotions_checked: promotionFiles.length,
    checks,
    errors
  };
}
