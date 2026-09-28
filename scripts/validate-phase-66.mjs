import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), "utf8");
for (const file of ["js/services/performance-service.js", "tests/unit/performance-service.test.js", "docs/project/cycle-066-phase-66.md"]) {
  if (!existsSync(join(root, file))) throw new Error(`Evidência da Fase 66 ausente: ${file}.`);
}
const performance = read("js/services/performance-service.js");
if (!performance.includes("indexRecordsBy") || !performance.includes("indexedRecords")) throw new Error("Índice local de leituras repetidas ausente.");
for (const file of ["js/services/dashboard-service.js", "js/services/insight-service.js", "js/services/intelligence-service.js"]) {
  if (!read(file).includes("performance-service.js")) throw new Error(`Cálculo repetido sem índice local: ${file}.`);
}
if (!read("service-worker.js").includes("performance-service.js")) throw new Error("PWA offline não pré-cacheia Performance Service.");
if (!/APROVADO/u.test(read("docs/project/cycle-066-phase-66.md"))) throw new Error("Gate da Fase 66 não foi registrado.");
process.stdout.write("Fase 66: cálculos locais indexados sem reduzir correção ou acessibilidade.\n");
