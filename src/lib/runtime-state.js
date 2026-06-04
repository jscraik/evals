import { existsSync } from "node:fs";
import { join } from "node:path";

import { latestArtifactContracts } from "./artifact-bundle.js";
import { classifyAuthority } from "./authority-classifier.js";
import { buildRuntimeEvidencePacket } from "./claim-evidence-contract.js";
import { loadExternalProjectManifestState } from "./external-project-manifest.js";
import { readJson } from "./json.js";
import { validateLatestRun } from "./latest-run.js";
import { relFrom, rootRelativePath, repoRoot } from "./paths.js";
import { proofBoundary, validationCommandForArtifactRoot } from "./proof-boundary.js";
import { isDefaultRepoRoot } from "./repo-root-option.js";
import { validateRuntimeEvidenceSuite } from "./runtime-evidence-contract.js";
import { schemaCheckFromObject } from "./schema.js";

const canonicalLatestPath = ".harness/evals/runs/latest.json";

/**
 * Build the current runtime state packet from local artifact evidence.
 *
 * @param {Date} [now=new Date()] - Timestamp source for deterministic tests.
 * @param {Object} [options] - Optional runtime-state controls.
 * @param {string} [options.artifactRepoRoot] - Repository root whose latest artifact packet should be inspected.
 * @returns {{schema_version: number, generated_at: string, status: string, latest_path: string, latest: object, artifacts: Array, validation: object, contract_health: object, non_ready_reason_code: string | null, recommended_commands: string[]}}
 *   A schema-backed runtime state packet describing the current latest pointer,
 *   artifact presence, validation status, and recommended next commands.
 */
export function buildRuntimeState(now = new Date(), options = {}) {
  if (!(now instanceof Date)) {
    options = now || {};
    now = new Date();
  }
  const artifactRepoRoot = options.artifactRepoRoot || repoRoot;
  const defaultRepoRoot = isDefaultRepoRoot(artifactRepoRoot);
  const latestPath = join(artifactRepoRoot, canonicalLatestPath);
  const latestDisplayPath = defaultRepoRoot ? canonicalLatestPath : relFrom(artifactRepoRoot, latestPath);
  const runtimeEvidenceHealth = runtimeEvidenceContractHealth({ enabled: defaultRepoRoot });
  const manifestState = defaultRepoRoot ? null : loadExternalProjectManifestState(artifactRepoRoot);
  const missingCommands = defaultRepoRoot
    ? [
        "pnpm evals run fixtures/smoke/pr-closeout.case.json --json",
        "pnpm evals check --json"
      ]
    : [
        "pnpm evals run <repo-local .evals/suite.json> --json",
        validationCommandForArtifactRoot(artifactRepoRoot)
      ];
  const readyCommands = defaultRepoRoot
    ? ["pnpm evals check --json", "pnpm verify"]
    : [validationCommandForArtifactRoot(artifactRepoRoot)];
  const base = {
    schema_version: 3,
    generated_at: now.toISOString(),
    ...proofBoundary({ artifactRepoRoot }),
    status: "missing",
    latest_path: latestDisplayPath,
    latest: {
      status: "missing",
      run_id: null,
      case_id: null,
      execution_mode: null
    },
    artifacts: latestArtifactContracts.map((contract) => ({
      key: contract.key,
      type: contract.type,
      path: null,
      status: "not_applicable",
      reason: "latest pointer is missing"
    })),
    validation: {
      status: "not_run",
      errors: []
    },
    contract_health: {
      runtime_evidence: runtimeEvidenceHealth
    },
    ...(defaultRepoRoot ? {} : {
      authority_classification: classifyAuthority({
        manifestState,
        runtimeEvidence: {
          status: runtimeEvidenceHealth.status,
          policy_status: runtimeEvidenceHealth.policy_coverage_status,
          required: manifestState?.manifest?.runtime_evidence_policy?.required === true
        },
        latestValidation: { status: "not_run", errors: [] }
      })
    }),
    non_ready_reason_code: runtimeEvidenceBlocks(runtimeEvidenceHealth) ? "runtime_evidence_failed" : "latest_missing",
    recommended_commands: missingCommands
  };

  if (!existsSync(latestPath)) {
    return finalizeRuntimeState({
      ...base,
      status: runtimeEvidenceBlocks(runtimeEvidenceHealth) ? "invalid" : "missing",
      validation: runtimeEvidenceValidationState({ status: "not_run", errors: [] }, runtimeEvidenceHealth)
    }, null, runtimeEvidenceHealth, artifactRepoRoot);
  }

  let latest;
  try {
    latest = readJson(latestPath);
  } catch (error) {
    const latestValidation = {
      status: "failed",
      errors: [relFrom(artifactRepoRoot, latestPath) + ": JSON parse failed: " + error.message]
    };
    const validation = runtimeEvidenceValidationState(latestValidation, runtimeEvidenceHealth);
    return finalizeRuntimeState({
      ...base,
      status: "invalid",
      latest: {
        status: "invalid",
        run_id: null,
        case_id: null,
        execution_mode: null
      },
      artifacts: latestArtifactContracts.map((contract) => ({
        key: contract.key,
        type: contract.type,
        path: null,
        status: "not_applicable",
        reason: "latest pointer is not parseable JSON"
      })),
      validation,
      non_ready_reason_code: nonReadyReason("invalid", {
        latestStatus: "invalid",
        hasInvalidArtifact: false,
        hasMissingArtifact: false,
        latestValidationStatus: latestValidation.status,
        runtimeEvidenceHealth
      })
    }, null, runtimeEvidenceHealth, artifactRepoRoot);
  }

  const latestCheck = schemaCheckFromObject("latest", latest, latestPath);
  const artifacts = artifactStates(latest, artifactRepoRoot);
  const validation = validateLatestRun(latestPath, { artifactRepoRoot });
  const hasInvalidArtifact = artifacts.some((artifact) => artifact.status === "invalid");
  const hasMissingArtifact = artifacts.some((artifact) => artifact.status === "missing");
  const hasRuntimeEvidenceFailure = runtimeEvidenceBlocks(runtimeEvidenceHealth);
  const latestStatus = latestCheck.status === "pass" ? "present" : "invalid";
  const status = latestStatus === "invalid" || hasInvalidArtifact || hasRuntimeEvidenceFailure
    ? "invalid"
    : hasMissingArtifact || validation.status !== "passed"
      ? "stale"
      : "ready";
  const nonReadyReasonCode = nonReadyReason(status, {
    latestStatus,
    hasInvalidArtifact,
    hasMissingArtifact,
    latestValidationStatus: validation.status,
    runtimeEvidenceHealth
  });

  return finalizeRuntimeState({
    ...base,
    status,
    latest: {
      status: latestStatus,
      run_id: stringOrNull(latest.run_id),
      case_id: stringOrNull(latest.case_id),
      execution_mode: latest.execution_mode === "synthetic" || latest.execution_mode === "real" ? latest.execution_mode : null
    },
    artifacts,
    validation: runtimeEvidenceValidationState(validation, runtimeEvidenceHealth),
    ...(defaultRepoRoot ? {} : {
      authority_classification: classifyAuthority({
        manifestState,
        runtimeEvidence: {
          status: runtimeEvidenceHealth.status,
          policy_status: runtimeEvidenceHealth.policy_coverage_status,
          required: manifestState?.manifest?.runtime_evidence_policy?.required === true
        },
        latestValidation: validation
      })
    }),
    non_ready_reason_code: nonReadyReasonCode,
    recommended_commands: status === "ready" ? readyCommands : missingCommands
  }, latest, runtimeEvidenceHealth, artifactRepoRoot);
}

function runtimeEvidenceContractHealth(options = {}) {
  if (options.enabled === false) {
    const policyCoverage = runtimeEvidencePolicyCoverage("not_configured");
    return {
      status: "not_configured",
      policy_coverage_status: "not_configured",
      policy_coverage: policyCoverage,
      check_count: 0,
      errors: []
    };
  }
  try {
    const validation = validateRuntimeEvidenceSuite();
    return {
      status: validation.errors.length === 0 ? "ready" : "failing",
      policy_coverage_status: validation.policy_coverage?.status || "unavailable",
      policy_coverage: validation.policy_coverage || { status: "unavailable", families: [], errors: [] },
      check_count: validation.checks.length,
      errors: validation.errors
    };
  } catch (error) {
    const errors = ["runtime evidence validation unavailable: " + error.message];
    return {
      status: "unavailable",
      policy_coverage_status: "unavailable",
      policy_coverage: runtimeEvidencePolicyCoverage("unavailable"),
      check_count: 0,
      errors
    };
  }
}

function runtimeEvidencePolicyCoverage(status, errors = []) {
  return { status, families: [], errors };
}

function runtimeEvidenceValidationState(latestValidation, runtimeEvidenceHealth) {
  const errors = latestValidation.errors.concat(runtimeEvidenceHealth.errors);
  const failed = latestValidation.status === "failed" || runtimeEvidenceBlocks(runtimeEvidenceHealth);
  return {
    status: failed ? "failed" : latestValidation.status,
    errors
  };
}

function nonReadyReason(status, facts) {
  if (status === "ready") return null;
  if (runtimeEvidenceBlocks(facts.runtimeEvidenceHealth)) return "runtime_evidence_failed";
  if (facts.latestStatus === "invalid") return "latest_invalid";
  if (facts.hasInvalidArtifact) return "artifact_invalid";
  if (facts.hasMissingArtifact) return "artifact_missing";
  if (facts.latestValidationStatus !== "passed") return "latest_validation_failed";
  return "latest_missing";
}

function runtimeEvidenceBlocks(runtimeEvidenceHealth) {
  return runtimeEvidenceHealth.status !== "ready" && runtimeEvidenceHealth.status !== "not_configured";
}

function artifactStates(latest, artifactRepoRoot) {
  return latestArtifactContracts.map((contract) => {
    const path = latest?.[contract.key];
    const errors = [];
    const artifactPath = rootRelativePath(artifactRepoRoot, path, "latest." + contract.key, errors);
    if (!artifactPath) {
      return {
        key: contract.key,
        type: contract.type,
        path: typeof path === "string" ? path : null,
        status: "invalid",
        reason: errors.join("; ")
      };
    }
    if (!existsSync(artifactPath)) {
      return {
        key: contract.key,
        type: contract.type,
        path,
        status: "missing",
        reason: "path does not exist"
      };
    }
    return {
      key: contract.key,
      type: contract.type,
      path,
      status: "present",
      reason: null
    };
  });
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function finalizeRuntimeState(packet, rawLatest, runtimeEvidenceHealth, artifactRepoRoot) {
  return withSchemaGuard({
    ...packet,
    evidence_packet: buildRuntimeEvidencePacket({
      artifactRepoRoot,
      generatedAt: packet.generated_at,
      status: packet.status,
      latestPath: packet.latest_path,
      latest: rawLatest ? { ...packet.latest, ...rawLatest } : packet.latest,
      artifacts: packet.artifacts,
      validation: packet.validation,
      runtimeEvidenceHealth,
      nonReadyReasonCode: packet.non_ready_reason_code,
      recommendedCommands: packet.recommended_commands
    })
  }, artifactRepoRoot);
}

function withSchemaGuard(packet, artifactRepoRoot = repoRoot) {
  const check = schemaCheckFromObject("state", packet, join(artifactRepoRoot, canonicalLatestPath));
  if (check.status === "pass") return packet;
  return {
    ...packet,
    status: "invalid",
    validation: {
      status: "failed",
      errors: packet.validation.errors.concat(check.errors.map((error) => "runtime state " + error))
    }
  };
}
