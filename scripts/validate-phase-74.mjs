import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, normalize, relative } from "node:path";

const root = process.cwd();
const sourceRoot = join(root, "js");
const requiredFiles = [
  "js/services/inventory-activity-service.js",
  "docs/project/cycle-074-phase-74.md",
  "docs/adr/0003-shared-inventory-activity-rule.md",
];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) throw new Error(`Evidência da Fase 74 ausente: ${file}.`);
}

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : (entry.name.endsWith(".js") ? [path] : []);
  });
}

const files = filesIn(sourceRoot);
const imports = new Map();
for (const file of files) {
  const content = readFileSync(file, "utf8");
  const id = relative(sourceRoot, file).replaceAll("\\", "/");
  if (id.startsWith("services/") && /from\s+["']\.\.\/(views|components)\//u.test(content)) {
    throw new Error(`Serviço não pode depender da interface: ${id}.`);
  }
  if (id.startsWith("storage/") && /from\s+["']\.\.\/(views|components|services)\//u.test(content)) {
    throw new Error(`Provider não pode depender de serviço ou interface: ${id}.`);
  }
  const dependencies = [];
  for (const match of content.matchAll(/from\s+["'](\.{1,2}\/[^"']+)["']/gu)) {
    const resolved = normalize(join(file, "..", match[1])).replace(/\\/gu, "/");
    const target = resolved.endsWith(".js") ? resolved : `${resolved}.js`;
    if (target.startsWith(sourceRoot.replace(/\\/gu, "/"))) dependencies.push(relative(sourceRoot, target).replaceAll("\\", "/"));
  }
  imports.set(id, dependencies);
}

const visiting = new Set();
const visited = new Set();
function visit(file, chain = []) {
  if (visiting.has(file)) throw new Error(`Dependência circular detectada: ${[...chain, file].join(" -> ")}.`);
  if (visited.has(file)) return;
  visiting.add(file);
  for (const dependency of imports.get(file) ?? []) visit(dependency, [...chain, file]);
  visiting.delete(file);
  visited.add(file);
}
for (const file of imports.keys()) visit(file);

const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (Object.keys(packageJson.dependencies ?? {}).length > 0) throw new Error("A Fase 74 não permite nova dependência de runtime sem ADR específico.");
if (!/APROVADO/u.test(readFileSync(join(root, "docs/project/cycle-074-phase-74.md"), "utf8"))) throw new Error("Gate da Fase 74 não foi registrado.");
process.stdout.write(`Fase 74: ${files.length} módulos auditados sem ciclos, violações de camada ou dependências de runtime.\n`);
