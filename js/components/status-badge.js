const STATUS_META = Object.freeze({
  out: Object.freeze({ label: "Sem estoque", className: "ns-status--out" }),
  critical: Object.freeze({ label: "Crítico", className: "ns-status--critical" }),
  attention: Object.freeze({ label: "Atenção", className: "ns-status--attention" }),
  healthy: Object.freeze({ label: "Saudável", className: "ns-status--healthy" }),
  archived: Object.freeze({ label: "Arquivado", className: "ns-status--archived" }),
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
  badge.textContent = label ?? meta.label;
  return badge;
}
