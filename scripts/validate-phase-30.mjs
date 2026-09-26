import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const requiredFiles = [
  "js/services/copy-service.js",
  "js/views/glossary-view.js",
  "tests/unit/copy-service.test.js",
  "tests/unit/glossary.test.js",
  "tests/e2e/contextual-copy.spec.js",
  "docs/project/cycle-030-phase-30.md",
];
for (const file of requiredFiles) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 30 sem artefato obrigatório: ${file}`);
}

const copyService = readFileSync(join(ROOT, "js/services/copy-service.js"), "utf8");
for (const contract of ["guided", "compact", "profileExamples", "helpText", "exampleText", "modeMessage"]) {
  if (!copyService.includes(contract)) throw new Error(`NexCopy contextual sem contrato: ${contract}`);
}

const glossary = readFileSync(join(ROOT, "js/views/glossary-view.js"), "utf8");
for (const term of ["workspace", "nexCode", "minimumStock", "tracking", "nexPulse", "forecast", "stockMemory", "scenario", "archived"]) {
  if (!glossary.includes(`\"${term}\"`)) throw new Error(`Glossário sem termo central: ${term}`);
}

const routes = readFileSync(join(ROOT, "js/core/router.js"), "utf8");
const shell = readFileSync(join(ROOT, "index.html"), "utf8");
if (!routes.includes('pattern: "/glossary"') || !shell.includes('href="#/glossary"')) {
  throw new Error("Glossário não está disponível por rota e navegação.");
}

const profiles = ["technology", "cosmetics", "fashion", "food", "custom"];
const glossaryTerms = ["workspace", "nexCode", "minimumStock", "tracking", "nexPulse", "forecast", "stockMemory", "scenario", "archived"];
for (const locale of ["pt-BR", "en-US", "es"]) {
  const catalog = JSON.parse(readFileSync(join(ROOT, "locales", `${locale}.json`), "utf8"));
  if (!catalog.nexCopy?.mode?.guided || !catalog.nexCopy?.mode?.compact) throw new Error(`${locale}: modos contextuais ausentes.`);
  for (const profile of profiles) {
    const examples = catalog.nexCopy?.profileExamples?.[profile];
    for (const key of ["productName", "location", "description", "movementReason"]) {
      if (!examples?.[key]) throw new Error(`${locale}: exemplo ${profile}.${key} ausente.`);
    }
  }
  for (const term of glossaryTerms) {
    if (!catalog.glossary?.terms?.[term]?.term || !catalog.glossary?.terms?.[term]?.definition) {
      throw new Error(`${locale}: glossário incompleto em ${term}.`);
    }
  }
}

const backlog = readFileSync(join(ROOT, "docs/project/backlog.md"), "utf8");
const completedPhase = Number(backlog.match(/Fases 0 a (\d+) aprovadas/)?.[1] ?? 0);
if (completedPhase < 30) {
  throw new Error("Backlog não preserva a conclusão da Fase 30.");
}

process.stdout.write("Fase 30: modos guiado e compacto, exemplos por perfil, glossário e terminologia PT/EN/ES aprovados.\n");
