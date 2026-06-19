#!/usr/bin/env node
import { validateEvalImprovements } from "../src/lib/eval-improvement.js";

const validation = validateEvalImprovements();

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(validation, null, 2));
} else {
  console.log("status: " + validation.status);
  console.log("improvements_checked: " + validation.improvements_checked);
  for (const check of validation.checks) {
    console.log(check.status + ": " + check.label + " -> " + check.data_path);
  }
  for (const error of validation.errors) console.log("error: " + error);
}

process.exit(validation.status === "passed" ? 0 : 1);
