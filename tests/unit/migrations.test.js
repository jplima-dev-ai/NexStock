import test from "node:test";
import assert from "node:assert/strict";
import { DATA_STORES } from "../../js/storage/data-provider.js";
import { migrateToVersion1, STORE_DEFINITIONS } from "../../js/storage/migrations/001-initial-schema.js";
import { migrateToVersion2 } from "../../js/storage/migrations/002-product-workspace-code.js";
import { migrateToVersion3 } from "../../js/storage/migrations/003-module-integrity.js";

function createNameList(values = []) {
  const names = new Set(values);
  return {
    add: (value) => names.add(value),
    contains: (value) => names.has(value),
    values: () => [...names],
    [Symbol.iterator]: () => names[Symbol.iterator](),
  };
}

function createFakeSchema() {
  const stores = new Map();
  const objectStoreNames = createNameList();
  const createStore = (name, options) => {
    const indexNames = createNameList();
    const store = {
      name,
      keyPath: options.keyPath,
      indexNames,
      createIndex(indexName) { indexNames.add(indexName); },
    };
    stores.set(name, store);
    objectStoreNames.add(name);
    return store;
  };
  return {
    database: { objectStoreNames, createObjectStore: createStore },
    transaction: { objectStore: (name) => stores.get(name) },
    stores,
  };
}

test("migração inicial cria todos os stores e índices sem remoção", () => {
  const schema = createFakeSchema();
  migrateToVersion1(schema.database, schema.transaction);
  assert.deepEqual(schema.database.objectStoreNames.values(), DATA_STORES);
  for (const [name, definition] of Object.entries(STORE_DEFINITIONS)) {
    assert.equal(schema.stores.get(name).keyPath, definition.keyPath);
    assert.deepEqual(
      schema.stores.get(name).indexNames.values(),
      definition.indexes.map(([indexName]) => indexName),
    );
  }
  assert.equal("deleteObjectStore" in schema.database, false);
});

test("migração pode ser reaplicada sem duplicar estruturas", () => {
  const schema = createFakeSchema();
  migrateToVersion1(schema.database, schema.transaction);
  migrateToVersion1(schema.database, schema.transaction);
  assert.equal(schema.stores.size, DATA_STORES.length);
});

test("migração dois cria unicidade composta de NexCode por workspace", () => {
  const calls = [];
  const store = { indexNames: { contains: () => false }, createIndex: (...args) => calls.push(args) };
  migrateToVersion2({ objectStore: (name) => { assert.equal(name, "products"); return store; } });
  assert.deepEqual(calls, [["workspaceNexCode", ["workspaceId", "nexCode"], { unique: true }]]);
});

test("migração três cria unicidade de serial e lote", () => {
  const calls = [];
  const stores = { productUnits: { indexNames: { contains: () => false }, createIndex: (...args) => calls.push(["productUnits", ...args]) }, batches: { indexNames: { contains: () => false }, createIndex: (...args) => calls.push(["batches", ...args]) } };
  migrateToVersion3({ objectStore: (name) => stores[name] });
  assert.deepEqual(calls, [
    ["productUnits", "workspaceSerial", ["workspaceId", "serialNumber"], { unique: true }],
    ["batches", "productBatch", ["productId", "batchNumber"], { unique: true }],
  ]);
});
