import test from "node:test";
import assert from "node:assert/strict";
import { buildGuard, calculateKitAvailability, expiryStatus, findSmartSubstitutes, ModuleService } from "../../js/services/module-service.js";

class Provider {
  constructor(modules = []) {
    this.stores = new Map(["settings", "products", "productUnits", "batches", "auditLogs", "productRelations", "kits", "kitItems"].map((name) => [name, new Map()]));
    this.putValue("settings", { id: "profile-settings-w1", workspaceId: "w1", value: { modules } });
    this.putValue("products", { id: "p1", workspaceId: "w1", name: "One", currentQuantity: 10, archivedAt: null });
    this.putValue("products", { id: "p2", workspaceId: "w1", name: "Two", currentQuantity: 4, archivedAt: null });
  }
  putValue(store, value) { this.stores.get(store).set(value.id, structuredClone(value)); }
  async get(store, id) { return structuredClone(this.stores.get(store).get(id)); }
  async getAll(store, { index, query } = {}) { return [...this.stores.get(store).values()].filter((item) => !index || item[index] === query).map((item) => structuredClone(item)); }
  async put(store, value) { this.putValue(store, value); }
  async bulkPut(groups) { for (const [store, values] of Object.entries(groups)) for (const value of values) this.putValue(store, value); }
}

function createService(modules) { let id = 0; const provider = new Provider(modules); return { provider, service: new ModuleService({ provider, idFactory: () => `id-${++id}`, now: () => "2026-09-19T12:00:00.000Z" }) }; }

test("NexExpiry usa aviso de trinta dias", () => {
  const now = new Date("2026-09-19T00:00:00.000Z");
  assert.equal(expiryStatus("2026-09-18", now), "expired");
  assert.equal(expiryStatus("2026-10-10", now), "near");
  assert.equal(expiryStatus("2026-11-20", now), "normal");
});

test("NexKit calcula parte inteira e Missing Piece", () => {
  const result = calculateKitAvailability([{ productId: "p1", quantityRequired: 3 }, { productId: "p2", quantityRequired: 2 }], [{ id: "p1", currentQuantity: 10 }, { id: "p2", currentQuantity: 4 }]);
  assert.deepEqual(result, { quantity: 2, limitingProductId: "p2" });
});

test("BuildGuard não inventa compatibilidade e aceita incompatibilidade explícita", () => {
  assert.equal(buildGuard("p1", "p2", []), "unknown");
  assert.equal(buildGuard("p1", "p2", [{ sourceProductId: "p1", targetProductId: "p2", relationType: "compatible_with" }]), "compatible");
  assert.equal(buildGuard("p1", "p2", [], [["p1", "p2"]]), "incompatible");
});

test("Smart Substitute prioriza replaces", () => {
  const products = [{ id: "p2", name: "Two" }, { id: "p3", name: "Three" }];
  const relations = [{ sourceProductId: "p1", targetProductId: "p3", relationType: "compatible_with" }, { sourceProductId: "p1", targetProductId: "p2", relationType: "replaces" }];
  assert.deepEqual(findSmartSubstitutes("p1", relations, products).map(({ product }) => product.id), ["p2", "p3"]);
});

test("serial duplicado e lote duplicado são bloqueados", async () => {
  const { service } = createService(["serial", "expiry"]);
  await service.createSerial("w1", "p1", { serialNumber: "ABC" });
  await assert.rejects(() => service.createSerial("w1", "p2", { serialNumber: "ABC" }), /already exists/);
  await service.createBatch("w1", "p1", { batchNumber: "L1", quantity: 2, expiryDate: "2027-01-01" });
  await assert.rejects(() => service.createBatch("w1", "p1", { batchNumber: "L1", quantity: 2, expiryDate: "2027-01-01" }), /already exists/);
});

test("módulo desligado recusa somente sua operação e preserva o Core", async () => {
  const { provider, service } = createService([]);
  await assert.rejects(() => service.createSerial("w1", "p1", { serialNumber: "ABC" }), /disabled/);
  assert.equal((await provider.get("products", "p1")).name, "One");
});
