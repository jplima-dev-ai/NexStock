import test from "node:test";
import assert from "node:assert/strict";
import { filterGlobalItems, GlobalSearchService } from "../../js/services/global-search-service.js";

test("busca global tolera caixa e acentos em ações", () => {
  const items = [{ label: "Registrar saída", keywords: "movimentação" }, { label: "Novo produto" }];
  assert.deepEqual(filterGlobalItems("SAIDA", items), [items[0]]);
  assert.deepEqual(filterGlobalItems("movimentacao", items), [items[0]]);
});

test("busca global limita produtos e produz destino seguro", async () => {
  const calls = [];
  const productService = { async search(workspaceId, filters) { calls.push([workspaceId, filters]); return Array.from({ length: 10 }, (_, index) => ({ id: `p ${index}`, name: `Produto ${index}`, nexCode: `NX-${index}`, categoryName: "Geral" })); } };
  const service = new GlobalSearchService({ productService });
  const results = await service.searchProducts("w1", "produto");
  assert.equal(results.length, 8);
  assert.equal(results[0].href, "#/products/p%200");
  assert.deepEqual(calls, [["w1", { query: "produto", archived: "active" }]]);
});

test("busca global não consulta produtos sem workspace ou termo", async () => {
  let called = false;
  const service = new GlobalSearchService({ productService: { async search() { called = true; return []; } } });
  assert.deepEqual(await service.searchProducts(null, "x"), []);
  assert.deepEqual(await service.searchProducts("w1", ""), []);
  assert.equal(called, false);
});
