export const STORAGE_LIFECYCLE_POLICY = Object.freeze({
  cache: "versionedShell",
  data: "preservedUntilExplicitAction",
  media: "blobIncludedInBackup",
  backup: "manualUserExport",
  snapshots: "explicitRetention",
});

function optionalCount(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}

export function getStorageLifecycleFacts({ estimate, persisted, mediaCount, snapshotCount } = {}) {
  const usage = Number.isFinite(estimate?.usage) && estimate.usage >= 0 ? estimate.usage : null;
  const quota = Number.isFinite(estimate?.quota) && estimate.quota >= 0 ? estimate.quota : null;
  return Object.freeze({
    ...STORAGE_LIFECYCLE_POLICY,
    browserStorage: usage === null || quota === null ? "notReported" : "reported",
    persistence: persisted === true ? "persistent" : persisted === false ? "bestEffort" : "notReported",
    mediaCount: optionalCount(mediaCount),
    snapshotCount: optionalCount(snapshotCount),
    usage,
    quota,
  });
}

export class StorageLifecycleService {
  constructor({ storageManager = globalThis.navigator?.storage, mediaService, snapshotService } = {}) {
    this.storageManager = storageManager;
    this.mediaService = mediaService;
    this.snapshotService = snapshotService;
  }

  async getFacts(workspaceId) {
    const read = async (operation) => {
      if (typeof operation !== "function") return undefined;
      try { return await operation(); } catch { return undefined; }
    };
    const [estimate, persisted, media, snapshots] = await Promise.all([
      read(this.storageManager?.estimate?.bind(this.storageManager)),
      read(this.storageManager?.persisted?.bind(this.storageManager)),
      workspaceId && this.mediaService ? read(this.mediaService.listByWorkspace.bind(this.mediaService, workspaceId)) : undefined,
      workspaceId && this.snapshotService ? read(this.snapshotService.list.bind(this.snapshotService, workspaceId)) : undefined,
    ]);
    return getStorageLifecycleFacts({
      estimate,
      persisted,
      mediaCount: Array.isArray(media) ? media.length : undefined,
      snapshotCount: Array.isArray(snapshots) ? snapshots.length : undefined,
    });
  }
}
