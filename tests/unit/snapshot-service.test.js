import test from "node:test";
import assert from "node:assert/strict";
import { BackupService, isLocalSnapshotSetting } from "../../js/services/backup-service.js";
import { MAX_LOCAL_SNAPSHOTS, SnapshotService } from "../../js/services/snapshot-service.js";

const stores = ["workspaces", "categories", "suppliers", "products", "productUnits", "batches", "movements", "auditLogs", "productRelations", "kits", "kitItems", "customFieldDefinitions", "settings"];
class MemoryProvider {
  constructor() { this.stores = new Map(stores.map((name) => [name, new Map()])); }
  seed(store, records) { for (const record of records) this.stores.get(store).set(record.id, structuredClone(record)); }
  async get(store, id) { return structuredClone(this.stores.get(store).get(id) ?? null); }
  async getAll(store, { index, query } = {}) { const values = [...this.stores.get(store).values()]; return structuredClone(index ? values.filter((record) => record[index] === query) : values); }
  async put(store, record) { this.stores.get(store).set(record.id, structuredClone(record)); }
  async delete(store, id) { this.stores.get(store).delete(id); }
  async replaceWorkspaceData({ workspaceId, expectedUpdatedAt, collections }) {
    const current = await this.get("workspaces", workspaceId);
    if (current.updatedAt !== expectedUpdatedAt) throw new Error("conflict");
    for (const name of stores) {
      if (name === "workspaces") { this.stores.get(name).set(workspaceId, structuredClone(collections[name][0])); continue; }
      for (const [id, record] of this.stores.get(name)) if (record.workspaceId === workspaceId) this.stores.get(name).delete(id);
      for (const record of collections[name]) this.stores.get(name).set(record.id, structuredClone(record));
    }
  }
}
function fixture() {
  const provider = new MemoryProvider();
  provider.seed("workspaces", [{ id: "w1", name: "Loja", updatedAt: "2026-09-25T00:00:00.000Z" }]);
  provider.seed("categories", [{ id: "c1", workspaceId: "w1", name: "Categoria" }]);
  provider.seed("products", [{ id: "p1", workspaceId: "w1", nexCode: "NX-001", name: "Original", categoryId: "c1", currentQuantity: 3 }]);
  provider.seed("settings", [{ id: "profile-settings-w1", workspaceId: "w1", value: {}, updatedAt: "2026-09-25T00:00:00.000Z" }]);
  let sequence = 0;
  const backupService = new BackupService({ provider, now: () => new Date("2026-09-25T12:00:00.000Z") });
  return { provider, service: new SnapshotService({ provider, backupService, idFactory: () => `id-${++sequence}`, now: () => new Date("2026-09-25T12:00:00.000Z") }) };
}

test("snapshot local cria ponto validado, isolado e ausente do backup exportável", async () => {
  const { provider, service } = fixture();
  const snapshot = await service.create("w1", { label: "Antes da importação", reason: "before-import" });
  assert.equal(snapshot.label, "Antes da importação");
  assert.equal((await service.list("w1")).length, 1);
  const backup = await new BackupService({ provider }).create("w1");
  assert.equal(JSON.parse(backup.content).data.settings.some(isLocalSnapshotSetting), false);
});

test("restaurar snapshot preserva o histórico local e cria cópia de segurança antes da troca", async () => {
  const { provider, service } = fixture();
  const snapshot = await service.create("w1", { label: "Estado original" });
  provider.stores.get("products").get("p1").name = "Alterado";
  const result = await service.restore("w1", snapshot.id);
  assert.equal((await provider.get("products", "p1")).name, "Original");
  assert.ok(result.safety.id);
  assert.equal((await service.list("w1")).length, 2);
});

test("limite é explícito e não remove snapshots silenciosamente", async () => {
  const { service } = fixture();
  for (let index = 0; index < MAX_LOCAL_SNAPSHOTS; index += 1) await service.create("w1", { label: `Ponto ${index}` });
  await assert.rejects(service.create("w1", { label: "Excedente" }), /limit/u);
  assert.equal((await service.list("w1")).length, MAX_LOCAL_SNAPSHOTS);
});

test("exclusão requer o snapshot do workspace ativo", async () => {
  const { service } = fixture();
  const snapshot = await service.create("w1");
  await assert.rejects(service.remove("other", snapshot.id), /not found/u);
  await service.remove("w1", snapshot.id);
  assert.equal((await service.list("w1")).length, 0);
});
