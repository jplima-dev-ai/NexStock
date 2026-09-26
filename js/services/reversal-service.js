import { MOVEMENT_TYPES } from "./movement-service.js";

const ELIGIBLE_TYPES = new Set([MOVEMENT_TYPES.IN, MOVEMENT_TYPES.OUT]);

export class ReversalError extends Error {
  constructor(message, code) { super(message); this.name = "ReversalError"; this.code = code; }
}

function assertConfirmed(value) {
  if (value !== true) throw new ReversalError("Explicit confirmation is required.", "confirmation-required");
}

function compensationType(type) {
  if (type === MOVEMENT_TYPES.IN) return MOVEMENT_TYPES.OUT;
  if (type === MOVEMENT_TYPES.OUT) return MOVEMENT_TYPES.IN;
  throw new ReversalError("Only stock entries and withdrawals can be reversed.", "ineligible-type");
}

export class ReversalService {
  constructor({ provider, idFactory = () => globalThis.crypto.randomUUID(), now = () => new Date().toISOString() }) {
    if (!provider) throw new TypeError("ReversalService requires a DataProvider.");
    this.provider = provider; this.idFactory = idFactory; this.now = now;
  }

  async reverse(workspaceId, { movementId, confirmed } = {}) {
    if (!workspaceId || !movementId) throw new TypeError("Workspace and movement IDs are required.");
    assertConfirmed(confirmed);
    const original = await this.provider.get("movements", movementId);
    if (!original || original.workspaceId !== workspaceId) throw new ReversalError("Movement not found in this workspace.", "not-found");
    const type = compensationType(original.type);
    const product = await this.provider.get("products", original.productId);
    if (!product || product.workspaceId !== workspaceId || product.archivedAt) throw new ReversalError("Active product not found in this workspace.", "product-not-found");
    const beforeQuantity = Number(product.currentQuantity);
    const quantity = Number(original.quantity);
    const afterQuantity = type === MOVEMENT_TYPES.IN ? beforeQuantity + quantity : beforeQuantity - quantity;
    if (!Number.isFinite(quantity) || quantity <= 0 || afterQuantity < 0) throw new ReversalError("The compensating movement would make stock negative.", "negative-stock");
    const timestamp = this.now();
    const movement = { id: this.idFactory(), workspaceId, productId: original.productId, productUnitId: null, batchId: null, type, quantity, beforeQuantity, afterQuantity, reason: "REVERSAL", notes: "", reversalOfMovementId: original.id, createdAt: timestamp };
    const audit = { id: this.idFactory(), workspaceId, entityType: "product", entityId: original.productId, action: "STOCK_MOVEMENT_REVERSED", beforeData: null, afterData: null, metadata: { originalMovementId: original.id, compensationMovementId: movement.id, originalType: original.type, compensationType: type }, createdAt: timestamp };
    return this.provider.applyStockReversal({ workspaceId, productId: original.productId, originalMovementId: original.id, expectedBeforeQuantity: beforeQuantity, afterQuantity, movement, audit });
  }
}
