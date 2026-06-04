import { existsSync, realpathSync, statSync } from "node:fs";
import { resolve } from "node:path";

import { repoRoot } from "./paths.js";

/**
 * Resolve an optional artifact repository root for commands that inspect
 * already-written eval artifacts.
 *
 * This does not grant execution authority over the target repository. It only
 * selects the root used to resolve .harness/evals/runs/latest.json and the
 * repo-relative artifact paths named by that latest pointer.
 *
 * @param {string|null|undefined} value - User-supplied repo root.
 * @returns {string} Absolute real path to the artifact repository root.
 */
export function resolveRepoRootOption(value) {
  if (!value) return repoRoot;
  const candidate = resolve(value);
  if (!existsSync(candidate)) {
    throw new Error("--repo-root does not exist: " + value);
  }
  if (!statSync(candidate).isDirectory()) {
    throw new Error("--repo-root must be a directory: " + value);
  }
  return realpathSync.native(candidate);
}

/**
 * @param {string} artifactRepoRoot - Candidate root.
 * @returns {boolean} True when the target is the evals repository itself.
 */
export function isDefaultRepoRoot(artifactRepoRoot) {
  return realpathSync.native(artifactRepoRoot) === realpathSync.native(repoRoot);
}
