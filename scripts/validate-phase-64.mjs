import { readFileSync } from "node:fs";
import { join } from "node:path";
const root = process.cwd(); const read = (path) => readFileSync(join(root, path), "utf8");
for (const file of ["js/services/migration-service.js", "js/views/migration-view.js", "tests/unit/migrations.test.js", "tests/e2e/migration-center.spec.js", "docs/project/cycle-064-phase-64.md"]) read(file);
for (const locale of ["pt-BR", "en-US", "es"]) if (!read(`locales/${locale}.json`).includes('"migrationCenter"')) throw new Error(`Copy NexMigrate ausente em ${locale}.`);
if (!/migrações antigas → atuais preservam dados/u.test(read("docs/project/cycle-064-phase-64.md"))) throw new Error("Gate da Fase 64 ausente.");
process.stdout.write("Fase 64: migrações preservam dados.\n");
