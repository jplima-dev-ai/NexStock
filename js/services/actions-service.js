const LEVEL_BY_SEVERITY = Object.freeze({ critical: "high", high: "high", medium: "medium", low: "informative" });

export function buildActionCenter(signals) {
  return Object.freeze(signals.map((signal) => Object.freeze({
    id: `action:${signal.id}`,
    level: LEVEL_BY_SEVERITY[signal.severity] ?? "informative",
    situation: signal.summary,
    explanation: signal.explanation.rule,
    consequence: signal.consequence,
    action: signal.suggestedActions[0] ?? "REVIEW_SIGNAL",
    entityId: signal.entityId,
    lineage: signal.lineage,
    requiresConfirmation: false,
    execution: "REVIEW_ONLY",
  })).sort((first, second) => first.level.localeCompare(second.level) || first.id.localeCompare(second.id)));
}
