import test from "node:test";
import assert from "node:assert/strict";
import { ExportService, escapeCsvCell, normalizeExportRequest, serializeExportCsv, serializeExportJson } from "../../js/services/export-service.js";

class MemoryProvider {
  constructor() {
    this.stores = new Map(["workspaces", "products", "categories", "suppliers", "movements", "batches", "auditLogs"].map((name) => [name, new Map()]));
  }

  seed(store, records) {
    for (const record of records) this.stores.get(store).set(record.id, structuredClone(record));
  }

  async get(store, id) {
    return structuredClone(this.stores.get(store).get(id) ?? null);
  }

  async getAll(store, { index, query } = {}) {
    const records = [...this.stores.get(store).values()];
    return structuredClone(index ? records.filter((record) => record[index] === query) : records);
  }
}

function fixture() {
  const provider = new MemoryProvider();
  provider.seed("workspaces", [
    { id: "w1", name: "Loja Centro", profileKey: "technology", currency: "BRL", timezone: "UTC", theme: "light", experienceMode: "guided", createdAt: "2026-09-01T00:00:00.000Z", updatedAt: "2026-09-20T00:00:00.000Z" },
    { id: "w2", name: "Outro espaço", createdAt: "2026-09-01T00:00:00.000Z" },
  ]);
  provider.seed("categories", [{ id: "c1", workspaceId: "w1", name: "Tecnologia" }]);
  provider.seed("suppliers", [{ id: "s1", workspaceId: "w1", name: "Fornecedor Um" }]);
  provider.seed("products", [
    { id: "p1", workspaceId: "w1", nexCode: "NX-TEC-0001", name: "Teclado Aurora", categoryId: "c1", supplierId: "s1", trackingMode: "bulk", currentQuantity: 8, minimumStock: 2, purchasePrice: 10, salePrice: 20, location: "A1", description: "Mecânico", archivedAt: null, createdAt: "2026-09-10T12:00:00.000Z", updatedAt: "2026-09-10T12:00:00.000Z" },
    { id: "p2", workspaceId: "w1", nexCode: "NX-TEC-0002", name: "Mouse Antigo", trackingMode: "bulk", currentQuantity: 0, minimumStock: 1, archivedAt: "2026-09-18T00:00:00.000Z", createdAt: "2026-08-01T12:00:00.000Z", updatedAt: "2026-09-18T00:00:00.000Z" },
    { id: "foreign", workspaceId: "w2", nexCode: "NX-OUT-0001", name: "Produto secreto", createdAt: "2026-09-10T12:00:00.000Z" },
  ]);
  provider.seed("movements", [
    { id: "m1", workspaceId: "w1", productId: "p1", type: "IN", quantity: 3, beforeQuantity: 5, afterQuantity: 8, reason: "Compra", notes: "", createdAt: "2026-09-15T10:00:00.000Z" },
    { id: "m2", workspaceId: "w1", productId: "p1", type: "OUT", quantity: 1, beforeQuantity: 9, afterQuantity: 8, reason: "Venda", notes: "", createdAt: "2026-09-19T10:00:00.000Z" },
    { id: "m3", workspaceId: "w2", productId: "foreign", type: "OUT", quantity: 50, createdAt: "2026-09-19T10:00:00.000Z" },
  ]);
  provider.seed("batches", [{ id: "b1", workspaceId: "w1", productId: "p1", batchNumber: "L1", quantity: 2, manufactureDate: "2026-09-01", expiryDate: "2027-09-01", archivedAt: null, createdAt: "2026-09-12T00:00:00.000Z", updatedAt: "2026-09-12T00:00:00.000Z" }]);
  provider.seed("auditLogs", [{ id: "a1", workspaceId: "w1", entityType: "product", entityId: "p1", action: "PRODUCT_CREATED", beforeData: null, afterData: { name: "Teclado Aurora" }, metadata: {}, createdAt: "2026-09-10T12:00:00.000Z" }]);
  return { provider, service: new ExportService({ provider }) };
}

test("normaliza somente conjuntos, formatos e filtros permitidos", () => {
  assert.equal(normalizeExportRequest({}).dataset, "products");
  assert.equal(normalizeExportRequest({ format: "json", movementType: "OUT", recordState: "all" }).format, "json");
  assert.throws(() => normalizeExportRequest({ dataset: "settings" }), /not supported/u);
  assert.throws(() => normalizeExportRequest({ format: "xlsx" }), /not supported/u);
  assert.throws(() => normalizeExportRequest({ dateFrom: "2026-10-01", dateTo: "2026-09-01" }), /range/u);
  assert.throws(() => normalizeExportRequest({ dateFrom: "2026-02-31" }), /date filter/u);
});

test("produtos exportados respeitam workspace, busca, data e estado", async () => {
  const { service } = fixture();
  const active = await service.prepare("w1", { dataset: "products", query: "aurora", dateFrom: "2026-09-01", recordState: "active" });
  assert.equal(active.count, 1);
  assert.equal(active.rows[0].name, "Teclado Aurora");
  assert.equal(active.rows[0].category, "Tecnologia");
  assert.equal(active.rows.some(({ name }) => name === "Produto secreto"), false);
  const archived = await service.prepare("w1", { dataset: "products", recordState: "archived" });
  assert.deepEqual(archived.rows.map(({ name }) => name), ["Mouse Antigo"]);
});

test("movimentações respeitam produto, tipo e intervalo de datas", async () => {
  const { service } = fixture();
  const plan = await service.prepare("w1", { dataset: "movements", productId: "p1", movementType: "OUT", dateFrom: "2026-09-18", dateTo: "2026-09-20" });
  assert.equal(plan.count, 1);
  assert.equal(plan.rows[0].reason, "Venda");
  assert.equal(plan.rows[0].product, "Teclado Aurora");
});

test("CSV neutraliza fórmulas e JSON preserva metadados dos filtros", async () => {
  const { service, provider } = fixture();
  const product = provider.stores.get("products").get("p1");
  product.description = "=HYPERLINK(\"https://invalid\")";
  const plan = await service.prepare("w1", { dataset: "products", format: "csv", query: "aurora" });
  const csv = serializeExportCsv(plan, { name: "Nome" });
  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /"'=HYPERLINK/gu);
  assert.equal(escapeCsvCell("+1"), '"\'+1"');
  assert.equal(escapeCsvCell("\t=1+1"), '"\'\t=1+1"');
  const json = JSON.parse(serializeExportJson({ ...plan, format: "json" }));
  assert.equal(json.schema, "nexstock-export-v1");
  assert.equal(json.filters.query, "aurora");
  assert.equal(json.records.length, 1);
});

test("lotes, auditoria e workspace usam listas explícitas de campos", async () => {
  const { service } = fixture();
  const batches = await service.prepare("w1", { dataset: "batches", recordState: "active" });
  const audit = await service.prepare("w1", { dataset: "audit" });
  const workspace = await service.prepare("w1", { dataset: "workspace" });
  assert.deepEqual(Object.keys(batches.rows[0]), batches.columns);
  assert.deepEqual(Object.keys(audit.rows[0]), audit.columns);
  assert.deepEqual(Object.keys(workspace.rows[0]), workspace.columns);
  assert.equal(Object.hasOwn(workspace.rows[0], "id"), false);
  await assert.rejects(() => service.prepare("missing", { dataset: "products" }), /Workspace not found/u);
});
