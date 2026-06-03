import { join } from "node:path";

import { validateContractCatalog } from "../lib/contract-catalog.js";
import { emitFailure } from "../lib/failures.js";
import { expectedProofContextFromCase, validateCaseFile, validateLatestRun } from "../lib/latest-run.js";
import { insideRepo, insideRoot, rel, relFrom, repoRoot } from "../lib/paths.js";
import { proofContractSchemaKeys, validateProofContractFile } from "../lib/proof-contract-validation.js";
import { proofBoundary } from "../lib/proof-boundary.js";
import { isDefaultRepoRoot, resolveRepoRootOption } from "../lib/repo-root-option.js";
import { validateRuntimeEvidenceSuite } from "../lib/runtime-evidence-contract.js";

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
  const output = validation.schema_version ? validation : { schema_version: 2, ...validation };
  if (jsonMode) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }
  console.log("status: " + output.status);
  if (output.run_id) console.log("run_id: " + output.run_id);
  for (const check of output.checks || [output]) {
    console.log(check.status + ": " + check.label + " -> " + check.data_path);
  }
  for (const error of output.errors || []) console.log("error: " + error);
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
  validation = {
    ...proofBoundary({ scope: "validation" }),
    ...validation
  };
  printValidation(validation, jsonMode);
  process.exit(validation.status === "passed" ? 0 : 1);
}

export function validateSchemaCommand(schemaKey, targetPath, jsonMode, options = {}) {
  let artifactRepoRoot;
  try {
    artifactRepoRoot = resolveRepoRootOption(options.artifactRepoRoot);
  } catch (error) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "repo root option",
      errors: [error.message],
      recovery: "Pass an existing directory to --repo-root, then rerun the command."
    });
  }

  let absoluteTargetPath;
  try {
    absoluteTargetPath = isDefaultRepoRoot(artifactRepoRoot)
      ? insideRepo(targetPath)
      : insideRoot(artifactRepoRoot, targetPath, "artifact repository");
  } catch (error) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "schema validation target path",
      errors: [error.message],
      recovery: "Pass a proof contract JSON file under the selected repository root, then rerun validation."
    });
  }

  const validation = {
    ...proofBoundary({ scope: "schema-validation", artifactRepoRoot }),
    ...validateProofContractFile(schemaKey, absoluteTargetPath)
  };
  if (!isDefaultRepoRoot(artifactRepoRoot)) {
    validation.artifact_repo_root = artifactRepoRoot;
    validation.target_path = relFrom(artifactRepoRoot, absoluteTargetPath);
  }
  if (validation.status === "failed" && validation.supported_schemas) {
    validation.recovery = "Use one of: " + proofContractSchemaKeys().join(", ");
  }
  printValidation(validation, jsonMode);
  process.exit(validation.status === "passed" ? 0 : 1);
}

export function validateContractsCommand(jsonMode) {
  const validation = {
    ...proofBoundary({ scope: "contract-catalog" }),
    ...validateContractCatalog()
  };
  printValidation(validation, jsonMode);
  process.exit(validation.status === "passed" ? 0 : 1);
}

/**
 * Run the repository's latest run validations, print a combined validation result and exit with code 0 on success or 1 on failure.
 *
 * By default, this validates the observed latest packet for internal artifact consistency.
 * With `options.smokeContext`, it also binds latest to the canonical smoke case proof context.
 *
 * @param {boolean} jsonMode - If true, print the validation as pretty-printed JSON; otherwise print a human-readable summary.
 * @param {Object} [options] - Optional check controls.
 * @param {boolean} [options.smokeContext] - Require latest to match the canonical smoke case context.
 * @param {string} [options.artifactRepoRoot] - Repository root whose latest artifact packet should be inspected.
 */
export function checkCommand(jsonMode, options = {}) {
  let artifactRepoRoot;
  try {
    artifactRepoRoot = resolveRepoRootOption(options.artifactRepoRoot);
  } catch (error) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "repo root option",
      errors: [error.message],
      recovery: "Pass an existing directory to --repo-root, then rerun the command."
    });
  }
  const defaultRepoRoot = isDefaultRepoRoot(artifactRepoRoot);
  const smokeCasePath = "fixtures/smoke/pr-closeout.case.json";
  const smokeRecoveryCommand = "pnpm evals run " + smokeCasePath + " --json";
  const smokeContext = options.smokeContext === true;
  if (smokeContext && !defaultRepoRoot) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "check mode",
      errors: ["--smoke cannot be combined with --repo-root because smoke context is owned by the evals repository"],
      recovery: "Run pnpm evals check --repo-root <path> --json for observed consumer artifacts, or run pnpm evals check --smoke --json in evals."
    });
  }

  const latestPath = join(artifactRepoRoot, ".harness", "evals", "runs", "latest.json");
  const caseCheck = smokeContext ? validateCaseFile(smokeCasePath) : null;
  const expectedContext = caseCheck?.status === "pass" ? expectedProofContextFromCase(caseCheck.testCase) : null;
  const latestValidation = smokeContext
    ? validateLatestRun(latestPath, {
        expectedContext,
        recoveryCommand: smokeRecoveryCommand
      })
    : validateLatestRun(latestPath, { artifactRepoRoot });
  const runtimeEvidenceValidation = defaultRepoRoot ? validateRuntimeEvidenceSuite() : skippedRuntimeEvidenceValidation();
  const checks = (caseCheck ? [caseCheck] : []).concat(latestValidation.checks, runtimeEvidenceValidation.checks);
  const errors = (caseCheck?.errors || []).concat(latestValidation.errors, runtimeEvidenceValidation.errors);
  const validation = {
    status: errors.length === 0 ? "passed" : "failed",
    ...proofBoundary({ artifactRepoRoot, smokeContext }),
    check_mode: smokeContext ? "smoke-context" : "observed-latest",
    artifact_repo_root: defaultRepoRoot ? null : artifactRepoRoot,
    latest_path: defaultRepoRoot ? rel(latestPath) : relFrom(artifactRepoRoot, latestPath),
    run_id: latestValidation.run_id,
    expected_context: smokeContext ? latestValidation.expected_context || expectedContext : null,
    observed_latest_context: latestValidation.observed_latest_context || null,
    context_match: smokeContext ? latestValidation.context_match ?? null : null,
    context_mismatch_reason: smokeContext ? latestValidation.context_mismatch_reason || (expectedContext ? null : "expected_context_unavailable") : null,
    recovery_command: smokeContext ? latestValidation.recovery_command || null : null,
    strict_smoke_command: smokeContext || !defaultRepoRoot ? null : "pnpm evals check --smoke --json",
    runtime_evidence: {
      policy_coverage: runtimeEvidenceValidation.policy_coverage
    },
    checks,
    errors
  };
  printValidation(validation, jsonMode);
  process.exit(validation.status === "passed" ? 0 : 1);
}

function skippedRuntimeEvidenceValidation() {
  const error = "external --repo-root runtime evidence policy is not configured; artifact consistency is advisory only";
  const policyCoverage = runtimeEvidencePolicyCoverage("not_configured", [error]);
  return {
    checks: [{
      label: "runtime evidence policy coverage",
      schema_path: "contracts/runtime-evidence",
      data_path: "external --repo-root runtime evidence policy",
      status: "fail",
      errors: [error],
      policy_coverage: policyCoverage
    }],
    errors: [error],
    policy_coverage: policyCoverage
  };
}

function runtimeEvidencePolicyCoverage(status, errors = []) {
  return {
    status,
    families: [],
    errors
  };
}
