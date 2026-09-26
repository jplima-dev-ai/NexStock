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

export function sortRows(rows, column, direction = "ascending") {
  if (!column?.key) throw new TypeError("Sorting requires a column key.");
  const multiplier = direction === "descending" ? -1 : 1;
  return [...rows].sort((first, second) => {
    const firstValue = column.sortValue ? column.sortValue(first) : first[column.key];
    const secondValue = column.sortValue ? column.sortValue(second) : second[column.key];
    return String(firstValue ?? "").localeCompare(String(secondValue ?? ""), undefined, { numeric: true, sensitivity: "base" }) * multiplier;
  });
}

export function createTable({
  caption,
  columns,
  rows = [],
  emptyMessage = "Nenhum item disponível.",
  density = "comfortable",
  mobileLayout = "cards",
  initialSort,
  isRowSelected,
} = {}) {
  if (!caption) throw new TypeError("Table requires a caption.");
  if (!new Set(["comfortable", "compact"]).has(density)) throw new RangeError(`Table density not supported: ${density}`);
  if (!new Set(["cards", "scroll"]).has(mobileLayout)) throw new RangeError(`Mobile table layout not supported: ${mobileLayout}`);
  const normalizedColumns = normalizeColumns(columns);
  const wrapper = document.createElement("div");
  wrapper.className = "ns-table-wrapper";
  wrapper.dataset.density = density;
  wrapper.dataset.mobileLayout = mobileLayout;
  wrapper.tabIndex = 0;
  wrapper.setAttribute("role", "region");
  wrapper.setAttribute("aria-label", caption);

  const table = document.createElement("table");
  table.className = "ns-table";
  const captionElement = document.createElement("caption");
  captionElement.textContent = caption;
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  let sortState = initialSort;
  const body = document.createElement("tbody");

  function renderBody() {
    body.replaceChildren();
    const activeColumn = sortState ? normalizedColumns.find(({ key }) => key === sortState.key) : undefined;
    const visibleRows = activeColumn ? sortRows(rows, activeColumn, sortState.direction) : rows;
    if (visibleRows.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = normalizedColumns.length;
      cell.textContent = emptyMessage;
      row.append(cell);
      body.append(row);
      return;
    }
    for (const rowData of visibleRows) {
      const row = document.createElement("tr");
      if (isRowSelected?.(rowData)) row.setAttribute("aria-selected", "true");
      for (const column of normalizedColumns) {
        const cell = document.createElement("td");
        cell.dataset.label = column.label;
        const value = column.render ? column.render(rowData) : rowData[column.key];
        if (value instanceof Node) cell.append(value);
        else cell.textContent = value === undefined || value === null ? "—" : String(value);
        row.append(cell);
      }
      body.append(row);
    }
  }

  function updateSortHeaders() {
    for (const header of headRow.children) {
      if (!header.classList.contains("ns-table__sortable")) {
        header.removeAttribute("aria-sort");
        continue;
      }
      const key = header.dataset.key;
      const active = sortState?.key === key;
      header.setAttribute("aria-sort", active ? sortState.direction : "none");
    }
  }

  for (const column of normalizedColumns) {
    const header = document.createElement("th");
    header.scope = "col";
    header.dataset.key = column.key;
    if (column.sortable) {
      header.classList.add("ns-table__sortable");
      const sortButton = document.createElement("button");
      sortButton.type = "button";
      sortButton.className = "ns-table__sort";
      sortButton.textContent = column.label;
      sortButton.addEventListener("click", () => {
        sortState = {
          key: column.key,
          direction: sortState?.key === column.key && sortState.direction === "ascending" ? "descending" : "ascending",
        };
        updateSortHeaders();
        renderBody();
      });
      header.append(sortButton);
    } else {
      header.textContent = column.label;
    }
    headRow.append(header);
  }
  head.append(headRow);
  updateSortHeaders();
  renderBody();
  table.append(captionElement, head, body);
  wrapper.append(table);
  return wrapper;
}
