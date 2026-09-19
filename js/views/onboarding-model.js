import { CUSTOM_FIELD_TYPES, CUSTOM_MODULE_KEYS, PROFILE_KEYS } from "../profiles/profile-registry.js";

export const ONBOARDING_STEP_COUNT = 4;

export function createOnboardingState(locale = "pt-BR") {
  return {
    step: 1,
    profileKey: "",
    name: "",
    locale,
    experienceMode: "guided",
    customModules: [],
    customFields: [],
  };
}

export function validateOnboardingStep(state, step = state.step) {
  const errors = {};
  if (step === 2 && !PROFILE_KEYS.includes(state.profileKey)) errors.profileKey = "profileRequired";
  if (step === 3) {
    const name = String(state.name ?? "").trim();
    if (!name) errors.name = "nameRequired";
    else if (name.length > 80) errors.name = "nameTooLong";
    if (!["guided", "compact"].includes(state.experienceMode)) errors.experienceMode = "modeRequired";
    if (state.profileKey === "custom") {
      if (state.customModules.some((module) => !CUSTOM_MODULE_KEYS.includes(module))) errors.customModules = "invalidModule";
      if (state.customFields.some((field) => !field.label?.trim() || !CUSTOM_FIELD_TYPES.includes(field.type))) {
        errors.customFields = "invalidCustomField";
      }
    }
  }
  return errors;
}

export function buildOnboardingSetup(state) {
  const errors = {
    ...validateOnboardingStep(state, 2),
    ...validateOnboardingStep(state, 3),
  };
  if (Object.keys(errors).length > 0) throw new TypeError("Onboarding setup is incomplete.");
  return Object.freeze({
    profileKey: state.profileKey,
    name: state.name.trim(),
    locale: state.locale,
    experienceMode: state.experienceMode,
    customModules: Object.freeze([...state.customModules]),
    customFields: Object.freeze(state.customFields.map((field) => Object.freeze({
      label: field.label.trim(),
      type: field.type,
      required: Boolean(field.required),
    }))),
  });
}
