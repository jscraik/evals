import assert from "node:assert/strict";
import test from "node:test";

import { supportedSchemaKeywords, validateWithSchema } from "../src/lib/schema.js";

test("schema validator exposes the supported local keyword contract", () => {
  for (const keyword of ["$schema", "$id", "type", "properties", "required", "additionalProperties", "format"]) {
    assert.equal(supportedSchemaKeywords.has(keyword), true, keyword + " should be declared as supported");
  }
});

test("schema validator rejects unsupported keywords before validating data", () => {
  const errors = validateWithSchema(5, {
    type: "number",
    minimum: 10
  });

  assert.match(errors.join("\n"), /\$schema\.minimum: unsupported JSON Schema keyword/);
});

test("schema validator rejects unsupported nested keywords", () => {
  const errors = validateWithSchema(
    { count: 3 },
    {
      type: "object",
      properties: {
        count: {
          type: "integer",
          minimum: 5
        }
      }
    }
  );

  assert.match(errors.join("\n"), /\$schema\.properties\.count\.minimum: unsupported JSON Schema keyword/);
});

test("schema validator rejects unsupported formats", () => {
  const errors = validateWithSchema("jamie@example.com", {
    type: "string",
    format: "email"
  });

  assert.match(errors.join("\n"), /\$schema\.format: unsupported format "email"/);
});

test("schema validator rejects unsupported type tokens", () => {
  const errors = validateWithSchema("2026-05-20", {
    type: "date"
  });

  assert.match(errors.join("\n"), /\$schema\.type: unsupported type "date"/);
});

test("schema validator rejects unsupported type tokens inside unions", () => {
  const errors = validateWithSchema(null, {
    type: ["null", "date"]
  });

  assert.match(errors.join("\n"), /\$schema\.type: unsupported type "date"/);
});

test("schema validator rejects malformed schema objects", () => {
  assert.match(validateWithSchema("anything", null).join("\n"), /\$schema: schema must be a JSON object/);
  assert.match(
    validateWithSchema(
      { name: "Jamie" },
      {
        type: "object",
        properties: {
          name: "string"
        }
      }
    ).join("\n"),
    /\$schema\.properties\.name: property schema must be a JSON object/
  );
  assert.match(validateWithSchema(["one"], { type: "array", items: "string" }).join("\n"), /\$schema\.items: items schema must be a JSON object/);
});

test("object constraints apply when object is one member of a type union", () => {
  const errors = validateWithSchema(
    { extra: true },
    {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["name"],
      properties: {
        name: { type: "string" }
      }
    }
  );

  assert.match(errors.join("\n"), /\$\.name: missing required property/);
  assert.match(errors.join("\n"), /\$\.extra: additional property is not allowed/);
  assert.deepEqual(validateWithSchema(null, { type: ["object", "null"], required: ["name"] }), []);
});

test("date-time validation requires an explicit timestamp", () => {
  assert.match(validateWithSchema("2026-05-20", { type: "string", format: "date-time" }).join("\n"), /must be a date-time string/);
  assert.deepEqual(validateWithSchema("2026-05-20T19:24:00Z", { type: "string", format: "date-time" }), []);
});
