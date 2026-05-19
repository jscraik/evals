#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const schemaDir = join(repoRoot, "schemas");
let activeRunContext = null;

const schemaTargets = {
  case: {
    schema: join(schemaDir, "eval-case.schema.json"),
    label: "eval case"
  },
  result: {
    schema: join(schemaDir, "eval-result.schema.json"),
    label: "eval result"
  },
  manifest: {
    schema: join(schemaDir, "artifact-manifest.schema.json"),
    label: "artifact manifest"
  },
  scorers: {
    schema: join(schemaDir, "scorer-result.schema.json"),
    label: "scorer results"
  },
  baseline: {
    schema: join(schemaDir, "baseline-result.schema.json"),
    label: "baseline result"
  }
};

function usage(exitCode = 1) {
  const message = [
    "Usage:",
    "  pnpm evals run <case-file> [--json]",
    "  pnpm evals validate <case-file|latest.json> [--json]",
    "  pnpm evals check [--json]"
  ].join("\n");
  if (exitCode === 0) console.log(message);
  else console.error(message);
  process.exit(exitCode);
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeFailureArtifact(failure) {
  if (!activeRunContext) return;
  try {
    const partialArtifacts = activeRunContext.artifactPaths
      .filter((path) => existsSync(path))
      .map((path) => rel(path));
    writeJson(activeRunContext.failurePath, {
      schema_version: 1,
      run_id: activeRunContext.runId,
      case_id: activeRunContext.caseId,
      status: "failed",
      failure_class: "post_start",
      errors: failure.errors || ["unknown post-start failure"],
      recovery: failure.recovery || "Inspect partial artifacts, fix the failure, then rerun the same case.",
      partial_artifacts: partialArtifacts
    });
  } catch {
    // Best-effort only: the original failure remains the source of truth.
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
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

function insideRepo(path) {
  const absolutePath = resolve(repoRoot, path);
  if (absolutePath !== repoRoot && !absolutePath.startsWith(repoRoot + sep)) {
    throw new Error("path must be inside the evals repository: " + path);
  }
  return absolutePath;
}

function repoRelativePath(path, label, errors) {
  if (typeof path !== "string" || path.length === 0) {
    errors.push(label + ": path must be a non-empty string");
    return null;
  }
  if (isAbsolute(path)) {
    errors.push(label + ": path must be repository-relative: " + path);
    return null;
  }
  if (path.split(/[\\/]+/).includes("..")) {
    errors.push(label + ": path must not contain traversal segments: " + path);
    return null;
  }
  try {
    return insideRepo(path);
  } catch (error) {
    errors.push(label + ": " + error.message);
    return null;
  }
}

function emitFailure(jsonMode, failure) {
  writeFailureArtifact(failure);
  if (jsonMode) console.log(JSON.stringify(failure, null, 2));
  else console.error("failed: " + failure.errors.join("; "));
  process.exit(1);
}

function addError(errors, path, message) {
  errors.push(path + ": " + message);
}

function isType(value, type) {
  if (type === "array") return Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "null") return value === null;
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  return typeof value === type;
}

function validateWithSchema(value, schema, path = "$") {
  const errors = [];
  if (Array.isArray(schema.type)) {
    if (!schema.type.some((type) => isType(value, type))) {
      addError(errors, path, "expected type " + schema.type.join(" or "));
      return errors;
    }
  } else if (schema.type && !isType(value, schema.type)) {
    addError(errors, path, "expected type " + schema.type);
    return errors;
  }

  if ("const" in schema && value !== schema.const) addError(errors, path, "expected const " + JSON.stringify(schema.const));
  if (schema.enum && !schema.enum.includes(value)) addError(errors, path, "expected one of " + schema.enum.join(", "));
  if (schema.minLength !== undefined && typeof value === "string" && value.length < schema.minLength) {
    addError(errors, path, "must have length >= " + schema.minLength);
  }
  if (schema.pattern && typeof value === "string" && !new RegExp(schema.pattern).test(value)) {
    addError(errors, path, "must match pattern " + schema.pattern);
  }
  if (schema.format === "date-time" && typeof value === "string" && Number.isNaN(Date.parse(value))) {
    addError(errors, path, "must be a date-time string");
  }

  if (schema.type === "object" && value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required || []) {
      if (!(key in value)) addError(errors, path + "." + key, "missing required property");
    }
    const allowed = new Set(Object.keys(schema.properties || {}));
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) addError(errors, path + "." + key, "additional property is not allowed");
      }
    }
    for (const [key, childSchema] of Object.entries(schema.properties || {})) {
      if (key in value) errors.push(...validateWithSchema(value[key], childSchema, path + "." + key));
    }
  }

  if (schema.type === "array" && Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      addError(errors, path, "must contain at least " + schema.minItems + " items");
    }
    if (schema.uniqueItems) {
      const seen = new Set(value.map((item) => JSON.stringify(item)));
      if (seen.size !== value.length) addError(errors, path, "must contain unique items");
    }
    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(...validateWithSchema(item, schema.items, path + "[" + index + "]"));
      });
    }
  }

  return errors;
}

function validateDocument(schemaPath, dataPath) {
  let schema;
  try {
    schema = readJson(schemaPath);
  } catch (error) {
    return [rel(schemaPath) + ": schema JSON parse failed: " + error.message];
  }

  let data;
  try {
    data = readJson(dataPath);
  } catch (error) {
    return [rel(dataPath) + ": JSON parse failed: " + error.message];
  }

  return validateWithSchema(data, schema);
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

function scoreArtifactCompleteness(testCase, plannedArtifactNames) {
  if (!testCase.scorers.includes("artifact-completeness")) return [];
  const planned = new Set(plannedArtifactNames);
  const missing = testCase.expected.required_artifacts.filter((name) => !planned.has(name));
  return [{
    scorer_id: "artifact-completeness",
    scorer_version: "1.0.0",
    status: missing.length === 0 ? "pass" : "fail",
    inputs_inspected: ["expected.required_artifacts", "planned_final_artifact_set"],
    evidence: missing.length === 0 ? "all required artifact names are planned for the final bundle" : "missing from final plan: " + missing.join(", "),
    failure_reason: missing.length === 0 ? null : "required artifact missing from final artifact plan"
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
    paths.map((path) => "- " + path).join("\n") + "\n\n" +
    "## Judge Policy\n\nNo LLM judge output participates in pass, fail, block, promote, or closure decisions for this smoke run.\n";
}

function parseCase(casePath, jsonMode) {
  let absoluteCasePath;
  try {
    absoluteCasePath = insideRepo(casePath);
  } catch (error) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "case path",
      errors: [error.message],
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
  const schemaErrors = validateDocument(schemaTargets.case.schema, absoluteCasePath);
  const validationErrors = validateCase(absoluteCasePath, testCase);
  const errors = schemaErrors.concat(validationErrors);
  if (errors.length > 0) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "case validation",
      errors,
      recovery: "Fix the fixture or local case contract, then rerun the same command."
    });
  }
  return { absoluteCasePath, rawCase, testCase };
}

function runCase(casePath, jsonMode) {
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
  activeRunContext = {
    runId,
    caseId: testCase.case_id,
    failurePath,
    artifactPaths
  };

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
  activeRunContext = null;
  process.exit(deterministicVerdict === "pass" ? 0 : 1);
}

function schemaCheck(schemaKey, dataPath) {
  const target = schemaTargets[schemaKey];
  const errors = validateDocument(target.schema, dataPath);
  return {
    label: target.label,
    schema_path: rel(target.schema),
    data_path: rel(dataPath),
    status: errors.length === 0 ? "pass" : "fail",
    errors
  };
}

function validateLatestRun(latestPath) {
  const absoluteLatestPath = insideRepo(latestPath);
  const errors = [];
  let latest;
  try {
    latest = readJson(absoluteLatestPath);
  } catch (error) {
    return { status: "failed", errors: [error.message], checks: [] };
  }

  const requiredLatestKeys = ["manifest_path", "result_path", "report_path", "command_log_path", "baseline_result_path", "scorer_results_path"];
  const latestPaths = {};
  for (const key of requiredLatestKeys) {
    if (!latest[key]) errors.push("latest." + key + ": missing required path");
    else {
      const absolutePath = repoRelativePath(latest[key], "latest." + key, errors);
      if (absolutePath) {
        latestPaths[key] = absolutePath;
        if (!existsSync(absolutePath)) errors.push("latest." + key + ": path does not exist: " + latest[key]);
      }
    }
  }

  const checks = [];
  if (latestPaths.result_path) checks.push(schemaCheck("result", latestPaths.result_path));
  if (latestPaths.manifest_path) checks.push(schemaCheck("manifest", latestPaths.manifest_path));
  if (latestPaths.scorer_results_path) checks.push(schemaCheck("scorers", latestPaths.scorer_results_path));
  if (latestPaths.baseline_result_path) checks.push(schemaCheck("baseline", latestPaths.baseline_result_path));

  for (const check of checks) errors.push(...check.errors.map((error) => check.label + " " + error));

  if (latestPaths.manifest_path && existsSync(latestPaths.manifest_path)) {
    let manifest;
    try {
      manifest = readJson(latestPaths.manifest_path);
    } catch (error) {
      errors.push("artifact manifest JSON parse failed: " + error.message);
      manifest = null;
    }
    if (manifest) {
      for (const artifact of manifest.artifacts || []) {
        const artifactPath = repoRelativePath(artifact.path, "manifest artifact path", errors);
        if (!artifactPath) continue;
        if (!existsSync(artifactPath)) {
          errors.push("manifest artifact missing: " + artifact.path);
        } else {
          const actual = sha256File(artifactPath);
          if (actual !== artifact.sha256) errors.push("manifest hash mismatch: " + artifact.path);
        }
      }
    }
  }

  return {
    status: errors.length === 0 ? "passed" : "failed",
    latest_path: rel(absoluteLatestPath),
    run_id: latest.run_id,
    checks,
    errors
  };
}

function validateCaseFile(casePath) {
  const absoluteCasePath = insideRepo(casePath);
  return schemaCheck("case", absoluteCasePath);
}

function printValidation(validation, jsonMode) {
  if (jsonMode) {
    console.log(JSON.stringify(validation, null, 2));
    return;
  }
  console.log("status: " + validation.status);
  if (validation.run_id) console.log("run_id: " + validation.run_id);
  for (const check of validation.checks || [validation]) {
    console.log(check.status + ": " + check.label + " -> " + check.data_path);
  }
  for (const error of validation.errors || []) console.log("error: " + error);
}

function validateCommand(targetPath, jsonMode) {
  let absoluteTargetPath;
  try {
    absoluteTargetPath = insideRepo(targetPath);
  } catch (error) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "validation target path",
      errors: [error.message],
      recovery: "Pass a fixture or latest.json path under the repository, then rerun validation."
    });
  }
  let validation;
  if (absoluteTargetPath.endsWith(join(".harness", "evals", "runs", "latest.json"))) {
    validation = validateLatestRun(absoluteTargetPath);
  } else {
    const check = validateCaseFile(targetPath);
    validation = {
      status: check.status === "pass" ? "passed" : "failed",
      checks: [check],
      errors: check.errors
    };
  }
  printValidation(validation, jsonMode);
  process.exit(validation.status === "passed" ? 0 : 1);
}

function checkCommand(jsonMode) {
  const latestPath = join(repoRoot, ".harness", "evals", "runs", "latest.json");
  const caseCheck = validateCaseFile("fixtures/smoke/pr-closeout.case.json");
  const latestValidation = validateLatestRun(latestPath);
  const checks = [caseCheck].concat(latestValidation.checks);
  const errors = caseCheck.errors.concat(latestValidation.errors);
  const validation = {
    status: errors.length === 0 ? "passed" : "failed",
    latest_path: rel(latestPath),
    run_id: latestValidation.run_id,
    checks,
    errors
  };
  printValidation(validation, jsonMode);
  process.exit(validation.status === "passed" ? 0 : 1);
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) usage(0);
const jsonMode = args.includes("--json");
const positional = args.filter((arg) => arg !== "--json");

if (positional[0] === "run" && positional.length === 2) runCase(positional[1], jsonMode);
if (positional[0] === "validate" && positional.length === 2) validateCommand(positional[1], jsonMode);
if (positional[0] === "check" && positional.length === 1) checkCommand(jsonMode);
usage(1);
