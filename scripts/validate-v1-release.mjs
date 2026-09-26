import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const evidence = [
  ["GitHub Pages", ".github/workflows/pages.yml", "deploy-pages"],
  ["Welcome", "js/views/route-view.js", 'route === "/welcome"'],
  ["branding oficial", "docs/brand-assets.json", "Primary Horizontal Logo"],
  ["PT/EN/ES", "js/core/config.js", "es"],
  ["escolha de perfil", "js/views/onboarding-view.js", "profile"],
  ["criação de workspace", "js/services/workspace-service.js", "createDemoWorkspace"],
  ["cadastro de produto", "js/services/product-service.js", "async create"],
  ["NexCode", "js/services/product-service.js", "buildNexCode"],
  ["edição", "js/services/product-service.js", "async update"],
  ["arquivamento", "js/services/product-service.js", "async archive"],
  ["entrada", "js/services/movement-service.js", "IN"],
  ["saída", "js/services/movement-service.js", "OUT"],
  ["estoque negativo", "tests/unit/movement-service.test.js", "invalid withdrawal"],
  ["histórico", "js/services/movement-service.js", "listByWorkspace"],
  ["Audit Log", "js/services/product-service.js", "auditLogs"],
  ["NexPulse", "js/services/dashboard-service.js", "pulse: Object.freeze"],
  ["Insights", "js/services/insight-service.js", "getByProduct"],
  ["Explain the Math", "js/views/insight-view.js", "calculationTitle"],
  ["Stock Memory", "js/services/insight-service.js", "calculateStockMemory"],
  ["Inventory Story", "js/services/inventory-story-service.js", "buildInventoryStory"],
  ["Time Machine", "js/views/scenario-view.js", "createTimeMachineView"],
  ["Scenario Lab", "js/services/scenario-service.js", "simulateScenario"],
  ["Custom Fields", "js/services/custom-field-service.js", "CustomFieldService"],
  ["módulos especializados", "js/services/module-service.js", "createKit"],
  ["tema claro e escuro", "js/components/theme-toggle.js", "bindThemeToggle"],
  ["teclado", "js/components/command-palette.js", "ArrowDown"],
  ["NVDA", "docs/accessibility.md", "NVDA"],
  ["PWA instalável", "manifest.webmanifest", '"display": "standalone"'],
  ["offline", "service-worker.js", "caches.match"],
  ["persistência", "tests/unit/workspace-service.test.js", "sobrevivem"],
  ["reset", "js/views/settings-view.js", "confirmAction"],
  ["Shield Test", "js/services/security-service.js", "runShieldTests"],
  ["CI", ".github/workflows/pages.yml", "npm run validate"],
  ["README", "README.md", "## Screenshots"],
  ["identidade íntegra", "scripts/validate-brand-assets.mjs", "transpar"],
];

for (const [criterion, file, fragment] of evidence) {
  if (!existsSync(join(root, file)) || !read(file).includes(fragment)) throw new Error(`Release 1.0 sem evidência para ${criterion}: ${file}`);
}
const currentVersion = JSON.parse(read("package.json")).version;
if (!/^1\.(?:0|[1-9]\d*)\.\d+$/u.test(currentVersion)) throw new Error("A baseline 1.0 só pode ser validada dentro da linha principal 1.x.");
if (evidence.length !== 35) throw new Error(`Matriz da Release 1.0 deve conter 35 critérios; recebeu ${evidence.length}.`);

process.stdout.write("Baseline 1.0: 35 critérios do blueprint permanecem verificáveis.\n");
