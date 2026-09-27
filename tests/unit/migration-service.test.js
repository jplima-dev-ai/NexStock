import test from "node:test";
import assert from "node:assert/strict";
import { getMigrationCertificate } from "../../js/services/migration-service.js";

test("NexMigrate certifica schema atual, upgrade seguro e versão futura", () => {
  assert.equal(getMigrationCertificate({ currentVersion: 4, storedVersion: 4 }).status, "current");
  assert.equal(getMigrationCertificate({ currentVersion: 4, storedVersion: 2 }).status, "upgradeReady");
  assert.equal(getMigrationCertificate({ currentVersion: 4, storedVersion: 5 }).status, "needsAttention");
  assert.equal(getMigrationCertificate().policy, "additiveOnly");
});
