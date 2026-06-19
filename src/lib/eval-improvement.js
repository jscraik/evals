import { existsSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

import { promotionRoot, validateCasePromotionFile } from "./case-promotion.js";
import { readJson } from "./json.js";
import { insideRoot, rel, repoRoot } from "./paths.js";
import { schemaCheckFromObject } from "./schema.js";

const improvementRoot = ".harness/eval-improvements";

function improvementDir(root) {
  return join(root, improvementRoot);
}

function listImprovementFiles(root) {
  const dir = improvementDir(root);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => join(dir, file))
    .sort();
}

function validateRepoRefs(errors, root, label, refs) {
  for (const [index, ref] of (refs || []).entries()) {
    try {
      const resolved = insideRoot(root, ref, "evals repository");
      if (!existsSync(resolved)) errors.push(label + "[" + index + "]: path does not exist: " + ref);
    } catch (error) {
      errors.push(label + "[" + index + "]: " + error.message);
    }
  }
}

function validateOptionalRepoRef(errors, root, label, ref) {
  if (ref === null || ref === undefined) return;
  validateRepoRefs(errors, root, label, [ref]);
}

function validateLinkedCasePromotion(errors, root, improvement) {
  const promotionRef = improvement.promotion_decision?.case_promotion_ref;
  if (!promotionRef) return;

  if (!isDirectCasePromotionRef(promotionRef)) {
    errors.push("promotion_decision.case_promotion_ref: linked case promotion must be a JSON file directly under " + promotionRoot);
  }

  let promotion;
  let promotionPath;
  try {
    promotionPath = insideRoot(root, promotionRef, "evals repository");
    promotion = readJson(promotionPath);
  } catch (error) {
    errors.push("promotion_decision.case_promotion_ref: linked case promotion is unreadable: " + error.message);
    return;
  }

  const promotionCheck = validateCasePromotionFile(promotionPath, root);
  if (promotionCheck.status !== "pass") {
    errors.push("promotion_decision.case_promotion_ref: linked case promotion failed validation: " + promotionCheck.errors.join("; "));
  }

  if (promotion.validation?.status !== "validated") {
    errors.push("promotion_decision.case_promotion_ref: linked case promotion must be validated");
  }
  if (promotion.deterministic_case?.evaluator_authority_status !== "deterministic") {
    errors.push("promotion_decision.case_promotion_ref: linked case promotion must use deterministic evaluator authority");
  }
  if (promotion.deterministic_case?.target_fixture_path !== improvement.promotion_decision?.target_fixture_path) {
    errors.push("promotion_decision.target_fixture_path: must match linked case promotion deterministic_case.target_fixture_path");
  }

  const evidenceRefs = new Set([
    ...(improvement.source_evidence?.repo_evidence_refs || []),
    ...(improvement.feedback?.feedback_refs || [])
  ]);
  if (!evidenceRefs.has(promotion.source_failure?.source_artifact_ref)) {
    errors.push("promotion_decision.case_promotion_ref: linked promotion source_failure.source_artifact_ref must be included in improvement evidence refs");
  }
}

function isDirectCasePromotionRef(ref) {
  if (typeof ref !== "string") return false;
  const normalized = ref.replace(/\\/g, "/");
  const prefix = promotionRoot + "/";
  if (!normalized.startsWith(prefix)) return false;
  const name = normalized.slice(prefix.length);
  return name.endsWith(".json") && !name.includes("/");
}

function validateImprovementSemantics(improvement, improvementPath, root) {
  const errors = [];

  validateRepoRefs(errors, root, "source_evidence.repo_evidence_refs", improvement.source_evidence?.repo_evidence_refs);
  validateRepoRefs(errors, root, "feedback.feedback_refs", improvement.feedback?.feedback_refs);
  validateOptionalRepoRef(errors, root, "promotion_decision.case_promotion_ref", improvement.promotion_decision?.case_promotion_ref);
  validateOptionalRepoRef(errors, root, "promotion_decision.target_fixture_path", improvement.promotion_decision?.target_fixture_path);

  const origin = improvement.source_evidence?.origin;
  const originPolicy = improvement.source_evidence?.origin_path_policy;
  if ((origin === "user-agents-traces" || origin === "user-agents-sessions" || origin === "mixed") && originPolicy !== "external_origin_named_only") {
    errors.push("source_evidence.origin_path_policy: ~/.agents evidence must be named as an external origin, not read as a repo path");
  }

  if (improvement.validation?.status === "validated" && !improvement.validation.commands.includes("node scripts/validate-eval-improvements.js")) {
    errors.push("validation.commands: validated improvements must include node scripts/validate-eval-improvements.js");
  }

  if (improvement.promotion_decision?.status === "promoted") {
    if (!improvement.promotion_decision.case_promotion_ref) {
      errors.push("promotion_decision.case_promotion_ref: promoted improvements must link to a case promotion");
    }
    if (!improvement.promotion_decision.target_fixture_path) {
      errors.push("promotion_decision.target_fixture_path: promoted improvements must link to the promoted fixture");
    }
    validateLinkedCasePromotion(errors, root, improvement);
    if (improvement.candidate_eval?.evaluator_authority_status !== "deterministic") {
      errors.push("candidate_eval.evaluator_authority_status: promoted improvements must use deterministic authority");
    }
    if (improvement.candidate_eval?.oracle_type === "llm_advisory") {
      errors.push("candidate_eval.oracle_type: promoted improvements cannot use an advisory LLM oracle");
    }
  }

  return {
    label: "eval improvement semantics",
    schema_path: "semantic eval-improvement contract",
    data_path: rel(improvementPath),
    status: errors.length === 0 ? "pass" : "fail",
    errors
  };
}

function validateImprovementFile(improvementPath, root) {
  let improvement;
  try {
    improvement = readJson(improvementPath);
  } catch (error) {
    return {
      label: "eval improvement packet",
      schema_path: "schemas/eval-improvement-packet.schema.json",
      data_path: rel(improvementPath),
      status: "fail",
      errors: [rel(improvementPath) + ": JSON parse failed: " + error.message]
    };
  }

  const schemaCheck = schemaCheckFromObject("evalImprovement", improvement, improvementPath);
  const semanticCheck = schemaCheck.status === "pass"
    ? validateImprovementSemantics(improvement, improvementPath, root)
    : {
      label: "eval improvement semantics",
      schema_path: "semantic eval-improvement contract",
      data_path: rel(improvementPath),
      status: "fail",
      errors: []
    };
  const errors = schemaCheck.errors.concat(semanticCheck.errors);

  return {
    label: "eval improvement " + basename(improvementPath),
    schema_path: "schemas/eval-improvement-packet.schema.json",
    data_path: rel(improvementPath),
    status: errors.length === 0 ? "pass" : "fail",
    checks: [schemaCheck, semanticCheck],
    errors
  };
}

export function validateEvalImprovements(root = repoRoot) {
  const improvementFiles = listImprovementFiles(root);
  const checks = improvementFiles.map((improvementPath) => validateImprovementFile(improvementPath, root));
  const errors = [];
  if (improvementFiles.length === 0) errors.push(improvementRoot + ": no eval-improvement JSON files found");
  errors.push(...checks.flatMap((check) => check.errors));

  return {
    status: errors.length === 0 ? "passed" : "failed",
    improvement_root: improvementRoot,
    improvements_checked: improvementFiles.length,
    checks,
    errors
  };
}
