import test from "node:test";
import assert from "node:assert/strict";
import { assertComponentId } from "../../js/utils/component-id.js";

test("IDs de componentes aceitam valores previsíveis", () => {
  assert.equal(assertComponentId("product-name"), "product-name");
  assert.equal(assertComponentId("field_2"), "field_2");
});

test("IDs inseguros ou ambíguos são rejeitados", () => {
  for (const value of ["", "2field", "field name", "field:name", null]) {
    assert.throws(() => assertComponentId(value), TypeError);
  }
});
