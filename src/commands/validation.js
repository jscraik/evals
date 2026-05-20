import { join } from "node:path";

import { emitFailure } from "../lib/failures.js";
import { validateCaseFile, validateLatestRun } from "../lib/latest-run.js";
import { insideRepo, rel, repoRoot } from "../lib/paths.js";

/**
 * Print a validation result as either pretty JSON or a human-readable summary.
 *
 * When not in JSON mode, the summary prints:
 * - `status: <status>`
 * - `run_id: <run_id>` when present
 * - one line per check in the form `<check.status>: <check.label> -> <check.data_path>` (if `validation.checks` is absent the `validation` object is treated as a single check)
 * - one line per error in the form `error: <error>`
 *
 * @param {Object} validation - Validation object containing overall and per-check information.
 * @param {string} validation.status - Overall validation status.
 * @param {string} [validation.run_id] - Optional run identifier.
 * @param {Array<Object>} [validation.checks] - Optional array of check objects.
 * @param {string} [validation.checks[].status] - Check status.
 * @param {string} [validation.checks[].label] - Check label.
 * @param {string} [validation.checks[].data_path] - Path related to the check.
 * @param {Array<string>} [validation.errors] - Optional list of error messages.
 * @param {boolean} jsonMode - If true, outputs the `validation` object as pretty-printed JSON.
 */
export function printValidation(validation, jsonMode) {
  if (jsonMode) {
    console.log(JSON.stringify(validation, null, 2));
    return;
  }
  console.log("status: " + validation.status);
  if (validation.run_id) console.log("run_id: " + validation.run_id);
  for (const check of validation.checks || [validation]) {
    console.log(check.status + ": " + check.label + " -> " + check.data_path);
  }
  for (const error of validation.errors || []) console.log("error: " + error);
}

/**
 * Validate a target path inside the repository and print a summary of the validation.
 *
 * Resolves `targetPath` to an absolute path within the repository; on resolution failure emits a structured failure and exits. If the resolved path points to the repository's latest run file it validates the latest run, otherwise it validates the specified case file. Prints the validation results either as pretty JSON (when `jsonMode` is true) or as a human-readable summary, then exits with code 0 when validation passes or 1 when it fails.
 *
 * @param {string} targetPath - Relative or absolute path to a case file or the latest run file to validate.
 * @param {boolean} jsonMode - When true, output validation results as pretty-printed JSON; otherwise output a human-readable summary.
 */
export function validateCommand(targetPath, jsonMode) {
  let absoluteTargetPath;
  try {
    absoluteTargetPath = insideRepo(targetPath);
  } catch (error) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "validation target path",
      errors: [error.message],
      recovery: "Pass a fixture or latest.json path under the repository, then rerun validation."
    });
  }
  let validation;
  if (absoluteTargetPath.endsWith(join(".harness", "evals", "runs", "latest.json"))) {
    validation = validateLatestRun(absoluteTargetPath);
  } else {
    const check = validateCaseFile(absoluteTargetPath);
    validation = {
      status: check.status === "pass" ? "passed" : "failed",
      checks: [check],
      errors: check.errors
    };
  }
  printValidation(validation, jsonMode);
  process.exit(validation.status === "passed" ? 0 : 1);
}

/**
 * Run a smoke case and the repository's latest run validations, print a combined validation result and exit with code 0 on success or 1 on failure.
 *
 * @param {boolean} jsonMode - If true, print the validation as pretty-printed JSON; otherwise print a human-readable summary.
 */
export function checkCommand(jsonMode) {
  const latestPath = join(repoRoot, ".harness", "evals", "runs", "latest.json");
  const caseCheck = validateCaseFile("fixtures/smoke/pr-closeout.case.json");
  const latestValidation = validateLatestRun(latestPath);
  const checks = [caseCheck].concat(latestValidation.checks);
  const errors = caseCheck.errors.concat(latestValidation.errors);
  const validation = {
    status: errors.length === 0 ? "passed" : "failed",
    latest_path: rel(latestPath),
    run_id: latestValidation.run_id,
    checks,
    errors
  };
  printValidation(validation, jsonMode);
  process.exit(validation.status === "passed" ? 0 : 1);
}
