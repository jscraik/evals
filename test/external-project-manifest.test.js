import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  externalProjectManifestPath,
  validateExternalProjectManifest
} from "../src/lib/external-project-manifest.js";
import { schemaTargets } from "../src/lib/schema.js";

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function fixture(path) {
  return JSON.parse(readFileSync(join(sourceRoot, "fixtures", "external-project-manifest", path), "utf8"));
}

test("external project manifest schema target is registered", () => {
  assert.equal(schemaTargets.projectManifest.label, "external project manifest");
  assert.equal(externalProjectManifestPath, ".evals/project.json");
});

test("external project manifest accepts the valid fixture", () => {
  const result = validateExternalProjectManifest(fixture("good/project.json"));

  assert.equal(result.status, "pass");
  assert.deepEqual(result.errors, []);
});

test("external project manifest accepts public not-required privacy evidence", () => {
  const result = validateExternalProjectManifest(fixture("good/public-not-required.json"));

  assert.equal(result.status, "pass");
  assert.deepEqual(result.errors, []);
});

test("external project manifest accepts optional suite quality metadata", () => {
  const result = validateExternalProjectManifest(fixture("good/with-suite-quality.json"));

  assert.equal(result.status, "pass");
  assert.deepEqual(result.errors, []);
});

test("external project manifest rejects empty suite quality guardrail metrics", () => {
  const manifest = fixture("good/with-suite-quality.json");
  manifest.suite_quality.guardrail_metrics = [];

  const result = validateExternalProjectManifest(manifest);

  assert.equal(result.status, "fail");
  assert.match(result.errors.join("\n"), /suite_quality\.guardrail_metrics/);
});

test("external project manifest rejects suite quality without guardrail metrics", () => {
  const manifest = fixture("good/with-suite-quality.json");
  delete manifest.suite_quality.guardrail_metrics;

  const result = validateExternalProjectManifest(manifest);

  assert.equal(result.status, "fail");
  assert.match(result.errors.join("\n"), /suite_quality\.guardrail_metrics: missing required property/);
});

test("external project manifest requires explicit privacy evidence", () => {
  const result = validateExternalProjectManifest(fixture("bad/missing-privacy-evidence.json"));

  assert.equal(result.status, "fail");
  assert.match(result.errors.join("\n"), /privacy\.approval_status: missing required property/);
});

test("external project manifest rejects a missing required field", () => {
  const result = validateExternalProjectManifest(fixture("bad/missing-required-field.json"));

  assert.equal(result.status, "fail");
  assert.match(result.errors.join("\n"), /\$\.project: missing required property/);
});

test("external project manifest rejects unknown fields", () => {
  const result = validateExternalProjectManifest(fixture("bad/unknown-field.json"));

  assert.equal(result.status, "fail");
  assert.match(result.errors.join("\n"), /\$\.surprise_adapter: additional property is not allowed/);
});

test("external project manifest rejects absolute paths", () => {
  const result = validateExternalProjectManifest(fixture("bad/absolute-path.json"));

  assert.equal(result.status, "fail");
  assert.match(result.errors.join("\n"), /suite_roots\[0\].*repository-relative/);
});

test("external project manifest rejects Windows absolute paths", () => {
  const manifest = fixture("good/project.json");
  manifest.suite_roots = ["C:\\external-evals"];

  const result = validateExternalProjectManifest(manifest);

  assert.equal(result.status, "fail");
  assert.match(result.errors.join("\n"), /suite_roots\[0\].*repository-relative/);
});

test("external project manifest rejects parent traversal", () => {
  const result = validateExternalProjectManifest(fixture("bad/parent-traversal.json"));

  assert.equal(result.status, "fail");
  assert.match(result.errors.join("\n"), /artifact_policy\.artifact_roots\[0\].*traversal/);
});

test("external project manifest rejects backslash parent traversal", () => {
  const manifest = fixture("good/project.json");
  manifest.artifact_policy.artifact_roots = ["..\\runs"];

  const result = validateExternalProjectManifest(manifest);

  assert.equal(result.status, "fail");
  assert.match(result.errors.join("\n"), /artifact_policy\.artifact_roots\[0\].*traversal/);
});

test("external project manifest blocks black-box execution as default mode", () => {
  const manifest = fixture("good/project.json");
  manifest.authority.default_mode = "black_box_execution";

  const result = validateExternalProjectManifest(manifest);

  assert.equal(result.status, "fail");
  assert.match(result.errors.join("\n"), /black_box_execution is blocked in the first implementation slice/);
});
