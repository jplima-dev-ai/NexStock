import { createField } from "../components/field.js";

export const GLOSSARY_TERMS = Object.freeze([
  "workspace",
  "nexCode",
  "minimumStock",
  "tracking",
  "nexPulse",
  "forecast",
  "stockMemory",
  "scenario",
  "archived",
]);

function text(tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

export function createGlossaryView({ title, description, t }) {
  const section = document.createElement("section");
  section.className = "route-stack glossary-view";
  const heading = text("h1", title);
  heading.id = "route-title";
  heading.tabIndex = -1;
  section.append(heading, text("p", description), text("p", t("glossary.introduction")));

  const search = createField({
    id: "glossary-search",
    label: t("glossary.search"),
    type: "search",
    helpText: t("glossary.searchHelp"),
    autocomplete: "off",
  });
  const status = text("p", "", "route-meta");
  status.setAttribute("role", "status");
  const list = document.createElement("dl");
  list.className = "glossary-list";

  function render() {
    const query = search.control.value.trim().toLocaleLowerCase();
    list.replaceChildren();
    let count = 0;
    for (const key of GLOSSARY_TERMS) {
      const term = t(`glossary.terms.${key}.term`);
      const definition = t(`glossary.terms.${key}.definition`);
      if (query && !`${term} ${definition}`.toLocaleLowerCase().includes(query)) continue;
      const entry = document.createElement("div");
      entry.append(text("dt", term), text("dd", definition));
      list.append(entry);
      count += 1;
    }
    status.textContent = t(count ? "glossary.resultCount" : "glossary.empty", { count });
  }

  search.control.addEventListener("input", render);
  section.append(search.element, status, list);
  render();
  return { element: section, focusTarget: heading };
}
