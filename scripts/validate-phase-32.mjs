import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const requiredFiles = [
  "js/services/settings-service.js",
  "tests/unit/settings-service.test.js",
  "tests/e2e/settings-navigation.spec.js",
  "docs/project/cycle-032-phase-32.md",
  "docs/releases/v1.1.0.md",
];
for (const file of requiredFiles) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 32 sem artefato obrigatório: ${file}`);
}

const service = readFileSync(join(ROOT, "js/services/settings-service.js"), "utf8");
for (const contract of ["normalizeSettingsPatch", "createSettingsSummaryModel", "updateWorkspace", "ALLOWED_KEYS"]) {
  if (!service.includes(contract)) throw new Error(`Settings Summary sem contrato: ${contract}`);
}
for (const setting of ["name", "currency", "timezone", "theme", "experienceMode"]) {
  if (!service.includes(`"${setting}"`)) throw new Error(`Salvamento seguro sem configuração: ${setting}`);
}

const settingsView = readFileSync(join(ROOT, "js/views/settings-view.js"), "utf8");
for (const contract of ["createSettingsSummary", "bindInstantSave", "createSafeSettingsForm", "confirmAction"]) {
  if (!settingsView.includes(contract)) throw new Error(`Settings Summary sem interface: ${contract}`);
}
for (const area of ["workspace", "appearance", "data", "security", "pwa"]) {
  if (!service.includes(`id: "${area}"`)) throw new Error(`Resumo sem área central: ${area}`);
}

for (const locale of ["pt-BR", "en-US", "es"]) {
  const catalog = JSON.parse(readFileSync(join(ROOT, "locales", `${locale}.json`), "utf8"));
  for (const area of ["workspace", "appearance", "data", "security", "pwa"]) {
    if (!catalog.settings?.summary?.cards?.[area]?.title || !catalog.settings.summary.cards[area].description) {
      throw new Error(`${locale}: resumo incompleto em ${area}.`);
    }
  }
  if (!catalog.settings?.save?.saved || !catalog.settings?.save?.error || !catalog.settingsCore?.confirmMessage) {
    throw new Error(`${locale}: estados de salvamento ou confirmação ausentes.`);
  }
}

const worker = readFileSync(join(ROOT, "service-worker.js"), "utf8");
const cachedPhase = Number(worker.match(/phase(\d+)/u)?.[1] ?? 0);
if (cachedPhase < 32 || !worker.includes("settings-service.js")) {
  throw new Error("Cache offline não cobre o Settings Summary.");
}

const packageVersion = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;
if (!/^(?:1\.(?:1|[2-9]\d*)\.\d+|2\.0\.0(?:-rc\.\d+)?)$/u.test(packageVersion)) throw new Error(`Release Experience Foundation não foi preservada: ${packageVersion}`);

const backlog = readFileSync(join(ROOT, "docs/project/backlog.md"), "utf8");
const completedPhase = Number(backlog.match(/Fases 0 a (\d+) aprovadas/)?.[1] ?? 0);
if (completedPhase < 32) {
  throw new Error("Backlog não preserva a conclusão da Fase 32.");
}

process.stdout.write("Fase 32: resumo, atalhos, estados, salvamento imediato seguro, confirmações e release 1.1.0 aprovados.\n");
