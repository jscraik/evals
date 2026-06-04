#!/usr/bin/env node
import { validateContractCatalog } from "../src/lib/contract-catalog.js";

const validation = validateContractCatalog();

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(validation, null, 2));
} else {
  console.log("status: " + validation.status);
  console.log("contracts_checked: " + validation.contracts_checked);
  for (const check of validation.checks) {
    console.log(check.status + ": " + check.label + " -> " + check.data_path);
  }
  for (const error of validation.errors) console.log("error: " + error);
}

process.exit(validation.status === "passed" ? 0 : 1);
