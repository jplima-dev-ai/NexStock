import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), "utf8");
const evidence = [
  ["GitHub Pages abre", "tests/integration/static-hosting.test.js", "subdiretório"],
  ["PWA instala", "manifest.webmanifest", "standalone"],
  ["offline funciona", "tests/e2e/accessibility-offline.spec.js", "offline"],
  ["dados persistem", "tests/unit/workspace-service.test.js", "sobrevivem"],
  ["upgrade de v1.0", "tests/unit/data-upgrade-certification-service.test.js", "v1.0.0"],
  ["settings funciona", "tests/unit/settings-service.test.js", "SettingsService"],
  ["NexCopy completo", "scripts/validate-copy.mjs", "terminologia"],
  ["design consistente", "scripts/validate-design-system.mjs", "Design System"],
  ["reduced motion", "tests/e2e/motion.spec.js", "reduced"],
  ["Product Media", "tests/unit/media-service.test.js", "Product Media"],
  ["import/export", "tests/unit/import-service.test.js", "ImportService"],
  ["backup/restore", "tests/unit/backup-service.test.js", "backup"],
  ["scanner com fallback", "tests/e2e/scan.spec.js", "manual"],
  ["labels", "tests/e2e/labels.spec.js", "NexLabels"],
  ["Intelligence Engine", "tests/unit/intelligence-service.test.js", "signal"],
  ["Explainability", "tests/unit/intelligence-service.test.js", "explanation"],
  ["Data Lineage", "tests/unit/intelligence-service.test.js", "lineage"],
  ["NexPulse 2", "tests/unit/dashboard-service.test.js", "NexPulse"],
  ["Forecast 2", "tests/unit/insight-service.test.js", "forecast"],
  ["Anomaly", "tests/unit/intelligence-service.test.js", "anomaly"],
  ["Reorder", "tests/unit/intelligence-service.test.js", "reorder"],
  ["NexActions", "tests/unit/actions-service.test.js", "action"],
  ["Scenario Lab 2", "tests/unit/scenario-service.test.js", "scenario"],
  ["Time Machine 2", "tests/unit/scenario-service.test.js", "historical"],
  ["Digital Twin isolado", "tests/unit/scenario-service.test.js", "twin"],
  ["NexShield 2", "tests/unit/security-service.test.js", "Shield"],
  ["NexHealth", "tests/unit/health-service.test.js", "NexHealth"],
  ["Audit Explorer", "tests/unit/audit-service.test.js", "timeline"],
  ["reversões preservam histórico", "tests/unit/reversal-service.test.js", "audit"],
  ["local-first íntegro", "scripts/validate-storage.mjs", "indexeddb"],
  ["PT/EN/ES completos", "scripts/validate-locales.mjs", "pt-BR"],
  ["teclado", "tests/e2e/ux-refinement.spec.js", "keyboard"],
  ["NVDA nos fluxos principais", "docs/accessibility.md", "NVDA"],
  ["CI passa", ".github/workflows/pages.yml", "npm run validate"],
  ["E2E passa", "package.json", "test:e2e"],
  ["accessibility gate", "tests/e2e/accessibility-offline.spec.js", "axe"],
  ["regressão visual", "tests/e2e/visual-regression.spec.js", "baselines"],
  ["documentação atualizada", "docs/project/cycle-078-phase-78.md", "40 critérios"],
  ["CHANGELOG completo", "CHANGELOG.md", "## 2.0.0"],
  ["sem backend essencial", "docs/releases/v2.0.0.md", "não exige backend"],
];

if (evidence.length !== 40) throw new Error(`A Fase 78 exige 40 critérios; recebeu ${evidence.length}.`);
for (const [criterion, file, fragment] of evidence) {
  if (!existsSync(join(root, file)) || !read(file).toLocaleLowerCase("pt-BR").includes(fragment.toLocaleLowerCase("pt-BR"))) {
    throw new Error(`Critério de release sem evidência: ${criterion} (${file}).`);
  }
}

const packageVersion = JSON.parse(read("package.json")).version;
const core = read("js/core/version.js");
const worker = read("service-worker.js");
const cycle = read("docs/project/cycle-078-phase-78.md");
for (const file of ["docs/releases/v2.0.0.md", "tests/unit/release-version.test.js"]) {
  if (!existsSync(join(root, file))) throw new Error(`Evidência final ausente: ${file}.`);
}
if (!/^2\.0\.\d+$/u.test(packageVersion) || !core.includes(`APP_VERSION = "${packageVersion}"`) || !worker.includes(`nexstock-shell-v${packageVersion}-`)) throw new Error("Versão 2.0.x incoerente.");
if (!/APROVADO/u.test(cycle)) throw new Error("Gate da Fase 78 não foi registrado.");
process.stdout.write("Fase 78: 40 critérios de release do NexStock 2.0 comprovados.\n");
