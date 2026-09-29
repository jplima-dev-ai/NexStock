import { BACKUP_STORES, validateBackup } from "./backup-service.js";

function recordsById(records) {
  return new Map(records.map((record) => [record.id, record]));
}

function sameRecord(before, after) {
  return JSON.stringify(before) === JSON.stringify(after);
}

/** Certifica que um backup legado continua íntegro após um upgrade aditivo. */
export function certifyWorkspaceUpgrade({ beforeBackup, afterBackup }) {
  const before = validateBackup(beforeBackup);
  const after = validateBackup(afterBackup);
  if (before.workspace.id !== after.workspace.id) throw new RangeError("Workspace identity changed during upgrade.");
  const preserved = {};
  for (const storeName of BACKUP_STORES) {
    const beforeRecords = recordsById(before.backup.data[storeName]);
    const afterRecords = recordsById(after.backup.data[storeName]);
    for (const [id, record] of beforeRecords) {
      const upgraded = afterRecords.get(id);
      if (!upgraded) throw new RangeError(`Upgrade lost ${storeName}:${id}.`);
      if (!sameRecord(record, upgraded)) throw new RangeError(`Upgrade changed ${storeName}:${id}.`);
    }
    preserved[storeName] = beforeRecords.size;
  }
  return Object.freeze({
    workspaceId: before.workspace.id,
    fromVersion: before.backup.appVersion,
    toVersion: after.backup.appVersion,
    policy: "additiveOnly",
    preserved: Object.freeze(preserved),
    totalRecords: before.totalRecords,
  });
}
