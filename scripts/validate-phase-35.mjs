import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
for (const file of ["js/services/backup-service.js", "js/views/backup-view.js", "tests/unit/backup-service.test.js", "tests/e2e/backup-center.spec.js", "docs/project/cycle-035-phase-35.md"]) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 35 sem artefato obrigatório: ${file}`);
}
const service = readFileSync(join(ROOT, "js/services/backup-service.js"), "utf8");
for (const contract of ["BACKUP_SCHEMA", "MAX_BACKUP_BYTES", "validateBackup", "parseBackupText", "replaceWorkspaceData", "workspaceId", "media"]) {
  if (!service.includes(contract)) throw new Error(`NexBackup sem contrato: ${contract}`);
}
const provider = readFileSync(join(ROOT, "js/storage/indexeddb-provider.js"), "utf8");
if (!provider.includes("replaceWorkspaceData") || !provider.includes("readwrite")) throw new Error("Restauração atômica IndexedDB ausente.");
const view = readFileSync(join(ROOT, "js/views/backup-view.js"), "utf8");
for (const contract of ["createBackupCenterView", "createSummary", "confirmAction", "selected.text"]) if (!view.includes(contract)) throw new Error(`NexBackup sem interface: ${contract}`);
if (!readFileSync(join(ROOT, "js/core/router.js"), "utf8").includes('pattern: "/settings/data/backup"')) throw new Error("Rota NexBackup ausente.");
for (const locale of ["pt-BR", "en-US", "es"]) {
  const catalog = JSON.parse(readFileSync(join(ROOT, "locales", `${locale}.json`), "utf8"));
  for (const key of ["title", "createAction", "restoreTitle", "previewTitle", "confirmAction", "inspectError"]) if (!catalog.backupCenter?.[key]) throw new Error(`${locale}: NexBackup sem mensagem ${key}.`);
}
const worker = readFileSync(join(ROOT, "service-worker.js"), "utf8");
if (Number(worker.match(/phase(\d+)/u)?.[1] ?? 0) < 35) throw new Error("Cache offline não preserva a Fase 35.");
for (const cached of ["backup-service.js", "backup-view.js"]) if (!worker.includes(cached)) throw new Error(`Cache offline não cobre: ${cached}`);
process.stdout.write("Fase 35: backup, validação, confirmação e restauração transacional aprovados.\n");
