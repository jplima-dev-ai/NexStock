import { createButton } from "../components/button.js";
import { createAlert } from "../components/feedback.js";

function text(tagName, value, className) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function createFactsList({ facts, t }) {
  const list = document.createElement("dl");
  list.className = "settings-summary__facts";
  for (const key of ["dataLocation", "provider", "backup", "snapshots", "synchronization", "connection"]) {
    const row = document.createElement("div");
    row.append(
      text("dt", t(`privacyDataCenter.facts.${key}`)),
      text("dd", t(`privacyDataCenter.values.${facts[key]}`)),
    );
    list.append(row);
  }
  return list;
}

export function createPrivacyDataCenterView({ t, service }) {
  const section = document.createElement("section");
  section.className = "route-panel route-stack";
  section.setAttribute("aria-labelledby", "privacy-data-center-title");
  const heading = text("h3", t("privacyDataCenter.title"));
  heading.id = "privacy-data-center-title";
  section.append(
    heading,
    text("p", t("privacyDataCenter.description")),
    createAlert({ message: t("privacyDataCenter.honestMessage"), tone: "info" }),
    createFactsList({ facts: service.getFacts(), t }),
  );
  const actions = document.createElement("div");
  actions.className = "welcome-actions";
  actions.append(
    createButton({ text: t("privacyDataCenter.openBackup"), href: "#/settings/data/backup", variant: "secondary" }),
    createButton({ text: t("privacyDataCenter.openSnapshots"), href: "#/settings/data/snapshots", variant: "secondary" }),
  );
  section.append(actions);
  return { element: section, focusTarget: heading };
}
