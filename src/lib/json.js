import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

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
 * Read and parse a JSON file from disk.
 * @param {string} path - Path to the JSON file on the file system.
 * @returns {*} The JavaScript value obtained by parsing the file's JSON content.
 */
export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
