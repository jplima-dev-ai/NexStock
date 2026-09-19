import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, "manifest.webmanifest"), "utf8"));
const expected = { name: "NexStock", short_name: "NexStock", start_url: "./", scope: "./", display: "standalone", theme_color: "#0B1120", background_color: "#F6F8FC" };
for (const [key, value] of Object.entries(expected)) {
  if (manifest[key] !== value) throw new Error(`Manifest inválido em ${key}.`);
}
for (const icon of manifest.icons ?? []) {
  if (!existsSync(join(root, icon.src.replace(/^\.\//u, "")))) throw new Error(`Ícone PWA ausente: ${icon.src}`);
}
if (!manifest.icons?.some(({ purpose }) => purpose === "maskable")) throw new Error("Manifest sem ícone maskable.");

const worker = readFileSync(join(root, "service-worker.js"), "utf8");
for (const contract of ["nexstock-shell-v", "cache.addAll", "SKIP_WAITING", "caches.match", "index.html"]) {
  if (!worker.includes(contract)) throw new Error(`Service worker sem contrato: ${contract}`);
}
if (/indexedDB\.deleteDatabase/u.test(worker)) throw new Error("Atualização PWA não pode apagar IndexedDB.");

const index = readFileSync(join(root, "index.html"), "utf8");
if (!index.includes('rel="manifest" href="./manifest.webmanifest"')) throw new Error("Manifest não conectado ao HTML.");
process.stdout.write("PWA: manifest, cache versionado, offline, atualização e drafts aprovados.\n");
