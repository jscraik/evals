import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function makeRepo() {
  const repo = mkdtempSync(join(tmpdir(), "evals-cli-test-"));
  for (const entry of ["src", "schemas", "fixtures"]) {
    cpSync(join(sourceRoot, entry), join(repo, entry), { recursive: true });
  }
  return repo;
}

function cleanup(repo) {
  rmSync(repo, { recursive: true, force: true });
}

function runCli(repo, args) {
  return spawnSync(process.execPath, [join(repo, "src", "cli.js"), ...args], {
    cwd: repo,
    encoding: "utf8"
  });
}

function parseJson(stdout) {
  assert.doesNotThrow(() => JSON.parse(stdout), stdout);
  return JSON.parse(stdout);
}

function smokeFixture(repo) {
  return join(repo, "fixtures", "smoke", "pr-closeout.case.json");
}

function runPassingSmoke(repo) {
  const result = runCli(repo, ["run", "fixtures/smoke/pr-closeout.case.json", "--json"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return parseJson(result.stdout);
}

test("run writes a valid local artifact bundle", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    assert.equal(output.status, "passed");
    assert.equal(output.verdict, "pass");
    for (const key of ["manifest_path", "result_path", "report_path", "command_log_path", "baseline_result_path", "scorer_results_path"]) {
      assert.ok(output[key], key + " should be present in JSON output");
      assert.ok(existsSync(join(repo, output[key])), key + " should point to an existing artifact");
    }

    const latest = JSON.parse(readFileSync(join(repo, ".harness", "evals", "runs", "latest.json"), "utf8"));
    assert.equal(latest.run_id, output.run_id);
    assert.ok(latest.baseline_result_path);
    assert.ok(latest.scorer_results_path);
  } finally {
    cleanup(repo);
  }
});

test("missing fixture returns a structured failure", () => {
  const repo = makeRepo();
  try {
    const result = runCli(repo, ["run", "fixtures/smoke/missing.case.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const failure = parseJson(result.stdout);
    assert.equal(failure.status, "failed");
    assert.equal(failure.requirement, "case path");
    assert.match(failure.errors.join("\n"), /case file does not exist/);
  } finally {
    cleanup(repo);
  }
});

test("malformed fixture JSON returns a structured failure", () => {
  const repo = makeRepo();
  try {
    writeFileSync(join(repo, "fixtures", "smoke", "malformed.case.json"), "{", "utf8");
    const result = runCli(repo, ["run", "fixtures/smoke/malformed.case.json", "--json"]);
    assert.equal(result.status, 1);
    const failure = parseJson(result.stdout);
    assert.equal(failure.status, "failed");
    assert.equal(failure.requirement, "case parse");
    assert.match(failure.errors.join("\n"), /JSON/);
  } finally {
    cleanup(repo);
  }
});

test("case path traversal is rejected before file reads", () => {
  const repo = makeRepo();
  try {
    const result = runCli(repo, ["run", "../outside.json", "--json"]);
    assert.equal(result.status, 1);
    const failure = parseJson(result.stdout);
    assert.equal(failure.status, "failed");
    assert.equal(failure.requirement, "case path");
    assert.match(failure.errors.join("\n"), /inside the evals repository/);
  } finally {
    cleanup(repo);
  }
});

test("validate path traversal returns a structured failure", () => {
  const repo = makeRepo();
  try {
    const result = runCli(repo, ["validate", "../outside.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const failure = parseJson(result.stdout);
    assert.equal(failure.status, "failed");
    assert.equal(failure.requirement, "validation target path");
    assert.match(failure.errors.join("\n"), /inside the evals repository/);
  } finally {
    cleanup(repo);
  }
});

test("invalid fixture fields fail schema and policy validation", () => {
  const repo = makeRepo();
  try {
    const fixture = JSON.parse(readFileSync(smokeFixture(repo), "utf8"));
    fixture.case_id = "Bad Case";
    fixture.fixture_source.type = "private-export";
    writeFileSync(join(repo, "fixtures", "smoke", "invalid.case.json"), JSON.stringify(fixture, null, 2), "utf8");

    const result = runCli(repo, ["run", "fixtures/smoke/invalid.case.json", "--json"]);
    assert.equal(result.status, 1);
    const failure = parseJson(result.stdout);
    assert.equal(failure.status, "failed");
    assert.equal(failure.requirement, "case validation");
    assert.match(failure.errors.join("\n"), /case_id/);
    assert.match(failure.errors.join("\n"), /synthetic/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects traversal in latest.json artifact pointers", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    const latest = JSON.parse(readFileSync(latestPath, "utf8"));
    latest.result_path = "../../outside-result.json";
    writeFileSync(latestPath, JSON.stringify(latest, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /latest\.result_path: path must not contain traversal segments/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects absolute paths in latest.json artifact pointers", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    const latest = JSON.parse(readFileSync(latestPath, "utf8"));
    latest.result_path = join(repo, output.result_path);
    writeFileSync(latestPath, JSON.stringify(latest, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["validate", ".harness/evals/runs/latest.json", "--json"]);
    assert.equal(result.status, 1);
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /latest\.result_path: path must be repository-relative/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects traversal in manifest artifact paths before hashing", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const manifestPath = join(repo, output.manifest_path);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    manifest.artifacts[0].path = "../../outside-result.json";
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["validate", ".harness/evals/runs/latest.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /manifest artifact path: path must not contain traversal segments/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation reports manifest hash mismatches", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    writeFileSync(join(repo, output.result_path), JSON.stringify({ changed: true }, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["validate", ".harness/evals/runs/latest.json", "--json"]);
    assert.equal(result.status, 1);
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /manifest hash mismatch/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation reports malformed artifact JSON without a stack trace", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    writeFileSync(join(repo, output.result_path), "{", "utf8");

    const result = runCli(repo, ["validate", ".harness/evals/runs/latest.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /JSON parse failed/);
    assert.doesNotMatch(result.stdout + result.stderr, /SyntaxError:/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation reports malformed manifest JSON without a stack trace", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    writeFileSync(join(repo, output.manifest_path), "{", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /artifact manifest JSON parse failed|JSON parse failed/);
    assert.doesNotMatch(result.stdout + result.stderr, /SyntaxError:/);
  } finally {
    cleanup(repo);
  }
});
