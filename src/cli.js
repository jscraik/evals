#!/usr/bin/env node
import { runTarget } from "./commands/run.js";
import { stateCommand } from "./commands/state.js";
import { checkCommand, validateCommand, validateSchemaCommand } from "./commands/validation.js";

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
    "  pnpm evals validate-schema <claim-registry|score-vector> <json-file> [--json]",
    "  pnpm evals check [--json]",
    "  pnpm evals state [--json]"
  ].join("\n");
  if (exitCode === 0) console.log(message);
  else console.error(message);
  process.exit(exitCode);
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) usage(0);
const jsonMode = args.includes("--json");
const positional = args.filter((arg) => arg !== "--json");

if (positional[0] === "run" && positional.length === 2) runTarget(positional[1], jsonMode);
if (positional[0] === "validate" && positional.length === 2) validateCommand(positional[1], jsonMode);
if (positional[0] === "validate-schema" && positional.length === 3) validateSchemaCommand(positional[1], positional[2], jsonMode);
if (positional[0] === "check" && positional.length === 1) checkCommand(jsonMode);
if (positional[0] === "state" && positional.length === 1) stateCommand(jsonMode);
usage(1);
