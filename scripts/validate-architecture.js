#!/usr/bin/env node
import { builtinModules } from "node:module";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaultRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const builtinSpecifiers = new Set([...builtinModules, ...builtinModules.map((name) => "node:" + name)]);
const dependencySections = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"];
const sourceRoots = ["src", "scripts"];
const ignoredDirectories = new Set([".git", "node_modules", "coverage", "dist", "build"]);

const blockedSpecifierPatterns = [
  { pattern: /(^|[/@])coding-harness($|[/@])/, reason: "runtime dependency on coding-harness is phase-one blocked" },
  { pattern: /(^|[/@])agent-skills($|[/@])/, reason: "runtime dependency on agent-skills is phase-one blocked" },
  { pattern: /(^|[/@])diagram-cli($|[/@])/, reason: "runtime dependency on diagram-cli is phase-one blocked" },
  { pattern: /(^|[/@])session-collector($|[/@])/, reason: "runtime dependency on session collectors is phase-one blocked" },
  { pattern: /(^|[/@])otel-collector($|[/@])|opentelemetry/i, reason: "telemetry collectors/exporters cannot become phase-one authority" },
  { pattern: /(^|[/@])cloud-runner($|[/@])|cloudrunner/i, reason: "cloud runners are phase-one blocked" },
  { pattern: /(^|[/@])plugin(s)?-runtime($|[/@])|plugin-system/i, reason: "plugin systems are phase-one blocked" },
  { pattern: /dashboard/i, reason: "dashboards are phase-one blocked" },
  { pattern: /external-adapter|adapter-root/i, reason: "external adapter roots are phase-one blocked" },
  { pattern: /riteway/i, reason: "Riteway is prior art only; runtime dependency is phase-one blocked" },
  { pattern: /(^|[/@])(llm-judge|ai-judge|judge-runner)($|[/@])/i, reason: "required LLM judge gates are phase-one blocked" }
];

const importPatterns = [
  /^\s*import\s+(?:[^'"()]*?\s+from\s+)?["']([^"']+)["']/gm,
  /^\s*export\s+[^"']*?\s+from\s+["']([^"']+)["']/gm,
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g
];

export function validateArchitectureBoundaries(options = {}) {
  const root = resolve(options.root || defaultRoot);
  const files = options.files || architectureSourceFiles(root);
  const errors = [];

  errors.push(...validatePackageDependencies(root));

  for (const filePath of files) {
    const relPath = toPosix(relative(root, filePath));
    const layer = classifyLayer(relPath);
    if (!layer) continue;

    const source = stripJavaScriptComments(readFileSync(filePath, "utf8"));
    errors.push(...validateRuntimeLoadExpressions(relPath, source));

    for (const specifier of importSpecifiers(source)) {
      errors.push(...validateBlockedSpecifier(relPath, specifier));
      if (isBareSpecifier(specifier) && !builtinSpecifiers.has(specifier)) {
        errors.push(relPath + ": bare runtime import " + JSON.stringify(specifier) + " is not allowed in phase one");
        continue;
      }
      if (!isRelativeSpecifier(specifier)) continue;

      const targetPath = resolveRelativeImport(root, filePath, specifier);
      if (!targetPath) {
        errors.push(relPath + ": unresolved relative import " + JSON.stringify(specifier));
        continue;
      }
      const targetRelPath = toPosix(relative(root, targetPath));
      errors.push(...validateLayerEdge(relPath, layer, targetRelPath));
    }
  }

  return { status: errors.length === 0 ? "pass" : "fail", errors };
}

export function architectureSourceFiles(root = defaultRoot) {
  const files = [];
  for (const sourceRoot of sourceRoots) {
    const absoluteRoot = join(root, sourceRoot);
    if (existsSync(absoluteRoot)) files.push(...listJavaScriptFiles(absoluteRoot));
  }
  return files;
}

export function importSpecifiers(source) {
  const specifiers = [];
  for (const pattern of importPatterns) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) {
      if (isPlausibleSpecifier(match[1])) specifiers.push(match[1]);
    }
  }
  return specifiers;
}

function validatePackageDependencies(root) {
  const packagePath = join(root, "package.json");
  if (!existsSync(packagePath)) return ["package.json: missing package metadata for architecture dependency check"];
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  const errors = [];
  for (const section of dependencySections) {
    for (const dependencyName of Object.keys(packageJson[section] || {})) {
      for (const blocked of blockedSpecifierPatterns) {
        if (blocked.pattern.test(dependencyName)) {
          errors.push("package.json: " + section + "." + dependencyName + " violates architecture boundary: " + blocked.reason);
        }
      }
    }
  }
  return errors;
}

function validateBlockedSpecifier(relPath, specifier) {
  const errors = [];
  for (const blocked of blockedSpecifierPatterns) {
    if (blocked.pattern.test(specifier)) {
      errors.push(relPath + ": import " + JSON.stringify(specifier) + " violates architecture boundary: " + blocked.reason);
    }
  }
  return errors;
}

function validateRuntimeLoadExpressions(relPath, source) {
  const errors = [];
  const lines = source.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;
    const structuralLine = structuralCodeLine(line);
    if (/\bcreateRequire\b/.test(structuralLine)) {
      errors.push(relPath + ":" + lineNumber + ": createRequire is not allowed in phase-one runtime code; use static ESM imports");
    }
  }
  errors.push(...validateLiteralRuntimeLoads(relPath, source, "import", "non-literal dynamic import is not allowed in phase-one runtime code"));
  errors.push(...validateLiteralRuntimeLoads(relPath, source, "require", "non-literal require is not allowed in phase-one runtime code"));
  return errors;
}

function validateLiteralRuntimeLoads(relPath, source, callee, message) {
  const errors = [];
  const callPattern = new RegExp("\\b" + callee + "\\s*\\(", "g");
  for (const match of source.matchAll(callPattern)) {
    const argumentStart = match.index + match[0].length;
    if (!hasSingleLiteralRuntimeLoadArgument(source, argumentStart)) {
      errors.push(relPath + ":" + lineNumberAt(source, match.index) + ": " + message);
    }
  }
  return errors;
}

function hasSingleLiteralRuntimeLoadArgument(source, argumentStart) {
  let index = skipWhitespace(source, argumentStart);
  const quote = source[index];
  if (quote !== "\"" && quote !== "'") return false;
  index += 1;
  while (index < source.length) {
    const char = source[index];
    if (char === "\\") {
      index += 2;
      continue;
    }
    if (char === quote) {
      index += 1;
      return source[skipWhitespace(source, index)] === ")";
    }
    index += 1;
  }
  return false;
}

function skipWhitespace(source, index) {
  while (index < source.length && /\s/.test(source[index])) index += 1;
  return index;
}

function lineNumberAt(source, index) {
  let lineNumber = 1;
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (source[cursor] === "\n") lineNumber += 1;
  }
  return lineNumber;
}

function structuralCodeLine(line) {
  return line
    .replace(/\/[^/\\]*(?:\\.[^/\\]*)*\/[a-z]*/gi, "")
    .replace(/(["'])(?:\\.|(?!\1).)*\1/g, "$1$1");
}

function stripJavaScriptComments(source) {
  let output = "";
  let quote = null;
  let inBlockComment = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        output += "  ";
        index += 1;
        inBlockComment = false;
      } else {
        output += char === "\n" ? "\n" : " ";
      }
      continue;
    }

    if (quote) {
      output += char;
      if (char === "\\" && next) {
        output += next;
        index += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "\"" || char === "'") {
      quote = char;
      output += char;
      continue;
    }

    if (char === "/" && next === "/") {
      output += "  ";
      index += 1;
      while (index + 1 < source.length && source[index + 1] !== "\n") {
        output += " ";
        index += 1;
      }
      continue;
    }

    if (char === "/" && next === "*") {
      output += "  ";
      index += 1;
      inBlockComment = true;
      continue;
    }

    output += char;
  }
  return output;
}

function validateLayerEdge(relPath, layer, targetRelPath) {
  if (targetRelPath.startsWith(".harness/")) {
    return [relPath + ": runtime import of governance artifact " + targetRelPath + " is not allowed"];
  }
  if (layer === "cli" && !targetRelPath.startsWith("src/commands/")) {
    return [relPath + ": src/cli.js may import command modules only; found " + targetRelPath];
  }
  if (layer === "command" && !targetRelPath.startsWith("src/lib/")) {
    return [relPath + ": command modules may import src/lib/** or Node builtins only; found " + targetRelPath];
  }
  if (layer === "lib" && (targetRelPath === "src/cli.js" || targetRelPath.startsWith("src/commands/") || targetRelPath.startsWith("scripts/"))) {
    return [relPath + ": src/lib/** must not import upward into " + targetRelPath];
  }
  if (layer === "script" && (targetRelPath === "src/cli.js" || targetRelPath.startsWith("src/commands/"))) {
    return [relPath + ": scripts may import src/lib/** for validation seams, not command or CLI modules; found " + targetRelPath];
  }
  return [];
}

function classifyLayer(relPath) {
  if (relPath === "src/cli.js") return "cli";
  if (relPath.startsWith("src/commands/")) return "command";
  if (relPath.startsWith("src/lib/")) return "lib";
  if (relPath.startsWith("scripts/")) return "script";
  return null;
}

function resolveRelativeImport(root, importerPath, specifier) {
  const basePath = resolve(dirname(importerPath), specifier);
  const candidates = extname(basePath) ? [basePath] : [basePath + ".js", join(basePath, "index.js")];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      const resolved = resolve(candidate);
      if (resolved === root || resolved.startsWith(root + sep)) return resolved;
    }
  }
  return null;
}

function listJavaScriptFiles(path) {
  const stat = statSync(path);
  if (stat.isFile()) return path.endsWith(".js") ? [path] : [];
  if (!stat.isDirectory()) return [];
  const files = [];
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) files.push(...listJavaScriptFiles(join(path, entry.name)));
    if (entry.isFile() && entry.name.endsWith(".js")) files.push(join(path, entry.name));
  }
  return files;
}

function isRelativeSpecifier(specifier) {
  return specifier.startsWith("./") || specifier.startsWith("../");
}

function isBareSpecifier(specifier) {
  return !isRelativeSpecifier(specifier) && !specifier.startsWith("node:");
}

function isPlausibleSpecifier(specifier) {
  return typeof specifier === "string" && /^[A-Za-z0-9@._~:/-]+$/.test(specifier);
}

function toPosix(path) {
  return path.split(sep).join("/");
}

export function main() {
  const result = validateArchitectureBoundaries();
  if (result.status === "pass") {
    console.log("architecture boundaries passed");
    return;
  }
  console.error(["architecture boundaries failed", ...result.errors].join("\n"));
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
