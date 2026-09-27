export function getOfflineExperienceFacts({ connection = "online", persistence = "starting", syncState = "notConfigured" } = {}) {
  const needsAttention = persistence === "unavailable";
  return Object.freeze({
    connection: needsAttention ? "needsAttention" : connection,
    storage: persistence === "ready" ? "savedLocally" : "needsAttention",
    synchronization: syncState === "syncing" ? "syncing" : "notConfigured",
  });
}
