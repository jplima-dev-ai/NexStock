import { calculateForecast } from "./insight-service.js";
import { getInventoryStatus } from "./product-service.js";

export const SCENARIO_TYPES = Object.freeze({
  OUTPUT: "saida",
  INPUT: "entrada",
  CHANGE_MINIMUM: "alterar_estoque_minimo",
  INCREASE_OUTPUT_RATE: "aumentar_ritmo_de_saida",
});

function positiveNumber(value, name) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new RangeError(`${name} must be positive.`);
  return number;
}

export function simulateScenario({ product, movements = [], type, value, now = new Date() }) {
  if (!product?.id) throw new TypeError("A product is required.");
  if (!Object.values(SCENARIO_TYPES).includes(type)) throw new RangeError("Scenario type is invalid.");
  const amount = positiveNumber(value, "value");
  const currentQuantity = Number(product.currentQuantity);
  const currentMinimum = Number(product.minimumStock);
  let scenarioQuantity = currentQuantity;
  let scenarioMinimum = currentMinimum;
  let forecast = null;

  if (type === SCENARIO_TYPES.OUTPUT) {
    scenarioQuantity -= amount;
    if (scenarioQuantity < 0) throw new RangeError("Scenario cannot result in negative stock.");
  } else if (type === SCENARIO_TYPES.INPUT) {
    scenarioQuantity += amount;
  } else if (type === SCENARIO_TYPES.CHANGE_MINIMUM) {
    scenarioMinimum = amount;
  } else {
    const currentForecast = calculateForecast(product, movements, now);
    if (!currentForecast.available) throw new RangeError("Output history is required for this scenario.");
    const multiplier = 1 + (amount / 100);
    forecast = Object.freeze({
      currentDays: currentForecast.daysRemaining,
      scenarioDays: currentForecast.daysRemaining / multiplier,
      increasePercent: amount,
    });
  }

  return Object.freeze({
    persisted: false,
    type,
    now: Object.freeze({ quantity: currentQuantity, minimum: currentMinimum, status: getInventoryStatus(currentQuantity, currentMinimum) }),
    scenario: Object.freeze({ quantity: scenarioQuantity, minimum: scenarioMinimum, status: getInventoryStatus(scenarioQuantity, scenarioMinimum) }),
    impact: Object.freeze({ quantityDelta: scenarioQuantity - currentQuantity, minimumDelta: scenarioMinimum - currentMinimum, forecast }),
  });
}
