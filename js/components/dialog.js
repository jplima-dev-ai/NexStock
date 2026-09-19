import { assertComponentId } from "../utils/component-id.js";
import { createButton } from "./button.js";

export const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function createDialog({ id, title, description = "", content, closeLabel = "Fechar" } = {}) {
  if (!title) throw new TypeError("Dialog requires a title.");
  const safeId = assertComponentId(id);
  const dialog = document.createElement("dialog");
  dialog.id = safeId;
  dialog.className = "ns-dialog";
  dialog.setAttribute("aria-labelledby", `${safeId}-title`);
  if (description) dialog.setAttribute("aria-describedby", `${safeId}-description`);

  const surface = document.createElement("div");
  surface.className = "ns-dialog__surface";
  const heading = document.createElement("h2");
  heading.id = `${safeId}-title`;
  heading.tabIndex = -1;
  heading.textContent = title;
  surface.append(heading);
  if (description) {
    const summary = document.createElement("p");
    summary.id = `${safeId}-description`;
    summary.textContent = description;
    surface.append(summary);
  }
  if (content instanceof Node) surface.append(content);

  const actions = document.createElement("div");
  actions.className = "ns-dialog__actions";
  const closeButton = createButton({ text: closeLabel, variant: "secondary", onClick: () => dialog.close() });
  actions.append(closeButton);
  surface.append(actions);
  dialog.append(surface);

  let returnFocusTarget = null;
  dialog.addEventListener("close", () => {
    if (returnFocusTarget?.isConnected) returnFocusTarget.focus();
    returnFocusTarget = null;
  });

  function open(trigger) {
    if (dialog.open) return;
    returnFocusTarget = trigger ?? document.activeElement;
    dialog.showModal();
    queueMicrotask(() => (dialog.querySelector(FOCUSABLE_SELECTOR) ?? heading).focus());
  }

  return Object.freeze({
    element: dialog,
    open,
    close: () => {
      if (dialog.open) dialog.close();
    },
    closeButton,
  });
}
