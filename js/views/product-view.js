import { createButton } from "../components/button.js";
import { createEmptyState } from "../components/empty-state.js";
import { createAlert } from "../components/feedback.js";
import { createChoice, createField } from "../components/field.js";
import { createStatusBadge } from "../components/status-badge.js";
import { createTable } from "../components/table.js";
import { createProductInsightSections } from "./insight-view.js";

function text(tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function loading(t) {
  const message = text("p", t("productCore.loading"));
  message.setAttribute("role", "status");
  return message;
}

function money(value, locale, currency) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

function createHeader(title, description) {
  const wrapper = document.createElement("header");
  const heading = text("h1", title);
  heading.id = "route-title";
  heading.tabIndex = -1;
  wrapper.append(heading, text("p", description));
  return { wrapper, heading };
}

function createWorkspaceRequired(t) {
  return createAlert({ title: t("productCore.workspaceRequiredTitle"), message: t("productCore.workspaceRequiredMessage"), tone: "warning" });
}

function createListView({ title, description, t, locale, workspace, service, initialFilters = {} }) {
  const section = document.createElement("section");
  section.className = "route-stack";
  const header = createHeader(title, description);
  section.append(header.wrapper);
  if (!workspace) {
    section.append(createWorkspaceRequired(t), createButton({ text: t("productCore.configure"), href: "#/onboarding" }));
    return { element: section, focusTarget: header.heading };
  }

  const content = document.createElement("div");
  content.append(loading(t));
  section.append(content);

  (async () => {
    const options = await service.getFormOptions(workspace.id);
    const toolbar = document.createElement("form");
    toolbar.className = "product-toolbar";
    toolbar.setAttribute("role", "search");
    const search = createField({ id: "product-search", label: t("productCore.search"), type: "search", helpText: t("productCore.searchHelp") });
    const category = createField({ id: "product-category-filter", label: t("productCore.category"), type: "select", options: [{ value: "", label: t("productCore.allCategories") }, ...options.categories.map((item) => ({ value: item.id, label: item.name }))] });
    const supplier = createField({ id: "product-supplier-filter", label: t("productCore.supplier"), type: "select", options: [{ value: "", label: t("productCore.allSuppliers") }, ...options.suppliers.map((item) => ({ value: item.id, label: item.name }))] });
    const status = createField({ id: "product-status-filter", label: t("productCore.status"), type: "select", value: initialFilters.status, options: [{ value: "", label: t("productCore.allStatuses") }, ...["out", "critical", "attention", "healthy"].map((value) => ({ value, label: t(`statuses.${value}`) }))] });
    const filterableModules = options.modules.filter((value) => ["serial", "lifecycle", "expiry", "variants"].includes(value));
    const module = createField({ id: "product-module-filter", label: t("productCore.module"), type: "select", options: [{ value: "", label: t("productCore.allModules") }, ...filterableModules.map((value) => ({ value, label: t(`modules.${value}`) }))] });
    const archived = createField({ id: "product-archived-filter", label: t("productCore.archivedFilter"), type: "select", options: [
      { value: "active", label: t("productCore.activeOnly") }, { value: "archived", label: t("productCore.archivedOnly") }, { value: "all", label: t("productCore.allProducts") },
    ] });
    const results = document.createElement("div");
    results.className = "product-results";

    async function renderResults() {
      const products = await service.search(workspace.id, { query: search.control.value, categoryId: category.control.value, supplierId: supplier.control.value, status: status.control.value, module: module.control.value, archived: archived.control.value });
      if (products.length === 0) {
        results.replaceChildren(createEmptyState({ title: t("productCore.emptyTitle"), description: t("productCore.emptyDescription"), action: createButton({ text: t("productCore.newProduct"), href: "#/products/new" }) }));
        return;
      }
      const columns = [
        { key: "nexCode", label: t("productCore.nexCode") },
        { key: "name", label: t("productCore.name") },
        { key: "categoryName", label: t("productCore.category") },
        { key: "currentQuantity", label: t("productCore.quantity") },
        { key: "minimumStock", label: t("productCore.minimum") },
        { key: "status", label: t("productCore.status"), render: (product) => createStatusBadge(product.status, { label: t(`statuses.${product.status}`) }) },
        { key: "location", label: t("productCore.location") },
        { key: "actions", label: t("productCore.actions"), render: (product) => createButton({ text: t("productCore.view"), href: `#/products/${encodeURIComponent(product.id)}`, variant: "quiet" }) },
      ];
      results.replaceChildren(createTable({ caption: t("productCore.tableCaption"), columns, rows: products, emptyMessage: t("productCore.emptyDescription") }));
    }
    toolbar.addEventListener("submit", (event) => { event.preventDefault(); renderResults(); });
    for (const control of [category.control, supplier.control, status.control, module.control, archived.control]) control.addEventListener("change", renderResults);
    const buttons = document.createElement("div");
    buttons.className = "product-toolbar__actions";
    buttons.append(
      createButton({ text: t("productCore.applyFilters"), type: "submit" }),
      createButton({ text: t("productCore.clearFilters"), variant: "secondary", onClick: () => { toolbar.reset(); renderResults(); } }),
      createButton({ text: t("productCore.newProduct"), href: "#/products/new" }),
    );
    toolbar.append(search.element, category.element, supplier.element, status.element, module.element, archived.element, buttons);
    content.replaceChildren(toolbar, results);
    await renderResults();
  })().catch(() => content.replaceChildren(createAlert({ message: t("productCore.loadError"), tone: "danger" })));
  return { element: section, focusTarget: header.heading };
}

function createProductFormView({ title, description, t, workspace, service, draftService, productId, onSaved }) {
  const section = document.createElement("section");
  section.className = "route-stack";
  const header = createHeader(title, description);
  section.append(header.wrapper);
  if (!workspace) {
    section.append(createWorkspaceRequired(t));
    return { element: section, focusTarget: header.heading };
  }
  const content = document.createElement("div");
  content.append(loading(t));
  section.append(content);
  (async () => {
    const [options, product] = await Promise.all([service.getFormOptions(workspace.id), productId ? service.getById(productId, workspace.id) : null]);
    if (productId && !product) throw new Error("not-found");
    const form = document.createElement("form");
    form.className = "product-form";
    const draftId = `product:${productId ?? "new"}`;
    const draft = draftService?.load(workspace.id, draftId);
    const fields = {
      name: createField({ id: "product-name", label: t("productCore.name"), required: true, requiredText: t("forms.required"), value: product?.name, maxLength: 120 }),
      categoryId: createField({ id: "product-category", label: t("productCore.category"), type: "select", value: product?.categoryId, options: [{ value: "", label: t("productCore.noCategory") }, ...options.categories.map((item) => ({ value: item.id, label: item.name }))] }),
      supplierId: createField({ id: "product-supplier", label: t("productCore.supplier"), type: "select", value: product?.supplierId, options: [{ value: "", label: t("productCore.noSupplier") }, ...options.suppliers.map((item) => ({ value: item.id, label: item.name }))] }),
      trackingMode: createField({ id: "product-tracking", label: t("productCore.tracking"), type: "select", value: product?.trackingMode ?? "bulk", options: ["bulk", "batch", "serialized"].map((value) => ({ value, label: t(`tracking.${value}`) })) }),
      currentQuantity: createField({ id: "product-quantity", label: t("productCore.initialQuantity"), type: "number", value: product?.currentQuantity ?? 0, helpText: product ? t("productCore.quantityEditHelp") : "", min: 0, step: "any" }),
      minimumStock: createField({ id: "product-minimum", label: t("productCore.minimum"), type: "number", value: product?.minimumStock ?? 0, min: 0, step: "any" }),
      purchasePrice: createField({ id: "product-purchase-price", label: t("productCore.purchasePrice"), type: "number", value: product?.purchasePrice ?? 0, min: 0, step: "any" }),
      salePrice: createField({ id: "product-sale-price", label: t("productCore.salePrice"), type: "number", value: product?.salePrice ?? 0, min: 0, step: "any" }),
      location: createField({ id: "product-location", label: t("productCore.location"), value: product?.location }),
      description: createField({ id: "product-description", label: t("productCore.description"), type: "textarea", value: product?.description }),
    };
    if (draft) {
      for (const [key, field] of Object.entries(fields)) {
        if (draft[key] !== undefined && (!product || key !== "currentQuantity")) field.control.value = draft[key];
      }
    }
    if (product) fields.currentQuantity.control.disabled = true;
    for (const field of Object.values(fields)) form.append(field.element);
    const customControls = [];
    for (const definition of options.customFields) {
      if (["boolean"].includes(definition.type)) {
        const choice = createChoice({ id: `custom-${definition.key}`, label: definition.label, checked: Boolean(product?.customData?.[definition.key]) });
        form.append(choice.element); customControls.push({ definition, control: choice.control });
      } else {
        const isSelection = ["select", "multiselect"].includes(definition.type);
        const type = isSelection ? "select" : (["number", "currency", "date", "url"].includes(definition.type) ? (definition.type === "currency" ? "number" : definition.type) : "text");
        const field = createField({ id: `custom-${definition.key}`, label: definition.label, type, required: definition.required, requiredText: t("forms.required"), value: product?.customData?.[definition.key] ?? "", step: definition.type === "currency" ? "0.01" : undefined, min: definition.type === "currency" ? 0 : undefined, options: isSelection ? definition.options.map((value) => ({ value, label: value })) : [] });
        if (definition.type === "multiselect") {
          field.control.multiple = true;
          const selected = new Set(Array.isArray(product?.customData?.[definition.key]) ? product.customData[definition.key] : []);
          for (const option of field.control.options) option.selected = selected.has(option.value);
        }
        form.append(field.element); customControls.push({ definition, control: field.control });
      }
    }
    const errorArea = document.createElement("div");
    const actions = document.createElement("div"); actions.className = "product-form__actions";
    const save = createButton({ text: t("productCore.save"), type: "submit" });
    actions.append(createButton({ text: t("productCore.cancel"), href: product ? `#/products/${product.id}` : "#/products", variant: "secondary" }), save);
    form.append(errorArea, actions);
    const draftStatus = text("p", draft ? t("pwa.draftRestored") : "", "route-meta");
    draftStatus.setAttribute("role", "status");
    form.prepend(draftStatus);
    form.addEventListener("input", () => {
      const values = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.control.value]));
      draftService?.save(workspace.id, draftId, values);
      draftStatus.textContent = t("pwa.draftSaved");
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); save.disabled = true; errorArea.replaceChildren();
      try {
        const customData = Object.fromEntries(customControls.map(({ definition, control }) => [definition.key, control.type === "checkbox" ? control.checked : (definition.type === "multiselect" ? [...control.selectedOptions].map(({ value }) => value) : control.value)]));
        const input = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.control.value]));
        const saved = product ? await service.update(workspace.id, product.id, { ...input, customData }) : await service.create(workspace.id, { ...input, customData });
        draftService?.remove(workspace.id, draftId);
        onSaved(saved);
      } catch {
        errorArea.append(createAlert({ message: t("productCore.saveError"), tone: "danger", urgent: true })); save.disabled = false;
      }
    });
    content.replaceChildren(form);
  })().catch(() => content.replaceChildren(createAlert({ message: t("productCore.loadError"), tone: "danger" })));
  return { element: section, focusTarget: header.heading };
}

function createDetailView({ title, description, t, locale, workspace, service, movementService, insightService, productId, onMoveProduct, onArchived }) {
  const section = document.createElement("section"); section.className = "route-stack";
  const header = createHeader(title, description); section.append(header.wrapper);
  const content = document.createElement("div"); content.append(loading(t)); section.append(content);
  if (!workspace) content.replaceChildren(createWorkspaceRequired(t));
  else (async () => {
    const [product, options, movements, insight] = await Promise.all([service.getById(productId, workspace.id), service.getFormOptions(workspace.id), movementService.listByProduct(workspace.id, productId), insightService.getByProduct(workspace.id, productId)]);
    if (!product) { content.replaceChildren(createAlert({ message: t("productCore.notFound"), tone: "warning" })); return; }
    const category = options.categories.find(({ id }) => id === product.categoryId)?.name ?? t("productCore.noCategory");
    const status = product.archivedAt ? "archived" : product.status ?? (await service.search(workspace.id, { archived: "all" })).find(({ id }) => id === product.id)?.status;
    const details = document.createElement("dl"); details.className = "product-detail";
    for (const [label, value] of [
      [t("productCore.nexCode"), product.nexCode], [t("productCore.name"), product.name], [t("productCore.category"), category],
      [t("productCore.quantity"), product.currentQuantity], [t("productCore.minimum"), product.minimumStock], [t("productCore.purchasePrice"), money(product.purchasePrice, locale, workspace.currency)],
      [t("productCore.salePrice"), money(product.salePrice, locale, workspace.currency)], [t("productCore.location"), product.location || "—"],
    ]) { const row = document.createElement("div"); row.append(text("dt", label), text("dd", String(value))); details.append(row); }
    for (const definition of options.customFields) {
      const value = product.customData?.[definition.key];
      const rendered = Array.isArray(value) ? value.join(", ") : (definition.type === "boolean" ? t(value ? "customFields.yes" : "customFields.no") : String(value || "—"));
      const row = document.createElement("div");
      row.append(text("dt", definition.label), text("dd", rendered));
      details.append(row);
    }
    const actions = document.createElement("div"); actions.className = "product-detail__actions";
    actions.append(createButton({ text: t("productCore.backToProducts"), href: "#/products", variant: "secondary" }), createButton({ text: t("productCore.edit"), href: `#/products/${product.id}/edit` }));
    if (!product.archivedAt) actions.append(createButton({ text: t("movement.moveProduct"), onClick: () => onMoveProduct(product.id) }));
    if (!product.archivedAt) actions.append(createButton({ text: t("productCore.archive"), variant: "danger", onClick: (event) => {
      const confirm = createAlert({ title: t("productCore.archiveConfirmTitle"), message: t("productCore.archiveConfirmMessage"), tone: "warning" });
      const controls = document.createElement("div"); controls.className = "product-detail__actions";
      controls.append(createButton({ text: t("productCore.cancel"), variant: "secondary", onClick: () => confirm.remove() }), createButton({ text: t("productCore.confirmArchive"), variant: "danger", onClick: async () => { await service.archive(workspace.id, product.id); onArchived(); } }));
      confirm.append(controls); actions.after(confirm); confirm.tabIndex = -1; confirm.focus(); event.currentTarget.disabled = true;
    } }));
    const history = document.createElement("section"); history.className = "movement-history";
    history.append(text("h2", t("movement.productHistoryTitle")), createTable({ caption: t("movement.productHistoryCaption"), emptyMessage: t("movement.emptyHistory"), rows: movements.slice(0, 10), columns: [
      { key: "createdAt", label: t("movement.date"), render: (item) => new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(item.createdAt)) },
      { key: "type", label: t("movement.type"), render: (item) => t(`movement.types.${item.type}`) },
      { key: "quantity", label: t("movement.quantity") }, { key: "beforeQuantity", label: t("movement.before") }, { key: "afterQuantity", label: t("movement.after") }, { key: "reason", label: t("movement.reason") },
    ] }));
    const insightSections = insight ? createProductInsightSections({ insight, t, locale }) : createAlert({ message: t("insightCore.loadError"), tone: "warning" });
    content.replaceChildren(createStatusBadge(status, { label: t(`statuses.${status}`) }), details, actions, insightSections, history);
  })().catch(() => content.replaceChildren(createAlert({ message: t("productCore.loadError"), tone: "danger" })));
  return { element: section, focusTarget: header.heading };
}

export function createProductRouteView(context) {
  if (context.route === "/products") return createListView(context);
  if (context.route === "/products/new") return createProductFormView(context);
  if (context.route.endsWith("/edit")) return createProductFormView({ ...context, productId: context.params.id });
  return createDetailView({ ...context, productId: context.params.id });
}
