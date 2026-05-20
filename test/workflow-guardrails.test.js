import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const repoRoot = new URL("..", import.meta.url);

function readRepoFile(path) {
  return readFileSync(join(repoRoot.pathname, path), "utf8");
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
