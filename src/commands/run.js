import { existsSync, statSync, writeFileSync } from "node:fs";
import { join, sep } from "node:path";

import { expectedLatestPath } from "../lib/artifact-bundle.js";
import { failedAssertionsFromScorerResults } from "../lib/assertion-results.js";
import { parseCase } from "../lib/case-contract.js";
import { clearActiveRunContext, emitFailure, setActiveRunContext } from "../lib/failures.js";
import { sha256File, sha256Text } from "../lib/hash.js";
import { readJson, writeJson, writeJsonAtomic } from "../lib/json.js";
import { validateLatestRun } from "../lib/latest-run.js";
import { relFrom, repoRelativePath, repoRoot, rootRelativePath } from "../lib/paths.js";
import { buildReport } from "../lib/report.js";
import { createRunBundle } from "../lib/run-bundle.js";
import { scoreArtifactCompleteness, scoreBaselinePresence, scoreRuntime, simulatedRunOutput, simulatedRunOutputLines, verdictFor } from "../lib/scoring.js";
import { isSuitePath, loadSuite } from "../lib/suite-contract.js";
import { buildTraceEvents, writeTraceEvents } from "../lib/trace-events.js";

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
function syntheticExecution(testCase, casePath, jsonMode, startedAt, context = {}) {
  const finishedAt = new Date();
  const outputFormat = jsonMode ? "json" : "text";
  const stdout = jsonMode
    ? JSON.stringify({
      case_id: testCase.case_id,
      suite_id: testCase.suite_id,
      execution_mode: "synthetic",
      artifact_root: context.artifactRoot,
      logs: simulatedRunOutputLines(testCase)
    }, null, 2)
    : simulatedRunOutput(testCase);
  return {
    command: "pnpm evals run " + casePath + (jsonMode ? " --json" : ""),
    input_command: testCase.input.command,
    execution_mode: "synthetic",
    output_format: outputFormat,
    started_at: startedAt.toISOString(),
    finished_at: finishedAt.toISOString(),
    duration_ms: finishedAt.getTime() - startedAt.getTime(),
    exit_code: 0,
    stdout,
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
function buildBaseline(testCase, commandLogPath, execution, options = {}) {
  const artifactRepoRoot = options.artifactRepoRoot || repoRoot;
  const artifactRel = (path) => relFrom(artifactRepoRoot, path);
  const artifactPath = testCase.baseline?.artifact_path || null;
  const expectedPresence = testCase.baseline?.expected_presence || "missing";
  const errors = [];
  let comparisonHasError = false;
  let presenceStatus = "missing";
  let evidence = "No baseline artifact_path provided; observed baseline presence is missing.";
  let currentArtifactRef = {
    type: "command-log",
    path: artifactRel(commandLogPath),
    sha256: sha256Text(JSON.stringify(execution, null, 2) + "\n")
  };

  if (artifactPath) {
    const absoluteBaselinePath = options.caseRoot
      ? rootRelativePath(options.caseRoot, artifactPath, "baseline.artifact_path", errors)
      : repoRelativePath(artifactPath, "baseline.artifact_path", errors);
    if (errors.length > 0) comparisonHasError = true;
    if (absoluteBaselinePath && existsSync(absoluteBaselinePath)) {
      try {
        const baselineStats = statSync(absoluteBaselinePath);
        if (baselineStats.isFile()) {
          presenceStatus = "present";
          currentArtifactRef = {
            type: "baseline-artifact",
            path: artifactRel(absoluteBaselinePath),
            sha256: sha256File(absoluteBaselinePath)
          };
          evidence = "Observed baseline artifact at " + artifactRel(absoluteBaselinePath) + " with sha256 " + currentArtifactRef.sha256 + ".";
        } else {
          comparisonHasError = true;
          evidence = "Expected baseline artifact path exists but is not a readable file: " + artifactRel(absoluteBaselinePath) + ".";
        }
      } catch (error) {
        comparisonHasError = true;
        evidence = "Expected baseline artifact path could not be read: " + artifactRel(absoluteBaselinePath) + " (" + error.message + ").";
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
export function executeCase(casePath, jsonMode, options = {}) {
  const artifactRepoRoot = options.artifactRepoRoot || repoRoot;
  const artifactRootPrefix = options.artifactRootPrefix || ".harness/evals/runs";
  const caseRoot = options.caseRoot || repoRoot;
  const displayCasePath = options.displayCasePath || casePath;
  const artifactRel = (path) => relFrom(artifactRepoRoot, path);
  const parseOptions = options.caseRoot ? { root: caseRoot } : {};
  const { rawCase, testCase } = parseCase(casePath, jsonMode, parseOptions);

  const startedAt = new Date();
  const { runId, runDir, artifactRoot } = createRunBundle({
    startedAt,
    caseId: testCase.case_id,
    rawCase,
    artifactRepoRoot,
    artifactRootPrefix
  });

  const resultPath = join(artifactRepoRoot, expectedLatestPath(runId, "result_path", artifactRootPrefix));
  const reportPath = join(artifactRepoRoot, expectedLatestPath(runId, "report_path", artifactRootPrefix));
  const commandLogPath = join(artifactRepoRoot, expectedLatestPath(runId, "command_log_path", artifactRootPrefix));
  const manifestPath = join(artifactRepoRoot, expectedLatestPath(runId, "manifest_path", artifactRootPrefix));
  const scorerResultsPath = join(artifactRepoRoot, expectedLatestPath(runId, "scorer_results_path", artifactRootPrefix));
  const baselineResultPath = join(artifactRepoRoot, expectedLatestPath(runId, "baseline_result_path", artifactRootPrefix));
  const traceEventsPath = join(artifactRepoRoot, expectedLatestPath(runId, "trace_events_path", artifactRootPrefix));
  const failurePath = join(runDir, "failure.json");
  const artifactPaths = [resultPath, reportPath, commandLogPath, manifestPath, scorerResultsPath, baselineResultPath, traceEventsPath];
  const artifactRelPaths = artifactPaths.map(artifactRel);
  const artifactNames = artifactPaths.map((path) => path.split(sep).at(-1));
  setActiveRunContext({
    runId,
    caseId: testCase.case_id,
    failurePath,
    artifactPaths
  });

  const execution = syntheticExecution(testCase, displayCasePath, jsonMode, startedAt, { artifactRoot });
  const baseline = buildBaseline(testCase, commandLogPath, execution, { artifactRepoRoot, caseRoot });

  const scorerContext = { reproduceCommand: execution.command };
  const scorerResults = scoreRuntime(testCase, execution, scorerContext)
    .concat(scoreArtifactCompleteness(testCase, artifactNames, scorerContext))
    .concat(scoreBaselinePresence(testCase, baseline, scorerContext));
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
    scorerResults,
    paths: artifactRelPaths
  });

  writeJson(commandLogPath, execution);
  writeJson(baselineResultPath, baseline);
  writeJson(scorerResultsPath, scorerEnvelope);
  writeFileSync(reportPath, report, "utf8");
  const latestPath = join(artifactRepoRoot, artifactRootPrefix, "latest.json");
  const draftTraceEvents = buildTraceEvents({
    runId,
    caseId: testCase.case_id,
    startedAt,
    finishedAt: new Date(),
    execution,
    deterministicVerdict,
    status,
    baseline,
    paths: {
      resultPath: artifactRel(resultPath),
      commandLogPath: artifactRel(commandLogPath),
      manifestPath: artifactRel(manifestPath),
      scorerResultsPath: artifactRel(scorerResultsPath),
      baselineResultPath: artifactRel(baselineResultPath),
      latestPath: artifactRel(latestPath)
    },
    validationStatus: "pending",
    validationErrors: []
  });
  writeTraceEvents(traceEventsPath, draftTraceEvents);

  const artifactRefs = [
    { type: "report", path: artifactRel(reportPath), sha256: sha256File(reportPath) },
    { type: "command-log", path: artifactRel(commandLogPath), sha256: sha256File(commandLogPath) },
    { type: "scorer-results", path: artifactRel(scorerResultsPath), sha256: sha256File(scorerResultsPath) },
    { type: "baseline-result", path: artifactRel(baselineResultPath), sha256: sha256File(baselineResultPath) },
    { type: "trace-events", path: artifactRel(traceEventsPath), sha256: sha256File(traceEventsPath) }
  ];
  const result = {
    schema_version: 1,
    run_id: runId,
    case_id: testCase.case_id,
    suite_id: testCase.suite_id,
    execution_mode: execution.execution_mode,
    status,
    deterministic_verdict: deterministicVerdict,
    scorer_results_path: artifactRel(scorerResultsPath),
    baseline_result_path: artifactRel(baselineResultPath),
    trace_events_path: artifactRel(traceEventsPath),
    failed_assertions: failedAssertionsFromScorerResults(scorerResults),
    artifact_refs: artifactRefs,
    errors: []
  };
  writeJson(resultPath, result);

  const manifestArtifacts = [
    { type: "result", path: artifactRel(resultPath), sha256: sha256File(resultPath), required: true },
    { type: "report", path: artifactRel(reportPath), sha256: sha256File(reportPath), required: true },
    { type: "command-log", path: artifactRel(commandLogPath), sha256: sha256File(commandLogPath), required: true },
    { type: "scorer-results", path: artifactRel(scorerResultsPath), sha256: sha256File(scorerResultsPath), required: true },
    { type: "baseline-result", path: artifactRel(baselineResultPath), sha256: sha256File(baselineResultPath), required: true },
    { type: "trace-events", path: artifactRel(traceEventsPath), sha256: sha256File(traceEventsPath), required: true }
  ];
  const manifest = {
    schema_version: 1,
    run_id: runId,
    case_id: testCase.case_id,
    created_at: startedAt.toISOString(),
    retention: {
      status: "retained_local",
      policy: "Retain committed phase-one run artifacts indefinitely in repository history until an explicit retention ADR supersedes this policy."
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

  const latest = {
    run_id: runId,
    case_id: testCase.case_id,
    suite_id: testCase.suite_id,
    execution_mode: execution.execution_mode,
    generated_at: startedAt.toISOString(),
    producer: buildProducerMetadata({
      artifactRepoRoot,
      artifactRootPrefix,
      casePath,
      displayCasePath,
      suitePath: options.suitePath || null,
      jsonMode,
      generatedAt: startedAt.toISOString()
    }),
    artifact_root: artifactRoot,
    manifest_path: artifactRel(manifestPath),
    result_path: artifactRel(resultPath),
    report_path: artifactRel(reportPath),
    command_log_path: artifactRel(commandLogPath),
    baseline_result_path: artifactRel(baselineResultPath),
    scorer_results_path: artifactRel(scorerResultsPath),
    trace_events_path: artifactRel(traceEventsPath)
  };
  const latestCandidatePath = join(runDir, "latest-candidate.json");
  writeJson(latestCandidatePath, latest);

  const preTraceValidation = validateLatestRun(latestCandidatePath, { artifactRepoRoot, artifactRootPrefix, validateTraceEvents: false });
  if (preTraceValidation.errors.length > 0) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "artifact schema validation",
      errors: preTraceValidation.errors,
      recovery: "Fix generated artifact shape before trusting this run."
    });
  }

  const traceEvents = buildTraceEvents({
    runId,
    caseId: testCase.case_id,
    startedAt,
    finishedAt: new Date(),
    execution,
    deterministicVerdict,
    status,
    baseline,
    paths: {
      resultPath: artifactRel(resultPath),
      commandLogPath: artifactRel(commandLogPath),
      manifestPath: artifactRel(manifestPath),
      scorerResultsPath: artifactRel(scorerResultsPath),
      baselineResultPath: artifactRel(baselineResultPath),
      latestPath: artifactRel(latestPath)
    },
    validationStatus: preTraceValidation.status,
    validationErrors: preTraceValidation.errors
  });
  writeTraceEvents(traceEventsPath, traceEvents);
  artifactRefs.find((artifact) => artifact.type === "trace-events").sha256 = sha256File(traceEventsPath);
  writeJson(resultPath, result);
  manifestArtifacts.find((artifact) => artifact.type === "trace-events").sha256 = sha256File(traceEventsPath);
  manifestArtifacts.find((artifact) => artifact.type === "result").sha256 = sha256File(resultPath);
  writeJson(manifestPath, manifest);

  writeJson(latestCandidatePath, latest);
  const validation = validateLatestRun(latestCandidatePath, { artifactRepoRoot, artifactRootPrefix });
  if (validation.errors.length > 0) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "artifact schema validation",
      errors: validation.errors,
      recovery: "Fix generated artifact shape before trusting this run."
    });
  }
  writeJsonAtomic(latestPath, latest);

  const output = {
    verdict: deterministicVerdict,
    status,
    run_id: runId,
    case_id: testCase.case_id,
    suite_id: testCase.suite_id,
    execution_mode: execution.execution_mode,
    artifact_root: artifactRoot,
    manifest_path: artifactRel(manifestPath),
    result_path: artifactRel(resultPath),
    report_path: artifactRel(reportPath),
    command_log_path: artifactRel(commandLogPath),
    baseline_path: artifactRel(baselineResultPath),
    baseline_result_path: artifactRel(baselineResultPath),
    scorer_results_path: artifactRel(scorerResultsPath),
    trace_events_path: artifactRel(traceEventsPath)
  };

  if (!options.suppressOutput) {
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
      console.log("trace_events: " + output.trace_events_path);
    }
  }
  clearActiveRunContext();
  return {
    output,
    exitCode: deterministicVerdict === "pass" ? 0 : 1
  };
}

function buildProducerMetadata(options) {
  const packageInfo = readJson(join(repoRoot, "package.json"));
  const sourcePath = options.suitePath || options.displayCasePath;
  return {
    package_name: packageInfo.name,
    package_version: packageInfo.version,
    command: "pnpm evals run " + sourcePath + (options.jsonMode ? " --json" : ""),
    generated_at: options.generatedAt,
    evaluated_repo_root: options.artifactRepoRoot === repoRoot ? "." : options.artifactRepoRoot,
    artifact_root_prefix: options.artifactRootPrefix,
    case_path: producerPath(options.artifactRepoRoot, options.casePath),
    case_sha256: sha256File(options.casePath),
    suite_path: options.suitePath ? producerPath(options.artifactRepoRoot, options.suitePath) : null,
    suite_sha256: options.suitePath ? sha256File(options.suitePath) : null
  };
}

function producerPath(root, path) {
  const relative = relFrom(root, path);
  return relative && !relative.split(/[\/]+/).includes("..") ? relative : path;
}

export function runCase(casePath, jsonMode) {
  const result = executeCase(casePath, jsonMode);
  process.exit(result.exitCode);
}

export function runSuite(suitePath, jsonMode) {
  const suiteRequest = loadSuite(suitePath);
  if (suiteRequest.errors.length > 0) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "suite validation",
      errors: suiteRequest.errors,
      checks: suiteRequest.checks,
      recovery: "Fix the suite contract, policy, or path references, then rerun the same command."
    });
  }

  const caseResults = suiteRequest.cases.map((casePath) =>
    executeCase(casePath, jsonMode, {
      caseRoot: suiteRequest.suiteRoot,
      artifactRepoRoot: suiteRequest.evaluatedRepoRoot,
      artifactRootPrefix: suiteRequest.artifactRootPrefix,
      displayCasePath: casePath,
      suitePath,
      suppressOutput: true
    }).output
  );
  const failed = caseResults.filter((result) => result.status !== "passed");
  const output = {
    status: failed.length === 0 ? "passed" : "failed",
    verdict: failed.length === 0 ? "pass" : "fail",
    suite_id: suiteRequest.suite.suite_id,
    owner_repo: suiteRequest.suite.owner_repo,
    domain: suiteRequest.suite.domain,
    evaluated_repo_root: suiteRequest.evaluatedRepoRoot,
    artifact_root_prefix: suiteRequest.artifactRootPrefix,
    case_results: caseResults
  };

  if (jsonMode) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log("suite: " + output.suite_id);
    console.log("status: " + output.status);
    for (const result of caseResults) {
      console.log(result.case_id + ": " + result.status + " (" + result.run_id + ")");
    }
  }
  process.exit(output.status === "passed" ? 0 : 1);
}

export function runTarget(targetPath, jsonMode) {
  if (isSuitePath(targetPath)) {
    runSuite(targetPath, jsonMode);
    return;
  }
  runCase(targetPath, jsonMode);
}
