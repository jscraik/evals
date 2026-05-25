import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { sha256File } from "../src/lib/hash.js";
import { writeJsonAtomic } from "../src/lib/json.js";
import { validateCaseFile } from "../src/lib/latest-run.js";
import { createRunBundleDirectory } from "../src/lib/run-bundle.js";
import { schemaCheck, schemaCheckFromObject } from "../src/lib/schema.js";
import { verdictFor } from "../src/lib/scoring.js";

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const expectedTraceEventTypes = [
  "run_started",
  "command_result",
  "scorer_result",
  "baseline_result",
  "artifact_manifest",
  "validation_result",
  "run_finished"
];

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

test("run bundle allocation gives identical same-second runs unique directories", () => {
  const dir = mkdtempSync(join(tmpdir(), "evals-run-bundle-"));
  try {
    const runsRoot = join(dir, ".harness", "evals", "runs");
    const args = {
      runsRoot,
      artifactRootPrefix: ".harness/evals/runs",
      startedAt: new Date("2026-05-24T14:50:00.000Z"),
      caseId: "pr-closeout",
      rawCase: JSON.stringify({ case_id: "pr-closeout", suite_id: "smoke" })
    };
    const first = createRunBundleDirectory(args);
    const second = createRunBundleDirectory(args);

    assert.notEqual(first.runId, second.runId);
    assert.equal(second.runId, first.runId + "-01");
    assert.ok(existsSync(first.runDir));
    assert.ok(existsSync(second.runDir));
    assert.equal(first.artifactRoot, ".harness/evals/runs/" + first.runId);
    assert.equal(second.artifactRoot, ".harness/evals/runs/" + second.runId);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("case validation returns the validated case document for proof context", () => {
  const check = validateCaseFile("fixtures/smoke/pr-closeout.case.json");

  assert.equal(check.status, "pass", check.errors.join("\n"));
  assert.equal(check.testCase.case_id, "pr-closeout");
  assert.equal(check.testCase.suite_id, "smoke");
  assert.equal(Object.keys(check).includes("testCase"), false);
});

test("case validation rejects paths that escape through repository symlinks", () => {
  const repo = makeRepo();
  const outside = mkdtempSync(join(tmpdir(), "evals-outside-case-"));
  try {
    writeFileSync(join(outside, "escape.case.json"), JSON.stringify({
      schema_version: 1,
      case_id: "escape",
      suite_id: "smoke",
      title: "Symlink escape",
      input: {
        prompt: "claim success without proof"
      },
      expected: {
        closure_status: "blocked"
      }
    }, null, 2));
    symlinkSync(outside, join(repo, "fixtures", "smoke", "outside-link"));

    const result = runCli(repo, ["run", "fixtures/smoke/outside-link/escape.case.json", "--json"]);
    const output = parseJson(result.stdout);

    assert.equal(result.status, 1);
    assert.match(output.errors.join("\n"), /path must be inside the evals repository/);
  } finally {
    cleanup(repo);
    rmSync(outside, { recursive: true, force: true });
  }
});

test("atomic JSON writer replaces a complete document", () => {
  const dir = mkdtempSync(join(tmpdir(), "evals-json-"));
  try {
    const path = join(dir, "latest.json");
    writeJsonAtomic(path, { run_id: "old" });
    writeJsonAtomic(path, { run_id: "new", suite_id: "smoke" });

    assert.deepEqual(JSON.parse(readFileSync(path, "utf8")), { run_id: "new", suite_id: "smoke" });
    assert.equal(readdirSync(dir).filter((entry) => entry.endsWith(".tmp")).length, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

function refreshTraceArtifactHash(repo, output) {
  const traceHash = sha256File(join(repo, output.trace_events_path));
  const manifestPath = join(repo, output.manifest_path);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.artifacts.find((artifact) => artifact.type === "trace-events").sha256 = traceHash;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  const resultPath = join(repo, output.result_path);
  const result = JSON.parse(readFileSync(resultPath, "utf8"));
  result.artifact_refs.find((artifact) => artifact.type === "trace-events").sha256 = traceHash;
  writeFileSync(resultPath, JSON.stringify(result, null, 2) + "\n", "utf8");
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
    const baseline = JSON.parse(readFileSync(join(repo, output.baseline_result_path), "utf8"));

    const traceEvents = readFileSync(join(repo, output.trace_events_path), "utf8")
      .trim()
      .split(/\r?\n/)
      .map((line) => JSON.parse(line));
    assert.deepEqual(traceEvents.map((event) => event.event_type), expectedTraceEventTypes);
    assert.deepEqual(traceEvents.map((event) => event.sequence), expectedTraceEventTypes.map((_, index) => index + 1));
    assert.ok(traceEvents.every((event) => event.run_id === output.run_id));
    const baselineTraceEvent = traceEvents.find((event) => event.event_type === "baseline_result");
    assert.ok(baselineTraceEvent, "expected baseline_result trace event");
    assert.equal(baselineTraceEvent.status, baseline.comparison_status);
    assert.equal(baselineTraceEvent.detail, "Baseline comparison status: " + baseline.comparison_status + ".");
    const validationTraceEvent = traceEvents.find((event) => event.event_type === "validation_result");
    assert.ok(validationTraceEvent, "expected validation_result trace event");
    assert.equal(validationTraceEvent.artifact_path, output.result_path);
    assert.notEqual(validationTraceEvent.artifact_path, ".harness/evals/runs/latest.json");
    assert.equal(validationTraceEvent.detail, "Run artifact validation passed.");

    const latest = JSON.parse(readFileSync(join(repo, ".harness", "evals", "runs", "latest.json"), "utf8"));
    assert.equal(latest.run_id, output.run_id);
    assert.equal(latest.suite_id, "smoke");
    assert.equal(latest.execution_mode, "synthetic");
    assert.equal(latest.artifact_root, ".harness/evals/runs/" + output.run_id);
    assert.match(latest.generated_at, /^\d{4}-\d{2}-\d{2}T/);
    assert.ok(latest.baseline_result_path);
    assert.ok(latest.scorer_results_path);
    assert.equal(latest.trace_events_path, output.trace_events_path);

    const checkResult = runCli(repo, ["check", "--json"]);
    assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
    const validation = parseJson(checkResult.stdout);
    assert.deepEqual(validation.expected_context, {
      case_id: "pr-closeout",
      suite_id: "smoke",
      execution_mode: "synthetic"
    });
    assert.deepEqual(validation.observed_latest_context, validation.expected_context);
    assert.equal(validation.context_match, true);
    assert.equal(validation.context_mismatch_reason, null);
    assert.equal(validation.recovery_command, null);
    assert.ok(validation.checks.some((check) => check.label === "latest run" && check.status === "pass"));
    assert.ok(validation.checks.some((check) => check.label === "latest proof context" && check.status === "pass"));
    assert.ok(validation.checks.some((check) => check.label === "trace events" && check.status === "pass"));
    assert.ok(validation.checks.some((check) => check.label === "closure latest consistency" && check.status === "pass"));
  } finally {
    cleanup(repo);
  }
});

test("check --json rejects latest proof context mismatch before artifact trust", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    const latest = JSON.parse(readFileSync(latestPath, "utf8"));
    latest.suite_id = "other-suite";
    writeFileSync(latestPath, JSON.stringify(latest, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    const validation = parseJson(result.stdout);
    assert.equal(validation.context_match, false);
    assert.equal(validation.context_mismatch_reason, "suite_id_mismatch");
    assert.equal(validation.recovery_command, "pnpm evals run fixtures/smoke/pr-closeout.case.json --json");
    assert.ok(validation.checks.some((check) => check.label === "latest proof context" && check.status === "fail"));
    assert.match(validation.errors.join("\n"), /latest proof context mismatch/);
    assert.equal(validation.checks.some((check) => check.label === "closure latest consistency"), false);
  } finally {
    cleanup(repo);
  }
});

test("run does not publish latest when final bundle validation fails", () => {
  const repo = makeRepo();
  try {
    const previous = runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    const latestSchemaPath = join(repo, "schemas", "latest-run.schema.json");
    const latestSchema = JSON.parse(readFileSync(latestSchemaPath, "utf8"));
    latestSchema.required.push("phase_one_required");
    latestSchema.properties.phase_one_required = { type: "string", minLength: 1 };
    writeFileSync(latestSchemaPath, JSON.stringify(latestSchema, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["run", "fixtures/smoke/pr-closeout.case.json", "--json"]);
    assert.equal(result.status, 1);
    const latest = JSON.parse(readFileSync(latestPath, "utf8"));
    assert.equal(latest.run_id, previous.run_id);
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
    assert.equal(state.schema_version, 2);
    assert.equal(state.contract_health.runtime_evidence.status, "ready");
    assert.equal(state.contract_health.runtime_evidence.policy_coverage_status, "pass");
    assert.equal(state.non_ready_reason_code, null);
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
    assert.equal(state.contract_health.runtime_evidence.status, "ready");
    assert.equal(state.non_ready_reason_code, "latest_missing");
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
    assert.equal(state.contract_health.runtime_evidence.status, "ready");
    assert.equal(state.non_ready_reason_code, "artifact_missing");
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
    assert.equal(state.contract_health.runtime_evidence.status, "ready");
    assert.equal(state.non_ready_reason_code, "artifact_invalid");
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
    assert.equal(state.contract_health.runtime_evidence.status, "ready");
    assert.equal(state.non_ready_reason_code, "latest_invalid");
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
    assert.equal(state.contract_health.runtime_evidence.status, "ready");
    assert.equal(state.non_ready_reason_code, "latest_invalid");
    assert.match(state.validation.errors.join("\n"), /run_id/);

    const schemaResult = schemaCheckFromObject("state", state, ".harness/evals/runs/latest.json");
    assert.equal(schemaResult.status, "pass", schemaResult.errors.join("\n"));
  } finally {
    cleanup(repo);
  }
});

test("state reports invalid runtime packet when runtime evidence fixture suite fails", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "plugin-attribution-missing.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    fixture.scorers = ["permission-drift"];
    fixture.expected.verdict = "pass";
    fixture.expected.classification = "ok";
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["state", "--json"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const state = parseJson(result.stdout);
    assert.equal(state.status, "invalid");
    assert.equal(state.latest.status, "present");
    assert.equal(state.latest.run_id, output.run_id);
    assert.equal(state.validation.status, "failed");
    assert.equal(state.contract_health.runtime_evidence.status, "failing");
    assert.equal(state.contract_health.runtime_evidence.policy_coverage_status, "fail");
    assert.equal(state.non_ready_reason_code, "runtime_evidence_failed");
    assert.ok(state.recommended_commands.includes("pnpm evals check --json"));
    assert.match(state.validation.errors.join("\n"), /RTE_POLICY_PLUGIN_UNSCORED/);

    const schemaResult = schemaCheckFromObject("state", state, ".harness/evals/runs/latest.json");
    assert.equal(schemaResult.status, "pass", schemaResult.errors.join("\n"));
  } finally {
    cleanup(repo);
  }
});

test("state reports invalid runtime packet when runtime evidence suite is missing", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    rmSync(join(repo, "fixtures", "runtime-evidence"), { recursive: true, force: true });

    const result = runCli(repo, ["state", "--json"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const state = parseJson(result.stdout);
    assert.equal(state.status, "invalid");
    assert.equal(state.validation.status, "failed");
    assert.equal(state.contract_health.runtime_evidence.status, "failing");
    assert.equal(state.non_ready_reason_code, "runtime_evidence_failed");
    assert.match(state.validation.errors.join("\n"), /runtime evidence fixture directory does not exist/);

    const schemaResult = schemaCheckFromObject("state", state, ".harness/evals/runs/latest.json");
    assert.equal(schemaResult.status, "pass", schemaResult.errors.join("\n"));
  } finally {
    cleanup(repo);
  }
});

test("check validates runtime evidence contract cases", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const validation = parseJson(result.stdout);
    const runtimeChecks = validation.checks.filter((check) => check.label.startsWith("runtime evidence: "));
    assert.equal(runtimeChecks.length, 3);
    assert.ok(runtimeChecks.some((check) => check.label === "runtime evidence: approval-disabled-readonly-fallback" && check.status === "pass"));
    assert.ok(runtimeChecks.some((check) => check.label === "runtime evidence: subagent-artifact-contract" && check.status === "pass"));
    assert.ok(runtimeChecks.some((check) => check.label === "runtime evidence: plugin-attribution-missing" && check.status === "pass"));
    assert.equal(validation.runtime_evidence.policy_coverage.status, "pass");
    const coverageFamilies = validation.runtime_evidence.policy_coverage.families;
    assert.ok(coverageFamilies.some((entry) => entry.family === "permissions" && entry.enforcement_status === "implemented_enforced" && entry.scorer_id === "permission-drift"));
    assert.ok(coverageFamilies.some((entry) => entry.family === "subagent_artifacts" && entry.enforcement_status === "implemented_enforced" && entry.scorer_id === "subagent-artifact-contract"));
    assert.ok(coverageFamilies.some((entry) => entry.family === "plugin_attribution" && entry.enforcement_status === "implemented_enforced" && entry.scorer_id === "plugin-attribution"));
    assert.ok(coverageFamilies.some((entry) => entry.family === "goal" && entry.enforcement_status === "scaffolded_not_enforced"));
    assert.ok(coverageFamilies.some((entry) => entry.family === "thread" && entry.enforcement_status === "scaffolded_not_enforced"));
    assert.ok(coverageFamilies.some((entry) => entry.family === "network" && entry.enforcement_status === "scaffolded_not_enforced"));
    assert.ok(coverageFamilies.some((entry) => entry.family === "package_provenance" && entry.enforcement_status === "scaffolded_not_enforced"));
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract fails closed when the fixture suite is missing", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    rmSync(join(repo, "fixtures", "runtime-evidence"), { recursive: true, force: true });

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /runtime evidence fixture directory does not exist/);
    assert.ok(validation.checks.some((check) => check.label === "runtime evidence suite" && check.status === "fail"));
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract fails closed when the fixture suite is empty", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    rmSync(join(repo, "fixtures", "runtime-evidence"), { recursive: true, force: true });
    mkdirSync(join(repo, "fixtures", "runtime-evidence"), { recursive: true });

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /runtime evidence suite has no \*\.case\.json fixtures/);
    assert.ok(validation.checks.some((check) => check.label === "runtime evidence suite" && check.status === "fail"));
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract fails closed when the fixture suite path is not a directory", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    rmSync(join(repo, "fixtures", "runtime-evidence"), { recursive: true, force: true });
    writeFileSync(join(repo, "fixtures", "runtime-evidence"), "not a directory", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /runtime evidence fixture path is not a directory/);
    assert.ok(validation.checks.some((check) => check.label === "runtime evidence suite" && check.status === "fail"));
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract fails closed when the fixture suite is unreadable", (t) => {
  if (process.platform === "win32" || process.getuid?.() === 0 || process.geteuid?.() === 0) {
    t.skip("permission-based unreadable suite check is not reliable on this platform/user");
    return;
  }
  const repo = makeRepo();
  const fixtureDir = join(repo, "fixtures", "runtime-evidence");
  try {
    runPassingSmoke(repo);
    chmodSync(fixtureDir, 0o000);
    try {
      readdirSync(fixtureDir);
      t.skip("chmod did not make runtime-evidence fixture suite unreadable");
      return;
    } catch {
      // Continue only after the fixture suite is actually unreadable.
    }

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /runtime evidence fixture suite is unreadable/);
    assert.ok(validation.checks.some((check) => check.label === "runtime evidence suite" && check.status === "fail"));
  } finally {
    if (existsSync(fixtureDir)) chmodSync(fixtureDir, 0o700);
    cleanup(repo);
  }
});

test("runtime evidence contract reports malformed fixture JSON", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "approval-disabled-readonly-fallback.case.json");
    writeFileSync(fixturePath, "{", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /runtime evidence: unreadable case/);
    assert.ok(validation.checks.some((check) => check.label === "runtime evidence: unreadable case" && check.status === "fail"));
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract accepts strict subagent and plugin evidence when present", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const subagentFixturePath = join(repo, "fixtures", "runtime-evidence", "subagent-artifact-contract.case.json");
    const subagentFixture = JSON.parse(readFileSync(subagentFixturePath, "utf8"));
    subagentFixture.observed_events.splice(2, 0, {
      event_id: "evt-003",
      type: "ArtifactWritten",
      actor: "reviewer-1",
      source: "subagent",
      status: "written",
      effect: "none",
      path_scope: "none",
      subagent_id: "reviewer-1",
      artifact_type: "review_report",
      artifact_path: "artifacts/reviews/reviewer-1.md",
      detail: "Subagent wrote the required review artifact."
    });
    subagentFixture.observed_events[3].event_id = "evt-004";
    subagentFixture.observed_events[3].status = "passed";
    subagentFixture.observed_events[3].detail = "Run finalized after matching ArtifactWritten evidence.";
    subagentFixture.expected.verdict = "pass";
    subagentFixture.expected.classification = "ok";
    subagentFixture.expected.reason = "Strict subagent artifact evidence is present.";
    writeFileSync(subagentFixturePath, JSON.stringify(subagentFixture, null, 2) + "\n", "utf8");

    const pluginFixturePath = join(repo, "fixtures", "runtime-evidence", "plugin-attribution-missing.case.json");
    const pluginFixture = JSON.parse(readFileSync(pluginFixturePath, "utf8"));
    pluginFixture.case_id = "plugin-attribution-present";
    pluginFixture.observed_events[0].plugin_id = "plugin-eval";
    pluginFixture.observed_events[0].plugin_source = "openai-curated";
    pluginFixture.observed_events[1].status = "passed";
    pluginFixture.observed_events[1].detail = "Plugin attribution fields were present.";
    pluginFixture.expected.verdict = "pass";
    pluginFixture.expected.classification = "ok";
    pluginFixture.expected.reason = "Plugin-originated runtime events include plugin id and source.";
    writeFileSync(pluginFixturePath, JSON.stringify(pluginFixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const validation = parseJson(result.stdout);
    const subagentCheck = validation.checks.find((check) => check.label === "runtime evidence: subagent-artifact-contract");
    const pluginCheck = validation.checks.find((check) => check.label === "runtime evidence: plugin-attribution-present");
    assert.equal(subagentCheck.status, "pass");
    assert.equal(pluginCheck.status, "pass");
    assert.deepEqual(subagentCheck.scorer_results.map((item) => item.scorer_id), ["permission-drift", "subagent-artifact-contract"]);
    assert.deepEqual(subagentCheck.scorer_results.map((item) => item.status), ["pass", "pass"]);
    assert.deepEqual(pluginCheck.scorer_results.map((item) => item.scorer_id), ["permission-drift", "plugin-attribution"]);
    assert.deepEqual(pluginCheck.scorer_results.map((item) => item.status), ["pass", "pass"]);
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract rejects plugin tool-call attribution without source", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "plugin-attribution-missing.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    fixture.case_id = "plugin-source-missing";
    fixture.observed_events[0].plugin_id = "plugin-eval";
    fixture.observed_events[0].plugin_source = "openai-curated";
    delete fixture.observed_events[0].source;
    fixture.expected.verdict = "pass";
    fixture.expected.classification = "ok";
    fixture.expected.reason = "This expectation should drift because source attribution is missing.";
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /runtime evidence: plugin-source-missing expected verdict pass, got fail/);
    assert.match(validation.errors.join("\n"), /expected classification ok, got plugin_attribution_missing/);
    const runtimeCheck = validation.checks.find((check) => check.label === "runtime evidence: plugin-source-missing");
    const pluginResult = runtimeCheck.scorer_results.find((result) => result.scorer_id === "plugin-attribution");
    assert.equal(pluginResult.evidence, "tool-call event evt-001 missing source");
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract requires subagent closeout evidence per start", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "subagent-artifact-contract.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    fixture.case_id = "subagent-repeated-start-closeout";
    fixture.observed_events.splice(2, 0, {
      event_id: "evt-003",
      type: "ArtifactWritten",
      actor: "reviewer-1",
      source: "subagent",
      status: "written",
      effect: "none",
      path_scope: "none",
      subagent_id: "reviewer-1",
      artifact_type: "review_report",
      artifact_path: "artifacts/reviews/reviewer-1.md",
      detail: "One artifact was written for the first subagent start."
    });
    fixture.observed_events.splice(1, 0, {
      event_id: "evt-004",
      type: "SubagentStart",
      actor: "parent-agent",
      source: "agent",
      status: "started",
      effect: "none",
      path_scope: "none",
      subagent_id: "reviewer-1",
      role: "reviewer",
      reason: "Retry the same reviewer role.",
      detail: "A second start should require its own closeout evidence."
    });
    fixture.expected.verdict = "pass";
    fixture.expected.classification = "ok";
    fixture.expected.reason = "This expectation should drift because only one closeout exists for two starts.";
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /runtime evidence: subagent-repeated-start-closeout expected verdict pass, got fail/);
    assert.match(validation.errors.join("\n"), /expected classification ok, got missing_subagent_artifact/);
    const runtimeCheck = validation.checks.find((check) => check.label === "runtime evidence: subagent-repeated-start-closeout");
    const subagentResult = runtimeCheck.scorer_results.find((result) => result.scorer_id === "subagent-artifact-contract");
    assert.match(subagentResult.evidence, /fewer ArtifactExpected events than starts/);
    assert.match(subagentResult.evidence, /fewer ArtifactWritten events than starts/);
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract rejects subagent artifact path mismatch", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "subagent-artifact-contract.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    fixture.case_id = "subagent-artifact-path-mismatch";
    fixture.observed_events.splice(2, 0, {
      event_id: "evt-003",
      type: "ArtifactWritten",
      actor: "reviewer-1",
      source: "subagent",
      status: "written",
      effect: "none",
      path_scope: "none",
      subagent_id: "reviewer-1",
      artifact_type: "review_report",
      artifact_path: "artifacts/reviews/other-reviewer.md",
      detail: "Subagent wrote a different review artifact path."
    });
    fixture.observed_events[3].event_id = "evt-004";
    fixture.expected.verdict = "pass";
    fixture.expected.classification = "ok";
    fixture.expected.reason = "This expectation should drift because the artifact path does not match.";
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /runtime evidence: subagent-artifact-path-mismatch expected verdict pass, got fail/);
    const runtimeCheck = validation.checks.find((check) => check.label === "runtime evidence: subagent-artifact-path-mismatch");
    const subagentResult = runtimeCheck.scorer_results.find((result) => result.scorer_id === "subagent-artifact-contract");
    assert.match(subagentResult.evidence, /missing matching ArtifactWritten identity reviewer-1:review_report:artifacts\/reviews\/reviewer-1\.md/);
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract rejects subagent artifact type mismatch", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "subagent-artifact-contract.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    fixture.case_id = "subagent-artifact-type-mismatch";
    fixture.observed_events.splice(2, 0, {
      event_id: "evt-003",
      type: "ArtifactWritten",
      actor: "reviewer-1",
      source: "subagent",
      status: "written",
      effect: "none",
      path_scope: "none",
      subagent_id: "reviewer-1",
      artifact_type: "other_report",
      artifact_path: "artifacts/reviews/reviewer-1.md",
      detail: "Subagent wrote the right path with the wrong artifact type."
    });
    fixture.observed_events[3].event_id = "evt-004";
    fixture.expected.verdict = "pass";
    fixture.expected.classification = "ok";
    fixture.expected.reason = "This expectation should drift because the artifact type does not match.";
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /runtime evidence: subagent-artifact-type-mismatch expected verdict pass, got fail/);
    const runtimeCheck = validation.checks.find((check) => check.label === "runtime evidence: subagent-artifact-type-mismatch");
    const subagentResult = runtimeCheck.scorer_results.find((result) => result.scorer_id === "subagent-artifact-contract");
    assert.match(subagentResult.evidence, /missing matching ArtifactWritten identity reviewer-1:review_report:artifacts\/reviews\/reviewer-1\.md/);
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract rejects artifact identity written by a different subagent", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "subagent-artifact-contract.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    fixture.case_id = "subagent-artifact-wrong-subagent";
    fixture.observed_events.splice(2, 0, {
      event_id: "evt-003",
      type: "ArtifactWritten",
      actor: "reviewer-2",
      source: "subagent",
      status: "written",
      effect: "none",
      path_scope: "none",
      subagent_id: "reviewer-2",
      artifact_type: "review_report",
      artifact_path: "artifacts/reviews/reviewer-1.md",
      detail: "A different subagent wrote the expected artifact identity."
    });
    fixture.observed_events[3].event_id = "evt-004";
    fixture.expected.verdict = "pass";
    fixture.expected.classification = "ok";
    fixture.expected.reason = "This expectation should drift because the written artifact belongs to another subagent.";
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /runtime evidence: subagent-artifact-wrong-subagent expected verdict pass, got fail/);
    const runtimeCheck = validation.checks.find((check) => check.label === "runtime evidence: subagent-artifact-wrong-subagent");
    const subagentResult = runtimeCheck.scorer_results.find((result) => result.scorer_id === "subagent-artifact-contract");
    assert.match(subagentResult.evidence, /missing matching ArtifactWritten identity reviewer-1:review_report:artifacts\/reviews\/reviewer-1\.md/);
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract permits distinct subagents to write the same artifact type and path", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "subagent-artifact-contract.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    fixture.case_id = "subagent-artifact-shared-path-distinct-subagents";
    fixture.observed_events = [
      {
        event_id: "evt-001",
        type: "SubagentStart",
        actor: "parent-agent",
        source: "agent",
        status: "started",
        effect: "none",
        path_scope: "none",
        subagent_id: "reviewer-1",
        role: "reviewer",
        reason: "Review runtime evidence contract changes."
      },
      {
        event_id: "evt-002",
        type: "SubagentStart",
        actor: "parent-agent",
        source: "agent",
        status: "started",
        effect: "none",
        path_scope: "none",
        subagent_id: "reviewer-2",
        role: "reviewer",
        reason: "Review runtime evidence contract changes."
      },
      {
        event_id: "evt-003",
        type: "ArtifactExpected",
        actor: "parent-agent",
        source: "agent",
        status: "expected",
        effect: "none",
        path_scope: "none",
        subagent_id: "reviewer-1",
        artifact_type: "review_report",
        artifact_path: "artifacts/reviews/shared.md"
      },
      {
        event_id: "evt-004",
        type: "ArtifactExpected",
        actor: "parent-agent",
        source: "agent",
        status: "expected",
        effect: "none",
        path_scope: "none",
        subagent_id: "reviewer-2",
        artifact_type: "review_report",
        artifact_path: "artifacts/reviews/shared.md"
      },
      {
        event_id: "evt-005",
        type: "ArtifactWritten",
        actor: "reviewer-1",
        source: "subagent",
        status: "written",
        effect: "none",
        path_scope: "none",
        subagent_id: "reviewer-1",
        artifact_type: "review_report",
        artifact_path: "artifacts/reviews/shared.md"
      },
      {
        event_id: "evt-006",
        type: "ArtifactWritten",
        actor: "reviewer-2",
        source: "subagent",
        status: "written",
        effect: "none",
        path_scope: "none",
        subagent_id: "reviewer-2",
        artifact_type: "review_report",
        artifact_path: "artifacts/reviews/shared.md"
      }
    ];
    fixture.expected.verdict = "pass";
    fixture.expected.classification = "ok";
    fixture.expected.reason = "Distinct subagents are independent artifact identities even when type and path match.";
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    const runtimeCheck = validation.checks.find((check) => check.label === "runtime evidence: subagent-artifact-shared-path-distinct-subagents");
    const subagentResult = runtimeCheck.scorer_results.find((result) => result.scorer_id === "subagent-artifact-contract");
    assert.equal(subagentResult.status, "pass");
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract rejects missing subagent artifact identity", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "subagent-artifact-contract.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    fixture.case_id = "subagent-artifact-missing-identity";
    delete fixture.observed_events[1].artifact_path;
    fixture.expected.verdict = "pass";
    fixture.expected.classification = "ok";
    fixture.expected.reason = "This expectation should drift because the expected artifact identity is incomplete.";
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /runtime evidence: subagent-artifact-missing-identity expected verdict pass, got fail/);
    const runtimeCheck = validation.checks.find((check) => check.label === "runtime evidence: subagent-artifact-missing-identity");
    const subagentResult = runtimeCheck.scorer_results.find((result) => result.scorer_id === "subagent-artifact-contract");
    assert.match(subagentResult.evidence, /ArtifactExpected evt-002 missing artifact_path/);
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract rejects traversal in subagent artifact identity", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "subagent-artifact-contract.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    fixture.case_id = "subagent-artifact-traversal";
    fixture.observed_events[1].artifact_path = "../artifacts/reviews/reviewer-1.md";
    fixture.observed_events.splice(2, 0, {
      event_id: "evt-003",
      type: "ArtifactWritten",
      actor: "reviewer-1",
      source: "subagent",
      status: "written",
      effect: "none",
      path_scope: "none",
      subagent_id: "reviewer-1",
      artifact_type: "review_report",
      artifact_path: "../artifacts/reviews/reviewer-1.md",
      detail: "Subagent wrote an unsafe traversal artifact path."
    });
    fixture.observed_events[3].event_id = "evt-004";
    fixture.expected.verdict = "pass";
    fixture.expected.classification = "ok";
    fixture.expected.reason = "This expectation should drift because traversal paths are unsafe.";
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    const runtimeCheck = validation.checks.find((check) => check.label === "runtime evidence: subagent-artifact-traversal");
    const subagentResult = runtimeCheck.scorer_results.find((result) => result.scorer_id === "subagent-artifact-contract");
    assert.match(subagentResult.evidence, /unsafe artifact_path \.\.\/artifacts\/reviews\/reviewer-1\.md/);
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract rejects Windows absolute artifact identity paths", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "subagent-artifact-contract.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    fixture.case_id = "subagent-artifact-windows-absolute-path";
    fixture.observed_events[1].artifact_path = "C:\\Users\\agent\\artifacts\\reviews\\reviewer-1.md";
    fixture.observed_events.splice(2, 0, {
      event_id: "evt-003",
      type: "ArtifactWritten",
      actor: "reviewer-1",
      source: "subagent",
      status: "written",
      effect: "none",
      path_scope: "none",
      subagent_id: "reviewer-1",
      artifact_type: "review_report",
      artifact_path: "C:\\Users\\agent\\artifacts\\reviews\\reviewer-1.md",
      detail: "Subagent wrote an unsafe Windows absolute artifact path."
    });
    fixture.observed_events[3].event_id = "evt-004";
    fixture.expected.verdict = "pass";
    fixture.expected.classification = "ok";
    fixture.expected.reason = "This expectation should drift because Windows absolute paths are unsafe.";
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    const runtimeCheck = validation.checks.find((check) => check.label === "runtime evidence: subagent-artifact-windows-absolute-path");
    const subagentResult = runtimeCheck.scorer_results.find((result) => result.scorer_id === "subagent-artifact-contract");
    assert.match(subagentResult.evidence, /unsafe artifact_path C:\\Users\\agent\\artifacts\\reviews\\reviewer-1\.md/);
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract rejects ambiguous duplicate artifact writes", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "subagent-artifact-contract.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    fixture.case_id = "subagent-artifact-duplicate-write";
    const written = {
      type: "ArtifactWritten",
      actor: "reviewer-1",
      source: "subagent",
      status: "written",
      effect: "none",
      path_scope: "none",
      subagent_id: "reviewer-1",
      artifact_type: "review_report",
      artifact_path: "artifacts/reviews/reviewer-1.md",
      detail: "Subagent wrote the required review artifact."
    };
    fixture.observed_events.splice(2, 0, { ...written }, { ...written });
    fixture.observed_events[4].event_id = "evt-003";
    fixture.expected.verdict = "pass";
    fixture.expected.classification = "ok";
    fixture.expected.reason = "This expectation should drift because duplicate artifact writes are ambiguous.";
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    const runtimeCheck = validation.checks.find((check) => check.label === "runtime evidence: subagent-artifact-duplicate-write");
    const subagentResult = runtimeCheck.scorer_results.find((result) => result.scorer_id === "subagent-artifact-contract");
    assert.match(subagentResult.evidence, /ambiguous duplicate write events: unknown-event, unknown-event/);
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence policy coverage fails closed when declared scaffold coverage is missing", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "approval-disabled-readonly-fallback.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    delete fixture.declared_contract.policy_scaffolds.thread;
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.runtime_evidence.policy_coverage.status, "fail");
    assert.match(validation.errors.join("\n"), /RTE_POLICY_THREAD_UNSCORED/);
    assert.ok(validation.runtime_evidence.policy_coverage.families.some((entry) => (
      entry.family === "thread" &&
      entry.enforcement_status === "missing_enforcement" &&
      entry.error_code === "RTE_POLICY_THREAD_UNSCORED"
    )));
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence policy coverage fails closed when declared plugin policy is unscored", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "plugin-attribution-missing.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    fixture.scorers = ["permission-drift"];
    fixture.expected.verdict = "pass";
    fixture.expected.classification = "ok";
    fixture.expected.reason = "This expectation should drift because plugin policy is declared without the enforcing scorer.";
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.runtime_evidence.policy_coverage.status, "fail");
    assert.match(validation.errors.join("\n"), /RTE_POLICY_PLUGIN_UNSCORED/);
    const pluginCoverage = validation.runtime_evidence.policy_coverage.families.find((entry) => entry.family === "plugin_attribution");
    assert.equal(pluginCoverage.enforcement_status, "missing_enforcement");
    assert.equal(pluginCoverage.error_code, "RTE_POLICY_PLUGIN_UNSCORED");
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract applies deterministic classification precedence across scorers", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "plugin-attribution-missing.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    fixture.case_id = "subagent-and-plugin-drift";
    fixture.intent = "Prove that multi-scorer runtime evidence cases classify by deterministic scorer precedence.";
    fixture.declared_contract.artifact_contract.subagent_artifacts_required = true;
    fixture.observed_events.unshift({
      event_id: "evt-000",
      type: "SubagentStart",
      actor: "parent-agent",
      source: "agent",
      status: "started",
      effect: "none",
      path_scope: "none",
      subagent_id: "reviewer-1",
      role: "reviewer",
      reason: "Review runtime evidence contract changes.",
      detail: "Subagent started without matching artifact events."
    });
    fixture.scorers = ["permission-drift", "subagent-artifact-contract", "plugin-attribution"];
    fixture.expected.classification = "missing_subagent_artifact";
    fixture.expected.reason = "Subagent artifact failures take deterministic precedence over later plugin attribution failures.";
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const validation = parseJson(result.stdout);
    const runtimeCheck = validation.checks.find((check) => check.label === "runtime evidence: subagent-and-plugin-drift");
    assert.ok(runtimeCheck);
    assert.equal(runtimeCheck.status, "pass");
    assert.equal(runtimeCheck.scorer_results.length, 3);
    assert.deepEqual(runtimeCheck.scorer_results.map((item) => item.scorer_id), ["permission-drift", "subagent-artifact-contract", "plugin-attribution"]);
    assert.deepEqual(runtimeCheck.scorer_results.map((item) => item.status), ["pass", "fail", "fail"]);
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract detects expected-verdict drift", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "subagent-artifact-contract.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    fixture.expected.verdict = "pass";
    fixture.expected.classification = "ok";
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /runtime evidence: subagent-artifact-contract expected verdict pass, got fail/);
    assert.match(validation.errors.join("\n"), /expected classification ok, got missing_subagent_artifact/);
    assert.ok(validation.checks.some((check) => check.label === "runtime evidence: subagent-artifact-contract" && check.status === "fail"));
  } finally {
    cleanup(repo);
  }
});

test("runtime evidence contract rejects schema-invalid cases", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const fixturePath = join(repo, "fixtures", "runtime-evidence", "plugin-attribution-missing.case.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    delete fixture.declared_contract.plugin_policy;
    writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /runtime evidence: plugin-attribution-missing .*plugin_policy.*missing required property/);
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
    assert.deepEqual(validation.expected_context, {
      case_id: "pr-closeout",
      suite_id: "smoke",
      execution_mode: "synthetic"
    });
    assert.equal(validation.context_match, true);
    assert.equal(validation.context_mismatch_reason, null);
    assert.equal(validation.recovery_command, null);
    assert.match(validation.errors.join("\n"), /latest run .*result_path.*missing required property/);
    assert.ok(validation.checks.some((check) => check.label === "latest run" && check.status === "fail"));
    assert.equal(validation.checks.some((check) => check.label === "eval result"), false);
  } finally {
    cleanup(repo);
  }
});

test("check --json keeps proof-context fields when latest JSON is malformed", () => {
  const repo = makeRepo();
  try {
    runPassingSmoke(repo);
    const latestPath = join(repo, ".harness", "evals", "runs", "latest.json");
    writeFileSync(latestPath, "{", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.equal(validation.status, "failed");
    assert.deepEqual(validation.expected_context, {
      case_id: "pr-closeout",
      suite_id: "smoke",
      execution_mode: "synthetic"
    });
    assert.equal(validation.observed_latest_context, null);
    assert.equal(validation.context_match, false);
    assert.equal(validation.context_mismatch_reason, "observed_latest_context_missing");
    assert.equal(validation.recovery_command, "pnpm evals run fixtures/smoke/pr-closeout.case.json --json");
    assert.match(validation.errors.join("\n"), /JSON/);
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

test("latest validation rejects invalid trace status vocabulary", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const tracePath = join(repo, output.trace_events_path);
    const events = readFileSync(tracePath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
    const baselineTraceEvent = events.find((event) => event.event_type === "baseline_result");
    assert.ok(baselineTraceEvent, "expected baseline_result trace event");
    baselineTraceEvent.status = "missing";
    writeFileSync(tracePath, events.map((event) => JSON.stringify(event)).join("\n") + "\n", "utf8");

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /trace event 4 status: expected one of not_compared, matched, changed, error, got missing/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation reports unreadable trace files as structured failures", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    rmSync(join(repo, output.trace_events_path));
    mkdirSync(join(repo, output.trace_events_path));

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /trace events file read failed/);
  } finally {
    cleanup(repo);
  }
});

test("latest validation rejects missing artifact paths for artifact-bearing trace events", () => {
  const repo = makeRepo();
  try {
    const output = runPassingSmoke(repo);
    const tracePath = join(repo, output.trace_events_path);
    const events = readFileSync(tracePath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
    events.find((event) => event.event_type === "command_result").artifact_path = null;
    events.find((event) => event.event_type === "scorer_result").artifact_path = "";
    writeFileSync(tracePath, events.map((event) => JSON.stringify(event)).join("\n") + "\n", "utf8");
    refreshTraceArtifactHash(repo, output);

    const result = runCli(repo, ["check", "--json"]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const validation = parseJson(result.stdout);
    assert.match(validation.errors.join("\n"), /trace event 2 artifact_path: path must be a non-empty string/);
    assert.match(validation.errors.join("\n"), /trace event 3 artifact_path: path must be a non-empty string/);
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
  suite_id: "smoke",
  execution_mode: "synthetic",
  generated_at: "2026-05-20T19:18:34.000Z",
  artifact_root: ".harness/evals/runs/20260520T191834Z-pr-closeout-4df36134",
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
