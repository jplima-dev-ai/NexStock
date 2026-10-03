import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { APP_VERSION } from "../../js/core/version.js";

test("a versão final é coerente no pacote, núcleo e cache PWA", () => {
  const packageVersion = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")).version;
  const worker = readFileSync(new URL("../../service-worker.js", import.meta.url), "utf8");
  assert.match(APP_VERSION, /^2\.0\.\d+$/u);
  assert.equal(packageVersion, APP_VERSION);
  assert.ok(worker.includes(`APP_VERSION = "${APP_VERSION}"`));
  assert.ok(worker.includes(`nexstock-shell-v${APP_VERSION}-calm-intelligence`));
});
