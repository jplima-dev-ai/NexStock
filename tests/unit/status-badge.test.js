import test from "node:test";
import assert from "node:assert/strict";
import { getStatusMeta } from "../../js/components/status-badge.js";

test("status de estoque possui texto além da cor", () => {
  assert.equal(getStatusMeta("out").label, "Sem estoque");
  assert.equal(getStatusMeta("critical").label, "Crítico");
  assert.equal(getStatusMeta("attention").label, "Atenção");
  assert.equal(getStatusMeta("healthy").label, "Saudável");
  assert.equal(getStatusMeta("archived").label, "Arquivado");
});

test("status desconhecido é rejeitado", () => {
  assert.throws(() => getStatusMeta("excellent"), RangeError);
});
