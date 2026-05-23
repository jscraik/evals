import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { rel, repoRoot } from "./paths.js";
import { schemaCheck, schemaTargets } from "./schema.js";

export const runtimeEvidenceFixtureDir = join(repoRoot, "fixtures", "runtime-evidence");

const runtimeEvidenceScorers = new Set(["permission-drift", "subagent-artifact-contract", "plugin-attribution"]);

const policyFamilies = [
  {
    family: "permissions",
    declarationPath: "declared_contract.permission_profile",
    scorerId: "permission-drift",
    errorCode: "RTE_POLICY_PERMISSION_UNSCORED",
    declared: () => true
  },
  {
    family: "subagent_artifacts",
    declarationPath: "declared_contract.artifact_contract",
    scorerId: "subagent-artifact-contract",
    errorCode: "RTE_POLICY_SUBAGENT_ARTIFACT_UNSCORED",
    declared: (contract) => contract.artifact_contract?.subagent_artifacts_required === true
  },
  {
    family: "plugin_attribution",
    declarationPath: "declared_contract.plugin_policy",
    scorerId: "plugin-attribution",
    errorCode: "RTE_POLICY_PLUGIN_UNSCORED",
    declared: (contract) => contract.plugin_policy?.plugin_id_required === true || contract.plugin_policy?.plugin_source_required === true
  },
  {
    family: "goal",
    declarationPath: "declared_contract.goal_policy",
    scaffoldKey: "goal",
    errorCode: "RTE_POLICY_GOAL_UNSCORED",
    declared: (contract) => Object.hasOwn(contract, "goal_policy")
  },
  {
    family: "thread",
    declarationPath: "declared_contract.thread_policy",
    scaffoldKey: "thread",
    errorCode: "RTE_POLICY_THREAD_UNSCORED",
    declared: (contract) => Object.hasOwn(contract, "thread_policy")
  },
  {
    family: "network",
    declarationPath: "declared_contract.network_policy",
    scaffoldKey: "network",
    errorCode: "RTE_POLICY_NETWORK_UNSCORED",
    declared: (contract) => Object.hasOwn(contract, "network_policy")
  },
  {
    family: "package_provenance",
    declarationPath: "declared_contract.package_provenance_policy",
    scaffoldKey: "package_provenance",
    errorCode: "RTE_POLICY_PACKAGE_PROVENANCE_UNSCORED",
    declared: (contract) => Object.hasOwn(contract, "package_provenance_policy")
  }
];

/**
 * Validate and score all local runtime-evidence contract fixtures.
 * @param {string} fixturesDir Directory containing runtime-evidence *.case.json files.
 * @returns {{checks: Array, errors: string[]}} Suite validation result.
 */
export function validateRuntimeEvidenceSuite(fixturesDir = runtimeEvidenceFixtureDir) {
  const checks = [];
  const errors = [];
  const policyCoverage = emptyPolicyCoverage();
  if (!existsSync(fixturesDir)) {
    const message = "runtime evidence fixture directory does not exist: " + rel(fixturesDir);
    return suiteFailure(fixturesDir, message);
  }
  let entries;
  try {
    if (!statSync(fixturesDir).isDirectory()) {
      const message = "runtime evidence fixture path is not a directory: " + rel(fixturesDir);
      return suiteFailure(fixturesDir, message);
    }
    entries = readdirSync(fixturesDir);
  } catch (error) {
    return suiteFailure(fixturesDir, "runtime evidence fixture suite is unreadable: " + error.message);
  }

  const caseFiles = entries
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
    mergePolicyCoverage(policyCoverage, check.policy_coverage);
  }

  policyCoverage.status = policyCoverage.errors.length === 0 ? "pass" : "fail";
  return { checks, errors, policy_coverage: policyCoverage };
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
    errors: [message],
    policy_coverage: {
      status: "fail",
      families: [],
      errors: [message]
    }
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
  const policyCoverage = policyCoverageForCase(testCase);
  const scored = scoreRuntimeEvidenceCase(testCase);
  const expectationErrors = scorerErrors.concat(policyCoverage.errors, expectationDriftErrors(testCase, scored));
  return runtimeEvidenceCheck(dataPath, "runtime evidence: " + testCase.case_id, expectationErrors, scored.scorer_results, policyCoverage);
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

function runtimeEvidenceCheck(dataPath, label, errors, scorerResults, policyCoverage = emptyPolicyCoverage()) {
  return {
    label,
    schema_path: rel(schemaTargets.runtimeEvidenceCase.schema),
    data_path: dataPath,
    status: errors.length === 0 ? "pass" : "fail",
    errors,
    scorer_results: scorerResults,
    policy_coverage: policyCoverage
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

function emptyPolicyCoverage() {
  return {
    status: "pass",
    families: [],
    errors: []
  };
}

function mergePolicyCoverage(target, source) {
  if (!source) return;
  target.families.push(...source.families);
  target.errors.push(...source.errors);
  target.status = target.errors.length === 0 ? "pass" : "fail";
}

function policyCoverageForCase(testCase) {
  const coverage = emptyPolicyCoverage();
  const contract = testCase.declared_contract;
  const scorers = new Set(testCase.scorers);
  const scaffolds = contract.policy_scaffolds || {};

  for (const family of policyFamilies) {
    if (!family.declared(contract)) continue;
    if (family.scorerId) {
      if (scorers.has(family.scorerId)) {
        coverage.families.push({
          case_id: testCase.case_id,
          family: family.family,
          declaration_path: family.declarationPath,
          enforcement_status: "implemented_enforced",
          scorer_id: family.scorerId
        });
      } else {
        const error = policyCoverageError(testCase.case_id, family, "missing enforcing scorer " + family.scorerId);
        coverage.families.push(missingCoverageEntry(testCase.case_id, family, error));
        coverage.errors.push(error.code + ": " + error.message);
      }
      continue;
    }

    const scaffold = scaffolds[family.scaffoldKey];
    if (scaffold?.status === "scaffolded_not_enforced" && scaffold.reason) {
      coverage.families.push({
        case_id: testCase.case_id,
        family: family.family,
        declaration_path: family.declarationPath,
        enforcement_status: "scaffolded_not_enforced",
        scaffold_reason: scaffold.reason
      });
    } else {
      const error = policyCoverageError(testCase.case_id, family, "declared without scaffolded_not_enforced status and reason");
      coverage.families.push(missingCoverageEntry(testCase.case_id, family, error));
      coverage.errors.push(error.code + ": " + error.message);
    }
  }

  coverage.status = coverage.errors.length === 0 ? "pass" : "fail";
  return coverage;
}

function policyCoverageError(caseId, family, reason) {
  return {
    code: family.errorCode,
    message: "case " + caseId + " policy family " + family.family + " at " + family.declarationPath + " has missing enforcement: " + reason
  };
}

function missingCoverageEntry(caseId, family, error) {
  return {
    case_id: caseId,
    family: family.family,
    declaration_path: family.declarationPath,
    enforcement_status: "missing_enforcement",
    error_code: error.code,
    failure_reason: error.message
  };
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

  const starts = new Map();
  const expectedBySubagent = new Map();
  const writtenByIdentity = new Map();
  const errors = [];
  const bump = (map, key) => map.set(key, (map.get(key) || 0) + 1);
  const push = (map, key, value) => {
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(value);
  };
  for (const event of testCase.observed_events) {
    if (event.type === "SubagentStart") {
      if (!event.subagent_id) errors.push("SubagentStart missing subagent_id");
      if (!event.role) errors.push("SubagentStart " + event.subagent_id + " missing role");
      if (!event.reason) errors.push("SubagentStart " + event.subagent_id + " missing reason");
      if (event.subagent_id) bump(starts, event.subagent_id);
    }
    if (event.type === "ArtifactExpected") {
      const identity = artifactIdentity(event, "ArtifactExpected", errors);
      if (identity) {
        push(expectedBySubagent, event.subagent_id, identity);
      }
    }
    if (event.type === "ArtifactWritten") {
      const identity = artifactIdentity(event, "ArtifactWritten", errors);
      if (identity) {
        push(writtenByIdentity, identity.key, event);
      }
    }
  }

  const writtenBySubagent = new Map();
  for (const [identityKey, events] of writtenByIdentity) {
    for (const event of events) {
      bump(writtenBySubagent, event.subagent_id);
    }
    if (events.length > 1) {
      errors.push("ArtifactWritten identity " + identityKey + " has ambiguous duplicate write events: " + events.map(eventLabel).join(", "));
    }
  }

  for (const [subagentId, startCount] of starts) {
    const expectedIdentities = expectedBySubagent.get(subagentId) || [];
    if (expectedIdentities.length < startCount) {
      errors.push("SubagentStart " + subagentId + " has fewer ArtifactExpected events than starts");
    }
    if ((writtenBySubagent.get(subagentId) || 0) < startCount) {
      errors.push("SubagentStart " + subagentId + " has fewer ArtifactWritten events than starts");
    }
  }

  for (const [subagentId, identities] of expectedBySubagent) {
    for (const identity of identities) {
      const writtenEvents = writtenByIdentity.get(identity.key) || [];
      if (writtenEvents.length === 0) {
        errors.push("ArtifactExpected " + identity.event_id + " for " + subagentId + " is missing matching ArtifactWritten identity " + identity.key);
        continue;
      }
      const matchingSubagent = writtenEvents.some((event) => event.subagent_id === subagentId);
      if (!matchingSubagent) {
        errors.push("ArtifactExpected " + identity.event_id + " for " + subagentId + " only has ArtifactWritten events from a different subagent for identity " + identity.key);
      }
    }
  }

  return {
    scorer_id: "subagent-artifact-contract",
    scorer_version: "1.1.0",
    status: errors.length === 0 ? "pass" : "fail",
    failure_class: errors.length === 0 ? null : "missing_subagent_artifact",
    inputs_inspected: ["observed_events.SubagentStart", "observed_events.ArtifactExpected", "observed_events.ArtifactWritten"],
    evidence: errors.length === 0 ? "every SubagentStart has expected and written artifact identity evidence" : errors.join("; "),
    failure_reason: errors.length === 0 ? null : "subagent lifecycle evidence is missing required artifact identity closeout"
  };
}

function artifactIdentity(event, eventType, errors) {
  const label = eventType + " " + eventLabel(event);
  if (!event.subagent_id) {
    errors.push(label + " missing subagent_id");
    return null;
  }
  if (!event.artifact_type) {
    errors.push(label + " missing artifact_type");
    return null;
  }
  if (!event.artifact_path) {
    errors.push(label + " missing artifact_path");
    return null;
  }
  const artifactType = String(event.artifact_type).trim();
  if (artifactType.length === 0) {
    errors.push(label + " has blank artifact_type");
    return null;
  }
  const artifactPath = normalizeArtifactPath(event.artifact_path);
  if (!artifactPath) {
    errors.push(label + " has unsafe artifact_path " + event.artifact_path);
    return null;
  }
  return {
    event_id: eventLabel(event),
    subagent_id: event.subagent_id,
    artifact_type: artifactType,
    artifact_path: artifactPath,
    key: artifactType + ":" + artifactPath
  };
}

function normalizeArtifactPath(artifactPath) {
  if (typeof artifactPath !== "string") return null;
  const normalizedSeparators = artifactPath.trim().replace(/\\/g, "/");
  if (normalizedSeparators.length === 0 || normalizedSeparators.startsWith("/")) return null;
  const segments = [];
  for (const segment of normalizedSeparators.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") return null;
    segments.push(segment);
  }
  if (segments.length === 0) return null;
  return segments.join("/");
}

function eventLabel(event) {
  return event.event_id || "unknown-event";
}

function scorePluginAttribution(testCase) {
  const policy = testCase.declared_contract.plugin_policy;
  const errors = [];
  for (const event of testCase.observed_events) {
    if (event.type !== "ToolCallObserved") continue;
    if (!event.source) {
      errors.push("tool-call event " + event.event_id + " missing source");
      continue;
    }
    if (event.source !== "plugin") continue;
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
