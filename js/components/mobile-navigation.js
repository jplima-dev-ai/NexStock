export function bindMobileNavigation({ button, navigation, translate }) {
  if (!button || !navigation) throw new TypeError("Mobile navigation requires a button and navigation landmark.");

  function render(open) {
    button.setAttribute("aria-expanded", String(open));
    button.textContent = translate(open ? "app.closeMenu" : "app.openMenu");
    navigation.dataset.open = String(open);
  }

  button.addEventListener("click", () => render(button.getAttribute("aria-expanded") !== "true"));
  navigation.addEventListener("click", (event) => {
    if (event.target.closest?.("a")) render(false);
  });
  render(false);

  return Object.freeze({ close: () => render(false), render: () => render(button.getAttribute("aria-expanded") === "true") });
}
