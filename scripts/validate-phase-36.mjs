import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = process.cwd();
for (const file of ["js/services/snapshot-service.js", "js/views/snapshot-view.js", "tests/unit/snapshot-service.test.js", "tests/e2e/snapshot-center.spec.js", "docs/project/cycle-036-phase-36.md"]) if (!existsSync(join(ROOT, file))) throw new Error(`Fase 36 sem artefato obrigatório: ${file}`);
const service = readFileSync(join(ROOT, "js/services/snapshot-service.js"), "utf8");
for (const contract of ["SNAPSHOT_SCHEMA", "MAX_LOCAL_SNAPSHOTS", "create", "restore", "before-snapshot-restore", "BackupService"]) if (!service.includes(contract)) throw new Error(`Snapshots sem contrato: ${contract}`);
const backup = readFileSync(join(ROOT, "js/services/backup-service.js"), "utf8");
for (const contract of ["isLocalSnapshotSetting", "localSnapshots", "settings"]) if (!backup.includes(contract)) throw new Error(`Backup não preserva snapshots: ${contract}`);
if (!readFileSync(join(ROOT, "js/core/router.js"), "utf8").includes('pattern: "/settings/data/snapshots"')) throw new Error("Rota de snapshots ausente.");
for (const locale of ["pt-BR", "en-US", "es"]) { const catalog = JSON.parse(readFileSync(join(ROOT, "locales", `${locale}.json`), "utf8")); for (const key of ["title", "createAction", "restoreAction", "deleteAction", "restoreConfirmAction"]) if (!catalog.snapshotCenter?.[key]) throw new Error(`${locale}: Snapshots sem mensagem ${key}.`); }
const worker = readFileSync(join(ROOT, "service-worker.js"), "utf8");
if (Number(worker.match(/phase(\d+)/u)?.[1] ?? 0) < 36) throw new Error("Cache offline não preserva a Fase 36.");
for (const cached of ["snapshot-service.js", "snapshot-view.js"]) if (!worker.includes(cached)) throw new Error(`Cache offline não cobre: ${cached}`);
process.stdout.write("Fase 36: snapshots locais, histórico preservado e restauração segura aprovados.\n");
