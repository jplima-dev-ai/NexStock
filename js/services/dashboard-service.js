import { getInventoryStatus } from "./product-service.js";
import { calculateForecast } from "./insight-service.js";
import { buildIntelligenceSignals } from "./intelligence-service.js";
import { buildActionCenter } from "./actions-service.js";
import { indexRecordsBy } from "./performance-service.js";
import { isStoppedProduct } from "./inventory-activity-service.js";

const DAY_MS = 86_400_000;
const PULSE_WEIGHTS = Object.freeze({ availability: 35, minimumCompliance: 30, freshness: 15, forecast: 20 });
const PRIORITY_RANK = Object.freeze({ out: 0, critical: 1, attention: 2, stopped: 3 });

function percentage(part, total) {
  return total === 0 ? 0 : (part / total) * 100;
}

function dateValue(value) {
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function rounded(value) { return Math.round(value); }

function buildPulseContext({ totalProducts, rates, forecasts, usableWeights }) {
  const limitations = ["SCORE_IS_SUPPORTING_SUMMARY", "HISTORY_REFLECTS_AVAILABLE_LOCAL_RECORDS"];
  if (forecasts.length === 0) limitations.unshift("FORECAST_UNAVAILABLE");
  else if (forecasts.length < totalProducts) limitations.unshift("FORECAST_PARTIAL_COVERAGE");
  const totalWeight = usableWeights.reduce((sum, [, weight]) => sum + weight, 0);
  return Object.freeze({ summary: Object.freeze({ activeProducts: totalProducts }), dimensions: Object.freeze(usableWeights.map(([id, baseWeight]) => Object.freeze({ id, value: rounded(rates[id]), baseWeight, normalizedWeight: rounded((baseWeight / totalWeight) * 100) }))), dataAvailability: Object.freeze({ forecastCoverage: Object.freeze({ calculated: forecasts.length, total: totalProducts }) }), limitations: Object.freeze(limitations) });
}

export function buildDashboardSnapshot({ products, movements, now = new Date() }) {
  const activeProducts = products.filter((product) => !product.archivedAt);
  const productIds = new Set(activeProducts.map(({ id }) => id));
  const workspaceMovements = movements
    .filter((movement) => productIds.has(movement.productId))
    .sort((first, second) => dateValue(second.createdAt) - dateValue(first.createdAt));
  const movementsByProduct = indexRecordsBy(workspaceMovements);
  const totalProducts = activeProducts.length;
  const cutoff = now.getTime() - (30 * DAY_MS);
  const stoppedIds = new Set(activeProducts
    .filter((product) => isStoppedProduct(product, movementsByProduct, now))
    .map(({ id }) => id));

  const enriched = activeProducts.map((product) => ({
    ...product,
    status: getInventoryStatus(product.currentQuantity, product.minimumStock),
    stopped: stoppedIds.has(product.id),
  }));
  const counts = Object.fromEntries(["out", "critical", "attention", "healthy"].map((status) => [
    status,
    enriched.filter((product) => product.status === status).length,
  ]));
  const available = enriched.filter(({ currentQuantity }) => Number(currentQuantity) > 0).length;
  const compliant = enriched.filter(({ currentQuantity, minimumStock }) => Number(currentQuantity) > Number(minimumStock)).length;
  const fresh = totalProducts - stoppedIds.size;
  const rates = {
    availability: percentage(available, totalProducts),
    minimumCompliance: percentage(compliant, totalProducts),
    freshness: percentage(fresh, totalProducts),
  };
  const forecasts = enriched.map((product) => calculateForecast(product, movementsByProduct, now)).filter(({ available }) => available);
  const lowestForecast = forecasts
    .map((forecast) => ({ ...forecast, productName: enriched.find(({ id }) => id === forecast.productId)?.name }))
    .sort((first, second) => first.daysRemaining - second.daysRemaining)[0] ?? null;
  if (forecasts.length > 0) {
    rates.forecast = forecasts.reduce((sum, forecast) => sum + Math.min(100, forecast.daysRemaining / 30 * 100), 0) / forecasts.length;
  }
  const usableWeights = Object.entries(PULSE_WEIGHTS).filter(([key]) => Object.hasOwn(rates, key));
  const usableWeight = usableWeights.reduce((sum, [, weight]) => sum + weight, 0);
  const score = totalProducts === 0 ? null : Object.entries(PULSE_WEIGHTS).reduce(
    (sum, [key, weight]) => sum + ((rates[key] ?? 0) * (Object.hasOwn(rates, key) ? weight : 0) / usableWeight),
    0,
  );
  const pulseContext = totalProducts === 0 ? null : buildPulseContext({ totalProducts, rates, forecasts, usableWeights });

  const priorities = enriched.flatMap((product) => {
    if (product.status !== "healthy") return [{ type: product.status, product }];
    if (product.stopped) return [{ type: "stopped", product }];
    return [];
  }).sort((first, second) => (
    PRIORITY_RANK[first.type] - PRIORITY_RANK[second.type]
    || first.product.name.localeCompare(second.product.name)
  ));

  const signals = buildIntelligenceSignals({ products: activeProducts, movements: workspaceMovements, movementIndex: movementsByProduct, now });
  return Object.freeze({
    generatedAt: now.toISOString(),
    pulse: Object.freeze({
      score: score === null ? null : Math.round(score),
      rates: Object.freeze(Object.fromEntries(Object.entries(rates).map(([key, value]) => [key, Math.round(value)]))),
      forecastAvailable: forecasts.length > 0,
      forecastCoverage: Object.freeze({ calculated: forecasts.length, total: totalProducts }),
      context: pulseContext,
    }),
    counts: Object.freeze({ ...counts, stopped: stoppedIds.size }),
    priorities: Object.freeze(priorities),
    metrics: Object.freeze({
      products: totalProducts,
      totalUnits: enriched.reduce((sum, product) => sum + Number(product.currentQuantity), 0),
      belowOrAtMinimum: counts.out + counts.critical,
      movementsLast30Days: workspaceMovements.filter((movement) => dateValue(movement.createdAt) >= cutoff).length,
    }),
    recentMovements: Object.freeze(workspaceMovements.slice(0, 5)),
    lowestForecast: lowestForecast ? Object.freeze(lowestForecast) : null,
    products: Object.freeze(enriched),
    signals,
    actionCenter: buildActionCenter(signals),
  });
}

export class DashboardService {
  constructor({ provider, now = () => new Date() }) {
    if (!provider) throw new TypeError("DashboardService requires a DataProvider.");
    this.provider = provider;
    this.now = now;
  }

  async getSnapshot(workspaceId) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    const [products, movements] = await Promise.all([
      this.provider.getAll("products", { index: "workspaceId", query: workspaceId }),
      this.provider.getAll("movements", { index: "workspaceId", query: workspaceId }),
    ]);
    return buildDashboardSnapshot({ products, movements, now: this.now() });
  }
}
