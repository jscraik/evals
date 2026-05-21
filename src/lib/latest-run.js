import { existsSync } from "node:fs";

import { expectedLatestPath, latestArtifactContracts, manifestArtifactContracts, requiredLatestKeys, resultArtifactRefContracts } from "./artifact-bundle.js";
import { validateCaseFileContract } from "./case-contract.js";
import { sha256File } from "./hash.js";
import { readJson } from "./json.js";
import { insideRepo, rel, repoRelativePath } from "./paths.js";
import { schemaCheck, schemaCheckFromObject } from "./schema.js";
import { validateTraceEventsFile } from "./trace-events.js";

/**
 * Validates a case JSON file against the "case" schema.
 * @param {string} casePath - Repository-relative or absolute path to the case JSON file.
 * @returns {object} Result object containing validation `status`, an array of `errors`, and `checks` with schema validation details.
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
export function validateLatestRun(latestPath, options = {}) {
  const absoluteLatestPath = insideRepo(latestPath);
  const errors = [];
  let latest;
  try {
    latest = readJson(absoluteLatestPath);
  } catch (error) {
    return { status: "failed", errors: [error.message], checks: [] };
  }

  const checks = [schemaCheckFromObject("latest", latest, absoluteLatestPath)];
  for (const check of checks) errors.push(...check.errors.map((error) => check.label + " " + error));

  if (errors.length > 0) {
    return {
      status: "failed",
      latest_path: rel(absoluteLatestPath),
      run_id: latest.run_id,
      checks,
      errors
    };
  }

  const latestPaths = {};
  for (const key of requiredLatestKeys) {
    const absolutePath = repoRelativePath(latest[key], "latest." + key, errors);
    if (absolutePath) {
      latestPaths[key] = absolutePath;
      if (!existsSync(absolutePath)) errors.push("latest." + key + ": path does not exist: " + latest[key]);
    }
  }

  if (latestPaths.result_path) checks.push(schemaCheck("result", latestPaths.result_path));
  if (latestPaths.manifest_path) checks.push(schemaCheck("manifest", latestPaths.manifest_path));
  if (latestPaths.scorer_results_path) checks.push(schemaCheck("scorers", latestPaths.scorer_results_path));
  if (latestPaths.baseline_result_path) checks.push(schemaCheck("baseline", latestPaths.baseline_result_path));
  if (latestPaths.trace_events_path && options.validateTraceEvents !== false) {
    checks.push(validateTraceEventsFile(latestPaths.trace_events_path, { runId: latest.run_id, caseId: latest.case_id }));
  }

  for (const check of checks) errors.push(...check.errors.map((error) => check.label + " " + error));

  const manifest = readArtifactJson("artifact manifest", latestPaths.manifest_path, errors);
  const result = readArtifactJson("eval result", latestPaths.result_path, errors);
  const baseline = readArtifactJson("baseline result", latestPaths.baseline_result_path, errors);

  if (manifest) {
    const consistencyErrors = latestConsistencyErrors(latest, manifest, result, baseline);
    errors.push(...consistencyErrors);
    checks.push({
      label: "closure latest consistency",
      schema_path: "latest-run consistency",
      data_path: rel(absoluteLatestPath),
      status: consistencyErrors.length === 0 ? "pass" : "fail",
      errors: consistencyErrors
    });

    if (!Array.isArray(manifest.artifacts)) {
      errors.push("artifact manifest $.artifacts: expected type array");
    }
    for (const artifact of Array.isArray(manifest.artifacts) ? manifest.artifacts : []) {
      const artifactPath = repoRelativePath(artifact.path, "manifest artifact path", errors);
      if (!artifactPath) continue;
      if (!existsSync(artifactPath)) {
        errors.push("manifest artifact missing: " + artifact.path);
      } else {
        const actual = safeSha256File(artifactPath, "manifest artifact", artifact.path, errors);
        if (actual && actual !== artifact.sha256) errors.push("manifest hash mismatch: " + artifact.path);
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

function readArtifactJson(label, path, errors) {
  if (!path || !existsSync(path)) return null;
  try {
    return readJson(path);
  } catch (error) {
    errors.push(label + " JSON parse failed: " + error.message);
    return null;
  }
}

function latestConsistencyErrors(latest, manifest, result, baseline) {
  const errors = [];

  for (const contract of latestArtifactContracts) {
    const expectedPath = expectedLatestPath(latest.run_id, contract.key);
    if (!sameArtifactPath(latest[contract.key], expectedPath)) {
      errors.push("latest." + contract.key + ": expected " + expectedPath + " for run_id " + latest.run_id + ", got " + latest[contract.key]);
    }
  }

  if (manifest.run_id !== latest.run_id) errors.push("manifest.run_id: expected " + latest.run_id + ", got " + manifest.run_id);
  if (manifest.case_id !== latest.case_id) errors.push("manifest.case_id: expected " + latest.case_id + ", got " + manifest.case_id);

  if (result) {
    if (result.run_id !== latest.run_id) errors.push("result.run_id: expected " + latest.run_id + ", got " + result.run_id);
    if (result.case_id !== latest.case_id) errors.push("result.case_id: expected " + latest.case_id + ", got " + result.case_id);
    if (result.execution_mode !== latest.execution_mode) errors.push("result.execution_mode: expected " + latest.execution_mode + ", got " + result.execution_mode);
    if (result.scorer_results_path !== latest.scorer_results_path) {
      errors.push("result.scorer_results_path: expected " + latest.scorer_results_path + ", got " + result.scorer_results_path);
    }
    if (result.baseline_result_path !== latest.baseline_result_path) {
      errors.push("result.baseline_result_path: expected " + latest.baseline_result_path + ", got " + result.baseline_result_path);
    }
    if (result.trace_events_path !== latest.trace_events_path) {
      errors.push("result.trace_events_path: expected " + latest.trace_events_path + ", got " + result.trace_events_path);
    }
  }

  const manifestArtifacts = artifactMap(manifest.artifacts, "manifest", errors);
  for (const contract of manifestArtifactContracts) {
    const artifact = manifestArtifacts.get(contract.type);
    if (!artifact) {
      errors.push("manifest missing required artifact: " + contract.type);
      continue;
    }
    if (!sameArtifactPath(artifact.path, latest[contract.key])) {
      errors.push("manifest " + contract.type + " path: expected " + latest[contract.key] + ", got " + artifact.path);
    }
    if (artifact.required !== true) errors.push("manifest " + contract.type + " required: expected true");
  }

  const resultArtifacts = artifactMap(result?.artifact_refs, "result", errors);
  for (const contract of resultArtifactRefContracts) {
    const artifact = resultArtifacts.get(contract.type);
    if (!artifact) {
      errors.push("result missing artifact_ref: " + contract.type);
      continue;
    }
    if (!sameArtifactPath(artifact.path, latest[contract.key])) {
      errors.push("result " + contract.type + " artifact_ref path: expected " + latest[contract.key] + ", got " + artifact.path);
    }
    const manifestArtifact = manifestArtifacts.get(contract.type);
    if (manifestArtifact && artifact.sha256 !== manifestArtifact.sha256) {
      errors.push("result " + contract.type + " artifact_ref sha256 does not match manifest");
    }
  }

  const baselineRef = baseline?.current_artifact_ref;
  if (!baselineRef || typeof baselineRef.type !== "string") {
    errors.push("baseline current_artifact_ref: expected command-log or baseline-artifact reference");
  } else if (baselineRef.type === "command-log") {
    if (!sameArtifactPath(baselineRef.path, latest.command_log_path)) {
      errors.push("baseline current_artifact_ref.path: expected " + latest.command_log_path + ", got " + baselineRef.path);
    }
    const commandLogArtifact = manifestArtifacts.get("command-log");
    if (commandLogArtifact && baselineRef.sha256 !== commandLogArtifact.sha256) {
      errors.push("baseline current_artifact_ref.sha256 does not match command-log manifest artifact");
    }
  } else if (baselineRef.type === "baseline-artifact") {
    const baselinePathErrors = [];
    const baselinePath = repoRelativePath(baselineRef.path, "baseline current_artifact_ref.path", baselinePathErrors);
    errors.push(...baselinePathErrors);
    if (baselinePath && existsSync(baselinePath)) {
      const actual = safeSha256File(baselinePath, "baseline current_artifact_ref.path", baselineRef.path, errors);
      if (actual && baselineRef.sha256 !== actual) errors.push("baseline current_artifact_ref.sha256 does not match baseline artifact");
    } else if (baselinePath) {
      errors.push("baseline current_artifact_ref.path does not exist: " + baselineRef.path);
    }
  } else {
    errors.push("baseline current_artifact_ref.type: expected command-log or baseline-artifact, got " + baselineRef.type);
  }

  return errors;
}

function safeSha256File(path, label, displayPath, errors) {
  try {
    return sha256File(path);
  } catch (error) {
    errors.push(label + " read failed: " + displayPath + ": " + error.message);
    return null;
  }
}

function sameArtifactPath(left, right) {
  return normalizeArtifactPath(left) === normalizeArtifactPath(right);
}

function normalizeArtifactPath(path) {
  return typeof path === "string" ? path.replace(/\\/g, "/") : path;
}

function artifactMap(artifacts, label, errors) {
  const map = new Map();
  for (const artifact of Array.isArray(artifacts) ? artifacts : []) {
    if (!artifact || typeof artifact.type !== "string") continue;
    if (map.has(artifact.type)) {
      errors.push(label + " duplicate artifact type: " + artifact.type);
    } else {
      map.set(artifact.type, artifact);
    }
  }
  return map;
}
