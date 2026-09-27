import { createButton } from "../components/button.js";
import { createAlert } from "../components/feedback.js";
import { APP_VERSION } from "../core/version.js";

function text(tag, value) { const element = document.createElement(tag); element.textContent = value; return element; }

export function createPwaUpdateCenterView({ t, appState, service, onApplyUpdate }) {
  const section = document.createElement("section");
  section.className = "route-panel route-stack";
  section.setAttribute("aria-labelledby", "pwa-update-center-title");
  const facts = service.getUpdateFacts({ appVersion: APP_VERSION, updateAvailable: appState.pwa?.updateAvailable, criticalOperation: appState.pwa?.criticalOperation });
  const heading = text("h3", t("pwaUpdateCenter.title")); heading.id = "pwa-update-center-title";
  const list = document.createElement("dl"); list.className = "settings-summary__facts";
  for (const key of ["version", "installation", "cache", "update"]) { const row = document.createElement("div"); row.append(text("dt", t(`pwaUpdateCenter.facts.${key}`)), text("dd", key === "version" ? facts[key] : t(`pwaUpdateCenter.values.${facts[key]}`))); list.append(row); }
  const feedback = document.createElement("p"); feedback.setAttribute("role", "status"); feedback.setAttribute("aria-live", "polite");
  const install = createButton({ text: t("pwaUpdateCenter.installAction"), variant: "secondary", disabled: facts.installation !== "available", onClick: async () => { const installed = await service.requestInstall(); feedback.textContent = t(installed ? "pwaUpdateCenter.installRequested" : "pwaUpdateCenter.installUnavailable"); } });
  const update = createButton({ text: t("pwaUpdateCenter.updateAction"), disabled: facts.update !== "available", onClick: () => { if (!onApplyUpdate()) feedback.textContent = t("pwaUpdateCenter.updateUnavailable"); } });
  section.append(heading, text("p", t("pwaUpdateCenter.description")), createAlert({ message: t(`pwaUpdateCenter.messages.${facts.update}`), tone: facts.update === "deferred" ? "warning" : "info" }), list, install, update, feedback);
  return { element: section, focusTarget: heading };
}
