import test from "node:test";
import assert from "node:assert/strict";
import { ImportService, analyzeImportRows, mapImportRows, parseCsv, suggestImportMapping } from "../../js/services/import-service.js";

class MemoryProvider {
  constructor() {
    this.stores = new Map(["products", "categories", "suppliers", "settings", "auditLogs"].map((name) => [name, new Map()]));
    this.bulkCalls = 0;
  }

  seed(store, records) {
    for (const record of records) this.stores.get(store).set(record.id ?? record.key, structuredClone(record));
  }

  async get(store, key) {
    return structuredClone(this.stores.get(store).get(key) ?? null);
  }

  async getAll(store, { index, query } = {}) {
    const values = [...this.stores.get(store).values()];
    return structuredClone(index ? values.filter((value) => value[index] === query) : values);
  }

  async bulkPut(collections) {
    this.bulkCalls += 1;
    for (const [store, records] of Object.entries(collections)) {
      for (const record of records) this.stores.get(store).set(record.id ?? record.key, structuredClone(record));
    }
  }
}

function validCsv() {
  return parseCsv("Nome;Quantidade;Estoque mínimo;Categoria\nTeclado Aurora;8;2;Tecnologia\nMouse Boreal;5;1;Tecnologia");
}

test("parser aceita delimitador, aspas e sugere cabeçalhos em português", () => {
  const parsed = parseCsv('Nome;Quantidade;Estoque mínimo;Descrição\n"Cabo, USB";4;1;"Com adaptador ""C"""');
  assert.equal(parsed.delimiter, ";");
  assert.equal(parsed.rows[0][0], "Cabo, USB");
  assert.equal(parsed.rows[0][3], 'Com adaptador "C"');
  assert.deepEqual(suggestImportMapping(parsed.headers), {
    name: "Nome", currentQuantity: "Quantidade", minimumStock: "Estoque mínimo",
    category: "", supplier: "", purchasePrice: "", salePrice: "",
    location: "", description: "Descrição", trackingMode: "",
  });
});

test("análise identifica números inválidos, relações ausentes e duplicatas no arquivo", () => {
  const analysis = analyzeImportRows([
    { sourceRow: 2, name: "Produto repetido", currentQuantity: "-1", minimumStock: "2", category: "Inexistente" },
    { sourceRow: 3, name: "Produto repetido", currentQuantity: "3", minimumStock: "1" },
  ]);
  assert.equal(analysis.ready, false);
  assert.ok(analysis.rows[0].errors.some(({ code }) => code === "nonNegativeNumber"));
  assert.ok(analysis.rows[0].errors.some(({ code }) => code === "unknownRelation"));
  assert.ok(analysis.rows.every(({ errors }) => errors.some(({ code }) => code === "duplicateFile")));
});

test("confirmação válida cria NexCodes sequenciais e auditoria em uma única gravação", async () => {
  const provider = new MemoryProvider();
  provider.seed("categories", [{ id: "cat-tech", workspaceId: "w1", name: "Tecnologia", code: "TEC" }]);
  provider.seed("settings", [{ key: "profile-settings-w1", value: { prefix: "NX" } }]);
  provider.seed("products", [{ id: "old", workspaceId: "w1", name: "Monitor", categoryId: "cat-tech", nexCode: "NX-TEC-0004" }]);
  const identifiers = ["product-1", "audit-1", "product-2", "audit-2"];
  const snapshots = [];
  const service = new ImportService({ provider, snapshotService: { create: async (...argumentsList) => { snapshots.push(argumentsList); } }, idFactory: () => identifiers.shift(), now: () => "2026-09-20T12:00:00.000Z" });
  const parsed = validCsv();
  const mapping = suggestImportMapping(parsed.headers);
  const analysis = await service.prepare("w1", parsed, mapping);
  assert.equal(analysis.ready, true);
  assert.equal(provider.bulkCalls, 0);

  const result = await service.commit("w1", analysis);
  assert.deepEqual(result.products.map(({ nexCode }) => nexCode), ["NX-TEC-0005", "NX-TEC-0006"]);
  assert.equal(result.audits.every(({ action }) => action === "PRODUCT_IMPORTED"), true);
  assert.equal(provider.bulkCalls, 1);
  assert.equal(provider.stores.get("products").size, 3);
  assert.equal(provider.stores.get("auditLogs").size, 2);
  assert.deepEqual(snapshots, [["w1", { reason: "before-import" }]]);
});

test("plano inválido ou desatualizado não grava nem corrompe o espaço de trabalho", async () => {
  const provider = new MemoryProvider();
  provider.seed("categories", [{ id: "cat-tech", workspaceId: "w1", name: "Tecnologia", code: "TEC" }]);
  const service = new ImportService({ provider, idFactory: () => "unused" });
  const parsed = validCsv();
  const mapping = suggestImportMapping(parsed.headers);
  const analysis = await service.prepare("w1", parsed, mapping);
  provider.seed("products", [{ id: "concurrent", workspaceId: "w1", name: "Teclado Aurora", nexCode: "NX-GEN-0001" }]);
  const before = structuredClone([...provider.stores.get("products").values()]);

  await assert.rejects(() => service.commit("w1", analysis), /no longer valid/u);
  assert.equal(provider.bulkCalls, 0);
  assert.deepEqual([...provider.stores.get("products").values()], before);
  assert.equal(provider.stores.get("auditLogs").size, 0);

  const invalid = analyzeImportRows([{ sourceRow: 2, name: "Inválido", currentQuantity: "-2", minimumStock: "1" }]);
  await assert.rejects(() => service.commit("w1", invalid), /valid import plan/u);
  assert.equal(provider.bulkCalls, 0);
});
