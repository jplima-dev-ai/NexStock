import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "docs/project/release-candidate-policy.md",
  "docs/project/cycle-077-phase-77.md",
  "docs/architecture/feature-traceability.md"
];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) throw new Error(`Evidência da Fase 77 ausente: ${file}.`);
}

const packageVersion = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
const core = readFileSync(join(root, "js/core/version.js"), "utf8");
const worker = readFileSync(join(root, "service-worker.js"), "utf8");
const policy = readFileSync(join(root, "docs/project/release-candidate-policy.md"), "utf8");
const cycle = readFileSync(join(root, "docs/project/cycle-077-phase-77.md"), "utf8");

const finalRelease = packageVersion === "2.0.0" && existsSync(join(root, "scripts/validate-phase-78.mjs"));
if (packageVersion !== "2.0.0-rc.1" && !finalRelease) throw new Error(`RC esperado 2.0.0-rc.1 ou release final auditada; package.json contém ${packageVersion}.`);
if (!core.includes(`APP_VERSION = \"${packageVersion}\"`)) throw new Error("Versão RC ausente do núcleo.");
if (!worker.includes(`APP_VERSION = \"${packageVersion}\"`) || !worker.includes(`nexstock-shell-v${packageVersion}-`)) throw new Error("Versão RC ou cache PWA incoerente.");

for (const category of ["bug", "segurança", "acessibilidade", "performance", "regressão", "copy"]) {
  if (!policy.includes(category)) throw new Error(`Política RC não restringe alterações a ${category}.`);
}
if (!/APROVADO/u.test(cycle)) throw new Error("Gate da Fase 77 não foi registrado.");
if (/versão estável `2\.0\.0`\s+foi formalizada/iu.test(cycle) && !finalRelease) throw new Error("A Fase 77 não pode formalizar a versão estável 2.0.0.");

process.stdout.write(`Fase 77: ${packageVersion} coerente e congelamento de funcionalidades registrado.\n`);
