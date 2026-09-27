import { createButton } from "../components/button.js";
import { createCard } from "../components/card.js";
import { createAlert } from "../components/feedback.js";
import { createField } from "../components/field.js";
import { createSettingsSummaryModel } from "../services/settings-service.js";
import { createCustomFieldView } from "./custom-field-view.js";
import { createSecurityCenterView } from "./security-view.js";
import { createImportCenterView } from "./import-view.js";
import { createExportCenterView } from "./export-view.js";
import { createBackupCenterView } from "./backup-view.js";
import { createSnapshotCenterView } from "./snapshot-view.js";
import { createPrivacyDataCenterView } from "./privacy-data-center-view.js";

function text(tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

export const SETTINGS_SECTIONS = Object.freeze([
  Object.freeze({ id: "summary", route: "/settings" }),
  Object.freeze({ id: "general", route: "/settings/general" }),
  Object.freeze({ id: "appearance", route: "/settings/appearance" }),
  Object.freeze({ id: "inventory", route: "/settings/inventory" }),
  Object.freeze({ id: "profiles", route: "/settings/profiles" }),
  Object.freeze({ id: "data", route: "/settings/data" }),
  Object.freeze({ id: "security", route: "/settings/security" }),
  Object.freeze({ id: "pwa", route: "/settings/pwa" }),
  Object.freeze({ id: "advanced", route: "/settings/advanced" }),
]);

export function getSettingsSection(route) {
  return SETTINGS_SECTIONS.find((section) => section.route === route)
    ?? SETTINGS_SECTIONS.find((section) => section.id !== "summary" && route.startsWith(`${section.route}/`))
    ?? SETTINGS_SECTIONS[0];
}

export function canResetWorkspace({ workspace, persistenceReady }) {
  return Boolean(workspace && persistenceReady);
}

export function createSettingsNav({ activeRoute, t }) {
  const navigation = document.createElement("nav");
  navigation.className = "settings-nav";
  navigation.setAttribute("aria-label", t("settings.navLabel"));
  const list = document.createElement("ul");
  for (const section of SETTINGS_SECTIONS) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${section.route}`;
    link.textContent = t(`settings.sections.${section.id}.title`);
    if (section.route === activeRoute) link.setAttribute("aria-current", "page");
    item.append(link);
    list.append(item);
  }
  navigation.append(list);
  return navigation;
}

function createMobileSectionPicker({ activeRoute, t }) {
  const wrapper = document.createElement("div");
  wrapper.className = "settings-picker";
  const label = text("label", t("settings.sectionSelectorLabel"));
  label.htmlFor = "settings-section-picker";
  const select = document.createElement("select");
  select.id = "settings-section-picker";
  for (const section of SETTINGS_SECTIONS) {
    const option = document.createElement("option");
    option.value = section.route;
    option.textContent = t(`settings.sections.${section.id}.title`);
    select.append(option);
  }
  select.value = activeRoute;
  select.addEventListener("change", () => {
    window.location.hash = `#${select.value}`;
  });
  wrapper.append(label, select);
  return wrapper;
}

function createSectionOverview({ section, t }) {
  const status = document.createElement("div");
  status.className = "settings-section-overview";
  const statusTitle = text("h3", t("settings.statusTitle"));
  const list = document.createElement("ul");
  for (const item of ["one", "two", "three"]) {
    list.append(text("li", t(`settings.sections.${section.id}.items.${item}`)));
  }
  status.append(statusTitle, list);
  return status;
}

function definitionList(entries) {
  const list = document.createElement("dl");
  list.className = "settings-summary__facts";
  for (const [label, value] of entries) {
    const row = document.createElement("div");
    row.append(text("dt", label), text("dd", value));
    list.append(row);
  }
  return list;
}

function summaryValue(id, value, t) {
  if (id === "workspace") return value === "notConfigured" ? t("settings.values.notConfigured") : value;
  if (id === "profile") return t(`profiles.${value}.name`);
  return t(`settings.values.${value}`);
}

function createSettingsSummary({ workspace, appState, t }) {
  const container = document.createElement("div");
  container.className = "settings-summary";
  const model = createSettingsSummaryModel({ workspace, state: appState });
  const labels = {
    workspace: ["name", "profile"],
    appearance: ["theme", "experienceMode"],
    data: ["persistence", "provider"],
    security: ["provider", "protection"],
    pwa: ["connection", "versionState"],
  };
  for (const item of model) {
    const entries = item.values.map((value, index) => {
      const labelId = labels[item.id][index];
      const valueId = item.id === "workspace" && index === 1 ? "profile" : item.id;
      return [t(`settings.summary.labels.${labelId}`), summaryValue(valueId, value, t)];
    });
    const action = createButton({
      text: t("settings.summary.openSection", { section: t(`settings.sections.${item.id === "workspace" ? "general" : item.id}.title`) }),
      href: `#${item.route}`,
      variant: "secondary",
    });
    container.append(createCard({
      title: t(`settings.summary.cards.${item.id}.title`),
      description: t(`settings.summary.cards.${item.id}.description`),
      content: definitionList(entries),
      actions: action,
      headingLevel: 3,
      surface: "alt",
    }));
  }
  return container;
}

function bindInstantSave({ field, key, workspace, onSave, feedback, t }) {
  field.control.addEventListener("change", async () => {
    const previous = workspace[key] ?? "";
    field.clearError();
    field.control.disabled = true;
    feedback.textContent = t("settings.save.saving");
    try {
      const updated = await onSave({ [key]: field.control.value });
      workspace = updated;
      field.control.value = updated[key];
      feedback.textContent = t("settings.save.saved");
    } catch {
      field.control.value = previous;
      field.setError(t("settings.save.error"));
      feedback.textContent = t("settings.save.notSaved");
    } finally {
      field.control.disabled = false;
      field.control.focus();
    }
  });
}

function createSafeSettingsForm({ sectionId, workspace, onSave, t }) {
  if (!workspace) return createAlert({ message: t("settings.save.workspaceRequired"), tone: "info" });
  const form = document.createElement("form");
  form.className = "settings-form route-stack";
  form.addEventListener("submit", (event) => event.preventDefault());
  const title = text("h3", t("settings.save.title"));
  const description = text("p", t("settings.save.description"));
  const feedback = text("p", t("settings.save.ready"), "route-meta");
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");
  form.append(title, description);

  const definitions = sectionId === "general" ? [
    { key: "name", label: t("settings.fields.name"), helpText: t("settings.fields.nameHelp"), value: workspace.name, required: true, maxLength: 80, autocomplete: "organization" },
    { key: "currency", label: t("settings.fields.currency"), helpText: t("settings.fields.currencyHelp"), type: "select", value: workspace.currency, options: ["BRL", "USD", "EUR"].map((value) => ({ value, label: t(`settings.values.${value}`) })) },
    { key: "timezone", label: t("settings.fields.timezone"), helpText: t("settings.fields.timezoneHelp"), type: "select", value: workspace.timezone, options: ["America/Sao_Paulo", "UTC", "Europe/Madrid"].map((value) => ({ value, label: t(`settings.values.${value}`) })) },
  ] : [
    { key: "theme", label: t("settings.fields.theme"), helpText: t("settings.fields.themeHelp"), type: "select", value: workspace.theme ?? "light", options: ["light", "dark"].map((value) => ({ value, label: t(`settings.values.${value}`) })) },
    { key: "experienceMode", label: t("settings.fields.experienceMode"), helpText: t("settings.fields.experienceModeHelp"), type: "select", value: workspace.experienceMode ?? "guided", options: ["guided", "compact"].map((value) => ({ value, label: t(`settings.values.${value}`) })) },
  ];

  for (const definition of definitions) {
    const field = createField({ id: `settings-${definition.key}`, requiredText: t("forms.required"), ...definition });
    bindInstantSave({ field, key: definition.key, workspace, onSave, feedback, t });
    form.append(field.element);
  }
  form.append(feedback);
  return form;
}

function createResetPanel({ t, workspace, persistenceReady, onReset }) {
  const panel = document.createElement("section");
  panel.className = "route-panel route-stack";
  panel.setAttribute("aria-labelledby", "reset-title");
  const resetTitle = text("h3", t("settingsCore.resetTitle"));
  resetTitle.id = "reset-title";
  panel.append(resetTitle, text("p", t("settingsCore.resetDescription")));
  const feedback = document.createElement("div");
  feedback.setAttribute("aria-live", "polite");

  const reset = createButton({
    text: t("settingsCore.resetAction"), variant: "danger",
    disabled: !canResetWorkspace({ workspace, persistenceReady }),
    onClick: () => {
      reset.disabled = true;
      const confirmation = createAlert({ title: t("settingsCore.confirmTitle"), message: t("settingsCore.confirmMessage"), tone: "warning" });
      confirmation.tabIndex = -1;
      const actions = document.createElement("div");
      actions.className = "welcome-actions";
      const cancel = createButton({ text: t("settingsCore.cancel"), variant: "secondary", onClick: () => {
        feedback.replaceChildren();
        reset.disabled = false;
        reset.focus();
      } });
      const confirm = createButton({ text: t("settingsCore.confirmAction"), variant: "danger", onClick: async () => {
        cancel.disabled = true;
        confirm.disabled = true;
        try {
          await onReset();
        } catch {
          feedback.replaceChildren(createAlert({ message: t("settingsCore.resetError"), tone: "danger", urgent: true }));
          reset.disabled = false;
          reset.focus();
        }
      } });
      actions.append(cancel, confirm);
      confirmation.append(actions);
      feedback.replaceChildren(confirmation);
      confirmation.focus();
    },
  });

  if (!workspace) panel.append(createAlert({ message: t("settingsCore.workspaceRequired"), tone: "info" }));
  panel.append(reset, feedback);
  return panel;
}

export function createSettingsPanel({
  section, route, t, locale, workspace, persistenceReady, appState, onReset, onSave, customFieldService, securityService, importService, exportService, backupService, snapshotService, privacyDataCenterService, onBackupRestored,
}) {
  const panel = document.createElement("section");
  panel.className = "settings-panel route-stack";
  panel.setAttribute("aria-labelledby", "settings-panel-title");
  const heading = text("h2", t(`settings.sections.${section.id}.title`));
  heading.id = "settings-panel-title";
  panel.append(heading, text("p", t(`settings.sections.${section.id}.description`)));

  if (section.id === "summary") {
    panel.append(createSettingsSummary({ workspace, appState, t }));
    return panel;
  }

  if (section.id === "profiles") {
    const view = createCustomFieldView({
      title: "", description: "", t, workspace, service: customFieldService, embedded: true,
    });
    panel.append(view.element);
    return panel;
  }
  if (section.id === "security") {
    const view = createSecurityCenterView({
      title: "", description: "", t, service: securityService, embedded: true,
    });
    panel.append(view.element);
    return panel;
  }

  if (route === "/settings/data/import") {
    panel.append(createImportCenterView({ t, workspace, service: importService }).element);
    return panel;
  }

  if (route === "/settings/data/export") {
    panel.append(createExportCenterView({ t, workspace, service: exportService }).element);
    return panel;
  }
  if (route === "/settings/data/backup") {
    panel.append(createBackupCenterView({ t, workspace, service: backupService, snapshotService, onRestored: onBackupRestored }).element);
    return panel;
  }
  if (route === "/settings/data/snapshots") {
    panel.append(createSnapshotCenterView({ t, locale, workspace, service: snapshotService, onRestored: onBackupRestored }).element);
    return panel;
  }
  if (route === "/settings/data/privacy") {
    panel.append(createPrivacyDataCenterView({ t, service: privacyDataCenterService }).element);
    return panel;
  }

  if (["general", "appearance"].includes(section.id)) {
    panel.append(createSafeSettingsForm({ sectionId: section.id, workspace, onSave, t }));
    return panel;
  }

  panel.append(createSectionOverview({ section, t }));
  if (section.id === "data") {
    panel.append(createButton({ text: t("importCenter.openFromData"), href: "#/settings/data/import" }));
    panel.append(createButton({ text: t("exportCenter.openFromData"), href: "#/settings/data/export" }));
    panel.append(createButton({ text: t("backupCenter.openFromData"), href: "#/settings/data/backup" }));
    panel.append(createButton({ text: t("snapshotCenter.openFromData"), href: "#/settings/data/snapshots" }));
    panel.append(createButton({ text: t("privacyDataCenter.openFromData"), href: "#/settings/data/privacy" }));
    panel.append(createResetPanel({ t, workspace, persistenceReady, onReset }));
  }
  return panel;
}

export function createSettingsView({
  route, t, locale, workspace, persistenceReady, appState, onReset, onSave, customFieldService, securityService, importService, exportService, backupService, snapshotService, privacyDataCenterService, onBackupRestored,
}) {
  const activeSection = getSettingsSection(route);
  const section = document.createElement("section");
  section.className = "settings-shell route-stack";
  section.setAttribute("aria-labelledby", "route-title");
  const heading = text("h1", t("settings.shellTitle"));
  heading.id = "route-title";
  heading.tabIndex = -1;
  section.append(heading, text("p", t("settings.shellDescription")));
  section.append(createMobileSectionPicker({ activeRoute: activeSection.route, t }));

  const layout = document.createElement("div");
  layout.className = "settings-layout";
  layout.append(
    createSettingsNav({ activeRoute: activeSection.route, t }),
    createSettingsPanel({
      section: activeSection, route, t, locale, workspace, persistenceReady, onReset, customFieldService, securityService, importService, exportService, backupService, snapshotService, privacyDataCenterService, onBackupRestored,
      appState, onSave,
    }),
  );
  section.append(layout);
  return { element: section, focusTarget: heading };
}
