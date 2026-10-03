export const DATA_STORES = Object.freeze([
  "meta",
  "workspaces",
  "categories",
  "suppliers",
  "products",
  "media",
  "productUnits",
  "batches",
  "movements",
  "auditLogs",
  "productRelations",
  "kits",
  "kitItems",
  "customFieldDefinitions",
  "settings",
  "syncQueue",
]);

const STORE_SET = new Set(DATA_STORES);

export function assertStoreName(storeName) {
  if (!STORE_SET.has(storeName)) throw new RangeError(`Unknown data store: ${storeName}`);
  return storeName;
}

function notImplemented(method) {
  throw new Error(`DataProvider.${method} must be implemented.`);
}

export class DataProvider {
  async open() { return notImplemented("open"); }
  close() { return notImplemented("close"); }
  async get() { return notImplemented("get"); }
  async getAll() { return notImplemented("getAll"); }
  async count() { return notImplemented("count"); }
  async put() { return notImplemented("put"); }
  async bulkPut() { return notImplemented("bulkPut"); }
  async applyStockMovement() { return notImplemented("applyStockMovement"); }
  async applyStockReversal() { return notImplemented("applyStockReversal"); }
  async delete() { return notImplemented("delete"); }
  async deleteWorkspace() { return notImplemented("deleteWorkspace"); }
  async replaceWorkspaceData() { return notImplemented("replaceWorkspaceData"); }
  async replaceWorkspaceBackup() { return notImplemented("replaceWorkspaceBackup"); }
}
