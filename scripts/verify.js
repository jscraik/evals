#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const credentialPatternSource = [
  "sk-[A-Za-z0-9_-]{20,}",
  "(api[_-]?key|token|secret|password)\\s*[:=]\\s*[\"']?[A-Za-z0-9_./+=-]{16,}",
  "-{5}BEGIN (RSA|OPENSSH|PRIVATE) KEY-{5}"
].join("|");

const credentialGlobalPattern = new RegExp(credentialPatternSource, "g");

export const credentialScanRootCandidates = [
  "fixtures",
  "schemas",
  "src",
  "scripts",
  "test",
  "tests",
  ".harness/evals",
  ".harness/research",
  ".harness/specs",
  ".harness/plan",
  ".harness/plans",
  ".harness/linear"
];

const excludedCredentialScanDirectories = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".pnpm-store",
  ".turbo"
]);

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
    run: () => {
      if (!existsSync("schemas")) return fail("schemas directory is missing");
      const schemaFiles = readdirSync("schemas").filter((name) => name.endsWith(".schema.json"));
      return schemaFiles.length > 0 ? pass(schemaFiles.join("\n")) : fail("no *.schema.json files found under schemas/");
    }
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
    command: "pnpm evals state --json",
    run: () => runCommand("pnpm", ["evals", "state", "--json"])
  },
  {
    command: "pnpm evals check --json",
    run: () => runCommand("pnpm", ["evals", "check", "--json"])
  },
  {
    command: credentialScanCommand,
    run: credentialScan
  }
];

export function credentialScanPaths(cwd = ".") {
  return credentialScanRootCandidates
    .map((path) => join(cwd, path))
    .filter((path) => existsSync(path));
}

function credentialScanCommand() {
  const searchPaths = credentialScanPaths();
  const suffix = searchPaths.length > 0 ? searchPaths.join(" ") : "<no existing scan paths>";
  if (process.env.EVALS_VERIFY_FORCE_NODE_CREDENTIAL_SCAN === "1") {
    return "node credential scan fallback using " + JSON.stringify(credentialPatternSource) + " " + suffix;
  }
  return 'rg -n -o --replace "credential-like pattern redacted" ' + JSON.stringify(credentialPatternSource) + " " + suffix;
}

function credentialScan() {
  const searchPaths = credentialScanPaths();
  if (searchPaths.length === 0) return fail("no credential-scan paths exist");
  if (process.env.EVALS_VERIFY_FORCE_NODE_CREDENTIAL_SCAN === "1") {
    const matches = scanCredentialPatterns(searchPaths);
    return matches.length === 0 ? pass("no credential-like patterns found") : fail(matches.join("\n"));
  }
  return credentialScanWithRg(searchPaths);
}

export function credentialScanWithRg(searchPaths, spawn = spawnSync) {
  const result = spawn("rg", [
    "-n",
    "-o",
    "--replace",
    "credential-like pattern redacted",
    credentialPatternSource,
    ...searchPaths
  ], {
    encoding: "utf8",
    timeout: 10_000,
    killSignal: "SIGKILL"
  });
  const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
  if (result.signal) return fail("credential scan terminated by signal " + result.signal);
  if (result.error && result.error.code === "ETIMEDOUT") return fail("credential scan timed out");
  if (!result.error) {
    if (result.status === 1) return pass("no credential-like patterns found");
    return result.status === 0 ? fail(output) : fail(output || "exit status " + result.status);
  }
  if (result.error.code !== "ENOENT") return fail(result.error.message);

  const matches = scanCredentialPatterns(searchPaths);
  return matches.length === 0 ? pass("no credential-like patterns found") : fail(matches.join("\n"));
}

export function scanCredentialPatterns(searchPaths) {
  const matches = [];
  for (const searchPath of searchPaths) {
    for (const filePath of listFiles(searchPath)) {
      let lines;
      try {
        lines = readFileSync(filePath, "utf8").split(/\r?\n/);
      } catch (error) {
        matches.push(filePath + ": credential scan unreadable: " + error.message);
        continue;
      }
      for (const [index, line] of lines.entries()) {
        for (const match of line.matchAll(credentialGlobalPattern)) {
          matches.push(filePath + ":" + (index + 1) + ": credential-like pattern redacted; match length " + match[0].length);
        }
      }
    }
  }
  return matches;
}

function listFiles(path) {
  const stat = statSync(path);
  if (stat.isFile()) return [path];
  if (!stat.isDirectory()) return [];
  const files = [];
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory() && !excludedCredentialScanDirectories.has(entry.name)) files.push(...listFiles(child));
    if (entry.isFile()) files.push(child);
  }
  return files;
}

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

export function main() {
  const results = [];
  for (const check of checks) {
    const command = typeof check.command === "function" ? check.command() : check.command;
    const result = check.run();
    results.push({ command, ...result });
    const marker = result.status === "pass" ? "PASS" : "FAIL";
    console.log(marker + ": " + command);
    if (result.output) console.log(result.output);
    if (result.status !== "pass") break;
  }

  if (results.some((result) => result.status !== "pass")) {
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
