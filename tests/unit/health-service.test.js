import test from "node:test";
import assert from "node:assert/strict";
import { evaluateHealth, HealthService } from "../../js/services/health-service.js";

const stores = ["categories", "suppliers", "products", "media", "productUnits", "batches", "movements", "productRelations", "kits", "kitItems"];
function empty() { return Object.fromEntries(stores.map((name) => [name, []])); }

test("NexHealth não inventa inconsistência em dados coerentes", () => {
  const data = empty();
  data.categories.push({ id: "c1" }); data.suppliers.push({ id: "s1" });
  data.products.push({ id: "p1", categoryId: "c1", supplierId: "s1", nexCode: "NX-001", currentQuantity: 3, minimumStock: 1, trackingMode: "serialized" });
  data.productUnits.push({ id: "u1", productId: "p1", serialNumber: "S-1", condition: "new", lifecycleState: "in_stock" });
  data.batches.push({ id: "b1", productId: "p1", quantity: 3, manufactureDate: "2026-01-01", expiryDate: "2027-01-01" });
  data.media.push({ id: "m1", productId: "p1", mimeType: "image/png", blob: new Blob(["image"], { type: "image/png" }) });
  data.productRelations.push({ id: "r1", sourceProductId: "p1", targetProductId: "p1", relationType: "compatible_with" });
  data.productRelations.length = 0;
  data.kits.push({ id: "k1" }); data.kitItems.push({ id: "ki1", kitId: "k1", productId: "p1", quantityRequired: 1 });
  data.movements.push({ id: "mv1", productId: "p1", quantity: 1, beforeQuantity: 2, afterQuantity: 3 });
  assert.deepEqual(evaluateHealth(data), []);
});

test("NexHealth torna visíveis referências, estados e dados inválidos", () => {
  const data = empty();
  data.products.push(
    { id: "p1", categoryId: "missing-category", supplierId: "missing-supplier", nexCode: "NX-DUP", currentQuantity: -1, minimumStock: 0, trackingMode: "invalid" },
    { id: "p2", nexCode: "nx-dup", currentQuantity: 1, minimumStock: 0 },
  );
  data.productUnits.push({ id: "u1", productId: "missing-product", serialNumber: "SERIAL", condition: "invalid", lifecycleState: "invalid" }, { id: "u2", productId: "p1", serialNumber: "serial" });
  data.batches.push({ id: "b1", productId: "missing-product", quantity: -1, manufactureDate: "2027-01-01", expiryDate: "2026-01-01" });
  data.media.push({ id: "m1", productId: "missing-product", mimeType: "image/svg+xml", blob: new Blob(["bad"], { type: "image/svg+xml" }) });
  data.productRelations.push({ id: "r1", sourceProductId: "p1", targetProductId: "p1", relationType: "invalid" });
  data.kitItems.push({ id: "ki1", kitId: "missing-kit", productId: "missing-product", quantityRequired: 0 });
  data.movements.push({ id: "mv1", productId: "missing-product", quantity: -1, beforeQuantity: 0, afterQuantity: 0 });
  const codes = new Set(evaluateHealth(data).map(({ code }) => code));
  for (const expected of ["orphanProductCategory", "orphanProductSupplier", "impossibleProductState", "duplicateNexCode", "orphanSerial", "impossibleSerialState", "duplicateSerial", "orphanBatch", "inconsistentBatch", "orphanMedia", "invalidMedia", "brokenRelation", "orphanKitItem", "orphanMovement"]) assert.ok(codes.has(expected), expected);
});

test("diagnóstico consulta somente as coleções do espaço solicitado e não grava", async () => {
  const calls = [];
  const provider = { async getAll(store, query) { calls.push([store, query]); return []; } };
  const report = await new HealthService({ provider }).diagnose("workspace-1");
  assert.equal(report.healthy, true);
  assert.equal(report.total, 0);
  assert.equal(calls.length, stores.length);
  assert.equal(calls.every(([, query]) => query.index === "workspaceId" && query.query === "workspace-1"), true);
});
