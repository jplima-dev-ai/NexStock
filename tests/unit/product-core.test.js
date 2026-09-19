import test from "node:test";
import assert from "node:assert/strict";
import { buildNexCode, getInventoryStatus, normalizeSearchText, ProductService } from "../../js/services/product-service.js";

class ProductTestProvider {
  constructor() {
    this.stores = new Map(["products", "categories", "suppliers", "customFieldDefinitions", "settings", "auditLogs"].map((name) => [name, new Map()]));
  }
  async get(store, key) { return this.stores.get(store).get(key) ?? null; }
  async getAll(store, { index, query } = {}) { return [...this.stores.get(store).values()].filter((item) => !index || item[index] === query); }
  async bulkPut(collections) { for (const [store, records] of Object.entries(collections)) for (const record of records) this.stores.get(store).set(record.id ?? record.key, structuredClone(record)); }
  seed(store, record) { this.stores.get(store).set(record.id, record); }
}

function fixture() {
  const provider = new ProductTestProvider();
  provider.seed("categories", { id: "category-1", workspaceId: "workspace-1", name: "Áudio", code: "AUD" });
  provider.seed("suppliers", { id: "supplier-1", workspaceId: "workspace-1", name: "Órbita" });
  provider.seed("settings", { id: "profile-settings-workspace-1", workspaceId: "workspace-1", value: { prefix: "NX" } });
  provider.seed("customFieldDefinitions", { id: "field-1", workspaceId: "workspace-1", key: "model", searchable: true, enabled: true });
  let id = 0;
  return { provider, service: new ProductService({ provider, idFactory: () => `id-${id += 1}`, now: () => "2026-09-18T12:00:00.000Z" }) };
}

test("NexCode normaliza partes e preenche sequência", () => {
  assert.equal(buildNexCode({ prefix: "nx", categoryCode: "ssd", sequence: 42 }), "NX-SSD-0042");
  assert.throws(() => buildNexCode({ prefix: "", categoryCode: "ssd", sequence: 1 }), TypeError);
});

test("status segue os quatro limites do blueprint", () => {
  assert.equal(getInventoryStatus(0, 5), "out");
  assert.equal(getInventoryStatus(5, 5), "critical");
  assert.equal(getInventoryStatus(7, 5), "attention");
  assert.equal(getInventoryStatus(8, 5), "attention");
  assert.equal(getInventoryStatus(9, 5), "healthy");
});

test("criação gera NexCode sequencial e audit log atômico", async () => {
  const { provider, service } = fixture();
  const input = { name: "Fone", categoryId: "category-1", supplierId: "supplier-1", currentQuantity: 4, minimumStock: 2, customData: { model: "Órion" } };
  const first = await service.create("workspace-1", input);
  const second = await service.create("workspace-1", { ...input, name: "Caixa" });
  assert.equal(first.nexCode, "NX-AUD-0001");
  assert.equal(second.nexCode, "NX-AUD-0002");
  assert.equal(provider.stores.get("auditLogs").size, 2);
});

test("edição preserva quantidade e NexCode; arquivamento preserva registro", async () => {
  const { service } = fixture();
  const created = await service.create("workspace-1", { name: "Fone", categoryId: "category-1", currentQuantity: 9, minimumStock: 2 });
  const updated = await service.update("workspace-1", created.id, { ...created, name: "Fone Pro", currentQuantity: 999 });
  assert.equal(updated.currentQuantity, 9);
  assert.equal(updated.nexCode, created.nexCode);
  const archived = await service.archive("workspace-1", created.id);
  assert.ok(archived.archivedAt);
  assert.equal((await service.getById(created.id, "workspace-1")).name, "Fone Pro");
});

test("busca ignora caixa e acentos e filtros podem incluir arquivados", async () => {
  const { service } = fixture();
  const created = await service.create("workspace-1", { name: "Fone Ágil", categoryId: "category-1", supplierId: "supplier-1", currentQuantity: 1, minimumStock: 2, customData: { model: "Órion" } });
  assert.equal(normalizeSearchText("ÁGIL"), "agil");
  assert.equal((await service.search("workspace-1", { query: "orion", archived: "active" })).length, 1);
  await service.archive("workspace-1", created.id);
  assert.equal((await service.search("workspace-1", { archived: "active" })).length, 0);
  assert.equal((await service.search("workspace-1", { archived: "archived" })).length, 1);
});

test("integridade rejeita estoque negativo e relações de outro workspace", async () => {
  const { provider, service } = fixture();
  await assert.rejects(service.create("workspace-1", { name: "Inválido", currentQuantity: -1 }), RangeError);
  provider.seed("suppliers", { id: "foreign", workspaceId: "workspace-2", name: "Outro" });
  await assert.rejects(service.create("workspace-1", { name: "Inválido", supplierId: "foreign" }), RangeError);
});
