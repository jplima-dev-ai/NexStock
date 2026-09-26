import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const requiredFiles = [
  "playwright.config.js",
  "package-lock.json",
  "tests/e2e/helpers.js",
  "tests/e2e/smoke.spec.js",
  "tests/e2e/main-flow.spec.js",
  "tests/e2e/experience.spec.js",
  "tests/e2e/accessibility-offline.spec.js",
  "docs/project/cycle-026-phase-26.md",
];
for (const file of requiredFiles) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 26 sem artefato obrigatório: ${file}`);
}

const packageJson = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
for (const dependency of ["@playwright/test", "@sparticuz/chromium", "axe-core"]) {
  if (!packageJson.devDependencies?.[dependency]) throw new Error(`Fase 26 sem dependência reproduzível: ${dependency}`);
}
for (const script of ["test:e2e", "test:e2e:smoke"]) {
  if (!packageJson.scripts?.[script]) throw new Error(`Fase 26 sem script: ${script}`);
}
if (!packageJson.scripts.validate.includes("npm run test:e2e")) {
  throw new Error("O gate integrado não executa a suíte E2E.");
}

const workflow = readFileSync(join(ROOT, ".github/workflows/pages.yml"), "utf8");
if (!workflow.includes("run: npm ci") || !workflow.includes("run: npm run validate")) {
  throw new Error("CI não instala dependências reproduzíveis antes do gate completo.");
}

const backlog = readFileSync(join(ROOT, "docs/project/backlog.md"), "utf8");
const completedPhase = Number(backlog.match(/Fases 0 a (\d+) aprovadas/u)?.[1]);
if (!Number.isInteger(completedPhase) || completedPhase < 26) {
  throw new Error("Backlog não preserva a conclusão da Fase 26.");
}

const combinedTests = requiredFiles.filter((file) => file.includes("tests/e2e/")).map((file) => readFileSync(join(ROOT, file), "utf8")).join("\n");
for (const contract of ["indexedDB", "setOffline", "axe", "Control+K", "locale-select", "theme-toggle"]) {
  if (!combinedTests.includes(contract)) throw new Error(`Cobertura E2E ausente: ${contract}`);
}

process.stdout.write("Fase 26: Playwright, Chromium, axe, smoke, IndexedDB, idiomas, temas, teclado e offline configurados.\n");
