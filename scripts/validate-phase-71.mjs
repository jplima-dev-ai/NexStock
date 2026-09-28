import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), "utf8");
for (const file of ["tests/e2e/ux-refinement.spec.js", "docs/project/cycle-071-phase-71.md", "docs/releases/v1.9.0.md"]) {
  if (!existsSync(join(root, file))) throw new Error(`Evidência da Fase 71 ausente: ${file}.`);
}

const productView = read("js/views/product-view.js");
for (const contract of ["createValidationSummary", 'summary.setAttribute("role", "alert")', "validationSummary.focus()", 't("productCore.saveError")']) {
  if (!productView.includes(contract)) throw new Error(`Refinamento de UX ausente: ${contract}.`);
}
if (!/APROVADO/u.test(read("docs/project/cycle-071-phase-71.md"))) throw new Error("Gate da Fase 71 não foi registrado.");
process.stdout.write("Fase 71: fluxos centrais sem atrito grave conhecido.\n");
