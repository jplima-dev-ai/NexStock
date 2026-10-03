import { assertStoreName, DATA_STORES, DataProvider } from "./data-provider.js";
import { DATABASE_VERSION, runMigrations } from "./migrations/index.js";

export const DATABASE_NAME = "nexstock-db";

export class StorageUnavailableError extends Error {
  constructor(message = "IndexedDB is not available.", options) {
    super(message, options);
    this.name = "StorageUnavailableError";
  }
}

export class StockConflictError extends Error {
  constructor(message = "Stock changed after the impact preview.") {
    super(message);
    this.name = "StockConflictError";
  }
}

export class WorkspaceConflictError extends Error {
  constructor(message = "Workspace changed after the backup preview.") {
    super(message);
    this.name = "WorkspaceConflictError";
  }
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

function transactionToPromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed."));
  });
}

const WORKSPACE_STORES = DATA_STORES.filter((storeName) => !["meta", "workspaces"].includes(storeName));

export class IndexedDBProvider extends DataProvider {
  #database = null;

  constructor({
    indexedDBFactory = globalThis.indexedDB,
    databaseName = DATABASE_NAME,
    version = DATABASE_VERSION,
    onBlocked = () => {},
    onVersionChange = () => {},
  } = {}) {
    super();
    this.indexedDBFactory = indexedDBFactory;
    this.databaseName = databaseName;
    this.version = version;
    this.onBlocked = onBlocked;
    this.onVersionChange = onVersionChange;
    this.supportsAtomicMediaRestore = true;
  }

  async open() {
    if (this.#database) return this;
    if (!this.indexedDBFactory?.open) throw new StorageUnavailableError();

    const request = this.indexedDBFactory.open(this.databaseName, this.version);
    request.onupgradeneeded = (event) => {
      runMigrations({
        database: request.result,
        transaction: request.transaction,
        oldVersion: event.oldVersion,
      });
    };
    request.onblocked = () => this.onBlocked();

    try {
      this.#database = await requestToPromise(request);
    } catch (error) {
      throw new StorageUnavailableError("NexStock could not open its local database.", { cause: error });
    }

    this.#database.onversionchange = () => {
      this.close();
      this.onVersionChange();
    };
    return this;
  }

  close() {
    this.#database?.close();
    this.#database = null;
  }

  #requireDatabase() {
    if (!this.#database) throw new StorageUnavailableError("The local database is not open.");
    return this.#database;
  }

  async #singleRequest(storeName, mode, createRequest) {
    assertStoreName(storeName);
    const transaction = this.#requireDatabase().transaction(storeName, mode);
    const completion = transactionToPromise(transaction);
    const request = createRequest(transaction.objectStore(storeName));
    const result = await requestToPromise(request);
    await completion;
    return result;
  }

  async get(storeName, key) {
    return this.#singleRequest(storeName, "readonly", (store) => store.get(key));
  }

  async getAll(storeName, { index, query } = {}) {
    return this.#singleRequest(storeName, "readonly", (store) => (
      index ? store.index(index).getAll(query) : store.getAll(query)
    ));
  }

  async count(storeName, { index, query } = {}) {
    return this.#singleRequest(storeName, "readonly", (store) => (
      index ? store.index(index).count(query) : store.count(query)
    ));
  }

  async put(storeName, value) {
    return this.#singleRequest(storeName, "readwrite", (store) => store.put(value));
  }

  async bulkPut(collections) {
    const entries = Object.entries(collections).filter(([, values]) => values.length > 0);
    if (entries.length === 0) return;
    const storeNames = entries.map(([storeName]) => assertStoreName(storeName));
    const transaction = this.#requireDatabase().transaction(storeNames, "readwrite");
    const completion = transactionToPromise(transaction);
    for (const [storeName, values] of entries) {
      const store = transaction.objectStore(storeName);
      for (const value of values) store.put(value);
    }
    await completion;
  }

  async applyStockMovement({
    workspaceId,
    productId,
    expectedBeforeQuantity,
    afterQuantity,
    movement,
    audit,
  }) {
    if (!workspaceId || !productId || !movement?.id || !audit?.id) {
      throw new TypeError("A complete stock movement transaction is required.");
    }
    if (!Number.isFinite(afterQuantity) || afterQuantity < 0) {
      throw new RangeError("Stock cannot be negative.");
    }

    const transaction = this.#requireDatabase().transaction(
      ["products", "movements", "auditLogs"],
      "readwrite",
    );
    const completion = transactionToPromise(transaction);

    try {
      const products = transaction.objectStore("products");
      const current = await requestToPromise(products.get(productId));
      if (!current || current.workspaceId !== workspaceId || current.archivedAt) {
        throw new RangeError("Active product not found in this workspace.");
      }
      if (Number(current.currentQuantity) !== Number(expectedBeforeQuantity)) {
        throw new StockConflictError();
      }

      const timestamp = movement.createdAt;
      const product = { ...current, currentQuantity: afterQuantity, updatedAt: timestamp };
      const storedMovement = {
        ...movement,
        workspaceId,
        productId,
        beforeQuantity: Number(current.currentQuantity),
        afterQuantity,
      };
      const storedAudit = {
        ...audit,
        workspaceId,
        entityType: "product",
        entityId: productId,
        beforeData: current,
        afterData: product,
      };

      products.put(product);
      transaction.objectStore("movements").put(storedMovement);
      transaction.objectStore("auditLogs").put(storedAudit);
      await completion;
      return { product, movement: storedMovement, audit: storedAudit };
    } catch (error) {
      try { transaction.abort(); } catch { /* The transaction may already be inactive. */ }
      await completion.catch(() => {});
      throw error;
    }
  }

  async applyStockReversal({ workspaceId, productId, originalMovementId, expectedBeforeQuantity, afterQuantity, movement, audit }) {
    if (!workspaceId || !productId || !originalMovementId || !movement?.id || !audit?.id) throw new TypeError("A complete stock reversal transaction is required.");
    if (!Number.isFinite(afterQuantity) || afterQuantity < 0) throw new RangeError("Stock cannot be negative.");
    const transaction = this.#requireDatabase().transaction(["products", "movements", "auditLogs"], "readwrite");
    const completion = transactionToPromise(transaction);
    try {
      const products = transaction.objectStore("products");
      const current = await requestToPromise(products.get(productId));
      const original = await requestToPromise(transaction.objectStore("movements").get(originalMovementId));
      if (!current || current.workspaceId !== workspaceId || current.archivedAt || !original || original.workspaceId !== workspaceId || original.productId !== productId) throw new RangeError("Movement or active product not found in this workspace.");
      if (!new Set(["IN", "OUT"]).has(original.type) || movement.reversalOfMovementId !== originalMovementId) throw new RangeError("Movement is not eligible for reversal.");
      const movements = await requestToPromise(transaction.objectStore("movements").index("workspaceId").getAll(workspaceId));
      if (movements.some((item) => item.reversalOfMovementId === originalMovementId)) throw new RangeError("Movement has already been reversed.");
      if (Number(current.currentQuantity) !== Number(expectedBeforeQuantity)) throw new StockConflictError();
      const product = { ...current, currentQuantity: afterQuantity, updatedAt: movement.createdAt };
      const storedMovement = { ...movement, workspaceId, productId, beforeQuantity: Number(current.currentQuantity), afterQuantity };
      const storedAudit = { ...audit, workspaceId, entityType: "product", entityId: productId, beforeData: current, afterData: product };
      products.put(product); transaction.objectStore("movements").put(storedMovement); transaction.objectStore("auditLogs").put(storedAudit);
      await completion; return { product, movement: storedMovement, audit: storedAudit };
    } catch (error) { try { transaction.abort(); } catch {} await completion.catch(() => {}); throw error; }
  }

  async delete(storeName, key) {
    return this.#singleRequest(storeName, "readwrite", (store) => store.delete(key));
  }

  async deleteWorkspace(workspaceId) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    const storeNames = ["workspaces", ...WORKSPACE_STORES];
    const transaction = this.#requireDatabase().transaction(storeNames, "readwrite");
    const completion = transactionToPromise(transaction);
    transaction.objectStore("workspaces").delete(workspaceId);

    for (const storeName of WORKSPACE_STORES) {
      const index = transaction.objectStore(storeName).index("workspaceId");
      const request = index.openKeyCursor(globalThis.IDBKeyRange?.only(workspaceId) ?? workspaceId);
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        transaction.objectStore(storeName).delete(cursor.primaryKey);
        cursor.continue();
      };
    }
    await completion;
  }

  async #replaceWorkspace({ workspaceId, expectedUpdatedAt, collections, mediaRecords = null }) {
    if (!workspaceId || !collections?.workspaces?.length) {
      throw new TypeError("A complete workspace backup is required.");
    }
    if (mediaRecords !== null && !Array.isArray(mediaRecords)) throw new TypeError("Media records must be an array.");
    const allCollections = mediaRecords === null ? collections : { ...collections, media: mediaRecords };
    const storeNames = Object.keys(allCollections).map(assertStoreName);
    const transaction = this.#requireDatabase().transaction(storeNames, "readwrite");
    const completion = transactionToPromise(transaction);

    try {
      const current = await requestToPromise(transaction.objectStore("workspaces").get(workspaceId));
      if (!current || (expectedUpdatedAt && current.updatedAt !== expectedUpdatedAt)) {
        throw new WorkspaceConflictError();
      }

      await Promise.all(storeNames.filter((name) => name !== "workspaces").map((storeName) => new Promise((resolve, reject) => {
        const store = transaction.objectStore(storeName);
        const request = store.index("workspaceId").openCursor(globalThis.IDBKeyRange?.only(workspaceId) ?? workspaceId);
        request.onerror = () => reject(request.error ?? new Error("Workspace cleanup failed."));
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) { resolve(); return; }
          cursor.delete();
          cursor.continue();
        };
      })));

      for (const [storeName, records] of Object.entries(allCollections)) {
        const store = transaction.objectStore(storeName);
        for (const record of records) store.put(record);
      }
      await completion;
    } catch (error) {
      try { transaction.abort(); } catch { /* The transaction may already be inactive. */ }
      await completion.catch(() => {});
      throw error;
    }
  }

  async replaceWorkspaceData(options) {
    return this.#replaceWorkspace(options);
  }

  async replaceWorkspaceBackup(options) {
    return this.#replaceWorkspace(options);
  }
}
