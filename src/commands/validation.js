import { join } from "node:path";

import { emitFailure } from "../lib/failures.js";
import { validateCaseFile, validateLatestRun } from "../lib/latest-run.js";
import { insideRepo, rel, repoRoot } from "../lib/paths.js";

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
