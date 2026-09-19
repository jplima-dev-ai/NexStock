import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DEMO_PROFILES, validateDemoSeed } from "../../js/services/seed-loader.js";

test("todos os seeds são válidos e usam o perfil correspondente", async () => {
  for (const profile of DEMO_PROFILES) {
    const seed = JSON.parse(await readFile(new URL(`../../demo/${profile}.json`, import.meta.url), "utf8"));
    assert.equal(validateDemoSeed(seed, profile), seed);
    if (profile === "custom") assert.equal(seed.products.length, 0);
    else assert.ok(seed.products.length > 0);
  }
});

test("seed de tecnologia contém os cinco produtos oficiais", async () => {
  const seed = JSON.parse(await readFile(new URL("../../demo/technology.json", import.meta.url), "utf8"));
  assert.deepEqual(seed.products.map(({ name }) => name), [
    "Orion Notebook",
    "Quantum SSD",
    "NovaMesh Router",
    "Orbit Keyboard",
    "Pulse Headset",
  ]);
});

test("seed rejeita relações com chaves inexistentes", () => {
  const invalid = {
    profileKey: "technology",
    workspace: { name: "Teste" },
    categories: [],
    suppliers: [],
    products: [{ key: "one", name: "Produto", categoryKey: "missing" }],
  };
  assert.throws(() => validateDemoSeed(invalid, "technology"), /Unknown seed category/u);
});
