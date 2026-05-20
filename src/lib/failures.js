import { existsSync } from "node:fs";

import { writeJson } from "./json.js";
import { rel } from "./paths.js";

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
      .map((path) => rel(path));
    writeJson(activeRunContext.failurePath, {
      schema_version: 1,
      run_id: activeRunContext.runId,
      case_id: activeRunContext.caseId,
      status: "failed",
      failure_class: "post_start",
      errors: failure.errors || ["unknown post-start failure"],
      recovery: failure.recovery || "Inspect partial artifacts, fix the failure, then rerun the same case.",
      partial_artifacts: partialArtifacts
    });
  } catch {
    // Best-effort only: the original failure remains the source of truth.
  }
}

export function emitFailure(jsonMode, failure) {
  writeFailureArtifact(failure);
  if (jsonMode) console.log(JSON.stringify(failure, null, 2));
  else console.error("failed: " + failure.errors.join("; "));
  process.exit(1);
}
