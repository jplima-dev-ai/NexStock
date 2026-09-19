import test from "node:test";
import assert from "node:assert/strict";
import { buildInventoryStory } from "../../js/services/inventory-story-service.js";

function snapshot(overrides = {}) {
  return {
    metrics: { products: 2, totalUnits: 12, movementsLast30Days: 0 },
    counts: { out: 0, critical: 0, attention: 0, healthy: 2, stopped: 0 },
    lowestForecast: null,
    ...overrides,
  };
}

test("Inventory Story funciona sem movimentações e não inventa passado", () => {
  const story = buildInventoryStory(snapshot());
  assert.deepEqual(story.map(({ key }) => key), [
    "inventoryStory.state.healthy",
    "inventoryStory.movements.none",
    "inventoryStory.forecast.unavailable",
    "inventoryStory.next.keepMonitoring",
  ]);
});

test("Inventory Story prioriza falta de estoque e identifica menor cobertura", () => {
  const input = snapshot({
    metrics: { products: 3, totalUnits: 8, movementsLast30Days: 4 },
    counts: { out: 1, critical: 1, attention: 0, healthy: 1, stopped: 0 },
    lowestForecast: { productName: "Cabo", daysRemaining: 3.6 },
  });
  const story = buildInventoryStory(input);
  assert.equal(story[0].key, "inventoryStory.state.out");
  assert.deepEqual(story[2], { key: "inventoryStory.forecast.available", parameters: { name: "Cabo", days: 4 } });
  assert.equal(story.at(-1).key, "inventoryStory.next.replenishOut");
});

test("mesmo snapshot sempre gera a mesma estrutura narrativa", () => {
  const input = snapshot();
  assert.deepEqual(buildInventoryStory(input), buildInventoryStory(input));
});
