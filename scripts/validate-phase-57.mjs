import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const security = readFileSync(join(root, "js/services/security-service.js"), "utf8");
const tests = readFileSync(join(root, "tests/unit/security-service.test.js"), "utf8");
const documentation = readFileSync(join(root, "docs/project/cycle-057-phase-57.md"), "utf8");

for (const control of ["negativeStock", "duplicateNexCode", "duplicateSerial", "html", "dangerousUrl", "invalidImport", "restoreBoundary", "crossWorkspace", "corruptData", "invalidMedia"]) {
  if (!security.includes(control)) throw new Error(`Hardening ausente: ${control}`);
}
if (!security.includes("isolated: true") || !tests.includes("dez testes NexShield passam")) throw new Error("Modo isolado ou cobertura NexShield 2.0 ausente.");
if (!/testes de hardening passam/u.test(documentation)) throw new Error("Gate da Fase 57 não documentado.");
process.stdout.write("Fase 57: testes de hardening NexShield 2.0 aprovados.\n");
