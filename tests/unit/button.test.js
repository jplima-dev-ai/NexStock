import test from "node:test";
import assert from "node:assert/strict";
import { getButtonClassName } from "../../js/components/button.js";

test("botões usam variantes controladas", () => {
  assert.equal(getButtonClassName("primary"), "ns-button ns-button--primary");
  assert.equal(getButtonClassName("quiet", true), "ns-button ns-button--quiet ns-button--icon");
  assert.throws(() => getButtonClassName("invisible"), RangeError);
});
