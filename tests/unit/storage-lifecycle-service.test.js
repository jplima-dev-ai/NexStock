import test from "node:test";
import assert from "node:assert/strict";
import { getStorageLifecycleFacts, StorageLifecycleService } from "../../js/services/storage-lifecycle-service.js";

test("política de ciclo de armazenamento preserva dados e separa cache, mídia, backup e snapshots", () => {
  assert.deepEqual(getStorageLifecycleFacts({ estimate: { usage: 120, quota: 1000 }, persisted: true, mediaCount: 2, snapshotCount: 3 }), {
    cache: "versionedShell", data: "preservedUntilExplicitAction", media: "blobIncludedInBackup", backup: "manualUserExport", snapshots: "explicitRetention",
    browserStorage: "reported", persistence: "persistent", mediaCount: 2, snapshotCount: 3, usage: 120, quota: 1000,
  });
});

test("coleta fatos sem escrever e usa estados honestos quando a Storage API não responde", async () => {
  let mediaRead = 0; let snapshotsRead = 0;
  const service = new StorageLifecycleService({
    storageManager: { estimate: async () => { throw new Error("unavailable"); }, persisted: async () => false },
    mediaService: { listByWorkspace: async () => { mediaRead += 1; return [{ id: "m1" }]; } },
    snapshotService: { list: async () => { snapshotsRead += 1; return [{ id: "s1" }, { id: "s2" }]; } },
  });
  const facts = await service.getFacts("w1");
  assert.equal(facts.browserStorage, "notReported");
  assert.equal(facts.persistence, "bestEffort");
  assert.equal(facts.mediaCount, 1);
  assert.equal(facts.snapshotCount, 2);
  assert.equal(mediaRead, 1);
  assert.equal(snapshotsRead, 1);
});
