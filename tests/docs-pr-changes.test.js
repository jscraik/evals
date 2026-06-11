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
  "artifacts/reviews/docs-expert.md",
  "implementation-notes.html",
  ".harness/refactors/2026-05-20-local-observability-feedback-loop.md",
  ".harness/research/2026-05-19-mastering-ai-evaluation-playground-production-evidence.md",
  ".harness/research/audits/2026-05-20-evidence-led-codebase-gap-audit.md"
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

test("CI workflow runs the deterministic verification gate", () => {
  assert.ok(exists(".mise.toml"), "mise toolchain pin should exist");
  const mise = read(".mise.toml");
  assert.match(mise, /node = "26\.3\.0"/);

  assert.ok(exists(".github/workflows/ci.yml"), "CI workflow should exist");
  const workflow = read(".github/workflows/ci.yml");
  assert.match(workflow, /name: Deterministic Evals CI/);
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /push:/);
  assert.match(workflow, /push:[\s\S]*branches:[\s\S]*- main/);
  assert.match(workflow, /concurrency:/);
  assert.match(workflow, /cancel-in-progress: true/);
  assert.match(workflow, /name: deterministic-gates/);
  assert.match(workflow, /uses: actions\/checkout@[0-9a-f]{40}/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /uses: pnpm\/action-setup@[0-9a-f]{40}/);
  assert.match(workflow, /uses: actions\/setup-node@[0-9a-f]{40}/);
  assert.doesNotMatch(workflow, /uses: [^\n]+@v\d+/);
  assert.match(workflow, /node-version: "26\.3\.0"/);
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.match(workflow, /pnpm verify/);

  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.packageManager, "pnpm@11.2.0");
  assert.equal(pkg.scripts.verify, "node scripts/verify.js");
});

test("CI required check contract matches the workflow gate", () => {
  const workflow = read(".github/workflows/ci.yml");
  const contract = JSON.parse(read(".harness/ci-required-checks.json"));

  assert.equal(contract.schema_version, 1);
  assert.equal(contract.checks.length, 1);

  const [check] = contract.checks;
  assert.equal(check.name, "deterministic-gates");
  assert.equal(check.workflow, "Deterministic Evals CI");
  assert.equal(check.command, "pnpm verify");
  assert.deepEqual(check.triggers, ["pull_request", "push:main"]);

  assert.match(workflow, literal("name: " + check.workflow));
  assert.match(workflow, literal("name: " + check.name));
  assert.match(workflow, literal("run: " + check.command));
});

test("privacy check regex is documented consistently", () => {
  const requiredFragments = [
    "rg -n -o --replace",
    "credential-like pattern redacted",
    "sk-[A-Za-z0-9_-]{20,}",
    "(api[_-]?key|token|secret|password)\\s*[:=]\\s*",
    "fixtures schemas src scripts test tests .harness/evals .harness/research .harness/specs .harness/plan .harness/plans .harness/linear"
  ];
  for (const path of ["AGENTS.md", "CONTRIBUTING.md", "SECURITY.md"]) {
    const content = read(path);
    assert.equal(content.includes("\\\\s"), false, path + " must use executable single-backslash regex escapes");
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
  const absolutePathPatterns = [
    /\/Users\/[^/\s]+/i,
    /\/home\/[^/\s]+/i,
    /[A-Za-z]:\\Users\\[^\\\s]+/i
  ];
  for (const path of docs) {
    const content = read(path);
    for (const pattern of absolutePathPatterns) {
      assert.doesNotMatch(
        content,
        pattern,
        path + " must not contain absolute local filesystem paths"
      );
    }
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
