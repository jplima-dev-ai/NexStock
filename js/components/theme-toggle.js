import { createIcon } from "./icon.js";

export function getThemeToggleKey(theme) {
  return theme === "dark" ? "theme.useLight" : "theme.useDark";
}

export function bindThemeToggle({ button, store, translate }) {
  function render(theme) {
    const darkModeActive = theme === "dark";
    button.setAttribute("aria-pressed", String(darkModeActive));
    button.setAttribute("aria-label", translate("theme.label"));
    const label = translate(getThemeToggleKey(theme));
    button.textContent = label;
    if (typeof document !== "undefined" && typeof button.replaceChildren === "function") {
      const text = document.createElement("span");
      text.textContent = label;
      button.replaceChildren(createIcon(darkModeActive ? "sun" : "moon"), text);
    }
  }

  function handleClick() {
    const nextTheme = store.getState().theme === "dark" ? "light" : "dark";
    store.setState({ theme: nextTheme });
  }

  button.addEventListener("click", handleClick);

  render(store.getState().theme);
  const unsubscribe = store.subscribe((state, previousState) => {
    if (state.theme !== previousState.theme) render(state.theme);
  });
  return Object.freeze({
    render: () => render(store.getState().theme),
    destroy: () => {
      unsubscribe();
      button.removeEventListener("click", handleClick);
    },
  });
}
