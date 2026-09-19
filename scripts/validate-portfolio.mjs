import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { TOUR_STEPS } from "../js/views/tour-view.js";

const root = process.cwd();
const required = [
  "assets/screenshots/welcome.jpg", "assets/screenshots/dashboard-demo.jpg",
  "docs/getting-started.md", "docs/accessibility.md", "docs/security.md",
  "docs/testing.md", "docs/project/cycle-023-phase-23.md",
];
for (const file of required) if (!existsSync(join(root, file))) throw new Error(`Portfólio sem arquivo obrigatório: ${file}`);

if (TOUR_STEPS.length !== 6) throw new Error("Demo Tour deve possuir exatamente seis etapas.");
const expectedSteps = ["pulse", "products", "insight", "scenario", "profiles", "shield"];
if (JSON.stringify(TOUR_STEPS.map(({ id }) => id)) !== JSON.stringify(expectedSteps)) throw new Error("Ordem do Demo Tour diverge do blueprint.");

const readme = readFileSync(join(root, "README.md"), "utf8");
const order = ["assets/brand/logos/nexstock-main-logo-16x9.png", "## Links", "assets/brand/scenes/nexstock-brand-scene-16x9.jpg", "## Recursos principais", "## Arquitetura", "## Acessibilidade", "## Segurança", "## PWA", "## Screenshots"];
let cursor = -1;
for (const marker of order) {
  const position = readme.indexOf(marker);
  if (position <= cursor) throw new Error(`Ordem do README inválida ou item ausente: ${marker}`);
  cursor = position;
}
for (const phrase of ["#/tour", "sem cadastrar", "demo data", "datos de demostración"]) {
  const sources = `${readme}\n${readFileSync(join(root, "locales/pt-BR.json"), "utf8")}\n${readFileSync(join(root, "locales/en-US.json"), "utf8")}\n${readFileSync(join(root, "locales/es.json"), "utf8")}`;
  if (!sources.toLocaleLowerCase().includes(phrase.toLocaleLowerCase())) throw new Error(`Gate do portfólio sem evidência: ${phrase}`);
}

process.stdout.write("Portfólio: README, Demo Tour em seis etapas, screenshots e documentação aprovados.\n");
