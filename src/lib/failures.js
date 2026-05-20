import { existsSync } from "node:fs";

import { writeJson } from "./json.js";
import { insideRepo, rel } from "./paths.js";

let activeRunContext = null;

export function setActiveRunContext(context) {
  activeRunContext = context;
}

export function clearActiveRunContext() {
  activeRunContext = null;
}

export function writeFailureArtifact(failure) {
  if (!activeRunContext) return;
  try {
    const partialArtifacts = activeRunContext.artifactPaths
      .filter((path) => existsSync(path))
      .map((path) => {
        try {
          return rel(insideRepo(path));
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    writeJson(activeRunContext.failurePath, {
      schema_version: 1,
      run_id: activeRunContext.runId,
      case_id: activeRunContext.caseId,
      status: "failed",
      failure_class: "post_start",
      errors: failureErrors(failure),
      recovery: failure.recovery || "Inspect partial artifacts, fix the failure, then rerun the same case.",
      partial_artifacts: partialArtifacts
    });
  } catch {
    // Best-effort only: the original failure remains the source of truth.
  }
}

function failureErrors(failure) {
  if (Array.isArray(failure.errors)) return failure.errors;
  if (failure.errors) return [String(failure.errors)];
  return ["unknown failure"];
}

export function emitFailure(jsonMode, failure) {
  const errors = failureErrors(failure);
  const normalizedFailure = { ...failure, errors };
  writeFailureArtifact(failure);
  if (jsonMode) console.log(JSON.stringify(normalizedFailure, null, 2));
  else console.error("failed: " + errors.join("; "));
  process.exit(1);
}
