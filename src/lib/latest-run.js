import { existsSync } from "node:fs";

import { validateCaseFileContract } from "./case-contract.js";
import { sha256File } from "./hash.js";
import { readJson } from "./json.js";
import { insideRepo, rel, repoRelativePath } from "./paths.js";
import { schemaCheck } from "./schema.js";

/**
 * Validate a case JSON file against the "case" schema.
 * @param {string} casePath - Path to the case file; may be repository-relative and will be resolved to an absolute repository path.
 * @returns {object} Validation result object describing schema check outcome and any validation errors.
 */
export function validateCaseFile(casePath) {
  return validateCaseFileContract(casePath);
}

/**
 * Validate a "latest" run JSON file and the files it references inside the repository.
 * @param {string} latestPath - Path to the "latest" JSON (repo-relative or user-provided path resolved into the repo).
 * @returns {{status: ("passed"|"failed"), latest_path: string, run_id: (string|undefined), checks: Array, errors: string[]}}
 *   An object with:
 *   - `status`: `"passed"` when no validation errors were found, `"failed"` otherwise.
 *   - `latest_path`: repository-relative path to the validated "latest" file.
 *   - `run_id`: the `run_id` value extracted from the parsed "latest" JSON, or `undefined` if absent.
 *   - `checks`: array of schema check results produced for any referenced files (e.g. result, manifest, scorers, baseline).
 *   - `errors`: list of human-readable validation error messages collected during processing.
 */
export function validateLatestRun(latestPath) {
  const absoluteLatestPath = insideRepo(latestPath);
  const errors = [];
  let latest;
  try {
    latest = readJson(absoluteLatestPath);
  } catch (error) {
    return { status: "failed", errors: [error.message], checks: [] };
  }

  const requiredLatestKeys = ["manifest_path", "result_path", "report_path", "command_log_path", "baseline_result_path", "scorer_results_path"];
  const latestPaths = {};
  for (const key of requiredLatestKeys) {
    if (!latest[key]) errors.push("latest." + key + ": missing required path");
    else {
      const absolutePath = repoRelativePath(latest[key], "latest." + key, errors);
      if (absolutePath) {
        latestPaths[key] = absolutePath;
        if (!existsSync(absolutePath)) errors.push("latest." + key + ": path does not exist: " + latest[key]);
      }
    }
  }

  const checks = [];
  if (latestPaths.result_path) checks.push(schemaCheck("result", latestPaths.result_path));
  if (latestPaths.manifest_path) checks.push(schemaCheck("manifest", latestPaths.manifest_path));
  if (latestPaths.scorer_results_path) checks.push(schemaCheck("scorers", latestPaths.scorer_results_path));
  if (latestPaths.baseline_result_path) checks.push(schemaCheck("baseline", latestPaths.baseline_result_path));

  for (const check of checks) errors.push(...check.errors.map((error) => check.label + " " + error));

  if (latestPaths.manifest_path && existsSync(latestPaths.manifest_path)) {
    let manifest;
    try {
      manifest = readJson(latestPaths.manifest_path);
    } catch (error) {
      errors.push("artifact manifest JSON parse failed: " + error.message);
      manifest = null;
    }
    if (manifest) {
      if (!Array.isArray(manifest.artifacts)) {
        errors.push("artifact manifest $.artifacts: expected type array");
      }
      for (const artifact of Array.isArray(manifest.artifacts) ? manifest.artifacts : []) {
        const artifactPath = repoRelativePath(artifact.path, "manifest artifact path", errors);
        if (!artifactPath) continue;
        if (!existsSync(artifactPath)) {
          errors.push("manifest artifact missing: " + artifact.path);
        } else {
          const actual = sha256File(artifactPath);
          if (actual !== artifact.sha256) errors.push("manifest hash mismatch: " + artifact.path);
        }
      }
    }
  }

  return {
    status: errors.length === 0 ? "passed" : "failed",
    latest_path: rel(absoluteLatestPath),
    run_id: latest.run_id,
    checks,
    errors
  };
}
