import { getInventoryStatus } from "./product-service.js";
import { isStoppedProduct } from "./dashboard-service.js";

function freeze(value) { return Object.freeze(value); }

function reorderRecommendation(product, movements, now) {
  const cutoff = now.getTime() - (30 * 86_400_000);
  const outputs = movements.filter((movement) => movement.productId === product.id && movement.type === "OUT" && new Date(movement.createdAt).getTime() >= cutoff);
  const totalOut = outputs.reduce((sum, movement) => sum + Number(movement.quantity), 0);
  if (totalOut <= 0) return null;
  const averageDailyOut = totalOut / 30;
  const leadTimeDays = Number(product.leadTimeDays ?? 7);
  const safetyStock = Number(product.safetyStock ?? product.minimumStock);
  const reorderPoint = (averageDailyOut * leadTimeDays) + safetyStock;
  const currentQuantity = Number(product.currentQuantity);
  if (currentQuantity > reorderPoint) return null;
  return { currentQuantity, averageDailyOut, leadTimeDays, safetyStock, reorderPoint, suggestedQuantity: Math.ceil(Math.max(0, reorderPoint + safetyStock - currentQuantity)), eventCount: outputs.length, confidence: outputs.length < 5 ? "low" : "medium", sourceIds: outputs.map(({ id }) => id) };
}

function signal({ id, type, severity, product, summary, evidence, explanation, consequence, suggestedActions, sourceRecords, now }) {
  return freeze({
    id: `${type}:${product.id}`,
    type,
    severity,
    entityType: "product",
    entityId: product.id,
    title: type,
    summary,
    evidence: freeze(evidence),
    explanation: freeze({ rule: explanation, dataUsed: freeze(evidence), period: "CURRENT_LOCAL_SNAPSHOT", result: summary, limitations: freeze(["LOCAL_RECORDS_ONLY"]) }),
    consequence,
    suggestedActions: freeze(suggestedActions),
    confidence: "high",
    createdAt: now.toISOString(),
    expiresAt: null,
    lineage: freeze({ calculation: type, sourceRecords: freeze(sourceRecords) }),
  });
}

export function buildIntelligenceSignals({ products, movements, now = new Date() }) {
  const active = products.filter((product) => !product.archivedAt);
  const result = [];
  for (const product of active) {
    const status = getInventoryStatus(product.currentQuantity, product.minimumStock);
    const sources = [{ entityType: "product", id: product.id }, ...movements.filter((movement) => movement.productId === product.id).map(({ id }) => ({ entityType: "movement", id }))];
    if (status === "out") result.push(signal({ id: product.id, type: "risk", severity: "critical", product, summary: "OUT_OF_STOCK", evidence: { currentQuantity: Number(product.currentQuantity), minimumStock: Number(product.minimumStock) }, explanation: "currentQuantity is zero", consequence: "Sales or operations may be blocked.", suggestedActions: ["REPLENISH_PRODUCT"], sourceRecords: sources, now }));
    else if (status === "critical") result.push(signal({ id: product.id, type: "risk", severity: "high", product, summary: "AT_OR_BELOW_MINIMUM", evidence: { currentQuantity: Number(product.currentQuantity), minimumStock: Number(product.minimumStock) }, explanation: "currentQuantity is at or below minimumStock", consequence: "A new withdrawal can cause a stockout.", suggestedActions: ["PLAN_REPLENISHMENT"], sourceRecords: sources, now }));
    else if (isStoppedProduct(product, movements, now)) result.push(signal({ id: product.id, type: "inactivity", severity: "medium", product, summary: "NO_OUTPUT_IN_30_DAYS", evidence: { currentQuantity: Number(product.currentQuantity), windowDays: 30 }, explanation: "positive stock and no OUT movement in the last 30 days", consequence: "Capital may remain tied to idle stock.", suggestedActions: ["REVIEW_DEMAND"], sourceRecords: sources, now }));
    const unusualOutput = movements.filter((movement) => movement.productId === product.id && movement.type === "OUT").sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))[0];
    if (unusualOutput && Number(unusualOutput.quantity) >= Math.max(1, Number(product.minimumStock) * 2)) result.push(signal({ id: product.id, type: "anomaly", severity: "medium", product, summary: "UNUSUALLY_LARGE_OUTPUT", evidence: { outputQuantity: Number(unusualOutput.quantity), threshold: Math.max(1, Number(product.minimumStock) * 2), movementId: unusualOutput.id }, explanation: "latest OUT quantity is at least twice the configured minimum stock", consequence: "The withdrawal may require verification or replenishment planning.", suggestedActions: ["VERIFY_MOVEMENT", "REVIEW_REPLENISHMENT"], sourceRecords: sources, now }));
    const reorder = reorderRecommendation(product, movements, now);
    if (reorder) result.push(signal({ id: product.id, type: "reorder", severity: "medium", product, summary: "CONSIDER_REPLENISHMENT", evidence: reorder, explanation: "current quantity is at or below demand during lead time plus safety stock", consequence: "Stock can reach its safety level before the next replenishment.", suggestedActions: ["REVIEW_REORDER_SUGGESTION"], sourceRecords: [{ entityType: "product", id: product.id }, ...reorder.sourceIds.map((id) => ({ entityType: "movement", id }))], now }));
  }
  return freeze(result.sort((a, b) => a.id.localeCompare(b.id)));
}

export class IntelligenceService {
  constructor({ provider, now = () => new Date() }) { if (!provider) throw new TypeError("IntelligenceService requires a DataProvider."); this.provider = provider; this.now = now; }
  async listByWorkspace(workspaceId) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    const [products, movements] = await Promise.all([this.provider.getAll("products", { index: "workspaceId", query: workspaceId }), this.provider.getAll("movements", { index: "workspaceId", query: workspaceId })]);
    return buildIntelligenceSignals({ products, movements, now: this.now() });
  }
}
