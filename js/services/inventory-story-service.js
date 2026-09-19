function currentStateKey(snapshot) {
  if (snapshot.counts.out > 0) return "out";
  if (snapshot.counts.critical > 0) return "critical";
  if (snapshot.counts.attention > 0) return "attention";
  if (snapshot.counts.stopped > 0) return "stopped";
  return "healthy";
}

function nextStepKey(snapshot) {
  if (snapshot.counts.out > 0) return "replenishOut";
  if (snapshot.counts.critical > 0) return "replenishCritical";
  if (snapshot.counts.attention > 0) return "reviewAttention";
  if (snapshot.counts.stopped > 0) return "reviewStopped";
  return "keepMonitoring";
}

export function buildInventoryStory(snapshot) {
  if (!snapshot || !snapshot.metrics || !snapshot.counts) {
    throw new TypeError("A dashboard snapshot is required.");
  }
  const state = currentStateKey(snapshot);
  const paragraphs = [
    Object.freeze({ key: `inventoryStory.state.${state}`, parameters: Object.freeze({
      products: snapshot.metrics.products,
      units: snapshot.metrics.totalUnits,
      count: snapshot.counts[state] ?? 0,
    }) }),
    Object.freeze({
      key: snapshot.metrics.movementsLast30Days > 0 ? "inventoryStory.movements.recorded" : "inventoryStory.movements.none",
      parameters: Object.freeze({ count: snapshot.metrics.movementsLast30Days }),
    }),
  ];
  if (snapshot.lowestForecast) {
    paragraphs.push(Object.freeze({
      key: "inventoryStory.forecast.available",
      parameters: Object.freeze({ name: snapshot.lowestForecast.productName, days: Math.round(snapshot.lowestForecast.daysRemaining) }),
    }));
  } else {
    paragraphs.push(Object.freeze({ key: "inventoryStory.forecast.unavailable", parameters: Object.freeze({}) }));
  }
  paragraphs.push(Object.freeze({ key: `inventoryStory.next.${nextStepKey(snapshot)}`, parameters: Object.freeze({}) }));
  return Object.freeze(paragraphs);
}
