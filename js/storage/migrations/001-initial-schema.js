export const INITIAL_SCHEMA_VERSION = 1;

export const STORE_DEFINITIONS = Object.freeze({
  meta: Object.freeze({ keyPath: "key", indexes: [] }),
  workspaces: Object.freeze({ keyPath: "id", indexes: [["profileKey", "profileKey"]] }),
  categories: Object.freeze({ keyPath: "id", indexes: [["workspaceId", "workspaceId"]] }),
  suppliers: Object.freeze({ keyPath: "id", indexes: [["workspaceId", "workspaceId"]] }),
  products: Object.freeze({
    keyPath: "id",
    indexes: [["workspaceId", "workspaceId"], ["categoryId", "categoryId"], ["supplierId", "supplierId"], ["nexCode", "nexCode"]],
  }),
  media: Object.freeze({ keyPath: "id", indexes: [["workspaceId", "workspaceId"], ["productId", "productId"]] }),
  productUnits: Object.freeze({
    keyPath: "id",
    indexes: [["workspaceId", "workspaceId"], ["productId", "productId"], ["serialNumber", "serialNumber"]],
  }),
  batches: Object.freeze({
    keyPath: "id",
    indexes: [["workspaceId", "workspaceId"], ["productId", "productId"], ["expiryDate", "expiryDate"]],
  }),
  movements: Object.freeze({
    keyPath: "id",
    indexes: [["workspaceId", "workspaceId"], ["productId", "productId"], ["createdAt", "createdAt"]],
  }),
  auditLogs: Object.freeze({
    keyPath: "id",
    indexes: [["workspaceId", "workspaceId"], ["entityId", "entityId"], ["createdAt", "createdAt"]],
  }),
  productRelations: Object.freeze({
    keyPath: "id",
    indexes: [["workspaceId", "workspaceId"], ["sourceProductId", "sourceProductId"], ["targetProductId", "targetProductId"]],
  }),
  kits: Object.freeze({ keyPath: "id", indexes: [["workspaceId", "workspaceId"]] }),
  kitItems: Object.freeze({ keyPath: "id", indexes: [["workspaceId", "workspaceId"], ["kitId", "kitId"], ["productId", "productId"]] }),
  customFieldDefinitions: Object.freeze({
    keyPath: "id",
    indexes: [["workspaceId", "workspaceId"], ["profileKey", "profileKey"], ["key", "key"]],
  }),
  settings: Object.freeze({ keyPath: "id", indexes: [["workspaceId", "workspaceId"]] }),
  syncQueue: Object.freeze({
    keyPath: "id",
    indexes: [["workspaceId", "workspaceId"], ["status", "status"], ["createdAt", "createdAt"]],
  }),
});

function contains(collection, value) {
  return typeof collection.contains === "function"
    ? collection.contains(value)
    : Array.from(collection).includes(value);
}

export function migrateToVersion1(database, transaction) {
  for (const [storeName, definition] of Object.entries(STORE_DEFINITIONS)) {
    const store = contains(database.objectStoreNames, storeName)
      ? transaction.objectStore(storeName)
      : database.createObjectStore(storeName, { keyPath: definition.keyPath });

    for (const [indexName, keyPath, options = {}] of definition.indexes) {
      if (!contains(store.indexNames, indexName)) store.createIndex(indexName, keyPath, options);
    }
  }
}
