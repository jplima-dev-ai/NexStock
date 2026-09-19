import test from "node:test";
import assert from "node:assert/strict";
import { DATA_STORES, DataProvider } from "../../js/storage/data-provider.js";
import { ProductService } from "../../js/services/product-service.js";
import { WorkspaceService } from "../../js/services/workspace-service.js";

class PersistentTestProvider extends DataProvider {
  constructor(database) {
    super();
    this.database = database;
  }
  async open() { return this; }
  close() {}
  async get(store, key) { return this.database.get(store).get(key) ?? null; }
  async getAll(store, { index, query } = {}) {
    return [...this.database.get(store).values()].filter((value) => !index || value[index] === query);
  }
  async count(store, options) { return (await this.getAll(store, options)).length; }
  async put(store, value) { this.database.get(store).set(value.id ?? value.key, structuredClone(value)); }
  async bulkPut(collections) {
    for (const [store, values] of Object.entries(collections)) {
      for (const value of values) await this.put(store, value);
    }
  }
  async delete(store, key) { this.database.get(store).delete(key); }
  async deleteWorkspace(workspaceId) {
    for (const store of this.database.values()) {
      for (const [key, value] of store) {
        if (value.id === workspaceId || value.workspaceId === workspaceId) store.delete(key);
      }
    }
  }
}

const technologySeed = {
  profileKey: "technology",
  workspace: { name: "NexStock Tecnologia", currency: "BRL", timezone: "America/Sao_Paulo" },
  categories: [{ key: "computing", name: "Computação", code: "COMP" }],
  suppliers: [{ key: "aster", name: "Aster Circuitos" }],
  products: ["Orion Notebook", "Quantum SSD", "NovaMesh Router", "Orbit Keyboard", "Pulse Headset"]
    .map((name, index) => ({ key: `product-${index}`, name, categoryKey: "computing", supplierKey: "aster" })),
};

function createDatabase() {
  return new Map(DATA_STORES.map((store) => [store, new Map()]));
}

function createService(provider, start = 0) {
  let sequence = start;
  return new WorkspaceService({
    provider,
    seedLoader: async () => structuredClone(technologySeed),
    idFactory: () => `id-${sequence += 1}`,
    now: () => "2026-09-18T12:00:00.000Z",
  });
}

test("workspace e produtos sobrevivem ao fechamento e à reabertura do provider", async () => {
  const database = createDatabase();
  const firstProvider = new PersistentTestProvider(database);
  await firstProvider.open();
  const created = await createService(firstProvider).createDemoWorkspace("technology");
  firstProvider.close();

  const reopenedProvider = new PersistentTestProvider(database);
  await reopenedProvider.open();
  const restored = await createService(reopenedProvider, 100).restoreActiveWorkspace();
  const products = await new ProductService({ provider: reopenedProvider }).listByWorkspace(restored.id);
  assert.equal(restored.id, created.id);
  assert.equal(products.length, 5);
  assert.equal(products[0].workspaceId, created.id);
});

test("reset remove somente o workspace ativo e recria seu seed", async () => {
  const database = createDatabase();
  const provider = new PersistentTestProvider(database);
  const service = createService(provider);
  const first = await service.createDemoWorkspace("technology", {
    profileSettings: { prefix: "NX", modules: ["serial"] },
    customFieldDefinitions: [{
      key: "model",
      label: "Modelo",
      type: "text",
      required: true,
      searchable: true,
      enabled: true,
    }],
  });
  const reset = await service.resetActiveWorkspace();
  assert.notEqual(reset.id, first.id);
  assert.equal(await provider.get("workspaces", first.id), null);
  assert.equal((await new ProductService({ provider }).listByWorkspace(reset.id)).length, 5);
  assert.deepEqual((await provider.get("settings", `profile-settings-${reset.id}`)).value, {
    prefix: "NX",
    modules: ["serial"],
  });
  assert.equal((await provider.getAll("customFieldDefinitions", { index: "workspaceId", query: reset.id }))[0].key, "model");
});

test("ponteiro órfão é removido com segurança", async () => {
  const database = createDatabase();
  const provider = new PersistentTestProvider(database);
  await provider.put("settings", { id: "active-workspace", workspaceId: "missing" });
  assert.equal(await createService(provider).restoreActiveWorkspace(), null);
  assert.equal(await provider.get("settings", "active-workspace"), null);
});
