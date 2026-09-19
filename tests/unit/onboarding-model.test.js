import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOnboardingSetup,
  createOnboardingState,
  ONBOARDING_STEP_COUNT,
  validateOnboardingStep,
} from "../../js/views/onboarding-model.js";
import { getOnboardingArtwork } from "../../js/views/onboarding-view.js";

test("onboarding possui quatro etapas e começa sem perfil presumido", () => {
  const state = createOnboardingState("es");
  assert.equal(ONBOARDING_STEP_COUNT, 4);
  assert.equal(state.step, 1);
  assert.equal(state.profileKey, "");
  assert.equal(state.locale, "es");
});

test("validação impede perfil ausente e nome inválido", () => {
  const state = createOnboardingState();
  assert.equal(validateOnboardingStep(state, 2).profileKey, "profileRequired");
  state.profileKey = "food";
  assert.equal(validateOnboardingStep(state, 3).name, "nameRequired");
  state.name = "x".repeat(81);
  assert.equal(validateOnboardingStep(state, 3).name, "nameTooLong");
});

test("setup final normaliza texto e cria cópias imutáveis", () => {
  const state = {
    ...createOnboardingState("pt-BR"),
    profileKey: "custom",
    name: "  Meu ateliê  ",
    customModules: ["variants"],
    customFields: [{ label: "  Material  ", type: "text", required: true }],
  };
  const setup = buildOnboardingSetup(state);
  assert.equal(setup.name, "Meu ateliê");
  assert.equal(setup.customFields[0].label, "Material");
  assert.equal(Object.isFrozen(setup.customFields[0]), true);
});

test("imagens do onboarding seguem a ordem definida no blueprint", () => {
  assert.equal(getOnboardingArtwork(1), "stacked");
  assert.equal(getOnboardingArtwork(2), "mascot");
  assert.equal(getOnboardingArtwork(3), null);
  assert.equal(getOnboardingArtwork(4), "symbol");
});
