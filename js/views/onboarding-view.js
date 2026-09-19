import { createBrandImage, createBrandLockup } from "../components/brand.js";
import { createButton } from "../components/button.js";
import { createAlert } from "../components/feedback.js";
import { createChoice, createField } from "../components/field.js";
import { CUSTOM_FIELD_TYPES, CUSTOM_MODULE_KEYS, getProfileDefinition, PROFILE_KEYS } from "../profiles/profile-registry.js";
import {
  buildOnboardingSetup,
  createOnboardingState,
  ONBOARDING_STEP_COUNT,
  validateOnboardingStep,
} from "./onboarding-model.js";

export function getOnboardingArtwork(step) {
  if (step === 1) return "stacked";
  if (step === 2) return "mascot";
  return step === 4 ? "symbol" : null;
}

function createText(tagName, text, className) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function createStepHeading(text) {
  const heading = createText("h2", text);
  heading.id = "onboarding-step-title";
  heading.tabIndex = -1;
  return heading;
}

function createDefinitionRow(term, detail) {
  const wrapper = document.createElement("div");
  wrapper.className = "onboarding-review__row";
  wrapper.append(createText("dt", term), createText("dd", detail));
  return wrapper;
}

export function createOnboardingView({
  title,
  description,
  t,
  locale,
  currentWorkspace,
  persistenceReady,
  initialState,
  onStateChange = () => {},
  onComplete,
}) {
  const section = document.createElement("section");
  section.className = "onboarding-view";
  section.setAttribute("aria-labelledby", "route-title");

  const heading = createText("h1", title);
  heading.id = "route-title";
  heading.tabIndex = -1;
  const introduction = createText("p", description);
  section.append(heading, introduction);

  if (currentWorkspace) {
    section.append(createAlert({
      title: t("onboarding.existingTitle"),
      message: t("onboarding.existingMessage", { name: currentWorkspace.name }),
      tone: "info",
    }));
    section.append(createButton({ text: t("onboarding.goDashboard"), href: "#/dashboard" }));
    return { element: section, focusTarget: heading };
  }

  if (!persistenceReady) {
    section.append(createAlert({
      title: t("onboarding.storageTitle"),
      message: t("onboarding.storageMessage"),
      tone: "danger",
    }));
    return { element: section, focusTarget: heading };
  }

  const state = {
    ...createOnboardingState(locale),
    ...(initialState ?? {}),
    locale,
    customModules: [...(initialState?.customModules ?? [])],
    customFields: (initialState?.customFields ?? []).map((field) => ({ ...field })),
  };
  const progress = document.createElement("div");
  progress.className = "onboarding-progress";
  progress.setAttribute("aria-label", t("onboarding.progressLabel"));
  const progressText = createText("p", "", "onboarding-progress__text");
  const progressList = document.createElement("ol");
  progressList.className = "onboarding-progress__steps";
  progress.append(progressText, progressList);

  const stage = document.createElement("div");
  stage.className = "onboarding-stage";
  section.append(progress, stage);

  function publishState() {
    onStateChange({
      ...state,
      customModules: [...state.customModules],
      customFields: state.customFields.map((field) => ({ ...field })),
    });
  }

  function updateProgress() {
    progressText.textContent = t("onboarding.progress", {
      current: state.step,
      total: ONBOARDING_STEP_COUNT,
    });
    progressList.replaceChildren();
    for (let index = 1; index <= ONBOARDING_STEP_COUNT; index += 1) {
      const item = createText("li", t(`onboarding.steps.${index}`));
      if (index === state.step) item.setAttribute("aria-current", "step");
      progressList.append(item);
    }
  }

  function createActions({ back = true, nextText = t("onboarding.actions.continue"), onBack, onNext }) {
    const actions = document.createElement("div");
    actions.className = "onboarding-actions";
    if (back) {
      actions.append(createButton({
        text: t("onboarding.actions.back"),
        variant: "secondary",
        onClick: () => {
          onBack?.();
          state.step -= 1;
          publishState();
          renderStep(true);
        },
      }));
    }
    actions.append(createButton({ text: nextText, onClick: onNext }));
    return actions;
  }

  function showStepError(container, errorKey) {
    const alert = createAlert({ message: t(`onboarding.errors.${errorKey}`), tone: "danger", urgent: true });
    alert.tabIndex = -1;
    container.prepend(alert);
    alert.focus();
  }

  function advance(container) {
    const errors = validateOnboardingStep(state);
    const firstError = Object.values(errors)[0];
    if (firstError) {
      showStepError(container, firstError);
      return;
    }
    state.step += 1;
    publishState();
    renderStep(true);
  }

  function renderIntroduction() {
    const content = document.createElement("div");
    content.className = "onboarding-panel onboarding-panel--intro";
    const visual = document.createElement("div");
    visual.className = "onboarding-visual";
    visual.append(createBrandLockup({ variant: "stacked", slogan: t("app.slogan") }));
    const copy = document.createElement("div");
    copy.className = "onboarding-copy";
    copy.append(
      createStepHeading(t("onboarding.introTitle")),
      createText("p", t("onboarding.introDescription")),
      createActions({ back: false, nextText: t("onboarding.actions.start"), onNext: () => advance(copy) }),
    );
    content.append(visual, copy);
    return content;
  }

  function renderProfiles() {
    const content = document.createElement("div");
    content.className = "onboarding-panel onboarding-panel--profiles";
    const visual = createBrandImage("mascot", { decorative: true, loading: "lazy" });
    const formArea = document.createElement("div");
    formArea.className = "onboarding-copy";
    formArea.append(createStepHeading(t("onboarding.profileTitle")), createText("p", t("onboarding.profileDescription")));

    const fieldset = document.createElement("fieldset");
    fieldset.className = "profile-options";
    fieldset.append(createText("legend", t("onboarding.profileLegend"), "visually-hidden"));
    for (const profileKey of PROFILE_KEYS) {
      const profile = getProfileDefinition(profileKey);
      const option = document.createElement("div");
      option.className = "profile-option";
      const choice = createChoice({
        id: `profile-${profileKey}`,
        name: "profile",
        label: t(`profiles.${profileKey}.name`),
        type: "radio",
        value: profileKey,
        checked: state.profileKey === profileKey,
      });
      const descriptionId = `profile-${profileKey}-description`;
      choice.control.setAttribute("aria-describedby", descriptionId);
      choice.control.addEventListener("change", () => {
        state.profileKey = profileKey;
        if (!state.name) state.name = t(`profiles.${profileKey}.defaultWorkspace`);
        publishState();
      });
      const details = createText("p", t(`profiles.${profileKey}.description`), "profile-option__description");
      details.id = descriptionId;
      const modules = profile.modules.length > 0
        ? profile.modules.map((module) => t(`modules.${module}`)).join(", ")
        : t("onboarding.customizableModules");
      option.append(choice.element, details, createText("p", t("onboarding.modulesSummary", { modules }), "profile-option__modules"));
      fieldset.append(option);
    }
    formArea.append(fieldset, createActions({ onNext: () => advance(formArea) }));
    content.append(visual, formArea);
    return content;
  }

  function renderCustomControls(container, beforeMutation) {
    const modulesFieldset = document.createElement("fieldset");
    modulesFieldset.className = "custom-options";
    modulesFieldset.append(createText("legend", t("onboarding.customModulesLegend")));
    for (const moduleKey of CUSTOM_MODULE_KEYS) {
      const choice = createChoice({
        id: `custom-module-${moduleKey}`,
        name: "customModules",
        label: t(`modules.${moduleKey}`),
        value: moduleKey,
        checked: state.customModules.includes(moduleKey),
      });
      choice.control.addEventListener("change", () => {
        state.customModules = [...modulesFieldset.querySelectorAll("input:checked")].map(({ value }) => value);
        publishState();
      });
      modulesFieldset.append(choice.element);
    }

    const builder = document.createElement("div");
    builder.className = "custom-field-builder";
    builder.append(createText("h3", t("onboarding.customFieldsTitle")));
    const labelField = createField({
      id: "custom-field-label",
      label: t("onboarding.customFieldLabel"),
      helpText: t("onboarding.customFieldHelp"),
    });
    const typeField = createField({
      id: "custom-field-type",
      label: t("onboarding.customFieldType"),
      type: "select",
      value: "text",
      options: CUSTOM_FIELD_TYPES.map((type) => ({ value: type, label: t(`fieldTypes.${type}`) })),
    });
    const requiredChoice = createChoice({
      id: "custom-field-required",
      label: t("onboarding.customFieldRequired"),
    });
    const searchableChoice = createChoice({ id: "custom-field-searchable", label: t("customFields.searchable") });
    const optionsField = createField({ id: "custom-field-options", label: t("customFields.options"), helpText: t("customFields.optionsHelp") });
    const addButton = createButton({
      text: t("onboarding.addCustomField"),
      variant: "secondary",
      onClick: () => {
        beforeMutation();
        const label = labelField.control.value.trim();
        if (!label) {
          labelField.setError(t("onboarding.errors.customFieldLabelRequired"));
          labelField.control.focus();
          return;
        }
        const type = typeField.control.value;
        const options = optionsField.control.value.split(",").map((value) => value.trim()).filter(Boolean);
        if (["select", "multiselect"].includes(type) && new Set(options).size < 2) {
          optionsField.setError(t("onboarding.errors.customFieldOptionsRequired"));
          optionsField.control.focus();
          return;
        }
        state.customFields.push({ label, type, required: requiredChoice.control.checked, searchable: searchableChoice.control.checked, options });
        publishState();
        renderStep(true);
      },
    });
    builder.append(labelField.element, typeField.element, optionsField.element, requiredChoice.element, searchableChoice.element, addButton);

    if (state.customFields.length > 0) {
      const list = document.createElement("ul");
      list.className = "custom-field-list";
      state.customFields.forEach((field, index) => {
        const item = document.createElement("li");
        item.append(
          createText("span", t("onboarding.customFieldSummary", {
            label: field.label,
            type: t(`fieldTypes.${field.type}`),
          })),
          createButton({
            text: t("onboarding.removeCustomField", { label: field.label }),
            variant: "quiet",
            onClick: () => {
              beforeMutation();
              state.customFields.splice(index, 1);
              publishState();
              renderStep(true);
            },
          }),
        );
        list.append(item);
      });
      builder.append(list);
    }
    container.append(modulesFieldset, builder);
  }

  function renderWorkspace() {
    const content = document.createElement("div");
    content.className = "onboarding-panel";
    const formArea = document.createElement("div");
    formArea.className = "onboarding-copy onboarding-form";
    formArea.append(createStepHeading(t("onboarding.workspaceTitle")), createText("p", t("onboarding.workspaceDescription")));
    const nameField = createField({
      id: "workspace-name",
      label: t("onboarding.workspaceName"),
      helpText: t("onboarding.workspaceNameHelp"),
      required: true,
      requiredText: t("forms.required"),
      value: state.name,
    });
    const modeField = createField({
      id: "experience-mode",
      label: t("onboarding.experienceMode"),
      helpText: t("onboarding.experienceModeHelp"),
      type: "select",
      value: state.experienceMode,
      options: [
        { value: "guided", label: t("onboarding.guidedMode") },
        { value: "compact", label: t("onboarding.compactMode") },
      ],
    });
    function syncFields() {
      state.name = nameField.control.value;
      state.experienceMode = modeField.control.value;
      publishState();
    }
    formArea.append(nameField.element, modeField.element);
    if (state.profileKey === "custom") renderCustomControls(formArea, syncFields);
    formArea.append(createActions({
      onBack: syncFields,
      onNext: () => {
        syncFields();
        const errors = validateOnboardingStep(state);
        if (errors.name) {
          nameField.setError(t(`onboarding.errors.${errors.name}`));
          nameField.control.focus();
          return;
        }
        advance(formArea);
      },
    }));
    content.append(formArea);
    return content;
  }

  function renderReview() {
    const content = document.createElement("div");
    content.className = "onboarding-panel onboarding-panel--review";
    content.append(createBrandImage("symbol", { decorative: true, loading: "lazy" }));
    const review = document.createElement("div");
    review.className = "onboarding-copy";
    review.append(createStepHeading(t("onboarding.reviewTitle")), createText("p", t("onboarding.reviewDescription")));
    const definition = document.createElement("dl");
    definition.className = "onboarding-review";
    const profile = getProfileDefinition(state.profileKey);
    const modules = state.profileKey === "custom" ? state.customModules : profile.modules;
    definition.append(
      createDefinitionRow(t("onboarding.reviewProfile"), t(`profiles.${state.profileKey}.name`)),
      createDefinitionRow(t("onboarding.reviewWorkspace"), state.name),
      createDefinitionRow(t("onboarding.reviewMode"), t(`onboarding.${state.experienceMode}Mode`)),
      createDefinitionRow(
        t("onboarding.reviewModules"),
        modules.length > 0 ? modules.map((module) => t(`modules.${module}`)).join(", ") : t("onboarding.noModules"),
      ),
      createDefinitionRow(t("onboarding.reviewCustomFields"), String(state.customFields.length || profile.fields.length)),
    );
    review.append(definition);
    const actions = createActions({
      nextText: t("onboarding.actions.create"),
      onNext: async (event) => {
        const button = event.currentTarget;
        button.disabled = true;
        section.setAttribute("aria-busy", "true");
        try {
          await onComplete(buildOnboardingSetup(state));
        } catch {
          showStepError(review, "creationFailed");
          button.disabled = false;
          section.removeAttribute("aria-busy");
        }
      },
    });
    review.append(actions);
    content.append(review);
    return content;
  }

  function renderStep(moveFocus = false) {
    updateProgress();
    const renderers = [renderIntroduction, renderProfiles, renderWorkspace, renderReview];
    const content = renderers[state.step - 1]();
    stage.replaceChildren(content);
    if (moveFocus) content.querySelector("#onboarding-step-title")?.focus();
  }

  renderStep(false);
  return { element: section, focusTarget: heading };
}
