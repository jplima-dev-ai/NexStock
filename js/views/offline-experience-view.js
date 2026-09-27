import { createAlert } from "../components/feedback.js";
import { getOfflineExperienceFacts } from "../services/offline-experience-service.js";

function text(tag, value) { const element = document.createElement(tag); element.textContent = value; return element; }

export function createOfflineExperienceView({ t, appState }) {
  const section = document.createElement("section");
  section.className = "route-panel route-stack";
  section.setAttribute("aria-labelledby", "offline-experience-title");
  const heading = text("h3", t("offlineExperience.title"));
  heading.id = "offline-experience-title";
  const facts = getOfflineExperienceFacts({ connection: appState.connection, persistence: appState.persistence, syncState: appState.pwa?.syncState });
  const list = document.createElement("dl");
  list.className = "settings-summary__facts";
  for (const key of ["connection", "storage", "synchronization"]) {
    const row = document.createElement("div");
    row.append(text("dt", t(`offlineExperience.facts.${key}`)), text("dd", t(`offlineExperience.values.${facts[key]}`)));
    list.append(row);
  }
  section.append(heading, text("p", t("offlineExperience.description")), createAlert({ message: t("offlineExperience.honestMessage"), tone: facts.connection === "needsAttention" ? "warning" : "info" }), list);
  return { element: section, focusTarget: heading };
}
