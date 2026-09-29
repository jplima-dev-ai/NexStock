import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { APP_VERSION } from "../../js/core/version.js";
import { certifyWorkspaceUpgrade } from "../../js/services/data-upgrade-certification-service.js";

const legacy = JSON.parse(readFileSync(new URL("../fixtures/workspace-v1.0.0.json", import.meta.url), "utf8"));
const current = structuredClone(legacy);
current.appVersion = APP_VERSION;

test("certifica workspace v1.0.0 até a estrutura atual sem perda silenciosa", () => {
  const certificate = certifyWorkspaceUpgrade({ beforeBackup: legacy, afterBackup: current });
  assert.equal(certificate.workspaceId, "workspace-v1");
  assert.equal(certificate.fromVersion, "1.0.0");
  assert.equal(certificate.toVersion, APP_VERSION);
  assert.equal(certificate.totalRecords, 7);
  assert.deepEqual(certificate.preserved, { workspaces: 1, categories: 1, suppliers: 1, products: 1, productUnits: 0, batches: 0, movements: 1, auditLogs: 1, productRelations: 0, kits: 0, kitItems: 0, customFieldDefinitions: 0, settings: 1 });
});

test("certificação rejeita perda e alteração silenciosa", () => {
  const missing = structuredClone(current);
  missing.data.movements = [];
  assert.throws(() => certifyWorkspaceUpgrade({ beforeBackup: legacy, afterBackup: missing }), /lost movements:movement-v1/u);
  const changed = structuredClone(current);
  changed.data.products[0].currentQuantity = 0;
  assert.throws(() => certifyWorkspaceUpgrade({ beforeBackup: legacy, afterBackup: changed }), /changed products:product-v1/u);
});
