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

export const supportedSchemaKeywords = new Set([
  "$id",
  "$schema",
  "additionalProperties",
  "const",
  "description",
  "enum",
  "format",
  "items",
  "minItems",
  "minLength",
  "pattern",
  "properties",
  "required",
  "title",
  "type",
  "uniqueItems"
]);

const supportedFormats = new Set(["date-time"]);
const supportedTypes = new Set(["array", "boolean", "integer", "null", "number", "object", "string"]);

/**
 * Append a formatted error message to an errors array.
 * @param {string[]} errors - Array that will receive the error string.
 * @param {string} path - Document path or location identifier for the error.
 * @param {string} message - Human-readable description of the error.
 */
function addError(errors, path, message) {
  errors.push(path + ": " + message);
}

function isSchemaObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isDateTime(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value));
}

function validateSchemaContract(schema, path = "$schema") {
  const errors = [];
  if (!isSchemaObject(schema)) {
    addError(errors, path, "schema must be a JSON object");
    return errors;
  }

  for (const key of Object.keys(schema)) {
    if (!supportedSchemaKeywords.has(key)) {
      addError(errors, path + "." + key, "unsupported JSON Schema keyword");
    }
  }

  if (Array.isArray(schema.type)) {
    for (const type of schema.type) {
      if (!supportedTypes.has(type)) addError(errors, path + ".type", "unsupported type " + JSON.stringify(type));
    }
  } else if (schema.type !== undefined && !supportedTypes.has(schema.type)) {
    addError(errors, path + ".type", "unsupported type " + JSON.stringify(schema.type));
  }

  if (schema.format !== undefined && !supportedFormats.has(schema.format)) {
    addError(errors, path + ".format", "unsupported format " + JSON.stringify(schema.format));
  }

  for (const [key, childSchema] of Object.entries(schema.properties || {})) {
    if (!isSchemaObject(childSchema)) {
      addError(errors, path + ".properties." + key, "property schema must be a JSON object");
      continue;
    }
    errors.push(...validateSchemaContract(childSchema, path + ".properties." + key));
  }

  if (schema.items !== undefined) {
    if (!isSchemaObject(schema.items)) {
      addError(errors, path + ".items", "items schema must be a JSON object");
    } else {
      errors.push(...validateSchemaContract(schema.items, path + ".items"));
    }
  }

  return errors;
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

function schemaAllowsType(schema, type) {
  return Array.isArray(schema.type) ? schema.type.includes(type) : schema.type === type;
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
function validateValueWithSchema(value, schema, path) {
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
  if (schema.format === "date-time" && typeof value === "string" && !isDateTime(value)) {
    addError(errors, path, "must be a date-time string");
  }

  if (schemaAllowsType(schema, "object") && value && typeof value === "object" && !Array.isArray(value)) {
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
      if (key in value) errors.push(...validateValueWithSchema(value[key], childSchema, path + "." + key));
    }
  }

  if (schemaAllowsType(schema, "array") && Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      addError(errors, path, "must contain at least " + schema.minItems + " items");
    }
    if (schema.uniqueItems) {
      const seen = new Set(value.map((item) => JSON.stringify(item)));
      if (seen.size !== value.length) addError(errors, path, "must contain unique items");
    }
    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(...validateValueWithSchema(item, schema.items, path + "[" + index + "]"));
      });
    }
  }

  return errors;
}

/**
 * Validate a value against the repository's explicit JSON Schema subset.
 *
 * This is not a full JSON Schema implementation. It first validates that the
 * schema only uses supported local keywords, then validates the supplied value.
 * Unsupported schema semantics fail closed so schema-backed checks cannot imply
 * draft support the repo does not enforce.
 *
 * @param {*} value - The value to validate.
 * @param {object} schema - The schema object describing expected structure and constraints.
 * @param {string} [path="$"] - Dot/bracket notation path used to identify validation errors.
 * @returns {string[]} Array of validation errors; empty if the value conforms to the supported schema.
 */
export function validateWithSchema(value, schema, path = "$") {
  const contractErrors = validateSchemaContract(schema);
  if (contractErrors.length > 0) return contractErrors;
  return validateValueWithSchema(value, schema, path);
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
