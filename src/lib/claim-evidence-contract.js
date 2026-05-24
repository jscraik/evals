import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

import { repoRoot } from "./paths.js";

const usefulEvidenceStatuses = new Set(["pass", "present", "verified"]);

/**
 * Score whether every claim has usable required evidence.
 * @param {Array<object>} claims Claim records.
 * @param {Array<object>} evidence Evidence records.
 * @returns {object} Deterministic missing-evidence scorer result.
 */
export function scoreMissingEvidence(claims, evidence) {
  const evidenceById = new Map((Array.isArray(evidence) ? evidence : []).map((item) => [item.evidence_id, item]));
  const failures = [];

  for (const claim of Array.isArray(claims) ? claims : []) {
    const required = Array.isArray(claim.required_evidence) ? claim.required_evidence : [];
    for (const evidenceId of required) {
      const proof = evidenceById.get(evidenceId);
      if (!proof) {
        failures.push(claim.claim_id + " missing required evidence " + evidenceId);
        continue;
      }
      if (!usefulEvidenceStatuses.has(proof.status)) {
        failures.push(claim.claim_id + " evidence " + evidenceId + " has unusable status " + proof.status);
      }
    }
    if (claim.claim_type === "artifact-exists") {
      const artifactEvidence = required.map((id) => evidenceById.get(id)).filter(Boolean);
      if (!artifactEvidence.some((item) => item.sha256 && item.manifest_path)) {
        failures.push(claim.claim_id + " requires manifest/hash evidence");
      }
    }
  }

  return {
    scorer_id: "missing-evidence",
    scorer_version: "1.0.0",
    status: failures.length === 0 ? "pass" : "fail",
    inputs_inspected: ["claims", "evidence"],
    evidence: failures.length === 0 ? "all claims have usable required evidence" : failures.join("; "),
    failure_reason: failures.length === 0 ? null : "one or more claims lack required evidence"
  };
}

/**
 * Build the runtime evidence packet v1 from local runtime state facts.
 * @param {object} context Runtime-state context.
 * @returns {object} Domain-neutral runtime evidence packet.
 */
export function buildRuntimeEvidencePacket(context) {
  const generatedAt = context.generatedAt;
  const evidence = [];
  const claims = [];
  const manifestEvidence = manifestEvidenceByPath(context.latest);

  evidence.push({
    schema_version: 1,
    evidence_id: "runtime-state",
    evidence_type: "runtime_state",
    status: context.status === "invalid" ? "fail" : "present",
    observed_at: generatedAt,
    path: context.latestPath,
    command: null,
    sha256: null,
    manifest_path: null,
    detail: "runtime state status: " + context.status
  });
  claims.push({
    schema_version: 1,
    claim_id: "runtime-state-observed",
    claim_type: "state-observed",
    claim_text: "Runtime state was generated from local repository evidence.",
    required_evidence: ["runtime-state"],
    confidence: "advisory"
  });

  if (context.validation.status === "passed") {
    evidence.push({
      schema_version: 1,
      evidence_id: "latest-validation",
      evidence_type: "validation_artifact",
      status: "pass",
      observed_at: generatedAt,
      path: context.latestPath,
      command: "pnpm evals check --json",
      sha256: null,
      manifest_path: null,
      detail: "latest validation passed"
    });
    claims.push({
      schema_version: 1,
      claim_id: "latest-validation-passed",
      claim_type: "validation-passed",
      claim_text: "Latest artifact bundle validation passed.",
      required_evidence: ["latest-validation"],
      confidence: "advisory"
    });
  }

  for (const artifact of context.artifacts) {
    if (artifact.status !== "present") continue;
    if (artifact.type === "manifest") {
      evidence.push({
        schema_version: 1,
        evidence_id: "manifest:latest",
        evidence_type: "manifest",
        status: "present",
        observed_at: generatedAt,
        path: artifact.path,
        command: null,
        sha256: null,
        manifest_path: null,
        detail: "manifest artifact is present"
      });
      continue;
    }
    const manifestEntry = manifestEvidence.get(artifact.path);
    const evidenceId = "artifact:" + artifact.key.replace(/_/g, "-");
    evidence.push({
      schema_version: 1,
      evidence_id: evidenceId,
      evidence_type: "artifact",
      status: manifestEntry ? "verified" : "present",
      observed_at: generatedAt,
      path: artifact.path,
      command: null,
      sha256: manifestEntry?.sha256 || null,
      manifest_path: manifestEntry ? context.latest.manifest_path : null,
      detail: "artifact state observed as present"
    });
    claims.push({
      schema_version: 1,
      claim_id: "artifact-exists:" + artifact.key.replace(/_/g, "-"),
      claim_type: "artifact-exists",
      claim_text: "Artifact exists for latest." + artifact.key + ".",
      required_evidence: [evidenceId],
      confidence: "advisory"
    });
  }

  const blockers = context.status === "ready" ? [] : [{
    code: context.nonReadyReasonCode || "unknown",
    reason: blockerReason(context)
  }];
  const packet = {
    schema_version: 1,
    generated_at: generatedAt,
    repo: {
      root: ".",
      name: repoName()
    },
    git_state: collectGitState(),
    runtime_state: {
      status: context.status,
      latest_path: context.latestPath,
      latest_run_id: context.latest.run_id,
      non_ready_reason_code: context.nonReadyReasonCode
    },
    recommended_commands: context.recommendedCommands,
    blockers,
    validation_evidence: context.validation,
    runtime_evidence_contract_health: context.runtimeEvidenceHealth,
    claims,
    evidence
  };
  const missingEvidenceScorer = scoreMissingEvidence(packet.claims, packet.evidence);
  return {
    ...packet,
    missing_evidence_scorer: missingEvidenceScorer,
    readiness_verdict: readinessVerdict(packet, missingEvidenceScorer)
  };
}

function readinessVerdict(packet, missingEvidenceScorer) {
  if (packet.runtime_state.status !== "ready") {
    return {
      status: "fail",
      reason: "runtime state is " + packet.runtime_state.status,
      blocking_fields: ["runtime_state.status"]
    };
  }
  if (packet.validation_evidence.status !== "passed") {
    return {
      status: "fail",
      reason: "latest validation is " + packet.validation_evidence.status,
      blocking_fields: ["validation_evidence.status"]
    };
  }
  if (missingEvidenceScorer.status !== "pass") {
    return {
      status: "fail",
      reason: "required evidence is missing",
      blocking_fields: ["missing_evidence_scorer.status"]
    };
  }
  return {
    status: "pass",
    reason: "runtime state is ready and all claims have required evidence",
    blocking_fields: []
  };
}

function blockerReason(context) {
  if (context.validation.errors[0]) return context.validation.errors[0];
  if (context.nonReadyReasonCode === "latest_missing") {
    return context.latestPath + " is missing; run " + context.recommendedCommands[0];
  }
  return "runtime state is " + context.status;
}

function manifestEvidenceByPath(latest) {
  const entries = new Map();
  if (!latest?.manifest_path) return entries;
  const manifestPath = join(repoRoot, latest.manifest_path);
  if (!existsSync(manifestPath)) return entries;
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    return entries;
  }
  for (const artifact of manifest.artifacts || []) {
    if (artifact.path && artifact.sha256) entries.set(artifact.path, artifact);
  }
  return entries;
}

function collectGitState() {
  const branch = runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
  const commit = runGit(["rev-parse", "HEAD"]);
  const status = runGit(["status", "--porcelain"]);
  if (!branch.ok || !commit.ok || !status.ok) {
    return {
      status: "unavailable",
      branch: null,
      commit: null,
      dirty: null,
      reason: branch.error || commit.error || status.error || "git state unavailable"
    };
  }
  return {
    status: "available",
    branch: branch.stdout,
    commit: commit.stdout,
    dirty: status.stdout.length > 0,
    reason: null
  };
}

function runGit(args) {
  const result = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8", timeout: 5000 });
  if (result.status !== 0) return { ok: false, error: (result.stderr || result.stdout || "git command failed").trim() };
  return { ok: true, stdout: result.stdout.trim() };
}

function repoName() {
  try {
    const packageJson = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
    if (typeof packageJson.name === "string" && packageJson.name.length > 0) return packageJson.name;
  } catch {
    return "evals";
  }
  return "evals";
}
