import { emitFailure } from "../lib/failures.js";
import { resolveRepoRootOption } from "../lib/repo-root-option.js";
import { buildRuntimeState } from "../lib/runtime-state.js";

/**
 * Print the local runtime state packet.
 *
 * @param {boolean} jsonMode - When true, print the full machine-readable packet.
 * @param {Object} [options] - Optional state controls.
 * @param {string} [options.artifactRepoRoot] - Repository root whose latest artifact packet should be inspected.
 */
export function stateCommand(jsonMode, options = {}) {
  let artifactRepoRoot;
  try {
    artifactRepoRoot = resolveRepoRootOption(options.artifactRepoRoot);
  } catch (error) {
    emitFailure(jsonMode, {
      status: "failed",
      requirement: "repo root option",
      errors: [error.message],
      recovery: "Pass an existing directory to --repo-root, then rerun the command."
    });
  }
  const state = buildRuntimeState(new Date(), { ...options, artifactRepoRoot });
  if (jsonMode) {
    console.log(JSON.stringify(state, null, 2));
  } else {
    console.log("status: " + state.status);
    console.log("latest: " + state.latest_path);
    if (state.latest.run_id) console.log("run_id: " + state.latest.run_id);
    console.log("validation: " + state.validation.status);
    for (const artifact of state.artifacts) {
      console.log(artifact.status + ": " + artifact.key + " -> " + (artifact.path || "none"));
    }
    console.log("next: " + state.recommended_commands[0]);
  }
  process.exit(0);
}
