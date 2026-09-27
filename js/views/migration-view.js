import { createAlert } from "../components/feedback.js";
import { getMigrationCertificate } from "../services/migration-service.js";

function text(tag, value) { const element = document.createElement(tag); element.textContent = value; return element; }

export function createMigrationView({ t }) {
  const certificate = getMigrationCertificate();
  const section = document.createElement("section"); section.className = "route-panel route-stack"; section.setAttribute("aria-labelledby", "migration-title");
  const heading = text("h3", t("migrationCenter.title")); heading.id = "migration-title";
  const list = document.createElement("dl"); list.className = "settings-summary__facts";
  for (const key of ["storedVersion", "currentVersion", "policy", "status"]) { const row = document.createElement("div"); row.append(text("dt", t(`migrationCenter.facts.${key}`)), text("dd", key.includes("Version") ? String(certificate[key]) : t(`migrationCenter.values.${certificate[key]}`))); list.append(row); }
  section.append(heading, text("p", t("migrationCenter.description")), createAlert({ message: t("migrationCenter.message"), tone: "info" }), list);
  return { element: section, focusTarget: heading };
}
