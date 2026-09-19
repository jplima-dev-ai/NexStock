import { getInventoryStatus } from "./product-service.js";
import { calculateForecast } from "./insight-service.js";

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

export function isStoppedProduct(product, movements, now = new Date()) {
  if (Number(product.currentQuantity) <= 0) return false;
  const cutoff = now.getTime() - (30 * DAY_MS);
  if (dateValue(product.createdAt) > cutoff) return false;
  return !movements.some((movement) => (
    movement.productId === product.id
    && movement.type === "OUT"
    && dateValue(movement.createdAt) >= cutoff
  ));
}

export function buildDashboardSnapshot({ products, movements, now = new Date() }) {
  const activeProducts = products.filter((product) => !product.archivedAt);
  const productIds = new Set(activeProducts.map(({ id }) => id));
  const workspaceMovements = movements
    .filter((movement) => productIds.has(movement.productId))
    .sort((first, second) => dateValue(second.createdAt) - dateValue(first.createdAt));
  const totalProducts = activeProducts.length;
  const cutoff = now.getTime() - (30 * DAY_MS);
  const stoppedIds = new Set(activeProducts
    .filter((product) => isStoppedProduct(product, workspaceMovements, now))
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
  const forecasts = enriched.map((product) => calculateForecast(product, workspaceMovements, now)).filter(({ available }) => available);
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

  const priorities = enriched.flatMap((product) => {
    if (product.status !== "healthy") return [{ type: product.status, product }];
    if (product.stopped) return [{ type: "stopped", product }];
    return [];
  }).sort((first, second) => (
    PRIORITY_RANK[first.type] - PRIORITY_RANK[second.type]
    || first.product.name.localeCompare(second.product.name)
  ));

  return Object.freeze({
    generatedAt: now.toISOString(),
    pulse: Object.freeze({
      score: score === null ? null : Math.round(score),
      rates: Object.freeze(Object.fromEntries(Object.entries(rates).map(([key, value]) => [key, Math.round(value)]))),
      forecastAvailable: forecasts.length > 0,
      forecastCoverage: Object.freeze({ calculated: forecasts.length, total: totalProducts }),
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
