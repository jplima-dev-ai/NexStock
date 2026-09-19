import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, normalize } from "node:path";

const ROOT = join(process.cwd(), "_site");
const ALLOWED_ROOT_ENTRIES = new Set([
  ".nojekyll", "assets", "css", "demo", "index.html", "js", "locales",
  "manifest.webmanifest", "service-worker.js",
]);

if (!existsSync(ROOT) || !statSync(ROOT).isDirectory()) throw new Error("Artefato _site não foi criado.");
const unexpected = readdirSync(ROOT).filter((entry) => !ALLOWED_ROOT_ENTRIES.has(entry));
if (unexpected.length) throw new Error(`Arquivos indevidos no artefato público: ${unexpected.join(", ")}`);

function assertPublicFile(reference, origin) {
  if (!reference || reference.startsWith("#") || /^(?:https?:|data:|mailto:)/u.test(reference)) return;
  if (reference.startsWith("/")) throw new Error(`${origin}: caminho absoluto incompatível com subdiretório: ${reference}`);
  const clean = reference.replace(/^\.\//u, "").split(/[?#]/u)[0];
  const target = normalize(join(ROOT, clean));
  if (!target.startsWith(ROOT) || !existsSync(target)) throw new Error(`${origin}: recurso público ausente: ${reference}`);
}

const html = readFileSync(join(ROOT, "index.html"), "utf8");
for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gu)) assertPublicFile(match[1], "index.html");

const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.webmanifest"), "utf8"));
if (manifest.start_url !== "./" || manifest.scope !== "./" || manifest.display !== "standalone") {
  throw new Error("Manifest incompatível com instalação em subdiretório do GitHub Pages.");
}
for (const icon of manifest.icons ?? []) assertPublicFile(icon.src, "manifest.webmanifest");

const worker = readFileSync(join(ROOT, "service-worker.js"), "utf8");
for (const match of worker.matchAll(/["']\.\/([^"']+)["']/gu)) assertPublicFile(`./${match[1]}`, "service-worker.js");
const pwaService = readFileSync(join(ROOT, "js/services/pwa-service.js"), "utf8");
if (!pwaService.includes('register("./service-worker.js")')) throw new Error("Service worker não usa caminho relativo.");

process.stdout.write("GitHub Pages: artefato mínimo, caminhos relativos, manifest e cache aprovados.\n");
