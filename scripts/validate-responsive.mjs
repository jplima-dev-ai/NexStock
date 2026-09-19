import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const index = readFileSync(join(root, "index.html"), "utf8");
const base = readFileSync(join(root, "css/base.css"), "utf8");
const layout = readFileSync(join(root, "css/layout.css"), "utf8");
const components = readFileSync(join(root, "css/components.css"), "utf8");
const responsive = readFileSync(join(root, "css/responsive.css"), "utf8");
const allCss = `${base}\n${layout}\n${components}\n${responsive}`;

const testMatrix = Object.freeze([
  { width: 320, label: "mobile estreito" },
  { width: 375, label: "mobile" },
  { width: 768, label: "tablet" },
  { width: 1366, label: "desktop" },
  { width: 683, label: "desktop a 200 por cento" },
]);

if (!index.includes('content="width=device-width, initial-scale=1"')) throw new Error("Viewport responsivo ausente ou restritivo.");
if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1/iu.test(index)) throw new Error("Zoom do usuário foi restringido.");
if (/body\s*\{[^}]*overflow-x\s*:\s*hidden/su.test(allCss)) throw new Error("Overflow horizontal global não pode ser ocultado.");
for (const contract of [
  [layout, ".mobile-nav-toggle", "controle de navegação móvel"],
  [layout, '.primary-nav[data-open="true"]', "estado expandido do menu"],
  [responsive, "@media (min-width: 48rem)", "expansão para layout amplo"],
  [responsive, "@media (max-width: 35rem)", "reflow estreito"],
  [components, "overflow-x: auto", "rolagem local de tabelas"],
  [components, "max-height: calc(100dvh - 2rem)", "diálogo limitado ao viewport"],
  [components, "min-height: 2.75rem", "alvo mínimo de quarenta e quatro pixels"],
  [base, "overflow-wrap: anywhere", "proteção para texto longo"],
]) {
  if (!contract[0].includes(contract[1])) throw new Error(`Contrato responsivo ausente: ${contract[2]}.`);
}
if (!testMatrix.every(({ width }) => Number.isFinite(width) && width >= 320)) throw new Error("Matriz responsiva inválida.");
process.stdout.write(`Responsividade: ${testMatrix.map(({ width, label }) => `${width}px ${label}`).join(", ")} e reflow aprovados.\n`);
