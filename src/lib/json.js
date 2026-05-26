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
 * Parse JSON text with repository artifact diagnostics.
 * @param {string} raw - Raw JSON text.
 * @param {{path?: string}} [options] - Optional logical path for diagnostics.
 * @returns {*} The parsed JSON value.
 */
export function parseJson(raw, options = {}) {
  try {
    const parsed = JSON.parse(raw);
    assertNoDuplicateKeys(raw, options.path || "$");
    return parsed;
  } catch (error) {
    if (error?.name === "DuplicateJsonKeyError") throw error;
    throw jsonError(options.path, "JSON parse failed: " + error.message);
  }
}

/**
 * Read and parse a JSON file from disk.
 * @param {string} path - Path to the JSON file on the file system.
 * @returns {*} The JavaScript value obtained by parsing the file's JSON content.
 */
export function readJson(path) {
  return parseJson(readFileSync(path, "utf8"), { path });
}

function jsonError(path, message) {
  const prefix = path && path !== "$" ? path + ": " : "";
  return new Error(prefix + message);
}

function duplicateKeyError(path, key, objectPath) {
  const error = jsonError(path, 'duplicate JSON key "' + key + '" at ' + objectPath);
  error.name = "DuplicateJsonKeyError";
  return error;
}

function assertNoDuplicateKeys(raw, path) {
  const scanner = {
    raw: String(raw),
    index: 0,
    path,
    stack: []
  };
  while (scanner.index < scanner.raw.length) {
    skipWhitespace(scanner);
    const char = scanner.raw[scanner.index];
    if (!char) return;

    if (char === "{") {
      scanner.stack.push({
        type: "object",
        path: nextValuePath(scanner),
        keys: new Set(),
        expect: "keyOrEnd",
        pendingPath: null
      });
      scanner.index += 1;
      continue;
    }

    if (char === "[") {
      scanner.stack.push({
        type: "array",
        path: nextValuePath(scanner),
        index: 0,
        expect: "valueOrEnd"
      });
      scanner.index += 1;
      continue;
    }

    if (char === "}" || char === "]") {
      scanner.stack.pop();
      markValueConsumed(scanner);
      scanner.index += 1;
      continue;
    }

    if (char === ":") {
      const frame = currentFrame(scanner);
      if (frame?.type === "object") frame.expect = "value";
      scanner.index += 1;
      continue;
    }

    if (char === ",") {
      const frame = currentFrame(scanner);
      if (frame?.type === "object") frame.expect = "key";
      if (frame?.type === "array") {
        frame.index += 1;
        frame.expect = "value";
      }
      scanner.index += 1;
      continue;
    }

    if (char === '"') {
      const token = scanStringToken(scanner);
      const frame = currentFrame(scanner);
      if (frame?.type === "object" && (frame.expect === "key" || frame.expect === "keyOrEnd")) {
        if (frame.keys.has(token.value)) throw duplicateKeyError(scanner.path, token.value, frame.path);
        frame.keys.add(token.value);
        frame.pendingPath = childPath(frame.path, token.value);
        frame.expect = "colon";
      } else {
        markValueConsumed(scanner);
      }
      scanner.index = token.end;
      continue;
    }

    scanPrimitive(scanner);
    markValueConsumed(scanner);
  }
}

function scanStringToken(scanner) {
  const start = scanner.index;
  scanner.index += 1;
  while (scanner.index < scanner.raw.length) {
    const char = scanner.raw[scanner.index];
    if (char === '"') {
      const end = scanner.index + 1;
      return {
        end,
        value: JSON.parse(scanner.raw.slice(start, end))
      };
    }
    if (char === "\\") {
      const escape = scanner.raw[scanner.index + 1];
      if (escape === "u") {
        scanner.index += 6;
      } else {
        scanner.index += 2;
      }
    } else {
      scanner.index += 1;
    }
  }
  return {
    end: scanner.index,
    value: ""
  };
}

function scanPrimitive(scanner) {
  while (/[^\s,}\]]/.test(scanner.raw[scanner.index] || "")) scanner.index += 1;
}

function skipWhitespace(scanner) {
  while (/\s/.test(scanner.raw[scanner.index] || "")) scanner.index += 1;
}

function currentFrame(scanner) {
  return scanner.stack.at(-1);
}

function nextValuePath(scanner) {
  const frame = currentFrame(scanner);
  if (!frame) return "$";
  if (frame.type === "object") return frame.pendingPath || frame.path;
  return frame.path + "[" + frame.index + "]";
}

function markValueConsumed(scanner) {
  const frame = currentFrame(scanner);
  if (!frame) return;
  if (frame.type === "object" && frame.expect === "value") {
    frame.expect = "afterValue";
    frame.pendingPath = null;
  }
  if (frame.type === "array" && (frame.expect === "value" || frame.expect === "valueOrEnd")) {
    frame.expect = "afterValue";
  }
}

function childPath(parent, key) {
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) return parent + "." + key;
  return parent + "[" + JSON.stringify(key) + "]";
}
