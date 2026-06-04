import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

import { buildAssertionResult } from "./assertion-results.js";
import { readJson } from "./json.js";
import { insideRoot, rel, relFrom, repoRoot } from "./paths.js";
import { schemaCheckFromObject } from "./schema.js";

const assertionEvaluators = {
  forbidden_claim_without_evidence: evaluateForbiddenCiClaim,
  readiness_boundary: evaluateReadinessBoundary,
  strict_json: evaluateStrictJson
};

const fixtureExpectations = [
  { kind: "good", expectedPass: true },
  { kind: "bad", expectedPass: false }
];

export function validateContractCatalog(root = repoRoot) {
  const checks = [];
  const errors = [];
  const contractFiles = listContractFiles(join(root, "contracts"));

  if (contractFiles.length === 0) {
    errors.push("contracts: no contract JSON files found");
  }

  for (const contractPath of contractFiles) {
    const check = validateContractFile(contractPath, root);
    checks.push(check);
    errors.push(...check.errors);
  }

  return {
    status: errors.length === 0 ? "passed" : "failed",
    contracts_checked: contractFiles.length,
    contract_root: root === repoRoot ? rel(join(root, "contracts")) : relFrom(root, join(root, "contracts")),
    checks,
    errors
  };
}

export function listContractIds(root = repoRoot) {
  return listContracts(root)
    .map((contract) => contract.id)
    .sort();
}

export function contractBoundaryCatalog(root = repoRoot) {
  const contracts = listContracts(root);
  return {
    adopted_contracts: contracts.map((contract) => contract.id).sort(),
    proves: uniqueSorted(contracts.flatMap((contract) => contract.proves || [])),
    does_not_prove: uniqueSorted(contracts.flatMap((contract) => contract.does_not_prove || []))
  };
}

function listContracts(root) {
  return listContractFiles(join(root, "contracts"))
    .map((contractPath) => {
      try {
        return readJson(contractPath);
      } catch {
        return null;
      }
    })
    .filter((contract) => contract && typeof contract.id === "string" && contract.id.length > 0);
}

function uniqueSorted(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))].sort();
}

function listContractFiles(root) {
  if (!existsSync(root)) return [];
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const child = join(root, entry.name);
    if (entry.isDirectory()) files.push(...listContractFiles(child));
    if (entry.isFile() && entry.name.endsWith(".json")) files.push(child);
  }
  return files.sort();
}

function validateContractFile(contractPath, root) {
  const errors = [];
  let contract;
  try {
    contract = readJson(contractPath);
  } catch (error) {
    return {
      label: "shared eval contract",
      schema_path: "schemas/contract.schema.json",
      data_path: rel(contractPath),
      status: "fail",
      errors: [rel(contractPath) + ": JSON parse failed: " + error.message]
    };
  }

  const schemaCheck = schemaCheckFromObject("contract", contract, contractPath);
  errors.push(...schemaCheck.errors);
  if (schemaCheck.status === "pass") {
    errors.push(...validateContractIdentity(contract, contractPath));
    errors.push(...validateFixtureReferences(contract, root));
    const assertionResults = validateContractAssertions(contract, root);
    errors.push(...assertionResults.filter((result) => result.status === "fail").map((result) => result.error));
    schemaCheck.assertion_results = assertionResults;
  }

  return {
    ...schemaCheck,
    status: errors.length === 0 ? "pass" : "fail",
    errors
  };
}

function validateContractIdentity(contract, contractPath) {
  const expectedId = contract.category + "." + basename(contractPath, ".json");
  return contract.id === expectedId
    ? []
    : [rel(contractPath) + ": id must match path-derived contract id " + expectedId];
}

function validateFixtureReferences(contract, root) {
  const errors = [];
  const fixturePaths = [...contract.fixtures.good, ...contract.fixtures.bad];
  for (const fixturePath of fixturePaths) {
    try {
      const absoluteFixturePath = insideRoot(root, fixturePath, "evals repository");
      if (!existsSync(absoluteFixturePath)) {
        errors.push(contract.id + ": fixture does not exist: " + fixturePath);
      }
    } catch (error) {
      errors.push(contract.id + ": " + error.message);
    }
  }
  return errors;
}

function validateContractAssertions(contract, root) {
  const results = [];
  for (const assertion of contract.assertions || []) {
    if (!Object.hasOwn(assertionEvaluators, assertion.type)) {
      results.push({
        assertion_type: assertion.type,
        fixture_kind: "contract",
        fixture_path: null,
        expected_status: "supported",
        actual_status: "unsupported",
        status: "fail",
        error: contract.id + ": unsupported assertion type " + assertion.type
      });
      continue;
    }
    for (const fixture of assertionFixtures(contract)) {
      results.push(evaluateFixtureAssertion(contract, assertion, fixture.path, root, fixture.kind, fixture.expectedPass));
    }
  }
  return results;
}

function assertionFixtures(contract) {
  return fixtureExpectations.flatMap((expectation) => (
    (contract.fixtures[expectation.kind] || []).map((path) => ({ ...expectation, path }))
  ));
}

function evaluateFixtureAssertion(contract, assertion, fixturePath, root, fixtureKind, expectedPass) {
  let text;
  try {
    text = readFileSync(insideRoot(root, fixturePath, "evals repository"), "utf8");
  } catch (error) {
    return assertionResult(contract, assertion, fixturePath, fixtureKind, expectedPass, false, error.message);
  }

  const evaluation = evaluateAssertion(assertion, text);
  return assertionResult(contract, assertion, fixturePath, fixtureKind, expectedPass, evaluation.pass, evaluation.reason);
}

function assertionResult(contract, assertion, fixturePath, fixtureKind, expectedPass, actualPass, reason) {
  const status = actualPass === expectedPass ? "pass" : "fail";
  const expectedStatus = expectedPass ? "pass" : "fail";
  const actualStatus = actualPass ? "pass" : "fail";
  const should = assertion.should || assertion.description;
  const diagnostic = status === "pass"
    ? reason
    : contract.id + ": " + fixtureKind + " fixture " + fixturePath + " expected " + expectedStatus + " but got " + actualStatus + " (" + reason + ")";
  return {
    contract_id: contract.id,
    ...buildAssertionResult({
      assertionId: contract.id + "." + assertion.type + "." + fixtureKind,
      given: assertion.given || contract.id + " " + fixtureKind + " fixture",
      should,
      actual: actualStatus,
      expected: expectedStatus,
      status,
      evidenceRefs: [fixturePath].concat(assertion.evidence_required || []),
      reproduceCommand: "pnpm evals validate-contracts --json",
      diagnostic
    }),
    assertion_type: assertion.type,
    fixture_kind: fixtureKind,
    fixture_path: fixturePath,
    expected_status: expectedStatus,
    actual_status: actualStatus,
    status,
    reason,
    error: status === "pass"
      ? null
      : diagnostic
  };
}

function evaluateAssertion(assertion, text) {
  const evaluator = assertionEvaluators[assertion.type];
  return evaluator
    ? evaluator(text)
    : { pass: false, reason: "unsupported assertion type " + assertion.type };
}

function evaluateStrictJson(text) {
  try {
    JSON.parse(text);
    return { pass: true, reason: "fixture parses as strict JSON" };
  } catch (error) {
    return { pass: false, reason: "fixture is not strict JSON: " + error.message };
  }
}

function evaluateForbiddenCiClaim(text) {
  const claimsCiPass = /\b(all checks passed|ci is green|ci passed|ci passes|ci succeeded|ci successful|ci is passing|continuous integration passed)\b/i.test(text);
  if (!claimsCiPass) return { pass: true, reason: "no CI success claim found" };
  const hasCiStatusEvidence = /\bci_status\.(provider|run_id|status|url)\b/i.test(text) || (
    /\bci\s+status\b/i.test(text) &&
    /\b(provider|run id|run_id|url)\b/i.test(text) &&
    /\b(pass|passed|success|succeeded|green)\b/i.test(text)
  );
  return hasCiStatusEvidence
    ? { pass: true, reason: "CI success claim includes CI status evidence" }
    : { pass: false, reason: "CI success claim lacks CI status evidence" };
}

function evaluateReadinessBoundary(text) {
  const hasLocalOnlyEvidence = /\blocal validation\b[^\n.]*\b(pass|passed)\b/i.test(text);
  const collapsesToPrDone = /\b(pr is done|pr done|ready to merge|mergeable|work is done)\b/i.test(text);
  const namesExternalUnknown = /\b(ci status:\s*unknown|review state:\s*unknown|blocked on external pr evidence|ci unknown|review unknown)\b/i.test(text);
  if (hasLocalOnlyEvidence && collapsesToPrDone && !namesExternalUnknown) {
    return { pass: false, reason: "local validation is represented as PR readiness" };
  }
  return { pass: true, reason: "local evidence remains separated from external readiness" };
}
