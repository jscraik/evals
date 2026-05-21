import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { rel, repoRoot } from "./paths.js";
import { schemaCheck, schemaTargets } from "./schema.js";

export const runtimeEvidenceFixtureDir = join(repoRoot, "fixtures", "runtime-evidence");

const runtimeEvidenceScorers = new Set(["permission-drift", "subagent-artifact-contract", "plugin-attribution"]);

/**
 * Validate and score all local runtime-evidence contract fixtures.
 * @param {string} fixturesDir Directory containing runtime-evidence *.case.json files.
 * @returns {{checks: Array, errors: string[]}} Suite validation result.
 */
export function validateRuntimeEvidenceSuite(fixturesDir = runtimeEvidenceFixtureDir) {
  const checks = [];
  const errors = [];
  if (!existsSync(fixturesDir)) {
    const message = "runtime evidence fixture directory does not exist: " + rel(fixturesDir);
    return suiteFailure(fixturesDir, message);
  }

  const caseFiles = readdirSync(fixturesDir)
    .filter((entry) => entry.endsWith(".case.json"))
    .sort()
    .map((entry) => join(fixturesDir, entry));

  if (caseFiles.length === 0) {
    const message = "runtime evidence suite has no *.case.json fixtures";
    return suiteFailure(fixturesDir, message);
  }

  for (const casePath of caseFiles) {
    const check = validateRuntimeEvidenceCase(casePath);
    checks.push(check);
    errors.push(...check.errors.map((error) => check.label + " " + error));
  }

  return { checks, errors };
}

function suiteFailure(fixturesDir, message) {
  return {
    checks: [{
      label: "runtime evidence suite",
      schema_path: rel(schemaTargets.runtimeEvidenceCase.schema),
      data_path: rel(fixturesDir),
      status: "fail",
      errors: [message]
    }],
    errors: [message]
  };
}

/**
 * Validate and score one runtime-evidence contract fixture.
 * @param {string} casePath Runtime-evidence case file.
 * @returns {{label: string, schema_path: string, data_path: string, status: "pass" | "fail", errors: string[], scorer_results?: Array}}
 */
export function validateRuntimeEvidenceCase(casePath) {
  const schemaResult = schemaCheck("runtimeEvidenceCase", casePath);
  const dataPath = rel(casePath);
  let testCase;
  try {
    testCase = JSON.parse(readFileSync(casePath, "utf8"));
  } catch (error) {
    return runtimeEvidenceCheck(dataPath, "runtime evidence: unreadable case", [error.message], []);
  }

  if (schemaResult.errors.length > 0) {
    return runtimeEvidenceCheck(dataPath, "runtime evidence: " + (testCase.case_id || "schema-invalid"), schemaResult.errors, []);
  }

  const scorerErrors = unknownScorerErrors(testCase.scorers);
  const scored = scoreRuntimeEvidenceCase(testCase);
  const expectationErrors = scorerErrors.concat(expectationDriftErrors(testCase, scored));
  return runtimeEvidenceCheck(dataPath, "runtime evidence: " + testCase.case_id, expectationErrors, scored.scorer_results);
}

/**
 * Score a runtime-evidence fixture without reading from disk.
 * @param {object} testCase Parsed runtime-evidence fixture.
 * @returns {{verdict: "pass" | "fail" | "blocked", classification: string, scorer_results: Array}}
 */
export function scoreRuntimeEvidenceCase(testCase) {
  const results = [];
  if (testCase.scorers.includes("permission-drift")) {
    results.push(scorePermissionDrift(testCase));
  }
  if (testCase.scorers.includes("subagent-artifact-contract")) {
    results.push(scoreSubagentArtifactContract(testCase));
  }
  if (testCase.scorers.includes("plugin-attribution")) {
    results.push(scorePluginAttribution(testCase));
  }

  const blocking = results.find((result) => result.status === "blocked");
  const failing = results.find((result) => result.status === "fail");
  const verdict = blocking ? "blocked" : failing ? "fail" : "pass";
  return {
    verdict,
    classification: (blocking || failing)?.failure_class || "ok",
    scorer_results: results
  };
}

function runtimeEvidenceCheck(dataPath, label, errors, scorerResults) {
  return {
    label,
    schema_path: rel(schemaTargets.runtimeEvidenceCase.schema),
    data_path: dataPath,
    status: errors.length === 0 ? "pass" : "fail",
    errors,
    scorer_results: scorerResults
  };
}

function unknownScorerErrors(scorers) {
  return (Array.isArray(scorers) ? scorers : [])
    .filter((scorer) => !runtimeEvidenceScorers.has(scorer))
    .map((scorer) => "unknown runtime evidence scorer: " + scorer);
}

function expectationDriftErrors(testCase, scored) {
  const errors = [];
  if (scored.verdict !== testCase.expected.verdict) {
    errors.push("expected verdict " + testCase.expected.verdict + ", got " + scored.verdict);
  }
  if (scored.classification !== testCase.expected.classification) {
    errors.push("expected classification " + testCase.expected.classification + ", got " + scored.classification);
  }
  return errors;
}

function scorePermissionDrift(testCase) {
  const profile = testCase.declared_contract.permission_profile;
  const filesystem = profile.filesystem;
  const allowedReads = new Set(filesystem.read);
  const allowedWrites = new Set(filesystem.write);
  const deniedScopes = new Set(filesystem.deny);
  const drift = [];

  for (const event of testCase.observed_events) {
    if (event.type !== "ToolCallObserved") continue;
    if (event.path_scope && deniedScopes.has(event.path_scope)) {
      drift.push("event " + event.event_id + " touched denied scope " + event.path_scope);
    }
    if (event.effect === "filesystem_read" && !allowedReads.has(event.path_scope)) {
      drift.push("event " + event.event_id + " read outside declared read scopes");
    }
    if (event.effect === "filesystem_write" && !allowedWrites.has(event.path_scope)) {
      drift.push("event " + event.event_id + " wrote outside declared write scopes");
    }
    if (event.effect === "network_access" && profile.network !== true) {
      drift.push("event " + event.event_id + " used network while profile.network is false");
    }
  }

  if (testCase.resolved_runtime.approval_state === "disabled" && profile.approval_fallback === "read-only") {
    const writeOrNetwork = testCase.observed_events.filter((event) => event.effect === "filesystem_write" || event.effect === "network_access");
    if (writeOrNetwork.length > 0) {
      drift.push("approval disabled read-only fallback observed write or network effects");
    }
  }

  return {
    scorer_id: "permission-drift",
    scorer_version: "1.0.0",
    status: drift.length === 0 ? "pass" : "fail",
    failure_class: drift.length === 0 ? null : "permission_drift",
    inputs_inspected: [
      "declared_contract.permission_profile",
      "resolved_runtime.approval_state",
      "observed_events"
    ],
    evidence: drift.length === 0 ? "observed effects stayed within the declared permission profile" : drift.join("; "),
    failure_reason: drift.length === 0 ? null : "observed runtime effects exceeded the declared permission profile"
  };
}

function scoreSubagentArtifactContract(testCase) {
  if (testCase.declared_contract.artifact_contract.subagent_artifacts_required !== true) {
    return {
      scorer_id: "subagent-artifact-contract",
      scorer_version: "1.0.0",
      status: "pass",
      failure_class: null,
      inputs_inspected: ["declared_contract.artifact_contract.subagent_artifacts_required"],
      evidence: "subagent artifact evidence is not required by this case",
      failure_reason: null
    };
  }

  const expected = new Set();
  const written = new Set();
  const errors = [];
  for (const event of testCase.observed_events) {
    if (event.type === "SubagentStart") {
      if (!event.subagent_id) errors.push("SubagentStart missing subagent_id");
      if (!event.role) errors.push("SubagentStart " + event.subagent_id + " missing role");
      if (!event.reason) errors.push("SubagentStart " + event.subagent_id + " missing reason");
    }
    if (event.type === "ArtifactExpected" && event.subagent_id) expected.add(event.subagent_id);
    if (event.type === "ArtifactWritten" && event.subagent_id) written.add(event.subagent_id);
  }

  for (const event of testCase.observed_events.filter((item) => item.type === "SubagentStart")) {
    if (!expected.has(event.subagent_id)) errors.push("SubagentStart " + event.subagent_id + " has no ArtifactExpected event");
    if (!written.has(event.subagent_id)) errors.push("SubagentStart " + event.subagent_id + " has no ArtifactWritten event");
  }

  return {
    scorer_id: "subagent-artifact-contract",
    scorer_version: "1.0.0",
    status: errors.length === 0 ? "pass" : "fail",
    failure_class: errors.length === 0 ? null : "missing_subagent_artifact",
    inputs_inspected: ["observed_events.SubagentStart", "observed_events.ArtifactExpected", "observed_events.ArtifactWritten"],
    evidence: errors.length === 0 ? "every SubagentStart has expected and written artifact evidence" : errors.join("; "),
    failure_reason: errors.length === 0 ? null : "subagent lifecycle evidence is missing required artifact closeout"
  };
}

function scorePluginAttribution(testCase) {
  const policy = testCase.declared_contract.plugin_policy;
  const errors = [];
  for (const event of testCase.observed_events) {
    if (event.type !== "ToolCallObserved" || event.source !== "plugin") continue;
    if (policy.plugin_id_required && !event.plugin_id) errors.push("plugin event " + event.event_id + " missing plugin_id");
    if (policy.plugin_source_required && !event.plugin_source) errors.push("plugin event " + event.event_id + " missing plugin_source");
  }

  return {
    scorer_id: "plugin-attribution",
    scorer_version: "1.0.0",
    status: errors.length === 0 ? "pass" : "fail",
    failure_class: errors.length === 0 ? null : "plugin_attribution_missing",
    inputs_inspected: ["declared_contract.plugin_policy", "observed_events.ToolCallObserved"],
    evidence: errors.length === 0 ? "plugin-originated events include required attribution" : errors.join("; "),
    failure_reason: errors.length === 0 ? null : "plugin-originated runtime event is missing required attribution"
  };
}
