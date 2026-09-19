import test from "node:test";
import assert from "node:assert/strict";
import { normalizeColumns } from "../../js/components/table.js";

test("tabela exige colunas nomeadas e chaves únicas", () => {
  assert.equal(normalizeColumns([{ key: "name", label: "Nome" }]).length, 1);
  assert.throws(() => normalizeColumns([]), TypeError);
  assert.throws(
    () => normalizeColumns([{ key: "name", label: "Nome" }, { key: "name", label: "Produto" }]),
    TypeError,
  );
});
