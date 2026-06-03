#!/usr/bin/env node
import { runTarget } from "./commands/run.js";
import { stateCommand } from "./commands/state.js";
import { checkCommand, validateCommand, validateContractsCommand, validateSchemaCommand } from "./commands/validation.js";

/**
 * Print CLI usage instructions and terminate the process with the given exit code.
 *
 * If `exitCode` is 0 the message is written to stdout; otherwise it is written to stderr.
 * @param {number} [exitCode=1] - Exit code with which the process will terminate.
 */
function usage(exitCode = 1) {
  const message = [
    "Usage:",
    "  pnpm evals run <case-file|suite.json> [--json]",
    "  pnpm evals validate <case-file|latest.json> [--json]",
    "  pnpm evals validate-contracts [--json]",
    "  pnpm evals validate-schema <claim-registry|score-vector> <json-file> [--repo-root <path>] [--json]",
    "  pnpm evals check [--smoke] [--repo-root <path>] [--json]",
    "  pnpm evals state [--repo-root <path>] [--json]"
  ].join("\n");
  if (exitCode === 0) console.log(message);
  else console.error(message);
  process.exit(exitCode);
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) usage(0);
const parsed = parseArgs(args);
const jsonMode = parsed.jsonMode;
const smokeMode = parsed.smokeMode;
const positional = parsed.positional;

if (smokeMode && positional[0] !== "check") usage(1);
if (parsed.repoRoot && positional[0] !== "check" && positional[0] !== "state" && positional[0] !== "validate-schema") usage(1);
if (positional[0] === "run" && positional.length === 2) runTarget(positional[1], jsonMode);
if (positional[0] === "validate" && positional.length === 2) validateCommand(positional[1], jsonMode);
if (positional[0] === "validate-contracts" && positional.length === 1) validateContractsCommand(jsonMode);
if (positional[0] === "validate-schema" && positional.length === 3) {
  validateSchemaCommand(positional[1], positional[2], jsonMode, { artifactRepoRoot: parsed.repoRoot });
}
if (positional[0] === "check" && positional.length === 1) checkCommand(jsonMode, { smokeContext: smokeMode, artifactRepoRoot: parsed.repoRoot });
if (positional[0] === "state" && positional.length === 1) stateCommand(jsonMode, { artifactRepoRoot: parsed.repoRoot });
usage(1);

function parseArgs(argv) {
  const parsed = {
    jsonMode: false,
    smokeMode: false,
    repoRoot: null,
    positional: []
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") {
      parsed.jsonMode = true;
    } else if (arg === "--smoke") {
      parsed.smokeMode = true;
    } else if (arg === "--repo-root") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) usage(1);
      parsed.repoRoot = value;
      index += 1;
    } else {
      parsed.positional.push(arg);
    }
  }
  return parsed;
}
