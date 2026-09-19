import test from "node:test";
import assert from "node:assert/strict";
import { bindMobileNavigation } from "../../js/components/mobile-navigation.js";

function target() {
  const attributes = new Map();
  const listeners = new Map();
  return {
    dataset: {}, textContent: "",
    setAttribute: (name, value) => attributes.set(name, value),
    getAttribute: (name) => attributes.get(name) ?? null,
    addEventListener: (name, listener) => listeners.set(name, listener),
    emit: (name, event = {}) => listeners.get(name)?.(event),
  };
}

test("menu móvel comunica estado aberto e fechado", () => {
  const button = target();
  const navigation = target();
  bindMobileNavigation({ button, navigation, translate: (key) => key });
  assert.equal(button.getAttribute("aria-expanded"), "false");
  assert.equal(navigation.dataset.open, "false");
  button.emit("click");
  assert.equal(button.getAttribute("aria-expanded"), "true");
  assert.equal(button.textContent, "app.closeMenu");
});

test("selecionar um link fecha o menu móvel", () => {
  const button = target();
  const navigation = target();
  bindMobileNavigation({ button, navigation, translate: (key) => key });
  button.emit("click");
  navigation.emit("click", { target: { closest: (selector) => selector === "a" ? {} : null } });
  assert.equal(button.getAttribute("aria-expanded"), "false");
});
