import { mkdirSync, writeFileSync } from "node:fs";
import { join, sep } from "node:path";

import { parseCase } from "../lib/case-contract.js";
import { clearActiveRunContext, emitFailure, setActiveRunContext } from "../lib/failures.js";
import { sha256File, sha256Text } from "../lib/hash.js";
import { writeJson } from "../lib/json.js";
import { validateLatestRun } from "../lib/latest-run.js";
import { rel, repoRoot, utcBasic } from "../lib/paths.js";
import { buildReport } from "../lib/report.js";
import { scoreArtifactCompleteness, scoreRuntime, simulatedRunOutput, verdictFor } from "../lib/scoring.js";

/**
 * Execute a single evaluation case: generate run identifiers and artifacts, write all artifact files (report, result, manifest, scorer and baseline results, command log), update the latest run index, validate the latest artifact schema, print a summary, clear run context and terminate the process with a pass/fail exit code.
 * @param {string} casePath - Filesystem path identifying the test case to run (file or directory accepted by the case parser).
 * @param {boolean} jsonMode - When true, print machine-readable JSON summary output; when false, print a human-readable summary.
 */
export function runCase(casePath, jsonMode) {
  const { rawCase, testCase } = parseCase(casePath, jsonMode);

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
  const failurePath = join(runDir, "failure.json");
  const artifactPaths = [resultPath, reportPath, commandLogPath, manifestPath, scorerResultsPath, baselineResultPath];
  const artifactRelPaths = artifactPaths.map(rel);
  const artifactNames = artifactPaths.map((path) => path.split(sep).at(-1));
  setActiveRunContext({
    runId,
    caseId: testCase.case_id,
    failurePath,
    artifactPaths
  });

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

  const baseline = {
    schema_version: 1,
    presence_status: testCase.baseline?.expected_presence || "missing",
    comparison_status: "not_compared",
    promotion_status: "not_requested",
    baseline_owner: testCase.promotion.baseline_owner,
    comparison_evidence: "No phase-one baseline is present; missing baseline is explicit and not treated as a fake match.",
    current_artifact_ref: {
      type: "command-log",
      path: rel(commandLogPath),
      sha256: sha256Text(JSON.stringify(execution, null, 2) + "\n")
    }
  };

  const scorerResults = scoreRuntime(testCase, execution).concat(scoreArtifactCompleteness(testCase, artifactNames));
  const deterministicVerdict = verdictFor(scorerResults);
  const status = deterministicVerdict === "pass" ? "passed" : "failed";
  const scorerEnvelope = { schema_version: 1, results: scorerResults };
  const report = buildReport({
    runId,
    testCase,
    status,
    deterministicVerdict,
    baseline,
    execution,
    paths: artifactRelPaths
  });

  writeJson(commandLogPath, execution);
  writeJson(baselineResultPath, baseline);
  writeJson(scorerResultsPath, scorerEnvelope);
  writeFileSync(reportPath, report, "utf8");

  const artifactRefs = [
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

  const manifestArtifacts = [
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
    command_log_path: rel(commandLogPath),
    baseline_result_path: rel(baselineResultPath),
    scorer_results_path: rel(scorerResultsPath)
  };
  writeJson(latestPath, latest);

  const validation = validateLatestRun(latestPath);
  if (validation.errors.length > 0) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "artifact schema validation",
      errors: validation.errors,
      recovery: "Fix generated artifact shape before trusting this run."
    });
  }

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
    baseline_result_path: rel(baselineResultPath),
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
  clearActiveRunContext();
  process.exit(deterministicVerdict === "pass" ? 0 : 1);
}
