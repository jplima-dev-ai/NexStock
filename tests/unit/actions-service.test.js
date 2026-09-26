import test from "node:test";
import assert from "node:assert/strict";
import { buildActionCenter } from "../../js/services/actions-service.js";

test("central de prioridades explica e recomenda sem executar ação", () => {
  const [action] = buildActionCenter([{ id: "risk:a", severity: "critical", summary: "OUT_OF_STOCK", explanation: { rule: "quantity is zero" }, consequence: "Operations may stop.", suggestedActions: ["REPLENISH_PRODUCT"], entityId: "a", lineage: { sourceRecords: [] } }]);
  assert.deepEqual({ level: action.level, action: action.action, execution: action.execution, requiresConfirmation: action.requiresConfirmation }, { level: "high", action: "REPLENISH_PRODUCT", execution: "REVIEW_ONLY", requiresConfirmation: false });
  assert.equal(action.explanation, "quantity is zero");
});
