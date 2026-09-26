import { createAlert } from "../components/feedback.js";
import { createButton } from "../components/button.js";
import { createField } from "../components/field.js";
import { NEX_LABEL_TYPES } from "../services/label-service.js";

function text(tag, value, className) { const element = document.createElement(tag); if (className) element.className = className; element.textContent = value; return element; }

function targetOptions(type, options, t) {
  if (type === "product") return options.products.map((product) => ({ value: product.id, label: `${product.name} — ${product.nexCode}` }));
  if (type === "batch") return options.batches.map((batch) => ({ value: batch.id, label: `${batch.product.name} — ${t("labels.batchDetail", { batch: batch.batchNumber })}` }));
  if (type === "unit") return options.units.map((unit) => ({ value: unit.id, label: `${unit.product.name} — ${t("labels.unitDetail", { unit: unit.serialNumber })}` }));
  return options.locations.map((location) => ({ value: location, label: location }));
}

function renderLabels(labels, t) {
  const area = document.createElement("section"); area.className = "labels-preview"; area.setAttribute("aria-labelledby", "labels-preview-title");
  const heading = text("h2", t("labels.previewTitle")); heading.id = "labels-preview-title"; heading.tabIndex = -1;
  const list = document.createElement("div"); list.className = "labels-preview__list";
  for (const label of labels) {
    const article = document.createElement("article"); article.className = "nex-label"; article.setAttribute("aria-label", `${t(`labels.types.${label.type}`)}: ${label.productName}`);
    article.append(text("p", label.productName, "nex-label__name"), text("p", label.nexCode, "nex-label__code"));
    if (label.detail) article.append(text("p", label.type === "batch" ? t("labels.batchDetail", { batch: label.detail }) : label.type === "unit" ? t("labels.unitDetail", { unit: label.detail }) : t("labels.locationDetail", { location: label.detail }), "nex-label__detail"));
    if (label.location && label.type !== "location") article.append(text("p", t("labels.locationDetail", { location: label.location }), "nex-label__detail"));
    article.append(text("p", t("labels.codeContent", { code: label.code }), "nex-label__payload")); list.append(article);
  }
  const print = createButton({ text: t("labels.print"), onClick: () => { document.body.classList.add("is-label-print"); try { window.print(); } finally { document.body.classList.remove("is-label-print"); } } });
  area.append(heading, createAlert({ title: t("labels.readyTitle"), message: t("labels.readyMessage", { count: labels.length }), tone: "success" }), list, print); return area;
}

export function createLabelsView({ title, description, t, workspace, service }) {
  const section = document.createElement("section"); section.className = "route-stack labels-view";
  const heading = text("h1", title); heading.id = "route-title"; heading.tabIndex = -1; section.append(heading, text("p", description));
  if (!workspace) { section.append(createAlert({ title: t("labels.workspaceRequiredTitle"), message: t("labels.workspaceRequiredMessage"), tone: "warning" })); return { element: section, focusTarget: heading }; }
  const form = document.createElement("form"); form.className = "movement-form";
  const type = createField({ id: "labels-type", label: t("labels.typeLabel"), helpText: t("labels.typeHelp"), type: "select", value: "product", options: NEX_LABEL_TYPES.map((value) => ({ value, label: t(`labels.types.${value}`) })) });
  const target = createField({ id: "labels-target", label: t("labels.targetLabel"), helpText: t("labels.targetHelp"), type: "select", options: [{ value: "", label: t("labels.loading") }] });
  const feedback = document.createElement("div"); feedback.setAttribute("aria-live", "polite"); const result = document.createElement("div");
  let options;
  function refreshTarget() { const values = targetOptions(type.control.value, options, t); target.control.replaceChildren(...[{ value: "", label: t("labels.chooseTarget") }, ...values].map(({ value, label }) => { const item = document.createElement("option"); item.value = value; item.textContent = label; return item; })); }
  service.getOptions(workspace.id).then((value) => { options = value; refreshTarget(); }).catch(() => feedback.replaceChildren(createAlert({ message: t("labels.optionsError"), tone: "danger", urgent: true })));
  type.control.addEventListener("change", refreshTarget);
  form.addEventListener("submit", async (event) => { event.preventDefault(); feedback.replaceChildren(); result.replaceChildren(); try { const labels = await service.prepare(workspace.id, { type: type.control.value, target: target.control.value }); if (!labels.length) { feedback.append(createAlert({ message: t("labels.empty"), tone: "warning" })); return; } const preview = renderLabels(labels, t); result.append(preview); preview.querySelector("h2").focus(); } catch { feedback.append(createAlert({ message: t("labels.prepareError"), tone: "danger", urgent: true })); } });
  form.append(type.element, target.element, createButton({ text: t("labels.generate"), type: "submit" }), feedback); section.append(createAlert({ title: t("labels.codeTitle"), message: t("labels.codeMessage"), tone: "info" }), form, result); return { element: section, focusTarget: heading };
}
