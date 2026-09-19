import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const ROOT = process.cwd();

function files(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path, extension) : (path.endsWith(extension) ? [path] : []);
  });
}

const packageVersion = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;
const coreVersion = readFileSync(join(ROOT, "js/core/version.js"), "utf8").match(/APP_VERSION\s*=\s*["']([^"']+)/u)?.[1];
const worker = readFileSync(join(ROOT, "service-worker.js"), "utf8");
const workerVersion = worker.match(/APP_VERSION\s*=\s*["']([^"']+)/u)?.[1];
const cacheVersion = worker.match(/nexstock-shell-v([\d.]+)/u)?.[1];
if (![coreVersion, workerVersion, cacheVersion].every((version) => version === packageVersion)) {
  throw new Error(`Versões divergentes: package=${packageVersion}; core=${coreVersion}; worker=${workerVersion}; cache=${cacheVersion}`);
}

for (const file of files(join(ROOT, "js"), ".js")) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/(?:from\s+|import\s*\()["'](\.{1,2}\/[^"']+)["']/gu)) {
    const dependency = normalize(join(dirname(file), match[1]));
    if (!existsSync(dependency)) throw new Error(`Import ausente em ${file}: ${match[1]}`);
  }
}

for (const match of worker.matchAll(/["']\.\/([^"']+)["']/gu)) {
  const resource = match[1];
  if (resource && !existsSync(join(ROOT, resource))) throw new Error(`Recurso do service worker ausente: ${resource}`);
}

const html = readFileSync(join(ROOT, "index.html"), "utf8");
const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gu)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) throw new Error(`IDs HTML duplicados: ${[...new Set(duplicates)].join(", ")}`);
for (const match of html.matchAll(/\b(?:aria-controls|for)=["']([^"']+)["']/gu)) {
  if (!ids.includes(match[1])) throw new Error(`Referência HTML sem alvo: ${match[1]}`);
}
if (/\son[a-z]+\s*=/iu.test(html)) throw new Error("Eventos inline não são permitidos no HTML.");

const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.webmanifest"), "utf8"));
for (const icon of manifest.icons ?? []) {
  if (!existsSync(join(ROOT, icon.src.replace(/^\.\//u, "")))) throw new Error(`Ícone do manifest ausente: ${icon.src}`);
}

for (const file of files(join(ROOT, "tests"), ".js")) {
  const source = readFileSync(file, "utf8");
  if (/\b(?:test|it|describe)\.(?:skip|only)\s*\(/u.test(source)) throw new Error(`Teste desativado ou exclusivo em ${file}`);
}

process.stdout.write(`QA de release: versão ${packageVersion}, imports, shell, cache, manifest e suíte íntegros.\n`);
