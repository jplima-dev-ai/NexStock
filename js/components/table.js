export function normalizeColumns(columns) {
  if (!Array.isArray(columns) || columns.length === 0) throw new TypeError("Table requires at least one column.");
  const keys = new Set();
  return columns.map((column) => {
    if (!column?.key || !column?.label) throw new TypeError("Each table column requires key and label.");
    if (keys.has(column.key)) throw new TypeError(`Duplicate table column key: ${column.key}`);
    keys.add(column.key);
    return Object.freeze({ ...column });
  });
}

export function createTable({ caption, columns, rows = [], emptyMessage = "Nenhum item disponível." } = {}) {
  if (!caption) throw new TypeError("Table requires a caption.");
  const normalizedColumns = normalizeColumns(columns);
  const wrapper = document.createElement("div");
  wrapper.className = "ns-table-wrapper";
  wrapper.tabIndex = 0;
  wrapper.setAttribute("role", "region");
  wrapper.setAttribute("aria-label", caption);

  const table = document.createElement("table");
  table.className = "ns-table";
  const captionElement = document.createElement("caption");
  captionElement.textContent = caption;
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (const column of normalizedColumns) {
    const header = document.createElement("th");
    header.scope = "col";
    header.textContent = column.label;
    headRow.append(header);
  }
  head.append(headRow);

  const body = document.createElement("tbody");
  if (rows.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = normalizedColumns.length;
    cell.textContent = emptyMessage;
    row.append(cell);
    body.append(row);
  } else {
    for (const rowData of rows) {
      const row = document.createElement("tr");
      for (const column of normalizedColumns) {
        const cell = document.createElement("td");
        const value = column.render ? column.render(rowData) : rowData[column.key];
        if (value instanceof Node) cell.append(value);
        else cell.textContent = value === undefined || value === null ? "—" : String(value);
        row.append(cell);
      }
      body.append(row);
    }
  }

  table.append(captionElement, head, body);
  wrapper.append(table);
  return wrapper;
}
