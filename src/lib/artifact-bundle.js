export const latestArtifactContracts = [
  { key: "manifest_path", type: "manifest", filename: "manifest.json", inManifest: false, inResultRefs: false },
  { key: "result_path", type: "result", filename: "result.json", inManifest: true, inResultRefs: false },
  { key: "report_path", type: "report", filename: "report.md", inManifest: true, inResultRefs: true },
  { key: "command_log_path", type: "command-log", filename: "command-log.json", inManifest: true, inResultRefs: true },
  { key: "baseline_result_path", type: "baseline-result", filename: "baseline-result.json", inManifest: true, inResultRefs: true },
  { key: "scorer_results_path", type: "scorer-results", filename: "scorer-results.json", inManifest: true, inResultRefs: true },
  { key: "trace_events_path", type: "trace-events", filename: "trace-events.jsonl", inManifest: true, inResultRefs: true }
];

export const requiredLatestKeys = latestArtifactContracts.map((contract) => contract.key);
export const manifestArtifactContracts = latestArtifactContracts.filter((contract) => contract.inManifest);
export const resultArtifactRefContracts = latestArtifactContracts.filter((contract) => contract.inResultRefs);

/**
 * Return the canonical repository-relative path for a run artifact.
 * @param {string} runId - The run identifier used as the artifact bundle directory name.
 * @param {string} key - One of the latest.json artifact pointer keys.
 * @returns {string} Canonical repository-relative path for that run artifact.
 */
export function expectedLatestPath(runId, key) {
  const contract = latestArtifactContracts.find((item) => item.key === key);
  if (!contract) throw new Error("unknown latest artifact key: " + key);
  return ".harness/evals/runs/" + runId + "/" + contract.filename;
}
