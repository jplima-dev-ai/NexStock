import { createButton } from "../components/button.js";
import { createAlert } from "../components/feedback.js";

function text(tag, value, className) { const element = document.createElement(tag); if (className) element.className = className; element.textContent = value; return element; }
function baseView(title, description) { const section = document.createElement("section"); section.className = "route-stack"; const heading = text("h1", title); heading.id = "route-title"; heading.tabIndex = -1; section.append(heading, text("p", description)); return { section, heading }; }

export function createSecurityCenterView({ title, description, t, service }) {
  const { section, heading } = baseView(title, description);
  section.append(createAlert({ title: t("securityCenter.honestTitle"), message: t("securityCenter.honestMessage"), tone: "info" }));
  const facts = service.getFacts(); const list = document.createElement("dl"); list.className = "insight-data";
  for (const [key, value] of Object.entries(facts)) { const row = document.createElement("div"); row.append(text("dt", t(`securityCenter.facts.${key}`)), text("dd", t(`securityCenter.values.${value}`, {}) === `securityCenter.values.${value}` ? value : t(`securityCenter.values.${value}`))); list.append(row); }
  section.append(list, createButton({ text: t("securityCenter.openTests"), href: "#/shield-test" }));
  return { element: section, focusTarget: heading };
}

export function createShieldTestView({ title, description, t, service }) {
  const { section, heading } = baseView(title, description); const results = document.createElement("div"); results.setAttribute("aria-live", "polite");
  const run = createButton({ text: t("shieldTest.run"), onClick: () => {
    const report = service.runIsolatedTests(); const summary = createAlert({ title: t(report.passed ? "shieldTest.passedTitle" : "shieldTest.failedTitle"), message: t(report.passed ? "shieldTest.passedMessage" : "shieldTest.failedMessage"), tone: report.passed ? "success" : "danger" });
    const list = document.createElement("ul");
    for (const item of report.results) list.append(text("li", t(`shieldTest.tests.${item.id}.${item.passed ? "passed" : "failed"}`)));
    results.replaceChildren(summary, list, text("p", t("shieldTest.isolated"), "route-meta")); results.tabIndex = -1; results.focus();
  } });
  section.append(createAlert({ title: t("shieldTest.warningTitle"), message: t("shieldTest.warningMessage"), tone: "info" }), run, results);
  return { element: section, focusTarget: heading };
}
