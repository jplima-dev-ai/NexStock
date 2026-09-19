import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const contracts = [
  ["js/components/button.js", ["createButton", "createIconButton"]],
  ["js/components/field.js", ["createField", "createChoice", "createErrorMessage"]],
  ["js/components/card.js", ["createCard", "createMetricCard"]],
  ["js/components/status-badge.js", ["createStatusBadge"]],
  ["js/components/table.js", ["createTable"]],
  ["js/components/dialog.js", ["createDialog"]],
  ["js/components/feedback.js", ["createAlert", "createToastManager"]],
  ["js/components/empty-state.js", ["createEmptyState"]],
];

for (const [modulePath, exports] of contracts) {
  const module = await import(join(ROOT, modulePath));
  for (const exportName of exports) {
    if (typeof module[exportName] !== "function") {
      throw new Error(`${modulePath} não exporta o contrato ${exportName}.`);
    }
  }
}

const componentCss = readFileSync(join(ROOT, "css/components.css"), "utf8");
for (const className of [
  ".ns-button",
  ".ns-field",
  ".ns-card",
  ".ns-status",
  ".ns-table",
  ".ns-dialog",
  ".ns-alert",
  ".ns-toast",
  ".ns-empty-state",
]) {
  if (!componentCss.includes(className)) throw new Error(`CSS ausente para ${className}.`);
}

const index = readFileSync(join(ROOT, "index.html"), "utf8");
for (const layerId of ['id="dialog-layer"', 'id="toast-layer"']) {
  if (!index.includes(layerId)) throw new Error(`Camada global ausente: ${layerId}.`);
}

process.stdout.write("Design System: contratos e estilos essenciais aprovados.\n");
