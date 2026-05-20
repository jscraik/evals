#!/usr/bin/env node
import { runCase } from "./commands/run.js";
import { checkCommand, validateCommand } from "./commands/validation.js";

function usage(exitCode = 1) {
  const message = [
    "Usage:",
    "  pnpm evals run <case-file> [--json]",
    "  pnpm evals validate <case-file|latest.json> [--json]",
    "  pnpm evals check [--json]"
  ].join("\n");
  if (exitCode === 0) console.log(message);
  else console.error(message);
  process.exit(exitCode);
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) usage(0);
const jsonMode = args.includes("--json");
const positional = args.filter((arg) => arg !== "--json");

if (positional[0] === "run" && positional.length === 2) runCase(positional[1], jsonMode);
if (positional[0] === "validate" && positional.length === 2) validateCommand(positional[1], jsonMode);
if (positional[0] === "check" && positional.length === 1) checkCommand(jsonMode);
usage(1);
