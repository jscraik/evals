import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { schemaCheck, schemaCheckFromObject } from "../src/lib/schema.js";
import { verdictFor } from "../src/lib/scoring.js";
import { requiredTraceEventTypes } from "../src/lib/trace-events.js";

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
    for (const key of ["manifest_path", "result_path", "report_path", "command_log_path", "baseline_result_path", "scorer_results_path", "trace_events_path"]) {
      assertRepoRelativeArtifact(repo, output, key);
    }

    const commandLog = JSON.parse(readFileSync(join(repo, output.command_log_path), "utf8"));
    assert.equal(commandLog.execution_mode, "synthetic");
    assert.equal(commandLog.input_command, "simulate-pr-closeout");
    assert.equal("simulated_command" in commandLog, false);

    const result = JSON.parse(readFileSync(join(repo, output.result_path), "utf8"));
    assert.equal(result.execution_mode, "synthetic");
    assert.equal(result.trace_events_path, output.trace_events_path);
    assert.ok(result.artifact_refs.some((artifact) => artifact.type === "trace-events" && artifact.path === output.trace_events_path));

    const scorerResults = JSON.parse(readFileSync(join(repo, output.scorer_results_path), "utf8"));
    assert.ok(scorerResults.results.some((item) => item.scorer_id === "baseline-presence" && item.status === "pass"));

    const traceEvents = readFileSync(join(repo, output.trace_events_path), "utf8")
      .trim()
      .split(/\r?\n/)
      .map((line) => JSON.parse(line));
    assert.deepEqual(traceEvents.map((event) => event.event_type), requiredTraceEventTypes);
    assert.deepEqual(traceEvents.map((event) => event.sequence), [1, 2, 3, 4, 5, 6, 7]);
    assert.ok(traceEvents.every((event) => event.run_id === output.run_id));

    const latest = JSON.parse(readFileSync(join(repo, ".harness", "evals", "runs", "latest.json"), "utf8"));
    assert.equal(latest.run_id, output.run_id);
    assert.equal(latest.execution_mode, "synthetic");
    assert.ok(latest.baseline_result_path);
    assert.ok(latest.scorer_results_path);
    assert.equal(latest.trace_events_path, output.trace_events_path);

    const checkResult = runCli(repo, ["check", "--json"]);
    assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
    const validation = parseJson(checkResult.stdout);
    assert.ok(validation.checks.some((check) => check.label === "latest run" && check.status === "pass"));
    assert.ok(validation.checks.some((check) => check.label === "trace events" && check.status === "pass"));
    assert.ok(validation.checks.some((check) => check.label === "closure latest consistency" && check.status === "pass"));
  } finally {
    cleanup(repo);
  }
});

test("state reports ready runtime packet for the latest proof bundle", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const result = runCli(repo, ["state", "--json"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const state = parseJson(result.stdout);
    assert.equal(state.status, "ready");
    assert.equal(state.latest.status, "present");
    assert.equal(state.latest.run_id, output.run_id);
    assert.equal(state.validation.status, "passed");
    assert.ok(state.recommended_commands.includes("pnpm evals check --json"));
    assert.ok(state.artifacts.every((artifact) => artifact.status === "present"));

    const schemaResult = schemaCheckFromObject("state", state, ".harness/evals/runs/latest.json");
    assert.equal(schemaResult.status, "pass", schemaResult.errors.join("\n"));
  } finally {
    cleanup(repo);
  }
});

test("state reports missing runtime packet without failing the command", () => {
  const repo = makeRepo();
  try {
    const result = runCli(repo, ["state", "--json"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const state = parseJson(result.stdout);
    assert.equal(state.status, "missing");
    assert.equal(state.latest.status, "missing");
    assert.equal(state.validation.status, "not_run");
    assert.ok(state.recommended_commands.includes("pnpm evals run fixtures/smoke/pr-closeout.case.json --json"));

    const schemaResult = schemaCheckFromObject("state", state, ".harness/evals/runs/latest.json");
    assert.equal(schemaResult.status, "pass", schemaResult.errors.join("\n"));
  } finally {
    cleanup(repo);
  }
});

test("state reports stale runtime packet when latest artifacts are missing", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    rmSync(join(repo, output.result_path));

    const result = runCli(repo, ["state", "--json"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const state = parseJson(result.stdout);
    assert.equal(state.status, "stale");
    assert.equal(state.latest.run_id, output.run_id);
    assert.equal(state.validation.status, "failed");
    const resultArtifact = state.artifacts.find((artifact) => artifact.key === "result_path");
    assert.ok(resultArtifact);
    assert.equal(resultArtifact.status, "missing");
    assert.match(resultArtifact.reason, /path does not exist/);

    const schemaResult = schemaCheckFromObject("state", state, ".harness/evals/runs/latest.json");
    assert.equal(schemaResult.status, "pass", schemaResult.errors.join("\n"));
  } finally {
    cleanup(repo);
  }
});

test("state reports invalid runtime packet for unsafe latest artifact paths", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    const latest = JSON.parse(readFileSync(latestPath, "utf8"));
    latest.result_path = "../outside.json";
    writeFileSync(latestPath, JSON.stringify(latest, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["state", "--json"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const state = parseJson(result.stdout);
    assert.equal(state.status, "invalid");
    assert.equal(state.validation.status, "failed");
    const resultArtifact = state.artifacts.find((artifact) => artifact.key === "result_path");
    assert.ok(resultArtifact);
    assert.equal(resultArtifact.status, "invalid");
    assert.match(resultArtifact.reason, /must not contain traversal segments/);

    const schemaResult = schemaCheckFromObject("state", state, ".harness/evals/runs/latest.json");
    assert.equal(schemaResult.status, "pass", schemaResult.errors.join("\n"));
  } finally {
    cleanup(repo);
  }
});

test("state reports invalid runtime packet for malformed latest JSON", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    writeFileSync(latestPath, "{", "utf8");

    const result = runCli(repo, ["state", "--json"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const state = parseJson(result.stdout);
    assert.equal(state.status, "invalid");
    assert.equal(state.latest.status, "invalid");
    assert.equal(state.validation.status, "failed");
    assert.match(state.validation.errors.join("\n"), /JSON parse failed/);

    const schemaResult = schemaCheckFromObject("state", state, ".harness/evals/runs/latest.json");
    assert.equal(schemaResult.status, "pass", schemaResult.errors.join("\n"));
  } finally {
    cleanup(repo);
  }
});

test("state reports invalid runtime packet for schema-invalid latest pointers", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    const latest = JSON.parse(readFileSync(latestPath, "utf8"));
    delete latest.run_id;
    writeFileSync(latestPath, JSON.stringify(latest, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["state", "--json"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const state = parseJson(result.stdout);
    assert.equal(state.status, "invalid");
    assert.equal(state.latest.status, "invalid");
    assert.equal(state.latest.run_id, null);
    assert.equal(state.validation.status, "failed");
    assert.match(state.validation.errors.join("\n"), /run_id/);

    const schemaResult = schemaCheckFromObject("state", state, ".harness/evals/runs/latest.json");
    assert.equal(schemaResult.status, "pass", schemaResult.errors.join("\n"));
  } finally {
    cleanup(repo);
  }
});

test("state outputs human-readable format without --json flag", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const result = runCli(repo, ["state"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /^status:\s+ready$/m);
    assert.match(result.stdout, /^latest:\s+\.harness\/evals\/runs\/latest\.json$/m);
    assert.match(result.stdout, new RegExp(`^run_id:\\s+${output.run_id}$`, "m"));
    assert.match(result.stdout, /^validation:\s+passed$/m);
    assert.match(result.stdout, /^next:\s+pnpm evals check --json$/m);
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

test("latest validation permits present baseline artifact references", () => {
  const repo = makeRepo();
  try {
    const baselinePath = join(repo, ".harness", "evals", "baselines", "present-baseline.json");
    mkdirSync(dirname(baselinePath), { recursive: true });
    writeFileSync(baselinePath, JSON.stringify({ status: "approved" }, null, 2) + "\n", "utf8");

    const fixture = JSON.parse(readFileSync(smokeFixture(repo), "utf8"));
    fixture.baseline.expected_presence = "present";
    fixture.baseline.artifact_path = ".harness/evals/baselines/present-baseline.json";
    writeFileSync(join(repo, "fixtures", "smoke", "present-baseline.case.json"), JSON.stringify(fixture, null, 2), "utf8");

    const runResult = runCli(repo, ["run", "fixtures/smoke/present-baseline.case.json", "--json"]);
    assert.equal(runResult.status, 0, runResult.stderr || runResult.stdout);
    const output = parseJson(runResult.stdout);

    const baseline = JSON.parse(readFileSync(join(repo, output.baseline_result_path), "utf8"));
    assert.equal(baseline.presence_status, "present");
    assert.equal(baseline.current_artifact_ref.type, "baseline-artifact");
    assert.equal(baseline.current_artifact_ref.path, ".harness/evals/baselines/present-baseline.json");

    const checkResult = runCli(repo, ["check", "--json"]);
    assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
    const validation = parseJson(checkResult.stdout);
    assert.ok(validation.checks.some((check) => check.label === "closure latest consistency" && check.status === "pass"));
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects baseline-artifact hash drift", () => {
  const repo = makeRepo();
  try {
    const baselinePath = join(repo, ".harness", "evals", "baselines", "present-baseline.json");
    mkdirSync(dirname(baselinePath), { recursive: true });
    writeFileSync(baselinePath, JSON.stringify({ status: "approved" }, null, 2) + "\n", "utf8");

    const fixture = JSON.parse(readFileSync(smokeFixture(repo), "utf8"));
    fixture.baseline.expected_presence = "present";
    fixture.baseline.artifact_path = ".harness/evals/baselines/present-baseline.json";
    writeFileSync(join(repo, "fixtures", "smoke", "present-baseline-hash-drift.case.json"), JSON.stringify(fixture, null, 2), "utf8");

    const runResult = runCli(repo, ["run", "fixtures/smoke/present-baseline-hash-drift.case.json", "--json"]);
    assert.equal(runResult.status, 0, runResult.stderr || runResult.stdout);

    writeFileSync(baselinePath, JSON.stringify({ status: "tampered" }, null, 2) + "\n", "utf8");

    const checkResult = runCli(repo, ["check", "--json"]);
    assert.equal(checkResult.status, 1);
    const validation = parseJson(checkResult.stdout);
    assert.match(validation.errors.join("\n"), /baseline current_artifact_ref\.sha256 does not match baseline artifact/);
    assert.ok(validation.checks.some((check) => check.label === "closure latest consistency" && check.status === "fail"));
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

test("latest validation rejects missing latest schema fields before artifact reads", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    const latest = JSON.parse(readFileSync(latestPath, "utf8"));
    delete latest.result_path;
    writeFileSync(latestPath, JSON.stringify(latest, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /latest run .*result_path.*missing required property/);
    assert.ok(validation.checks.some((check) => check.label === "latest run" && check.status === "fail"));
    assert.equal(validation.checks.some((check) => check.label === "eval result"), false);
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects additional latest schema fields", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    const latest = JSON.parse(readFileSync(latestPath, "utf8"));
    latest.unexpected = "drift";
    writeFileSync(latestPath, JSON.stringify(latest, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["validate", ".harness/evals/runs/latest.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /latest run .*unexpected.*additional property is not allowed/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects non-object latest roots at the schema gate", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    writeFileSync(latestPath, "[]\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /latest run .*expected type object/);
    assert.equal(validation.checks.some((check) => check.label === "eval result"), false);
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects unknown execution modes before artifact reads", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    const latest = JSON.parse(readFileSync(latestPath, "utf8"));
    latest.execution_mode = "pretend";
    writeFileSync(latestPath, JSON.stringify(latest, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["validate", ".harness/evals/runs/latest.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /latest run .*execution_mode.*expected one of synthetic, real/);
    assert.equal(validation.checks.some((check) => check.label === "eval result"), false);
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

test("latest validation rejects artifact paths outside the current run bundle", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    const latest = JSON.parse(readFileSync(latestPath, "utf8"));
    const foreignRunDir = join(repo, ".harness", "evals", "runs", "foreign-" + latest.run_id);
    mkdirSync(foreignRunDir, { recursive: true });
    cpSync(join(repo, output.result_path), join(foreignRunDir, "result.json"));
    latest.result_path = ".harness/evals/runs/foreign-" + latest.run_id + "/result.json";
    writeFileSync(latestPath, JSON.stringify(latest, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /latest\.result_path: expected .*\/result\.json for run_id/);
    assert.ok(validation.checks.some((check) => check.label === "closure latest consistency" && check.status === "fail"));
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects manifests missing required closure artifacts", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const manifestPath = join(repo, output.manifest_path);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    manifest.artifacts = manifest.artifacts.filter((artifact) => artifact.type !== "command-log");
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["validate", ".harness/evals/runs/latest.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /manifest missing required artifact: command-log/);
    assert.ok(validation.checks.some((check) => check.label === "closure latest consistency" && check.status === "fail"));
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects manifest and result metadata drift", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const manifestPath = join(repo, output.manifest_path);
    const resultPath = join(repo, output.result_path);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const resultArtifact = JSON.parse(readFileSync(resultPath, "utf8"));
    manifest.run_id = "different-run";
    resultArtifact.execution_mode = "real";
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
    writeFileSync(resultPath, JSON.stringify(resultArtifact, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["validate", ".harness/evals/runs/latest.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /manifest\.run_id: expected/);
    assert.match(validation.errors.join("\n"), /result\.execution_mode: expected synthetic, got real/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects result artifact ref hash drift", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const resultPath = join(repo, output.result_path);
    const resultArtifact = JSON.parse(readFileSync(resultPath, "utf8"));
    resultArtifact.artifact_refs.find((artifact) => artifact.type === "report").sha256 = "0".repeat(64);
    writeFileSync(resultPath, JSON.stringify(resultArtifact, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /result report artifact_ref sha256 does not match manifest/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects malformed trace event JSON", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    writeFileSync(join(repo, output.trace_events_path), "{\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /trace events line 1: JSON parse failed/);
    assert.ok(validation.checks.some((check) => check.label === "trace events" && check.status === "fail"));
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects incomplete trace event timelines", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const tracePath = join(repo, output.trace_events_path);
    const lines = readFileSync(tracePath, "utf8").trim().split(/\r?\n/);
    writeFileSync(tracePath, lines.slice(0, -1).join("\n") + "\n", "utf8");

    const result = runCli(repo, ["validate", ".harness/evals/runs/latest.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /trace event 7: expected run_finished, got missing/);
    assert.match(validation.errors.join("\n"), /trace events: expected 7 events, got 6/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects trace validation-result drift", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const tracePath = join(repo, output.trace_events_path);
    const events = readFileSync(tracePath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
    events.find((event) => event.event_type === "validation_result").status = "failed";
    writeFileSync(tracePath, events.map((event) => JSON.stringify(event)).join("\n") + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /trace validation_result status: expected passed, got failed/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects trace identity drift", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const tracePath = join(repo, output.trace_events_path);
    const events = readFileSync(tracePath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
    events[2].run_id = "different-run";
    events[3].case_id = "different-case";
    writeFileSync(tracePath, events.map((event) => JSON.stringify(event)).join("\n") + "\n", "utf8");

    const result = runCli(repo, ["validate", ".harness/evals/runs/latest.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /trace event 3: expected run_id/);
    assert.match(validation.errors.join("\n"), /trace event 4: expected case_id/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects unsafe trace artifact paths", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const tracePath = join(repo, output.trace_events_path);
    const events = readFileSync(tracePath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
    events[1].artifact_path = "../outside-command-log.json";
    writeFileSync(tracePath, events.map((event) => JSON.stringify(event)).join("\n") + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /trace event 2 artifact_path: path must not contain traversal segments/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects baseline command-log linkage drift", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const baselinePath = join(repo, output.baseline_result_path);
    const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
    baseline.current_artifact_ref.path = output.report_path;
    writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["validate", ".harness/evals/runs/latest.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /baseline current_artifact_ref\.path: expected/);
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

// --- Unit tests for schemaCheck("latest", ...) and the latest-run.schema.json contract ---

function withTempJson(data, fn) {
  const dir = mkdtempSync(join(tmpdir(), "latest-schema-unit-"));
  const filePath = join(dir, "latest.json");
  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
    return fn(filePath);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const validLatestPointer = {
  run_id: "20260520T191834Z-pr-closeout-4df36134",
  case_id: "pr-closeout",
  execution_mode: "synthetic",
  manifest_path: ".harness/evals/runs/20260520T191834Z-pr-closeout-4df36134/manifest.json",
  result_path: ".harness/evals/runs/20260520T191834Z-pr-closeout-4df36134/result.json",
  report_path: ".harness/evals/runs/20260520T191834Z-pr-closeout-4df36134/report.md",
  command_log_path: ".harness/evals/runs/20260520T191834Z-pr-closeout-4df36134/command-log.json",
  baseline_result_path: ".harness/evals/runs/20260520T191834Z-pr-closeout-4df36134/baseline-result.json",
  scorer_results_path: ".harness/evals/runs/20260520T191834Z-pr-closeout-4df36134/scorer-results.json",
  trace_events_path: ".harness/evals/runs/20260520T191834Z-pr-closeout-4df36134/trace-events.jsonl"
};

test("schemaCheck latest passes for a fully valid latest pointer", () => {
  withTempJson(validLatestPointer, (filePath) => {
    const result = schemaCheck("latest", filePath);
    assert.equal(result.status, "pass");
    assert.equal(result.label, "latest run");
    assert.deepEqual(result.errors, []);
  });
});

test("schemaCheck latest label is latest run (schemaTargets.latest entry)", () => {
  withTempJson(validLatestPointer, (filePath) => {
    const result = schemaCheck("latest", filePath);
    assert.equal(result.label, "latest run");
    assert.ok(result.schema_path.includes("latest-run.schema.json"));
  });
});

test("schemaCheck latest fails for empty string run_id (minLength: 1)", () => {
  withTempJson({ ...validLatestPointer, run_id: "" }, (filePath) => {
    const result = schemaCheck("latest", filePath);
    assert.equal(result.status, "fail");
    assert.ok(result.errors.some((e) => /run_id/.test(e) && /length/.test(e)));
  });
});

test("schemaCheck latest fails for missing case_id required field", () => {
  const data = { ...validLatestPointer };
  delete data.case_id;
  withTempJson(data, (filePath) => {
    const result = schemaCheck("latest", filePath);
    assert.equal(result.status, "fail");
    assert.ok(result.errors.some((e) => /case_id/.test(e) && /missing required property/.test(e)));
  });
});

test("schemaCheck latest fails for missing manifest_path required field", () => {
  const data = { ...validLatestPointer };
  delete data.manifest_path;
  withTempJson(data, (filePath) => {
    const result = schemaCheck("latest", filePath);
    assert.equal(result.status, "fail");
    assert.ok(result.errors.some((e) => /manifest_path/.test(e) && /missing required property/.test(e)));
  });
});

test("schemaCheck latest passes for execution_mode real", () => {
  withTempJson({ ...validLatestPointer, execution_mode: "real" }, (filePath) => {
    const result = schemaCheck("latest", filePath);
    assert.equal(result.status, "pass");
    assert.deepEqual(result.errors, []);
  });
});

test("schemaCheck latest fails for non-string baseline_result_path", () => {
  withTempJson({ ...validLatestPointer, baseline_result_path: 42 }, (filePath) => {
    const result = schemaCheck("latest", filePath);
    assert.equal(result.status, "fail");
    assert.ok(result.errors.some((e) => /baseline_result_path/.test(e) && /expected type string/.test(e)));
  });
});

test("schemaCheck latest fails for empty string scorer_results_path (minLength: 1)", () => {
  withTempJson({ ...validLatestPointer, scorer_results_path: "" }, (filePath) => {
    const result = schemaCheck("latest", filePath);
    assert.equal(result.status, "fail");
    assert.ok(result.errors.some((e) => /scorer_results_path/.test(e) && /length/.test(e)));
  });
});

test("schemaCheck latest fails for null execution_mode", () => {
  withTempJson({ ...validLatestPointer, execution_mode: null }, (filePath) => {
    const result = schemaCheck("latest", filePath);
    assert.equal(result.status, "fail");
    assert.ok(result.errors.some((e) => /execution_mode/.test(e)));
  });
});

test("latest validation schema gate fails for missing run_id before artifact reads", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    const latest = JSON.parse(readFileSync(latestPath, "utf8"));
    delete latest.run_id;
    writeFileSync(latestPath, JSON.stringify(latest, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /latest run .*run_id.*missing required property/);
    assert.ok(validation.checks.some((check) => check.label === "latest run" && check.status === "fail"));
    assert.equal(validation.checks.some((check) => check.label === "eval result"), false);
  } finally {
    cleanup(repo);
  }
});

test("latest validation schema gate fails for empty string path field before artifact reads", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    const latest = JSON.parse(readFileSync(latestPath, "utf8"));
    latest.command_log_path = "";
    writeFileSync(latestPath, JSON.stringify(latest, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["validate", ".harness/evals/runs/latest.json", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.match(validation.errors.join("\n"), /latest run .*command_log_path.*length/);
    assert.ok(validation.checks.some((check) => check.label === "latest run" && check.status === "fail"));
    assert.equal(validation.checks.some((check) => check.label === "eval result"), false);
  } finally {
    cleanup(repo);
  }
});
