import test from "node:test";
import assert from "node:assert/strict";
import { buildConsequencePreview, calculateMovementImpact, InsufficientStockError, MovementService } from "../../js/services/movement-service.js";

class MovementTestProvider {
  constructor() {
    this.stores = new Map(["products", "movements", "auditLogs"].map((name) => [name, new Map()]));
  }
  async get(store, key) { return structuredClone(this.stores.get(store).get(key) ?? null); }
  async getAll(store, { index, query } = {}) { return [...this.stores.get(store).values()].filter((item) => !index || item[index] === query).map((item) => structuredClone(item)); }
  async applyStockMovement({ workspaceId, productId, expectedBeforeQuantity, afterQuantity, movement, audit }) {
    const current = this.stores.get("products").get(productId);
    if (!current || current.workspaceId !== workspaceId || current.archivedAt) throw new RangeError("Product unavailable.");
    if (current.currentQuantity !== expectedBeforeQuantity) throw new Error("Stock conflict.");
    if (afterQuantity < 0) throw new RangeError("Negative stock.");
    const product = { ...current, currentQuantity: afterQuantity, updatedAt: movement.createdAt };
    const storedMovement = { ...movement, beforeQuantity: current.currentQuantity, afterQuantity };
    const storedAudit = { ...audit, beforeData: current, afterData: product };
    this.stores.get("products").set(productId, product);
    this.stores.get("movements").set(movement.id, storedMovement);
    this.stores.get("auditLogs").set(audit.id, storedAudit);
    return { product, movement: storedMovement, audit: storedAudit };
  }
}

function fixture(quantity = 10) {
  const provider = new MovementTestProvider();
  provider.stores.get("products").set("product-1", { id: "product-1", workspaceId: "workspace-1", name: "SSD", nexCode: "NX-SSD-0001", currentQuantity: quantity, minimumStock: 5, archivedAt: null });
  let id = 0;
  return { provider, service: new MovementService({ provider, idFactory: () => `id-${id += 1}`, now: () => "2026-09-18T13:00:00.000Z" }) };
}

test("impact preview calculates entry, withdrawal, adjustment, and resulting status", () => {
  assert.deepEqual(calculateMovementImpact({ type: "IN", quantity: 3, currentQuantity: 10, minimumStock: 5 }), {
    type: "IN", quantity: 3, requestedQuantity: 3, beforeQuantity: 10, afterQuantity: 13, currentStatus: "healthy", resultingStatus: "healthy",
  });
  assert.equal(calculateMovementImpact({ type: "OUT", quantity: 5, currentQuantity: 10, minimumStock: 5 }).resultingStatus, "critical");
  const adjustment = calculateMovementImpact({ type: "ADJUSTMENT", quantity: 2, currentQuantity: 10, minimumStock: 5 });
  assert.equal(adjustment.quantity, 8);
  assert.equal(adjustment.afterQuantity, 2);
});

test("Consequence Preview mostra antes e depois, inclusive previsão ou insuficiência", () => {
  const product = { id: "product-1", currentQuantity: 10, minimumStock: 5 };
  const movements = [{ id: "out-1", productId: product.id, type: "OUT", quantity: 30, createdAt: "2026-09-18T12:00:00.000Z" }];
  const preview = buildConsequencePreview({ product, movements, input: { type: "OUT", quantity: 6 }, now: "2026-09-19T12:00:00.000Z" });
  assert.equal(preview.persisted, false);
  assert.deepEqual(preview.before, { quantity: 10, status: "healthy", forecast: { available: true, daysRemaining: 10, dataSufficiency: "limited" } });
  assert.deepEqual(preview.after, { quantity: 4, status: "critical", forecast: { available: true, daysRemaining: 4, dataSufficiency: "limited" } });
  assert.deepEqual(preview.impact, { quantityDelta: -6, statusChanged: true });
  assert.equal(product.currentQuantity, 10);
});

test("invalid withdrawal creates no movement, product update, or audit", async () => {
  const { provider, service } = fixture(4);
  await assert.rejects(service.preview("workspace-1", { productId: "product-1", type: "OUT", quantity: 5 }), InsufficientStockError);
  assert.equal(provider.stores.get("products").get("product-1").currentQuantity, 4);
  assert.equal(provider.stores.get("movements").size, 0);
  assert.equal(provider.stores.get("auditLogs").size, 0);
});

test("confirmed movement updates product and writes movement plus audit atomically", async () => {
  const { provider, service } = fixture();
  const input = { productId: "product-1", type: "OUT", quantity: 4, reason: "Uso na oficina", notes: "OS 42" };
  const preview = await service.preview("workspace-1", input);
  const result = await service.commit("workspace-1", input, preview);
  assert.equal(result.product.currentQuantity, 6);
  assert.equal(result.movement.beforeQuantity, 10);
  assert.equal(result.movement.afterQuantity, 6);
  assert.equal(result.audit.action, "STOCK_MOVEMENT_APPLIED");
  assert.equal(result.audit.metadata.movementId, result.movement.id);
  assert.equal(provider.stores.get("movements").size, 1);
  assert.equal(provider.stores.get("auditLogs").size, 1);
});

test("stale preview is rejected before any partial write", async () => {
  const { provider, service } = fixture();
  const input = { productId: "product-1", type: "OUT", quantity: 2, reason: "Separação" };
  const preview = await service.preview("workspace-1", input);
  provider.stores.get("products").get("product-1").currentQuantity = 9;
  await assert.rejects(service.commit("workspace-1", input, preview), /conflict/i);
  assert.equal(provider.stores.get("products").get("product-1").currentQuantity, 9);
  assert.equal(provider.stores.get("movements").size, 0);
  assert.equal(provider.stores.get("auditLogs").size, 0);
});

test("history remains isolated by workspace and product", async () => {
  const { provider, service } = fixture();
  provider.stores.get("movements").set("foreign", { id: "foreign", workspaceId: "workspace-2", productId: "product-1", createdAt: "2026-09-19T00:00:00.000Z" });
  provider.stores.get("movements").set("own", { id: "own", workspaceId: "workspace-1", productId: "product-1", createdAt: "2026-09-18T00:00:00.000Z" });
  assert.deepEqual((await service.listByProduct("workspace-1", "product-1")).map(({ id }) => id), ["own"]);
  assert.deepEqual((await service.listByWorkspace("workspace-1")).map(({ id }) => id), ["own"]);
});
