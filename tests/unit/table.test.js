import test from "node:test";
import assert from "node:assert/strict";
import { normalizeColumns, sortRows } from "../../js/components/table.js";

test("tabela exige colunas nomeadas e chaves únicas", () => {
  assert.equal(normalizeColumns([{ key: "name", label: "Nome" }]).length, 1);
  assert.throws(() => normalizeColumns([]), TypeError);
  assert.throws(
    () => normalizeColumns([{ key: "name", label: "Nome" }, { key: "name", label: "Produto" }]),
    TypeError,
  );
});

test("ordenação de tabela é estável para texto e números sem alterar a origem", () => {
  const rows = [{ name: "Produto 10", quantity: 10 }, { name: "Produto 2", quantity: 2 }];
  assert.deepEqual(sortRows(rows, { key: "name" }).map(({ name }) => name), ["Produto 2", "Produto 10"]);
  assert.deepEqual(sortRows(rows, { key: "quantity" }, "descending").map(({ quantity }) => quantity), [10, 2]);
  assert.equal(rows[0].name, "Produto 10");
});
