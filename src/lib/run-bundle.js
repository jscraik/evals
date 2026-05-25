import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { sha256Text } from "./hash.js";
import { repoRoot, utcBasic } from "./paths.js";

const MAX_COLLISION_RETRIES = 1000;

function runIdBase(startedAt, caseId, rawCase) {
  return utcBasic(startedAt) + "-" + caseId + "-" + sha256Text(rawCase).slice(0, 8);
}

function collisionSuffix(attempt) {
  return "-" + String(attempt).padStart(2, "0");
}

export function createRunBundleDirectory({ runsRoot, startedAt, caseId, rawCase, artifactRootPrefix }) {
  mkdirSync(runsRoot, { recursive: true });
  const resolvedArtifactRootPrefix = artifactRootPrefix || ".harness/evals/runs";

  const baseRunId = runIdBase(startedAt, caseId, rawCase);
  for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt += 1) {
    const runId = attempt === 0 ? baseRunId : baseRunId + collisionSuffix(attempt);
    const runDir = join(runsRoot, runId);

    try {
      mkdirSync(runDir);
      return {
        runId,
        runDir,
        artifactRoot: resolvedArtifactRootPrefix + "/" + runId
      };
    } catch (error) {
      if (error && error.code === "EEXIST") {
        continue;
      }
      throw error;
    }
  }

  throw new Error("could not allocate unique run artifact directory for " + baseRunId);
}

export function createRunBundle({ startedAt, caseId, rawCase }) {
  return createRunBundleDirectory({
    runsRoot: join(repoRoot, ".harness", "evals", "runs"),
    startedAt,
    caseId,
    rawCase
  });
}
