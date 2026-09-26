import test from "node:test";
import assert from "node:assert/strict";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, MediaService, validateImageFile } from "../../js/services/media-service.js";

function createProvider() {
  const records = new Map();
  return {
    async getByProduct(workspaceId, productId) { return [...records.values()].find((record) => record.workspaceId === workspaceId && record.productId === productId) ?? null; },
    async put(record) { records.set(record.id, record); },
    async deleteByProduct(workspaceId, productId) { const record = await this.getByProduct(workspaceId, productId); if (record) records.delete(record.id); },
    async listByWorkspace(workspaceId) { return [...records.values()].filter((record) => record.workspaceId === workspaceId); },
  };
}

test("Product Media valida tipo, tamanho e descrição acessível", () => {
  assert.deepEqual(IMAGE_TYPES, ["image/jpeg", "image/png", "image/webp"]);
  assert.throws(() => validateImageFile(new Blob(["x"], { type: "image/gif" })), /invalid/u);
  assert.throws(() => validateImageFile({ type: "image/png", size: MAX_IMAGE_BYTES + 1 }), /invalid/u);
});

test("Product Media guarda Blob fora do produto e permite atualizar ou remover", async () => {
  const provider = createProvider();
  const service = new MediaService({ mediaProvider: provider, idFactory: () => "media-1", now: () => "2026-09-25T00:00:00.000Z" });
  const blob = new Blob(["image"], { type: "image/png" });
  const stored = await service.setImage({ workspaceId: "w1", productId: "p1", file: blob, altText: "Foto frontal do SSD" });
  assert.equal(stored.id, "media-1");
  assert.equal(stored.altText, "Foto frontal do SSD");
  assert.equal(stored.blob instanceof Blob, true);
  assert.equal((await service.listByWorkspace("w1")).length, 1);
  await service.updateAltText({ workspaceId: "w1", productId: "p1", altText: "SSD prateado visto de frente" });
  assert.equal((await service.getByProduct("w1", "p1")).altText, "SSD prateado visto de frente");
  await service.remove("w1", "p1");
  assert.equal(await service.getByProduct("w1", "p1"), null);
});
