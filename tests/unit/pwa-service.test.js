import test from "node:test";
import assert from "node:assert/strict";
import { PwaService } from "../../js/services/pwa-service.js";

function eventTarget(extra = {}) {
  const listeners = new Map();
  return { ...extra, addEventListener: (name, listener) => listeners.set(name, listener), emit: (name, event = {}) => listeners.get(name)?.(event) };
}

test("registra o service worker em caminho relativo para subdiretórios", async () => {
  let registeredPath;
  const registration = eventTarget({ waiting: null, installing: null });
  const serviceWorker = eventTarget({ controller: null, register: async (path) => { registeredPath = path; return registration; } });
  const service = new PwaService({ navigatorObject: { onLine: true, serviceWorker }, windowObject: eventTarget({ location: { reload() {} } }) });
  await service.start();
  assert.equal(registeredPath, "./service-worker.js");
});

test("atualização só é aplicada por ação explícita", () => {
  let message;
  const service = new PwaService();
  service.registration = { waiting: { postMessage: (value) => { message = value; } } };
  assert.equal(service.applyUpdate(), true);
  assert.deepEqual(message, { type: "SKIP_WAITING" });
});

test("primeira instalação não recarrega, mas atualização confirmada recarrega", async () => {
  let reloads = 0;
  const registration = eventTarget({ waiting: { postMessage() {} }, installing: null });
  const serviceWorker = eventTarget({ controller: null, register: async () => registration });
  const windowObject = eventTarget({ location: { reload: () => { reloads += 1; } } });
  const service = new PwaService({ navigatorObject: { onLine: true, serviceWorker }, windowObject });

  await service.start();
  serviceWorker.emit("controllerchange");
  assert.equal(reloads, 0);

  assert.equal(service.applyUpdate(), true);
  serviceWorker.emit("controllerchange");
  assert.equal(reloads, 1);
});

test("mudanças online e offline são anunciadas", async () => {
  const states = [];
  const windowObject = eventTarget({ location: { reload() {} } });
  const service = new PwaService({ navigatorObject: { onLine: false }, windowObject, onConnectionChange: (state) => states.push(state) });
  await service.start();
  windowObject.emit("online");
  windowObject.emit("offline");
  assert.deepEqual(states, ["offline", "online", "offline"]);
});
