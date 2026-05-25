import { existsSync, statSync } from "node:fs";
import { basename, dirname, resolve, sep } from "node:path";

import { readJson } from "./json.js";
import { relFrom, rootRelativePath } from "./paths.js";
import { schemaCheck } from "./schema.js";

const DEFAULT_ARTIFACT_ROOT = ".harness/evals/runs";
const EXECUTABLE_SCORER_PATTERN = /(^|[\/])(bin|scripts?)[\/]|\.(?:[cm]?js|ts|sh|bash|zsh|py|rb|go|rs)$|^(?:node|pnpm|npm|yarn|bun|bash|sh|zsh|python|ruby|go|cargo)\b/;

function splitPath(path) {
  return String(path).split(/[\/]+/);
}

function hasTraversal(path) {
  return splitPath(path).includes("..");
}

function normalizeSuiteRef(path) {
  return typeof path === "string" ? path.replaceAll("\\", "/") : path;
}

function nearestEvalRoot(startDir) {
  let current = resolve(startDir);
  while (true) {
    if (current.endsWith(sep + ".evals") || current.split(sep).at(-1) === ".evals") return current;
    const next = dirname(current);
    if (next === current) return null;
    current = next;
  }
}

function resolveSuitePath(suiteRoot, path, label, errors) {
  const normalizedPath = normalizeSuiteRef(path);
  const resolved = rootRelativePath(suiteRoot, normalizedPath, label, errors);
  if (resolved && !existsSync(resolved)) errors.push(label + ": path does not exist: " + normalizedPath);
  return resolved;
}

function validateArtifactRoot(evaluatedRepoRoot, artifactRoot, errors) {
  const prefix = normalizeSuiteRef(artifactRoot || DEFAULT_ARTIFACT_ROOT);
  const resolved = rootRelativePath(evaluatedRepoRoot, prefix, "artifact_policy.artifact_root", errors);
  return resolved ? relFrom(evaluatedRepoRoot, resolved) : prefix;
}

function validateScorerRef(ref, index, errors) {
  const label = "scorers[" + index + "]";
  const normalizedRef = normalizeSuiteRef(ref);
  if (EXECUTABLE_SCORER_PATTERN.test(normalizedRef)) {
    errors.push(label + ": executable scorer hooks are not supported in phase one: " + normalizedRef);
  }
}

/**
 * Load and normalize a repo-local suite contract.
 * @param {string} suitePath - Absolute or cwd-relative path to a suite JSON file.
 * @returns {{suitePath: string, suiteRoot: string, evaluatedRepoRoot: string, suite: object, cases: string[], scorerRefs: string[], baselinePath: string|null, artifactPolicy: object, artifactRootPrefix: string, checks: object[]}}
 */
export function loadSuite(suitePath) {
  const absoluteSuitePath = resolve(suitePath);
  const suiteRoot = dirname(absoluteSuitePath);
  const evalRoot = nearestEvalRoot(suiteRoot);
  const evaluatedRepoRoot = evalRoot ? dirname(evalRoot) : suiteRoot;
  const errors = [];
  const checks = [schemaCheck("suite", absoluteSuitePath)];
  errors.push(...checks.flatMap((check) => check.errors.map((error) => check.label + " " + error)));
  if (!evalRoot) {
    errors.push("suite path must be inside a .evals directory");
  }

  let suite;
  try {
    suite = readJson(absoluteSuitePath);
  } catch (error) {
    return {
      status: "failed",
      suitePath: absoluteSuitePath,
      suiteRoot,
      evaluatedRepoRoot,
      checks,
      errors: errors.concat([error.message])
    };
  }

  if (suite.artifact_policy?.allow_network === true) {
    errors.push("artifact_policy.allow_network: networked suite execution is blocked in phase one");
  }
  if (suite.artifact_policy?.write_bundle !== true) {
    errors.push("artifact_policy.write_bundle: phase one requires write_bundle true");
  }
  if (suite.artifact_policy?.retain_locally !== true) {
    errors.push("artifact_policy.retain_locally: phase one requires retain_locally true");
  }

  const artifactRootPrefix = validateArtifactRoot(evaluatedRepoRoot, suite.artifact_policy?.artifact_root, errors);
  const cases = Array.isArray(suite.cases)
    ? suite.cases.map((casePath, index) => resolveSuitePath(suiteRoot, casePath, "cases[" + index + "]", errors)).filter(Boolean)
    : [];
  const scorerRefs = Array.isArray(suite.scorers) ? suite.scorers.map(normalizeSuiteRef) : [];
  scorerRefs.forEach((ref, index) => {
    if (typeof ref === "string") {
      if (hasTraversal(ref)) errors.push("scorers[" + index + "]: path must not contain traversal segments: " + ref);
      validateScorerRef(ref, index, errors);
      if (ref.endsWith(".scorer.json")) resolveSuitePath(suiteRoot, ref, "scorers[" + index + "]", errors);
    }
  });

  let baselinePath = null;
  if (suite.baseline !== undefined && suite.baseline !== null) {
    baselinePath = resolveSuitePath(suiteRoot, suite.baseline, "baseline", errors);
  }

  return {
    status: errors.length === 0 ? "passed" : "failed",
    suitePath: absoluteSuitePath,
    suiteRoot,
    evaluatedRepoRoot,
    suite,
    cases,
    scorerRefs,
    baselinePath,
    artifactPolicy: suite.artifact_policy || {},
    artifactRootPrefix,
    checks,
    errors
  };
}

export function isSuitePath(path) {
  if (!path || !existsSync(path)) return false;
  try {
    const stats = statSync(path);
    if (!stats.isFile()) return false;
    const absolutePath = resolve(path);
    return basename(absolutePath) === "suite.json" && Boolean(nearestEvalRoot(dirname(absolutePath)));
  } catch {
    return false;
  }
}
