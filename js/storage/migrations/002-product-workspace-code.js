export const PRODUCT_CODE_SCHEMA_VERSION = 2;

export function migrateToVersion2(transaction) {
  const products = transaction.objectStore("products");
  if (!products.indexNames.contains("workspaceNexCode")) {
    products.createIndex("workspaceNexCode", ["workspaceId", "nexCode"], { unique: true });
  }
}
