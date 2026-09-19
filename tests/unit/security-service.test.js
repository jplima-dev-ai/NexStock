import test from "node:test";
import assert from "node:assert/strict";
import { assertSafeUrl, getSecurityFacts, runShieldTests, SecurityService, untrustedText } from "../../js/services/security-service.js";

test("URLs aceitam somente HTTP e HTTPS", () => {
  assert.equal(assertSafeUrl("https://example.com/a"), "https://example.com/a");
  assert.equal(assertSafeUrl("http://example.com/"), "http://example.com/");
  for (const value of ["javascript:alert(1)", "data:text/html,x", "file:///tmp/x", "/relative"]) assert.throws(() => assertSafeUrl(value));
});

test("entrada HTML permanece texto não confiável", () => {
  const payload = '<svg onload="alert(1)">';
  assert.deepEqual(untrustedText(payload), { value: payload, insertionMode: "textContent" });
});

test("cinco testes NexShield passam de forma isolada", () => {
  const report = runShieldTests();
  assert.equal(report.isolated, true);
  assert.equal(report.passed, true);
  assert.deepEqual(report.results.map(({ id }) => id), ["negativeStock", "duplicateNexCode", "duplicateSerial", "html", "dangerousUrl"]);
});

test("Shield Test Mode não recebe nem acessa DataProvider", () => {
  const accesses = [];
  const provider = new Proxy({}, { get: (_, key) => { accesses.push(key); throw new Error("provider accessed"); } });
  const service = new SecurityService({ appVersion: "0.16.0", online: () => false, provider });
  assert.equal(service.runIsolatedTests().passed, true);
  assert.deepEqual(accesses, []);
});

test("Security Center relata somente fatos configurados", () => {
  assert.deepEqual(getSecurityFacts({ appVersion: "0.16.0", online: false }), {
    provider: "IndexedDBProvider", mode: "local-first", database: "nexstock-db",
    integrity: "nexshield-indexeddb",
    history: "audit-log-archive", version: "0.16.0", connection: "offline",
  });
});

test("Security Center descreve as restrições do provider remoto", () => {
  assert.equal(getSecurityFacts({ provider: "SupabaseProvider", database: "PostgreSQL" }).integrity, "nexshield-postgresql");
});
