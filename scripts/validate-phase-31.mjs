import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const requiredFiles = [
  "js/views/settings-view.js",
  "tests/unit/settings-view.test.js",
  "tests/e2e/settings-navigation.spec.js",
  "docs/project/cycle-031-phase-31.md",
];
for (const file of requiredFiles) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 31 sem artefato obrigatório: ${file}`);
}

const settingsView = readFileSync(join(ROOT, "js/views/settings-view.js"), "utf8");
for (const contract of ["SETTINGS_SECTIONS", "createSettingsNav", "createSettingsPanel", "createSettingsView"]) {
  if (!settingsView.includes(contract)) throw new Error(`NexSettings sem contrato: ${contract}`);
}

const expectedSections = [
  ["summary", "/settings"],
  ["general", "/settings/general"],
  ["appearance", "/settings/appearance"],
  ["inventory", "/settings/inventory"],
  ["profiles", "/settings/profiles"],
  ["data", "/settings/data"],
  ["security", "/settings/security"],
  ["pwa", "/settings/pwa"],
  ["advanced", "/settings/advanced"],
];
const router = readFileSync(join(ROOT, "js/core/router.js"), "utf8");
for (const [id, route] of expectedSections) {
  if (!settingsView.includes(`id: "${id}", route: "${route}"`)) {
    throw new Error(`NexSettings sem seção ${id}: ${route}`);
  }
  if (!router.includes(`pattern: "${route}"`)) throw new Error(`Rota de configuração ausente: ${route}`);
}

const components = readFileSync(join(ROOT, "css/components.css"), "utf8");
const responsive = readFileSync(join(ROOT, "css/responsive.css"), "utf8");
for (const selector of [".settings-picker", ".settings-nav", '[aria-current="page"]']) {
  if (!components.includes(selector)) throw new Error(`NexSettings sem estilo obrigatório: ${selector}`);
}
if (!responsive.includes(".settings-layout") || !responsive.includes("grid-template-columns")) {
  throw new Error("NexSettings sem layout interno para desktop.");
}

for (const locale of ["pt-BR", "en-US", "es"]) {
  const catalog = JSON.parse(readFileSync(join(ROOT, "locales", `${locale}.json`), "utf8"));
  if (!catalog.settings?.navLabel || !catalog.settings?.sectionSelectorLabel) {
    throw new Error(`${locale}: navegação do NexSettings sem nome acessível.`);
  }
  for (const [id] of expectedSections) {
    if (!catalog.settings.sections?.[id]?.title || !catalog.settings.sections?.[id]?.description) {
      throw new Error(`${locale}: seção de configuração incompleta: ${id}.`);
    }
  }
}

const worker = readFileSync(join(ROOT, "service-worker.js"), "utf8");
const cachedPhase = Number(worker.match(/phase(\d+)/u)?.[1] ?? 0);
if (cachedPhase < 31) throw new Error("Cache offline não preserva a Fase 31.");

const backlog = readFileSync(join(ROOT, "docs/project/backlog.md"), "utf8");
const completedPhase = Number(backlog.match(/Fases 0 a (\d+) aprovadas/)?.[1] ?? 0);
if (completedPhase < 31) {
  throw new Error("Backlog não preserva a conclusão da Fase 31.");
}

process.stdout.write("Fase 31: SettingsShell, SettingsNav, SettingsPanel, nove rotas, desktop e mobile aprovados.\n");
