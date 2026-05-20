import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
export const schemaDir = join(repoRoot, "schemas");

export function utcBasic(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function rel(path) {
  return relative(repoRoot, path);
}

export function insideRepo(path) {
  const absolutePath = resolve(repoRoot, path);
  if (absolutePath !== repoRoot && !absolutePath.startsWith(repoRoot + sep)) {
    throw new Error("path must be inside the evals repository: " + path);
  }
  return absolutePath;
}

export function repoRelativePath(path, label, errors) {
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
    return insideRepo(path);
  } catch (error) {
    errors.push(label + ": " + error.message);
    return null;
  }
}
