import test from "node:test";
import assert from "node:assert/strict";
import { getIconDefinition } from "../../js/components/icon.js";

test("iconografia usa catálogo controlado e rejeita nomes desconhecidos", () => {
  assert.ok(getIconDefinition("check").length > 0);
  assert.ok(getIconDefinition("warning").length > 0);
  assert.ok(getIconDefinition("moon").length > 0);
  assert.throws(() => getIconDefinition("emoji-random"), RangeError);
});
