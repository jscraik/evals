import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join, sep } from "node:path";

import { expectedLatestPath } from "../lib/artifact-bundle.js";
import { parseCase } from "../lib/case-contract.js";
import { clearActiveRunContext, emitFailure, setActiveRunContext } from "../lib/failures.js";
import { sha256File, sha256Text } from "../lib/hash.js";
import { writeJson } from "../lib/json.js";
import { validateLatestRun } from "../lib/latest-run.js";
import { rel, repoRelativePath, repoRoot, utcBasic } from "../lib/paths.js";
import { buildReport } from "../lib/report.js";
import { scoreArtifactCompleteness, scoreBaselinePresence, scoreRuntime, simulatedRunOutput, verdictFor } from "../lib/scoring.js";

/**
 * Constructs a synthetic execution record for a test case.
 *
 * Builds an execution object that represents a deterministic, non-running ("synthetic")
 * run: it records start/finish timestamps, computes duration, sets an exit code of 0,
 * and includes generated stdout/stderr and command metadata.
 *
 * @param {Object} testCase - Test case descriptor; expected to include `input.command` and any data used to simulate output.
 * @param {string} casePath - Repository-relative path to the case used to build the executed command.
 * @param {boolean} jsonMode - If true, append `--json` to the constructed command.
 * @param {Date} startedAt - Start time of the synthetic execution.
 * @returns {Object} An execution record containing:
 *   - `command` {string} : the full command executed (includes `--json` when `jsonMode` is true).
 *   - `input_command` {string} : the original input command from the test case.
 *   - `execution_mode` {string} : `"synthetic"`.
 *   - `started_at` {string} : ISO timestamp of `startedAt`.
 *   - `finished_at` {string} : ISO timestamp of the synthetic finish time.
 *   - `duration_ms` {number} : elapsed time in milliseconds between start and finish.
 *   - `exit_code` {number} : process exit code (0 for synthetic executions).
 *   - `stdout` {string} : simulated standard output for the test case.
 *   - `stderr` {string} : simulated standard error (empty string for synthetic executions).
 *   - `failure_class` {null|string} : failure classification (`null` for successful synthetic runs).
 */
function syntheticExecution(testCase, casePath, jsonMode, startedAt) {
  const finishedAt = new Date();
  return {
    command: "pnpm evals run " + casePath + (jsonMode ? " --json" : ""),
    input_command: testCase.input.command,
    execution_mode: "synthetic",
    started_at: startedAt.toISOString(),
    finished_at: finishedAt.toISOString(),
    duration_ms: finishedAt.getTime() - startedAt.getTime(),
    exit_code: 0,
    stdout: simulatedRunOutput(testCase),
    stderr: "",
    failure_class: null
  };
}

/**
 * Build a baseline-result object describing observed baseline artifact presence and its reference.
 *
 * @param {Object} testCase - The parsed test case; may include `baseline.artifact_path`, `baseline.expected_presence`, and `promotion.baseline_owner`.
 * @param {string} commandLogPath - Path to the command-log file used as a fallback artifact reference when no baseline artifact is present.
 * @param {Object} execution - Execution object whose JSON is used to compute a command-log SHA-256 when no baseline artifact is available.
 * @returns {Object} A schema v1 baseline object with the following properties:
 *  - `schema_version` {number} - Fixed to 1.
 *  - `presence_status` {"present"|"missing"} - Observed presence of the baseline artifact.
 *  - `comparison_status` {"error"|"not_compared"} - `"error"` when observed presence diverges from expected presence or the baseline path is invalid/unreadable.
 *  - `promotion_status` {string} - Always `"not_requested"`.
 *  - `baseline_owner` {string|undefined} - Owner from `testCase.promotion.baseline_owner`.
 *  - `comparison_evidence` {string} - Human-readable evidence describing observation or reasons for missing artifact.
 *  - `current_artifact_ref` {Object} - Reference to the current artifact with:
 *      - `type` {"baseline-artifact"|"command-log"},
 *      - `path` {string} relative path to the referenced file,
 *      - `sha256` {string} SHA-256 hash of the referenced file or of the JSONified `execution` when using the command-log fallback.
 */
function buildBaseline(testCase, commandLogPath, execution) {
  const artifactPath = testCase.baseline?.artifact_path || null;
  const expectedPresence = testCase.baseline?.expected_presence || "missing";
  const errors = [];
  let comparisonHasError = false;
  let presenceStatus = "missing";
  let evidence = "No baseline artifact_path provided; observed baseline presence is missing.";
  let currentArtifactRef = {
    type: "command-log",
    path: rel(commandLogPath),
    sha256: sha256Text(JSON.stringify(execution, null, 2) + "\n")
  };

  if (artifactPath) {
    const absoluteBaselinePath = repoRelativePath(artifactPath, "baseline.artifact_path", errors);
    if (errors.length > 0) comparisonHasError = true;
    if (absoluteBaselinePath && existsSync(absoluteBaselinePath)) {
      try {
        const baselineStats = statSync(absoluteBaselinePath);
        if (baselineStats.isFile()) {
          presenceStatus = "present";
          currentArtifactRef = {
            type: "baseline-artifact",
            path: rel(absoluteBaselinePath),
            sha256: sha256File(absoluteBaselinePath)
          };
          evidence = "Observed baseline artifact at " + rel(absoluteBaselinePath) + " with sha256 " + currentArtifactRef.sha256 + ".";
        } else {
          comparisonHasError = true;
          evidence = "Expected baseline artifact path exists but is not a readable file: " + rel(absoluteBaselinePath) + ".";
        }
      } catch (error) {
        comparisonHasError = true;
        evidence = "Expected baseline artifact path could not be read: " + rel(absoluteBaselinePath) + " (" + error.message + ").";
      }
    } else {
      const reason = errors.length > 0 ? errors.join("; ") : "baseline artifact does not exist: " + artifactPath;
      evidence = "Expected baseline artifact path was not observed: " + reason + ".";
    }
  }

  return {
    schema_version: 1,
    presence_status: presenceStatus,
    comparison_status: expectedPresence !== presenceStatus || comparisonHasError ? "error" : "not_compared",
    promotion_status: "not_requested",
    baseline_owner: testCase.promotion.baseline_owner,
    comparison_evidence: evidence,
    current_artifact_ref: currentArtifactRef
  };
}

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

  const resultPath = join(repoRoot, expectedLatestPath(runId, "result_path"));
  const reportPath = join(repoRoot, expectedLatestPath(runId, "report_path"));
  const commandLogPath = join(repoRoot, expectedLatestPath(runId, "command_log_path"));
  const manifestPath = join(repoRoot, expectedLatestPath(runId, "manifest_path"));
  const scorerResultsPath = join(repoRoot, expectedLatestPath(runId, "scorer_results_path"));
  const baselineResultPath = join(repoRoot, expectedLatestPath(runId, "baseline_result_path"));
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

  const execution = syntheticExecution(testCase, casePath, jsonMode, startedAt);
  const baseline = buildBaseline(testCase, commandLogPath, execution);

  const scorerResults = scoreRuntime(testCase, execution)
    .concat(scoreArtifactCompleteness(testCase, artifactNames))
    .concat(scoreBaselinePresence(testCase, baseline));
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
    execution_mode: execution.execution_mode,
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
    execution_mode: execution.execution_mode,
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
    execution_mode: execution.execution_mode,
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
    console.log("execution_mode: " + output.execution_mode);
    console.log("manifest: " + output.manifest_path);
    console.log("result: " + output.result_path);
    console.log("report: " + output.report_path);
    console.log("command_log: " + output.command_log_path);
  }
  clearActiveRunContext();
  process.exit(deterministicVerdict === "pass" ? 0 : 1);
}
