import { test } from "node:test";
import assert from "node:assert/strict";
import { registry } from "../src/registry.ts";
import { validateProperties } from "../src/validate.ts";

test("registry lists the five MVP component types", () => {
  const keys = registry.list().map((c) => c.key).sort();
  assert.deepEqual(keys, ["accordion", "graphic", "mcq", "media", "text"]);
});

test("mcq defaults validate", () => {
  const result = validateProperties("mcq", registry.getDefaults("mcq"));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("mcq rejects _selectable below minimum", () => {
  const props = { ...registry.getDefaults("mcq"), _selectable: 0 };
  const result = validateProperties("mcq", props);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path.includes("_selectable")));
});

test("mcq strips unknown properties (additionalProperties:false)", () => {
  const props = { ...registry.getDefaults("mcq"), bogusField: "x" };
  const result = validateProperties("mcq", props);
  assert.equal(result.valid, true);
  assert.ok(!("bogusField" in result.data));
});
