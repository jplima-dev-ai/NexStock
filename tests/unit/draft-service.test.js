import test from "node:test";
import assert from "node:assert/strict";
import { DraftService } from "../../js/services/draft-service.js";

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}

test("rascunhos ficam isolados por workspace e formulário", () => {
  const service = new DraftService({ storage: memoryStorage() });
  service.save("workspace-a", "product:new", { name: "Orion" });
  assert.equal(service.load("workspace-a", "product:new").name, "Orion");
  assert.equal(service.load("workspace-b", "product:new"), null);
  assert.equal(service.load("workspace-a", "movement:new"), null);
});

test("rascunho pode ser removido depois da confirmação", () => {
  const service = new DraftService({ storage: memoryStorage() });
  service.save("workspace-a", "movement:new", { quantity: "2" });
  service.remove("workspace-a", "movement:new");
  assert.equal(service.load("workspace-a", "movement:new"), null);
});

test("rascunho corrompido é ignorado com segurança", () => {
  const storage = memoryStorage();
  storage.setItem("nexstock:draft:workspace-a:product:new", "{");
  assert.equal(new DraftService({ storage }).load("workspace-a", "product:new"), null);
});
