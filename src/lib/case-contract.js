import { existsSync, readFileSync } from "node:fs";

import { emitFailure } from "./failures.js";
import { insideRepo } from "./paths.js";
import { schemaCheck, schemaTargets, validateDocument } from "./schema.js";

/**
 * Validate a parsed case object against the repository's case contract and confirm the referenced file exists.
 *
 * Performs policy checks for required top-level and nested fields, specific field constraints (for example `schema_version === 1`, kebab-case `case_id`, synthetic fixture requirements, and `privacy` flags), verifies `expected` and `scorers` shapes, and checks that the provided `casePath` points to an existing file.
 *
 * @param {string} casePath - Filesystem path to the case JSON file; used to verify the file exists.
 * @param {object} testCase - Parsed case JSON object to validate.
 * @returns {string[]} An array of error messages describing contract or existence violations; empty if the case is valid.
 */
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
  if (Array.isArray(testCase.scorers) && testCase.scorers.includes("baseline-presence")) {
    if (testCase.baseline === null || typeof testCase.baseline !== "object" || Array.isArray(testCase.baseline)) {
      errors.push("baseline is required when baseline-presence scorer is enabled");
    } else {
      for (const key of ["expected_presence", "artifact_path"]) {
        if (!(key in testCase.baseline)) errors.push("baseline." + key + " is required when baseline-presence scorer is enabled");
      }
    }
  }
  if (testCase.fixture_source?.type === "synthetic" && testCase.input?.command !== "simulate-pr-closeout") {
    errors.push("synthetic fixtures must use input.command simulate-pr-closeout");
  }
  if (!existsSync(casePath)) errors.push("case file does not exist: " + casePath);
  return errors;
}

/**
 * Validate a parsed case against the JSON schema and the local phase-one policy contract.
 * @param {string} casePath - Absolute or repository-relative path to the case file.
 * @param {object} testCase - Parsed case object.
 * @returns {string[]} An array of validation error messages; empty when the case passes both schema and policy checks.
 */
export function validateCaseContract(casePath, testCase) {
  return validateDocument(schemaTargets.case.schema, casePath).concat(validateCase(casePath, testCase));
}

/**
 * Validate a case file using the same schema and policy contract enforced by the run command.
 * @param {string} casePath - Absolute or repository-relative path to the case file.
 * @returns {{label: string, schema_path: string, data_path: string, status: "pass" | "fail", errors: string[]}} Validation check.
 */
export function validateCaseFileContract(casePath) {
  const absoluteCasePath = insideRepo(casePath);
  const check = schemaCheck("case", absoluteCasePath);
  let testCase;
  try {
    testCase = JSON.parse(readFileSync(absoluteCasePath, "utf8"));
  } catch {
    return check;
  }
  const policyErrors = validateCase(absoluteCasePath, testCase);
  const errors = check.errors.concat(policyErrors);
  return {
    ...check,
    status: errors.length === 0 ? "pass" : "fail",
    errors
  };
}

/**
 * Resolve a repository-relative case path, read and parse the case JSON, and validate it against the schema and local contract.
 *
 * Emits failure reports via emitFailure for path resolution, file existence, read, parse or validation errors. On success, returns the absolute path, raw file contents and parsed case object.
 * @param {string} casePath - Repository-relative path to the case JSON file.
 * @param {*} jsonMode - Mode passed to emitFailure that controls how failures are reported.
 * @returns {{ absoluteCasePath: string, rawCase: string, testCase: Object }} An object containing the resolved absolute path, the raw file contents, and the parsed case JSON.
 */
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
  const errors = validateCaseContract(absoluteCasePath, testCase);
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
