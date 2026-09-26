const DAY_MS = 86_400_000;
export const FORECAST_WINDOW_DAYS = 30;

function dateValue(value) {
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function productMovements(productId, movements) {
  return movements.filter((movement) => movement.productId === productId)
    .sort((first, second) => dateValue(first.createdAt) - dateValue(second.createdAt));
}

export function calculateConfidence(eventCount, historyDays) {
  if (eventCount < 5) return "low";
  if (eventCount >= 15 && historyDays >= 14) return "high";
  return "medium";
}

export function calculateForecast(product, movements, now = new Date()) {
  const cutoff = now.getTime() - (FORECAST_WINDOW_DAYS * DAY_MS);
  const outputs = productMovements(product.id, movements).filter((movement) => (
    movement.type === "OUT" && dateValue(movement.createdAt) >= cutoff
  ));
  const totalOut = outputs.reduce((sum, movement) => sum + Number(movement.quantity), 0);
  const averageDailyOut = totalOut / FORECAST_WINDOW_DAYS;
  const daysRemaining = averageDailyOut > 0 ? Number(product.currentQuantity) / averageDailyOut : null;
  const historyDays = outputs.length === 0
    ? 0
    : Math.min(FORECAST_WINDOW_DAYS, Math.floor((now.getTime() - dateValue(outputs[0].createdAt)) / DAY_MS) + 1);
  const confidence = calculateConfidence(outputs.length, historyDays);
  const dataSufficiency = outputs.length === 0 ? "insufficient" : (outputs.length < 5 || historyDays < 14 ? "limited" : "sufficient");
  const limitations = [];
  if (outputs.length === 0) limitations.push("NO_OUTPUT_EVENTS");
  if (outputs.length < 5) limitations.push("FEW_EVENTS");
  if (historyDays < 14) limitations.push("SHORT_HISTORY");
  limitations.push("PAST_DEMAND_MAY_CHANGE");

  return Object.freeze({
    productId: product.id,
    available: daysRemaining !== null,
    estimated: true,
    windowDays: FORECAST_WINDOW_DAYS,
    currentQuantity: Number(product.currentQuantity),
    totalOut,
    averageDailyOut,
    daysRemaining,
    eventCount: outputs.length,
    historyDays,
    confidence,
    dataSufficiency,
    limitations: Object.freeze(limitations),
  });
}

export function calculateStockMemory(product, movements, now = new Date()) {
  const history = productMovements(product.id, movements);
  const quantities = [Number(product.currentQuantity)];
  for (const movement of history) quantities.push(Number(movement.beforeQuantity), Number(movement.afterQuantity));
  const entries = history.filter(({ type }) => type === "IN");
  const outputs = history.filter(({ type }) => type === "OUT");
  const zeroEvents = history.filter(({ afterQuantity }) => Number(afterQuantity) === 0);
  const lastMovement = history.at(-1) ?? null;
  const fallbackZeroAt = Number(product.currentQuantity) === 0 && history.length === 0 ? product.createdAt : null;

  return Object.freeze({
    maximumQuantity: Math.max(...quantities),
    minimumQuantity: Math.min(...quantities),
    lastZeroedAt: zeroEvents.at(-1)?.createdAt ?? fallbackZeroAt,
    replenishments: entries.length,
    lastEntryAt: entries.at(-1)?.createdAt ?? null,
    lastOutputAt: outputs.at(-1)?.createdAt ?? null,
    largestOutput: outputs.length ? Math.max(...outputs.map(({ quantity }) => Number(quantity))) : 0,
    totalMoved: history.reduce((sum, movement) => sum + Number(movement.quantity), 0),
    daysSinceLastMovement: lastMovement
      ? Math.max(0, Math.floor((now.getTime() - dateValue(lastMovement.createdAt)) / DAY_MS))
      : null,
    eventCount: history.length,
  });
}

export function buildProductInsight(product, movements, now = new Date()) {
  return Object.freeze({
    product,
    forecast: calculateForecast(product, movements, now),
    memory: calculateStockMemory(product, movements, now),
  });
}

export class InsightService {
  constructor({ provider, now = () => new Date() }) {
    if (!provider) throw new TypeError("InsightService requires a DataProvider.");
    this.provider = provider;
    this.now = now;
  }

  async listByWorkspace(workspaceId) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    const [products, movements] = await Promise.all([
      this.provider.getAll("products", { index: "workspaceId", query: workspaceId }),
      this.provider.getAll("movements", { index: "workspaceId", query: workspaceId }),
    ]);
    return products.filter((product) => !product.archivedAt)
      .map((product) => buildProductInsight(product, movements, this.now()))
      .sort((first, second) => {
        if (first.forecast.available !== second.forecast.available) return first.forecast.available ? -1 : 1;
        if (first.forecast.available && first.forecast.daysRemaining !== second.forecast.daysRemaining) return first.forecast.daysRemaining - second.forecast.daysRemaining;
        return first.product.name.localeCompare(second.product.name);
      });
  }

  async getByProduct(workspaceId, productId) {
    if (!workspaceId || !productId) throw new TypeError("Workspace and product IDs are required.");
    const [product, movements] = await Promise.all([
      this.provider.get("products", productId),
      this.provider.getAll("movements", { index: "productId", query: productId }),
    ]);
    if (!product || product.workspaceId !== workspaceId) return null;
    return buildProductInsight(product, movements.filter((movement) => movement.workspaceId === workspaceId), this.now());
  }
}
