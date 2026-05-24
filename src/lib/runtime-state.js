import { existsSync } from "node:fs";
import { join } from "node:path";

import { latestArtifactContracts } from "./artifact-bundle.js";
import { buildRuntimeEvidencePacket } from "./claim-evidence-contract.js";
import { readJson } from "./json.js";
import { validateLatestRun } from "./latest-run.js";
import { rel, repoRelativePath, repoRoot } from "./paths.js";
import { validateRuntimeEvidenceSuite } from "./runtime-evidence-contract.js";
import { schemaCheckFromObject } from "./schema.js";

const canonicalLatestPath = ".harness/evals/runs/latest.json";

/**
 * Build the current runtime state packet from local artifact evidence.
 *
 * @param {Date} [now=new Date()] - Timestamp source for deterministic tests.
 * @returns {{schema_version: number, generated_at: string, status: string, latest_path: string, latest: object, artifacts: Array, validation: object, contract_health: object, non_ready_reason_code: string | null, recommended_commands: string[]}}
 *   A schema-backed runtime state packet describing the current latest pointer,
 *   artifact presence, validation status, and recommended next commands.
 */
export function buildRuntimeState(now = new Date()) {
  const latestPath = join(repoRoot, canonicalLatestPath);
  const runtimeEvidenceHealth = runtimeEvidenceContractHealth();
  const base = {
    schema_version: 2,
    generated_at: now.toISOString(),
    status: "missing",
    latest_path: canonicalLatestPath,
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
    non_ready_reason_code: runtimeEvidenceHealth.status === "ready" ? "latest_missing" : "runtime_evidence_failed",
    recommended_commands: [
      "pnpm evals run fixtures/smoke/pr-closeout.case.json --json",
      "pnpm evals check --json"
    ]
  };

  if (!existsSync(latestPath)) {
    return finalizeRuntimeState({
      ...base,
      status: runtimeEvidenceHealth.status === "ready" ? "missing" : "invalid",
      validation: runtimeEvidenceValidationState({ status: "not_run", errors: [] }, runtimeEvidenceHealth)
    }, null, runtimeEvidenceHealth);
  }

  let latest;
  try {
    latest = readJson(latestPath);
  } catch (error) {
    const latestValidation = {
      status: "failed",
      errors: [rel(latestPath) + ": JSON parse failed: " + error.message]
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
    }, null, runtimeEvidenceHealth);
  }

  const latestCheck = schemaCheckFromObject("latest", latest, latestPath);
  const artifacts = artifactStates(latest);
  const validation = validateLatestRun(latestPath);
  const hasInvalidArtifact = artifacts.some((artifact) => artifact.status === "invalid");
  const hasMissingArtifact = artifacts.some((artifact) => artifact.status === "missing");
  const hasRuntimeEvidenceFailure = runtimeEvidenceHealth.status !== "ready";
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
    non_ready_reason_code: nonReadyReasonCode,
    recommended_commands: status === "ready"
      ? ["pnpm evals check --json", "pnpm verify"]
      : ["pnpm evals run fixtures/smoke/pr-closeout.case.json --json", "pnpm evals check --json"]
  }, latest, runtimeEvidenceHealth);
}

function runtimeEvidenceContractHealth() {
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
    return {
      status: "unavailable",
      policy_coverage_status: "unavailable",
      policy_coverage: { status: "unavailable", families: [], errors: [] },
      check_count: 0,
      errors: ["runtime evidence validation unavailable: " + error.message]
    };
  }
}

function runtimeEvidenceValidationState(latestValidation, runtimeEvidenceHealth) {
  const errors = latestValidation.errors.concat(runtimeEvidenceHealth.errors);
  const failed = latestValidation.status === "failed" || runtimeEvidenceHealth.status !== "ready";
  return {
    status: failed ? "failed" : latestValidation.status,
    errors
  };
}

function nonReadyReason(status, facts) {
  if (status === "ready") return null;
  if (facts.runtimeEvidenceHealth.status !== "ready") return "runtime_evidence_failed";
  if (facts.latestStatus === "invalid") return "latest_invalid";
  if (facts.hasInvalidArtifact) return "artifact_invalid";
  if (facts.hasMissingArtifact) return "artifact_missing";
  if (facts.latestValidationStatus !== "passed") return "latest_validation_failed";
  return "latest_missing";
}

function artifactStates(latest) {
  return latestArtifactContracts.map((contract) => {
    const path = latest?.[contract.key];
    const errors = [];
    const artifactPath = repoRelativePath(path, "latest." + contract.key, errors);
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

function finalizeRuntimeState(packet, rawLatest, runtimeEvidenceHealth) {
  return withSchemaGuard({
    ...packet,
    evidence_packet: buildRuntimeEvidencePacket({
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
  });
}

function withSchemaGuard(packet) {
  const check = schemaCheckFromObject("state", packet, join(repoRoot, canonicalLatestPath));
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
