import { assertComponentId } from "../utils/component-id.js";

export function normalizeTabs(tabs) {
  if (!Array.isArray(tabs) || tabs.length < 2) throw new TypeError("Tabs require at least two items.");
  const ids = new Set();
  return tabs.map((tab) => {
    if (!tab?.id || !tab.label || !(tab.panel instanceof Node)) throw new TypeError("Each tab requires id, label, and panel.");
    assertComponentId(tab.id);
    if (ids.has(tab.id)) throw new TypeError(`Duplicate tab id: ${tab.id}`);
    ids.add(tab.id);
    return Object.freeze({ ...tab });
  });
}

export function createTabs({ id, tabs, initialId } = {}) {
  const safeId = assertComponentId(id);
  const items = normalizeTabs(tabs);
  let activeId = initialId && items.some((item) => item.id === initialId) ? initialId : items[0].id;
  const root = document.createElement("div");
  root.className = "ns-tabs";
  const tabList = document.createElement("div");
  tabList.className = "ns-tab-list";
  tabList.setAttribute("role", "tablist");
  const buttons = new Map();
  const panels = new Map();

  function select(nextId, { moveFocus = false } = {}) {
    if (!buttons.has(nextId)) throw new RangeError(`Unknown tab: ${nextId}`);
    activeId = nextId;
    for (const item of items) {
      const active = item.id === activeId;
      const button = buttons.get(item.id);
      const panel = panels.get(item.id);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
      panel.classList.toggle("ns-tab-panel--active", active);
    }
    if (moveFocus) buttons.get(activeId).focus();
  }

  function handleKeydown(event) {
    const currentIndex = items.findIndex((item) => item.id === activeId);
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + items.length) % items.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = items.length - 1;
    else return;
    event.preventDefault();
    select(items[nextIndex].id, { moveFocus: true });
  }

  for (const item of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.id = `${safeId}-tab-${item.id}`;
    button.className = "ns-tab";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", `${safeId}-panel-${item.id}`);
    button.textContent = item.label;
    button.addEventListener("click", () => select(item.id));
    button.addEventListener("keydown", handleKeydown);
    buttons.set(item.id, button);
    tabList.append(button);

    item.panel.id = `${safeId}-panel-${item.id}`;
    item.panel.classList.add("ns-tab-panel");
    item.panel.setAttribute("role", "tabpanel");
    item.panel.setAttribute("aria-labelledby", button.id);
    item.panel.tabIndex = 0;
    panels.set(item.id, item.panel);
  }
  root.append(tabList, ...items.map((item) => item.panel));
  select(activeId);
  return Object.freeze({ element: root, select, get activeId() { return activeId; } });
}
