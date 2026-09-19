import test from "node:test";
import assert from "node:assert/strict";
import { SCENARIO_TYPES, simulateScenario } from "../../js/services/scenario-service.js";

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
