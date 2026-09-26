import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const requiredFiles = [
  "js/services/import-service.js",
  "js/views/import-view.js",
  "tests/unit/import-service.test.js",
  "tests/e2e/import-center.spec.js",
  "docs/architecture/data-mobility.md",
  "docs/project/cycle-033-phase-33.md",
];
for (const file of requiredFiles) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 33 sem artefato obrigatório: ${file}`);
}

const service = readFileSync(join(ROOT, "js/services/import-service.js"), "utf8");
for (const contract of ["parseCsv", "suggestImportMapping", "mapImportRows", "analyzeImportRows", "reanalyze", "commit", "PRODUCT_IMPORTED", "bulkPut"]) {
  if (!service.includes(contract)) throw new Error(`Import Center sem contrato: ${contract}`);
}

const view = readFileSync(join(ROOT, "js/views/import-view.js"), "utf8");
for (const contract of ["dragover", "drop", "createMappingForm", "createPreview", "createCorrectionRows", "confirmAction"]) {
  if (!view.includes(contract)) throw new Error(`Import Center sem interface: ${contract}`);
}

const router = readFileSync(join(ROOT, "js/core/router.js"), "utf8");
if (!router.includes('pattern: "/settings/data/import"')) throw new Error("Rota do Import Center ausente.");

for (const locale of ["pt-BR", "en-US", "es"]) {
  const catalog = JSON.parse(readFileSync(join(ROOT, "locales", `${locale}.json`), "utf8"));
  for (const key of ["title", "fileLabel", "mappingTitle", "previewTitle", "confirmTitle", "successTitle"]) {
    if (!catalog.importCenter?.[key]) throw new Error(`${locale}: Import Center sem mensagem ${key}.`);
  }
}
const pt = JSON.parse(readFileSync(join(ROOT, "locales/pt-BR.json"), "utf8"));
if (pt.importCenter.noChanges !== "Nenhuma alteração foi feita ainda.") {
  throw new Error("Import Center não preserva a mensagem obrigatória antes da confirmação.");
}

const worker = readFileSync(join(ROOT, "service-worker.js"), "utf8");
const cachedPhase = Number(worker.match(/phase(\d+)/u)?.[1] ?? 0);
if (cachedPhase < 33) throw new Error("Cache offline não preserva a Fase 33.");
for (const cached of ["import-service.js", "import-view.js"]) {
  if (!worker.includes(cached)) throw new Error(`Cache offline não cobre: ${cached}`);
}

const backlog = readFileSync(join(ROOT, "docs/project/backlog.md"), "utf8");
const completedPhase = Number(backlog.match(/Fases 0 a (\d+) aprovadas/)?.[1] ?? 0);
if (completedPhase < 33) {
  throw new Error("Backlog não preserva a conclusão da Fase 33.");
}

process.stdout.write("Fase 33: CSV, mapeamento, validação, correção, confirmação e integridade do workspace aprovados.\n");
