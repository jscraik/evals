import { existsSync, readFileSync } from "node:fs";

import { emitFailure } from "./failures.js";
import { insideRepo } from "./paths.js";
import { schemaTargets, validateDocument } from "./schema.js";

export function validateCase(casePath, testCase) {
  const errors = [];
  if (testCase === null || typeof testCase !== "object" || Array.isArray(testCase)) {
    return ["case root must be a JSON object"];
  }
  const requiredTop = ["schema_version", "case_id", "suite_id", "owner", "fixture_source", "privacy", "promotion", "input", "expected", "scorers"];
  for (const key of requiredTop) {
    if (!(key in testCase)) errors.push("missing required field: " + key);
  }
  if (testCase.schema_version !== 1) errors.push("schema_version must be 1");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(testCase.case_id || "")) errors.push("case_id must be kebab-case");
  if (testCase.fixture_source?.type !== "synthetic") errors.push("phase-one smoke fixture must be synthetic");
  if (testCase.privacy?.contains_private_content !== false) errors.push("phase-one smoke fixture must not contain private content");
  if (testCase.privacy?.contains_credentials !== false) errors.push("phase-one smoke fixture must not contain credentials");
  for (const key of ["type", "name"]) {
    if (!(key in (testCase.owner || {}))) errors.push("owner." + key + " is required");
  }
  for (const key of ["type", "provenance", "redaction_status"]) {
    if (!(key in (testCase.fixture_source || {}))) errors.push("fixture_source." + key + " is required");
  }
  for (const key of ["class", "contains_private_content", "contains_credentials"]) {
    if (!(key in (testCase.privacy || {}))) errors.push("privacy." + key + " is required");
  }
  for (const key of ["status", "baseline_owner"]) {
    if (!(key in (testCase.promotion || {}))) errors.push("promotion." + key + " is required");
  }
  if (!Array.isArray(testCase.expected?.required_output_contains)) errors.push("expected.required_output_contains must be an array");
  if (!Array.isArray(testCase.expected?.required_artifacts)) errors.push("expected.required_artifacts must be an array");
  if (!Array.isArray(testCase.scorers) || testCase.scorers.length === 0) errors.push("scorers must name at least one deterministic scorer");
  const allowedScorers = new Set(["exit-code", "artifact-completeness", "required-output"]);
  for (const scorer of testCase.scorers || []) {
    if (!allowedScorers.has(scorer)) errors.push("unsupported scorer: " + scorer);
  }
  if (!existsSync(casePath)) errors.push("case file does not exist: " + casePath);
  return errors;
}

export function parseCase(casePath, jsonMode) {
  let absoluteCasePath;
  try {
    absoluteCasePath = insideRepo(casePath);
  } catch (error) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "case path",
      errors: [error.message],
      recovery: "Pass a fixture path under the repository, then rerun the same command."
    });
  }
  if (!existsSync(absoluteCasePath)) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "case path",
      errors: ["case file does not exist: " + casePath],
      recovery: "Fix the fixture path, then rerun the same command."
    });
  }
  let rawCase;
  try {
    rawCase = readFileSync(absoluteCasePath, "utf8");
  } catch (error) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "case read",
      errors: [error.message],
      recovery: "Make the fixture readable, then rerun the same command."
    });
  }
  let testCase;
  try {
    testCase = JSON.parse(rawCase);
  } catch (error) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "case parse",
      errors: [error.message],
      recovery: "Fix the fixture JSON syntax, then rerun the same command."
    });
  }
  const schemaErrors = validateDocument(schemaTargets.case.schema, absoluteCasePath);
  const validationErrors = validateCase(absoluteCasePath, testCase);
  const errors = schemaErrors.concat(validationErrors);
  if (errors.length > 0) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "case validation",
      errors,
      recovery: "Fix the fixture or local case contract, then rerun the same command."
    });
  }
  return { absoluteCasePath, rawCase, testCase };
}
