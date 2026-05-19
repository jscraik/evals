import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function exists(path) {
  return existsSync(join(root, path));
}

function section(content, heading) {
  const start = content.indexOf(heading);
  assert.notEqual(start, -1, heading + " should exist");
  const next = content.indexOf("\n## ", start + heading.length);
  return content.slice(start, next === -1 ? undefined : next);
}

function literal(value) {
  return new RegExp(value.replace(/[.*+?^\${}()|[\]\\]/g, "\\$&"));
}

const docs = [
  "AGENTS.md",
  "README.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "SUPPORT.md",
  "LICENSE.md",
  "UBIQUITOUS_LANGUAGE.md",
  "artifacts/reviews/docs-expert.md"
];

test("README documentation map points to existing docs", () => {
  const readme = read("README.md");
  const docsSection = section(readme, "## Documentation");
  const mappedDocs = [
    "AGENTS.md",
    "CONTRIBUTING.md",
    "LICENSE.md",
    "SECURITY.md",
    "SUPPORT.md",
    "UBIQUITOUS_LANGUAGE.md"
  ];
  for (const doc of mappedDocs) {
    assert.match(docsSection, literal(doc));
    assert.ok(exists(doc), doc + " should exist");
  }
});

test("agent discovery keeps full spec and plan as scoped pointers", () => {
  const agents = read("AGENTS.md");
  const discovery = section(agents, "## Discovery");
  assert.match(discovery, /Always read:/);
  assert.match(discovery, /\.harness\/core\/2026-05-18-evals-core\.md/);
  assert.match(discovery, /UBIQUITOUS_LANGUAGE\.md/);
  assert.match(discovery, /Load the deeper planning surfaces only when the task touches their scope:/);
  assert.match(discovery, /\.harness\/specs\/2026-05-18-evals-executable-spine-spec\.md/);
  assert.match(discovery, /\.harness\/plans\/2026-05-18-evals-executable-spine-plan\.md/);
  assert.doesNotMatch(agents, /## Read Order/);
});

test("phase-one hard blocks stay consistent across public docs", () => {
  const fullHardBlocks = [
    /dashboard/i,
    /external adapter/i,
    /cloud runner/i,
    /telemetry/i,
    /plugin system/i,
    /source-mining/i,
    /LLM judge/i,
    /coding-harness/,
    /agent-skills/
  ];
  for (const [path, heading] of [
    ["AGENTS.md", "## Phase-One Hard Blocks"],
    ["README.md", "## Phase-One Hard Blocks"],
    ["CONTRIBUTING.md", "## Scope"]
  ]) {
    const body = section(read(path), heading);
    for (const pattern of fullHardBlocks) {
      assert.match(body, pattern, path + " should preserve " + pattern);
    }
  }

  const securityBoundary = section(read("SECURITY.md"), "## Dependency And Runtime Boundary");
  for (const pattern of [/network access/i, /cloud execution/i, /telemetry/i, /plugin systems/i, /LLM judge/i, /coding-harness/, /agent-skills/]) {
    assert.match(securityBoundary, pattern);
  }

  const supportBoundary = section(read("SUPPORT.md"), "## What This Repo Does Not Support Yet");
  for (const pattern of [/dashboard/i, /external adapter/i, /cloud runner/i, /telemetry/i, /plugin/i, /source-mining/i, /LLM judge/i, /sibling repos/i]) {
    assert.match(supportBoundary, pattern);
  }
});

test("canonical commands are documented where contributors and support agents need them", () => {
  const commandsByDoc = {
    "README.md": [
      "pnpm test",
      "pnpm evals run fixtures/smoke/pr-closeout.case.json --json",
      "pnpm evals check --json"
    ],
    "CONTRIBUTING.md": [
      "pnpm test",
      "pnpm evals run fixtures/smoke/pr-closeout.case.json --json",
      "pnpm evals check --json",
      "pnpm evals validate fixtures/smoke/pr-closeout.case.json --json",
      "pnpm evals validate .harness/evals/runs/latest.json --json"
    ],
    "SUPPORT.md": [
      "pnpm test",
      "pnpm evals run fixtures/smoke/pr-closeout.case.json --json",
      "pnpm evals check --json"
    ]
  };
  for (const [path, commands] of Object.entries(commandsByDoc)) {
    const content = read(path);
    for (const command of commands) {
      assert.match(content, literal(command));
    }
  }
});

test("privacy check regex is documented consistently", () => {
  const requiredFragments = ["rg -n", "sk-", "api[_-]?key", "BEGIN (RSA|OPENSSH|PRIVATE) KEY"];
  for (const path of ["AGENTS.md", "CONTRIBUTING.md", "SECURITY.md"]) {
    const content = read(path);
    for (const fragment of requiredFragments) {
      assert.ok(content.includes(fragment), path + " should include " + fragment);
    }
  }
});

test("tracker docs preserve override status without claiming a live issue", () => {
  for (const path of ["AGENTS.md", "README.md", "SUPPORT.md"]) {
    const content = read(path);
    assert.match(content, /override|approved local override|override_approved/i);
    assert.match(content, /do not|not a live Linear issue|does not create a Linear issue/i);
    assert.match(content, /create or link the Linear parent issue|recovery condition/i);
  }
});

test("public docs avoid machine-specific absolute paths", () => {
  for (const path of docs) {
    const content = read(path);
    assert.doesNotMatch(content, /\/Users\/jamiecraik/);
    assert.doesNotMatch(content, /\/home\//);
  }
});

test("review artifacts mark historical git blockers as superseded by live state", () => {
  for (const path of ["artifacts/reviews/review-coordination.md", "artifacts/reviews/testing-reviewer.md"]) {
    const content = read(path);
    assert.match(content, /Historical note:/);
    assert.match(content, /superseded/);
    assert.match(content, /git status/);
    assert.match(content, /--short --branch/);
  }
});

test("docs-expert evidence records the required docs and test command", () => {
  const content = read("artifacts/reviews/docs-expert.md");
  for (const expected of ["CONTRIBUTING.md", "SECURITY.md", "SUPPORT.md", "LICENSE.md", "pnpm test"]) {
    assert.match(content, literal(expected));
  }
});
