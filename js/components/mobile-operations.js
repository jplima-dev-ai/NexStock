import { createDialog } from "./dialog.js";
import { createButton } from "./button.js";

export function bindMobileOperations({ navigation, actionsButton, dialogLayer, translate, onSearch, onMove, onScan }) {
  if (!navigation || !actionsButton || !dialogLayer) throw new TypeError("Mobile operations require navigation, actions, and a dialog layer.");
  const content = document.createElement("div"); content.className = "mobile-action-sheet";
  const choices = [
    ["mobileOperations.search", onSearch], ["mobileOperations.entry", () => onMove("IN")], ["mobileOperations.output", () => onMove("OUT")], ["mobileOperations.scan", onScan],
  ];
  const dialog = createDialog({ id: "mobile-actions", title: translate("mobileOperations.title"), description: translate("mobileOperations.description"), closeLabel: translate("mobileOperations.close"), content });
  for (const [key, action] of choices) content.append(createButton({ text: translate(key), variant: "secondary", onClick: () => { dialog.close(); action(); } }));
  dialogLayer.append(dialog.element);
  actionsButton.addEventListener("click", () => dialog.open(actionsButton));
  navigation.addEventListener("click", (event) => { if (event.target.closest?.("a")) actionsButton.setAttribute("aria-expanded", "false"); });
  return Object.freeze({ element: dialog.element, destroy: () => dialog.element.remove() });
}
