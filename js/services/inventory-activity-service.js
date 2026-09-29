import { indexedRecords } from "./performance-service.js";

const DAY_MS = 86_400_000;

function dateValue(value) {
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Indica estoque positivo sem saída nos últimos trinta dias, sem persistir estado. */
export function isStoppedProduct(product, movements, now = new Date()) {
  if (Number(product.currentQuantity) <= 0) return false;
  const cutoff = now.getTime() - (30 * DAY_MS);
  if (dateValue(product.createdAt) > cutoff) return false;
  const related = movements instanceof Map ? indexedRecords(movements, product.id) : movements;
  return !related.some((movement) => (
    movement.productId === product.id
    && movement.type === "OUT"
    && dateValue(movement.createdAt) >= cutoff
  ));
}
