import { createButton } from "../components/button.js";
import { createAlert } from "../components/feedback.js";
import { createField } from "../components/field.js";
import { MAX_LOCAL_SNAPSHOTS } from "../services/snapshot-service.js";

function text(tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function readableDate(value, locale) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(locale);
}

function createSnapshotList({ snapshots, t, locale, onRestore, onDelete }) {
  const section = document.createElement("section");
  section.className = "route-stack";
  section.setAttribute("aria-labelledby", "snapshot-list-title");
  section.append(text("h4", t("snapshotCenter.listTitle")));
  if (!snapshots.length) {
    section.append(createAlert({ message: t("snapshotCenter.empty"), tone: "info" }));
    return section;
  }
  const list = document.createElement("ul");
  list.className = "route-stack";
  for (const snapshot of snapshots) {
    const item = document.createElement("li");
    item.className = "route-panel route-stack";
    const title = text("h5", snapshot.label);
    const meta = text("p", t("snapshotCenter.itemMeta", { date: readableDate(snapshot.createdAt, locale), count: snapshot.totalRecords }), "route-meta");
    const actions = document.createElement("div");
    actions.className = "welcome-actions";
    const restore = createButton({ text: t("snapshotCenter.restoreAction"), onClick: () => onRestore(snapshot, item) });
    const remove = createButton({ text: t("snapshotCenter.deleteAction"), variant: "danger", onClick: () => onDelete(snapshot, item) });
    actions.append(restore, remove);
    item.append(title, meta, actions);
    list.append(item);
  }
  section.append(list);
  return section;
}

export function createSnapshotCenterView({ t, locale, workspace, service, onRestored }) {
  const section = document.createElement("section");
  section.className = "route-stack snapshot-center";
  section.setAttribute("aria-labelledby", "snapshot-center-title");
  const heading = text("h3", t("snapshotCenter.title"));
  heading.id = "snapshot-center-title";
  section.append(heading, text("p", t("snapshotCenter.description")));
  if (!workspace) {
    section.append(createAlert({ message: t("snapshotCenter.workspaceRequired"), tone: "warning" }));
    return { element: section, focusTarget: heading };
  }
  const create = document.createElement("form");
  create.className = "route-panel route-stack";
  create.append(text("h4", t("snapshotCenter.createTitle")), text("p", t("snapshotCenter.createDescription", { limit: MAX_LOCAL_SNAPSHOTS })));
  const label = createField({ id: "snapshot-label", label: t("snapshotCenter.label"), helpText: t("snapshotCenter.labelHelp"), maxLength: 80 });
  const feedback = document.createElement("div");
  feedback.setAttribute("aria-live", "polite");
  const createAction = createButton({ text: t("snapshotCenter.createAction"), type: "submit" });
  create.append(label.element, createAction, feedback);
  const content = document.createElement("div");
  content.className = "route-stack";
  section.append(create, content);

  async function refresh({ focus = false } = {}) {
    const snapshots = await service.list(workspace.id);
    content.replaceChildren(createSnapshotList({ snapshots, t, locale, onRestore: requestRestore, onDelete: requestDelete }));
    if (focus) content.querySelector("h4")?.focus();
  }
  async function requestRestore(snapshot, item) {
    const warning = createAlert({ title: t("snapshotCenter.restoreConfirmTitle"), message: t("snapshotCenter.restoreConfirmMessage", { label: snapshot.label }), tone: "warning" });
    warning.tabIndex = -1;
    const actions = document.createElement("div"); actions.className = "welcome-actions";
    const cancel = createButton({ text: t("snapshotCenter.cancel"), variant: "secondary", onClick: () => { warning.remove(); item.querySelector("button")?.focus(); } });
    const confirm = createButton({ text: t("snapshotCenter.restoreConfirmAction"), variant: "danger", onClick: async () => {
      cancel.disabled = true; confirm.disabled = true;
      try { const result = await service.restore(workspace.id, snapshot.id); await onRestored(result.workspace); }
      catch { feedback.replaceChildren(createAlert({ message: t("snapshotCenter.restoreError"), tone: "danger", urgent: true })); cancel.disabled = false; confirm.disabled = false; }
    } });
    actions.append(cancel, confirm); warning.append(actions); item.append(warning); warning.focus();
  }
  async function requestDelete(snapshot, item) {
    const warning = createAlert({ title: t("snapshotCenter.deleteConfirmTitle"), message: t("snapshotCenter.deleteConfirmMessage", { label: snapshot.label }), tone: "warning" });
    warning.tabIndex = -1;
    const actions = document.createElement("div"); actions.className = "welcome-actions";
    const cancel = createButton({ text: t("snapshotCenter.cancel"), variant: "secondary", onClick: () => { warning.remove(); item.querySelector("button")?.focus(); } });
    const confirm = createButton({ text: t("snapshotCenter.deleteConfirmAction"), variant: "danger", onClick: async () => {
      cancel.disabled = true; confirm.disabled = true;
      try { await service.remove(workspace.id, snapshot.id); await refresh({ focus: true }); }
      catch { feedback.replaceChildren(createAlert({ message: t("snapshotCenter.deleteError"), tone: "danger", urgent: true })); cancel.disabled = false; confirm.disabled = false; }
    } });
    actions.append(cancel, confirm); warning.append(actions); item.append(warning); warning.focus();
  }
  create.addEventListener("submit", async (event) => {
    event.preventDefault(); createAction.disabled = true; feedback.replaceChildren();
    try { await service.create(workspace.id, { label: label.control.value, reason: "manual" }); label.control.value = ""; await refresh({ focus: true }); feedback.textContent = t("snapshotCenter.created"); }
    catch { feedback.replaceChildren(createAlert({ message: t("snapshotCenter.createError", { limit: MAX_LOCAL_SNAPSHOTS }), tone: "danger", urgent: true })); }
    finally { createAction.disabled = false; }
  });
  refresh().catch(() => content.replaceChildren(createAlert({ message: t("snapshotCenter.loadError"), tone: "danger", urgent: true })));
  return { element: section, focusTarget: heading };
}
