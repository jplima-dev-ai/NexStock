import test from "node:test";
import assert from "node:assert/strict";
import { BackupService, BACKUP_SCHEMA, BackupValidationError, parseBackupText, validateBackup } from "../../js/services/backup-service.js";

const stores = ["workspaces", "categories", "suppliers", "products", "productUnits", "batches", "movements", "auditLogs", "productRelations", "kits", "kitItems", "customFieldDefinitions", "settings"];

class MemoryProvider {
  constructor() { this.stores = new Map(stores.map((name) => [name, new Map()])); this.replacements = 0; }
  seed(name, records) { for (const record of records) this.stores.get(name).set(record.id, structuredClone(record)); }
  async get(name, id) { return structuredClone(this.stores.get(name).get(id) ?? null); }
  async getAll(name, { index, query } = {}) {
    const values = [...this.stores.get(name).values()];
    return structuredClone(index ? values.filter((record) => record[index] === query) : values);
  }
  async replaceWorkspaceData({ workspaceId, expectedUpdatedAt, collections }) {
    const current = await this.get("workspaces", workspaceId);
    if (current.updatedAt !== expectedUpdatedAt) throw new Error("conflict");
    for (const store of stores) {
      if (store === "workspaces") this.stores.get(store).set(workspaceId, structuredClone(collections[store][0]));
      else {
        for (const [id, record] of this.stores.get(store)) if (record.workspaceId === workspaceId) this.stores.get(store).delete(id);
        for (const record of collections[store]) this.stores.get(store).set(record.id, structuredClone(record));
      }
    }
    this.replacements += 1;
  }
}

class AtomicMediaProvider extends MemoryProvider {
  constructor() {
    super();
    this.stores.set("media", new Map());
    this.supportsAtomicMediaRestore = true;
    this.failMediaAt = 0;
  }

  async replaceWorkspaceBackup({ workspaceId, expectedUpdatedAt, collections, mediaRecords }) {
    const before = structuredClone(this.stores);
    try {
      const current = await this.get("workspaces", workspaceId);
      if (current.updatedAt !== expectedUpdatedAt) throw new Error("conflict");
      let mediaWrites = 0;
      for (const store of [...stores, "media"]) {
        if (store === "workspaces") this.stores.get(store).set(workspaceId, structuredClone(collections[store][0]));
        else {
          for (const [id, record] of this.stores.get(store)) if (record.workspaceId === workspaceId) this.stores.get(store).delete(id);
          for (const record of store === "media" ? mediaRecords : collections[store]) {
            if (store === "media" && this.failMediaAt && ++mediaWrites === this.failMediaAt) throw new Error("media write failed");
            this.stores.get(store).set(record.id, structuredClone(record));
          }
        }
      }
      this.replacements += 1;
    } catch (error) {
      this.stores = before;
      throw error;
    }
  }
}

function mediaSummary(provider, workspaceId) {
  return [...provider.stores.get("media").values()]
    .filter((record) => record.workspaceId === workspaceId)
    .map(({ id, workspaceId: recordWorkspaceId, productId, altText, mimeType }) => ({ id, workspaceId: recordWorkspaceId, productId, altText, mimeType }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

async function atomicMediaFixture() {
  const { provider: source } = fixture();
  const provider = new AtomicMediaProvider();
  for (const store of stores) provider.seed(store, [...source.stores.get(store).values()]);
  provider.seed("products", [{ id: "p2", workspaceId: "w1", nexCode: "NX-002", name: "Segundo produto", categoryId: "c1", supplierId: "s1", currentQuantity: 3 }]);
  provider.seed("media", [
    { id: "media-1", workspaceId: "w1", productId: "p1", altText: "Imagem original 1", mimeType: "image/png", blob: new Blob(["one"], { type: "image/png" }) },
    { id: "media-2", workspaceId: "w1", productId: "p2", altText: "Imagem original 2", mimeType: "image/png", blob: new Blob(["two"], { type: "image/png" }) },
    { id: "media-w2", workspaceId: "w2", productId: "outside", altText: "Outro espaço", mimeType: "image/png", blob: new Blob(["outside"], { type: "image/png" }) },
  ]);
  const mediaService = { listByWorkspace: (workspaceId) => provider.getAll("media", { index: "workspaceId", query: workspaceId }) };
  const service = new BackupService({ provider, mediaService, now: () => new Date("2026-09-25T12:00:00.000Z") });
  return { provider, service };
}

function fixture() {
  const provider = new MemoryProvider();
  provider.seed("workspaces", [{ id: "w1", name: "Loja Centro", updatedAt: "2026-09-20T00:00:00.000Z" }, { id: "w2", name: "Outro", updatedAt: "2026-09-20T00:00:00.000Z" }]);
  provider.seed("categories", [{ id: "c1", workspaceId: "w1", name: "Tecnologia" }]);
  provider.seed("suppliers", [{ id: "s1", workspaceId: "w1", name: "Fornecedor" }]);
  provider.seed("products", [{ id: "p1", workspaceId: "w1", nexCode: "NX-001", name: "Produto", categoryId: "c1", supplierId: "s1", currentQuantity: 5 }]);
  provider.seed("productUnits", [{ id: "u1", workspaceId: "w1", productId: "p1", serialNumber: "SER-1" }]);
  provider.seed("batches", [{ id: "b1", workspaceId: "w1", productId: "p1", batchNumber: "L-1", quantity: 5 }]);
  provider.seed("movements", [{ id: "m1", workspaceId: "w1", productId: "p1", type: "IN" }]);
  provider.seed("auditLogs", [{ id: "a1", workspaceId: "w1", entityId: "p1" }]);
  provider.seed("productRelations", [{ id: "r1", workspaceId: "w1", sourceProductId: "p1", targetProductId: "p1" }]);
  provider.seed("kits", [{ id: "k1", workspaceId: "w1", name: "Kit" }]);
  provider.seed("kitItems", [{ id: "ki1", workspaceId: "w1", kitId: "k1", productId: "p1", quantityRequired: 1 }]);
  provider.seed("customFieldDefinitions", [{ id: "f1", workspaceId: "w1", key: "cor" }]);
  provider.seed("settings", [{ id: "profile-settings-w1", workspaceId: "w1", value: {} }]);
  return { provider, service: new BackupService({ provider, now: () => new Date("2026-09-25T12:00:00.000Z") }) };
}

test("NexBackup inclui todo o estado persistente do workspace, sem dados de outro espaço", async () => {
  const { service } = fixture();
  const backup = await service.create("w1");
  const value = JSON.parse(backup.content);
  assert.equal(value.schema, BACKUP_SCHEMA);
  assert.equal(value.data.products.length, 1);
  assert.equal(value.data.kitItems[0].kitId, "k1");
  assert.equal(value.media.included, false);
  assert.equal(backup.totalRecords, 13);
});

test("prévia rejeita backup de outro workspace antes de qualquer escrita", async () => {
  const { service, provider } = fixture();
  const backup = await service.create("w1");
  await assert.rejects(service.inspect("w2", backup.content), BackupValidationError);
  assert.equal(provider.replacements, 0);
});

test("validação aceita uma coleção de mídia vazia e recusa manifesto inconsistente", async () => {
  const { service } = fixture();
  const broken = JSON.parse((await service.create("w1")).content);
  broken.data.movements[0].productId = "missing";
  assert.throws(() => validateBackup(broken), /unknown reference/u);
  broken.data.movements[0].productId = "p1";
  broken.media.included = true;
  assert.doesNotThrow(() => parseBackupText(JSON.stringify(broken)));
  broken.media.included = false;
  broken.media.records = [{ id: "media-1" }];
  assert.throws(() => parseBackupText(JSON.stringify(broken)), /Media records require/u);
});

test("NexBackup com serviço de mídia e nenhum arquivo mantém o manifesto restaurável", async () => {
  const { provider } = fixture();
  const mediaService = { async listByWorkspace() { return []; } };
  const service = new BackupService({ provider, mediaService, now: () => new Date("2026-09-25T12:00:00.000Z") });
  const backup = await service.create("w1");
  const parsed = JSON.parse(backup.content);
  assert.equal(parsed.media.included, true);
  assert.deepEqual(parsed.media.records, []);
  assert.doesNotThrow(() => parseBackupText(backup.content));
});

test("NexBackup serializa e restaura mídia sem Base64 no produto", async () => {
  const { provider } = fixture();
  const records = new Map([["p1", { id: "media-1", workspaceId: "w1", productId: "p1", altText: "SSD visto de frente", mimeType: "image/png", blob: new Blob(["image"], { type: "image/png" }) }]]);
  const mediaService = {
    async listByWorkspace(workspaceId) { return [...records.values()].filter((record) => record.workspaceId === workspaceId); },
    async remove(workspaceId, productId) { records.delete(productId); },
    async setImage({ workspaceId, productId, file, altText }) { records.set(productId, { id: "restored", workspaceId, productId, altText, mimeType: file.type, blob: file }); },
  };
  const service = new BackupService({ provider, mediaService, now: () => new Date("2026-09-25T12:00:00.000Z") });
  const backup = await service.create("w1");
  const parsed = JSON.parse(backup.content);
  assert.equal(parsed.media.included, true);
  assert.equal(parsed.media.records[0].altText, "SSD visto de frente");
  records.set("p1", { ...records.get("p1"), altText: "alterado" });
  await service.restore("w1", await service.inspect("w1", backup.content));
  assert.equal(records.get("p1").altText, "SSD visto de frente");
});

test("restore atômico aplica dados e mídias juntos e isola outro workspace", async () => {
  const { provider, service } = await atomicMediaFixture();
  const backup = await service.create("w1");
  provider.stores.get("products").get("p1").name = "Alterado";
  provider.stores.get("media").get("media-1").altText = "Mídia alterada";
  await service.restore("w1", await service.inspect("w1", backup.content));
  assert.equal((await provider.get("products", "p1")).name, "Produto");
  assert.deepEqual(mediaSummary(provider, "w1").map((record) => record.altText), ["Imagem original 1", "Imagem original 2"]);
  assert.deepEqual(mediaSummary(provider, "w2").map((record) => record.altText), ["Outro espaço"]);
});

for (const failMediaAt of [1, 2]) {
  test(`restore atômico recupera estado anterior quando a gravação da mídia ${failMediaAt === 1 ? "inicial" : "posterior"} falha`, async () => {
    const { provider, service } = await atomicMediaFixture();
    const backup = await service.create("w1");
    provider.stores.get("products").get("p1").name = "Estado anterior";
    provider.stores.get("media").get("media-1").altText = "Mídia anterior";
    const beforeProduct = await provider.get("products", "p1");
    const beforeMedia = mediaSummary(provider, "w1");
    provider.failMediaAt = failMediaAt;
    await assert.rejects(service.restore("w1", await service.inspect("w1", backup.content)), (error) => error.code === "media-restore-failed");
    assert.deepEqual(await provider.get("products", "p1"), beforeProduct);
    assert.deepEqual(mediaSummary(provider, "w1"), beforeMedia);
  });
}

test("restauração usa a prévia validada e reproduz o estado do backup", async () => {
  const { service, provider } = fixture();
  const backup = await service.create("w1");
  provider.stores.get("products").get("p1").name = "Alterado";
  const inspection = await service.inspect("w1", backup.content);
  await service.restore("w1", inspection);
  assert.equal((await provider.get("products", "p1")).name, "Produto");
  assert.equal(provider.replacements, 1);
});

test("conteúdo inválido nunca inicia uma restauração", () => {
  assert.throws(() => parseBackupText("{not-json"), BackupValidationError);
});
