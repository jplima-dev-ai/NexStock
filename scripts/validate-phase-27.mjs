import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const requiredFiles = [
  "js/components/icon.js",
  "tests/unit/icon.test.js",
  "tests/e2e/design-system.spec.js",
  "docs/project/cycle-027-phase-27.md",
];
for (const file of requiredFiles) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 27 sem artefato obrigatório: ${file}`);
}

const tokens = readFileSync(join(ROOT, "css/tokens.css"), "utf8");
for (const token of [
  "--ns-font-size-display", "--ns-font-size-heading-xl", "--ns-font-size-heading-l",
  "--ns-font-size-heading-m", "--ns-font-size-body", "--ns-font-size-body-small",
  "--ns-font-size-label", "--ns-font-size-metric", "--ns-font-family-data",
  "--ns-color-background", "--ns-color-surface", "--ns-color-surface-alt",
  "--ns-color-elevated", "--ns-color-overlay", "--ns-space-16",
]) {
  if (!tokens.includes(token)) throw new Error(`NexDesign sem token formal: ${token}`);
}
if (!tokens.includes('[data-theme="dark"]') || !tokens.includes("color-scheme: dark")) {
  throw new Error("NexDesign sem tratamento próprio para o tema escuro.");
}

const componentCss = readFileSync(join(ROOT, "css/components.css"), "utf8");
for (const contract of [".ns-card--elevated", ".ns-table__sort", '[aria-selected="true"]', ".ns-icon", ".ns-alert__icon"]) {
  if (!componentCss.includes(contract)) throw new Error(`NexDesign sem contrato visual: ${contract}`);
}
const responsiveCss = readFileSync(join(ROOT, "css/responsive.css"), "utf8");
if (!responsiveCss.includes('[data-mobile-layout="cards"]')) throw new Error("Tabelas sem layout móvel em cards.");

const table = readFileSync(join(ROOT, "js/components/table.js"), "utf8");
for (const contract of ["sortable", "aria-sort", "density", "mobileLayout", "isRowSelected"]) {
  if (!table.includes(contract)) throw new Error(`Tabela sem capacidade NexDesign: ${contract}`);
}

const backlog = readFileSync(join(ROOT, "docs/project/backlog.md"), "utf8");
const completedPhase = Number(backlog.match(/Fases 0 a (\d+) aprovadas/u)?.[1]);
if (!Number.isInteger(completedPhase) || completedPhase < 27) {
  throw new Error("Backlog não preserva a conclusão da Fase 27.");
}

process.stdout.write("Fase 27: tokens, tipografia, superfícies, cards, tabelas, estados, temas e iconografia aprovados.\n");
