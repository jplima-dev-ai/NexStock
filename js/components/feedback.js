import { createIconButton } from "./button.js";

const FEEDBACK_TONES = new Set(["info", "success", "warning", "danger"]);

export function normalizeFeedbackTone(tone = "info") {
  if (!FEEDBACK_TONES.has(tone)) throw new RangeError(`Feedback tone not supported: ${tone}`);
  return tone;
}

export function clearFeedbackLayer(layer) {
  if (!layer) throw new TypeError("Feedback layer is required.");
  layer.replaceChildren();
}

export function createAlert({ title, message, tone = "info", urgent = false } = {}) {
  if (!message) throw new TypeError("Alert requires a message.");
  const safeTone = normalizeFeedbackTone(tone);
  const alert = document.createElement("section");
  alert.className = `ns-alert ns-alert--${safeTone}`;
  if (urgent) alert.setAttribute("role", "alert");
  if (title) {
    const heading = document.createElement("h2");
    heading.className = "ns-alert__title";
    heading.textContent = title;
    alert.append(heading);
  }
  const text = document.createElement("p");
  text.textContent = message;
  alert.append(text);
  return alert;
}

export function createToastManager(layer, { getCloseLabel = () => "Close" } = {}) {
  if (!layer) throw new TypeError("Toast manager requires a layer element.");
  return Object.freeze({
    clear() {
      clearFeedbackLayer(layer);
    },
    show({ message, tone = "info" } = {}) {
      if (!message) throw new TypeError("Toast requires a message.");
      const safeTone = normalizeFeedbackTone(tone);
      const toast = document.createElement("div");
      toast.className = `ns-toast ns-toast--${safeTone}`;
      const text = document.createElement("p");
      text.textContent = message;
      const close = createIconButton({
        label: getCloseLabel(),
        icon: "×",
        onClick: () => toast.remove(),
      });
      toast.append(text, close);
      layer.append(toast);
      return Object.freeze({ element: toast, dismiss: () => toast.remove() });
    },
  });
}
