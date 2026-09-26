import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const requiredFiles = [
  "js/components/tabs.js",
  "tests/e2e/motion.spec.js",
  "docs/project/cycle-028-phase-28.md",
];
for (const file of requiredFiles) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 28 sem artefato obrigatório: ${file}`);
}

const tokens = readFileSync(join(ROOT, "css/tokens.css"), "utf8");
for (const token of [
  "--ns-motion-instant", "--ns-motion-fast", "--ns-motion-base", "--ns-motion-slow",
  "--ns-ease-standard", "--ns-ease-enter", "--ns-ease-exit",
]) {
  if (!tokens.includes(token)) throw new Error(`NexMotion sem token: ${token}`);
}

const components = readFileSync(join(ROOT, "css/components.css"), "utf8");
const layout = readFileSync(join(ROOT, "css/layout.css"), "utf8");
const accessibility = readFileSync(join(ROOT, "css/accessibility.css"), "utf8");
for (const contract of [".ns-tabs", ".ns-dialog[open]", "ns-badge-enter", "ns-number-enter", "ns-toast-enter", "ns-surface-enter"]) {
  if (!components.includes(contract)) throw new Error(`NexMotion sem contrato de componente: ${contract}`);
}
for (const contract of ["ns-route-enter", "ns-sidebar-open"]) {
  if (!layout.includes(contract)) throw new Error(`NexMotion sem contrato de layout: ${contract}`);
}
for (const contract of ["prefers-reduced-motion: reduce", "animation: none !important", "transition: none !important"]) {
  if (!accessibility.includes(contract)) throw new Error(`Movimento reduzido sem proteção: ${contract}`);
}
const combinedCss = `${components}\n${layout}`;
for (const forbidden of ["infinite", "parallax", "confetti", "scroll-reveal", "shake"]) {
  if (combinedCss.toLowerCase().includes(forbidden)) throw new Error(`Motion proibido encontrado: ${forbidden}`);
}

const tabs = readFileSync(join(ROOT, "js/components/tabs.js"), "utf8");
for (const contract of ['role", "tablist', 'role", "tab', 'role", "tabpanel', "aria-selected", "ArrowRight", "ArrowLeft", "Home", "End"]) {
  if (!tabs.includes(contract)) throw new Error(`Tabs sem contrato acessível: ${contract}`);
}

const backlog = readFileSync(join(ROOT, "docs/project/backlog.md"), "utf8");
const completedPhase = Number(backlog.match(/Fases 0 a (\d+) aprovadas/)?.[1] ?? 0);
if (completedPhase < 28) {
  throw new Error("Backlog não preserva a conclusão da Fase 28.");
}

process.stdout.write("Fase 28: NexMotion, tabs, rotas, diálogo, sidebar, estados, números, feedback e movimento reduzido aprovados.\n");
