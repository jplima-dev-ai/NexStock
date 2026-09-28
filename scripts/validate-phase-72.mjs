import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), "utf8");
for (const file of ["tests/e2e/system-integration.spec.js", "docs/project/cycle-072-phase-72.md"]) {
  if (!existsSync(join(root, file))) throw new Error(`Evidência da Fase 72 ausente: ${file}.`);
}
const integration = read("tests/e2e/system-integration.spec.js");
for (const contract of ["/products/new", "Movimentar estoque", "/dashboard", "/scenario", "/time-machine", "/settings/data/privacy", "/settings/pwa", "/shield-test"]) {
  if (!integration.includes(contract)) throw new Error(`Fluxo integrado ausente: ${contract}.`);
}
if (!/APROVADO/u.test(read("docs/project/cycle-072-phase-72.md"))) throw new Error("Gate da Fase 72 não foi registrado.");
process.stdout.write("Fase 72: módulos centrais validados como um único produto.\n");
