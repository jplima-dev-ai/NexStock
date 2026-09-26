import test from "node:test";
import assert from "node:assert/strict";
import { SCENARIO_TYPES, applyTwinScenario, compareScenarios, createDigitalTwin, reconstructHistoricalSnapshot, simulateScenario, simulateScenarioLab } from "../../js/services/scenario-service.js";

const product = Object.freeze({ id: "product-1", name: "Cabo", currentQuantity: 10, minimumStock: 5 });
const now = new Date("2026-09-19T12:00:00.000Z");

test("entrada, saída e mínimo comparam agora, cenário, impacto e status", () => {
  const input = simulateScenario({ product, type: SCENARIO_TYPES.INPUT, value: 5, now });
  assert.deepEqual(input.scenario, { quantity: 15, minimum: 5, status: "healthy" });
  assert.equal(input.impact.quantityDelta, 5);
  assert.equal(input.persisted, false);

  const output = simulateScenario({ product, type: SCENARIO_TYPES.OUTPUT, value: 6, now });
  assert.deepEqual(output.scenario, { quantity: 4, minimum: 5, status: "critical" });
  assert.equal(output.impact.quantityDelta, -6);

  const minimum = simulateScenario({ product, type: SCENARIO_TYPES.CHANGE_MINIMUM, value: 10, now });
  assert.deepEqual(minimum.scenario, { quantity: 10, minimum: 10, status: "critical" });
  assert.equal(minimum.impact.minimumDelta, 5);
});

test("cenário nunca permite estoque negativo", () => {
  assert.throws(() => simulateScenario({ product, type: SCENARIO_TYPES.OUTPUT, value: 11, now }), /negative stock/);
});

test("aumento do ritmo calcula futuro estimado sem alterar o produto", () => {
  const movements = [{ productId: product.id, type: "OUT", quantity: 30, createdAt: "2026-09-18T12:00:00.000Z" }];
  const result = simulateScenario({ product, movements, type: SCENARIO_TYPES.INCREASE_OUTPUT_RATE, value: 100, now });
  assert.equal(result.impact.forecast.currentDays, 10);
  assert.equal(result.impact.forecast.scenarioDays, 5);
  assert.equal(result.scenario.quantity, 10);
  assert.equal(product.currentQuantity, 10);
});

test("aumento do ritmo sem saídas recusa inventar uma previsão", () => {
  assert.throws(() => simulateScenario({ product, movements: [], type: SCENARIO_TYPES.INCREASE_OUTPUT_RATE, value: 20, now }), /history is required/);
});

test("motor de cenário não recebe nem chama provider", () => {
  const writes = [];
  const provider = new Proxy({}, { get: (_, key) => (...args) => writes.push([key, args]) });
  const result = simulateScenario({ product, provider, type: SCENARIO_TYPES.INPUT, value: 2, now });
  assert.equal(result.persisted, false);
  assert.deepEqual(writes, []);
});

test("Scenario Lab combina múltiplas variáveis sem persistir", () => {
  const result = simulateScenarioLab({ product, changes: [{ type: SCENARIO_TYPES.INPUT, value: 5 }, { type: SCENARIO_TYPES.CHANGE_MINIMUM, value: 8 }], now });
  assert.deepEqual(result.scenario, { quantity: 15, minimum: 8, status: "healthy" });
  assert.equal(result.changes.length, 2);
  assert.equal(result.persisted, false);
  assert.equal(product.currentQuantity, 10);
});

test("Scenario Comparison mostra real, A, B e C com impacto, previsão e riscos", () => {
  const movements = [{ id: "out-1", productId: product.id, type: "OUT", quantity: 30, createdAt: "2026-09-18T12:00:00.000Z" }];
  const result = compareScenarios({
    product,
    movements,
    scenarios: [
      { id: "A", changes: [{ type: SCENARIO_TYPES.OUTPUT, value: 6 }] },
      { id: "B", changes: [{ type: SCENARIO_TYPES.INPUT, value: 10 }] },
      { id: "C", changes: [{ type: SCENARIO_TYPES.INPUT, value: 5 }, { type: SCENARIO_TYPES.CHANGE_MINIMUM, value: 8 }] },
    ],
    now,
  });
  assert.equal(result.persisted, false);
  assert.deepEqual(result.real.impact, { quantityDelta: 0, minimumDelta: 0 });
  assert.deepEqual(result.scenarios.map(({ id, quantity, status }) => ({ id, quantity, status })), [
    { id: "A", quantity: 4, status: "critical" },
    { id: "B", quantity: 20, status: "healthy" },
    { id: "C", quantity: 15, status: "healthy" },
  ]);
  assert.equal(result.scenarios[0].forecast.available, true);
  assert.equal(result.scenarios[0].risks.some(({ type }) => type === "risk"), true);
  assert.equal(product.currentQuantity, 10);
});

test("Scenario Comparison exige exatamente A, B e C", () => {
  assert.throws(() => compareScenarios({ product, scenarios: [{ id: "A", changes: [{ type: SCENARIO_TYPES.INPUT, value: 1 }] }], now }), /A, B, and C/);
});

test("Time Machine 2 reconstrói quantidade, movimentos, métricas e NexPulse histórico", () => {
  const historicalProduct = { ...product, createdAt: "2026-09-01T00:00:00.000Z", currentQuantity: 12 };
  const movements = [
    { id: "in", productId: product.id, type: "IN", quantity: 5, beforeQuantity: 5, afterQuantity: 10, createdAt: "2026-09-02T12:00:00.000Z" },
    { id: "out", productId: product.id, type: "OUT", quantity: 6, beforeQuantity: 10, afterQuantity: 4, createdAt: "2026-09-10T12:00:00.000Z" },
    { id: "later", productId: product.id, type: "IN", quantity: 8, beforeQuantity: 4, afterQuantity: 12, createdAt: "2026-09-12T12:00:00.000Z" },
  ];
  const result = reconstructHistoricalSnapshot({ products: [historicalProduct], movements, at: "2026-09-11T12:00:00.000Z", now: "2026-09-20T12:00:00.000Z" });
  assert.equal(result.persisted, false);
  assert.equal(result.products[0].currentQuantity, 4);
  assert.equal(result.products[0].status, "critical");
  assert.deepEqual(result.movements.map(({ id }) => id), ["in", "out"]);
  assert.equal(result.metrics.totalUnits, 4);
  assert.equal(result.pulse.available, true);
  assert.equal(historicalProduct.currentQuantity, 12);
});

test("Time Machine 2 não inventa passado antes da criação nem aceita futuro", () => {
  const historicalProduct = { ...product, createdAt: "2026-09-10T00:00:00.000Z" };
  const beforeCreation = reconstructHistoricalSnapshot({ products: [historicalProduct], at: "2026-09-01T00:00:00.000Z", now });
  assert.equal(beforeCreation.products.length, 0);
  assert.equal(beforeCreation.pulse.available, false);
  assert.throws(() => reconstructHistoricalSnapshot({ products: [historicalProduct], at: "2026-09-20T00:00:00.000Z", now }), /future/);
});

test("Digital Twin cria uma cópia virtual isolada e aplica cenário sem alterar o real", () => {
  const realProducts = [{ ...product }];
  const realMovements = [{ id: "movement-1", productId: product.id, type: "OUT", quantity: 1, beforeQuantity: 10, afterQuantity: 9, createdAt: "2026-09-18T12:00:00.000Z" }];
  const twin = createDigitalTwin({ products: realProducts, movements: realMovements, now });
  const evolved = applyTwinScenario({ twin, productId: product.id, changes: [{ type: SCENARIO_TYPES.OUTPUT, value: 4 }], now });
  assert.equal(twin.persisted, false);
  assert.equal(twin.products[0].currentQuantity, 10);
  assert.equal(evolved.products[0].currentQuantity, 6);
  assert.equal(evolved.applied.result.persisted, false);
  assert.equal(realProducts[0].currentQuantity, 10);
  assert.equal(realMovements.length, 1);
  assert.throws(() => { twin.products[0].currentQuantity = 1; }, TypeError);
});

test("Digital Twin não depende de provider e recusa produto externo", () => {
  const twin = createDigitalTwin({ products: [product], now });
  assert.throws(() => applyTwinScenario({ twin, productId: "foreign", changes: [{ type: SCENARIO_TYPES.INPUT, value: 1 }], now }), /not available/);
});
