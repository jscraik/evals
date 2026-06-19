#!/usr/bin/env node
import { validateCasePromotions } from "../src/lib/case-promotion.js";

const validation = validateCasePromotions();

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(validation, null, 2));
} else {
  console.log("status: " + validation.status);
  console.log("promotions_checked: " + validation.promotions_checked);
  for (const check of validation.checks) {
    console.log(check.status + ": " + check.label + " -> " + check.data_path);
  }
  for (const error of validation.errors) console.log("error: " + error);
}

process.exit(validation.status === "passed" ? 0 : 1);
