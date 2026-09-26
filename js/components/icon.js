const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const ICONS = Object.freeze({
  archive: Object.freeze(["M4 7h16", "M5 7l1-3h12l1 3", "M6 7v13h12V7", "M10 11h4"]),
  check: Object.freeze(["M20 6 9 17l-5-5"]),
  close: Object.freeze(["m6 6 12 12", "M18 6 6 18"]),
  danger: Object.freeze(["M12 3 2.5 20h19L12 3Z", "M12 9v4", "M12 17h.01"]),
  info: Object.freeze(["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "M12 10v6", "M12 7h.01"]),
  menu: Object.freeze(["M4 7h16", "M4 12h16", "M4 17h16"]),
  moon: Object.freeze(["M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"]),
  search: Object.freeze(["M21 21l-4.35-4.35", "M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"]),
  sun: Object.freeze(["M12 4V2", "M12 22v-2", "m4.93 4.93-1.42-1.42", "m20.49 20.49-1.42-1.42", "M4 12H2", "M22 12h-2", "m4.93 19.07-1.42 1.42", "m20.49 3.51-1.42 1.42", "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"]),
  warning: Object.freeze(["M12 3 2.5 20h19L12 3Z", "M12 9v4", "M12 17h.01"]),
});

export function getIconDefinition(name) {
  const definition = ICONS[name];
  if (!definition) throw new RangeError(`Icon not supported: ${name}`);
  return definition;
}

export function createIcon(name, { label, size = "base" } = {}) {
  if (!new Set(["small", "base", "large"]).has(size)) throw new RangeError(`Icon size not supported: ${size}`);
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.classList.add("ns-icon", `ns-icon--${size}`);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("focusable", "false");
  if (label) {
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", label);
  } else {
    svg.setAttribute("aria-hidden", "true");
  }
  for (const data of getIconDefinition(name)) {
    const path = document.createElementNS(SVG_NAMESPACE, "path");
    path.setAttribute("d", data);
    svg.append(path);
  }
  return svg;
}
