import assert from "node:assert/strict";
import test from "node:test";

import { parseJson } from "../src/lib/json.js";

test("parseJson rejects duplicate keys after escape decoding", () => {
  assert.throws(
    () => parseJson('{"plain":1,"\\u0070lain":2}', { path: "artifact.json" }),
    /artifact\.json: duplicate JSON key "plain" at \$/
  );
});

test("parseJson scopes duplicate keys to their owning object", () => {
  assert.deepEqual(parseJson('{"left":{"id":1},"right":{"id":2}}'), {
    left: { id: 1 },
    right: { id: 2 }
  });

  assert.throws(
    () => parseJson('{"items":[{"id":1,"id":2}]}', { path: "artifact.json" }),
    /artifact\.json: duplicate JSON key "id" at \$\.items\[0\]/
  );
});
