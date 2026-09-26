import { createButton } from "../components/button.js";
import { createContentStatus } from "../components/content-state.js";
import { createAlert } from "../components/feedback.js";
import { createChoice, createField } from "../components/field.js";
import { CUSTOM_FIELD_TYPES } from "../services/custom-field-service.js";
import { createCopyContext } from "../services/copy-service.js";

function text(tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function fieldSummary(definition, t) {
  const item = document.createElement("li");
  const copy = document.createElement("div");
  copy.append(text("h3", definition.label), text("p", t("customFields.summary", {
    type: t(`fieldTypes.${definition.type}`),
    required: t(definition.required ? "customFields.yes" : "customFields.no"),
    searchable: t(definition.searchable ? "customFields.yes" : "customFields.no"),
  })));
  if (definition.options?.length) copy.append(text("p", t("customFields.optionsSummary", { options: definition.options.join(", ") }), "route-meta"));
  item.append(copy);
  return item;
}

export function createCustomFieldView({ title, description, t, workspace, service, embedded = false }) {
  const section = document.createElement("section");
  section.className = "route-stack";
  let heading;
  if (!embedded) {
    heading = text("h1", title);
    heading.id = "route-title";
    heading.tabIndex = -1;
    section.append(heading, text("p", description));
  }
  if (!workspace) {
    section.append(createAlert({ title: t("customFields.workspaceRequiredTitle"), message: t("customFields.workspaceRequiredMessage"), tone: "warning" }));
    return { element: section, focusTarget: heading ?? section };
  }
  const content = createContentStatus({ message: t("customFields.loading") });
  section.append(content);

  async function render() {
    const definitions = await service.list(workspace.id);
    const form = document.createElement("form");
    form.className = "product-form";
    const copy = createCopyContext({ translate: t, workspace });
    form.setAttribute("aria-labelledby", "custom-field-create-title");
    const formTitle = text("h2", t("customFields.createTitle"));
    formTitle.id = "custom-field-create-title";
    const label = createField({ id: "definition-label", label: t("customFields.label"), ...copy.field({ helpKey: "customFields.labelHelp", exampleKey: "customFields.labelExample" }), required: true, requiredText: t("forms.required"), maxLength: 60, autocomplete: "off" });
    const type = createField({ id: "definition-type", label: t("customFields.type"), ...copy.field({ helpKey: "customFields.typeHelp" }), type: "select", options: CUSTOM_FIELD_TYPES.map((value) => ({ value, label: t(`fieldTypes.${value}`) })) });
    const options = createField({ id: "definition-options", label: t("customFields.options"), ...copy.field({ helpKey: "customFields.optionsHelp", exampleKey: "customFields.optionsExample" }) });
    const required = createChoice({ id: "definition-required", label: t("customFields.required") });
    const searchable = createChoice({ id: "definition-searchable", label: t("customFields.searchable") });
    const feedback = document.createElement("div");
    feedback.setAttribute("aria-live", "polite");
    const save = createButton({ text: t("customFields.create"), type: "submit" });
    form.append(formTitle, text("p", copy.modeMessage(), "ns-copy-mode"), createButton({ text: t("nexCopy.openGlossary"), href: "#/glossary", variant: "quiet" }), label.element, type.element, options.element, required.element, searchable.element, feedback, save);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      save.disabled = true;
      feedback.replaceChildren();
      try {
        await service.create(workspace, { label: label.control.value, type: type.control.value, options: options.control.value, required: required.control.checked, searchable: searchable.control.checked });
        await render();
        content.querySelector("#custom-field-list-title")?.focus();
      } catch {
        feedback.replaceChildren(createAlert({ message: t("customFields.invalid"), tone: "danger", urgent: true }));
        save.disabled = false;
      }
    });

    const listSection = document.createElement("section");
    const listTitle = text("h2", t("customFields.listTitle"));
    listTitle.id = "custom-field-list-title";
    listTitle.tabIndex = -1;
    listSection.append(listTitle);
    if (!definitions.length) listSection.append(text("p", t("customFields.empty")));
    else {
      const list = document.createElement("ul");
      list.className = "custom-field-list";
      for (const definition of definitions) {
        const item = fieldSummary(definition, t);
        item.append(createButton({
          text: t(definition.enabled ? "customFields.disable" : "customFields.enable"),
          variant: definition.enabled ? "danger" : "secondary",
          onClick: async () => { await service.setEnabled(workspace.id, definition.id, !definition.enabled); await render(); },
        }));
        list.append(item);
      }
      listSection.append(list);
    }
    content.replaceChildren(createAlert({ title: t("customFields.noticeTitle"), message: t("customFields.noticeMessage"), tone: "info" }), form, listSection);
  }
  render().catch(() => content.replaceChildren(createAlert({ message: t("customFields.loadError"), tone: "danger" })));
  return { element: section, focusTarget: heading ?? section };
}
