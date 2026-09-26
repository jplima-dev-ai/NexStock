import { APP_VERSION } from "../core/version.js";
import { BackupService, isLocalSnapshotSetting, validateBackup } from "./backup-service.js";

export const SNAPSHOT_SCHEMA = "nexstock-snapshot-v1";
export const MAX_LOCAL_SNAPSHOTS = 8;

function safeLabel(value, fallback) {
  const label = String(value ?? "").trim().replace(/\s+/gu, " ").slice(0, 80);
  return label || fallback;
}

function snapshotRecord(record) {
  if (!isLocalSnapshotSetting(record)) return null;
  const snapshot = record.value;
  if (snapshot.schema !== SNAPSHOT_SCHEMA || !snapshot.backup) return null;
  try {
    const validation = validateBackup(snapshot.backup, { expectedWorkspaceId: record.workspaceId });
    return Object.freeze({ id: record.id, workspaceId: record.workspaceId, ...snapshot, totalRecords: validation.totalRecords, counts: validation.counts });
  } catch { return null; }
}

export class SnapshotService {
  constructor({ provider, backupService = new BackupService({ provider }), idFactory = () => globalThis.crypto.randomUUID(), now = () => new Date() }) {
    if (!provider) throw new TypeError("SnapshotService requires a DataProvider.");
    this.provider = provider;
    this.backupService = backupService;
    this.idFactory = idFactory;
    this.now = now;
  }

  async list(workspaceId) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    const records = await this.provider.getAll("settings", { index: "workspaceId", query: workspaceId });
    return Object.freeze(records.map(snapshotRecord).filter(Boolean).sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt)));
  }

  async create(workspaceId, { label, reason = "manual" } = {}) {
    const current = await this.list(workspaceId);
    if (current.length >= MAX_LOCAL_SNAPSHOTS) throw new RangeError("Local snapshot limit reached.");
    const backup = await this.backupService.create(workspaceId);
    const createdAt = this.now().toISOString();
    const record = {
      id: `snapshot-${this.idFactory()}`,
      workspaceId,
      value: {
        type: "localSnapshot", schema: SNAPSHOT_SCHEMA, label: safeLabel(label, `Snapshot ${createdAt.slice(0, 10)}`),
        reason, createdAt, appVersion: APP_VERSION, backup: JSON.parse(backup.content),
      },
      updatedAt: createdAt,
    };
    await this.provider.put("settings", record);
    return snapshotRecord(record);
  }

  async remove(workspaceId, snapshotId) {
    const record = await this.provider.get("settings", snapshotId);
    if (!record || record.workspaceId !== workspaceId || !isLocalSnapshotSetting(record)) throw new RangeError("Snapshot not found.");
    await this.provider.delete("settings", snapshotId);
  }

  async restore(workspaceId, snapshotId) {
    const record = await this.provider.get("settings", snapshotId);
    const snapshot = snapshotRecord(record);
    if (!snapshot || snapshot.workspaceId !== workspaceId) throw new RangeError("Snapshot not found.");
    const inspection = await this.backupService.inspect(workspaceId, JSON.stringify(snapshot.backup));
    const safety = await this.create(workspaceId, { label: `Antes de restaurar: ${snapshot.label}`, reason: "before-snapshot-restore" });
    const workspace = await this.backupService.restore(workspaceId, inspection);
    return Object.freeze({ workspace, safety, snapshot });
  }
}
