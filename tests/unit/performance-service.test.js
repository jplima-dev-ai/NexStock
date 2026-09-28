import test from "node:test";
import assert from "node:assert/strict";
import { indexRecordsBy, indexedRecords } from "../../js/services/performance-service.js";
import { buildDashboardSnapshot } from "../../js/services/dashboard-service.js";

test("índice de performance agrupa sem alterar registros e preserva ordem", () => {
  const records = [
    { id: "m-1", productId: "p-1" },
    { id: "m-2", productId: "p-2" },
    { id: "m-3", productId: "p-1" },
  ];
  const index = indexRecordsBy(records);
  assert.deepEqual(indexedRecords(index, "p-1").map(({ id }) => id), ["m-1", "m-3"]);
  assert.equal(indexedRecords(index, "missing").length, 0);
  assert.deepEqual(records.map(({ id }) => id), ["m-1", "m-2", "m-3"]);
});

test("snapshot mantém métricas e sinais corretos com movimentações indexadas", () => {
  const now = new Date("2026-09-28T12:00:00.000Z");
  const products = Array.from({ length: 40 }, (_, index) => ({
    id: `p-${index}`, name: `Produto ${index}`, currentQuantity: 12, minimumStock: 4,
    createdAt: "2026-08-01T12:00:00.000Z", archivedAt: null,
  }));
  const movements = products.flatMap((product, index) => Array.from({ length: 5 }, (_, movement) => ({
    id: `${product.id}-${movement}`, productId: product.id, workspaceId: "workspace-1", type: movement % 2 ? "IN" : "OUT",
    quantity: 1 + index, createdAt: `2026-09-${String(20 + movement).padStart(2, "0")}T12:00:00.000Z`,
  })));
  const snapshot = buildDashboardSnapshot({ products, movements, now });
  assert.equal(snapshot.metrics.products, 40);
  assert.equal(snapshot.metrics.movementsLast30Days, 200);
  assert.equal(snapshot.pulse.forecastCoverage.calculated, 40);
  assert.ok(snapshot.signals.every((signal) => signal.lineage.sourceRecords.some((source) => source.entityType === "product")));
});
