import test from "node:test";
import assert from "node:assert/strict";
import { buildProductInsight, calculateConfidence, calculateForecast, calculateStockMemory, InsightService } from "../../js/services/insight-service.js";

const NOW = new Date("2026-09-19T12:00:00.000Z");
const PRODUCT = { id: "product-1", workspaceId: "workspace-1", name: "SSD", nexCode: "NX-SSD-0001", currentQuantity: 15, createdAt: "2026-07-01T00:00:00.000Z", archivedAt: null };

function movement(id, type, quantity, beforeQuantity, afterQuantity, createdAt) {
  return { id, workspaceId: "workspace-1", productId: "product-1", type, quantity, beforeQuantity, afterQuantity, createdAt };
}

test("previsão usa janela de 30 dias e mantém precisão antes da apresentação", () => {
  const movements = [
    movement("out-1", "OUT", 10, 45, 35, "2026-09-01T12:00:00.000Z"),
    movement("out-2", "OUT", 8, 35, 27, "2026-09-10T12:00:00.000Z"),
    movement("out-3", "OUT", 12, 27, 15, "2026-09-18T12:00:00.000Z"),
    movement("old", "OUT", 100, 145, 45, "2026-07-01T12:00:00.000Z"),
  ];
  const forecast = calculateForecast(PRODUCT, movements, NOW);
  assert.equal(forecast.totalOut, 30);
  assert.equal(forecast.averageDailyOut, 1);
  assert.equal(forecast.daysRemaining, 15);
  assert.equal(forecast.eventCount, 3);
  assert.equal(forecast.confidence, "low");
  assert.equal(forecast.estimated, true);
});

test("Confidence Meter respeita limites e exige extensão histórica para alta", () => {
  assert.equal(calculateConfidence(4, 30), "low");
  assert.equal(calculateConfidence(5, 2), "medium");
  assert.equal(calculateConfidence(15, 13), "medium");
  assert.equal(calculateConfidence(15, 14), "high");
});

test("sem saídas a previsão declara indisponibilidade em vez de inventar valor", () => {
  const forecast = calculateForecast(PRODUCT, [movement("in", "IN", 5, 10, 15, "2026-09-18T12:00:00.000Z")], NOW);
  assert.equal(forecast.available, false);
  assert.equal(forecast.dataSufficiency, "insufficient");
  assert.equal(forecast.daysRemaining, null);
  assert.ok(forecast.limitations.includes("NO_OUTPUT_EVENTS"));
});

test("Stock Memory deriva extremos, reposições e datas do histórico", () => {
  const movements = [
    movement("in", "IN", 20, 5, 25, "2026-09-01T12:00:00.000Z"),
    movement("out-1", "OUT", 25, 25, 0, "2026-09-05T12:00:00.000Z"),
    movement("in-2", "IN", 30, 0, 30, "2026-09-10T12:00:00.000Z"),
    movement("out-2", "OUT", 15, 30, 15, "2026-09-18T12:00:00.000Z"),
  ];
  const memory = calculateStockMemory(PRODUCT, movements, NOW);
  assert.deepEqual(memory, {
    maximumQuantity: 30, minimumQuantity: 0, lastZeroedAt: "2026-09-05T12:00:00.000Z", replenishments: 2,
    lastEntryAt: "2026-09-10T12:00:00.000Z", lastOutputAt: "2026-09-18T12:00:00.000Z", largestOutput: 25,
    totalMoved: 90, daysSinceLastMovement: 1, eventCount: 4,
  });
});

test("InsightService isola workspace e ordena coberturas menores primeiro", async () => {
  const products = [PRODUCT, { ...PRODUCT, id: "product-2", name: "Router", currentQuantity: 30 }];
  const movements = [
    movement("one", "OUT", 30, 45, 15, "2026-09-18T12:00:00.000Z"),
    { ...movement("two", "OUT", 15, 45, 30, "2026-09-18T12:00:00.000Z"), productId: "product-2" },
  ];
  const provider = {
    async getAll(store) { return store === "products" ? products : movements; },
    async get(store, id) { return store === "products" ? products.find((product) => product.id === id) : null; },
  };
  const service = new InsightService({ provider, now: () => NOW });
  assert.deepEqual((await service.listByWorkspace("workspace-1")).map(({ product }) => product.id), ["product-1", "product-2"]);
  const insight = await service.getByProduct("workspace-1", "product-1");
  assert.equal(insight.forecast.daysRemaining, 15);
  assert.equal(buildProductInsight(PRODUCT, movements, NOW).memory.eventCount, 1);
});
