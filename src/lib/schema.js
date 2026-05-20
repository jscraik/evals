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
  }
};

function addError(errors, path, message) {
  errors.push(path + ": " + message);
}

function isType(value, type) {
  if (type === "array") return Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "null") return value === null;
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  return typeof value === type;
}

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

export function schemaCheck(schemaKey, dataPath) {
  const target = schemaTargets[schemaKey];
  const errors = validateDocument(target.schema, dataPath);
  return {
    label: target.label,
    schema_path: rel(target.schema),
    data_path: rel(dataPath),
    status: errors.length === 0 ? "pass" : "fail",
    errors
  };
}
