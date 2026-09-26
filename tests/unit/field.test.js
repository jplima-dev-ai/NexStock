import test from "node:test";
import assert from "node:assert/strict";
import { buildFieldIds } from "../../js/components/field.js";

test("Field gera relações estáveis para ajuda e erro", () => {
  assert.deepEqual(buildFieldIds("minimum-stock"), {
    control: "minimum-stock",
    help: "minimum-stock-help",
    example: "minimum-stock-example",
    error: "minimum-stock-error",
  });
});
