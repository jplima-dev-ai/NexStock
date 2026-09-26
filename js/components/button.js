import { createIcon } from "./icon.js";

const BUTTON_VARIANTS = new Set(["primary", "secondary", "quiet", "danger"]);

export function getButtonClassName(variant = "primary", iconOnly = false) {
  if (!BUTTON_VARIANTS.has(variant)) throw new RangeError(`Button variant not supported: ${variant}`);
  return ["ns-button", `ns-button--${variant}`, iconOnly ? "ns-button--icon" : ""]
    .filter(Boolean)
    .join(" ");
}

export function createButton({
  text,
  variant = "primary",
  type = "button",
  href,
  disabled = false,
  accessibleLabel,
  onClick,
} = {}) {
  if (!text && !accessibleLabel) throw new TypeError("Button requires visible text or an accessible label.");
  const control = document.createElement(href ? "a" : "button");
  control.className = getButtonClassName(variant);
  control.textContent = text ?? accessibleLabel;
  if (accessibleLabel) control.setAttribute("aria-label", accessibleLabel);

  if (href) {
    control.href = href;
    if (disabled) {
      control.setAttribute("aria-disabled", "true");
      control.tabIndex = -1;
      control.addEventListener("click", (event) => event.preventDefault());
    }
  } else {
    control.type = type;
    control.disabled = disabled;
  }
  if (onClick) control.addEventListener("click", onClick);
  return control;
}

export function createIconButton({ label, icon, variant = "quiet", onClick } = {}) {
  if (!label) throw new TypeError("IconButton requires an accessible label.");
  const button = document.createElement("button");
  button.type = "button";
  button.className = getButtonClassName(variant, true);
  button.setAttribute("aria-label", label);
  if (typeof icon === "string") {
    button.append(createIcon(icon));
  } else if (icon instanceof Node) {
    icon.setAttribute?.("aria-hidden", "true");
    button.append(icon);
  } else {
    button.append(createIcon("close"));
  }
  if (onClick) button.addEventListener("click", onClick);
  return button;
}
