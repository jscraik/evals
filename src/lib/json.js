import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

/**
 * Write a value as pretty-printed JSON to a file, creating parent directories if required.
 * The JSON is formatted with two-space indentation, encoded as UTF-8 and terminated with a newline.
 * @param {string} path - Destination file path.
 * @param {*} value - Value to serialize to JSON.
 */
export function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf8");
}

/**
 * Write JSON by replacing the destination with a same-directory temporary file.
 * Readers see either the previous complete file or the new complete file.
 * @param {string} path - Destination file path.
 * @param {*} value - Value to serialize to JSON.
 */
export function writeJsonAtomic(path, value) {
  const parent = dirname(path);
  mkdirSync(parent, { recursive: true });
  const tempPath = join(parent, "." + basename(path) + "." + process.pid + "." + Date.now() + ".tmp");
  writeFileSync(tempPath, JSON.stringify(value, null, 2) + "\n", "utf8");
  renameSync(tempPath, path);
}

/**
 * Read and parse a JSON file from disk.
 * @param {string} path - Path to the JSON file on the file system.
 * @returns {*} The JavaScript value obtained by parsing the file's JSON content.
 */
export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
