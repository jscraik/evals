import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = new URL("..", import.meta.url);
const repoRootPath = fileURLToPath(repoRoot);

function readRepoFile(path) {
  return readFileSync(join(repoRootPath, path), "utf8");
}

test("parent-child implementation loop guardrail is documented and discoverable", () => {
  const guardrail = readRepoFile(".harness/refactors/2026-05-20-parent-child-loop-guardrail.md");
  const agents = readRepoFile("AGENTS.md");
  const language = readRepoFile("UBIQUITOUS_LANGUAGE.md");

  assert.match(guardrail, /A child loop cannot close the parent loop/);
  assert.match(guardrail, /Which parent audit phase is active/);
  assert.match(guardrail, /Which Linear parent issue or phase queue owns the next task/);
  assert.match(guardrail, /Is the parent heartbeat still active, updated, or intentionally retired/);
  assert.match(guardrail, /Return to step 2 until the parent queue is complete/);

  assert.match(agents, /2026-05-20-parent-child-loop-guardrail\.md/);
  assert.match(agents, /A child loop cannot close the parent loop/);
  assert.match(agents, /reconcile\s+the parent queue/);

  assert.match(language, /Parent implementation loop/);
  assert.match(language, /Child implementation loop/);
  assert.match(language, /loop through each phase/);
  assert.match(language, /Preserve the distinction between parent heartbeat and child PR\/issue heartbeat/);
});

test("adoption readiness vocabulary stays aligned with public schemas", () => {
  const readme = readRepoFile("README.md");
  const language = readRepoFile("UBIQUITOUS_LANGUAGE.md");
  const architecture = readRepoFile("ARCHITECTURE.md");
  const authoritySchema = readRepoFile("schemas/authority-classification.schema.json");
  const manifestSchema = readRepoFile("schemas/external-project-manifest.schema.json");

  assert.match(authoritySchema, /"adoption_readiness"/);
  assert.match(authoritySchema, /"missing_input"/);
  assert.match(manifestSchema, /"suite_quality"/);
  assert.match(manifestSchema, /"guardrail_metrics"/);

  assert.match(language, /Adoption readiness/);
  assert.match(language, /missing_input, blocked, warning, or ready/);
  assert.match(language, /does not prove target behavior, CI, review-thread, tracker, or merge readiness/);
  assert.match(language, /Suite quality/);
  assert.match(language, /warning-only adoption input/);
  assert.match(language, /"adoption readiness"/);
  assert.match(language, /"suite quality"/);
  assert.match(language, /Name the lane explicitly/);

  assert.match(architecture, /adoption_readiness/);
  assert.match(architecture, /evaluator_axis/);
  assert.match(architecture, /suite_quality/);
  assert.match(architecture, /input-completeness and warning/);
  assert.match(architecture, /target\s+product quality, CI, review-thread, tracker, or merge readiness/);

  assert.match(readme, /authority_classification\.adoption_readiness/);
  assert.match(readme, /artifact-only inspection/);
  assert.match(readme, /Neither\s+field certifies target behavior, CI, review, tracker, or merge readiness/);
});
