import { createButton } from "../components/button.js";
import { createAlert } from "../components/feedback.js";
import { createField } from "../components/field.js";
import { createTable } from "../components/table.js";
import { EXPORT_DATASETS, EXPORT_FORMATS, serializeExportCsv, serializeExportJson } from "../services/export-service.js";

function text(tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function readableCell(value) {
  if (value === null || value === undefined || value === "") return "—";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function downloadPlan(plan, t) {
  const labels = Object.fromEntries(plan.columns.map((key) => [key, t(`exportCenter.columns.${key}`)]));
  const isCsv = plan.format === "csv";
  const content = isCsv ? serializeExportCsv(plan, labels) : serializeExportJson(plan);
  const blob = new Blob([content], { type: isCsv ? "text/csv;charset=utf-8" : "application/json;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${plan.filename}.${plan.format}`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function createPreview({ plan, t }) {
  const section = document.createElement("section");
  section.className = "route-stack export-preview";
  section.setAttribute("aria-labelledby", "export-preview-title");
  const heading = text("h4", t("exportCenter.previewTitle"));
  heading.id = "export-preview-title";
  heading.tabIndex = -1;
  const summary = createAlert({
    title: t(plan.count ? "exportCenter.readyTitle" : "exportCenter.emptyTitle"),
    message: t(plan.count ? "exportCenter.readyMessage" : "exportCenter.emptyMessage", { count: plan.count }),
    tone: plan.count ? "success" : "info",
  });
  const previewRows = plan.format === "print" ? plan.rows : plan.rows.slice(0, 100);
  const table = createTable({
    caption: t("exportCenter.previewCaption", { count: previewRows.length, total: plan.count }),
    columns: plan.columns.map((key) => ({ key, label: t(`exportCenter.columns.${key}`), render: (row) => readableCell(row[key]) })),
    rows: previewRows,
    emptyMessage: t("exportCenter.emptyMessage"),
    density: "compact",
    mobileLayout: "scroll",
  });
  const status = document.createElement("div");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  const actions = document.createElement("div");
  actions.className = "welcome-actions export-actions";
  const action = createButton({
    text: t(plan.format === "print" ? "exportCenter.printAction" : "exportCenter.downloadAction", { format: t(`exportCenter.formats.${plan.format}`) }),
    disabled: plan.count === 0,
    onClick: () => {
      if (plan.format === "print") {
        document.body.classList.add("is-export-print");
        try { window.print(); }
        finally { document.body.classList.remove("is-export-print"); }
        status.textContent = t("exportCenter.printOpened");
      } else {
        downloadPlan(plan, t);
        status.textContent = t("exportCenter.downloadReady", { count: plan.count });
      }
    },
  });
  actions.append(action);
  section.append(heading, summary, table, actions, status);
  return { element: section, focusTarget: heading };
}

function formField(definition, t) {
  return createField({ requiredText: t("forms.required"), ...definition });
}

export function createExportCenterView({ t, workspace, service }) {
  const section = document.createElement("section");
  section.className = "route-stack export-center";
  section.setAttribute("aria-labelledby", "export-center-title");
  const heading = text("h3", t("exportCenter.title"));
  heading.id = "export-center-title";
  section.append(heading, text("p", t("exportCenter.description")));
  if (!workspace) {
    section.append(createAlert({ message: t("exportCenter.workspaceRequired"), tone: "warning" }));
    return { element: section, focusTarget: heading };
  }

  const form = document.createElement("form");
  form.className = "route-stack export-controls";
  const formTitle = text("h4", t("exportCenter.formTitle"));
  const primaryGrid = document.createElement("div");
  primaryGrid.className = "export-form__grid";
  const dataset = formField({
    id: "export-dataset", label: t("exportCenter.dataset"), helpText: t("exportCenter.datasetHelp"), type: "select",
    value: "products", options: EXPORT_DATASETS.map((value) => ({ value, label: t(`exportCenter.datasets.${value}`) })),
  }, t);
  const format = formField({
    id: "export-format", label: t("exportCenter.format"), helpText: t("exportCenter.formatHelp"), type: "select",
    value: "csv", options: EXPORT_FORMATS.map((value) => ({ value, label: t(`exportCenter.formats.${value}`) })),
  }, t);
  primaryGrid.append(dataset.element, format.element);

  const filters = document.createElement("fieldset");
  filters.className = "export-filters";
  filters.append(text("legend", t("exportCenter.filtersTitle")), text("p", t("exportCenter.filtersHelp")));
  const filterGrid = document.createElement("div");
  filterGrid.className = "export-form__grid";
  const query = formField({ id: "export-query", label: t("exportCenter.query"), helpText: t("exportCenter.queryHelp"), maxLength: 120 }, t);
  const product = formField({
    id: "export-product", label: t("exportCenter.product"), helpText: t("exportCenter.productHelp"), type: "select", value: "",
    options: [{ value: "", label: t("exportCenter.allProducts") }],
  }, t);
  const dateFrom = formField({ id: "export-date-from", label: t("exportCenter.dateFrom"), helpText: t("exportCenter.dateFromHelp"), type: "date" }, t);
  const dateTo = formField({ id: "export-date-to", label: t("exportCenter.dateTo"), helpText: t("exportCenter.dateToHelp"), type: "date" }, t);
  const recordState = formField({
    id: "export-record-state", label: t("exportCenter.recordState"), helpText: t("exportCenter.recordStateHelp"), type: "select", value: "active",
    options: ["active", "archived", "all"].map((value) => ({ value, label: t(`exportCenter.recordStates.${value}`) })),
  }, t);
  const movementType = formField({
    id: "export-movement-type", label: t("exportCenter.movementType"), helpText: t("exportCenter.movementTypeHelp"), type: "select", value: "all",
    options: ["all", "IN", "OUT", "ADJUSTMENT"].map((value) => ({ value, label: t(`exportCenter.movementTypes.${value}`) })),
  }, t);
  filterGrid.append(query.element, product.element, dateFrom.element, dateTo.element, recordState.element, movementType.element);
  filters.append(filterGrid);
  const feedback = document.createElement("div");
  feedback.setAttribute("aria-live", "polite");
  const submit = createButton({ text: t("exportCenter.prepare"), type: "submit" });
  form.append(formTitle, primaryGrid, filters, submit, feedback);
  const result = document.createElement("div");
  result.className = "route-stack";
  section.append(form, result);

  service.getOptions(workspace.id).then(({ products }) => {
    for (const item of [...products].sort((first, second) => first.name.localeCompare(second.name))) {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.name} — ${item.nexCode}`;
      product.control.append(option);
    }
  }).catch(() => feedback.replaceChildren(createAlert({ message: t("exportCenter.optionsError"), tone: "danger", urgent: true })));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submit.disabled = true;
    feedback.replaceChildren();
    result.replaceChildren();
    try {
      const plan = await service.prepare(workspace.id, {
        dataset: dataset.control.value, format: format.control.value, query: query.control.value,
        productId: product.control.value, dateFrom: dateFrom.control.value, dateTo: dateTo.control.value,
        recordState: recordState.control.value, movementType: movementType.control.value,
      });
      const preview = createPreview({ plan, t });
      result.append(preview.element);
      preview.focusTarget.focus();
    } catch {
      feedback.replaceChildren(createAlert({ message: t("exportCenter.prepareError"), tone: "danger", urgent: true }));
    } finally {
      submit.disabled = false;
    }
  });
  return { element: section, focusTarget: heading };
}
