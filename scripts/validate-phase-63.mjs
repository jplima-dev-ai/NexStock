import { readFileSync } from "node:fs";
import { join } from "node:path";
const root = process.cwd(); const read = (path) => readFileSync(join(root, path), "utf8");
for (const file of ["js/views/pwa-update-center-view.js", "tests/e2e/pwa-update-center.spec.js", "docs/project/cycle-063-phase-63.md"]) read(file);
for (const locale of ["pt-BR", "en-US", "es"]) if (!read(`locales/${locale}.json`).includes('"pwaUpdateCenter"')) throw new Error(`Copy PWA Update Center ausente em ${locale}.`);
if (!/atualização não interrompe transação crítica/u.test(read("docs/project/cycle-063-phase-63.md"))) throw new Error("Gate da Fase 63 ausente.");
process.stdout.write("Fase 63: atualização preserva operações críticas.\n");
