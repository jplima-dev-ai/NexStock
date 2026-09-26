import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
for (const file of ["js/services/scanner-service.js", "js/views/scan-view.js", "tests/unit/scanner-service.test.js", "tests/e2e/scan.spec.js", "docs/project/cycle-040-phase-40.md"]) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 40 sem artefato obrigatório: ${file}`);
}
const scanner = readFileSync(join(ROOT, "js/services/scanner-service.js"), "utf8");
for (const contract of ["NexScanService", "ScannerUnavailableError", "getUserMedia", "BarcodeDetector", "findProduct"]) if (!scanner.includes(contract)) throw new Error(`NexScan sem contrato: ${contract}`);
const view = readFileSync(join(ROOT, "js/views/scan-view.js"), "utf8");
for (const contract of ["scan-code", "scan-action", "manualMessage", "startCamera"]) if (!view.includes(contract)) throw new Error(`Interface NexScan incompleta: ${contract}`);
for (const locale of ["pt-BR", "en-US", "es"]) {
  const catalog = JSON.parse(readFileSync(join(ROOT, "locales", `${locale}.json`), "utf8"));
  for (const key of ["manualMessage", "cameraUnavailable", "useCode", "notFound"]) if (!catalog.scan?.[key]) throw new Error(`${locale}: texto NexScan ausente: ${key}.`);
}
const worker = readFileSync(join(ROOT, "service-worker.js"), "utf8");
for (const cached of ["scanner-service.js", "scan-view.js"]) if (!worker.includes(cached)) throw new Error(`Cache offline não cobre: ${cached}`);
if (!/phase(?:40|[4-9][0-9])/u.test(worker)) throw new Error("Cache offline não preserva a evolução posterior à fase 40.");
process.stdout.write("Fase 40: NexScan opcional por câmera e completo por código ou busca manual aprovado.\n");
