import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { classifyAuthority } from "../src/lib/authority-classifier.js";
import { validateExternalProjectManifest } from "../src/lib/external-project-manifest.js";
import { schemaCheckFromObject, schemaTargets } from "../src/lib/schema.js";

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function manifestFixture(path) {
  return JSON.parse(readFileSync(join(sourceRoot, "fixtures", "external-project-manifest", path), "utf8"));
}

function validManifestState() {
  return {
    status: "valid",
    manifest: {
      runtime_evidence_policy: {
        required: true,
        missing_status: "blocked"
      },
      privacy: {
        approval_status: "not_required"
      }
    }
  };
}

function readyRuntimeEvidence() {
  return {
    status: "ready",
    required: true
  };
}

function latestPassed() {
  return {
    status: "passed",
    errors: []
  };
}

function manifestStateFromFixture(path) {
  const manifest = manifestFixture(path);
  const validation = validateExternalProjectManifest(manifest);
  assert.equal(validation.status, "pass");
  return {
    status: "valid",
    manifest
  };
}

function assertActionItemContract(action) {
  for (const field of [
    "action_id",
    "actor",
    "status",
    "reason",
    "required_proof_or_approval",
    "source_requirement"
  ]) {
    assert.equal(typeof action[field], "string", field);
    assert.notEqual(action[field].length, 0, field);
  }
  assert.ok("command" in action || "artifact_path" in action);
}

test("authority classifier schema target is registered", () => {
  assert.equal(schemaTargets.authorityClassification.label, "authority classification");
});

test("authority classifier emits artifact-only authority for valid manifest and ready evidence", () => {
  const packet = classifyAuthority({
    manifestState: validManifestState(),
    runtimeEvidence: readyRuntimeEvidence(),
    latestValidation: latestPassed()
  });

  assert.equal(packet.authority_mode, "artifact_only");
  assert.equal(packet.proof_context.target_behavior_execution, false);
  assert.equal(packet.proof_context.runtime_evidence_status, "ready");
  assert.equal(packet.proof_context.black_box_execution_status, "blocked");
  assert.deepEqual(packet.agent_next_actions, []);
  assert.deepEqual(packet.human_approval_required_actions, []);
  assert.deepEqual(packet.blocked_actions, []);
  assert.equal(packet.adoption_readiness.status, "warning");
  assert.equal(packet.adoption_readiness.next_missing_input, "suite_quality.steady_state_hypothesis");
  assert.match(packet.adoption_readiness.warnings.join("\n"), /suite_quality\.decision_metric/);
  assert.match(packet.non_proof_claims.join("\n"), /does not prove target project product behavior/);
  assert.equal(packet.validation.status, "pass");
  assert.equal(schemaCheckFromObject("authorityClassification", packet, "authority-classification").status, "pass");
});

test("authority classifier emits human approval action when manifest is missing", () => {
  const packet = classifyAuthority({
    manifestState: { status: "missing" },
    runtimeEvidence: { status: "not_configured" },
    latestValidation: latestPassed()
  });

  assert.equal(packet.authority_mode, "not_configured");
  assert.equal(packet.manifest_status, "missing");
  assert.equal(packet.adoption_readiness.status, "missing_input");
  assert.equal(packet.adoption_readiness.next_missing_input, ".evals/project.json");
  assert.deepEqual(packet.adoption_readiness.warnings, []);
  assert.deepEqual(packet.adoption_readiness.checked_inputs, []);
  assert.equal(packet.human_approval_required_actions.length, 1);
  assertActionItemContract(packet.human_approval_required_actions[0]);
  assert.equal(packet.human_approval_required_actions[0].artifact_path, ".evals/project.json");
  assert.equal(packet.validation.status, "pass");
});

test("authority classifier blocks invalid manifests", () => {
  const packet = classifyAuthority({
    manifestState: { status: "invalid", errors: ["project missing"] },
    runtimeEvidence: readyRuntimeEvidence(),
    latestValidation: latestPassed()
  });

  assert.equal(packet.authority_mode, "blocked");
  assert.equal(packet.adoption_readiness.status, "blocked");
  assert.equal(packet.adoption_readiness.next_missing_input, ".evals/project.json");
  assert.deepEqual(packet.adoption_readiness.warnings, ["project missing"]);
  assert.deepEqual(packet.adoption_readiness.checked_inputs, [".evals/project.json"]);
  assert.equal(packet.blocked_actions.length, 1);
  assertActionItemContract(packet.blocked_actions[0]);
  assert.match(packet.blocked_actions[0].reason, /manifest is invalid/);
});

test("authority classifier marks complete suite quality metadata ready without elevating behavior authority", () => {
  const packet = classifyAuthority({
    manifestState: manifestStateFromFixture("good/with-suite-quality.json"),
    runtimeEvidence: { status: "not_configured", required: false },
    latestValidation: latestPassed()
  });

  assert.equal(packet.authority_mode, "artifact_only");
  assert.equal(packet.proof_context.target_behavior_execution, false);
  assert.equal(packet.adoption_readiness.status, "ready");
  assert.equal(packet.adoption_readiness.next_missing_input, null);
  assert.deepEqual(packet.adoption_readiness.warnings, []);
  assert.equal(packet.evaluator_axis.judge_status_is_authority, false);
  assert.equal(packet.validation.status, "pass");
  assert.equal(schemaCheckFromObject("authorityClassification", packet, "authority-classification").status, "pass");
});

test("authority classifier treats required missing runtime evidence as blocked", () => {
  const packet = classifyAuthority({
    manifestState: validManifestState(),
    runtimeEvidence: { status: "not_configured", required: true },
    latestValidation: latestPassed()
  });

  assert.equal(packet.authority_mode, "blocked");
  assert.equal(packet.proof_context.runtime_evidence_status, "not_configured");
  assert.equal(packet.blocked_actions.length, 1);
  assert.equal(packet.blocked_actions[0].action_id, "runtime-evidence-required");
  assert.match(packet.recovery_guidance.notes.join("\n"), /not treat artifact inspection as target behavior proof/);
});

test("authority classifier blocks target-owned blocked privacy approval", () => {
  const packet = classifyAuthority({
    manifestState: manifestStateFromFixture("bad/blocked-privacy.json"),
    runtimeEvidence: readyRuntimeEvidence(),
    latestValidation: latestPassed()
  });

  assert.equal(packet.authority_mode, "blocked");
  assert.equal(packet.blocked_actions[0].action_id, "privacy-approval-blocked");
  assert.match(packet.blocked_actions[0].reason, /privacy approval is blocked/);
});

test("authority classifier blocks expired privacy approval", () => {
  const packet = classifyAuthority({
    manifestState: manifestStateFromFixture("bad/expired-privacy.json"),
    runtimeEvidence: readyRuntimeEvidence(),
    latestValidation: latestPassed()
  });

  assert.equal(packet.authority_mode, "blocked");
  assert.equal(packet.blocked_actions[0].action_id, "privacy-approval-expired");
  assert.match(packet.blocked_actions[0].required_proof_or_approval, /fresh target-owned privacy approval/);
});

test("authority classifier emits human action for pending privacy approval", () => {
  const manifestState = validManifestState();
  manifestState.manifest.privacy.approval_status = "pending";

  const packet = classifyAuthority({
    manifestState,
    runtimeEvidence: readyRuntimeEvidence(),
    latestValidation: latestPassed()
  });

  assert.equal(packet.authority_mode, "not_configured");
  assert.equal(packet.human_approval_required_actions[0].action_id, "privacy-approval-pending");
  assert.deepEqual(packet.blocked_actions, []);
});

test("authority classifier blocks requested black-box execution without a command", () => {
  const packet = classifyAuthority({
    requestedMode: "black_box_execution",
    manifestState: validManifestState(),
    runtimeEvidence: readyRuntimeEvidence(),
    latestValidation: latestPassed()
  });

  assert.equal(packet.authority_mode, "blocked");
  assert.equal(packet.requested_mode, "black_box_execution");
  assert.equal(packet.blocked_actions.length, 1);
  assert.equal(packet.blocked_actions[0].action_id, "black-box-execution-phase-blocked");
  assert.equal(packet.blocked_actions[0].command, null);
  assert.equal(packet.proof_context.target_behavior_execution, false);
});

test("authority classifier separates agent next actions for failed latest validation", () => {
  const packet = classifyAuthority({
    manifestState: validManifestState(),
    runtimeEvidence: readyRuntimeEvidence(),
    latestValidation: { status: "failed", errors: ["latest invalid"] }
  });

  assert.equal(packet.authority_mode, "artifact_only");
  assert.equal(packet.agent_next_actions.length, 1);
  assertActionItemContract(packet.agent_next_actions[0]);
  assert.equal(packet.agent_next_actions[0].command, "pnpm evals check --json");
  assert.deepEqual(packet.human_approval_required_actions, []);
});

test("authority classifier keeps judge status off the authority axis", () => {
  const packet = classifyAuthority({
    manifestState: validManifestState(),
    runtimeEvidence: readyRuntimeEvidence(),
    latestValidation: latestPassed(),
    judgeStatus: "advisory"
  });

  assert.equal(packet.authority_mode, "artifact_only");
  assert.equal(packet.evaluator_axis.judge_status, "advisory");
  assert.equal(packet.evaluator_axis.judge_status_is_authority, false);
});
