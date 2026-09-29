import test from "node:test";
import assert from "node:assert/strict";
import { isStoppedProduct } from "../../js/services/inventory-activity-service.js";
import { indexRecordsBy } from "../../js/services/performance-service.js";

const NOW = new Date("2026-09-19T12:00:00.000Z");
const product = (extra = {}) => ({ id: "product-1", currentQuantity: 10, createdAt: "2026-07-01T12:00:00.000Z", ...extra });

test("atividade de estoque mantém a regra compartilhada independente do Dashboard", () => {
  assert.equal(isStoppedProduct(product(), [], NOW), true);
  assert.equal(isStoppedProduct(product(), [{ productId: "product-1", type: "OUT", createdAt: "2026-09-10T12:00:00.000Z" }], NOW), false);
  assert.equal(isStoppedProduct(product({ currentQuantity: 0 }), [], NOW), false);
});

test("atividade de estoque aceita o índice efêmero usado pelos serviços", () => {
  const index = indexRecordsBy([{ productId: "product-1", type: "OUT", createdAt: "2026-08-01T12:00:00.000Z" }]);
  assert.equal(isStoppedProduct(product(), index, NOW), true);
});
