import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { validateArchitectureBoundaries } from "../scripts/validate-architecture.js";

function withTempRepo(callback) {
  const repo = mkdtempSync(join(tmpdir(), "evals-architecture-"));
  try {
    writeFile(repo, "package.json", JSON.stringify({ type: "module", dependencies: {}, devDependencies: {} }, null, 2));
    return callback(repo);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
}

function writeFile(root, path, content) {
  const filePath = join(root, path);
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, content);
  return filePath;
}

function assertBoundaryFailure(root, path, source, expectedMessage) {
  writeFile(root, path, source);
  const result = validateArchitectureBoundaries({ root });
  assert.equal(result.status, "fail");
  assert.match(result.errors.join("\n"), expectedMessage);
}

test("current repository satisfies mechanical architecture boundaries", () => {
  const result = validateArchitectureBoundaries();

  assert.deepEqual(result.errors, []);
  assert.equal(result.status, "pass");
});

test("architecture boundary rejects lib-to-command back edges", () => {
  withTempRepo((repo) => {
    writeFile(repo, "src/commands/run.js", "export const run = 1;\n");
    assertBoundaryFailure(repo, "src/lib/back-edge.js", "import { run } from '../commands/run.js';\n", /src\/lib\/.*must not import upward/);
  });
});

test("architecture boundary rejects cli imports outside command modules", () => {
  withTempRepo((repo) => {
    writeFile(repo, "src/lib/schema.js", "export const schema = 1;\n");
    assertBoundaryFailure(repo, "src/cli.js", "import { schema } from './lib/schema.js';\n", /src\/cli\.js may import command modules only/);
  });
});

test("architecture boundary rejects command-to-command imports", () => {
  withTempRepo((repo) => {
    writeFile(repo, "src/commands/state.js", "export const state = 1;\n");
    assertBoundaryFailure(repo, "src/commands/run.js", "import { state } from './state.js';\n", /command modules may import src\/lib/);
  });
});

test("architecture boundary rejects hard-blocked sibling repo imports", () => {
  withTempRepo((repo) => {
    assertBoundaryFailure(repo, "src/lib/runtime.js", "import helper from 'agent-skills/runtime';\n", /agent-skills is phase-one blocked/);
  });
});

test("architecture boundary rejects non-literal dynamic imports", () => {
  withTempRepo((repo) => {
    assertBoundaryFailure(repo, "src/lib/runtime.js", "const target = '../commands/run.js';\nawait import(target);\n", /non-literal dynamic import is not allowed/);
  });
});

test("architecture boundary allows multiline literal dynamic imports", () => {
  withTempRepo((repo) => {
    writeFile(repo, "src/lib/helper.js", "export const helper = 1;\n");
    writeFile(repo, "src/lib/runtime.js", "const helper = await import(\n  './helper.js'\n);\nexport const runtime = helper;\n");

    const result = validateArchitectureBoundaries({ root: repo });

    assert.deepEqual(result.errors, []);
    assert.equal(result.status, "pass");
  });
});

test("architecture boundary allows multiline literal require calls", () => {
  withTempRepo((repo) => {
    writeFile(repo, "src/lib/runtime.js", "const fs = require(\n  'node:fs'\n);\nexport const runtime = fs;\n");

    const result = validateArchitectureBoundaries({ root: repo });

    assert.deepEqual(result.errors, []);
    assert.equal(result.status, "pass");
  });
});

test("architecture boundary rejects require-based blocked runtime loads", () => {
  withTempRepo((repo) => {
    assertBoundaryFailure(repo, "src/lib/runtime.js", "const helper = require('agent-skills/runtime');\n", /agent-skills is phase-one blocked/);
  });
});

test("architecture boundary rejects createRequire runtime loading", () => {
  withTempRepo((repo) => {
    assertBoundaryFailure(
      repo,
      "src/lib/runtime.js",
      "import { createRequire } from 'node:module';\nconst require = createRequire(import.meta.url);\nrequire('agent-skills/runtime');\n",
      /createRequire is not allowed/
    );
  });
});

test("architecture boundary ignores comment-only runtime loader mentions", () => {
  withTempRepo((repo) => {
    writeFile(
      repo,
      "src/lib/runtime.js",
      "// createRequire(import.meta.url)\n// await import(target)\n/* require('agent-skills/runtime') */\nexport const runtime = 1;\n"
    );

    const result = validateArchitectureBoundaries({ root: repo });

    assert.equal(result.status, "pass");
    assert.deepEqual(result.errors, []);
  });
});

test("architecture boundary rejects hard-blocked package dependencies", () => {
  withTempRepo((repo) => {
    writeFile(repo, "package.json", JSON.stringify({ type: "module", dependencies: { "@opentelemetry/api": "1.0.0" } }, null, 2));

    const result = validateArchitectureBoundaries({ root: repo });

    assert.equal(result.status, "fail");
    assert.match(result.errors.join("\n"), /telemetry collectors\/exporters cannot become phase-one authority/);
  });
});
