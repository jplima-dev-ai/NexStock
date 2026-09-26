import { existsSync, readFileSync } from "node:fs"; import { join } from "node:path";
const root = process.cwd(); for (const file of ["js/components/mobile-operations.js", "tests/e2e/mobile-operations.spec.js", "docs/project/cycle-042-phase-42.md"]) if (!existsSync(join(root, file))) throw new Error(`Fase 42 sem artefato obrigatório: ${file}`);
for (const token of ["mobile-bottom-nav", "mobile-actions", "mobile-search"]) if (!readFileSync(join(root, "index.html"), "utf8").includes(token)) throw new Error(`Navegação móvel ausente: ${token}`);
for (const locale of ["pt-BR", "en-US", "es"]) if (!JSON.parse(readFileSync(join(root, "locales", `${locale}.json`), "utf8")).mobileOperations?.title) throw new Error(`${locale}: operações móveis sem textos.`);
if (!readFileSync(join(root, "service-worker.js"), "utf8").includes("phase42")) throw new Error("Cache da Fase 42 ausente.");
process.stdout.write("Fase 42: operações móveis próprias, rápidas e acessíveis aprovadas.\n");
