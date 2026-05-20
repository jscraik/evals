#!/usr/bin/env node
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const checks = [
  {
    command: "test -f README.md",
    run: () => existsSync("README.md") ? pass("") : fail("README.md is missing")
  },
  {
    command: "test -f AGENTS.md",
    run: () => existsSync("AGENTS.md") ? pass("") : fail("AGENTS.md is missing")
  },
  {
    command: "find schemas -maxdepth 1 -type f -name \"*.schema.json\" -print",
    run: () => runCommand("find", ["schemas", "-maxdepth", "1", "-type", "f", "-name", "*.schema.json", "-print"])
  },
  {
    command: "test -f fixtures/smoke/pr-closeout.case.json",
    run: () => existsSync("fixtures/smoke/pr-closeout.case.json") ? pass("") : fail("fixtures/smoke/pr-closeout.case.json is missing")
  },
  {
    command: "pnpm test",
    run: () => runCommand("pnpm", ["test"])
  },
  {
    command: "pnpm evals run fixtures/smoke/pr-closeout.case.json",
    run: () => runCommand("pnpm", ["evals", "run", "fixtures/smoke/pr-closeout.case.json"])
  },
  {
    command: "pnpm evals run fixtures/smoke/pr-closeout.case.json --json",
    run: () => runCommand("pnpm", ["evals", "run", "fixtures/smoke/pr-closeout.case.json", "--json"])
  },
  {
    command: "pnpm evals check --json",
    run: () => runCommand("pnpm", ["evals", "check", "--json"])
  },
  {
    command: "rg -n \"sk-|api[_-]?key|token|secret|password|BEGIN (RSA|OPENSSH|PRIVATE) KEY\" fixtures .harness/evals",
    run: () => runCommand("rg", [
      "-n",
      "sk-|api[_-]?key|token|secret|password|BEGIN (RSA|OPENSSH|PRIVATE) KEY",
      "fixtures",
      ".harness/evals"
    ], {
      passStatuses: [1],
      statusMessages: {
        1: "no credential-like patterns found"
      }
    })
  }
];

/**
 * Create a result object representing a successful check.
 * @param {string} output - Message or combined stdout/stderr associated with the successful check; may be an empty string.
 * @returns {{status: "pass", output: string}} An object with `status` set to `"pass"` and the provided `output`.
 */
function pass(output) {
  return { status: "pass", output };
}

/**
 * Create a standardized failure result object containing a failure status and associated output.
 * @param {string} output - Message or data describing the failure.
 * @returns {{status: "fail", output: string}} An object with `status` set to `"fail"` and the provided `output`.
 */
function fail(output) {
  return { status: "fail", output };
}

/**
 * Execute a command synchronously and classify its outcome as a pass or fail.
 * @param {string} command - The executable to run.
 * @param {string[]} args - Array of arguments to pass to the command.
 * @param {Object} [options] - Behavioural options.
 * @param {number[]} [options.passStatuses] - Exit codes treated as success; defaults to `[0]`.
 * @param {Object.<number,string>} [options.statusMessages] - Mapping from exit code to a message that overrides command output.
 * @returns {{status: "pass" | "fail", output: string}} An object with `status` set to `"pass"` when the process exit code is in `options.passStatuses`, otherwise `"fail"`. `output` contains the combined stdout/stderr or a status/message; if the child process failed to spawn, `output` contains the error message.
 */
function runCommand(command, args, options = {}) {
  const passStatuses = options.passStatuses || [0];
  const statusMessages = options.statusMessages || {};
  const result = spawnSync(command, args, {
    encoding: "utf8",
    timeout: 120_000,
    killSignal: "SIGKILL"
  });
  const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
  if (result.error) return fail(result.error.message);
  const message = statusMessages[result.status] || output;
  return passStatuses.includes(result.status) ? pass(message) : fail(message || "exit status " + result.status);
}

const results = [];
for (const check of checks) {
  const result = check.run();
  results.push({ command: check.command, ...result });
  const marker = result.status === "pass" ? "PASS" : "FAIL";
  console.log(marker + ": " + check.command);
  if (result.output) console.log(result.output);
  if (result.status !== "pass") break;
}

if (results.some((result) => result.status !== "pass")) {
  process.exit(1);
}
