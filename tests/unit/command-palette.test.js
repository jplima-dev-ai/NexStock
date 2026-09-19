import test from "node:test";
import assert from "node:assert/strict";
import { bindCommandPaletteTrigger } from "../../js/components/command-palette.js";

function eventTarget() {
  const listeners = new Map();
  return {
    addEventListener(name, listener) { listeners.set(name, listener); },
    removeEventListener(name, listener) {
      if (listeners.get(name) === listener) listeners.delete(name);
    },
    emit(name) { listeners.get(name)?.(); },
  };
}

test("reinicializar a paleta remove o evento da instância anterior", () => {
  const trigger = eventTarget();
  let openings = 0;
  const destroy = bindCommandPaletteTrigger({ trigger, onOpen: () => { openings += 1; } });

  trigger.emit("click");
  destroy();
  trigger.emit("click");

  assert.equal(openings, 1);
});

test("gatilho da paleta exige uma ação de abertura válida", () => {
  assert.throws(() => bindCommandPaletteTrigger({ trigger: eventTarget() }), TypeError);
});
