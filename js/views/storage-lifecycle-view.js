import { createAlert } from "../components/feedback.js";

function text(tag, value) { const element = document.createElement(tag); element.textContent = value; return element; }

function createFactsList({ facts, t }) {
  const list = document.createElement("dl");
  list.className = "settings-summary__facts";
  for (const key of ["cache", "data", "media", "backup", "snapshots", "browserStorage", "persistence"]) {
    const row = document.createElement("div");
    const value = key === "media"
      ? t(`storageLifecycle.values.${facts[key]}`, { count: facts.mediaCount ?? 0 })
      : key === "snapshots"
        ? t(`storageLifecycle.values.${facts[key]}`, { count: facts.snapshotCount ?? 0 })
        : t(`storageLifecycle.values.${facts[key]}`);
    row.append(text("dt", t(`storageLifecycle.facts.${key}`)), text("dd", value));
    list.append(row);
  }
  return list;
}

export function createStorageLifecycleView({ t, workspace, service }) {
  const section = document.createElement("section");
  section.className = "route-panel route-stack";
  section.setAttribute("aria-labelledby", "storage-lifecycle-title");
  const heading = text("h3", t("storageLifecycle.title"));
  heading.id = "storage-lifecycle-title";
  const status = text("p", t("storageLifecycle.loading"));
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  section.append(heading, text("p", t("storageLifecycle.description")), createAlert({ message: t("storageLifecycle.policyMessage"), tone: "info" }), status);
  service.getFacts(workspace?.id).then((facts) => {
    status.textContent = t("storageLifecycle.ready");
    section.append(createFactsList({ facts, t }));
  });
  return { element: section, focusTarget: heading };
}
