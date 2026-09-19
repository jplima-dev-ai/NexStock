import test from "node:test";
import assert from "node:assert/strict";
import { CustomFieldService, CUSTOM_FIELD_TYPES } from "../../js/services/custom-field-service.js";

class Provider {
  constructor() { this.fields = new Map(); this.audits = new Map(); }
  async getAll(store, { query } = {}) { return [...(store === "customFieldDefinitions" ? this.fields : this.audits).values()].filter((item) => !query || item.workspaceId === query); }
  async get(store, id) { return (store === "customFieldDefinitions" ? this.fields : this.audits).get(id); }
  async bulkPut(groups) {
    for (const item of groups.customFieldDefinitions ?? []) this.fields.set(item.id, structuredClone(item));
    for (const item of groups.auditLogs ?? []) this.audits.set(item.id, structuredClone(item));
  }
}

function service(provider = new Provider()) {
  let id = 0;
  return { provider, instance: new CustomFieldService({ provider, idFactory: () => `id-${++id}`, now: () => "2026-09-19T12:00:00.000Z" }) };
}

test("expõe exatamente os oito tipos definidos no blueprint", () => {
  assert.deepEqual(CUSTOM_FIELD_TYPES, ["text", "number", "currency", "date", "boolean", "select", "multiselect", "url"]);
});

test("cria definição completa e auditoria no workspace", async () => {
  const { provider, instance } = service();
  const field = await instance.create({ id: "workspace-1", profileKey: "custom" }, { label: "Material", type: "select", options: "Algodão, Linho", required: true, searchable: true });
  assert.equal(field.key, "custom_material");
  assert.deepEqual(field.options, ["Algodão", "Linho"]);
  assert.equal(field.order, 0);
  assert.equal((await provider.getAll("auditLogs")).at(0).action, "CUSTOM_FIELD_CREATED");
});

test("chaves permanecem únicas e seleção exige duas opções", async () => {
  const { instance } = service();
  const workspace = { id: "workspace-1", profileKey: "custom" };
  assert.equal((await instance.create(workspace, { label: "Cor", type: "text" })).key, "custom_cor");
  assert.equal((await instance.create(workspace, { label: "Cor", type: "text" })).key, "custom_cor_2");
  await assert.rejects(() => instance.create(workspace, { label: "Tamanho", type: "select", options: "Único" }), /two options/);
});

test("desativação preserva a definição e registra auditoria", async () => {
  const { provider, instance } = service();
  const field = await instance.create({ id: "workspace-1", profileKey: "custom" }, { label: "Material", type: "text" });
  const disabled = await instance.setEnabled("workspace-1", field.id, false);
  assert.equal(disabled.enabled, false);
  assert.equal(provider.fields.size, 1);
  assert.equal((await provider.getAll("auditLogs")).at(-1).action, "CUSTOM_FIELD_DISABLED");
  await assert.rejects(() => instance.setEnabled("other-workspace", field.id, true), /not found/);
});
