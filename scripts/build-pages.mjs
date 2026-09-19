import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const OUTPUT = join(ROOT, "_site");
const PUBLIC_ENTRIES = Object.freeze([
  "assets",
  "css",
  "demo",
  "index.html",
  "js",
  "locales",
  "manifest.webmanifest",
  "service-worker.js",
]);

rmSync(OUTPUT, { recursive: true, force: true });
mkdirSync(OUTPUT, { recursive: true });
for (const entry of PUBLIC_ENTRIES) {
  cpSync(join(ROOT, entry), join(OUTPUT, entry), { recursive: true });
}
writeFileSync(join(OUTPUT, ".nojekyll"), "", "utf8");

process.stdout.write(`GitHub Pages: artefato estático criado em ${OUTPUT}.\n`);
