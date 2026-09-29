import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), "utf8");
const router = read("js/core/router.js");
const routeView = read("js/views/route-view.js");
const shell = read("index.html");
const accessibility = read("css/accessibility.css");
const intelligence = read("js/services/intelligence-service.js");
const settings = read("js/views/settings-view.js");
const routeKeys = [...router.matchAll(/messageKey: "([^"]+)"/gu)].map((match) => match[1]);

for (const locale of ["pt-BR", "en-US", "es"]) {
  const catalog = JSON.parse(read(`locales/${locale}.json`));
  for (const key of routeKeys) {
    if (!catalog.routes?.[key]?.title || !catalog.routes[key].description) throw new Error(`${locale}: rota sem copy coerente: ${key}.`);
  }
}
for (const href of shell.matchAll(/href="#([^"]+)"/gu)) {
  if (!href[1].startsWith("/")) continue;
  const target = href[1].replace(/\/[\w-]+$/u, "/:id");
  if (!router.includes(`pattern: "${href[1]}"`) && !router.includes(`pattern: "${target}"`)) throw new Error(`Navegação aponta para rota desconhecida: #${href[1]}.`);
}
for (const contract of ["route-title", "tabIndex = -1", "createAlert", "createSettingsView"]) {
  if (!routeView.includes(contract)) throw new Error(`Contrato de rota incoerente: ${contract}.`);
}
for (const contract of ["prefers-reduced-motion", ":focus-visible"]) {
  if (!accessibility.includes(contract)) throw new Error(`Contrato de acessibilidade ausente: ${contract}.`);
}
for (const contract of ["explanation", "lineage", "suggestedActions"]) {
  if (!intelligence.includes(contract)) throw new Error(`Inteligência sem coerência explicável: ${contract}.`);
}
if (!settings.includes("createSettingsSummaryModel")) throw new Error("Settings não reutiliza seu resumo coerente.");
process.stdout.write(`Fase 76: ${routeKeys.length} rotas, copy, navegação, motion, erros, Settings e Intelligence coerentes.\n`);
