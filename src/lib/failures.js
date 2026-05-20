import { existsSync } from "node:fs";

import { writeJson } from "./json.js";
import { insideRepo, rel } from "./paths.js";

let activeRunContext = null;

/**
 * Set the module's active run context used when writing failure artifacts.
 * @param {{run_id?: string, case_id?: string, failurePath?: string, artifactPaths?: string[], [key:string]: any} | null} context - Object containing run identifiers and paths (for example `run_id`, `case_id`, `failurePath`, `artifactPaths`); use `null` to unset the context.
 */
export function setActiveRunContext(context) {
  activeRunContext = context;
}

/**
 * Reset the module-scoped active run context to null.
 *
 * After calling this, no active run context will be available for failure-artifact writing.
 */
export function clearActiveRunContext() {
  activeRunContext = null;
}

/**
 * Write a best-effort JSON failure artifact to the active run context's failure path.
 *
 * If an active run context is set, the artifact contains schema_version, run and case IDs,
 * status "failed", failure_class "post_start", a normalized `errors` array, a `recovery`
 * message (uses a default guidance if `failure.recovery` is absent), and `partial_artifacts`
 * —a list of existing artifact paths converted to repo-relative paths. Any errors encountered
 * while attempting to write the artifact are silently ignored.
 *
 * @param {Object} failure - Failure information.
 * @param {string|string[]|undefined} [failure.errors] - Error message(s) or value to be normalised into an array of strings.
 * @param {string|undefined} [failure.recovery] - Optional recovery guidance to include in the artifact.
 */
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

/**
 * Normalises a failure object's `errors` into an array of strings.
 * @param {Object} failure - Object that may contain an `errors` property.
 * @returns {string[]} The failure's errors as an array of strings: the original array if `failure.errors` is already an array; a single-element array containing `String(failure.errors)` if `failure.errors` is truthy; otherwise `["unknown failure"]`.
 */
function failureErrors(failure) {
  if (Array.isArray(failure.errors)) return failure.errors;
  if (failure.errors) return [String(failure.errors)];
  return ["unknown failure"];
}

/**
 * Emit a failure report, attempt to persist a failure artifact, log the failure, and terminate the process.
 *
 * Attempts a best-effort write of a failure artifact, then logs the normalized failure:
 * if `jsonMode` is truthy the failure is printed as pretty JSON to stdout, otherwise a semicolon-separated
 * error message is written to stderr. The process is terminated with exit code 1.
 *
 * @param {any} jsonMode - If truthy, log the failure as pretty-printed JSON to stdout; otherwise log a human-readable message to stderr.
 * @param {Object} failure - Failure information; its `errors` field will be normalised for logging and artifact contents.
 */
export function emitFailure(jsonMode, failure) {
  const errors = failureErrors(failure);
  const normalizedFailure = { ...failure, errors };
  writeFailureArtifact(failure);
  if (jsonMode) console.log(JSON.stringify(normalizedFailure, null, 2));
  else console.error("failed: " + errors.join("; "));
  process.exit(1);
}
