import { externalProjectManifestPath } from "./external-project-manifest.js";
import { schemaCheckFromObject } from "./schema.js";

const actionItemFields = [
  "action_id",
  "actor",
  "status",
  "reason",
  "required_proof_or_approval",
  "source_requirement"
];

const defaultNonProofClaims = [
  "artifact-only inspection does not prove target project product behavior",
  "artifact-only inspection does not prove CI passed",
  "artifact-only inspection does not prove review threads are resolved",
  "artifact-only inspection does not prove tracker state is closed",
  "artifact-only inspection does not prove merge readiness"
];

const suiteQualityFields = [
  ["steady_state_hypothesis", "suite_quality.steady_state_hypothesis"],
  ["decision_metric", "suite_quality.decision_metric"],
  ["guardrail_metrics", "suite_quality.guardrail_metrics"],
  ["unit_of_analysis", "suite_quality.unit_of_analysis"],
  ["denominator", "suite_quality.denominator"],
  ["residual_uncertainty", "suite_quality.residual_uncertainty"],
  ["oracle_type", "suite_quality.oracle_type"],
  ["evaluator_authority_status", "suite_quality.evaluator_authority_status"]
];

function actionItem({
  actionId,
  actor,
  status,
  reason,
  requiredProofOrApproval,
  sourceRequirement,
  command = null,
  artifactPath = null
}) {
  return {
    action_id: actionId,
    actor,
    status,
    reason,
    required_proof_or_approval: requiredProofOrApproval,
    source_requirement: sourceRequirement,
    command,
    artifact_path: artifactPath
  };
}

function normalizeManifestState(manifestState = {}) {
  return {
    status: manifestState.status || "missing",
    manifest: manifestState.manifest || null,
    errors: Array.isArray(manifestState.errors) ? manifestState.errors : []
  };
}

function normalizeRuntimeEvidence(runtimeEvidence = {}) {
  return {
    status: runtimeEvidence.status || "not_configured",
    policy_status: runtimeEvidence.policy_status || runtimeEvidence.policy_coverage_status || "not_configured",
    required: Boolean(runtimeEvidence.required)
  };
}

function normalizeLatestValidation(latestValidation = {}) {
  return {
    status: latestValidation.status || "not_run",
    errors: Array.isArray(latestValidation.errors) ? latestValidation.errors : []
  };
}

function runtimeEvidenceStatus(runtimeEvidence) {
  if (runtimeEvidence.required && runtimeEvidence.status !== "ready") {
    return runtimeEvidence.status === "not_configured" ? "not_configured" : "blocked";
  }
  return runtimeEvidence.status;
}

function classifyMode({ requestedMode, manifestState, runtimeEvidence }) {
  if (requestedMode === "black_box_execution" || manifestState.status === "invalid") {
    return "blocked";
  }
  if (["blocked", "expired"].includes(manifestState.manifest?.privacy?.approval_status)) {
    return "blocked";
  }
  if (manifestState.status === "missing") {
    return "not_configured";
  }
  if (manifestState.manifest?.privacy?.approval_status === "pending") {
    return "not_configured";
  }
  if (runtimeEvidence.required && runtimeEvidence.status !== "ready") {
    return "blocked";
  }
  return "artifact_only";
}

function recoveryStatus({ authorityMode, humanActions, blockedActions, agentActions }) {
  if (authorityMode === "blocked" || blockedActions.length > 0) return "blocked";
  if (humanActions.length > 0) return "human_required";
  if (agentActions.length > 0) return "available";
  return "none";
}

function missingSuiteQualityFields(manifest) {
  const quality = manifest?.suite_quality || {};
  return suiteQualityFields
    .filter(([field]) => {
      const value = quality[field];
      return Array.isArray(value) ? value.length === 0 : typeof value !== "string" || value.length === 0;
    })
    .map(([, label]) => label);
}

function adoptionReadiness({ manifestState, authorityMode }) {
  if (manifestState.status === "missing") {
    return {
      status: "missing_input",
      next_missing_input: externalProjectManifestPath,
      warnings: [],
      checked_inputs: []
    };
  }

  if (manifestState.status === "invalid") {
    return {
      status: "blocked",
      next_missing_input: externalProjectManifestPath,
      warnings: manifestState.errors,
      checked_inputs: [externalProjectManifestPath]
    };
  }

  const missingFields = missingSuiteQualityFields(manifestState.manifest);
  const warnings = missingFields.map((field) => field + " is not declared; suite quality signal remains warning-only");
  return {
    status: authorityMode === "blocked" ? "blocked" : warnings.length > 0 ? "warning" : "ready",
    next_missing_input: missingFields[0] || null,
    warnings,
    checked_inputs: [
      externalProjectManifestPath,
      "privacy",
      "authority",
      "runtime_evidence_policy",
      "artifact_policy",
      "execution_policy",
      "suite_quality"
    ]
  };
}

function actionPartitionContractErrors(packet) {
  const errors = [];
  for (const partition of ["agent_next_actions", "human_approval_required_actions", "blocked_actions"]) {
    packet[partition].forEach((item, index) => {
      for (const field of actionItemFields) {
        if (typeof item[field] !== "string" || item[field].length === 0) {
          errors.push(partition + "[" + index + "]." + field + ": action item field is required");
        }
      }
      if (!("command" in item) && !("artifact_path" in item)) {
        errors.push(partition + "[" + index + "]: command or artifact_path field is required");
      }
    });
  }
  return errors;
}

export function classifyAuthority(input = {}) {
  const requestedMode = input.requestedMode || "artifact_only";
  const manifestState = normalizeManifestState(input.manifestState);
  const runtimeEvidence = normalizeRuntimeEvidence(input.runtimeEvidence);
  const latestValidation = normalizeLatestValidation(input.latestValidation);
  const runtimeStatus = runtimeEvidenceStatus(runtimeEvidence);
  const agentActions = [];
  const humanActions = [];
  const blockedActions = [];
  const recoveryNotes = [];

  if (manifestState.status === "missing") {
    humanActions.push(actionItem({
      actionId: "provide-external-project-manifest",
      actor: "human",
      status: "human_approval_required",
      reason: "external suite authority requires a target-owned external project manifest",
      requiredProofOrApproval: "valid " + externalProjectManifestPath,
      sourceRequirement: "VAC-003",
      artifactPath: externalProjectManifestPath
    }));
  }

  if (manifestState.status === "invalid") {
    blockedActions.push(actionItem({
      actionId: "fix-invalid-external-project-manifest",
      actor: "human",
      status: "blocked",
      reason: "external project manifest is invalid",
      requiredProofOrApproval: "manifest validation pass for " + externalProjectManifestPath,
      sourceRequirement: "VAC-003",
      artifactPath: externalProjectManifestPath
    }));
  }

  if (requestedMode === "black_box_execution") {
    blockedActions.push(actionItem({
      actionId: "black-box-execution-phase-blocked",
      actor: "human",
      status: "blocked",
      reason: "black_box_execution is blocked until an explicit later approval opens that mode",
      requiredProofOrApproval: "explicit phase-opening approval plus valid target-owned manifest",
      sourceRequirement: "VAC-016",
      artifactPath: externalProjectManifestPath
    }));
  }

  if (manifestState.manifest?.privacy?.approval_status === "blocked") {
    blockedActions.push(actionItem({
      actionId: "privacy-approval-blocked",
      actor: "human",
      status: "blocked",
      reason: "target-owned privacy approval is blocked",
      requiredProofOrApproval: "target-owned privacy approval status approved or not_required",
      sourceRequirement: "FR-004",
      artifactPath: externalProjectManifestPath
    }));
  }

  if (manifestState.manifest?.privacy?.approval_status === "expired") {
    blockedActions.push(actionItem({
      actionId: "privacy-approval-expired",
      actor: "human",
      status: "blocked",
      reason: "target-owned privacy approval is expired",
      requiredProofOrApproval: "fresh target-owned privacy approval evidence",
      sourceRequirement: "FR-004",
      artifactPath: externalProjectManifestPath
    }));
  }

  if (manifestState.manifest?.privacy?.approval_status === "pending") {
    humanActions.push(actionItem({
      actionId: "privacy-approval-pending",
      actor: "human",
      status: "human_approval_required",
      reason: "target-owned privacy approval is pending",
      requiredProofOrApproval: "target-owned privacy approval status approved or not_required",
      sourceRequirement: "FR-004",
      artifactPath: externalProjectManifestPath
    }));
  }

  if (runtimeEvidence.required && runtimeEvidence.status !== "ready") {
    blockedActions.push(actionItem({
      actionId: "runtime-evidence-required",
      actor: "human",
      status: "blocked",
      reason: "runtime evidence is required by manifest policy but is not ready",
      requiredProofOrApproval: "runtime evidence status ready",
      sourceRequirement: "FR-018",
      artifactPath: externalProjectManifestPath
    }));
  }

  if (latestValidation.status === "failed") {
    agentActions.push(actionItem({
      actionId: "revalidate-latest-artifact-bundle",
      actor: "agent",
      status: "available",
      reason: "latest artifact validation failed and can be rerun without executing target behavior",
      requiredProofOrApproval: "latest artifact validation pass",
      sourceRequirement: "FR-002",
      command: "pnpm evals check --json"
    }));
  }

  if (runtimeStatus === "not_configured") {
    recoveryNotes.push("runtime evidence policy is not configured or not ready; do not treat artifact inspection as target behavior proof");
  }

  const authorityMode = classifyMode({ requestedMode, manifestState, runtimeEvidence });
  const readiness = adoptionReadiness({ manifestState, authorityMode });
  const packet = {
    schema_version: 1,
    authority_mode: authorityMode,
    requested_mode: requestedMode,
    manifest_status: manifestState.status,
    proof_context: {
      artifact_only_inspection: authorityMode === "artifact_only" || authorityMode === "not_configured",
      target_behavior_execution: false,
      latest_validation_status: latestValidation.status,
      runtime_evidence_status: runtimeStatus,
      black_box_execution_status: "blocked"
    },
    non_proof_claims: defaultNonProofClaims,
    adoption_readiness: readiness,
    recovery_guidance: {
      status: recoveryStatus({ authorityMode, humanActions, blockedActions, agentActions }),
      commands: agentActions.map((action) => action.command).filter((command) => typeof command === "string"),
      notes: recoveryNotes
    },
    agent_next_actions: agentActions,
    human_approval_required_actions: humanActions,
    blocked_actions: blockedActions,
    evaluator_axis: {
      judge_status: input.judgeStatus || "not_evaluated",
      judge_status_is_authority: false
    }
  };

  const schemaCheck = schemaCheckFromObject("authorityClassification", packet, "authority-classification");
  const actionErrors = actionPartitionContractErrors(packet);
  return {
    ...packet,
    validation: {
      status: schemaCheck.status === "pass" && actionErrors.length === 0 ? "pass" : "fail",
      errors: schemaCheck.errors.concat(actionErrors)
    }
  };
}
