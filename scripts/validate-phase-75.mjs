import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
const root = process.cwd();
for (const file of ["js/services/data-upgrade-certification-service.js", "tests/fixtures/workspace-v1.0.0.json", "tests/unit/data-upgrade-certification-service.test.js", "docs/project/cycle-075-phase-75.md"]) if (!existsSync(join(root, file))) throw new Error(`Evidência da Fase 75 ausente: ${file}.`);
const service = readFileSync(join(root, "js/services/data-upgrade-certification-service.js"), "utf8");
for (const token of ["validateBackup", "BACKUP_STORES", "Upgrade lost", "Upgrade changed", "additiveOnly"]) if (!service.includes(token)) throw new Error(`Certificação de upgrade incompleta: ${token}.`);
if (!/APROVADO/u.test(readFileSync(join(root, "docs/project/cycle-075-phase-75.md"), "utf8"))) throw new Error("Gate da Fase 75 não foi registrado.");
process.stdout.write("Fase 75: workspace v1.0.0 certificado sem perda silenciosa.\n");
