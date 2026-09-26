import { createButton } from "../components/button.js";
import { createAlert } from "../components/feedback.js";
import { createField } from "../components/field.js";
import { IMPORT_FIELDS, parseCsv, suggestImportMapping } from "../services/import-service.js";

function text(tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function errorText(error, t) {
  return t(`importCenter.errors.${error.code}`, { field: t(`importCenter.fields.${error.field}`) });
}

function createMappingForm({ parsed, mapping, t, onReview }) {
  const form = document.createElement("form");
  form.className = "route-stack import-mapping";
  const title = text("h4", t("importCenter.mappingTitle"));
  form.append(title, text("p", t("importCenter.mappingDescription")));
  const grid = document.createElement("div");
  grid.className = "import-mapping__grid";
  const fields = new Map();
  for (const definition of IMPORT_FIELDS) {
    const field = createField({
      id: `import-map-${definition.key}`,
      label: t(`importCenter.fields.${definition.key}`),
      helpText: definition.required ? t("importCenter.requiredMapping") : t("importCenter.optionalMapping"),
      type: "select",
      value: mapping[definition.key],
      options: [
        { value: "", label: t("importCenter.ignoreColumn") },
        ...parsed.headers.map((header) => ({ value: header, label: header })),
      ],
      required: definition.required,
      requiredText: t("forms.required"),
    });
    fields.set(definition.key, field);
    grid.append(field.element);
  }
  const feedback = document.createElement("div");
  feedback.setAttribute("aria-live", "polite");
  form.append(grid, feedback, createButton({ text: t("importCenter.review"), type: "submit" }));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.replaceChildren();
    try {
      await onReview(Object.fromEntries([...fields].map(([key, field]) => [key, field.control.value])));
    } catch {
      feedback.replaceChildren(createAlert({ message: t("importCenter.mappingError"), tone: "danger", urgent: true }));
    }
  });
  return form;
}

function correctionDefinition(key, row, t) {
  const base = { key, label: t(`importCenter.fields.${key}`), value: row[key] ?? "" };
  if (key === "trackingMode") {
    return { ...base, type: "select", options: ["bulk", "batch", "serialized"].map((value) => ({ value, label: t(`importCenter.tracking.${value}`) })) };
  }
  if (["currentQuantity", "minimumStock", "purchasePrice", "salePrice"].includes(key)) {
    return { ...base, inputMode: "decimal" };
  }
  return base;
}

function createCorrectionRows({ analysis, mappedRows, t }) {
  const container = document.createElement("div");
  container.className = "import-preview__rows";
  const controls = [];
  for (let index = 0; index < mappedRows.length; index += 1) {
    const source = mappedRows[index];
    const result = analysis.rows[index];
    const fieldset = document.createElement("fieldset");
    fieldset.className = "import-row";
    const legend = text("legend", t("importCenter.rowTitle", { row: source.sourceRow }));
    fieldset.append(legend);
    const grid = document.createElement("div");
    grid.className = "import-row__grid";
    const rowControls = new Map();
    for (const { key } of IMPORT_FIELDS) {
      const definition = correctionDefinition(key, source, t);
      const field = createField({ id: `import-row-${index}-${key}`, ...definition });
      rowControls.set(key, field.control);
      grid.append(field.element);
    }
    fieldset.append(grid);
    if (result.errors.length) {
      const errorTitle = text("h5", t("importCenter.rowErrors"));
      const list = document.createElement("ul");
      for (const error of result.errors) list.append(text("li", errorText(error, t)));
      fieldset.append(errorTitle, list);
    } else {
      fieldset.append(text("p", t("importCenter.rowValid"), "route-meta"));
    }
    controls.push({ sourceRow: source.sourceRow, controls: rowControls });
    container.append(fieldset);
  }
  return { element: container, readRows: () => controls.map(({ sourceRow, controls: rowControls }) => Object.fromEntries([
    ["sourceRow", sourceRow],
    ...[...rowControls].map(([key, control]) => [key, control.value]),
  ])) };
}

function createPreview({ analysis, mappedRows, t, onReanalyze, onConfirm }) {
  const section = document.createElement("section");
  section.className = "route-stack import-preview";
  section.setAttribute("aria-labelledby", "import-preview-title");
  const title = text("h4", t("importCenter.previewTitle"));
  title.id = "import-preview-title";
  title.tabIndex = -1;
  const summary = createAlert({
    title: t(analysis.ready ? "importCenter.readyTitle" : "importCenter.invalidTitle"),
    message: t("importCenter.previewSummary", { total: analysis.total, valid: analysis.validCount, errors: analysis.errorCount }),
    tone: analysis.ready ? "success" : "warning",
  });
  const untouched = text("p", t("importCenter.noChanges"), "import-no-changes");
  const corrections = createCorrectionRows({ analysis, mappedRows, t });
  const status = document.createElement("div");
  status.setAttribute("aria-live", "polite");
  const actions = document.createElement("div");
  actions.className = "welcome-actions";
  const reanalyze = createButton({ text: t("importCenter.revalidate"), variant: "secondary", onClick: async () => {
    reanalyze.disabled = true;
    try { await onReanalyze(corrections.readRows()); }
    catch { status.replaceChildren(createAlert({ message: t("importCenter.revalidateError"), tone: "danger", urgent: true })); reanalyze.disabled = false; }
  } });
  const confirm = createButton({ text: t("importCenter.confirm"), disabled: !analysis.ready, onClick: () => {
    reanalyze.disabled = true;
    confirm.disabled = true;
    const warning = createAlert({ title: t("importCenter.confirmTitle"), message: t("importCenter.confirmMessage", { count: analysis.total }), tone: "warning" });
    warning.tabIndex = -1;
    const confirmationActions = document.createElement("div");
    confirmationActions.className = "welcome-actions";
    const cancel = createButton({ text: t("importCenter.cancel"), variant: "secondary", onClick: () => {
      status.replaceChildren();
      reanalyze.disabled = false;
      confirm.disabled = false;
      confirm.focus();
    } });
    const commit = createButton({ text: t("importCenter.confirmAction"), onClick: async () => {
      cancel.disabled = true;
      commit.disabled = true;
      try { await onConfirm(analysis); }
      catch { status.replaceChildren(createAlert({ message: t("importCenter.commitError"), tone: "danger", urgent: true })); reanalyze.disabled = false; confirm.disabled = false; confirm.focus(); }
    } });
    confirmationActions.append(cancel, commit);
    warning.append(confirmationActions);
    status.replaceChildren(warning);
    warning.focus();
  } });
  actions.append(reanalyze, confirm);
  section.append(title, summary, untouched, corrections.element, actions, status);
  return { element: section, focusTarget: title };
}

export function createImportCenterView({ t, workspace, service }) {
  const section = document.createElement("section");
  section.className = "route-stack import-center";
  section.setAttribute("aria-labelledby", "import-center-title");
  const heading = text("h3", t("importCenter.title"));
  heading.id = "import-center-title";
  section.append(heading, text("p", t("importCenter.description")));
  if (!workspace) {
    section.append(createAlert({ message: t("importCenter.workspaceRequired"), tone: "warning" }));
    return { element: section, focusTarget: heading };
  }

  const dropZone = document.createElement("div");
  dropZone.className = "import-drop-zone";
  const fileLabel = text("label", t("importCenter.fileLabel"), "ns-field__label");
  fileLabel.htmlFor = "import-file";
  const file = document.createElement("input");
  file.id = "import-file";
  file.type = "file";
  file.accept = ".csv,text/csv";
  const help = text("p", t("importCenter.fileHelp"), "ns-field__help");
  const dropText = text("p", t("importCenter.dropText"));
  dropZone.append(fileLabel, file, help, dropText);
  const flow = document.createElement("div");
  flow.className = "route-stack";
  section.append(dropZone, flow);

  let mappedRows = [];
  let analysis;

  async function renderAnalysis(nextRows) {
    mappedRows = nextRows;
    analysis = await service.reanalyze(workspace.id, mappedRows);
    const preview = createPreview({
      analysis, mappedRows, t,
      onReanalyze: renderAnalysis,
      onConfirm: async (plan) => {
        const result = await service.commit(workspace.id, plan);
        flow.replaceChildren(createAlert({ title: t("importCenter.successTitle"), message: t("importCenter.successMessage", { count: result.products.length }), tone: "success" }));
        flow.tabIndex = -1;
        flow.focus();
      },
    });
    flow.replaceChildren(preview.element);
    preview.focusTarget.focus();
  }

  async function loadFile(selectedFile) {
    flow.replaceChildren();
    if (!selectedFile || (!selectedFile.name.toLowerCase().endsWith(".csv") && selectedFile.type !== "text/csv")) {
      flow.append(createAlert({ message: t("importCenter.fileTypeError"), tone: "danger", urgent: true }));
      return;
    }
    try {
      const parsed = parseCsv(await selectedFile.text());
      const mapping = suggestImportMapping(parsed.headers);
      flow.append(createAlert({ title: t("importCenter.fileReadyTitle"), message: t("importCenter.fileReadyMessage", { rows: parsed.rows.length }), tone: "info" }));
      flow.append(createMappingForm({ parsed, mapping, t, onReview: async (selectedMapping) => {
        const prepared = await service.prepare(workspace.id, parsed, selectedMapping);
        mappedRows = prepared.rows.map(({ input }) => ({ ...input }));
        analysis = prepared;
        const preview = createPreview({
          analysis, mappedRows, t,
          onReanalyze: renderAnalysis,
          onConfirm: async (plan) => {
            const result = await service.commit(workspace.id, plan);
            flow.replaceChildren(createAlert({ title: t("importCenter.successTitle"), message: t("importCenter.successMessage", { count: result.products.length }), tone: "success" }));
            flow.tabIndex = -1;
            flow.focus();
          },
        });
        flow.replaceChildren(preview.element);
        preview.focusTarget.focus();
      } }));
    } catch {
      flow.replaceChildren(createAlert({ message: t("importCenter.parseError"), tone: "danger", urgent: true }));
    }
  }

  file.addEventListener("change", () => loadFile(file.files?.[0]));
  dropZone.addEventListener("dragover", (event) => { event.preventDefault(); dropZone.classList.add("is-dragging"); });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("is-dragging"));
  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-dragging");
    loadFile(event.dataTransfer?.files?.[0]);
  });
  return { element: section, focusTarget: heading };
}
