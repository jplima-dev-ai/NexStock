import { createButton } from "../components/button.js";
import { createCard, createMetricCard } from "../components/card.js";
import { createEmptyState } from "../components/empty-state.js";
import { createAlert } from "../components/feedback.js";
import { createTable } from "../components/table.js";
import { buildInventoryStory } from "../services/inventory-story-service.js";

function text(tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function pulseNarrative(snapshot, t) {
  if (snapshot.counts.out > 0) return t("dashboardCore.pulse.out", { count: snapshot.counts.out });
  if (snapshot.counts.critical > 0) return t("dashboardCore.pulse.critical", { count: snapshot.counts.critical });
  if (snapshot.counts.attention > 0) return t("dashboardCore.pulse.attention", { count: snapshot.counts.attention });
  if (snapshot.counts.stopped > 0) return t("dashboardCore.pulse.stopped", { count: snapshot.counts.stopped });
  return t("dashboardCore.pulse.healthy");
}

function createPulse(snapshot, t) {
  const content = document.createElement("div");
  content.className = "dashboard-pulse";
  content.append(text("p", pulseNarrative(snapshot, t), "dashboard-pulse__narrative"));
  const score = text("p", t("dashboardCore.pulse.score", { score: snapshot.pulse.score }));
  score.className = "dashboard-pulse__score";
  const list = document.createElement("ul");
  list.className = "dashboard-pulse__breakdown";
  for (const [key, value] of Object.entries(snapshot.pulse.rates)) {
    list.append(text("li", t(`dashboardCore.pulse.dimension.${key}`, { value })));
  }
  content.append(score, list, text("p", snapshot.pulse.forecastAvailable
    ? t("dashboardCore.pulse.forecastActive", snapshot.pulse.forecastCoverage)
    : t("dashboardCore.pulse.forecastPending"), "route-meta"));
  return createCard({ title: t("dashboardCore.pulse.title"), description: t("dashboardCore.pulse.question"), content });
}

function priorityDescription(priority, t) {
  const parameters = { quantity: priority.product.currentQuantity, minimum: priority.product.minimumStock };
  return t(`dashboardCore.priority.${priority.type}`, parameters);
}

function createPriorityList(priorities, t, limit) {
  if (priorities.length === 0) return createAlert({ title: t("dashboardCore.priorityClearTitle"), message: t("dashboardCore.priorityClearMessage"), tone: "success" });
  const list = document.createElement("ol");
  list.className = "dashboard-priorities";
  for (const priority of priorities.slice(0, limit)) {
    const item = document.createElement("li");
    const copy = document.createElement("div");
    copy.append(text("h3", priority.product.name), text("p", t(`dashboardCore.priorityLabel.${priority.type}`), "dashboard-priority__label"), text("p", priorityDescription(priority, t)));
    item.append(copy, createButton({ text: t("dashboardCore.viewProduct"), href: `#/products/${encodeURIComponent(priority.product.id)}`, variant: "secondary" }));
    list.append(item);
  }
  return list;
}

function createMetrics(snapshot, t) {
  const grid = document.createElement("div");
  grid.className = "dashboard-metrics";
  for (const [key, value] of Object.entries(snapshot.metrics)) {
    grid.append(createMetricCard({ label: t(`dashboardCore.metrics.${key}.label`), value, context: t(`dashboardCore.metrics.${key}.context`) }));
  }
  return grid;
}

function recentMovementTable(snapshot, t, locale) {
  const names = new Map(snapshot.products.map((product) => [product.id, product.name]));
  return createTable({
    caption: t("dashboardCore.recentCaption"),
    emptyMessage: t("dashboardCore.noMovements"),
    rows: snapshot.recentMovements,
    columns: [
      { key: "createdAt", label: t("movement.date"), render: (item) => new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(item.createdAt)) },
      { key: "productId", label: t("movement.product"), render: (item) => names.get(item.productId) ?? item.productId },
      { key: "type", label: t("movement.type"), render: (item) => t(`movement.types.${item.type}`) },
      { key: "quantity", label: t("movement.quantity") },
      { key: "afterQuantity", label: t("movement.after") },
    ],
  });
}

function createInventoryStory(snapshot, t) {
  const section = document.createElement("section");
  section.className = "dashboard-section inventory-story";
  section.setAttribute("aria-labelledby", "inventory-story-title");
  const title = text("h2", t("inventoryStory.title"));
  title.id = "inventory-story-title";
  section.append(title, text("p", t("inventoryStory.description"), "route-meta"));
  for (const paragraph of buildInventoryStory(snapshot)) {
    section.append(text("p", t(paragraph.key, paragraph.parameters)));
  }
  return section;
}

function baseView({ title, description }) {
  const section = document.createElement("section");
  section.className = "route-stack";
  const heading = text("h1", title);
  heading.id = "route-title";
  heading.tabIndex = -1;
  section.append(heading, text("p", description));
  return { section, heading };
}

export function createDashboardView({ title, description, t, locale, workspace, service }) {
  const { section, heading } = baseView({ title, description });
  if (!workspace) {
    section.append(createAlert({ title: t("dashboardCore.workspaceRequiredTitle"), message: t("dashboardCore.workspaceRequiredMessage"), tone: "warning" }), createButton({ text: t("productCore.configure"), href: "#/onboarding" }));
    return { element: section, focusTarget: heading };
  }
  const content = text("p", t("dashboardCore.loading"));
  content.setAttribute("role", "status");
  section.append(content);
  service.getSnapshot(workspace.id).then((snapshot) => {
    if (snapshot.metrics.products === 0) {
      content.replaceChildren(createEmptyState({ title: t("dashboardCore.emptyTitle"), description: t("dashboardCore.emptyMessage"), action: createButton({ text: t("productCore.newProduct"), href: "#/products/new" }) }));
      return;
    }
    const context = document.createElement("header");
    context.className = "dashboard-context";
    context.append(text("h2", t("dashboardCore.contextTitle", { workspace: workspace.name })), text("p", t("dashboardCore.contextMessage")));
    const priorities = document.createElement("section");
    priorities.className = "dashboard-section";
    priorities.append(text("h2", t("dashboardCore.prioritiesTitle")), createPriorityList(snapshot.priorities, t, 5));
    if (snapshot.priorities.length > 0) priorities.append(createButton({ text: t("dashboardCore.viewRadar"), href: "#/radar", variant: "secondary" }));
    const metrics = document.createElement("section");
    metrics.className = "dashboard-section";
    metrics.append(text("h2", t("dashboardCore.metricsTitle")), createMetrics(snapshot, t));
    const recent = document.createElement("section");
    recent.className = "dashboard-section";
    recent.append(text("h2", t("dashboardCore.recentTitle")), recentMovementTable(snapshot, t, locale), createButton({ text: t("dashboardCore.allMovements"), href: "#/movements", variant: "secondary" }));
    const insights = document.createElement("section");
    insights.className = "dashboard-section";
    insights.append(text("h2", t("dashboardCore.insightsTitle")), text("p", t("dashboardCore.insightsMessage")), createButton({ text: t("dashboardCore.openInsights"), href: "#/insights" }));
    content.replaceChildren(context, createPulse(snapshot, t), priorities, metrics, createInventoryStory(snapshot, t), recent, insights);
  }).catch(() => content.replaceChildren(createAlert({ message: t("dashboardCore.loadError"), tone: "danger" })));
  return { element: section, focusTarget: heading };
}

export function createRadarView({ title, description, t, workspace, service }) {
  const { section, heading } = baseView({ title, description });
  if (!workspace) {
    section.append(createAlert({ title: t("dashboardCore.workspaceRequiredTitle"), message: t("dashboardCore.workspaceRequiredMessage"), tone: "warning" }));
    return { element: section, focusTarget: heading };
  }
  const content = text("p", t("dashboardCore.loading"));
  content.setAttribute("role", "status");
  section.append(content);
  service.getSnapshot(workspace.id).then((snapshot) => {
    const intro = createAlert({ title: t("dashboardCore.radarTitle"), message: t("dashboardCore.radarMessage", { count: snapshot.priorities.length }), tone: snapshot.priorities.length ? "warning" : "success" });
    content.replaceChildren(intro, createPriorityList(snapshot.priorities, t, Number.POSITIVE_INFINITY), createButton({ text: t("dashboardCore.backDashboard"), href: "#/dashboard", variant: "secondary" }));
  }).catch(() => content.replaceChildren(createAlert({ message: t("dashboardCore.loadError"), tone: "danger" })));
  return { element: section, focusTarget: heading };
}
