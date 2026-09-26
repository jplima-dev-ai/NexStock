import { createIcon } from "./icon.js";

const STATUS_META = Object.freeze({
  out: Object.freeze({ label: "Sem estoque", className: "ns-status--out", icon: "danger" }),
  critical: Object.freeze({ label: "Crítico", className: "ns-status--critical", icon: "danger" }),
  attention: Object.freeze({ label: "Atenção", className: "ns-status--attention", icon: "warning" }),
  healthy: Object.freeze({ label: "Saudável", className: "ns-status--healthy", icon: "check" }),
  archived: Object.freeze({ label: "Arquivado", className: "ns-status--archived", icon: "archive" }),
});

export function getStatusMeta(status) {
  const meta = STATUS_META[status];
  if (!meta) throw new RangeError(`Inventory status not supported: ${status}`);
  return meta;
}

export function createStatusBadge(status, { label } = {}) {
  const meta = getStatusMeta(status);
  const badge = document.createElement("span");
  badge.className = `ns-status ${meta.className}`;
  const text = document.createElement("span");
  text.textContent = label ?? meta.label;
  badge.append(createIcon(meta.icon, { size: "small" }), text);
  return badge;
}
