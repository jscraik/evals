import { repoRoot } from "./paths.js";
import { contractBoundaryCatalog } from "./contract-catalog.js";
import { isDefaultRepoRoot } from "./repo-root-option.js";

export function adoptedSharedContracts() {
  return contractBoundaryCatalog(repoRoot).adopted_contracts;
}

export function validationCommandForArtifactRoot(artifactRepoRoot = repoRoot) {
  if (isDefaultRepoRoot(artifactRepoRoot)) return "pnpm evals check --json";
  return "pnpm evals check --repo-root " + shellQuote(artifactRepoRoot) + " --json";
}

export function proofBoundary(options = {}) {
  const artifactRepoRoot = options.artifactRepoRoot || repoRoot;
  const defaultRepoRoot = isDefaultRepoRoot(artifactRepoRoot);
  const smokeContext = options.smokeContext === true;
  const scope = options.scope || (smokeContext ? "smoke-context" : "observed-latest");
  const contractCatalog = contractBoundaryCatalog(repoRoot);
  const proves = [
    "shared eval artifacts conform to their repository schemas",
    "latest artifact paths are internally consistent with the observed artifact bundle",
    "validation claims are limited to evidence produced by this eval suite",
    ...contractCatalog.proves.map((claim) => "shared contract: " + claim)
  ];
  if (smokeContext) {
    proves.push("the latest packet matches the canonical smoke fixture context");
  }
  if (!defaultRepoRoot) {
    proves.push("the external repository latest packet can be replayed through the shared artifact validator");
  }

  return {
    shared_contract_status: scope === "contract-catalog" ? "contract_catalog_validated" : "artifact_consistency_checked",
    local_project_truth_status: "not_evaluated",
    adopted_contracts: contractCatalog.adopted_contracts,
    proves,
    does_not_prove: [
      "the consumer project product behavior is correct",
      "CI passed unless CI status evidence is present",
      "review threads are resolved",
      "tracker state is closed",
      "the project is ready to merge",
      ...contractCatalog.does_not_prove.map((claim) => "shared contract: " + claim)
    ]
  };
}

function shellQuote(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_@%+=:,./-]+$/.test(text)) return text;
  return "'" + text.replace(/'/g, "'\\''") + "'";
}
