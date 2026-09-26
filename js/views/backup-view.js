import { createButton } from "../components/button.js";
import { createAlert } from "../components/feedback.js";
import { createField } from "../components/field.js";

function text(tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function download({ content, filename }) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function createSummary(inspection, t) {
  const section = document.createElement("section");
  section.className = "route-stack backup-preview";
  section.setAttribute("aria-labelledby", "backup-preview-title");
  const heading = text("h4", t("backupCenter.previewTitle"));
  heading.id = "backup-preview-title";
  heading.tabIndex = -1;
  const facts = document.createElement("dl");
  facts.className = "settings-summary__facts";
  for (const [label, value] of [
    [t("backupCenter.workspace"), inspection.workspace.name],
    [t("backupCenter.generatedAt"), new Date(inspection.generatedAt).toLocaleString()],
    [t("backupCenter.recordCount"), t("backupCenter.recordCountValue", { count: inspection.totalRecords })],
    [t("backupCenter.media"), t("backupCenter.mediaUnavailable")],
  ]) {
    const row = document.createElement("div");
    row.append(text("dt", label), text("dd", value));
    facts.append(row);
  }
  const countList = document.createElement("ul");
  countList.className = "backup-counts";
  for (const [store, count] of Object.entries(inspection.counts)) {
    if (count) countList.append(text("li", t("backupCenter.collectionCount", { collection: t(`backupCenter.collections.${store}`), count })));
  }
  section.append(heading, facts, text("h5", t("backupCenter.contentsTitle")), countList);
  return { element: section, focusTarget: heading };
}

export function createBackupCenterView({ t, workspace, service, snapshotService, onRestored }) {
  const section = document.createElement("section");
  section.className = "route-stack backup-center";
  section.setAttribute("aria-labelledby", "backup-center-title");
  const heading = text("h3", t("backupCenter.title"));
  heading.id = "backup-center-title";
  section.append(heading, text("p", t("backupCenter.description")));
  if (!workspace) {
    section.append(createAlert({ message: t("backupCenter.workspaceRequired"), tone: "warning" }));
    return { element: section, focusTarget: heading };
  }

  const createArea = document.createElement("section");
  createArea.className = "route-stack route-panel";
  createArea.setAttribute("aria-labelledby", "backup-create-title");
  createArea.append(text("h4", t("backupCenter.createTitle")), text("p", t("backupCenter.createDescription")));
  const createFeedback = document.createElement("div");
  createFeedback.setAttribute("role", "status");
  createFeedback.setAttribute("aria-live", "polite");
  const createAction = createButton({ text: t("backupCenter.createAction"), onClick: async () => {
    createAction.disabled = true;
    try {
      const backup = await service.create(workspace.id);
      download(backup);
      createFeedback.textContent = t("backupCenter.created", { count: backup.totalRecords });
    } catch {
      createFeedback.replaceChildren(createAlert({ message: t("backupCenter.createError"), tone: "danger", urgent: true }));
    } finally { createAction.disabled = false; }
  } });
  createArea.append(createAction, createFeedback);

  const restoreArea = document.createElement("section");
  restoreArea.className = "route-stack route-panel";
  restoreArea.setAttribute("aria-labelledby", "backup-restore-title");
  restoreArea.append(text("h4", t("backupCenter.restoreTitle")), text("p", t("backupCenter.restoreDescription")));
  const file = createField({
    id: "backup-file", label: t("backupCenter.fileLabel"), helpText: t("backupCenter.fileHelp"), type: "file", accept: ".json,application/json",
  });
  const feedback = document.createElement("div");
  feedback.setAttribute("aria-live", "polite");
  const result = document.createElement("div");
  result.className = "route-stack";
  restoreArea.append(file.element, feedback, result);

  file.control.addEventListener("change", async () => {
    result.replaceChildren();
    feedback.replaceChildren();
    const selected = file.control.files?.[0];
    if (!selected) return;
    file.control.disabled = true;
    try {
      const inspection = await service.inspect(workspace.id, await selected.text());
      const preview = createSummary(inspection, t);
      const warning = createAlert({
        title: t(inspection.hasConflict ? "backupCenter.conflictTitle" : "backupCenter.restoreWarningTitle"),
        message: t(inspection.hasConflict ? "backupCenter.conflictMessage" : "backupCenter.restoreWarningMessage"),
        tone: "warning",
      });
      const actions = document.createElement("div");
      actions.className = "welcome-actions";
      const cancel = createButton({ text: t("backupCenter.cancel"), variant: "secondary", onClick: () => {
        result.replaceChildren(); file.control.value = ""; file.control.focus();
      } });
      const confirm = createButton({ text: t("backupCenter.confirmAction"), variant: "danger", onClick: async () => {
        cancel.disabled = true; confirm.disabled = true;
        try {
          await snapshotService?.create(workspace.id, { label: t("backupCenter.preRestoreSnapshot"), reason: "before-backup-restore" });
          const restored = await service.restore(workspace.id, inspection);
          result.replaceChildren(createAlert({ title: t("backupCenter.successTitle"), message: t("backupCenter.successMessage", { count: inspection.totalRecords }), tone: "success" }));
          await onRestored(restored);
        } catch {
          cancel.disabled = false; confirm.disabled = false;
          feedback.replaceChildren(createAlert({ message: t("backupCenter.restoreError"), tone: "danger", urgent: true }));
        }
      } });
      actions.append(cancel, confirm);
      warning.append(actions);
      result.append(preview.element, warning);
      preview.focusTarget.focus();
    } catch {
      feedback.replaceChildren(createAlert({ message: t("backupCenter.inspectError"), tone: "danger", urgent: true }));
    } finally { file.control.disabled = false; }
  });
  section.append(createArea, restoreArea);
  return { element: section, focusTarget: heading };
}
