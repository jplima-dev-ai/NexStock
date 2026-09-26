import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

function waitForServer(server) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Servidor não iniciou a tempo.")), 5000);
    server.stdout.on("data", (chunk) => {
      if (chunk.toString().includes("NexStock disponível")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Servidor encerrou antes do teste com código ${code}.`));
    });
  });
}

test("serve a aplicação e seus módulos em um subdiretório", async (context) => {
  const port = 43000 + Math.floor(Math.random() * 1000);
  const server = spawn(process.execPath, ["scripts/serve.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, NEXSTOCK_PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  context.after(() => server.kill());
  await waitForServer(server);

  const indexResponse = await fetch(`http://127.0.0.1:${port}/nexstock/`);
  const moduleResponse = await fetch(`http://127.0.0.1:${port}/nexstock/js/app.js`);
  const missingResponse = await fetch(`http://127.0.0.1:${port}/nexstock/not-found.js`);
  const manifestResponse = await fetch(`http://127.0.0.1:${port}/nexstock/manifest.webmanifest`);
  const workerResponse = await fetch(`http://127.0.0.1:${port}/nexstock/service-worker.js`);

  assert.equal(indexResponse.status, 200);
  assert.match(indexResponse.headers.get("content-type"), /text\/html/u);
  assert.match(await indexResponse.text(), /<main id="main-content"/u);
  assert.equal(moduleResponse.status, 200);
  assert.match(moduleResponse.headers.get("content-type"), /text\/javascript/u);
  assert.equal(missingResponse.status, 404);
  assert.equal(manifestResponse.status, 200);
  assert.equal((await manifestResponse.json()).display, "standalone");
  assert.equal(workerResponse.status, 200);
  const version = JSON.parse(readFileSync("package.json", "utf8")).version.replaceAll(".", "\\.");
  assert.match(await workerResponse.text(), new RegExp(`nexstock-shell-v${version}`, "u"));

  const brandAssets = [
    "assets/brand/logos/nexstock-main-logo-16x9.png",
    "assets/brand/logos/nexstock-stacked-logo-4x3.png",
    "assets/brand/mascot/nexstock-mascot-full-body-3x4.png",
    "assets/brand/scenes/nexstock-brand-scene-16x9.jpg",
    "assets/brand/symbols/nexstock-app-icon-1x1.png",
    "assets/brand/symbols/nexstock-brand-symbol-1x1.png",
  ];
  for (const asset of brandAssets) {
    const response = await fetch(`http://127.0.0.1:${port}/nexstock/${asset}`);
    assert.equal(response.status, 200, `Asset indisponível: ${asset}`);
    assert.ok(Number(response.headers.get("content-length")) > 0 || (await response.arrayBuffer()).byteLength > 0);
  }

  for (const locale of ["pt-BR", "en-US", "es"]) {
    const response = await fetch(`http://127.0.0.1:${port}/nexstock/locales/${locale}.json`);
    assert.equal(response.status, 200, `Catálogo indisponível: ${locale}`);
    assert.match(response.headers.get("content-type"), /application\/json/u);
    assert.ok((await response.json()).routes.welcome.title);
  }

  for (const profile of ["technology", "cosmetics", "fashion", "food", "custom"]) {
    const response = await fetch(`http://127.0.0.1:${port}/nexstock/demo/${profile}.json`);
    assert.equal(response.status, 200, `Seed indisponível: ${profile}`);
    assert.equal((await response.json()).profileKey, profile);
  }

  for (const module of [
    "js/storage/data-provider.js",
    "js/storage/indexeddb-provider.js",
    "js/services/workspace-service.js",
    "js/services/profile-service.js",
    "js/views/onboarding-view.js",
    "js/views/product-view.js",
    "js/storage/migrations/002-product-workspace-code.js",
  ]) {
    const response = await fetch(`http://127.0.0.1:${port}/nexstock/${module}`);
    assert.equal(response.status, 200, `Módulo indisponível: ${module}`);
  }
});
