import { createIcon } from "./icon.js";

export function bindMobileNavigation({ button, navigation, translate }) {
  if (!button || !navigation) throw new TypeError("Mobile navigation requires a button and navigation landmark.");

  function render(open) {
    button.setAttribute("aria-expanded", String(open));
    const label = translate(open ? "app.closeMenu" : "app.openMenu");
    button.textContent = label;
    if (typeof document !== "undefined" && typeof button.replaceChildren === "function") {
      const text = document.createElement("span");
      text.textContent = label;
      button.replaceChildren(createIcon(open ? "close" : "menu"), text);
    }
    navigation.dataset.open = String(open);
  }

  button.addEventListener("click", () => render(button.getAttribute("aria-expanded") !== "true"));
  navigation.addEventListener("click", (event) => {
    if (event.target.closest?.("a")) render(false);
  });
  render(false);

  return Object.freeze({ close: () => render(false), render: () => render(button.getAttribute("aria-expanded") === "true") });
}
