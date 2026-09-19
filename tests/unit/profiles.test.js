import test from "node:test";
import assert from "node:assert/strict";
import {
  getProfileDefinition,
  NEX_PROFILES,
  PROFILE_KEYS,
} from "../../js/profiles/profile-registry.js";
import { normalizeCustomFields, ProfileService } from "../../js/services/profile-service.js";

test("registro contém os cinco NexProfiles oficiais", () => {
  assert.deepEqual(PROFILE_KEYS, ["technology", "cosmetics", "fashion", "food", "custom"]);
  assert.deepEqual(getProfileDefinition("technology").modules, ["serial", "compatibility", "kits", "lifecycle"]);
  assert.deepEqual(getProfileDefinition("cosmetics").modules, ["expiry", "variants"]);
  assert.deepEqual(getProfileDefinition("fashion").modules, ["variants"]);
  assert.deepEqual(getProfileDefinition("food").modules, ["expiry"]);
  assert.deepEqual(getProfileDefinition("custom").modules, []);
  assert.throws(() => getProfileDefinition("health"), RangeError);
});

test("dois nichos usam o mesmo serviço com campos e módulos diferentes", async () => {
  const calls = [];
  const workspaceService = {
    async createDemoWorkspace(profileKey, preferences) {
      calls.push({ profileKey, preferences });
      return { id: `workspace-${profileKey}`, profileKey };
    },
  };
  const service = new ProfileService({ workspaceService, translate: (key) => `translated:${key}` });
  await service.createWorkspace({ profileKey: "technology", name: "Tech", locale: "pt-BR", experienceMode: "guided" });
  await service.createWorkspace({ profileKey: "fashion", name: "Moda", locale: "pt-BR", experienceMode: "compact" });
  assert.equal(calls[0].preferences.profileSettings.modules.includes("serial"), true);
  assert.deepEqual(calls[1].preferences.profileSettings.modules, ["variants"]);
  assert.notDeepEqual(
    calls[0].preferences.customFieldDefinitions.map(({ key }) => key),
    calls[1].preferences.customFieldDefinitions.map(({ key }) => key),
  );
  assert.equal(calls[0].preferences.customFieldDefinitions[0].label, "translated:profileFields.model");
});

test("perfil personalizado aceita apenas módulos e tipos controlados", async () => {
  let captured;
  const service = new ProfileService({
    workspaceService: {
      async createDemoWorkspace(profileKey, preferences) {
        captured = { profileKey, preferences };
        return { profileKey };
      },
    },
  });
  await service.createWorkspace({
    profileKey: "custom",
    name: "Ateliê",
    locale: "pt-BR",
    experienceMode: "guided",
    customModules: ["variants", "kits", "variants"],
    customFields: [{ label: "Material principal", type: "text", required: true }],
  });
  assert.deepEqual(captured.preferences.profileSettings.modules, ["variants", "kits"]);
  assert.equal(captured.preferences.customFieldDefinitions[0].key, "custom_material_principal_1");
  assert.throws(() => normalizeCustomFields([{ label: "Código", type: "script" }]), RangeError);
  await assert.rejects(service.createWorkspace({
    profileKey: "custom",
    name: "Inválido",
    customModules: ["admin"],
    customFields: [],
  }), RangeError);
});

test("definições registradas permanecem imutáveis", () => {
  assert.equal(Object.isFrozen(NEX_PROFILES.technology), true);
  assert.equal(Object.isFrozen(NEX_PROFILES.technology.fields), true);
  assert.throws(() => NEX_PROFILES.technology.modules.push("expiry"), TypeError);
});
