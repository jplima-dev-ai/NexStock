import test from "node:test";
import assert from "node:assert/strict";
import { canResetWorkspace, getSettingsSection, SETTINGS_SECTIONS } from "../../js/views/settings-view.js";

test("reset exige persistência pronta e espaço de trabalho ativo", () => {
  assert.equal(canResetWorkspace({ workspace: { id: "w1" }, persistenceReady: true }), true);
  assert.equal(canResetWorkspace({ workspace: null, persistenceReady: true }), false);
  assert.equal(canResetWorkspace({ workspace: { id: "w1" }, persistenceReady: false }), false);
});

test("NexSettings expõe as nove seções previstas pelo blueprint", () => {
  assert.deepEqual(SETTINGS_SECTIONS.map(({ route }) => route), [
    "/settings", "/settings/general", "/settings/appearance", "/settings/inventory",
    "/settings/profiles", "/settings/data", "/settings/security", "/settings/pwa",
    "/settings/advanced",
  ]);
});

test("seção ativa deriva da rota e usa resumo como fallback seguro", () => {
  assert.equal(getSettingsSection("/settings/appearance").id, "appearance");
  assert.equal(getSettingsSection("/settings/security").id, "security");
  assert.equal(getSettingsSection("/settings/data/import").id, "data");
  assert.equal(getSettingsSection("/settings/data/export").id, "data");
  assert.equal(getSettingsSection("/settings/unknown").id, "summary");
});
