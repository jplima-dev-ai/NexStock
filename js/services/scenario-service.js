import { calculateForecast } from "./insight-service.js";
import { getInventoryStatus } from "./product-service.js";
import { buildIntelligenceSignals } from "./intelligence-service.js";
import { buildDashboardSnapshot } from "./dashboard-service.js";

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

export function simulateScenarioLab({ product, movements = [], changes, now = new Date() }) {
  if (!Array.isArray(changes) || changes.length < 2) throw new RangeError("Scenario Lab requires at least two changes.");
  const initial = Object.freeze({ quantity: Number(product.currentQuantity), minimum: Number(product.minimumStock), status: getInventoryStatus(product.currentQuantity, product.minimumStock) });
  let virtualProduct = { ...product };
  let forecast = null;
  const applied = [];
  for (const change of changes) {
    const result = simulateScenario({ product: virtualProduct, movements, type: change.type, value: change.value, now });
    virtualProduct = { ...virtualProduct, currentQuantity: result.scenario.quantity, minimumStock: result.scenario.minimum };
    if (result.impact.forecast) forecast = result.impact.forecast;
    applied.push(Object.freeze({ type: change.type, value: Number(change.value) }));
  }
  const scenario = Object.freeze({ quantity: Number(virtualProduct.currentQuantity), minimum: Number(virtualProduct.minimumStock), status: getInventoryStatus(virtualProduct.currentQuantity, virtualProduct.minimumStock) });
  return Object.freeze({ persisted: false, changes: Object.freeze(applied), now: initial, scenario, impact: Object.freeze({ quantityDelta: scenario.quantity - initial.quantity, minimumDelta: scenario.minimum - initial.minimum, forecast }) });
}

function comparisonSnapshot({ id, product, movements, impact, now }) {
  const forecast = calculateForecast(product, movements, now);
  const risks = buildIntelligenceSignals({ products: [product], movements, now })
    .map(({ type, severity, summary }) => Object.freeze({ type, severity, summary }));
  return Object.freeze({
    id,
    quantity: Number(product.currentQuantity),
    minimum: Number(product.minimumStock),
    status: getInventoryStatus(product.currentQuantity, product.minimumStock),
    forecast: Object.freeze({ available: forecast.available, daysRemaining: forecast.daysRemaining, dataSufficiency: forecast.dataSufficiency, limitations: forecast.limitations }),
    risks: Object.freeze(risks),
    impact: Object.freeze({ quantityDelta: Number(impact?.quantityDelta ?? 0), minimumDelta: Number(impact?.minimumDelta ?? 0) }),
  });
}

function runScenario({ product, movements, changes, now }) {
  if (!Array.isArray(changes) || changes.length === 0) throw new RangeError("A scenario requires at least one change.");
  if (changes.length === 1) return simulateScenario({ product, movements, ...changes[0], now });
  return simulateScenarioLab({ product, movements, changes, now });
}

export function compareScenarios({ product, movements = [], scenarios, now = new Date() }) {
  if (!product?.id) throw new TypeError("A product is required.");
  if (!Array.isArray(scenarios) || scenarios.length !== 3) throw new RangeError("Scenario comparison requires A, B, and C.");
  const ids = scenarios.map(({ id }) => id);
  if (new Set(ids).size !== 3 || !["A", "B", "C"].every((id) => ids.includes(id))) throw new RangeError("Scenario comparison IDs must be A, B, and C.");
  const real = comparisonSnapshot({ id: "REAL", product, movements, now });
  const compared = scenarios.map(({ id, changes }) => {
    const result = runScenario({ product, movements, changes, now });
    const scenarioProduct = { ...product, currentQuantity: result.scenario.quantity, minimumStock: result.scenario.minimum };
    return comparisonSnapshot({ id, product: scenarioProduct, movements, impact: result.impact, now });
  });
  return Object.freeze({ persisted: false, real, scenarios: Object.freeze(compared) });
}

function validDate(value, name) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new RangeError(`${name} must be a valid date.`);
  return date;
}

function historicalProduct(product, movements, at) {
  const createdAt = new Date(product.createdAt).getTime();
  if (Number.isFinite(createdAt) && createdAt > at.getTime()) return null;
  const productMovements = movements.filter(({ productId }) => productId === product.id)
    .sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt));
  const earlier = productMovements.filter((movement) => new Date(movement.createdAt).getTime() <= at.getTime()).at(-1);
  const later = productMovements.find((movement) => new Date(movement.createdAt).getTime() > at.getTime());
  const quantity = earlier
    ? Number(earlier.afterQuantity)
    : (later ? Number(later.beforeQuantity) : Number(product.currentQuantity));
  return Object.freeze({ ...product, currentQuantity: quantity, status: getInventoryStatus(quantity, product.minimumStock), updatedAt: earlier?.createdAt ?? product.createdAt });
}

export function reconstructHistoricalSnapshot({ products, movements = [], at, now = new Date() }) {
  const selectedAt = validDate(at, "at");
  const currentAt = validDate(now, "now");
  if (selectedAt.getTime() > currentAt.getTime()) throw new RangeError("Historical date cannot be in the future.");
  const history = movements.filter((movement) => new Date(movement.createdAt).getTime() <= selectedAt.getTime())
    .sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt));
  const historicalProducts = products.map((product) => historicalProduct(product, movements, selectedAt)).filter(Boolean);
  const dashboard = buildDashboardSnapshot({ products: historicalProducts, movements: history, now: selectedAt });
  return Object.freeze({
    persisted: false,
    selectedAt: selectedAt.toISOString(),
    products: Object.freeze(historicalProducts),
    movements: Object.freeze(history),
    metrics: dashboard.metrics,
    pulse: Object.freeze({ available: dashboard.pulse.score !== null, ...dashboard.pulse }),
    signals: dashboard.signals,
  });
}

function immutableRecords(records) {
  return Object.freeze(records.map((record) => Object.freeze(structuredClone(record))));
}

export function createDigitalTwin({ products, movements = [], now = new Date() }) {
  if (!Array.isArray(products)) throw new TypeError("Digital Twin requires products.");
  const twinProducts = immutableRecords(products);
  const twinMovements = immutableRecords(movements);
  const snapshot = buildDashboardSnapshot({ products: twinProducts, movements: twinMovements, now });
  return Object.freeze({
    kind: "inventory-digital-twin",
    persisted: false,
    createdAt: validDate(now, "now").toISOString(),
    products: twinProducts,
    movements: twinMovements,
    snapshot,
  });
}

export function applyTwinScenario({ twin, productId, changes, now = new Date() }) {
  if (twin?.kind !== "inventory-digital-twin" || twin.persisted !== false) throw new TypeError("A virtual Digital Twin is required.");
  const product = twin.products.find(({ id }) => id === productId);
  if (!product) throw new RangeError("Product is not available in this Digital Twin.");
  const result = runScenario({ product, movements: twin.movements.filter((movement) => movement.productId === productId), changes, now });
  const products = twin.products.map((item) => item.id === productId
    ? { ...item, currentQuantity: result.scenario.quantity, minimumStock: result.scenario.minimum }
    : item);
  return Object.freeze({ ...createDigitalTwin({ products, movements: twin.movements, now }), applied: Object.freeze({ productId, changes: Object.freeze(changes.map((change) => Object.freeze({ ...change }))), result }) });
}
