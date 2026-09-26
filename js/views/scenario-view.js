import { createButton } from "../components/button.js";
import { createContentStatus } from "../components/content-state.js";
import { createCard } from "../components/card.js";
import { createEmptyState } from "../components/empty-state.js";
import { createAlert } from "../components/feedback.js";
import { createField } from "../components/field.js";
import { SCENARIO_TYPES, applyTwinScenario, compareScenarios, createDigitalTwin, reconstructHistoricalSnapshot, simulateScenario } from "../services/scenario-service.js";
import { getInventoryStatus } from "../services/product-service.js";
import { createCopyContext } from "../services/copy-service.js";

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

function comparisonCard(record, t, locale) {
  const number = (value, digits = 1) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
  const forecast = record.forecast.available
    ? t("scenarioCore.comparisonForecastAvailable", { days: number(record.forecast.daysRemaining) })
    : t("scenarioCore.comparisonForecastUnavailable", { sufficiency: t(`insightCore.dataSufficiency.${record.forecast.dataSufficiency}`) });
  const risks = record.risks.length
    ? t("scenarioCore.comparisonRisksPresent", { count: record.risks.length })
    : t("scenarioCore.comparisonRisksNone");
  return createCard({
    title: record.id === "REAL" ? t("scenarioCore.comparisonReal") : t("scenarioCore.comparisonScenario", { id: record.id }),
    content: definitionList([
      [t("scenarioCore.quantity"), number(record.quantity)],
      [t("scenarioCore.minimum"), number(record.minimum)],
      [t("scenarioCore.status"), t(`statuses.${record.status}`)],
      [t("scenarioCore.comparisonImpact"), t("scenarioCore.comparisonImpactValue", { quantity: number(record.impact.quantityDelta), minimum: number(record.impact.minimumDelta) })],
      [t("scenarioCore.comparisonForecast"), forecast],
      [t("scenarioCore.comparisonRisks"), risks],
    ]),
    headingLevel: 3,
  });
}

function scenarioComparison(result, t, locale) {
  const content = document.createElement("div");
  content.className = "insight-list";
  content.append(comparisonCard(result.real, t, locale), ...result.scenarios.map((record) => comparisonCard(record, t, locale)));
  return createCard({ title: t("scenarioCore.comparisonTitle"), description: t("scenarioCore.comparisonDescription"), content });
}

export function createScenarioView({ title, description, t, locale, workspace, productService, movementService, initialProductId }) {
  const { section, heading } = baseView(title, description);
  if (!workspace) {
    section.append(createAlert({ title: t("scenarioCore.workspaceRequiredTitle"), message: t("scenarioCore.workspaceRequiredMessage"), tone: "warning" }));
    return { element: section, focusTarget: heading };
  }
  const content = createContentStatus({ message: t("scenarioCore.loading") });
  section.append(content);
  Promise.all([productService.listByWorkspace(workspace.id), movementService.listByWorkspace(workspace.id)]).then(([allProducts, movements]) => {
    const products = allProducts.filter(({ archivedAt }) => !archivedAt);
    if (!products.length) {
      content.replaceChildren(createEmptyState({ title: t("scenarioCore.emptyTitle"), description: t("scenarioCore.emptyMessage"), action: createButton({ text: t("productCore.newProduct"), href: "#/products/new" }), kind: "first-use" }));
      return;
    }
    const form = document.createElement("form");
    form.className = "movement-form";
    const copy = createCopyContext({ translate: t, workspace });
    const product = createField({ id: "scenario-product", label: t("scenarioCore.product"), ...copy.field({ helpKey: "scenarioCore.productHelp" }), type: "select", value: products.some(({ id }) => id === initialProductId) ? initialProductId : undefined, options: products.map((item) => ({ value: item.id, label: `${item.name} · ${item.nexCode}` })) });
    const type = createField({ id: "scenario-type", label: t("scenarioCore.type"), ...copy.field({ helpKey: "scenarioCore.typeHelp" }), type: "select", options: Object.values(SCENARIO_TYPES).map((value) => ({ value, label: t(`scenarioCore.types.${value}`) })) });
    const value = createField({ id: "scenario-value", label: t("scenarioCore.value"), ...copy.field({ helpKey: "scenarioCore.valueHelp", exampleKey: "scenarioCore.valueExample" }), type: "number", min: 0, step: "any", required: true, requiredText: t("forms.required"), inputMode: "decimal" });
    const comparisonValues = ["A", "B", "C"].map((id) => createField({ id: `scenario-comparison-${id.toLowerCase()}`, label: t("scenarioCore.comparisonValue", { id }), type: "number", min: 0, step: "any", inputMode: "decimal" }));
    const feedback = document.createElement("div");
    feedback.setAttribute("aria-live", "polite");
    const comparison = document.createElement("fieldset");
    comparison.append(text("legend", t("scenarioCore.comparisonInputTitle")), text("p", t("scenarioCore.comparisonInputHelp")), ...comparisonValues.map(({ element }) => element));
    const compareButton = createButton({ text: t("scenarioCore.compare"), type: "button" });
    form.append(text("p", copy.modeMessage(), "ns-copy-mode"), createButton({ text: t("nexCopy.openGlossary"), href: "#/glossary", variant: "quiet" }), product.element, type.element, value.element, createButton({ text: t("scenarioCore.simulate"), type: "submit" }), comparison, compareButton, feedback);
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
    compareButton.addEventListener("click", () => {
      try {
        const selected = products.find(({ id }) => id === product.control.value);
        const changes = comparisonValues.map(({ control }) => ({ type: type.control.value, value: control.value }));
        const result = compareScenarios({ product: selected, movements: movements.filter(({ productId }) => productId === selected.id), scenarios: ["A", "B", "C"].map((id, index) => ({ id, changes: [changes[index]] })) });
        feedback.replaceChildren(scenarioComparison(result, t, locale));
      } catch {
        feedback.replaceChildren(createAlert({ message: t("scenarioCore.invalid"), tone: "danger" }));
      }
    });
    content.replaceChildren(createAlert({ title: t("scenarioCore.noticeTitle"), message: t("scenarioCore.noticeMessage"), tone: "info" }), form);
  }).catch(() => content.replaceChildren(createAlert({ message: t("scenarioCore.loadError"), tone: "danger" })));
  return { element: section, focusTarget: heading };
}

function historicalPulseCard(snapshot, t, locale) {
  const content = document.createElement("div");
  if (!snapshot.pulse.available) {
    content.append(text("p", t("timeMachineCore.pulseUnavailable")));
  } else {
    const number = (value) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
    content.append(
      text("p", t("timeMachineCore.pulseNarrative", { products: number(snapshot.metrics.products), critical: number(snapshot.metrics.belowOrAtMinimum) })),
      definitionList([
        [t("timeMachineCore.pulseScore"), t("timeMachineCore.pulseScoreContext", { score: number(snapshot.pulse.score) })],
        [t("timeMachineCore.pulseForecastCoverage"), t("timeMachineCore.pulseForecastCoverageValue", { calculated: number(snapshot.pulse.forecastCoverage.calculated), total: number(snapshot.pulse.forecastCoverage.total) })],
      ]),
    );
  }
  return createCard({ title: t("timeMachineCore.pulseTitle"), description: t("timeMachineCore.pulseDescription"), content, headingLevel: 2 });
}

function historicalResult(snapshot, t, locale) {
  const number = (value) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
  const content = document.createElement("div");
  content.className = "insight-list";
  content.append(
    createCard({ title: t("timeMachineCore.past"), description: t("timeMachineCore.pastDescription"), content: text("p", t("timeMachineCore.snapshotDescription", { date: new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(snapshot.selectedAt)) })), headingLevel: 2 }),
    createCard({ title: t("timeMachineCore.present"), description: t("timeMachineCore.presentDescription"), content: text("p", t("timeMachineCore.presentContext")), headingLevel: 2 }),
    createCard({ title: t("timeMachineCore.future"), description: t("timeMachineCore.futureDescription"), content: text("p", t("timeMachineCore.futureUnavailable")), headingLevel: 2 }),
    createCard({ title: t("timeMachineCore.snapshotTitle"), description: t("timeMachineCore.snapshotDescription", { date: new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(snapshot.selectedAt)) }), content: definitionList([
      [t("timeMachineCore.productsAtDate"), number(snapshot.metrics.products)],
      [t("timeMachineCore.totalUnitsAtDate"), number(snapshot.metrics.totalUnits)],
      [t("timeMachineCore.movementsAtDate"), number(snapshot.movements.length)],
    ]), headingLevel: 2 }),
    historicalPulseCard(snapshot, t, locale),
  );
  const products = document.createElement("div");
  products.className = "insight-list";
  for (const product of snapshot.products) {
    products.append(createCard({ title: `${product.name} · ${product.nexCode}`, content: definitionList([
      [t("timeMachineCore.quantity"), number(product.currentQuantity)],
      [t("timeMachineCore.minimumStock"), number(product.minimumStock)],
      [t("timeMachineCore.status"), t(`statuses.${product.status}`)],
    ]), headingLevel: 3 }));
  }
  content.append(createCard({ title: t("timeMachineCore.productsTitle"), description: t("timeMachineCore.productsDescription"), content: products, headingLevel: 2 }));
  return content;
}

