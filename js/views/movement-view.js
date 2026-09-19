import { createButton } from "../components/button.js";
import { createEmptyState } from "../components/empty-state.js";
import { createAlert } from "../components/feedback.js";
import { createField } from "../components/field.js";
import { createStatusBadge } from "../components/status-badge.js";
import { createTable } from "../components/table.js";
import { MOVEMENT_TYPES } from "../services/movement-service.js";

function text(tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function movementTable({ movements, products, t, locale }) {
  const names = new Map(products.map((product) => [product.id, `${product.name} · ${product.nexCode}`]));
  return createTable({
    caption: t("movement.historyCaption"),
    emptyMessage: t("movement.emptyHistory"),
    rows: movements,
    columns: [
      { key: "createdAt", label: t("movement.date"), render: (item) => new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(item.createdAt)) },
      { key: "productId", label: t("movement.product"), render: (item) => names.get(item.productId) ?? item.productId },
      { key: "type", label: t("movement.type"), render: (item) => t(`movement.types.${item.type}`) },
      { key: "quantity", label: t("movement.quantity") },
      { key: "beforeQuantity", label: t("movement.before") },
      { key: "afterQuantity", label: t("movement.after") },
      { key: "reason", label: t("movement.reason") },
    ],
  });
}

function impactPreview({ preview, t }) {
  const region = document.createElement("section");
  region.className = "movement-preview";
  region.setAttribute("aria-labelledby", "movement-preview-title");
  const heading = text("h2", t("movement.previewTitle"));
  heading.id = "movement-preview-title";
  const details = document.createElement("dl");
  details.className = "movement-preview__details";
  const rows = [
    [t("movement.currentQuantity"), preview.beforeQuantity],
    [t("movement.resultQuantity"), preview.afterQuantity],
  ];
  for (const [label, value] of rows) {
    const row = document.createElement("div");
    row.append(text("dt", label), text("dd", String(value)));
    details.append(row);
  }
  const statuses = document.createElement("div");
  statuses.className = "movement-preview__statuses";
  statuses.append(
    text("span", t("movement.currentStatus")),
    createStatusBadge(preview.currentStatus, { label: t(`statuses.${preview.currentStatus}`) }),
    text("span", t("movement.resultStatus")),
    createStatusBadge(preview.resultingStatus, { label: t(`statuses.${preview.resultingStatus}`) }),
  );
  region.append(heading, details, statuses);
  return region;
}

export function createMovementView({ title, description, t, locale, workspace, productService, movementService, draftService, initialProductId, initialType, onSaved, onCriticalOperationChange = () => {} }) {
  const section = document.createElement("section");
  section.className = "route-stack";
  const heading = text("h1", title);
  heading.id = "route-title";
  heading.tabIndex = -1;
  section.append(heading, text("p", description));

  if (!workspace) {
    section.append(
      createAlert({ title: t("movement.workspaceRequiredTitle"), message: t("movement.workspaceRequiredMessage"), tone: "warning" }),
      createButton({ text: t("productCore.configure"), href: "#/onboarding" }),
    );
    return { element: section, focusTarget: heading };
  }

  const content = text("p", t("movement.loading"));
  content.setAttribute("role", "status");
  section.append(content);

  (async () => {
    const [products, movements] = await Promise.all([
      productService.search(workspace.id, { archived: "active" }),
      movementService.listByWorkspace(workspace.id),
    ]);
    if (products.length === 0) {
      content.replaceChildren(createEmptyState({
        title: t("movement.noProductsTitle"),
        description: t("movement.noProductsMessage"),
        action: createButton({ text: t("productCore.newProduct"), href: "#/products/new" }),
      }));
      return;
    }

    const form = document.createElement("form");
    form.className = "movement-form";
    const draftId = "movement:new";
    const draft = draftService?.load(workspace.id, draftId);
    const product = createField({ id: "movement-product", label: t("movement.product"), type: "select", value: initialProductId ?? draft?.productId, options: products.map((item) => ({ value: item.id, label: `${item.name} · ${item.nexCode}` })) });
    const type = createField({ id: "movement-type", label: t("movement.type"), type: "select", value: initialType ?? draft?.type, options: Object.values(MOVEMENT_TYPES).map((value) => ({ value, label: t(`movement.types.${value}`) })) });
    const quantity = createField({ id: "movement-quantity", label: t("movement.quantity"), type: "number", value: draft?.quantity, min: 0, step: "any", required: true, requiredText: t("forms.required"), helpText: t("movement.quantityHelp") });
    const reason = createField({ id: "movement-reason", label: t("movement.reason"), value: draft?.reason, required: true, requiredText: t("forms.required"), maxLength: 160 });
    const notes = createField({ id: "movement-notes", label: t("movement.notes"), type: "textarea", value: draft?.notes, maxLength: 1000 });
    const feedback = document.createElement("div");
    feedback.className = "movement-feedback";
    feedback.setAttribute("aria-live", "polite");
    const actions = document.createElement("div");
    actions.className = "movement-form__actions";
    const calculate = createButton({ text: t("movement.calculate"), type: "submit" });
    actions.append(calculate);
    const draftStatus = text("p", draft ? t("pwa.draftRestored") : "", "route-meta");
    draftStatus.setAttribute("role", "status");
    form.append(draftStatus, product.element, type.element, quantity.element, reason.element, notes.element, feedback, actions);

    function invalidatePreview() { feedback.replaceChildren(); onCriticalOperationChange(false); }
    for (const control of [product.control, type.control, quantity.control, reason.control, notes.control]) control.addEventListener("input", () => {
      invalidatePreview();
      draftService?.save(workspace.id, draftId, { productId: product.control.value, type: type.control.value, quantity: quantity.control.value, reason: reason.control.value, notes: notes.control.value });
      draftStatus.textContent = t("pwa.draftSaved");
    });
    type.control.addEventListener("change", () => {
      quantity.element.querySelector("label").firstChild.textContent = type.control.value === MOVEMENT_TYPES.ADJUSTMENT ? t("movement.adjustedQuantity") : t("movement.quantity");
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      feedback.replaceChildren();
      calculate.disabled = true;
      const input = { productId: product.control.value, type: type.control.value, quantity: quantity.control.value, reason: reason.control.value, notes: notes.control.value };
      try {
        const preview = await movementService.preview(workspace.id, input);
        onCriticalOperationChange(true);
        const previewElement = impactPreview({ preview, t });
        const confirmation = createButton({ text: t(`movement.confirm.${input.type}`, { quantity: input.type === MOVEMENT_TYPES.ADJUSTMENT ? preview.afterQuantity : preview.quantity }), onClick: async () => {
          confirmation.disabled = true;
          try {
            const result = await movementService.commit(workspace.id, input, preview);
            draftService?.remove(workspace.id, draftId);
            onSaved(result);
          } catch {
            onCriticalOperationChange(false);
            feedback.replaceChildren(createAlert({ message: t("movement.conflictError"), tone: "danger", urgent: true }));
            calculate.disabled = false;
          }
        } });
        const cancel = createButton({ text: t("movement.cancel"), variant: "secondary", onClick: () => { invalidatePreview(); calculate.disabled = false; calculate.focus(); } });
        const confirmationActions = document.createElement("div");
        confirmationActions.className = "movement-form__actions";
        confirmationActions.append(cancel, confirmation);
        feedback.replaceChildren(previewElement, confirmationActions);
        confirmation.focus();
      } catch {
        onCriticalOperationChange(false);
        feedback.replaceChildren(createAlert({ message: t("movement.invalidError"), tone: "danger", urgent: true }));
        calculate.disabled = false;
      }
    });

    const history = document.createElement("section");
    history.className = "movement-history";
    history.append(text("h2", t("movement.historyTitle")), movementTable({ movements, products, t, locale }));
    content.replaceChildren(form, history);
  })().catch(() => content.replaceChildren(createAlert({ message: t("movement.loadError"), tone: "danger" })));

  return { element: section, focusTarget: heading };
}
