import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import test from "node:test";

import {
  credentialScanPaths,
  credentialScanRootCandidates,
  credentialScanWithRg,
  scanCredentialPatterns
} from "../scripts/verify.js";

function withTempRepo(callback) {
  const repo = mkdtempSync(join(tmpdir(), "evals-verify-"));
  try {
    return callback(repo);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
}

function writeNested(root, path, content) {
  const filePath = join(root, path);
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, content);
  return filePath;
}

test("credential scan includes canonical proof roots when present", () => {
  withTempRepo((repo) => {
    for (const root of credentialScanRootCandidates) {
      mkdirSync(join(repo, root), { recursive: true });
    }

    const scannedRoots = credentialScanPaths(repo)
      .map((path) => relative(repo, path))
      .sort();

    assert.deepEqual(scannedRoots, [...credentialScanRootCandidates].sort());
  });
});

test("credential scan ignores prose-only privacy wording", () => {
  withTempRepo((repo) => {
    const specRoot = join(repo, ".harness/specs");
    mkdirSync(specRoot, { recursive: true });
    writeNested(
      repo,
      ".harness/specs/prose.md",
      "This document can discuss a secret, token, password, or api key without containing a credential-shaped value.\n"
    );

    assert.deepEqual(scanCredentialPatterns([specRoot]), []);
  });
});

test("credential scan reports credential-shaped assignments without revealing values", () => {
  withTempRepo((repo) => {
    const root = join(repo, ".harness/research");
    mkdirSync(root, { recursive: true });
    const label = "api_" + "key";
    const value = "A".repeat(24);
    writeNested(repo, ".harness/research/leak.md", label + " = " + value + "\n");

    const matches = scanCredentialPatterns([root]);

    assert.equal(matches.length, 1);
    assert.match(matches[0], /credential-like pattern redacted; match length/);
    assert.doesNotMatch(matches[0], new RegExp(value));
  });
});

test("Node credential fallback reports every credential-shaped match on a line", () => {
  withTempRepo((repo) => {
    const root = join(repo, "scripts");
    mkdirSync(root, { recursive: true });
    const left = "token";
    const right = "password";
    const firstValue = "C".repeat(24);
    const secondValue = "D".repeat(24);
    writeNested(repo, "scripts/leak.js", left + " = " + firstValue + "; " + right + " = " + secondValue + "\n");

    const matches = scanCredentialPatterns([root]);

    assert.equal(matches.length, 2);
    assert.doesNotMatch(matches.join("\n"), new RegExp(firstValue));
    assert.doesNotMatch(matches.join("\n"), new RegExp(secondValue));
  });
});

test("rg credential scan and Node fallback agree on redacted failures", (t) => {
  const rgVersion = spawnSync("rg", ["--version"], { encoding: "utf8" });
  if (rgVersion.error || rgVersion.status !== 0) {
    t.skip("rg is unavailable");
    return;
  }

  withTempRepo((repo) => {
    const root = join(repo, "src");
    mkdirSync(root, { recursive: true });
    const label = "sec" + "ret";
    const value = "B".repeat(24);
    writeNested(repo, "src/leak.js", "export const marker = '" + label + " = " + value + "';\n");

    const rgResult = credentialScanWithRg([root]);
    const nodeMatches = scanCredentialPatterns([root]);

    assert.equal(rgResult.status, "fail");
    assert.equal(nodeMatches.length, 1);
    assert.doesNotMatch(rgResult.output, new RegExp(value));
    assert.doesNotMatch(nodeMatches[0], new RegExp(value));
    assert.match(rgResult.output, /credential-like pattern redacted/);
    assert.match(nodeMatches[0], /credential-like pattern redacted/);
  });
});

test("rg credential scan falls back to Node scanner when rg is unavailable", () => {
  withTempRepo((repo) => {
    const cleanRoot = join(repo, "fixtures");
    const leakRoot = join(repo, ".harness/evals");
    mkdirSync(cleanRoot, { recursive: true });
    mkdirSync(leakRoot, { recursive: true });
    writeNested(cleanRoot, "prose.md", "A token can be named in prose without a value.\n");
    const value = "E".repeat(24);
    writeNested(leakRoot, "leak.md", "token = " + value + "\n");
    const missingRg = () => ({
      error: Object.assign(new Error("spawn rg ENOENT"), { code: "ENOENT" })
    });

    const cleanResult = credentialScanWithRg([cleanRoot], missingRg);
    const leakResult = credentialScanWithRg([leakRoot], missingRg);

    assert.equal(cleanResult.status, "pass");
    assert.equal(leakResult.status, "fail");
    assert.match(leakResult.output, /credential-like pattern redacted/);
    assert.doesNotMatch(leakResult.output, new RegExp(value));
  });
});
