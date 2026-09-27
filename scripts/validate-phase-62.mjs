import { readFileSync } from "node:fs";
import { join } from "node:path";
const root = process.cwd(); const read = (path) => readFileSync(join(root, path), "utf8");
for (const file of ["js/services/offline-experience-service.js", "js/views/offline-experience-view.js", "tests/unit/offline-experience-service.test.js", "tests/e2e/offline-experience.spec.js", "docs/project/cycle-062-phase-62.md"]) read(file);
for (const locale of ["pt-BR", "en-US", "es"]) if (!read(`locales/${locale}.json`).includes('"offlineExperience"')) throw new Error(`Copy offline ausente em ${locale}.`);
if (!/estados de conectividade são claros/u.test(read("docs/project/cycle-062-phase-62.md"))) throw new Error("Gate da Fase 62 ausente.");
process.stdout.write("Fase 62: estados de conectividade claros.\n");
