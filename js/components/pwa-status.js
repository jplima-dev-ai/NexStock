import { createButton } from "./button.js";

export function createPwaStatus({ container, translate, onUpdate }) {
  const offline = document.createElement("p");
  offline.className = "offline-indicator";
  offline.setAttribute("role", "status");
  offline.hidden = true;

  const update = document.createElement("section");
  update.className = "pwa-update";
  update.setAttribute("role", "status");
  update.hidden = true;
  const message = document.createElement("p");
  const button = createButton({ text: translate("pwa.updateNow"), onClick: onUpdate });
  update.append(message, button);
  container.append(offline, update);

  return {
    renderConnection(connection) {
      offline.textContent = translate("pwa.offlineMessage");
      offline.hidden = connection !== "offline";
    },
    showUpdate() {
      message.textContent = translate("pwa.updateReady");
      button.textContent = translate("pwa.updateNow");
      update.hidden = false;
    },
    hideUpdate() { update.hidden = true; },
  };
}
