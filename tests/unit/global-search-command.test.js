import test from "node:test";
import assert from "node:assert/strict";
import { parseNexQuery, parseProductCommand, GlobalSearchService } from "../../js/services/global-search-service.js";

test("NexQuery converte consultas controladas em filtros explícitos", () => {
  assert.deepEqual(parseNexQuery("produtos críticos"), { id: "critical", filters: { status: "critical" } });
  assert.deepEqual(parseNexQuery("sem estoque"), { id: "out", filters: { status: "out" } });
  assert.deepEqual(parseNexQuery("productos archivados"), { id: "archived", filters: { archived: "archived" } });
  assert.deepEqual(parseNexQuery("serialized products"), { id: "serial", filters: { module: "serial" } });
  assert.deepEqual(parseNexQuery("buscar Quantum SSD"), { id: "search", filters: { query: "quantum ssd" } });
  assert.equal(parseNexQuery("qual produto devo comprar"), null);
});

test("Command Center reconhece operações de produto em PT, EN e ES", () => {
  assert.deepEqual(parseProductCommand("entrada Quantum"), { operation: "entry", productQuery: "quantum" });
  assert.deepEqual(parseProductCommand("output Quantum SSD"), { operation: "output", productQuery: "quantum ssd" });
  assert.deepEqual(parseProductCommand("abrir Quantum"), { operation: "open", productQuery: "quantum" });
  assert.deepEqual(parseProductCommand("simular Quantum"), { operation: "scenario", productQuery: "quantum" });
  assert.deepEqual(parseProductCommand("salida Quantum"), { operation: "output", productQuery: "quantum" });
});

test("Command Center mantém o produto e a operação selecionada", async () => {
  const service = new GlobalSearchService({ productService: { async search(workspaceId, filters) {
    assert.equal(workspaceId, "workspace-1");
    assert.deepEqual(filters, { query: "quantum", archived: "active" });
    return [{ id: "quantum-id", name: "Quantum SSD", nexCode: "NX-TEC-0001", categoryName: "Tecnologia" }];
  } } });
  const [result] = await service.searchProducts("workspace-1", "entrada Quantum");
  assert.equal(result.productId, "quantum-id");
  assert.equal(result.operation, "entry");
});
