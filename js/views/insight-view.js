import { createButton } from "../components/button.js";
import { createContentStatus } from "../components/content-state.js";
import { createCard } from "../components/card.js";
import { createEmptyState } from "../components/empty-state.js";
import { createAlert } from "../components/feedback.js";
import { createTabs } from "../components/tabs.js";

function text(tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function number(locale, value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
}

function date(locale, value, fallback) {
  return value ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : fallback;
}

function definitionList(rows, className = "insight-data") {
  const list = document.createElement("dl");
  list.className = className;
  for (const [label, value] of rows) {
    const row = document.createElement("div");
    row.append(text("dt", label), text("dd", value));
    list.append(row);
  }
  return list;
}

function explainForecast(forecast, t, locale) {
  const details = document.createElement("details");
  details.className = "insight-explanation";
  details.append(text("summary", t("insightCore.explain.title")));
  details.append(
    text("h4", t("insightCore.explain.dataTitle")),
    definitionList([
      [t("insightCore.explain.window"), t("insightCore.days", { value: forecast.windowDays })],
      [t("insightCore.explain.currentQuantity"), number(locale, forecast.currentQuantity)],
      [t("insightCore.explain.totalOut"), number(locale, forecast.totalOut)],
      [t("insightCore.explain.events"), String(forecast.eventCount)],
      [t("insightCore.explain.history"), t("insightCore.days", { value: forecast.historyDays })],
    ]),
    text("h4", t("insightCore.explain.calculationTitle")),
    text("p", t("insightCore.explain.averageFormula", { total: number(locale, forecast.totalOut), average: number(locale, forecast.averageDailyOut, 4) })),
    text("p", forecast.available
      ? t("insightCore.explain.daysFormula", { quantity: number(locale, forecast.currentQuantity), average: number(locale, forecast.averageDailyOut, 4), days: number(locale, forecast.daysRemaining, 1) })
      : t("insightCore.explain.unavailableFormula")),
    text("h4", t("insightCore.explain.limitationsTitle")),
  );
  const limitations = document.createElement("ul");
  for (const limitation of forecast.limitations) limitations.append(text("li", t(`insightCore.limitations.${limitation}`)));
  details.append(limitations);
  return details;
}

function forecastContent(insight, t, locale) {
  const wrapper = document.createElement("div");
  wrapper.className = "insight-forecast";
  const { forecast } = insight;
  wrapper.append(text("p", forecast.available
    ? t("insightCore.forecastAvailable", { days: number(locale, forecast.daysRemaining, 1) })
    : t("insightCore.forecastUnavailable"), "insight-forecast__result"));
  wrapper.append(text("p", t(`insightCore.dataSufficiency.${forecast.dataSufficiency}`), "route-meta"));
  if (forecast.dataSufficiency !== "insufficient") wrapper.append(text("p", t(`insightCore.confidence.${forecast.confidence}`), "insight-confidence"));
  wrapper.append(explainForecast(forecast, t, locale));
  return wrapper;
}

function memoryContent(insight, t, locale) {
  const { memory } = insight;
  const wrapper = document.createElement("div");
  wrapper.className = "insight-memory";
  wrapper.append(definitionList([
    [t("insightCore.memory.maximum"), number(locale, memory.maximumQuantity)],
    [t("insightCore.memory.minimum"), number(locale, memory.minimumQuantity)],
    [t("insightCore.memory.lastZero"), date(locale, memory.lastZeroedAt, t("insightCore.notRecorded"))],
    [t("insightCore.memory.replenishments"), String(memory.replenishments)],
    [t("insightCore.memory.lastEntry"), date(locale, memory.lastEntryAt, t("insightCore.notRecorded"))],
    [t("insightCore.memory.lastOutput"), date(locale, memory.lastOutputAt, t("insightCore.notRecorded"))],
    [t("insightCore.memory.largestOutput"), number(locale, memory.largestOutput)],
    [t("insightCore.memory.totalMoved"), number(locale, memory.totalMoved)],
    [t("insightCore.memory.daysSince"), memory.daysSinceLastMovement === null ? t("insightCore.notRecorded") : t("insightCore.days", { value: memory.daysSinceLastMovement })],
  ]));
  const details = document.createElement("details");
  details.className = "insight-explanation";
  details.append(
    text("summary", t("insightCore.memory.explainTitle")),
    text("p", t("insightCore.memory.explainData", { count: memory.eventCount })),
    text("p", t("insightCore.memory.explainMethod")),
    text("p", t("insightCore.memory.explainLimitation")),
  );
  wrapper.append(details);
  return wrapper;
}

export function createProductInsightSections({ insight, t, locale, headingLevel = 2, includeProductLink = false }) {
  const forecastPanel = document.createElement("div");
  const memoryPanel = document.createElement("div");
  const forecastActions = includeProductLink ? createButton({ text: t("dashboardCore.viewProduct"), href: `#/products/${encodeURIComponent(insight.product.id)}`, variant: "secondary" }) : undefined;
  forecastPanel.append(createCard({ title: t("insightCore.forecastTitle"), description: t("insightCore.estimateNotice"), content: forecastContent(insight, t, locale), actions: forecastActions, headingLevel }));
  memoryPanel.append(createCard({ title: t("insightCore.memoryTitle"), description: t("insightCore.memoryDescription"), content: memoryContent(insight, t, locale), headingLevel }));
  const safeProductId = String(insight.product.id).replace(/[^A-Za-z0-9_-]/gu, "-");
  const tabs = createTabs({
    id: `insight-${safeProductId}`,
    tabs: [
      { id: "forecast", label: t("insightCore.forecastTitle"), panel: forecastPanel },
      { id: "memory", label: t("insightCore.memoryTitle"), panel: memoryPanel },
    ],
  });
  tabs.element.classList.add("insight-product-sections");
  return tabs.element;
}

export function createInsightsView({ title, description, t, locale, workspace, service }) {
  const section = document.createElement("section");
  section.className = "route-stack";
  const heading = text("h1", title);
  heading.id = "route-title";
  heading.tabIndex = -1;
  section.append(heading, text("p", description));
  if (!workspace) {
    section.append(createAlert({ title: t("insightCore.workspaceRequiredTitle"), message: t("insightCore.workspaceRequiredMessage"), tone: "warning" }));
    return { element: section, focusTarget: heading };
  }
  const content = createContentStatus({ message: t("insightCore.loading") });
  section.append(content);
  service.listByWorkspace(workspace.id).then((insights) => {
    if (insights.length === 0) {
      content.replaceChildren(createEmptyState({ title: t("insightCore.emptyTitle"), description: t("insightCore.emptyMessage"), action: createButton({ text: t("productCore.newProduct"), href: "#/products/new" }), kind: "insufficient-data" }));
      return;
    }
    const intro = createAlert({ title: t("insightCore.estimateTitle"), message: t("insightCore.estimateMessage"), tone: "info" });
    const list = document.createElement("div");
    list.className = "insight-list";
    for (const insight of insights) {
      const article = document.createElement("article");
      article.className = "insight-product";
      article.append(text("h2", `${insight.product.name} · ${insight.product.nexCode}`), createProductInsightSections({ insight, t, locale, headingLevel: 3, includeProductLink: true }));
      list.append(article);
    }
    content.replaceChildren(intro, list);
  }).catch(() => content.replaceChildren(createAlert({ message: t("insightCore.loadError"), tone: "danger" })));
  return { element: section, focusTarget: heading };
}
