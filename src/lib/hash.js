import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function sha256Text(value) {
  return createHash("sha256").update(value).digest("hex");
}
