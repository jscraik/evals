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

function pass(output) {
  return { status: "pass", output };
}

function fail(output) {
  return { status: "fail", output };
}

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
