import { existsSync } from "node:fs";
import { isAbsolute, join, win32 } from "node:path";

import { readJson } from "./json.js";
import { schemaCheckFromObject } from "./schema.js";

export const externalProjectManifestPath = ".evals/project.json";

const pathFields = [
  ["suite_roots", (manifest) => manifest.suite_roots || []],
  [
    "runtime_evidence_policy.evidence_paths",
    (manifest) => manifest.runtime_evidence_policy?.evidence_paths || []
  ],
  ["artifact_policy.artifact_roots", (manifest) => manifest.artifact_policy?.artifact_roots || []],
  ["baseline_authority.baseline_paths", (manifest) => manifest.baseline_authority?.baseline_paths || []]
];

function hasTraversal(path) {
  return String(path).split(/[\\/]+/).includes("..");
}

function validateRelativePath(value, label, errors) {
  if (typeof value !== "string" || value.length === 0) {
    return;
  }

  if (isAbsolute(value) || win32.isAbsolute(value)) {
    errors.push(label + ": path must be repository-relative: " + value);
  }

  if (hasTraversal(value)) {
    errors.push(label + ": path must not contain traversal segments: " + value);
  }
}

export function validateExternalProjectManifest(manifest, dataPath = externalProjectManifestPath) {
  const schemaCheck = schemaCheckFromObject("projectManifest", manifest, dataPath);
  const errors = [...schemaCheck.errors];

  if (manifest && typeof manifest === "object" && !Array.isArray(manifest)) {
    for (const [field, valuesFor] of pathFields) {
      const values = valuesFor(manifest);
      if (!Array.isArray(values)) {
        continue;
      }

      values.forEach((value, index) => validateRelativePath(value, field + "[" + index + "]", errors));
    }

    if (manifest.authority?.default_mode === "black_box_execution") {
      errors.push("authority.default_mode: black_box_execution is blocked in the first implementation slice");
    }

    if (
      manifest.authority?.supported_modes?.includes("black_box_execution") &&
      manifest.execution_policy?.black_box_execution_status !== "blocked"
    ) {
      errors.push("execution_policy.black_box_execution_status: black_box_execution must be blocked in the first implementation slice");
    }
  }

  return {
    label: schemaCheck.label,
    schema_path: schemaCheck.schema_path,
    data_path: schemaCheck.data_path,
    status: errors.length === 0 ? "pass" : "fail",
    errors
  };
}

export function loadExternalProjectManifestState(repoRoot) {
  const manifestPath = join(repoRoot, externalProjectManifestPath);
  if (!existsSync(manifestPath)) {
    return {
      status: "missing",
      manifest: null,
      errors: []
    };
  }

  let manifest;
  try {
    manifest = readJson(manifestPath);
  } catch (error) {
    return {
      status: "invalid",
      manifest: null,
      errors: [externalProjectManifestPath + ": JSON parse failed: " + error.message]
    };
  }

  const validation = validateExternalProjectManifest(manifest, externalProjectManifestPath);
  return {
    status: validation.status === "pass" ? "valid" : "invalid",
    manifest,
    errors: validation.errors
  };
}
