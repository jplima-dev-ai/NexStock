import test from "node:test";
import assert from "node:assert/strict";
import { NexScanService, normalizeScanCode, ScannerUnavailableError } from "../../js/services/scanner-service.js";

function createProductService(products) {
  return { async search() { return products; } };
}

test("NexScan normaliza o código e encontra NexCode ou busca manual única", async () => {
  const service = new NexScanService({ productService: createProductService([
    { id: "p1", nexCode: "NX-COMP-0002", name: "Quantum SSD" },
  ]), navigatorRef: {} });
  assert.equal(normalizeScanCode(" nx-comp-0002 "), "NX-COMP-0002");
  assert.equal((await service.findProduct("w1", "nx-comp-0002")).id, "p1");
  assert.equal((await service.findProduct("w1", "Quantum SSD")).id, "p1");
  assert.equal(await service.findProduct("w1", ""), null);
});

test("NexScan mantém a busca manual disponível quando não há câmera", async () => {
  const service = new NexScanService({ productService: createProductService([{ id: "p1", nexCode: "NX-1" }]), navigatorRef: {} });
  assert.equal(service.cameraSupported, false);
  await assert.rejects(service.start({}, () => {}), ScannerUnavailableError);
  assert.equal((await service.findProduct("w1", "NX-1")).id, "p1");
});

test("NexScan interrompe a câmera e suas faixas", async () => {
  let stopped = 0;
  const service = new NexScanService({ productService: createProductService([]), navigatorRef: {} });
  service.stream = { getTracks: () => [{ stop: () => { stopped += 1; } }] };
  service.timerId = 1;
  service.timer = { clearTimeout: (id) => assert.equal(id, 1) };
  service.stop();
  assert.equal(stopped, 1);
  assert.equal(service.stream, null);
});
