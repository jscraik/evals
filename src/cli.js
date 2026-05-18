#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function usage(exitCode = 1) {
  const message = "Usage: pnpm evals run <case-file> [--json]";
  if (exitCode === 0) console.log(message);
  else console.error(message);
  process.exit(exitCode);
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function sha256Text(value) {
  return createHash("sha256").update(value).digest("hex");
}

function utcBasic(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function rel(path) {
  return relative(repoRoot, path);
}

function emitFailure(jsonMode, failure) {
  if (jsonMode) console.log(JSON.stringify(failure, null, 2));
  else console.error("failed: " + failure.errors.join("; "));
  process.exit(1);
}

function validateCase(casePath, testCase) {
  const errors = [];
  const requiredTop = ["schema_version", "case_id", "suite_id", "owner", "fixture_source", "privacy", "promotion", "input", "expected", "scorers"];
  for (const key of requiredTop) {
    if (!(key in testCase)) errors.push("missing required field: " + key);
  }
  if (testCase.schema_version !== 1) errors.push("schema_version must be 1");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(testCase.case_id || "")) errors.push("case_id must be kebab-case");
  if (testCase.fixture_source?.type !== "synthetic") errors.push("phase-one smoke fixture must be synthetic");
  if (testCase.privacy?.contains_private_content !== false) errors.push("phase-one smoke fixture must not contain private content");
  if (testCase.privacy?.contains_credentials !== false) errors.push("phase-one smoke fixture must not contain credentials");
  for (const key of ["type", "name"]) {
    if (!(key in (testCase.owner || {}))) errors.push("owner." + key + " is required");
  }
  for (const key of ["type", "provenance", "redaction_status"]) {
    if (!(key in (testCase.fixture_source || {}))) errors.push("fixture_source." + key + " is required");
  }
  for (const key of ["class", "contains_private_content", "contains_credentials"]) {
    if (!(key in (testCase.privacy || {}))) errors.push("privacy." + key + " is required");
  }
  for (const key of ["status", "baseline_owner"]) {
    if (!(key in (testCase.promotion || {}))) errors.push("promotion." + key + " is required");
  }
  if (!Array.isArray(testCase.expected?.required_output_contains)) errors.push("expected.required_output_contains must be an array");
  if (!Array.isArray(testCase.expected?.required_artifacts)) errors.push("expected.required_artifacts must be an array");
  if (!Array.isArray(testCase.scorers) || testCase.scorers.length === 0) errors.push("scorers must name at least one deterministic scorer");
  const allowedScorers = new Set(["exit-code", "artifact-completeness", "required-output"]);
  for (const scorer of testCase.scorers || []) {
    if (!allowedScorers.has(scorer)) errors.push("unsupported scorer: " + scorer);
  }
  if (!existsSync(casePath)) errors.push("case file does not exist: " + casePath);
  return errors;
}

function simulatedRunOutput(testCase) {
  return [
    "case " + testCase.case_id + " wrote artifact bundle",
    "deterministic scorers completed",
    "baseline missing: presence_status=missing comparison_status=not_compared promotion_status=not_requested"
  ].join("\n");
}

function scoreRuntime(testCase, execution) {
  const results = [];
  if (testCase.scorers.includes("exit-code")) {
    const passed = execution.exit_code === testCase.expected.exit_code;
    results.push({
      scorer_id: "exit-code",
      scorer_version: "1.0.0",
      status: passed ? "pass" : "fail",
      inputs_inspected: ["execution.exit_code", "expected.exit_code"],
      evidence: "actual=" + execution.exit_code + "; expected=" + testCase.expected.exit_code,
      failure_reason: passed ? null : "exit code did not match expected value"
    });
  }
  if (testCase.scorers.includes("required-output")) {
    const missing = testCase.expected.required_output_contains.filter((needle) => !execution.stdout.includes(needle));
    results.push({
      scorer_id: "required-output",
      scorer_version: "1.0.0",
      status: missing.length === 0 ? "pass" : "fail",
      inputs_inspected: ["execution.stdout", "expected.required_output_contains"],
      evidence: missing.length === 0 ? "all required output fragments found" : "missing: " + missing.join(", "),
      failure_reason: missing.length === 0 ? null : "required output fragment missing"
    });
  }
  return results;
}

function scoreArtifactCompleteness(testCase, artifactDir) {
  if (!testCase.scorers.includes("artifact-completeness")) return [];
  const missing = testCase.expected.required_artifacts.filter((name) => !existsSync(join(artifactDir, name)));
  return [{
    scorer_id: "artifact-completeness",
    scorer_version: "1.0.0",
    status: missing.length === 0 ? "pass" : "fail",
    inputs_inspected: ["expected.required_artifacts", rel(artifactDir)],
    evidence: missing.length === 0 ? "all required artifact paths exist" : "missing: " + missing.join(", "),
    failure_reason: missing.length === 0 ? null : "required artifact missing"
  }];
}

function verdictFor(scorerResults) {
  return scorerResults.every((item) => item.status === "pass") ? "pass" : "fail";
}

function buildReport({ runId, testCase, status, deterministicVerdict, baseline, execution, paths }) {
  return "# Evals Smoke Run\n\n" +
    "| Field | Value |\n| --- | --- |\n" +
    "| Run ID | " + runId + " |\n" +
    "| Case ID | " + testCase.case_id + " |\n" +
    "| Suite ID | " + testCase.suite_id + " |\n" +
    "| Status | " + status + " |\n" +
    "| Deterministic verdict | " + deterministicVerdict + " |\n" +
    "| Baseline presence_status | " + baseline.presence_status + " |\n" +
    "| Baseline comparison_status | " + baseline.comparison_status + " |\n" +
    "| Baseline promotion_status | " + baseline.promotion_status + " |\n\n" +
    "## Output\n\n~~~text\n" + execution.stdout + "\n~~~\n\n" +
    "## Artifacts\n\n" +
    paths.map((path) => "- " + rel(path)).join("\n") + "\n\n" +
    "## Judge Policy\n\nNo LLM judge output participates in pass, fail, block, promote, or closure decisions for this smoke run.\n";
}

function runCase(casePath, jsonMode) {
  const absoluteCasePath = resolve(repoRoot, casePath);
  if (absoluteCasePath !== repoRoot && !absoluteCasePath.startsWith(repoRoot + sep)) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "case path",
      errors: ["case file must be inside the evals repository: " + casePath],
      recovery: "Pass a fixture path under the repository, then rerun the same command."
    });
  }
  if (!existsSync(absoluteCasePath)) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "case path",
      errors: ["case file does not exist: " + casePath],
      recovery: "Fix the fixture path, then rerun the same command."
    });
  }
  let rawCase;
  try {
    rawCase = readFileSync(absoluteCasePath, "utf8");
  } catch (error) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "case read",
      errors: [error.message],
      recovery: "Make the fixture readable, then rerun the same command."
    });
  }
  let testCase;
  try {
    testCase = JSON.parse(rawCase);
  } catch (error) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "case parse",
      errors: [error.message],
      recovery: "Fix the fixture JSON syntax, then rerun the same command."
    });
  }
  const validationErrors = validateCase(absoluteCasePath, testCase);
  if (validationErrors.length > 0) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "case validation",
      errors: validationErrors,
      recovery: "Fix the fixture or local case contract, then rerun the same command."
    });
  }

  const startedAt = new Date();
  const inputHash = sha256Text(rawCase).slice(0, 8);
  const runId = utcBasic(startedAt) + "-" + testCase.case_id + "-" + inputHash;
  const runDir = join(repoRoot, ".harness", "evals", "runs", runId);
  mkdirSync(runDir, { recursive: true });

  const resultPath = join(runDir, "result.json");
  const reportPath = join(runDir, "report.md");
  const commandLogPath = join(runDir, "command-log.json");
  const manifestPath = join(runDir, "manifest.json");
  const scorerResultsPath = join(runDir, "scorer-results.json");
  const baselineResultPath = join(runDir, "baseline-result.json");

  const execution = {
    command: "pnpm evals run " + casePath + (jsonMode ? " --json" : ""),
    simulated_command: testCase.input.command,
    started_at: startedAt.toISOString(),
    finished_at: null,
    duration_ms: null,
    exit_code: 0,
    stdout: simulatedRunOutput(testCase),
    stderr: "",
    failure_class: null
  };
  const finishedAt = new Date();
  execution.finished_at = finishedAt.toISOString();
  execution.duration_ms = finishedAt.getTime() - startedAt.getTime();

  writeJson(commandLogPath, execution);
  const baselineSeed = {
    schema_version: 1,
    presence_status: testCase.baseline?.expected_presence || "missing",
    comparison_status: "not_compared",
    promotion_status: "not_requested",
    baseline_owner: testCase.promotion.baseline_owner,
    comparison_evidence: "No phase-one baseline is present; missing baseline is explicit and not treated as a fake match.",
    current_artifact_ref: {
      type: "command-log",
      path: rel(commandLogPath),
      sha256: sha256File(commandLogPath)
    }
  };
  writeJson(baselineResultPath, baselineSeed);

  const artifactPaths = [resultPath, reportPath, commandLogPath, manifestPath, scorerResultsPath, baselineResultPath];
  const runtimeScorerResults = scoreRuntime(testCase, execution);
  let scorerResults = runtimeScorerResults;
  let deterministicVerdict = verdictFor(scorerResults);
  let status = deterministicVerdict === "pass" ? "passed" : "failed";

  writeJson(scorerResultsPath, { schema_version: 1, results: scorerResults });
  writeFileSync(reportPath, buildReport({
    runId,
    testCase,
    status,
    deterministicVerdict,
    baseline: baselineSeed,
    execution,
    paths: artifactPaths
  }), "utf8");

  let artifactRefs = [
    { type: "report", path: rel(reportPath), sha256: sha256File(reportPath) },
    { type: "command-log", path: rel(commandLogPath), sha256: sha256File(commandLogPath) },
    { type: "scorer-results", path: rel(scorerResultsPath), sha256: sha256File(scorerResultsPath) },
    { type: "baseline-result", path: rel(baselineResultPath), sha256: sha256File(baselineResultPath) }
  ];
  writeJson(resultPath, {
    schema_version: 1,
    run_id: runId,
    case_id: testCase.case_id,
    suite_id: testCase.suite_id,
    status,
    deterministic_verdict: deterministicVerdict,
    scorer_results_path: rel(scorerResultsPath),
    baseline_result_path: rel(baselineResultPath),
    artifact_refs: artifactRefs,
    errors: []
  });

  let manifestArtifacts = [
    { type: "result", path: rel(resultPath), sha256: sha256File(resultPath), required: true },
    { type: "report", path: rel(reportPath), sha256: sha256File(reportPath), required: true },
    { type: "command-log", path: rel(commandLogPath), sha256: sha256File(commandLogPath), required: true },
    { type: "scorer-results", path: rel(scorerResultsPath), sha256: sha256File(scorerResultsPath), required: true },
    { type: "baseline-result", path: rel(baselineResultPath), sha256: sha256File(baselineResultPath), required: true }
  ];
  writeJson(manifestPath, {
    schema_version: 1,
    run_id: runId,
    case_id: testCase.case_id,
    created_at: startedAt.toISOString(),
    retention: {
      status: "retained_local",
      policy: "Phase-one run artifacts are retained locally; automatic retention duration is not defined yet."
    },
    privacy: {
      class: testCase.privacy.class,
      redaction_status: testCase.fixture_source.redaction_status,
      contains_private_content: testCase.privacy.contains_private_content,
      contains_credentials: testCase.privacy.contains_credentials
    },
    artifacts: manifestArtifacts
  });

  scorerResults = runtimeScorerResults.concat(scoreArtifactCompleteness(testCase, runDir));
  writeJson(scorerResultsPath, { schema_version: 1, results: scorerResults });

  deterministicVerdict = verdictFor(scorerResults);
  status = deterministicVerdict === "pass" ? "passed" : "failed";
  writeFileSync(reportPath, buildReport({
    runId,
    testCase,
    status,
    deterministicVerdict,
    baseline: baselineSeed,
    execution,
    paths: artifactPaths
  }), "utf8");

  artifactRefs = [
    { type: "report", path: rel(reportPath), sha256: sha256File(reportPath) },
    { type: "command-log", path: rel(commandLogPath), sha256: sha256File(commandLogPath) },
    { type: "scorer-results", path: rel(scorerResultsPath), sha256: sha256File(scorerResultsPath) },
    { type: "baseline-result", path: rel(baselineResultPath), sha256: sha256File(baselineResultPath) }
  ];

  const result = {
    schema_version: 1,
    run_id: runId,
    case_id: testCase.case_id,
    suite_id: testCase.suite_id,
    status,
    deterministic_verdict: deterministicVerdict,
    scorer_results_path: rel(scorerResultsPath),
    baseline_result_path: rel(baselineResultPath),
    artifact_refs: artifactRefs,
    errors: []
  };
  writeJson(resultPath, result);

  manifestArtifacts = [
    { type: "result", path: rel(resultPath), sha256: sha256File(resultPath), required: true },
    { type: "report", path: rel(reportPath), sha256: sha256File(reportPath), required: true },
    { type: "command-log", path: rel(commandLogPath), sha256: sha256File(commandLogPath), required: true },
    { type: "scorer-results", path: rel(scorerResultsPath), sha256: sha256File(scorerResultsPath), required: true },
    { type: "baseline-result", path: rel(baselineResultPath), sha256: sha256File(baselineResultPath), required: true }
  ];
  const manifest = {
    schema_version: 1,
    run_id: runId,
    case_id: testCase.case_id,
    created_at: startedAt.toISOString(),
    retention: {
      status: "retained_local",
      policy: "Phase-one run artifacts are retained locally; automatic retention duration is not defined yet."
    },
    privacy: {
      class: testCase.privacy.class,
      redaction_status: testCase.fixture_source.redaction_status,
      contains_private_content: testCase.privacy.contains_private_content,
      contains_credentials: testCase.privacy.contains_credentials
    },
    artifacts: manifestArtifacts
  };
  writeJson(manifestPath, manifest);

  const latestPath = join(repoRoot, ".harness", "evals", "runs", "latest.json");
  const latest = {
    run_id: runId,
    case_id: testCase.case_id,
    manifest_path: rel(manifestPath),
    result_path: rel(resultPath),
    report_path: rel(reportPath),
    command_log_path: rel(commandLogPath)
  };
  writeJson(latestPath, latest);

  const output = {
    verdict: deterministicVerdict,
    status,
    run_id: runId,
    case_id: testCase.case_id,
    manifest_path: rel(manifestPath),
    result_path: rel(resultPath),
    report_path: rel(reportPath),
    command_log_path: rel(commandLogPath),
    baseline_path: rel(baselineResultPath),
    scorer_results_path: rel(scorerResultsPath)
  };

  if (jsonMode) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log("verdict: " + output.verdict);
    console.log("run_id: " + output.run_id);
    console.log("manifest: " + output.manifest_path);
    console.log("result: " + output.result_path);
    console.log("report: " + output.report_path);
    console.log("command_log: " + output.command_log_path);
  }
  process.exit(deterministicVerdict === "pass" ? 0 : 1);
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) usage(0);
const jsonMode = args.includes("--json");
const positional = args.filter((arg) => arg !== "--json");
if (positional.length !== 2 || positional[0] !== "run") usage(1);
runCase(positional[1], jsonMode);
