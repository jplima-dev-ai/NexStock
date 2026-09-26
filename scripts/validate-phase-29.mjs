import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const requiredFiles = [
  "js/components/content-state.js",
  "tests/e2e/copy.spec.js",
  "docs/architecture/content-design.md",
  "docs/project/cycle-029-phase-29.md",
];
for (const file of requiredFiles) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 29 sem artefato obrigatório: ${file}`);
}

const field = readFileSync(join(ROOT, "js/components/field.js"), "utf8");
for (const contract of ["helpText", "exampleText", "errorText", "aria-describedby", "aria-invalid"]) {
  if (!field.includes(contract)) throw new Error(`NexCopy sem estrutura de campo: ${contract}`);
}

const emptyState = readFileSync(join(ROOT, "js/components/empty-state.js"), "utf8");
for (const kind of ["first-use", "filtered", "positive", "unavailable", "insufficient-data"]) {
  if (!emptyState.includes(kind)) throw new Error(`NexCopy sem categoria de estado vazio: ${kind}`);
}

const contentState = readFileSync(join(ROOT, "js/components/content-state.js"), "utf8");
for (const contract of ["loading", "offline", "success", "warning", "error", "aria-live", "aria-busy"]) {
  if (!contentState.includes(contract)) throw new Error(`NexCopy sem estado de conteúdo: ${contract}`);
}

const views = ["product-view.js", "movement-view.js", "scenario-view.js", "custom-field-view.js", "onboarding-view.js"]
  .map((file) => readFileSync(join(ROOT, "js/views", file), "utf8"))
  .join("\n");
for (const key of ["nameHelp", "minimumHelp", "quantityHelp", "reasonHelp", "valueHelp", "labelHelp", "workspaceNameHelp"]) {
  if (!views.includes(key)) throw new Error(`Campo importante sem explicação explícita: ${key}`);
}
if (/setAttribute\(["']title["']/u.test(views)) throw new Error("Informação importante não pode depender de tooltip nativo.");

for (const locale of ["pt-BR", "en-US", "es"]) {
  const catalog = JSON.parse(readFileSync(join(ROOT, "locales", `${locale}.json`), "utf8"));
  for (const value of [
    catalog.productCore.nameHelp,
    catalog.productCore.minimumHelp,
    catalog.productCore.minimumExample,
    catalog.movement.reasonHelp,
    catalog.movement.reasonExample,
    catalog.scenarioCore.valueHelp,
    catalog.customFields.labelHelp,
    catalog.onboarding.workspaceNameExample,
  ]) {
    if (!value || value.length < 8) throw new Error(`${locale}: campo importante sem NexCopy completo.`);
  }
}

const backlog = readFileSync(join(ROOT, "docs/project/backlog.md"), "utf8");
const completedPhase = Number(backlog.match(/Fases 0 a (\d+) aprovadas/)?.[1] ?? 0);
if (completedPhase < 29) {
  throw new Error("Backlog não preserva a conclusão da Fase 29.");
}

process.stdout.write("Fase 29: formulários, ações, erros, confirmações, estados vazios, carregamento, offline, avisos, sucesso e tooltips revisados.\n");
