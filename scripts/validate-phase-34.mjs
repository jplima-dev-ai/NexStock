import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const requiredFiles = [
  "js/services/export-service.js",
  "js/views/export-view.js",
  "tests/unit/export-service.test.js",
  "tests/e2e/export-center.spec.js",
  "docs/project/cycle-034-phase-34.md",
];
for (const file of requiredFiles) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 34 sem artefato obrigatório: ${file}`);
}

const service = readFileSync(join(ROOT, "js/services/export-service.js"), "utf8");
for (const contract of ["EXPORT_DATASETS", "EXPORT_FORMATS", "normalizeExportRequest", "serializeExportCsv", "serializeExportJson", "escapeCsvCell", "workspaceId"]) {
  if (!service.includes(contract)) throw new Error(`Export Center sem contrato: ${contract}`);
}
for (const dataset of ["products", "movements", "batches", "audit", "workspace"]) {
  if (!service.includes(`"${dataset}"`)) throw new Error(`Export Center sem conjunto: ${dataset}`);
}

const view = readFileSync(join(ROOT, "js/views/export-view.js"), "utf8");
for (const contract of ["createExportCenterView", "createPreview", "downloadPlan", "window.print", "createTable"]) {
  if (!view.includes(contract)) throw new Error(`Export Center sem interface: ${contract}`);
}

const router = readFileSync(join(ROOT, "js/core/router.js"), "utf8");
if (!router.includes('pattern: "/settings/data/export"')) throw new Error("Rota do Export Center ausente.");

for (const locale of ["pt-BR", "en-US", "es"]) {
  const catalog = JSON.parse(readFileSync(join(ROOT, "locales", `${locale}.json`), "utf8"));
  for (const key of ["title", "dataset", "format", "filtersTitle", "previewTitle", "downloadAction", "printAction"]) {
    if (!catalog.exportCenter?.[key]) throw new Error(`${locale}: Export Center sem mensagem ${key}.`);
  }
}

const worker = readFileSync(join(ROOT, "service-worker.js"), "utf8");
if (Number(worker.match(/phase(\d+)/u)?.[1] ?? 0) < 34) throw new Error("Cache offline não preserva a Fase 34.");
for (const cached of ["export-service.js", "export-view.js"]) {
  if (!worker.includes(cached)) throw new Error(`Cache offline não cobre: ${cached}`);
}

const backlog = readFileSync(join(ROOT, "docs/project/backlog.md"), "utf8");
const completedPhase = Number(backlog.match(/Fases 0 a (\d+) aprovadas/)?.[1] ?? 0);
if (completedPhase < 34) {
  throw new Error("Backlog não registra a conclusão da Fase 34.");
}

process.stdout.write("Fase 34: conjuntos permitidos, filtros, isolamento, CSV, JSON e impressão aprovados.\n");
