import test from "node:test";
import assert from "node:assert/strict";
import { buildIntelligenceSignals } from "../../js/services/intelligence-service.js";

const now = new Date("2026-09-25T12:00:00.000Z");
const product = (id, quantity, minimum = 5) => ({ id, workspaceId: "w", name: id, currentQuantity: quantity, minimumStock: minimum, createdAt: "2026-01-01T00:00:00.000Z" });

test("sinais de inteligência são determinísticos, explicáveis e rastreáveis", () => {
  const signals = buildIntelligenceSignals({ products: [product("out", 0), product("critical", 5)], movements: [], now });
  assert.deepEqual(signals.map(({ id, severity }) => ({ id, severity })), [{ id: "risk:critical", severity: "high" }, { id: "risk:out", severity: "critical" }]);
  for (const signal of signals) {
    assert.ok(signal.explanation.rule);
    assert.deepEqual(signal.lineage.sourceRecords, [{ entityType: "product", id: signal.entityId }]);
    assert.equal(Object.isFrozen(signal), true);
  }
});

test("anomalia de saída explica o limiar e a movimentação que a originou", () => {
  const signals = buildIntelligenceSignals({ products: [product("item", 20, 5)], movements: [{ id: "out-1", productId: "item", type: "OUT", quantity: 10, createdAt: "2026-09-24T12:00:00.000Z" }], now });
  const anomaly = signals.find(({ type }) => type === "anomaly");
  assert.equal(anomaly.summary, "UNUSUALLY_LARGE_OUTPUT");
  assert.equal(anomaly.evidence.threshold, 10);
  assert.equal(anomaly.evidence.movementId, "out-1");
});

test("reposição sugere quantidade, mas nunca executa uma compra", () => {
  const signals = buildIntelligenceSignals({ products: [product("item", 5, 5)], movements: [{ id: "out-1", productId: "item", type: "OUT", quantity: 30, createdAt: "2026-09-24T12:00:00.000Z" }], now });
  const reorder = signals.find(({ type }) => type === "reorder");
  assert.equal(reorder.summary, "CONSIDER_REPLENISHMENT");
  assert.equal(reorder.evidence.leadTimeDays, 7);
  assert.ok(reorder.evidence.suggestedQuantity > 0);
  assert.deepEqual(reorder.suggestedActions, ["REVIEW_REORDER_SUGGESTION"]);
});
