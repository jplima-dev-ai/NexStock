import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
for (const file of ["tests/unit/global-search-command.test.js", "tests/e2e/command-center.spec.js", "docs/project/cycle-038-phase-38.md"]) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 38 sem artefato obrigatório: ${file}`);
}
const search = readFileSync(join(ROOT, "js/services/global-search-service.js"), "utf8");
for (const contract of ["NEX_QUERY_PATTERNS", "parseNexQuery", "status: \"critical\"", "archived: \"archived\"", "module: \"serial\"", "buscar"]) {
  if (!search.includes(contract)) throw new Error(`NexQuery sem contrato: ${contract}`);
}
const app = readFileSync(join(ROOT, "js/app.js"), "utf8");
for (const contract of ["parseNexQuery", "productFilters", "queryActions"]) if (!app.includes(contract)) throw new Error(`NexQuery sem integração: ${contract}`);
const productView = readFileSync(join(ROOT, "js/views/product-view.js"), "utf8");
for (const contract of ["initialFilters.query", "initialFilters.module", "initialFilters.archived", "product-status-filter"]) {
  if (!productView.includes(contract)) throw new Error(`NexQuery não aplica filtro: ${contract}`);
}
for (const locale of ["pt-BR", "en-US", "es"]) {
  const catalog = JSON.parse(readFileSync(join(ROOT, "locales", `${locale}.json`), "utf8"));
  for (const key of ["critical", "out", "attention", "healthy", "archived", "serial", "expiry", "search"]) if (!catalog.commandPalette?.queryActions?.[key]) throw new Error(`${locale}: consulta NexQuery sem texto: ${key}.`);
}
const worker = readFileSync(join(ROOT, "service-worker.js"), "utf8");
if (Number(worker.match(/phase(\d+)/u)?.[1] ?? 0) < 38 || !worker.includes("global-search-service.js")) throw new Error("Cache offline não cobre NexQuery.");
process.stdout.write("Fase 38: NexQuery local converte consultas suportadas em filtros verificáveis.\n");
