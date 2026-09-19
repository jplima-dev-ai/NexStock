import { createButton } from "../components/button.js";
import { createAlert } from "../components/feedback.js";

function text(tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

export function canResetWorkspace({ workspace, persistenceReady }) {
  return Boolean(workspace && persistenceReady);
}

export function createSettingsView({ title, description, t, workspace, persistenceReady, onReset }) {
  const section = document.createElement("section");
  section.className = "route-stack";
  section.setAttribute("aria-labelledby", "route-title");
  const heading = text("h1", title);
  heading.id = "route-title";
  heading.tabIndex = -1;
  section.append(heading, text("p", description));

  const panel = document.createElement("section");
  panel.className = "route-panel route-stack";
  panel.setAttribute("aria-labelledby", "reset-title");
  const resetTitle = text("h2", t("settingsCore.resetTitle"));
  resetTitle.id = "reset-title";
  panel.append(resetTitle, text("p", t("settingsCore.resetDescription")));
  const feedback = document.createElement("div");
  feedback.setAttribute("aria-live", "polite");

  const reset = createButton({
    text: t("settingsCore.resetAction"), variant: "danger",
    disabled: !canResetWorkspace({ workspace, persistenceReady }),
    onClick: () => {
      reset.disabled = true;
      const confirmation = createAlert({ title: t("settingsCore.confirmTitle"), message: t("settingsCore.confirmMessage"), tone: "warning" });
      confirmation.tabIndex = -1;
      const actions = document.createElement("div");
      actions.className = "welcome-actions";
      const cancel = createButton({ text: t("settingsCore.cancel"), variant: "secondary", onClick: () => {
        feedback.replaceChildren();
        reset.disabled = false;
        reset.focus();
      } });
      const confirm = createButton({ text: t("settingsCore.confirmAction"), variant: "danger", onClick: async () => {
        cancel.disabled = true;
        confirm.disabled = true;
        try {
          await onReset();
        } catch {
          feedback.replaceChildren(createAlert({ message: t("settingsCore.resetError"), tone: "danger", urgent: true }));
          reset.disabled = false;
          reset.focus();
        }
      } });
      actions.append(cancel, confirm);
      confirmation.append(actions);
      feedback.replaceChildren(confirmation);
      confirmation.focus();
    },
  });

  if (!workspace) panel.append(createAlert({ message: t("settingsCore.workspaceRequired"), tone: "info" }));
  panel.append(reset, feedback);
  section.append(panel);
  return { element: section, focusTarget: heading };
}
