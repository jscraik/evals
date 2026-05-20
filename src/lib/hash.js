import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/**
 * Compute the SHA-256 hash of the file at the given path and return it as a hexadecimal string.
 * @param {string} path - Path to the file whose contents will be hashed.
 * @returns {string} The SHA-256 digest of the file contents encoded as a hexadecimal string.
 */
export function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/**
 * Compute the SHA-256 digest of the given text or binary data and return it as a hexadecimal string.
 * @param {string|Buffer|TypedArray|DataView} value - Input to hash; may be a string or binary-like object.
 * @returns {string} The SHA-256 digest encoded as a lowercase hexadecimal string.
 */
export function sha256Text(value) {
  return createHash("sha256").update(value).digest("hex");
}
