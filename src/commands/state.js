import { buildRuntimeState } from "../lib/runtime-state.js";

/**
 * Print the local runtime state packet.
 *
 * @param {boolean} jsonMode - When true, print the full machine-readable packet.
 */
export function stateCommand(jsonMode) {
  const state = buildRuntimeState();
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
