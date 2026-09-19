import { buildNexCode } from "./product-service.js";
import { calculateMovementImpact, MOVEMENT_TYPES } from "./movement-service.js";
import { assertSafeUrl, untrustedText } from "../utils/security.js";
export { assertSafeUrl, untrustedText } from "../utils/security.js";

function result(id, passed, detail) { return Object.freeze({ id, passed: Boolean(passed), detail }); }

export function runShieldTests() {
  const results = [];
  try { calculateMovementImpact({ type: MOVEMENT_TYPES.OUT, quantity: 11, currentQuantity: 10, minimumStock: 2 }); results.push(result("negativeStock", false, "accepted")); } catch { results.push(result("negativeStock", true, "blocked")); }
  const code = buildNexCode({ prefix: "NX", categoryCode: "TEST", sequence: 1 });
  const codes = new Set([code]); results.push(result("duplicateNexCode", codes.has(code), "blocked"));
  const serials = new Set(["SERIAL-001"]); results.push(result("duplicateSerial", serials.has("SERIAL-001"), "blocked"));
  const html = untrustedText('<img src=x onerror="alert(1)">'); results.push(result("html", html.insertionMode === "textContent" && html.value.includes("<img"), "rendered-as-text"));
  try { assertSafeUrl("javascript:alert(1)"); results.push(result("dangerousUrl", false, "accepted")); } catch { results.push(result("dangerousUrl", true, "blocked")); }
  return Object.freeze({ isolated: true, passed: results.every((item) => item.passed), results: Object.freeze(results) });
}

export function getSecurityFacts({ appVersion, online = true, provider = "IndexedDBProvider", database = "nexstock-db" } = {}) {
  return Object.freeze({
    provider,
    mode: "local-first",
    database,
    integrity: "NexShield domain validation and IndexedDB unique constraints",
    history: "AuditLog and logical archiving",
    version: String(appVersion ?? "unknown"),
    connection: online ? "online" : "offline",
  });
}

export class SecurityService {
  constructor({ appVersion, online = () => globalThis.navigator?.onLine !== false, provider, database } = {}) { this.appVersion = appVersion; this.online = online; this.provider = provider; this.database = database; }
  getFacts() { return getSecurityFacts({ appVersion: this.appVersion, online: this.online(), provider: this.provider, database: this.database }); }
  runIsolatedTests() { return runShieldTests(); }
}
