export const PRODUCT_MEDIA_SCHEMA_VERSION = 4;

function contains(collection, value) {
  return typeof collection.contains === "function" ? collection.contains(value) : Array.from(collection).includes(value);
}

export function migrateToVersion4(database, transaction) {
  const store = contains(database.objectStoreNames, "media")
    ? transaction.objectStore("media")
    : database.createObjectStore("media", { keyPath: "id" });
  if (!contains(store.indexNames, "workspaceId")) store.createIndex("workspaceId", "workspaceId");
  if (!contains(store.indexNames, "productId")) store.createIndex("productId", "productId");
}
