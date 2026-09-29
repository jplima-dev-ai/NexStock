import test from "node:test";
import assert from "node:assert/strict";
import { buildDashboardSnapshot, DashboardService } from "../../js/services/dashboard-service.js";
import { isStoppedProduct } from "../../js/services/inventory-activity-service.js";

const NOW = new Date("2026-09-19T12:00:00.000Z");
const OLD = "2026-07-01T12:00:00.000Z";

function product(id, currentQuantity, minimumStock = 5, extra = {}) {
  return { id, workspaceId: "workspace-1", name: `Product ${id}`, currentQuantity, minimumStock, createdAt: OLD, archivedAt: null, ...extra };
}

test("produto parado exige estoque, trinta dias e nenhuma saída recente", () => {
  const item = product("healthy", 10);
  assert.equal(isStoppedProduct(item, [], NOW), true);
  assert.equal(isStoppedProduct(item, [{ productId: item.id, type: "OUT", createdAt: "2026-09-10T12:00:00.000Z" }], NOW), false);
  assert.equal(isStoppedProduct(product("empty", 0), [], NOW), false);
  assert.equal(isStoppedProduct(product("new", 10, 5, { createdAt: "2026-09-10T12:00:00.000Z" }), [], NOW), false);
});

test("NexPulse redistribui o peso indisponível e mantém texto apoiado por prioridades", () => {
  const products = [product("out", 0), product("critical", 5), product("attention", 7), product("healthy", 10)];
  const snapshot = buildDashboardSnapshot({ products, movements: [], now: NOW });
  assert.equal(snapshot.pulse.forecastAvailable, false);
  assert.equal(snapshot.pulse.score, 56);
  assert.ok(snapshot.actionCenter.every((action) => action.execution === "REVIEW_ONLY" && action.action));
  assert.ok(snapshot.signals.every((signal) => signal.explanation && signal.lineage.sourceRecords.length > 0));
  assert.deepEqual(snapshot.pulse.rates, { availability: 75, minimumCompliance: 50, freshness: 25 });
  assert.deepEqual(snapshot.counts, { out: 1, critical: 1, attention: 1, healthy: 1, stopped: 3 });
  assert.deepEqual(snapshot.priorities.map(({ type }) => type), ["out", "critical", "attention", "stopped"]);
});

test("métricas ignoram arquivados e movimentos de produtos fora do snapshot", () => {
  const products = [product("active", 9), product("archived", 99, 5, { archivedAt: "2026-09-01T00:00:00.000Z" })];
  const movements = [
    { id: "recent", productId: "active", type: "IN", createdAt: "2026-09-18T00:00:00.000Z" },
    { id: "old", productId: "active", type: "OUT", createdAt: "2026-07-01T00:00:00.000Z" },
    { id: "archived-movement", productId: "archived", type: "IN", createdAt: "2026-09-18T00:00:00.000Z" },
  ];
  const snapshot = buildDashboardSnapshot({ products, movements, now: NOW });
  assert.deepEqual(snapshot.metrics, { products: 1, totalUnits: 9, belowOrAtMinimum: 0, movementsLast30Days: 1 });
  assert.deepEqual(snapshot.recentMovements.map(({ id }) => id), ["recent", "old"]);
});

test("DashboardService mantém isolamento por workspace", async () => {
  const calls = [];
  const provider = { async getAll(store, options) { calls.push([store, options]); return store === "products" ? [product("one", 3)] : []; } };
  const service = new DashboardService({ provider, now: () => NOW });
  const snapshot = await service.getSnapshot("workspace-1");
  assert.equal(snapshot.metrics.products, 1);
  assert.deepEqual(calls, [
    ["products", { index: "workspaceId", query: "workspace-1" }],
    ["movements", { index: "workspaceId", query: "workspace-1" }],
  ]);
});

test("snapshot vazio não inventa uma pontuação", () => {
  const snapshot = buildDashboardSnapshot({ products: [], movements: [], now: NOW });
  assert.equal(snapshot.pulse.score, null);
  assert.equal(snapshot.pulse.context, null);
  assert.equal(snapshot.priorities.length, 0);
});

test("NexPulse incorpora previsão calculável sem esconder a cobertura parcial", () => {
  const products = [product("forecasted", 15)];
  const movements = [{ id: "out", workspaceId: "workspace-1", productId: "forecasted", type: "OUT", quantity: 30, beforeQuantity: 45, afterQuantity: 15, createdAt: "2026-09-18T12:00:00.000Z" }];
  const snapshot = buildDashboardSnapshot({ products, movements, now: NOW });
  assert.equal(snapshot.pulse.forecastAvailable, true);
  assert.deepEqual(snapshot.pulse.forecastCoverage, { calculated: 1, total: 1 });
  assert.equal(snapshot.pulse.rates.forecast, 50);
  assert.equal(snapshot.pulse.score, 90);
});
