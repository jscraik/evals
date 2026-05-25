import { readJson } from "./json.js";
import { rel } from "./paths.js";
import { schemaCheckFromObject } from "./schema.js";

const proofContractTargets = {
  "claim-registry": {
    schemaKey: "claimRegistry",
    publicKey: "claim-registry",
    semanticLabel: "claim registry semantics",
    validate: validateClaimRegistrySemantics
  },
  claimRegistry: {
    schemaKey: "claimRegistry",
    publicKey: "claim-registry",
    semanticLabel: "claim registry semantics",
    validate: validateClaimRegistrySemantics
  },
  "score-vector": {
    schemaKey: "scoreVector",
    publicKey: "score-vector",
    semanticLabel: "score vector semantics",
    validate: validateScoreVectorSemantics
  },
  scoreVector: {
    schemaKey: "scoreVector",
    publicKey: "score-vector",
    semanticLabel: "score vector semantics",
    validate: validateScoreVectorSemantics
  }
};

function semanticCheck(label, dataPath, errors) {
  return {
    label,
    schema_path: "semantic proof contract",
    data_path: rel(dataPath),
    status: errors.length === 0 ? "pass" : "fail",
    errors
  };
}

function validateClaimRegistrySemantics(registry) {
  const errors = [];
  if (!registry || !Array.isArray(registry.claims)) return errors;

  const seenClaims = new Set();
  registry.claims.forEach((claim, index) => {
    const claimPath = "$.claims[" + index + "]";
    if (claim && typeof claim.claim_id === "string") {
      if (seenClaims.has(claim.claim_id)) {
        errors.push(claimPath + ".claim_id: duplicate claim_id " + JSON.stringify(claim.claim_id));
      }
      seenClaims.add(claim.claim_id);
    }

    const span = claim?.source?.span;
    if (span && Number.isInteger(span.start_line) && Number.isInteger(span.end_line) && span.end_line < span.start_line) {
      errors.push(claimPath + ".source.span.end_line: must be >= source.span.start_line");
    }
  });

  return errors;
}

function expectedCoverageStatus(coverage) {
  if (!coverage) return null;
  if (!Number.isInteger(coverage.tested_claims) || !Number.isInteger(coverage.total_claims)) return null;
  if (coverage.tested_claims > coverage.total_claims) return null;
  if (coverage.total_claims === 0 || coverage.tested_claims === 0) return "none";
  if (coverage.tested_claims === coverage.total_claims) return "complete";
  return "partial";
}

function validateScoreVectorSemantics(scoreVector) {
  const errors = [];
  if (!scoreVector || typeof scoreVector !== "object" || Array.isArray(scoreVector)) return errors;

  const coverage = scoreVector.coverage;
  if (coverage && Number.isInteger(coverage.tested_claims) && Number.isInteger(coverage.total_claims)) {
    if (coverage.tested_claims > coverage.total_claims) {
      errors.push("$.coverage.tested_claims: must be <= $.coverage.total_claims");
    }
    const expectedStatus = expectedCoverageStatus(coverage);
    if (expectedStatus && coverage.coverage_status !== expectedStatus) {
      errors.push("$.coverage.coverage_status: expected " + expectedStatus + " for tested_claims/total_claims");
    }
  }

  const gates = Array.isArray(scoreVector.gates) ? scoreVector.gates : [];
  const readiness = scoreVector.readiness || {};
  const criticalBlockers = gates
    .filter((gate) => gate && gate.severity === "critical" && (gate.status === "fail" || gate.status === "blocked"))
    .map((gate) => gate.gate_id)
    .filter((gateId) => typeof gateId === "string" && gateId.length > 0);

  if (readiness.capped_by_gate === true && (!Array.isArray(readiness.blocking_gates) || readiness.blocking_gates.length === 0)) {
    errors.push("$.readiness.blocking_gates: must list blocking gates when capped_by_gate is true");
  }

  if (criticalBlockers.length > 0) {
    if (readiness.capped_by_gate !== true) {
      errors.push("$.readiness.capped_by_gate: must be true when a critical gate fails or is blocked");
    }
    if (readiness.status === "excellent" || readiness.status === "strong") {
      errors.push("$.readiness.status: must not be " + readiness.status + " when a critical gate fails or is blocked");
    }
    if (typeof readiness.cap_reason !== "string" || readiness.cap_reason.length === 0) {
      errors.push("$.readiness.cap_reason: must explain the critical gate cap");
    }
    const blockingGates = new Set(Array.isArray(readiness.blocking_gates) ? readiness.blocking_gates : []);
    for (const gateId of criticalBlockers) {
      if (!blockingGates.has(gateId)) {
        errors.push("$.readiness.blocking_gates: missing critical blocking gate " + JSON.stringify(gateId));
      }
    }
  }

  return errors;
}

export function resolveProofContractTarget(schemaKey) {
  return proofContractTargets[schemaKey] || null;
}

export function proofContractSchemaKeys() {
  return ["claim-registry", "score-vector"];
}

export function validateProofContractObject(schemaKey, document, dataPath) {
  const target = resolveProofContractTarget(schemaKey);
  if (!target) {
    return {
      status: "failed",
      target_schema: schemaKey,
      supported_schemas: proofContractSchemaKeys(),
      target_path: rel(dataPath),
      checks: [],
      errors: ["unknown proof contract schema: " + schemaKey]
    };
  }

  const schemaCheck = schemaCheckFromObject(target.schemaKey, document, dataPath);
  const semanticErrors = schemaCheck.status === "pass" ? target.validate(document) : [];
  const checks = [schemaCheck, semanticCheck(target.semanticLabel, dataPath, semanticErrors)];
  const errors = checks.flatMap((check) => check.errors);

  return {
    status: errors.length === 0 ? "passed" : "failed",
    target_schema: target.publicKey,
    target_path: rel(dataPath),
    checks,
    errors
  };
}

export function validateProofContractFile(schemaKey, targetPath) {
  const target = resolveProofContractTarget(schemaKey);
  if (!target) {
    return {
      status: "failed",
      target_schema: schemaKey,
      supported_schemas: proofContractSchemaKeys(),
      target_path: rel(targetPath),
      checks: [],
      errors: ["unknown proof contract schema: " + schemaKey]
    };
  }

  let document;
  try {
    document = readJson(targetPath);
  } catch (error) {
    return {
      status: "failed",
      target_schema: target.publicKey,
      target_path: rel(targetPath),
      checks: [],
      errors: [rel(targetPath) + ": JSON parse failed: " + error.message]
    };
  }

  return validateProofContractObject(schemaKey, document, targetPath);
}
