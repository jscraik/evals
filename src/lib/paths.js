import { existsSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
export const schemaDir = join(repoRoot, "schemas");

/**
 * Format a Date as a compact UTC timestamp.
 * @param {Date} date - The date to format.
 * @returns {string} The UTC timestamp in basic ISO 8601 form (e.g. `20260520T153045Z`) with separators removed and milliseconds stripped.
 */
export function utcBasic(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/**
 * Compute a path relative to the repository root.
 * @param {string} path - Absolute or relative filesystem path to convert.
 * @returns {string} The path from the repository root to the provided `path`.
 */
export function rel(path) {
  return relative(repoRoot, path);
}

/**
 * Compute a path relative to a supplied root.
 * @param {string} root - Absolute root directory.
 * @param {string} path - Absolute or relative filesystem path to convert.
 * @returns {string} The path from root to path.
 */
export function relFrom(root, path) {
  return relative(root, path);
}

/**
 * Resolve a path against the repository root and ensure the result is located inside the repository.
 * @param {string} path - Path to resolve (absolute or repository-relative); resolved against the repository root.
 * @returns {string} The resolved absolute path inside the repository.
 * @throws {Error} If the resolved path is outside the repository (`"path must be inside the evals repository: " + path`).
 */
export function insideRepo(path) {
  return insideRoot(repoRoot, path, "evals repository");
}

/**
 * Resolve a path against a supplied root and ensure the result remains inside that root.
 * @param {string} root - Absolute root directory.
 * @param {string} path - Path to resolve against root.
 * @param {string} label - Human-readable root label for errors.
 * @returns {string} The resolved absolute path inside root.
 */
export function insideRoot(root, path, label = "root") {
  const absoluteRoot = resolve(root);
  const absolutePath = resolve(absoluteRoot, path);
  const realRoot = realpathSync.native(absoluteRoot);
  const realPath = realpathForContainment(absolutePath);
  if (realPath !== realRoot && !realPath.startsWith(realRoot + sep)) {
    throw new Error("path must be inside the " + label + ": " + path);
  }
  return absolutePath;
}

function realpathForContainment(path) {
  if (existsSync(path)) {
    return realpathSync.native(path);
  }
  const parent = dirname(path);
  if (parent === path) {
    return path;
  }
  return join(realpathForContainment(parent), path.slice(parent.length + 1));
}

/**
 * Validate a repository-relative path and return its absolute path inside the repository.
 * @param {string} path - Candidate repository-relative path (must be non-empty, not absolute, and must not contain `..` segments).
 * @param {string} label - Label prefixed to any error messages pushed to `errors`.
 * @param {string[]} errors - Array to receive validation error messages.
 * @returns {string|null} Absolute path inside the repository if valid, `null` otherwise.
 */
export function repoRelativePath(path, label, errors) {
  return rootRelativePath(repoRoot, path, label, errors);
}

/**
 * Validate a root-relative path and return its absolute path inside root.
 * @param {string} root - Absolute root directory.
 * @param {string} path - Candidate root-relative path.
 * @param {string} label - Label prefixed to validation errors.
 * @param {string[]} errors - Array to receive validation errors.
 * @returns {string|null} Absolute path inside root if valid, null otherwise.
 */
export function rootRelativePath(root, path, label, errors) {
  if (typeof path !== "string" || path.length === 0) {
    errors.push(label + ": path must be a non-empty string");
    return null;
  }
  if (isAbsolute(path)) {
    errors.push(label + ": path must be repository-relative: " + path);
    return null;
  }
  if (path.split(/[\\/]+/).includes("..")) {
    errors.push(label + ": path must not contain traversal segments: " + path);
    return null;
  }
  try {
    return insideRoot(root, path, "configured root");
  } catch (error) {
    errors.push(label + ": " + error.message);
    return null;
  }
}
