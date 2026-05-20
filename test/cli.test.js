import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { schemaCheck } from "../src/lib/schema.js";
import { verdictFor } from "../src/lib/scoring.js";

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
    encoding: "utf8",
    timeout: 30_000,
    killSignal: "SIGKILL"
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

function assertRepoRelativeArtifact(repo, output, key) {
  const artifactPath = output[key];
  assert.ok(artifactPath, key + " should be present in JSON output");
  assert.equal(artifactPath.startsWith("/"), false, key + " should be repository-relative");
  assert.equal(artifactPath.split(/[\\/]+/).includes(".."), false, key + " should not contain traversal segments");
  assert.ok(existsSync(join(repo, artifactPath)), key + " should point to an existing artifact");
}

test("run writes a valid local artifact bundle", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    assert.equal(output.status, "passed");
    assert.equal(output.verdict, "pass");
    assert.equal(output.execution_mode, "synthetic");
    for (const key of ["manifest_path", "result_path", "report_path", "command_log_path", "baseline_result_path", "scorer_results_path"]) {
      assertRepoRelativeArtifact(repo, output, key);
    }

    const commandLog = JSON.parse(readFileSync(join(repo, output.command_log_path), "utf8"));
    assert.equal(commandLog.execution_mode, "synthetic");
    assert.equal(commandLog.input_command, "simulate-pr-closeout");
    assert.equal("simulated_command" in commandLog, false);

    const result = JSON.parse(readFileSync(join(repo, output.result_path), "utf8"));
    assert.equal(result.execution_mode, "synthetic");

    const scorerResults = JSON.parse(readFileSync(join(repo, output.scorer_results_path), "utf8"));
    assert.ok(scorerResults.results.some((item) => item.scorer_id === "baseline-presence" && item.status === "pass"));

    const latest = JSON.parse(readFileSync(join(repo, ".harness", "evals", "runs", "latest.json"), "utf8"));
    assert.equal(latest.run_id, output.run_id);
    assert.equal(latest.execution_mode, "synthetic");
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

test("validate enforces the same phase-one policy contract as run", () => {
  const repo = makeRepo();
  try {
    const fixture = JSON.parse(readFileSync(smokeFixture(repo), "utf8"));
    fixture.input.command = "echo should-not-run";
    writeFileSync(join(repo, "fixtures", "smoke", "policy-invalid.case.json"), JSON.stringify(fixture, null, 2), "utf8");

    const validateResult = runCli(repo, ["validate", "fixtures/smoke/policy-invalid.case.json", "--json"]);
    assert.equal(validateResult.status, 1);
    assert.equal(validateResult.stderr, "");
    const validation = parseJson(validateResult.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /synthetic fixtures must use input.command simulate-pr-closeout/);

    const runResult = runCli(repo, ["run", "fixtures/smoke/policy-invalid.case.json", "--json"]);
    assert.equal(runResult.status, 1);
    const failure = parseJson(runResult.stdout);
    assert.equal(failure.status, "failed");
    assert.equal(failure.requirement, "case validation");
    assert.match(failure.errors.join("\n"), /synthetic fixtures must use input.command simulate-pr-closeout/);
  } finally {
    cleanup(repo);
  }
});

test("baseline presence is observed from artifact state", () => {
  const repo = makeRepo();
  try {
    const fixture = JSON.parse(readFileSync(smokeFixture(repo), "utf8"));
    fixture.baseline.expected_presence = "present";
    fixture.baseline.artifact_path = ".harness/evals/baselines/missing-baseline.json";
    writeFileSync(join(repo, "fixtures", "smoke", "missing-baseline.case.json"), JSON.stringify(fixture, null, 2), "utf8");

    const runResult = runCli(repo, ["run", "fixtures/smoke/missing-baseline.case.json", "--json"]);
    assert.equal(runResult.status, 1);
    const output = parseJson(runResult.stdout);
    assert.equal(output.status, "failed");

    const baseline = JSON.parse(readFileSync(join(repo, output.baseline_result_path), "utf8"));
    assert.equal(baseline.presence_status, "missing");
    assert.equal(baseline.comparison_status, "error");
    assert.match(baseline.comparison_evidence, /not observed/);

    const scorerResults = JSON.parse(readFileSync(join(repo, output.scorer_results_path), "utf8"));
    const baselineScorer = scorerResults.results.find((item) => item.scorer_id === "baseline-presence");
    assert.ok(baselineScorer, "baseline-presence scorer should be present");
    assert.equal(baselineScorer.status, "fail");
    assert.match(baselineScorer.failure_reason, /baseline presence/);
  } finally {
    cleanup(repo);
  }
});

test("non-object fixture roots return structured validation failures", () => {
  const repo = makeRepo();
  try {
    writeFileSync(join(repo, "fixtures", "smoke", "array.case.json"), "[]\n", "utf8");
    const result = runCli(repo, ["run", "fixtures/smoke/array.case.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const failure = parseJson(result.stdout);
    assert.equal(failure.status, "failed");
    assert.equal(failure.requirement, "case validation");
    assert.match(failure.errors.join("\n"), /case root must be a JSON object/);
  } finally {
    cleanup(repo);
  }
});

test("non-file baseline artifacts produce structured scorer failures", () => {
  const repo = makeRepo();
  try {
    const fixture = JSON.parse(readFileSync(smokeFixture(repo), "utf8"));
    fixture.baseline.expected_presence = "present";
    fixture.baseline.artifact_path = ".harness/evals";
    writeFileSync(join(repo, "fixtures", "smoke", "directory-baseline.case.json"), JSON.stringify(fixture, null, 2), "utf8");

    const runResult = runCli(repo, ["run", "fixtures/smoke/directory-baseline.case.json", "--json"]);
    assert.equal(runResult.status, 1);
    assert.equal(runResult.stderr, "");
    assert.doesNotMatch(runResult.stdout + runResult.stderr, /EISDIR|TypeError|Error:/);
    const output = parseJson(runResult.stdout);

    const baseline = JSON.parse(readFileSync(join(repo, output.baseline_result_path), "utf8"));
    assert.equal(baseline.presence_status, "missing");
    assert.equal(baseline.comparison_status, "error");
    assert.match(baseline.comparison_evidence, /not a readable file/);

    const scorerResults = JSON.parse(readFileSync(join(repo, output.scorer_results_path), "utf8"));
    const baselineScorer = scorerResults.results.find((item) => item.scorer_id === "baseline-presence");
    assert.ok(baselineScorer, "baseline-presence scorer should be present");
    assert.equal(baselineScorer.status, "fail");
  } finally {
    cleanup(repo);
  }
});

test("baseline-presence scorer requires an explicit baseline contract", () => {
  const repo = makeRepo();
  try {
    const fixture = JSON.parse(readFileSync(smokeFixture(repo), "utf8"));
    delete fixture.baseline;
    writeFileSync(join(repo, "fixtures", "smoke", "missing-baseline-contract.case.json"), JSON.stringify(fixture, null, 2), "utf8");

    const result = runCli(repo, ["validate", "fixtures/smoke/missing-baseline-contract.case.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /baseline is required when baseline-presence scorer is enabled/);
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

test("latest validation reports malformed manifest artifact lists without a stack trace", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const manifestPath = join(repo, output.manifest_path);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    manifest.artifacts = {};
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["validate", ".harness/evals/runs/latest.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /artifact manifest .*expected type array/);
    assert.doesNotMatch(result.stdout + result.stderr, /TypeError:/);
  } finally {
    cleanup(repo);
  }
});

test("unknown schema keys and empty scorer sets fail closed", () => {
  const schemaResult = schemaCheck("missing-schema", "fixtures/smoke/pr-closeout.case.json");
  assert.equal(schemaResult.status, "fail");
  assert.match(schemaResult.errors.join("\n"), /unknown schema target/);

  assert.equal(verdictFor([]), "fail");
  assert.equal(verdictFor(null), "fail");
});
