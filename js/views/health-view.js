import { createButton } from "../components/button.js";
import { createAlert } from "../components/feedback.js";
import { createEmptyState } from "../components/empty-state.js";

function text(tag, value, className) { const element = document.createElement(tag); if (className) element.className = className; element.textContent = value; return element; }

export function createHealthView({ title, description, t, workspace, service }) {
  const section = document.createElement("section"); section.className = "route-stack"; section.setAttribute("aria-labelledby", "route-title");
  const heading = text("h1", title); heading.id = "route-title"; heading.tabIndex = -1; section.append(heading, text("p", description));
  if (!workspace) {
    section.append(createAlert({ title: t("nexHealth.workspaceRequiredTitle"), message: t("nexHealth.workspaceRequiredMessage"), tone: "info" }));
    return { element: section, focusTarget: heading };
  }
  const results = document.createElement("section"); results.setAttribute("aria-live", "polite"); results.setAttribute("aria-labelledby", "health-results-title");
  const render = (report, { focus = false } = {}) => {
    const resultsTitle = text("h2", t("nexHealth.resultsTitle")); resultsTitle.id = "health-results-title";
    if (report.healthy) results.replaceChildren(resultsTitle, createEmptyState({ title: t("nexHealth.healthyTitle"), description: t("nexHealth.healthyMessage"), kind: "positive" }));
    else {
      const list = document.createElement("ul"); list.className = "route-stack";
      for (const item of report.issues) {
        const entry = document.createElement("li");
        entry.append(text("strong", t(`nexHealth.issues.${item.code}`)), text("p", t("nexHealth.reviewMessage"), "route-meta"));
        list.append(entry);
      }
      results.replaceChildren(resultsTitle, createAlert({ title: t("nexHealth.issuesTitle"), message: t("nexHealth.issuesMessage", { count: report.total }), tone: "warning" }), list);
    }
    if (focus) { results.tabIndex = -1; results.focus(); }
  };
  const run = async ({ focus = false } = {}) => {
    runButton.disabled = true; results.replaceChildren(text("p", t("nexHealth.checking"), "route-meta"));
    try { render(await service.diagnose(workspace.id), { focus }); }
    catch { results.replaceChildren(createAlert({ title: t("nexHealth.errorTitle"), message: t("nexHealth.errorMessage"), tone: "danger", urgent: true })); if (focus) { results.tabIndex = -1; results.focus(); } }
    finally { runButton.disabled = false; }
  };
  const runButton = createButton({ text: t("nexHealth.run"), onClick: () => run({ focus: true }) });
  section.append(createAlert({ title: t("nexHealth.honestTitle"), message: t("nexHealth.honestMessage"), tone: "info" }), runButton, results);
  run();
  return { element: section, focusTarget: heading };
}
