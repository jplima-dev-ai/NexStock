import test from "node:test";
import assert from "node:assert/strict";
import { createSettingsSummaryModel, normalizeSettingsPatch, SettingsService } from "../../js/services/settings-service.js";

class MemoryProvider {
  constructor(workspace) { this.workspace = structuredClone(workspace); }
  async get(store, id) { return store === "workspaces" && id === this.workspace?.id ? structuredClone(this.workspace) : null; }
  async put(store, value) { if (store !== "workspaces") throw new Error("Unexpected store"); this.workspace = structuredClone(value); }
}

test("normaliza somente configurações seguras e controladas", () => {
  assert.deepEqual(normalizeSettingsPatch({ name: "  Loja   Centro  ", currency: "BRL" }), { name: "Loja Centro", currency: "BRL" });
  assert.throws(() => normalizeSettingsPatch({ profileKey: "food" }), /cannot be changed/u);
  assert.throws(() => normalizeSettingsPatch({ theme: "neon" }), /Unsupported theme/u);
});

test("salvamento imediato atualiza workspace sem perder campos existentes", async () => {
  const provider = new MemoryProvider({ id: "w1", name: "Antes", profileKey: "technology", theme: "light", updatedAt: "old" });
  const service = new SettingsService({ provider, now: () => "2026-09-20T14:00:00.000Z" });
  const workspace = await service.updateWorkspace("w1", { name: "Depois", theme: "dark" });
  assert.equal(workspace.name, "Depois");
  assert.equal(workspace.theme, "dark");
  assert.equal(workspace.profileKey, "technology");
  assert.equal(workspace.updatedAt, "2026-09-20T14:00:00.000Z");
});

test("salvamento recusa workspace ausente antes de gravar", async () => {
  const provider = new MemoryProvider(null);
  const service = new SettingsService({ provider });
  await assert.rejects(() => service.updateWorkspace("missing", { name: "Estoque" }), /not found/u);
});

test("resumo expõe cinco áreas centrais com atalhos estáveis", () => {
  const model = createSettingsSummaryModel({
    workspace: { name: "Loja Centro", profileKey: "technology", theme: "dark", experienceMode: "compact" },
    state: { theme: "light", persistence: "ready", provider: "indexeddb", connection: "online", pwa: { updateAvailable: false } },
  });
  assert.deepEqual(model.map(({ id, route }) => [id, route]), [
    ["workspace", "/settings/general"], ["appearance", "/settings/appearance"],
    ["data", "/settings/data"], ["security", "/settings/security"], ["pwa", "/settings/pwa"],
  ]);
  assert.deepEqual(model[1].values, ["dark", "compact"]);
});
