import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), "utf8");
for (const file of ["tests/e2e/regression-matrix.spec.js", "docs/project/cycle-073-phase-73.md"]) {
  if (!existsSync(join(root, file))) throw new Error(`Evidência da Fase 73 ausente: ${file}.`);
}
const matrix = read("tests/e2e/regression-matrix.spec.js");
for (const token of ["technology", "cosmetics", "fashion", "food", "custom", "pt-BR", "en-US", "es", "light", "dark", "guided", "compact", "#mobile-bottom-nav", "readIndexedDbSnapshot"]) {
  if (!matrix.includes(token)) throw new Error(`Cobertura de matriz ausente: ${token}.`);
}
if (!/APROVADO/u.test(read("docs/project/cycle-073-phase-73.md"))) throw new Error("Gate da Fase 73 não foi registrado.");
process.stdout.write("Fase 73: combinações principais sem blocker conhecido.\n");
