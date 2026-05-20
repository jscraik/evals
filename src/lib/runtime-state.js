import { existsSync } from "node:fs";
import { join } from "node:path";

import { latestArtifactContracts } from "./artifact-bundle.js";
import { readJson } from "./json.js";
import { validateLatestRun } from "./latest-run.js";
import { rel, repoRelativePath, repoRoot } from "./paths.js";
import { schemaCheckFromObject } from "./schema.js";

const canonicalLatestPath = ".harness/evals/runs/latest.json";

/**
 * Build the current runtime state packet from local artifact evidence.
 *
 * @param {Date} [now=new Date()] - Timestamp source for deterministic tests.
 * @returns {{schema_version: number, generated_at: string, status: string, latest_path: string, latest: object, artifacts: Array, validation: object, recommended_commands: string[]}}
 *   A schema-backed runtime state packet describing the current latest pointer,
 *   artifact presence, validation status, and recommended next commands.
 */
export function buildRuntimeState(now = new Date()) {
  const latestPath = join(repoRoot, canonicalLatestPath);
  const base = {
    schema_version: 1,
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
    recommended_commands: [
      "pnpm evals run fixtures/smoke/pr-closeout.case.json --json",
      "pnpm evals check --json"
    ]
  };

  if (!existsSync(latestPath)) return withSchemaGuard(base);

  let latest;
  try {
    latest = readJson(latestPath);
  } catch (error) {
    return withSchemaGuard({
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
      validation: {
        status: "failed",
        errors: [rel(latestPath) + ": JSON parse failed: " + error.message]
      }
    });
  }

  const latestCheck = schemaCheckFromObject("latest", latest, latestPath);
  const artifacts = artifactStates(latest);
  const validation = validateLatestRun(latestPath);
  const hasInvalidArtifact = artifacts.some((artifact) => artifact.status === "invalid");
  const hasMissingArtifact = artifacts.some((artifact) => artifact.status === "missing");
  const latestStatus = latestCheck.status === "pass" ? "present" : "invalid";
  const status = latestStatus === "invalid" || hasInvalidArtifact
    ? "invalid"
    : hasMissingArtifact || validation.status !== "passed"
      ? "stale"
      : "ready";

  return withSchemaGuard({
    ...base,
    status,
    latest: {
      status: latestStatus,
      run_id: stringOrNull(latest.run_id),
      case_id: stringOrNull(latest.case_id),
      execution_mode: latest.execution_mode === "synthetic" || latest.execution_mode === "real" ? latest.execution_mode : null
    },
    artifacts,
    validation: {
      status: validation.status,
      errors: validation.errors
    },
    recommended_commands: status === "ready"
      ? ["pnpm evals check --json", "pnpm verify"]
      : ["pnpm evals run fixtures/smoke/pr-closeout.case.json --json", "pnpm evals check --json"]
  });
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
