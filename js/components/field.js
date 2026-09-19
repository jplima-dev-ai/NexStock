import { assertComponentId } from "../utils/component-id.js";

const CONTROL_TYPES = new Set(["text", "search", "email", "tel", "url", "number", "date"]);

export function buildFieldIds(id) {
  const safeId = assertComponentId(id);
  return Object.freeze({ control: safeId, help: `${safeId}-help`, error: `${safeId}-error` });
}

export function createErrorMessage(id, message = "") {
  const error = document.createElement("p");
  error.id = assertComponentId(id);
  error.className = "ns-field__error";
  error.textContent = message;
  error.hidden = !message;
  return error;
}

function setDescription(control, ids, hasHelp, hasError) {
  const descriptions = [];
  if (hasHelp) descriptions.push(ids.help);
  if (hasError) descriptions.push(ids.error);
  if (descriptions.length > 0) control.setAttribute("aria-describedby", descriptions.join(" "));
  else control.removeAttribute("aria-describedby");
}

export function createField({
  id,
  label,
  type = "text",
  helpText = "",
  errorText = "",
  required = false,
  requiredText = "",
  value = "",
  options = [],
  rows = 4,
  min,
  max,
  step,
  maxLength,
} = {}) {
  if (!label) throw new TypeError("Field requires a label.");
  const ids = buildFieldIds(id);
  const wrapper = document.createElement("div");
  wrapper.className = "ns-field";

  const labelElement = document.createElement("label");
  labelElement.className = "ns-field__label";
  labelElement.htmlFor = ids.control;
  labelElement.textContent = label;
  if (required) {
    const requiredIndicator = document.createElement("span");
    requiredIndicator.className = "ns-field__required";
    requiredIndicator.textContent = requiredText ? ` ${requiredText}` : "";
    if (requiredIndicator.textContent) labelElement.append(requiredIndicator);
  }

  let control;
  if (type === "select") {
    control = document.createElement("select");
    for (const option of options) {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      optionElement.selected = option.value === value;
      control.append(optionElement);
    }
  } else if (type === "textarea") {
    control = document.createElement("textarea");
    control.rows = rows;
    control.value = value;
  } else {
    if (!CONTROL_TYPES.has(type)) throw new RangeError(`Field type not supported: ${type}`);
    control = document.createElement("input");
    control.type = type;
    control.value = value;
  }
  control.id = ids.control;
  control.name = ids.control;
  control.className = "ns-field__control";
  control.required = required;
  if (min !== undefined) control.min = String(min);
  if (max !== undefined) control.max = String(max);
  if (step !== undefined) control.step = String(step);
  if (maxLength !== undefined) control.maxLength = maxLength;

  const help = document.createElement("p");
  help.id = ids.help;
  help.className = "ns-field__help";
  help.textContent = helpText;
  help.hidden = !helpText;

  const error = createErrorMessage(ids.error, errorText);

  function setError(message) {
    error.textContent = message;
    error.hidden = !message;
    control.setAttribute("aria-invalid", message ? "true" : "false");
    setDescription(control, ids, Boolean(helpText), Boolean(message));
  }

  wrapper.append(labelElement, control, help, error);
  setError(errorText);
  return { element: wrapper, control, setError, clearError: () => setError("") };
}

export function createChoice({ id, name, label, type = "checkbox", value, checked = false } = {}) {
  if (!label) throw new TypeError("Choice requires a label.");
  if (!["checkbox", "radio"].includes(type)) throw new RangeError(`Choice type not supported: ${type}`);
  const safeId = assertComponentId(id);
  const wrapper = document.createElement("div");
  wrapper.className = "ns-choice";
  const control = document.createElement("input");
  control.id = safeId;
  control.name = name ?? safeId;
  control.type = type;
  control.value = value ?? "true";
  control.checked = checked;
  const labelElement = document.createElement("label");
  labelElement.htmlFor = safeId;
  labelElement.textContent = label;
  wrapper.append(control, labelElement);
  return { element: wrapper, control };
}
