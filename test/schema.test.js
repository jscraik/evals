import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { supportedSchemaKeywords, validateWithSchema } from "../src/lib/schema.js";

const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)));

test("schema validator exposes the supported local keyword contract", () => {
  for (const keyword of ["$schema", "$id", "type", "properties", "required", "additionalProperties", "format", "minimum"]) {
    assert.equal(supportedSchemaKeywords.has(keyword), true, keyword + " should be declared as supported");
  }
});

test("schema validator rejects unsupported keywords before validating data", () => {
  const errors = validateWithSchema(5, {
    type: "number",
    maximum: 10
  });

  assert.match(errors.join("\n"), /\$schema\.maximum: unsupported JSON Schema keyword/);
});

test("schema validator rejects unsupported nested keywords", () => {
  const errors = validateWithSchema(
    { count: 3 },
    {
      type: "object",
      properties: {
        count: {
          type: "integer",
          maximum: 5
        }
      }
    }
  );

  assert.match(errors.join("\n"), /\$schema\.properties\.count\.maximum: unsupported JSON Schema keyword/);
});

test("schema validator enforces numeric minimum bounds", () => {
  assert.match(validateWithSchema(-1, { type: "integer", minimum: 0 }).join("\n"), /must be >= 0/);
  assert.deepEqual(validateWithSchema(0, { type: "integer", minimum: 0 }), []);
  assert.deepEqual(validateWithSchema(null, { type: ["integer", "null"], minimum: 0 }), []);
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
  assert.deepEqual(validateWithSchema("2026-05-20t19:24:00z", { type: "string", format: "date-time" }), []);
});

test("runtime-state embedded evidence packet schema mirrors the standalone packet schema", () => {
  const stateSchema = JSON.parse(readFileSync(join(sourceRoot, "schemas", "runtime-state.schema.json"), "utf8"));
  const packetSchema = JSON.parse(readFileSync(join(sourceRoot, "schemas", "runtime-evidence-packet.schema.json"), "utf8"));
  assert.deepEqual(stateSchema.properties.evidence_packet.required, packetSchema.required);
  assert.deepEqual(stateSchema.properties.evidence_packet.properties, packetSchema.properties);
});
