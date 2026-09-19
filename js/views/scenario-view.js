import { createButton } from "../components/button.js";
import { createCard } from "../components/card.js";
import { createEmptyState } from "../components/empty-state.js";
import { createAlert } from "../components/feedback.js";
import { createField } from "../components/field.js";
import { SCENARIO_TYPES, simulateScenario } from "../services/scenario-service.js";
import { getInventoryStatus } from "../services/product-service.js";

function text(tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function baseView(title, description) {
  const section = document.createElement("section");
  section.className = "route-stack";
  const heading = text("h1", title);
  heading.id = "route-title";
  heading.tabIndex = -1;
  section.append(heading, text("p", description));
  return { section, heading };
}

function definitionList(rows) {
  const list = document.createElement("dl");
  list.className = "insight-data";
  for (const [label, value] of rows) {
    const row = document.createElement("div");
    row.append(text("dt", label), text("dd", value));
    list.append(row);
  }
  return list;
}

function resultCard(result, product, t, locale) {
  const number = (value, digits = 2) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
  const content = document.createElement("div");
  content.append(
    text("h3", t("scenarioCore.now")),
    definitionList([[t("scenarioCore.quantity"), number(result.now.quantity)], [t("scenarioCore.minimum"), number(result.now.minimum)], [t("scenarioCore.status"), t(`statuses.${result.now.status}`)]]),
    text("h3", t("scenarioCore.scenario")),
    definitionList([[t("scenarioCore.quantity"), number(result.scenario.quantity)], [t("scenarioCore.minimum"), number(result.scenario.minimum)], [t("scenarioCore.status"), t(`statuses.${result.scenario.status}`)]]),
    text("h3", t("scenarioCore.impact")),
    text("p", t("scenarioCore.impactSummary", { quantity: number(result.impact.quantityDelta), minimum: number(result.impact.minimumDelta) })),
  );
  if (result.impact.forecast) content.append(text("p", t("scenarioCore.forecastImpact", { current: number(result.impact.forecast.currentDays, 1), scenario: number(result.impact.forecast.scenarioDays, 1) })));
  content.append(createAlert({ title: t("scenarioCore.notSavedTitle"), message: t("scenarioCore.notSavedMessage"), tone: "info" }));
  return createCard({ title: t("scenarioCore.resultTitle", { product: product.name }), content });
}

export function createScenarioView({ title, description, t, locale, workspace, productService, movementService }) {
  const { section, heading } = baseView(title, description);
  if (!workspace) {
    section.append(createAlert({ title: t("scenarioCore.workspaceRequiredTitle"), message: t("scenarioCore.workspaceRequiredMessage"), tone: "warning" }));
    return { element: section, focusTarget: heading };
  }
  const content = text("p", t("scenarioCore.loading"));
  content.setAttribute("role", "status");
  section.append(content);
  Promise.all([productService.listByWorkspace(workspace.id), movementService.listByWorkspace(workspace.id)]).then(([allProducts, movements]) => {
    const products = allProducts.filter(({ archivedAt }) => !archivedAt);
    if (!products.length) {
      content.replaceChildren(createEmptyState({ title: t("scenarioCore.emptyTitle"), description: t("scenarioCore.emptyMessage"), action: createButton({ text: t("productCore.newProduct"), href: "#/products/new" }) }));
      return;
    }
    const form = document.createElement("form");
    form.className = "movement-form";
    const product = createField({ id: "scenario-product", label: t("scenarioCore.product"), type: "select", options: products.map((item) => ({ value: item.id, label: `${item.name} · ${item.nexCode}` })) });
    const type = createField({ id: "scenario-type", label: t("scenarioCore.type"), type: "select", options: Object.values(SCENARIO_TYPES).map((value) => ({ value, label: t(`scenarioCore.types.${value}`) })) });
    const value = createField({ id: "scenario-value", label: t("scenarioCore.value"), type: "number", min: 0, step: "any", required: true, requiredText: t("forms.required"), helpText: t("scenarioCore.valueHelp") });
    const feedback = document.createElement("div");
    feedback.setAttribute("aria-live", "polite");
    form.append(product.element, type.element, value.element, createButton({ text: t("scenarioCore.simulate"), type: "submit" }), feedback);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        const selected = products.find(({ id }) => id === product.control.value);
        const result = simulateScenario({ product: selected, movements: movements.filter(({ productId }) => productId === selected.id), type: type.control.value, value: value.control.value });
        feedback.replaceChildren(resultCard(result, selected, t, locale));
      } catch {
        feedback.replaceChildren(createAlert({ message: t("scenarioCore.invalid"), tone: "danger" }));
      }
    });
    content.replaceChildren(createAlert({ title: t("scenarioCore.noticeTitle"), message: t("scenarioCore.noticeMessage"), tone: "info" }), form);
  }).catch(() => content.replaceChildren(createAlert({ message: t("scenarioCore.loadError"), tone: "danger" })));
  return { element: section, focusTarget: heading };
}

export function createTimeMachineView({ title, description, t, locale, workspace, insightService }) {
  const { section, heading } = baseView(title, description);
  if (!workspace) {
    section.append(createAlert({ title: t("timeMachineCore.workspaceRequiredTitle"), message: t("timeMachineCore.workspaceRequiredMessage"), tone: "warning" }));
    return { element: section, focusTarget: heading };
  }
  const content = text("p", t("timeMachineCore.loading"));
  content.setAttribute("role", "status");
  section.append(content);
  insightService.listByWorkspace(workspace.id).then((insights) => {
    if (!insights.length) {
      content.replaceChildren(createEmptyState({ title: t("timeMachineCore.emptyTitle"), description: t("timeMachineCore.emptyMessage") }));
      return;
    }
    const list = document.createElement("div");
    list.className = "insight-list";
    for (const { product, memory, forecast } of insights) {
      const article = document.createElement("article");
      article.className = "insight-product";
      article.append(text("h2", `${product.name} · ${product.nexCode}`));
      const past = definitionList([[t("timeMachineCore.events"), String(memory.eventCount)], [t("timeMachineCore.maximum"), String(memory.maximumQuantity)], [t("timeMachineCore.minimum"), String(memory.minimumQuantity)]]);
      const present = definitionList([[t("timeMachineCore.quantity"), String(product.currentQuantity)], [t("timeMachineCore.minimumStock"), String(product.minimumStock)], [t("timeMachineCore.status"), t(`statuses.${getInventoryStatus(product.currentQuantity, product.minimumStock)}`)]]);
      const future = text("p", forecast.available ? t("timeMachineCore.futureAvailable", { days: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(forecast.daysRemaining) }) : t("timeMachineCore.futureUnavailable"));
      article.append(createCard({ title: t("timeMachineCore.past"), description: t("timeMachineCore.pastDescription"), content: past, headingLevel: 3 }), createCard({ title: t("timeMachineCore.present"), description: t("timeMachineCore.presentDescription"), content: present, headingLevel: 3 }), createCard({ title: t("timeMachineCore.future"), description: t("timeMachineCore.futureDescription"), content: future, headingLevel: 3 }));
      list.append(article);
    }
    content.replaceChildren(createAlert({ title: t("timeMachineCore.estimateTitle"), message: t("timeMachineCore.estimateMessage"), tone: "info" }), list);
  }).catch(() => content.replaceChildren(createAlert({ message: t("timeMachineCore.loadError"), tone: "danger" })));
  return { element: section, focusTarget: heading };
}
