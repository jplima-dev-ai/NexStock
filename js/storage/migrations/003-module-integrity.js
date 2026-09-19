export const MODULE_INTEGRITY_SCHEMA_VERSION = 3;

function ensureIndex(store, name, keyPath, options) {
  if (!store.indexNames.contains(name)) store.createIndex(name, keyPath, options);
}

export function migrateToVersion3(transaction) {
  ensureIndex(transaction.objectStore("productUnits"), "workspaceSerial", ["workspaceId", "serialNumber"], { unique: true });
  ensureIndex(transaction.objectStore("batches"), "productBatch", ["productId", "batchNumber"], { unique: true });
}
