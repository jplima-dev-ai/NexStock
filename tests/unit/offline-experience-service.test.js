import test from "node:test";
import assert from "node:assert/strict";
import { getOfflineExperienceFacts } from "../../js/services/offline-experience-service.js";

test("experiência offline distingue conexão, gravação local e sincronização", () => {
  assert.deepEqual(getOfflineExperienceFacts({ connection: "online", persistence: "ready" }), {
    connection: "online", storage: "savedLocally", synchronization: "notConfigured",
  });
  assert.equal(getOfflineExperienceFacts({ connection: "offline", persistence: "ready" }).connection, "offline");
  assert.equal(getOfflineExperienceFacts({ persistence: "unavailable" }).connection, "needsAttention");
  assert.equal(getOfflineExperienceFacts({ persistence: "ready", syncState: "syncing" }).synchronization, "syncing");
});
