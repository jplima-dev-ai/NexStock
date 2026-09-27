import test from "node:test";
import assert from "node:assert/strict";
import { PrivacyDataCenterService, getPrivacyDataCenterFacts } from "../../js/services/privacy-data-center-service.js";

test("Central de dados descreve IndexedDB local sem prometer sincronização", () => {
  assert.deepEqual(getPrivacyDataCenterFacts({ providerType: "indexeddb", online: false }), {
    dataLocation: "browserIndexedDb", provider: "indexeddb", backup: "manualNexBackup",
    snapshots: "activeProviderSnapshots", synchronization: "notConfigured", connection: "offline",
  });
});

test("Central de dados descreve provider remoto sem reter URL ou chave", () => {
  const facts = getPrivacyDataCenterFacts({
    providerType: "supabase", online: true,
    supabaseUrl: "https://private.example.invalid", publishableKey: "not-for-the-ui",
  });
  assert.equal(facts.dataLocation, "remoteProvider");
  assert.equal(facts.provider, "supabase");
  assert.equal(facts.synchronization, "providerConfigured");
  assert.equal(JSON.stringify(facts).includes("private.example.invalid"), false);
  assert.equal(JSON.stringify(facts).includes("not-for-the-ui"), false);
});

test("serviço reflete conexão atual sem gravar dados", () => {
  const service = new PrivacyDataCenterService({ providerType: "indexeddb", online: () => false });
  assert.equal(service.getFacts().connection, "offline");
});
