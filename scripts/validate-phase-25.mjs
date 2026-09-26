import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const required = [
  "docs/project/baseline-v1.0.0.md",
  "docs/project/cycle-025-phase-25.md",
  "docs/architecture/feature-traceability.md",
  "docs/project/backlog.md",
];

for (const file of required) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 25 sem artefato obrigatório: ${file}`);
}

const baseline = readFileSync(join(ROOT, required[0]), "utf8");
for (const evidence of ["npm test", "npm run validate", "npm run build:pages", "npm run validate:pages", "npm run verify:clean"]) {
  if (!baseline.includes(evidence)) throw new Error(`Baseline sem evidência prevista: ${evidence}`);
}

const traceability = readFileSync(join(ROOT, required[2]), "utf8");
for (const heading of ["Funcionalidade", "Serviço ou núcleo", "Provider ou persistência", "Teste ou gate", "Interface ou rota"]) {
  if (!traceability.includes(heading)) throw new Error(`Matriz sem dimensão obrigatória: ${heading}`);
}
const mappedRows = traceability.split("\n").filter((line) => line.startsWith("| ") && !line.includes("---"));
if (mappedRows.length < 16) throw new Error("Matriz de rastreabilidade possui cobertura insuficiente.");

const backlog = readFileSync(join(ROOT, required[3]), "utf8");
const completedPhase = Number(backlog.match(/Fases 0 a (\d+) aprovadas/u)?.[1]);
if (!Number.isInteger(completedPhase) || completedPhase < 25) {
  throw new Error("Backlog não preserva a conclusão da Fase 25.");
}

process.stdout.write("Fase 25: baseline e rastreabilidade aprovadas.\n");
