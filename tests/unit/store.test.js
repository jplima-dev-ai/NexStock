import test from "node:test";
import assert from "node:assert/strict";
import { Store } from "../../js/core/store.js";

test("Store atualiza sem mutar o estado anterior", () => {
  const store = new Store({ locale: "pt-BR", theme: "light" });
  const previous = store.getState();
  store.setState({ theme: "dark" });
  assert.equal(previous.theme, "light");
  assert.equal(store.getState().theme, "dark");
  assert.notEqual(previous, store.getState());
});

test("Store rejeita patches inválidos", () => {
  const store = new Store({});
  assert.throws(() => store.setState(null), TypeError);
  assert.throws(() => store.setState([]), TypeError);
});
