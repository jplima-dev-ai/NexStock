import test from "node:test";
import assert from "node:assert/strict";
import { assertStoreName, DATA_STORES, DataProvider } from "../../js/storage/data-provider.js";
import { IndexedDBProvider, StorageUnavailableError } from "../../js/storage/indexeddb-provider.js";

test("DataProvider expõe os quinze stores oficiais", () => {
  assert.equal(DATA_STORES.length, 15);
  assert.equal(assertStoreName("products"), "products");
  assert.throws(() => assertStoreName("unknown"), RangeError);
});

test("contrato base exige implementação concreta", async () => {
  const provider = new DataProvider();
  await assert.rejects(provider.open(), /must be implemented/u);
  await assert.rejects(provider.get("products", "one"), /must be implemented/u);
  assert.throws(() => provider.close(), /must be implemented/u);
});

test("IndexedDBProvider falha de forma explícita quando IndexedDB não existe", async () => {
  const provider = new IndexedDBProvider({ indexedDBFactory: null });
  await assert.rejects(provider.open(), StorageUnavailableError);
});
