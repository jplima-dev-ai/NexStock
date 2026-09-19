import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const requiredFiles = [
  "index.html",
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "NEXSTOCK-BLUEPRINT-v1.1.md",
  "manifest.webmanifest",
  "service-worker.js",
  "js/app.js",
  "js/core/router.js",
];

const missingFiles = requiredFiles.filter((file) => !existsSync(join(ROOT, file)));
if (missingFiles.length > 0) {
  throw new Error(`Arquivos obrigatórios ausentes: ${missingFiles.join(", ")}`);
}

const index = readFileSync(join(ROOT, "index.html"), "utf8");
for (const fragment of [
  "Pular para o conteúdo principal",
  'id="main-content"',
  'type="module"',
  'href="#/dashboard"',
]) {
  if (!index.includes(fragment)) throw new Error(`index.html não contém: ${fragment}`);
}

function listJavaScriptFiles(directory) {
  return readdirSync(join(ROOT, directory), { withFileTypes: true }).flatMap((entry) => {
    const relativePath = join(directory, entry.name);
    if (entry.isDirectory()) return listJavaScriptFiles(relativePath);
    return entry.isFile() && entry.name.endsWith(".js") ? [relativePath] : [];
  });
}

for (const file of listJavaScriptFiles("js")) {
  const source = readFileSync(join(ROOT, file), "utf8");
  const forbiddenPatterns = [/\beval\s*\(/u, /\bnew\s+Function\s*\(/u, /\.innerHTML\s*=/u, /insertAdjacentHTML\s*\(/u, /document\.write\s*\(/u];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(source)) throw new Error(`${file} contém padrão proibido: ${pattern}`);
  }
}

const csp = index.match(/http-equiv="Content-Security-Policy"[\s\S]*?content="([^"]+)"/u)?.[1] ?? "";
for (const directive of ["default-src", "script-src", "style-src", "img-src", "font-src", "connect-src", "object-src", "base-uri", "form-action"]) {
  if (!csp.includes(directive)) throw new Error(`CSP não contém a diretiva ${directive}.`);
}
if (/javascript:/iu.test(index) || /<script(?![^>]*\bsrc=)[^>]*>/iu.test(index)) throw new Error("HTML contém script inline ou URL perigosa.");

process.stdout.write("Validação estática inicial aprovada.\n");
