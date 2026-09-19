import { createDialog } from "./dialog.js";
import { createField } from "./field.js";
import { filterGlobalItems } from "../services/global-search-service.js";

export function bindCommandPaletteTrigger({ trigger, onOpen }) {
  if (!trigger || typeof onOpen !== "function") throw new TypeError("Command Palette trigger requires an open handler.");
  trigger.addEventListener("click", onOpen);
  return () => trigger.removeEventListener("click", onOpen);
}

export function createCommandPalette({ layer, trigger, translate, getActions, searchProducts, onSelect }) {
  if (!layer || !trigger) throw new TypeError("Command Palette requires a layer and trigger.");
  const content = document.createElement("div");
  content.className = "command-palette";
  const search = createField({ id: "command-search", label: translate("commandPalette.search"), type: "search", helpText: translate("commandPalette.help") });
  const status = document.createElement("p"); status.className = "visually-hidden"; status.setAttribute("aria-live", "polite");
  const list = document.createElement("div"); list.className = "command-palette__results"; list.id = "command-results"; list.setAttribute("role", "listbox");
  search.control.setAttribute("role", "combobox"); search.control.setAttribute("aria-controls", list.id); search.control.setAttribute("aria-expanded", "false"); search.control.setAttribute("aria-autocomplete", "list");
  content.append(search.element, status, list);
  const dialog = createDialog({ id: "command-palette", title: translate("commandPalette.title"), description: translate("commandPalette.description"), content, closeLabel: translate("commandPalette.close") });
  layer.append(dialog.element);
  let results = []; let activeIndex = -1; let renderToken = 0;

  function setActive(index) {
    if (!results.length) { activeIndex = -1; search.control.removeAttribute("aria-activedescendant"); return; }
    activeIndex = (index + results.length) % results.length;
    [...list.querySelectorAll("[role='option']")].forEach((option, current) => option.setAttribute("aria-selected", String(current === activeIndex)));
    const active = list.children[activeIndex]; search.control.setAttribute("aria-activedescendant", active.id); active.scrollIntoView?.({ block: "nearest" });
  }

  function choose(item) { if (item.disabled) return; dialog.close(); onSelect(item); }

  async function render() {
    const token = ++renderToken; const query = search.control.value;
    const actions = filterGlobalItems(query, getActions());
    const products = await searchProducts(query);
    if (token !== renderToken) return;
    results = [...actions, ...products]; list.replaceChildren();
    if (!results.length) { const empty = document.createElement("p"); empty.textContent = translate("commandPalette.empty"); list.append(empty); status.textContent = translate("commandPalette.resultCount", { count: 0 }); setActive(-1); return; }
    results.forEach((item, index) => {
      const option = document.createElement("button"); option.type = "button"; option.id = `command-option-${index}`; option.className = "command-palette__option"; option.setAttribute("role", "option"); option.setAttribute("aria-selected", "false");
      option.disabled = Boolean(item.disabled);
      if (item.disabled) option.setAttribute("aria-disabled", "true");
      const label = document.createElement("span"); label.textContent = item.label; option.append(label);
      if (item.description) { const description = document.createElement("span"); description.className = "route-meta"; description.textContent = item.description; option.append(description); }
      option.addEventListener("click", () => choose(item)); list.append(option);
    });
    status.textContent = translate("commandPalette.resultCount", { count: results.length }); setActive(0);
  }

  search.control.addEventListener("input", render);
  search.control.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") { event.preventDefault(); setActive(activeIndex + 1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive(activeIndex - 1); }
    else if (event.key === "Enter" && activeIndex >= 0) { event.preventDefault(); choose(results[activeIndex]); }
  });
  const openFromTrigger = () => { search.control.value = ""; search.control.setAttribute("aria-expanded", "true"); dialog.open(trigger); render(); queueMicrotask(() => search.control.focus()); };
  const unbindTrigger = bindCommandPaletteTrigger({ trigger, onOpen: openFromTrigger });
  dialog.element.addEventListener("close", () => search.control.setAttribute("aria-expanded", "false"));
  function shortcut(event) { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); trigger.click(); } }
  document.addEventListener("keydown", shortcut);
  return Object.freeze({ open: () => trigger.click(), close: dialog.close, destroy: () => { unbindTrigger(); document.removeEventListener("keydown", shortcut); }, element: dialog.element });
}
