import { buildNexCode } from "./product-service.js";
import { calculateMovementImpact, MOVEMENT_TYPES } from "./movement-service.js";
import { analyzeImportRows } from "./import-service.js";
import { APP_VERSION } from "../core/version.js";
import { BACKUP_SCHEMA, BACKUP_STORES, parseBackupText, validateBackup } from "./backup-service.js";
import { validateImageFile } from "./media-service.js";
import { assertSafeUrl, untrustedText } from "../utils/security.js";
export { assertSafeUrl, untrustedText } from "../utils/security.js";

function result(id, passed, detail) { return Object.freeze({ id, passed: Boolean(passed), detail }); }

function shieldBackup({ workspaceId = "shield-workspace", mutate = () => {} } = {}) {
  const data = Object.fromEntries(BACKUP_STORES.map((storeName) => [storeName, []]));
  data.workspaces = [{ id: workspaceId, name: "NexShield test workspace", updatedAt: "2026-09-26T00:00:00.000Z" }];
  data.products = [{ id: "shield-product", workspaceId, name: "Shield product", nexCode: "NX-SHD-0001", currentQuantity: 10 }];
  mutate(data);
  return { schema: BACKUP_SCHEMA, appVersion: APP_VERSION, workspaceId, data, media: { included: false, records: [] } };
}

function blocked(callback) {
  try { callback(); return false; } catch { return true; }
}

export function runShieldTests() {
  const results = [];
  results.push(result("negativeStock", blocked(() => calculateMovementImpact({ type: MOVEMENT_TYPES.OUT, quantity: 11, currentQuantity: 10, minimumStock: 2 })), "blocked"));
  const code = buildNexCode({ prefix: "NX", categoryCode: "TEST", sequence: 1 });
  results.push(result("duplicateNexCode", blocked(() => validateBackup(shieldBackup({ mutate: (data) => { data.products[0].nexCode = code; data.products.push({ id: "shield-product-2", workspaceId: "shield-workspace", name: "Duplicate code", nexCode: code }); } }))), "blocked"));
  results.push(result("duplicateSerial", blocked(() => validateBackup(shieldBackup({ mutate: (data) => { data.productUnits.push({ id: "shield-unit-1", workspaceId: "shield-workspace", productId: "shield-product", serialNumber: "SERIAL-001" }, { id: "shield-unit-2", workspaceId: "shield-workspace", productId: "shield-product", serialNumber: "SERIAL-001" }); } }))), "blocked"));
  const html = untrustedText('<img src=x onerror="alert(1)">'); results.push(result("html", html.insertionMode === "textContent" && html.value.includes("<img"), "rendered-as-text"));
  results.push(result("dangerousUrl", blocked(() => assertSafeUrl("javascript:alert(1)")), "blocked"));
  results.push(result("invalidImport", !analyzeImportRows([{ sourceRow: 2, name: "Unsafe import", currentQuantity: "-1", minimumStock: "1" }]).ready, "blocked"));
  results.push(result("restoreBoundary", blocked(() => validateBackup(shieldBackup(), { expectedWorkspaceId: "another-workspace" })), "blocked"));
  results.push(result("crossWorkspace", blocked(() => validateBackup(shieldBackup({ mutate: (data) => { data.products[0].workspaceId = "another-workspace"; } }))), "blocked"));
  results.push(result("corruptData", blocked(() => parseBackupText("{not-json")), "blocked"));
  results.push(result("invalidMedia", blocked(() => validateImageFile({ type: "image/svg+xml", size: 1 })), "blocked"));
  return Object.freeze({ isolated: true, passed: results.every((item) => item.passed), results: Object.freeze(results) });
}

export function getSecurityFacts({ appVersion, online = true, provider = "IndexedDBProvider", database = "nexstock-db" } = {}) {
  const remoteDatabase = /supabase|postgres/iu.test(`${provider} ${database}`);
  return Object.freeze({
    provider,
    mode: "local-first",
    database,
    integrity: remoteDatabase ? "nexshield-postgresql" : "nexshield-indexeddb",
    history: "audit-log-archive",
    version: String(appVersion ?? "unknown"),
    connection: online ? "online" : "offline",
  });
}

export class SecurityService {
  constructor({ appVersion, online = () => globalThis.navigator?.onLine !== false, provider, database } = {}) { this.appVersion = appVersion; this.online = online; this.provider = provider; this.database = database; }
  getFacts() { return getSecurityFacts({ appVersion: this.appVersion, online: this.online(), provider: this.provider, database: this.database }); }
  runIsolatedTests() { return runShieldTests(); }
}
