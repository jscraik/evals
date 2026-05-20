import { join } from "node:path";

import { readJson } from "./json.js";
import { rel, schemaDir } from "./paths.js";

export const schemaTargets = {
  case: {
    schema: join(schemaDir, "eval-case.schema.json"),
    label: "eval case"
  },
  result: {
    schema: join(schemaDir, "eval-result.schema.json"),
    label: "eval result"
  },
  manifest: {
    schema: join(schemaDir, "artifact-manifest.schema.json"),
    label: "artifact manifest"
  },
  scorers: {
    schema: join(schemaDir, "scorer-result.schema.json"),
    label: "scorer results"
  },
  baseline: {
    schema: join(schemaDir, "baseline-result.schema.json"),
    label: "baseline result"
  },
  latest: {
    schema: join(schemaDir, "latest-run.schema.json"),
    label: "latest run"
  }
};

/**
 * Append a formatted error message to an errors array.
 * @param {string[]} errors - Array that will receive the error string.
 * @param {string} path - Document path or location identifier for the error.
 * @param {string} message - Human-readable description of the error.
 */
function addError(errors, path, message) {
  errors.push(path + ": " + message);
}

/**
 * Determine whether a value matches a specified type token.
 * @param {*} value - The value to test.
 * @param {string} type - The type token to check against. Supported tokens: standard `typeof` results (e.g. `"string"`, `"number"`, `"boolean"`, `"function"`, `"undefined"`), and special tokens `"array"`, `"integer"`, `"null"`, `"object"` (where `"object"` means a non-null, non-array object).
 * @returns {boolean} `true` if `value` matches the specified type, `false` otherwise.
 */
function isType(value, type) {
  if (type === "array") return Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "null") return value === null;
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  return typeof value === type;
}

/**
 * Validate a value against a simplified JSON Schema and collect any validation errors.
 *
 * Performs type checks, `const`/`enum` constraints, string and date-time formats, object property requirements and additionalProperties rules, and array constraints including minItems, uniqueItems and item validation; recurses into nested objects and arrays, using `path` to locate errors.
 *
 * @param {*} value - The value to validate.
 * @param {object} schema - The schema object describing expected structure and constraints.
 * @param {string} [path="$"] - Dot/bracket notation path used to identify the location of validation errors.
 * @returns {string[]} Array of validation error messages; empty if the value conforms to the schema.
 */
export function validateWithSchema(value, schema, path = "$") {
  const errors = [];
  if (Array.isArray(schema.type)) {
    if (!schema.type.some((type) => isType(value, type))) {
      addError(errors, path, "expected type " + schema.type.join(" or "));
      return errors;
    }
  } else if (schema.type && !isType(value, schema.type)) {
    addError(errors, path, "expected type " + schema.type);
    return errors;
  }

  if ("const" in schema && value !== schema.const) addError(errors, path, "expected const " + JSON.stringify(schema.const));
  if (schema.enum && !schema.enum.includes(value)) addError(errors, path, "expected one of " + schema.enum.join(", "));
  if (schema.minLength !== undefined && typeof value === "string" && value.length < schema.minLength) {
    addError(errors, path, "must have length >= " + schema.minLength);
  }
  if (schema.pattern && typeof value === "string" && !new RegExp(schema.pattern).test(value)) {
    addError(errors, path, "must match pattern " + schema.pattern);
  }
  if (schema.format === "date-time" && typeof value === "string" && Number.isNaN(Date.parse(value))) {
    addError(errors, path, "must be a date-time string");
  }

  if (schema.type === "object" && value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required || []) {
      if (!(key in value)) addError(errors, path + "." + key, "missing required property");
    }
    const allowed = new Set(Object.keys(schema.properties || {}));
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) addError(errors, path + "." + key, "additional property is not allowed");
      }
    }
    for (const [key, childSchema] of Object.entries(schema.properties || {})) {
      if (key in value) errors.push(...validateWithSchema(value[key], childSchema, path + "." + key));
    }
  }

  if (schema.type === "array" && Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      addError(errors, path, "must contain at least " + schema.minItems + " items");
    }
    if (schema.uniqueItems) {
      const seen = new Set(value.map((item) => JSON.stringify(item)));
      if (seen.size !== value.length) addError(errors, path, "must contain unique items");
    }
    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(...validateWithSchema(item, schema.items, path + "[" + index + "]"));
      });
    }
  }

  return errors;
}

/**
 * Validate a JSON data file against a JSON schema file.
 * @param {string} schemaPath - Filesystem path to the JSON schema.
 * @param {string} dataPath - Filesystem path to the JSON data to validate.
 * @returns {string[]} An array of validation error messages; empty if validation passed. If the schema or data file cannot be parsed, returns a single-element array containing a message of the form "`<relative path>`: <parse error message>".
 */
export function validateDocument(schemaPath, dataPath) {
  let schema;
  try {
    schema = readJson(schemaPath);
  } catch (error) {
    return [rel(schemaPath) + ": schema JSON parse failed: " + error.message];
  }

  let data;
  try {
    data = readJson(dataPath);
  } catch (error) {
    return [rel(dataPath) + ": JSON parse failed: " + error.message];
  }

  return validateWithSchema(data, schema);
}

/**
 * Validate a JSON file against a named schema target and report the result.
 *
 * @param {string} schemaKey - Key identifying a schema in `schemaTargets`.
 * @param {string} dataPath - Filesystem path to the JSON data file to validate.
 * @returns {{label: string, schema_path: string, data_path: string, status: "pass" | "fail", errors: string[]}} An object summarising the check: `label` is the target's human-readable name (or the provided `schemaKey` for unknown targets), `schema_path` and `data_path` are the relative paths to the schema and data, `status` is `"pass"` when there are no validation errors and `"fail"` otherwise, and `errors` is the list of validation or lookup error messages.
 */
export function schemaCheck(schemaKey, dataPath) {
  const target = schemaTargets[schemaKey];
  if (!target) {
    return {
      label: schemaKey,
      schema_path: "unknown schema target",
      data_path: rel(dataPath),
      status: "fail",
      errors: ["unknown schema target: " + schemaKey]
    };
  }
  const errors = validateDocument(target.schema, dataPath);
  return {
    label: target.label,
    schema_path: rel(target.schema),
    data_path: rel(dataPath),
    status: errors.length === 0 ? "pass" : "fail",
    errors
  };
}

/**
 * Validate an already-parsed object against a named schema target and report the result.
 *
 * @param {string} schemaKey - Key identifying a schema in `schemaTargets`.
 * @param {*} data - The already-parsed data object to validate.
 * @param {string} dataPath - Logical path identifier for error reporting (e.g., the original file path).
 * @returns {{label: string, schema_path: string, data_path: string, status: "pass" | "fail", errors: string[]}} An object summarising the check: `label` is the target's human-readable name (or the provided `schemaKey` for unknown targets), `schema_path` and `data_path` are the relative paths to the schema and data, `status` is `"pass"` when there are no validation errors and `"fail"` otherwise, and `errors` is the list of validation or lookup error messages.
 */
export function schemaCheckFromObject(schemaKey, data, dataPath) {
  const target = schemaTargets[schemaKey];
  if (!target) {
    return {
      label: schemaKey,
      schema_path: "unknown schema target",
      data_path: rel(dataPath),
      status: "fail",
      errors: ["unknown schema target: " + schemaKey]
    };
  }

  let schema;
  try {
    schema = readJson(target.schema);
  } catch (error) {
    return {
      label: target.label,
      schema_path: rel(target.schema),
      data_path: rel(dataPath),
      status: "fail",
      errors: [rel(target.schema) + ": schema JSON parse failed: " + error.message]
    };
  }

  const errors = validateWithSchema(data, schema);
  return {
    label: target.label,
    schema_path: rel(target.schema),
    data_path: rel(dataPath),
    status: errors.length === 0 ? "pass" : "fail",
    errors
  };
}
