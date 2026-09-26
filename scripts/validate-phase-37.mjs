import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
for (const file of ["tests/unit/global-search-command.test.js", "tests/e2e/command-center.spec.js", "docs/project/cycle-037-phase-37.md"]) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 37 sem artefato obrigatório: ${file}`);
}
const search = readFileSync(join(ROOT, "js/services/global-search-service.js"), "utf8");
for (const contract of ["parseProductCommand", "PRODUCT_COMMANDS", 'operation: "entry"', 'operation: "output"', 'operation: "open"', 'operation: "scenario"']) {
  if (!search.includes(contract)) throw new Error(`Command Center sem contrato: ${contract}`);
}
const app = readFileSync(join(ROOT, "js/app.js"), "utf8");
for (const contract of ["movementProductId", "scenarioProductId", "productActions", 'href: "#/movements"']) {
  if (!app.includes(contract)) throw new Error(`Command Center sem ação direcionada: ${contract}`);
}
const scenario = readFileSync(join(ROOT, "js/views/scenario-view.js"), "utf8");
if (!scenario.includes("initialProductId")) throw new Error("Scenario Lab não recebe o produto selecionado.");
for (const locale of ["pt-BR", "en-US", "es"]) {
  const catalog = JSON.parse(readFileSync(join(ROOT, "locales", `${locale}.json`), "utf8"));
  for (const key of ["open", "entry", "output", "scenario"]) if (!catalog.commandPalette?.productActions?.[key]) throw new Error(`${locale}: ação de produto ausente: ${key}.`);
}
const worker = readFileSync(join(ROOT, "service-worker.js"), "utf8");
if (Number(worker.match(/phase(\d+)/u)?.[1] ?? 0) < 37 || !worker.includes("global-search-service.js")) throw new Error("Cache offline não cobre o Command Center 2.0.");
process.stdout.write("Fase 37: Command Center executável por teclado e com contexto de produto aprovado.\n");
