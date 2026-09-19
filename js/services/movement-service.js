import { getInventoryStatus } from "./product-service.js";

export const MOVEMENT_TYPES = Object.freeze({
  IN: "IN",
  OUT: "OUT",
  ADJUSTMENT: "ADJUSTMENT",
});

const TYPE_SET = new Set(Object.values(MOVEMENT_TYPES));

export class InsufficientStockError extends RangeError {
  constructor(message = "The withdrawal would make stock negative.") {
    super(message);
    this.name = "InsufficientStockError";
  }
}

function requiredText(value, field, maxLength) {
  const normalized = String(value ?? "").trim();
  if (!normalized || normalized.length > maxLength) throw new TypeError(`${field} is invalid.`);
  return normalized;
}

function finiteNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${field} must be a finite number.`);
  return number;
}

export function calculateMovementImpact({ type, quantity, currentQuantity, minimumStock = 0 }) {
  if (!TYPE_SET.has(type)) throw new RangeError("Movement type is invalid.");
  const beforeQuantity = finiteNumber(currentQuantity, "currentQuantity");
  const requestedQuantity = finiteNumber(quantity, "quantity");
  if (beforeQuantity < 0) throw new RangeError("Current stock cannot be negative.");

  let afterQuantity;
  let movementQuantity;
  if (type === MOVEMENT_TYPES.ADJUSTMENT) {
    if (requestedQuantity < 0) throw new RangeError("Adjusted stock cannot be negative.");
    if (requestedQuantity === beforeQuantity) throw new RangeError("Adjustment must change the stock.");
    afterQuantity = requestedQuantity;
    movementQuantity = Math.abs(afterQuantity - beforeQuantity);
  } else {
    if (requestedQuantity <= 0) throw new RangeError("Movement quantity must be positive.");
    movementQuantity = requestedQuantity;
    afterQuantity = type === MOVEMENT_TYPES.IN
      ? beforeQuantity + requestedQuantity
      : beforeQuantity - requestedQuantity;
  }
  if (afterQuantity < 0) throw new InsufficientStockError();

  return Object.freeze({
    type,
    quantity: movementQuantity,
    requestedQuantity,
    beforeQuantity,
    afterQuantity,
    currentStatus: getInventoryStatus(beforeQuantity, minimumStock),
    resultingStatus: getInventoryStatus(afterQuantity, minimumStock),
  });
}

export class MovementService {
  constructor({ provider, idFactory = () => globalThis.crypto.randomUUID(), now = () => new Date().toISOString() }) {
    if (!provider) throw new TypeError("MovementService requires a DataProvider.");
    this.provider = provider;
    this.idFactory = idFactory;
    this.now = now;
  }

  async #activeProduct(workspaceId, productId) {
    if (!workspaceId || !productId) throw new TypeError("Workspace and product IDs are required.");
    const product = await this.provider.get("products", productId);
    if (!product || product.workspaceId !== workspaceId || product.archivedAt) {
      throw new RangeError("Active product not found in this workspace.");
    }
    return product;
  }

  async preview(workspaceId, input) {
    const product = await this.#activeProduct(workspaceId, input.productId);
    const impact = calculateMovementImpact({
      type: input.type,
      quantity: input.quantity,
      currentQuantity: product.currentQuantity,
      minimumStock: product.minimumStock,
    });
    return Object.freeze({ ...impact, workspaceId, productId: product.id, productName: product.name, nexCode: product.nexCode });
  }

  async commit(workspaceId, input, preview) {
    if (!preview || preview.workspaceId !== workspaceId || preview.productId !== input.productId) {
      throw new TypeError("A matching impact preview is required.");
    }
    const recalculated = calculateMovementImpact({
      type: input.type,
      quantity: input.quantity,
      currentQuantity: preview.beforeQuantity,
      minimumStock: 0,
    });
    if (recalculated.afterQuantity !== preview.afterQuantity || recalculated.quantity !== preview.quantity) {
      throw new TypeError("Movement data changed after the impact preview.");
    }

    const timestamp = this.now();
    const reason = requiredText(input.reason, "reason", 160);
    const notes = String(input.notes ?? "").trim().slice(0, 1000);
    const movement = {
      id: this.idFactory(), workspaceId, productId: input.productId,
      productUnitId: null, batchId: null, type: input.type,
      quantity: preview.quantity, beforeQuantity: preview.beforeQuantity,
      afterQuantity: preview.afterQuantity, reason, notes, createdAt: timestamp,
    };
    const audit = {
      id: this.idFactory(), workspaceId, entityType: "product", entityId: input.productId,
      action: "STOCK_MOVEMENT_APPLIED", beforeData: null, afterData: null,
      metadata: { movementId: movement.id, type: movement.type, reason }, createdAt: timestamp,
    };
    return this.provider.applyStockMovement({
      workspaceId,
      productId: input.productId,
      expectedBeforeQuantity: preview.beforeQuantity,
      afterQuantity: preview.afterQuantity,
      movement,
      audit,
    });
  }

  async listByWorkspace(workspaceId) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    const movements = await this.provider.getAll("movements", { index: "workspaceId", query: workspaceId });
    return movements.sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  }

  async listByProduct(workspaceId, productId) {
    const movements = await this.provider.getAll("movements", { index: "productId", query: productId });
    return movements.filter((movement) => movement.workspaceId === workspaceId)
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  }
}
