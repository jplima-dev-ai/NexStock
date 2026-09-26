import test from "node:test";
import assert from "node:assert/strict";
import { ReversalError, ReversalService } from "../../js/services/reversal-service.js";

class Provider {
  constructor({ quantity = 10, original = { id: "m1", workspaceId: "w1", productId: "p1", type: "IN", quantity: 4 } } = {}) {
    this.products = new Map([["p1", { id: "p1", workspaceId: "w1", currentQuantity: quantity, archivedAt: null }]]);
    this.movements = new Map([[original.id, original]]); this.audits = new Map();
  }
  async get(store, id) { return structuredClone(store === "products" ? this.products.get(id) ?? null : this.movements.get(id) ?? null); }
  async applyStockReversal({ workspaceId, productId, originalMovementId, expectedBeforeQuantity, afterQuantity, movement, audit }) {
    const original = this.movements.get(originalMovementId); const product = this.products.get(productId);
    if (!original || original.workspaceId !== workspaceId || !["IN", "OUT"].includes(original.type)) throw new RangeError("ineligible");
    if ([...this.movements.values()].some((item) => item.reversalOfMovementId === originalMovementId)) throw new RangeError("already reversed");
    if (!product || product.workspaceId !== workspaceId || product.currentQuantity !== expectedBeforeQuantity || afterQuantity < 0) throw new RangeError("invalid transaction");
    const updated = { ...product, currentQuantity: afterQuantity }; const stored = { ...movement }; const storedAudit = { ...audit, beforeData: product, afterData: updated };
    this.products.set(productId, updated); this.movements.set(stored.id, stored); this.audits.set(storedAudit.id, storedAudit); return { product: updated, movement: stored, audit: storedAudit };
  }
}
function service(provider) { let id = 0; return new ReversalService({ provider, idFactory: () => `id-${++id}`, now: () => "2026-09-27T03:00:00.000Z" }); }

test("reversal creates a compensating movement and linked audit without changing the original", async () => {
  const provider = new Provider(); const original = structuredClone(await provider.get("movements", "m1"));
  const result = await service(provider).reverse("w1", { movementId: "m1", confirmed: true });
  assert.equal(result.product.currentQuantity, 6); assert.equal(result.movement.type, "OUT"); assert.equal(result.movement.reversalOfMovementId, "m1");
  assert.equal(result.audit.action, "STOCK_MOVEMENT_REVERSED"); assert.equal(result.audit.metadata.originalMovementId, "m1"); assert.equal(result.audit.metadata.compensationMovementId, result.movement.id);
  assert.deepEqual(await provider.get("movements", "m1"), original);
});
test("requires confirmation and rejects manual adjustments, other workspaces, duplicate reversals and negative stock", async () => {
  await assert.rejects(service(new Provider()).reverse("w1", { movementId: "m1" }), (error) => error instanceof ReversalError && error.code === "confirmation-required");
  await assert.rejects(service(new Provider({ original: { id: "m1", workspaceId: "w1", productId: "p1", type: "ADJUSTMENT", quantity: 4 } })).reverse("w1", { movementId: "m1", confirmed: true }), /reversed/u);
  await assert.rejects(service(new Provider()).reverse("w2", { movementId: "m1", confirmed: true }), (error) => error.code === "not-found");
  const provider = new Provider({ quantity: 2 }); const reversal = service(provider); await assert.rejects(reversal.reverse("w1", { movementId: "m1", confirmed: true }), (error) => error.code === "negative-stock");
  const valid = new Provider(); const duplicate = service(valid); await duplicate.reverse("w1", { movementId: "m1", confirmed: true }); await assert.rejects(duplicate.reverse("w1", { movementId: "m1", confirmed: true }), /already reversed/u);
});
