import { createButton } from "../components/button.js";
import { createCard } from "../components/card.js";
import { createContentStatus } from "../components/content-state.js";
import { createAlert } from "../components/feedback.js";
import { createField } from "../components/field.js";
import { findSmartSubstitutes } from "../services/module-service.js";

function text(tag, value, className) { const element = document.createElement(tag); if (className) element.className = className; element.textContent = value; return element; }

function productOptions(products) { return products.map((product) => ({ value: product.id, label: `${product.name} · ${product.nexCode}` })); }

function countList(snapshot, t) {
  const list = document.createElement("dl"); list.className = "insight-data";
  for (const [key, value] of [["serial", snapshot.units.length], ["expiry", snapshot.batches.length], ["variants", snapshot.variants.length], ["kits", snapshot.kits.length], ["compatibility", snapshot.relations.length]]) {
    const row = document.createElement("div"); row.append(text("dt", t(`moduleCore.counts.${key}`)), text("dd", String(value))); list.append(row);
  }
  return list;
}

function moduleForm(title, fields, submitText, onSubmit, t) {
  const form = document.createElement("form"); form.className = "product-form";
  form.append(text("h3", title));
  for (const field of fields) form.append(field.element);
  const feedback = document.createElement("div"); feedback.setAttribute("aria-live", "polite");
  const submit = createButton({ text: submitText, type: "submit" }); form.append(feedback, submit);
  form.addEventListener("submit", async (event) => { event.preventDefault(); submit.disabled = true; feedback.replaceChildren(); try { await onSubmit(); feedback.append(createAlert({ message: t("moduleCore.saved"), tone: "success" })); } catch { feedback.append(createAlert({ message: t("moduleCore.invalid"), tone: "danger" })); } finally { submit.disabled = false; } });
  return form;
}

export function createModuleView({ title, description, t, workspace, service }) {
  const section = document.createElement("section"); section.className = "route-stack";
  const heading = text("h1", title); heading.id = "route-title"; heading.tabIndex = -1;
  section.append(heading, text("p", description));
  if (!workspace) { section.append(createAlert({ title: t("moduleCore.workspaceRequiredTitle"), message: t("moduleCore.workspaceRequiredMessage"), tone: "warning" })); return { element: section, focusTarget: heading }; }
  const content = createContentStatus({ message: t("moduleCore.loading") }); section.append(content);
  service.getWorkspaceSnapshot(workspace.id).then((snapshot) => {
    const enabled = new Set(snapshot.modules);
    const intro = createAlert({ title: t("moduleCore.activeTitle"), message: snapshot.modules.length ? t("moduleCore.activeMessage", { modules: snapshot.modules.map((key) => t(`modules.${key}`)).join(", ") }) : t("moduleCore.noneActive"), tone: "info" });
    const area = document.createElement("div"); area.className = "insight-list"; area.append(createCard({ title: t("moduleCore.summaryTitle"), content: countList(snapshot, t) }));
    const products = snapshot.products; const options = productOptions(products);
    if (enabled.has("serial") && products.length) {
      const product = createField({ id: "module-serial-product", label: t("moduleCore.product"), type: "select", options });
      const serial = createField({ id: "module-serial-number", label: t("moduleCore.serialNumber"), required: true, requiredText: t("forms.required") });
      const condition = createField({ id: "module-serial-condition", label: t("moduleCore.condition"), type: "select", options: ["new", "used", "refurbished", "damaged"].map((value) => ({ value, label: t(`moduleCore.conditions.${value}`) })) });
      area.append(moduleForm(t("modules.serial"), [product, serial, condition], t("moduleCore.addSerial"), () => service.createSerial(workspace.id, product.control.value, { serialNumber: serial.control.value, condition: condition.control.value }), t));
    }
    if (enabled.has("expiry") && products.length) {
      const product = createField({ id: "module-batch-product", label: t("moduleCore.product"), type: "select", options });
      const batch = createField({ id: "module-batch-number", label: t("moduleCore.batchNumber"), required: true, requiredText: t("forms.required") });
      const quantity = createField({ id: "module-batch-quantity", label: t("moduleCore.quantity"), type: "number", min: 0, required: true, requiredText: t("forms.required") });
      const expiry = createField({ id: "module-batch-expiry", label: t("moduleCore.expiryDate"), type: "date", required: true, requiredText: t("forms.required") });
      area.append(moduleForm(t("modules.expiry"), [product, batch, quantity, expiry], t("moduleCore.addBatch"), () => service.createBatch(workspace.id, product.control.value, { batchNumber: batch.control.value, quantity: quantity.control.value, expiryDate: expiry.control.value }), t));
    }
    if (enabled.has("kits") && products.length) {
      const name = createField({ id: "module-kit-name", label: t("moduleCore.kitName"), required: true, requiredText: t("forms.required") });
      const product = createField({ id: "module-kit-product", label: t("moduleCore.component"), type: "select", options });
      const quantity = createField({ id: "module-kit-quantity", label: t("moduleCore.requiredQuantity"), type: "number", min: 1, required: true, requiredText: t("forms.required") });
      area.append(moduleForm(t("modules.kits"), [name, product, quantity], t("moduleCore.addKit"), () => service.createKit(workspace.id, { name: name.control.value, items: [{ productId: product.control.value, quantityRequired: quantity.control.value }] }), t));
    }
    if (enabled.has("compatibility") && products.length > 1) {
      const source = createField({ id: "module-relation-source", label: t("moduleCore.sourceProduct"), type: "select", options });
      const target = createField({ id: "module-relation-target", label: t("moduleCore.targetProduct"), type: "select", options });
      const relationType = createField({ id: "module-relation-type", label: t("moduleCore.relationType"), type: "select", options: ["compatible_with", "requires", "replaces", "upgrade_of", "accessory_for"].map((value) => ({ value, label: t(`moduleCore.relations.${value}`) })) });
      area.append(moduleForm(t("modules.compatibility"), [source, target, relationType], t("moduleCore.addRelation"), () => service.createRelation(workspace.id, { sourceProductId: source.control.value, targetProductId: target.control.value, relationType: relationType.control.value }), t));
      const substitutes = findSmartSubstitutes(source.control.value, snapshot.relations, products);
      area.append(createAlert({ title: t("moduleCore.substituteTitle"), message: substitutes.length ? t("moduleCore.substituteFound", { product: substitutes[0].product.name }) : t("moduleCore.substituteUnknown"), tone: "info" }));
    }
    content.replaceChildren(intro, area);
  }).catch(() => content.replaceChildren(createAlert({ message: t("moduleCore.loadError"), tone: "danger" })));
  return { element: section, focusTarget: heading };
}
