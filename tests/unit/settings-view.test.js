import test from "node:test";
import assert from "node:assert/strict";
import { canResetWorkspace } from "../../js/views/settings-view.js";

test("reset exige persistência pronta e espaço de trabalho ativo", () => {
  assert.equal(canResetWorkspace({ workspace: { id: "w1" }, persistenceReady: true }), true);
  assert.equal(canResetWorkspace({ workspace: null, persistenceReady: true }), false);
  assert.equal(canResetWorkspace({ workspace: { id: "w1" }, persistenceReady: false }), false);
});
